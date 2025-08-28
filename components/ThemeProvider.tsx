'use client'

import { ThemeContext, useThemeLogic } from '@/lib/useTheme'

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const themeLogic = useThemeLogic()

  return (
    <ThemeContext.Provider value={themeLogic}>
      {children}
    </ThemeContext.Provider>
  )
}
