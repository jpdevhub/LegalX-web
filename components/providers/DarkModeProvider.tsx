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

export function DarkModeProvider({ children }: { children: React.ReactNode }) {
  const [isDark, setIsDark] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    // Restore preference from localStorage — persists across pages and navigation
    const saved = localStorage.getItem('legalx-theme')
    const prefersDark =
      saved === 'dark' ||
      (saved === null && window.matchMedia('(prefers-color-scheme: dark)').matches)

    if (prefersDark) {
      document.documentElement.classList.add('dark')
      setIsDark(true)
    } else {
      document.documentElement.classList.remove('dark')
      setIsDark(false)
    }
    setMounted(true)
  }, [])

  const toggle = () => {
    setIsDark((prev) => {
      const next = !prev
      if (next) {
        document.documentElement.classList.add('dark')
        localStorage.setItem('legalx-theme', 'dark')
      } else {
        document.documentElement.classList.remove('dark')
        localStorage.setItem('legalx-theme', 'light')
      }
      return next
    })
  }

  // Prevent hydration mismatch — render children immediately, theme applied via class on <html>
  if (!mounted) {
    return <>{children}</>
  }

  return (
    <DarkModeContext.Provider value={{ isDark, toggle }}>
      {children}
    </DarkModeContext.Provider>
  )
}

export function useDarkMode() {
  return useContext(DarkModeContext)
}
