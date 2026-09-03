'use client'

import React, { createContext, useContext, useEffect, useState } from 'react'

type DarkModeContextType = {
  isDark: boolean
  toggle: () => void
}

const DarkModeContext = createContext<DarkModeContextType>({
  isDark: false,
  toggle: () => {},
})

/**
 * The app is dark-surfaced, and only that.
 *
 * Roughly half the pages paint #0A0D14 / #080B12 / #0E1220 directly instead of
 * going through the theme tokens, so switching to light produced a site that
 * was light in the header and a few sections and black everywhere else. Rather
 * than ship a toggle that works on some pages, the class is pinned on and the
 * control has been removed from the header.
 *
 * The context is kept so existing consumers keep compiling; isDark is always
 * true and toggle is a no-op. Restoring a real light theme means giving the
 * hardcoded pages token-driven colours first — a separate piece of work.
 */
export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    document.documentElement.classList.add('dark')
    // Clear any stored 'light' from before the toggle was retired, so the
    // pre-paint script in the root layout cannot reinstate it.
    try { localStorage.setItem('legalx-theme', 'dark') } catch { /* ignore */ }
  }, [])

  return (
    <DarkModeContext.Provider value={{ isDark: true, toggle: () => {} }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  return useContext(DarkModeContext)
}
