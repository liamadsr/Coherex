'use client'

import { useTheme } from 'next-themes'
import { useEffect, useState } from 'react'

export function ThemeColorMeta() {
  const { theme, resolvedTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (!mounted) return

    // Update the theme color based on the current theme
    // Using resolvedTheme to handle 'system' theme properly
    const isDark = resolvedTheme === 'dark'
    
    // Get all theme-color meta tags (there might be multiple)
    const metaTags = document.querySelectorAll('meta[name="theme-color"]')
    
    if (metaTags.length === 0) {
      // Create a new meta tag if none exist
      const metaThemeColor = document.createElement('meta')
      metaThemeColor.name = 'theme-color'
      metaThemeColor.content = isDark ? '#000000' : '#f8f8f8'
      document.head.appendChild(metaThemeColor)
    } else {
      // Update all existing theme-color meta tags
      metaTags.forEach((tag) => {
        (tag as HTMLMetaElement).content = isDark ? '#000000' : '#f8f8f8'
      })
    }

    // Also update the color-scheme meta property for proper form controls
    document.documentElement.style.colorScheme = isDark ? 'dark' : 'light'
    
    // Update apple-mobile-web-app-status-bar-style for iOS Safari
    let appleStatusBar = document.querySelector('meta[name="apple-mobile-web-app-status-bar-style"]') as HTMLMetaElement
    if (!appleStatusBar) {
      appleStatusBar = document.createElement('meta')
      appleStatusBar.name = 'apple-mobile-web-app-status-bar-style'
      document.head.appendChild(appleStatusBar)
    }
    appleStatusBar.content = isDark ? 'black' : 'default'
    
    // Force Safari to recognize the change by creating a temporary meta tag
    const tempMeta = document.createElement('meta')
    tempMeta.name = 'theme-color'
    tempMeta.content = isDark ? '#000000' : '#f8f8f8'
    document.head.appendChild(tempMeta)
    
    // Remove the temporary meta tag after a short delay
    setTimeout(() => {
      tempMeta.remove()
    }, 10)
  }, [mounted, theme, resolvedTheme])

  // Return a meta tag for SSR
  return (
    <meta name="theme-color" content={resolvedTheme === 'dark' ? '#000000' : '#f8f8f8'} />
  )
}