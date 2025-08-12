'use client'

import { Button } from '@/components/ui/button'
import { MessageSquare, X } from 'lucide-react'

interface AIAssistantToggleProps {
  onClick: () => void
  isOpen: boolean
}

export function AIAssistantToggle({ onClick, isOpen }: AIAssistantToggleProps) {
  return (
    <Button
      variant="ghost"
      size="sm"
      onClick={onClick}
      className="flex items-center gap-2"
    >
      {isOpen ? (
        <X className="w-5 h-5" />
      ) : (
        <MessageSquare className="w-5 h-5" />
      )}
      <span className="hidden sm:inline">
        {isOpen ? 'Close' : 'AI Assistant'}
      </span>
    </Button>
  )
}