'use client'

import { Fragment } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { ChevronRight, Home } from 'lucide-react'
import { motion } from 'framer-motion'

interface BreadcrumbItem {
  label: string
  href: string
  current?: boolean
}

export function Breadcrumbs() {
  const pathname = usePathname()

  // Generate breadcrumbs from pathname
  const generateBreadcrumbs = (): BreadcrumbItem[] => {
    const segments = pathname.split('/').filter(Boolean)
    const breadcrumbs: BreadcrumbItem[] = []

    // Add home/dashboard
    breadcrumbs.push({
      label: 'Dashboard',
      href: '/dashboard'
    })

    // Convert path segments to breadcrumbs
    let currentPath = ''
    segments.forEach((segment, index) => {
      currentPath += `/${segment}`
      
      // Skip dashboard since we already added it
      if (segment === 'dashboard') return

      // Convert segment to readable label
      let label = segment
        .split('-')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')
      
      // Special cases for acronyms
      if (segment === 'mcp') {
        label = 'MCP'
      }

      breadcrumbs.push({
        label,
        href: currentPath,
        current: index === segments.length - 1
      })
    })

    return breadcrumbs
  }

  const breadcrumbs = generateBreadcrumbs()


  return (
    <nav className="flex" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2">
        {breadcrumbs.map((breadcrumb, index) => (
          <motion.li
            key={breadcrumb.href}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: index * 0.1 }}
            className="flex items-center"
          >
            {index > 0 && (
              <ChevronRight className="w-4 h-4 text-gray-400 dark:text-gray-500 mx-2" />
            )}
            
            {index === 0 && (
              <Home className="w-4 h-4 text-gray-400 dark:text-gray-500 mr-2" />
            )}
            
            {breadcrumb.current ? (
              <span className="text-sm font-medium text-gray-900 dark:text-white">
                {breadcrumb.label}
              </span>
            ) : (
              <Link
                href={breadcrumb.href}
                className="text-sm font-medium text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
              >
                {breadcrumb.label}
              </Link>
            )}
          </motion.li>
        ))}
      </ol>
    </nav>
  )
}