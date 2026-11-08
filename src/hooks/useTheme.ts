import { useState } from 'react'
import { THEME_STORAGE_KEY } from '../config/limits.ts'

export type ThemeName = 'light' | 'dark'

function readTheme(): ThemeName {
  if (typeof document === 'undefined') return 'light'
  return document.documentElement.classList.contains('dark') ? 'dark' : 'light'
}

export function useTheme() {
  const [theme, setTheme] = useState<ThemeName>(readTheme)

  const apply = (next: ThemeName) => {
    document.documentElement.classList.toggle('dark', next === 'dark')
    document.documentElement.style.colorScheme = next
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next)
    } catch {
      /* Private browsing can block storage. The theme still changes for this view. */
    }
    setTheme(next)
  }

  const toggle = () => apply(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggle }
}
