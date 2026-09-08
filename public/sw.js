/**
 * LegalX service worker.
 *
 * Its whole purpose is to exist when nothing else does. With the tab closed
 * there is no page, no window and no JavaScript context, so the worker is the
 * only thing the browser can spin up to receive a push — which is why the spec
 * makes one mandatory rather than optional.
 *
 * Deliberately has no fetch handler. A worker that intercepts navigation can
 * serve a stale build after a deploy, and nothing here needs offline support;
 * the cost of getting caching wrong is far higher than the benefit.
 */

self.addEventListener('install', () => {
  // Take over immediately rather than waiting for every old tab to close.
  self.skipWaiting()
})

self.addEventListener('activate', event => {
  event.waitUntil(self.clients.claim())
})

self.addEventListener('push', event => {
  let payload = {}
  try {
    payload = event.data ? event.data.json() : {}
  } catch {
    payload = { title: 'LegalX', body: event.data ? event.data.text() : '' }
  }

  const isCall = payload.kind === 'call'

  const options = {
    body: payload.body || '',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
    // Groups replacements: a repeat ring for one call replaces its predecessor
    // rather than stacking a column of identical alerts.
    tag: payload.tag || 'legalx',
    renotify: isCall,
    // A call is worth interrupting for and should stay until it is dealt with;
    // anything else should not sit on screen demanding attention.
    requireInteraction: isCall,
    vibrate: isCall ? [400, 200, 400, 200, 400] : undefined,
    data: { url: payload.url || '/' },
    actions: isCall ? [{ action: 'answer', title: 'Answer' }] : undefined,
  }

  // waitUntil keeps the worker alive long enough to show it. Without it the
  // browser is free to shut the worker down mid-call and nothing appears.
  event.waitUntil(
    self.registration.showNotification(payload.title || 'LegalX', options)
  )
})

self.addEventListener('notificationclick', event => {
  event.notification.close()
  const target = (event.notification.data && event.notification.data.url) || '/'

  event.waitUntil((async () => {
    const all = await self.clients.matchAll({ type: 'window', includeUncontrolled: true })

    // Reuse a tab that is already open rather than piling up windows — and for
    // a call, the tab that is already signed in is the one that can answer it.
    for (const client of all) {
      if ('focus' in client) {
        await client.focus()
        if ('navigate' in client) {
          try { await client.navigate(target) } catch { /* cross-origin or closed */ }
        }
        return
      }
    }

    if (self.clients.openWindow) await self.clients.openWindow(target)
  })())
})
