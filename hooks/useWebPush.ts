'use client'

import { useCallback, useEffect, useState } from 'react'
import { apiFetch } from '@/lib/api'

/**
 * Web push subscription, client side.
 *
 * The browser hands back three things and they are all it needs: an endpoint
 * URL, which is the address of the push service and this device together; a
 * p256dh ECDH public key generated on the device; and a 16-byte auth secret.
 * The server derives a shared secret from the last two and encrypts each
 * payload, so the push service relays ciphertext it cannot read.
 *
 * userVisibleOnly is not boilerplate — it is a promise that every push produces
 * a notification somebody can see. Break it repeatedly and Chrome revokes the
 * permission, because a push that shows nothing is free background execution.
 */

/** The VAPID key arrives base64url; PushManager wants raw bytes. */
function urlBase64ToUint8Array(base64: string): Uint8Array<ArrayBuffer> {
  const padding = '='.repeat((4 - (base64.length % 4)) % 4)
  const normalised = (base64 + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(normalised)
  // Backed by a plain ArrayBuffer on purpose: applicationServerKey will not
  // accept a view over a SharedArrayBuffer, which is what a bare Uint8Array
  // widens to in TypeScript's lib types.
  const out = new Uint8Array(new ArrayBuffer(raw.length))
  for (let i = 0; i < raw.length; i++) out[i] = raw.charCodeAt(i)
  return out
}

export type PushState =
  | 'unsupported'   // no service worker or no PushManager
  | 'unconfigured'  // server has no VAPID keys
  | 'denied'        // the user said no; only they can undo it
  | 'prompt'        // askable
  | 'subscribed'
  | 'error'

export function useWebPush() {
  const [state, setState] = useState<PushState>('prompt')
  const [busy, setBusy] = useState(false)

  const supported =
    typeof window !== 'undefined' &&
    'serviceWorker' in navigator &&
    'PushManager' in window &&
    'Notification' in window

  // Register the worker up front. It must already be installed before anything
  // can subscribe through it, and registering is cheap and idempotent.
  useEffect(() => {
    if (!supported) { setState('unsupported'); return }

    let cancelled = false
    ;(async () => {
      try {
        await navigator.serviceWorker.register('/sw.js', { scope: '/' })
        if (cancelled) return

        if (Notification.permission === 'denied') { setState('denied'); return }

        const registration = await navigator.serviceWorker.ready
        const existing = await registration.pushManager.getSubscription()
        if (cancelled) return
        setState(existing ? 'subscribed' : 'prompt')
      } catch {
        if (!cancelled) setState('error')
      }
    })()
    return () => { cancelled = true }
  }, [supported])

  const subscribe = useCallback(async () => {
    if (!supported) return false
    setBusy(true)
    try {
      const { publicKey } = await apiFetch<{ publicKey: string }>('/api/notifications/push/key')
      if (!publicKey) { setState('unconfigured'); return false }

      // Must be called from a user gesture — browsers refuse the prompt
      // otherwise, and a refusal here is indistinguishable from a decline.
      const permission = await Notification.requestPermission()
      if (permission !== 'granted') {
        setState(permission === 'denied' ? 'denied' : 'prompt')
        return false
      }

      const registration = await navigator.serviceWorker.ready

      // Reuse whatever the device already has. Subscribing twice with a
      // different key throws rather than replacing.
      const sub =
        (await registration.pushManager.getSubscription()) ??
        (await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(publicKey),
        }))

      const { endpoint, keys } = sub.toJSON() as {
        endpoint: string
        keys: { p256dh: string; auth: string }
      }

      await apiFetch('/api/notifications/push/subscribe', {
        method: 'POST',
        body: JSON.stringify({ endpoint, keys }),
      })

      setState('subscribed')
      return true
    } catch {
      setState('error')
      return false
    } finally {
      setBusy(false)
    }
  }, [supported])

  const unsubscribe = useCallback(async () => {
    if (!supported) return
    setBusy(true)
    try {
      const registration = await navigator.serviceWorker.ready
      const sub = await registration.pushManager.getSubscription()
      if (sub) {
        // Tell the server first: once unsubscribe() resolves the endpoint is
        // gone from this device and there is nothing left to identify the row.
        await apiFetch('/api/notifications/push/unsubscribe', {
          method: 'POST',
          body: JSON.stringify({ endpoint: sub.endpoint }),
        }).catch(() => {})
        await sub.unsubscribe()
      }
      setState('prompt')
    } catch {
      setState('error')
    } finally {
      setBusy(false)
    }
  }, [supported])

  return { state, busy, subscribe, unsubscribe, supported }
}
