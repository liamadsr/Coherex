'use client'

import React, { useState } from 'react'
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
} from '@dnd-kit/core'
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  rectSortingStrategy,
} from '@dnd-kit/sortable'
import {
  useSortable,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { 
  Bot, 
  Plus, 
  X, 
  GripVertical,
  Search,
  UserPlus,
  Users,
  ChevronRight,
  CheckCircle
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { Input } from '@/components/ui/input'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import { Agent, Team } from '@/types'
import { toast } from 'sonner'

interface TeamAgentManagerProps {
  team: Team
  availableAgents: Agent[]
  onUpdate: (agentIds: string[]) => void
}

interface SortableAgentCardProps {
  agent: Agent
  onRemove?: () => void
  isOverlay?: boolean
}

function SortableAgentCard({ agent, onRemove, isOverlay }: SortableAgentCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: agent.id })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "relative group",
        isOverlay && "shadow-2xl"
      )}
    >
      <Card className={cn(
        "cursor-move transition-all",
        isDragging && "opacity-50",
        !isDragging && "hover:shadow-md"
      )}>
        <CardContent className="p-4">
          <div className="flex items-start space-x-3">
            <div
              {...attributes}
              {...listeners}
              className="mt-1 cursor-grab active:cursor-grabbing"
            >
              <GripVertical className="w-4 h-4 text-gray-400" />
            </div>
            
            <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center text-white">
              {agent.avatar ? (
                <span className="text-xl">{agent.avatar}</span>
              ) : (
                <span className="text-sm font-medium">{agent.name.charAt(0)}</span>
              )}
            </div>
            
            <div className="flex-1 min-w-0">
              <p className="font-medium truncate">{agent.name}</p>
              <div className="flex items-center space-x-2 mt-1">
                <Badge variant="secondary" className="text-xs">
                  {agent.status}
                </Badge>
                <span className="text-xs text-gray-500">
                  {agent.capabilities.length} capabilities
                </span>
              </div>
            </div>
            
            {onRemove && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-4 h-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function DroppableAgentCard({ agent }: { agent: Agent }) {
  return (
    <Card className="cursor-pointer hover:shadow-md transition-all hover:border-blue-500">
      <CardContent className="p-4">
        <div className="flex items-center space-x-3">
          <Avatar className="h-10 w-10">
            <AvatarImage src={agent.avatar} />
            <AvatarFallback className="text-xs">
              {agent.name.charAt(0)}
            </AvatarFallback>
          </Avatar>
          
          <div className="flex-1 min-w-0">
            <p className="font-medium truncate">{agent.name}</p>
            <p className="text-xs text-gray-500 truncate">
              {agent.description}
            </p>
          </div>
          
          <ChevronRight className="w-4 h-4 text-gray-400" />
        </div>
      </CardContent>
    </Card>
  )
}

export function TeamAgentManager({ team, availableAgents, onUpdate }: TeamAgentManagerProps) {
  const [teamAgentIds, setTeamAgentIds] = useState<string[]>(team.agentIds || [])
  const [searchQuery, setSearchQuery] = useState('')
  const [activeId, setActiveId] = useState<string | null>(null)

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  )

  // Get agent objects for team
  const teamAgents = teamAgentIds
    .map(id => availableAgents.find(agent => agent.id === id))
    .filter(Boolean) as Agent[]

  // Get available agents not in team
  const unassignedAgents = availableAgents.filter(
    agent => !teamAgentIds.includes(agent.id) && 
    (agent.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
     agent.description.toLowerCase().includes(searchQuery.toLowerCase()))
  )

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string)
  }

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event

    if (active.id !== over?.id) {
      const oldIndex = teamAgentIds.indexOf(active.id as string)
      const newIndex = teamAgentIds.indexOf(over?.id as string)

      if (oldIndex !== -1 && newIndex !== -1) {
        const newAgentIds = arrayMove(teamAgentIds, oldIndex, newIndex)
        setTeamAgentIds(newAgentIds)
        onUpdate(newAgentIds)
        toast.success('Agent order updated')
      }
    }

    setActiveId(null)
  }

  const addAgent = (agentId: string) => {
    const newAgentIds = [...teamAgentIds, agentId]
    setTeamAgentIds(newAgentIds)
    onUpdate(newAgentIds)
    
    const agent = availableAgents.find(a => a.id === agentId)
    toast.success(`Added ${agent?.name} to team`)
  }

  const removeAgent = (agentId: string) => {
    const newAgentIds = teamAgentIds.filter(id => id !== agentId)
    setTeamAgentIds(newAgentIds)
    onUpdate(newAgentIds)
    
    const agent = availableAgents.find(a => a.id === agentId)
    toast.success(`Removed ${agent?.name} from team`)
  }

  const activeAgent = activeId ? teamAgents.find(a => a.id === activeId) : null

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Team Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Users className="w-5 h-5" />
                <span>Team Agents</span>
              </CardTitle>
              <CardDescription>
                Drag to reorder agents in your team
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {teamAgents.length} agents
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          >
            <SortableContext
              items={teamAgentIds}
              strategy={rectSortingStrategy}
            >
              <div className="space-y-3">
                {teamAgents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <Bot className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">No agents in this team yet</p>
                    <p className="text-xs mt-1">Add agents from the available list</p>
                  </div>
                ) : (
                  teamAgents.map((agent) => (
                    <SortableAgentCard
                      key={agent.id}
                      agent={agent}
                      onRemove={() => removeAgent(agent.id)}
                    />
                  ))
                )}
              </div>
            </SortableContext>
            <DragOverlay>
              {activeAgent && (
                <SortableAgentCard agent={activeAgent} isOverlay />
              )}
            </DragOverlay>
          </DndContext>
        </CardContent>
      </Card>

      {/* Available Agents */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center space-x-2">
                <Bot className="w-5 h-5" />
                <span>Available Agents</span>
              </CardTitle>
              <CardDescription>
                Click to add agents to your team
              </CardDescription>
            </div>
            <Badge variant="secondary">
              {unassignedAgents.length} available
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Search agents..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            
            <ScrollArea className="h-[400px]">
              <div className="space-y-2 pr-4">
                {unassignedAgents.length === 0 ? (
                  <div className="text-center py-12 text-gray-500">
                    <CheckCircle className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                    <p className="text-sm">All agents assigned</p>
                    <p className="text-xs mt-1">
                      {searchQuery && "Try adjusting your search"}
                    </p>
                  </div>
                ) : (
                  unassignedAgents.map((agent) => (
                    <div
                      key={agent.id}
                      onClick={() => addAgent(agent.id)}
                    >
                      <DroppableAgentCard agent={agent} />
                    </div>
                  ))
                )}
              </div>
            </ScrollArea>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}