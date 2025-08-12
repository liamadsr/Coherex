import React, { useState } from 'react'
import { FileText, Database, Cloud, HelpCircle } from 'lucide-react'

interface ServiceIconProps {
  name: string
  slug: string
  className?: string
}

// Fallback icons for services not available on Simple Icons
const fallbackIcons: { [key: string]: React.ComponentType<any> } = {
  'slab': FileText,
  'document360': FileText,
  'bookstack': FileText,
  'axero': Cloud,
  'egnyte': Cloud,
  'helpscout': HelpCircle,
  'highspot': Database,
  'guru': FileText,
}

// Services that might need special handling or aren't on Simple Icons
const servicesWithIssues = [
  'slab', 'document360', 'bookstack', 'axero', 'egnyte', 
  'helpscout', 'highspot', 'guru', 'googlesites', 'monday',
  'microsoftsharepoint', 'amazons3', 'googlecloud'
]

// Map service slugs to Iconify icon names
const iconifyMappings: { [key: string]: string } = {
  'microsoftsharepoint': 'simple-icons:microsoftsharepoint',
  'amazons3': 'simple-icons:amazons3',
  'googlecloud': 'simple-icons:googlecloud',
  'googlesites': 'simple-icons:google',
  'helpscout': 'simple-icons:helpscout',
  'monday': 'logos:monday-icon',
  'slab': 'simple-icons:slack', // Use similar icon as fallback
  'document360': 'mdi:file-document',
  'bookstack': 'mdi:bookshelf',
  'axero': 'mdi:cloud',
  'egnyte': 'mdi:cloud-outline',
  'highspot': 'mdi:database',
  'guru': 'mdi:book-open-variant',
}

// Use Iconify API as an alternative source
const getIconifyUrl = (slug: string, color: string) => {
  const iconName = iconifyMappings[slug] || `simple-icons:${slug}`
  return `https://api.iconify.design/${iconName}.svg?color=%23${color}`
}

export function ServiceIcon({ name, slug, className = "w-8 h-8" }: ServiceIconProps) {
  const [simpleIconError, setSimpleIconError] = useState(false)
  const [iconifyError, setIconifyError] = useState(false)

  // Try Simple Icons first (unless we know it won't work)
  if (!simpleIconError && !servicesWithIssues.includes(slug)) {
    return (
      <>
        <img 
          src={`https://cdn.simpleicons.org/${slug}/000000`}
          alt={`${name} logo`}
          className={`${className} dark:hidden`}
          onError={() => setSimpleIconError(true)}
        />
        <img 
          src={`https://cdn.simpleicons.org/${slug}/FFFFFF`}
          alt={`${name} logo`}
          className={`${className} hidden dark:block`}
          onError={() => setSimpleIconError(true)}
        />
      </>
    )
  }

  // Try Iconify as a second option
  if (!iconifyError) {
    return (
      <>
        <img 
          src={getIconifyUrl(slug, '000000')}
          alt={`${name} logo`}
          className={`${className} dark:hidden`}
          onError={() => setIconifyError(true)}
        />
        <img 
          src={getIconifyUrl(slug, 'ffffff')}
          alt={`${name} logo`}
          className={`${className} hidden dark:block`}
          onError={() => setIconifyError(true)}
        />
      </>
    )
  }

  // Fallback to Lucide icon
  const FallbackIcon = fallbackIcons[slug] || FileText
  return <FallbackIcon className={className} />
}