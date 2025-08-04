'use client'

import { Bot } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip'

interface AIAssistantToggleProps {
  onClick: () => void
  isOpen: boolean
}

export function AIAssistantToggle({ onClick, isOpen }: AIAssistantToggleProps) {
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClick}
            className={isOpen ? 'bg-accent' : ''}
          >
            <Bot className="w-5 h-5" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{isOpen ? 'Close' : 'Open'} AI Assistant</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  )
}