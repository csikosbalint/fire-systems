'use client'

import { Moon, Sun } from 'lucide-react'
import { Button } from '@ui/button'
import useThemeToggleAdapter from '@adapters/ThemeToggle'

export default function ThemeToggle() {
  const adapter = useThemeToggleAdapter()
  const { toggle } = adapter.useController()
  const { isDark, label } = adapter.usePresenter()

  return (
    <Button
      variant="ghost"
      size="icon"
      onClick={toggle}
      aria-label={label}
    >
      {isDark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </Button>
  )
}
