'use client'

import { useState, useEffect } from 'react'

export default function useThemeToggleAdapter() {
  const [isDark, setIsDark] = useState(false)

  const useController = () => {
    useEffect(() => {
      const stored = localStorage.getItem('theme')
      const prefersDark = window.matchMedia(
        '(prefers-color-scheme: dark)'
      ).matches
      const dark = stored === 'dark' || (!stored && prefersDark)
      setIsDark(dark)
      document.documentElement.classList.toggle('dark', dark)
    }, [])

    const toggle = () => {
      const next = !isDark
      setIsDark(next)
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('theme', next ? 'dark' : 'light')
    }

    return { toggle }
  }

  const usePresenter = () => {
    return {
      isDark,
      label: isDark ? 'Switch to light mode' : 'Switch to dark mode',
    }
  }

  return { useController, usePresenter }
}
