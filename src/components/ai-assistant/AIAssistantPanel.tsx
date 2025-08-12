'use client'

import ConversationPromptInput from '@/components/primitives/chatbot'

interface AIAssistantPanelProps {
  isOpen: boolean
}

export function AIAssistantPanel({ isOpen }: AIAssistantPanelProps) {
  if (!isOpen) return null
  
  return (
    <div className="h-full w-full flex flex-col">
      <ConversationPromptInput />
    </div>
  )
}