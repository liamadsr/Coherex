import React from 'react'
import { 
  Check,
  ArrowRight,
  ExternalLink,
  Settings,
  Mail
} from 'lucide-react'

import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Integration } from '@/types'
import { cn } from '@/lib/utils'
import { ServiceIcon } from './ServiceIcon'

interface IntegrationCardProps {
  integration: Integration
  isConnected: boolean
  onConnect: () => void
}

export function IntegrationCard({ integration, isConnected, onConnect }: IntegrationCardProps) {
  const renderIcon = () => {
    // If icon is a string, check if it's a Simple Icons slug
    if (typeof integration.icon === 'string') {
      // Check if it's a known Lucide icon for certain services
      if (integration.icon === 'email') {
        return <Mail className="w-8 h-8" />
      }
      
      // Use the ServiceIcon component which handles fallbacks
      return <ServiceIcon name={integration.name} slug={integration.icon} />
    }
    
    // If icon is a component, render it
    const Icon = integration.icon
    return <Icon className="w-8 h-8" />
  }

  return (
    <Card 
      className={cn(
        "group hover:shadow-md transition-all duration-200 cursor-pointer",
        isConnected && "border-green-500"
      )}
      onClick={onConnect}
    >
      <CardContent className="p-6">
        <div className="space-y-4">
          {/* Header */}
          <div className="flex items-start justify-between">
            <div>
              {renderIcon()}
            </div>
            {isConnected && (
              <Badge variant="default" className="bg-green-500">
                <Check className="w-3 h-3 mr-1" />
                Connected
              </Badge>
            )}
          </div>

          {/* Content */}
          <div>
            <h3 className="font-semibold text-gray-900 dark:text-white mb-1">
              {integration.name}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2">
              {integration.description}
            </p>
          </div>

          {/* Features */}
          {integration.features && integration.features.length > 0 && (
            <div className="flex flex-wrap gap-1">
              {integration.features.slice(0, 2).map((feature, index) => (
                <Badge key={index} variant="secondary" className="text-xs">
                  {feature}
                </Badge>
              ))}
              {integration.features.length > 2 && (
                <Badge variant="secondary" className="text-xs">
                  +{integration.features.length - 2}
                </Badge>
              )}
            </div>
          )}

          {/* Action */}
          <div className="pt-2">
            {isConnected ? (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-gray-50 dark:group-hover:bg-gray-800"
                onClick={(e) => {
                  e.stopPropagation()
                  onConnect()
                }}
              >
                <Settings className="w-4 h-4 mr-2" />
                Manage
              </Button>
            ) : (
              <Button 
                variant="outline" 
                size="sm" 
                className="w-full group-hover:bg-blue-50 dark:group-hover:bg-blue-900/20 group-hover:text-blue-600"
                onClick={(e) => {
                  e.stopPropagation()
                  onConnect()
                }}
              >
                Connect
                <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}