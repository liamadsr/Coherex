// Core Types for Blockwork Platform

import { ComponentType } from 'react'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  role: 'admin' | 'user' | 'viewer'
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface Organization {
  id: string
  name: string
  slug: string
  logo?: string
  plan: 'free' | 'pro' | 'enterprise'
  billingStatus: 'active' | 'past_due' | 'cancelled'
  createdAt: Date
  updatedAt: Date
}

export interface AgentMetrics {
  conversationsHandled: number
  averageResponseTime: string
  satisfactionScore: number
  accuracyScore: number
  uptime: number
  totalMessages: number
  successfulResolutions: number
}

export interface Agent {
  id: string
  name: string
  email: string
  description: string
  status: 'active' | 'inactive' | 'training' | 'error'
  personality: string[]
  capabilities: string[]
  channels: string[]
  integrations: string[]
  knowledgeSources: string[]
  model: string
  temperature: number
  maxTokens: number
  systemPrompt: string
  avatar?: string
  metrics: AgentMetrics
  createdAt: Date
  updatedAt: Date
  organizationId: string
  userId: string
}

export interface AgentTeam {
  id: string
  name: string
  description: string
  agentIds: string[]
  status: 'active' | 'inactive'
  purpose: string
  collaborationRules: string[]
  createdAt: Date
  updatedAt: Date
  organizationId: string
}

export interface Team {
  id: string
  name: string
  description?: string
  type: 'support' | 'sales' | 'operations' | 'marketing' | 'engineering'
  agentIds: string[]
  memberIds: string[]
  organizationId: string
  createdAt: Date
  updatedAt: Date
}

export interface Integration {
  id: string
  name: string
  description: string
  icon: ComponentType<{ className?: string }> | string
  category: string
  status: 'available' | 'connected' | 'error' | 'disconnected'
  features?: string[]
  config?: Record<string, any>
  lastSync?: Date
  createdAt?: Date
  updatedAt?: Date
}

export interface IntegrationCategory {
  id: string
  name: string
  description: string
  icon: ComponentType<{ className?: string }>
  integrations: Integration[]
}

export interface Conversation {
  id: string
  agentId: string
  userId?: string
  user: {
    name: string
    email: string
    avatar?: string
  }
  channel: 'email' | 'slack' | 'teams' | 'sms' | 'voice' | 'web-chat'
  status: 'active' | 'resolved' | 'escalated'
  messages: ConversationMessage[]
  lastMessage: string
  messageCount: number
  satisfaction?: number
  tags: string[]
  createdAt: Date
  updatedAt: Date
}

export interface ConversationMessage {
  id: string
  conversationId: string
  sender: 'agent' | 'user' | 'system'
  content: string
  metadata?: Record<string, any>
  timestamp: Date
}

export interface KnowledgeSource {
  id: string
  name: string
  type: 'document' | 'website' | 'database' | 'api' | 'integration'
  status: 'connected' | 'syncing' | 'error' | 'disconnected'
  lastSync: Date | null
  documentsCount: number
  sizeBytes: number
  metadata: Record<string, any>
  createdAt: Date
  updatedAt: Date
}

export interface Evaluation {
  id: string
  agentId: string
  conversationId?: string
  evaluatorType: 'accuracy' | 'safety' | 'helpfulness' | 'brand_compliance' | 'performance'
  score: number
  criteria: string[]
  feedback: string
  improvementSuggestions: string[]
  createdAt: Date
}

export interface EvaluationCriteria {
  id: string
  name: string
  description: string
  type: 'accuracy' | 'safety' | 'helpfulness' | 'brand_compliance' | 'performance' | 'custom'
  weight: number
  thresholds: {
    excellent: number
    good: number
    fair: number
    poor: number
  }
  isActive: boolean
  createdAt: Date
  updatedAt: Date
}

export interface IntegrationChannel {
  id: string
  name: string
  type: 'email' | 'slack' | 'teams' | 'sms' | 'voice' | 'web-chat'
  status: 'connected' | 'disconnected' | 'error' | 'configuring'
  config: Record<string, any>
  agentIds: string[]
  createdAt: Date
  updatedAt: Date
}

export interface CodeExecution {
  id: string
  agentId: string
  language: 'python' | 'javascript' | 'sql' | 'r' | 'bash'
  code: string
  result?: string
  error?: string
  status: 'pending' | 'running' | 'completed' | 'failed'
  executionTime: number
  resourceUsage: {
    cpu: number
    memory: number
    storage: number
  }
  createdAt: Date
  updatedAt: Date
}

export interface AnalyticsData {
  agentPerformance: {
    agentId: string
    metrics: AgentMetrics
    trends: {
      period: string
      values: number[]
    }[]
  }[]
  platformStats: {
    totalAgents: number
    activeConversations: number
    avgResponseTime: number
    userSatisfaction: number
    totalUsers: number
    systemUptime: number
  }
  usageMetrics: {
    conversationsPerHour: number[]
    peakHours: number[]
    channelDistribution: Record<string, number>
    topPerformingAgents: string[]
  }
}

export interface UserSettings {
  id: string
  userId: string
  notifications: {
    email: boolean
    inApp: boolean
    sms: boolean
    agentAlerts: boolean
    systemUpdates: boolean
  }
  preferences: {
    theme: 'light' | 'dark' | 'system'
    timezone: string
    language: string
    dashboardLayout: 'compact' | 'comfortable' | 'spacious'
  }
  security: {
    twoFactorEnabled: boolean
    sessionTimeout: number
    allowedIPs: string[]
  }
  updatedAt: Date
}

export interface ApiKey {
  id: string
  name: string
  key: string
  permissions: string[]
  lastUsed: Date | null
  expiresAt: Date | null
  isActive: boolean
  createdAt: Date
}

// Form and UI Types
export interface OrchestratorResponse {
  response: string
  suggestedConfig: {
    personality: string[]
    capabilities: string[]
    integrations: string[]
  }
  nextQuestions: string[]
}

export interface SignupData {
  name: string
  email: string
  password: string
  organizationName?: string
}

export interface AgentTemplate {
  id: string
  name: string
  description: string
  category: string
  personality: string[]
  capabilities: string[]
  integrations: string[]
  isPublic: boolean
  usageCount: number
  rating: number
  createdAt: Date
}

// State Management Types
export interface AppState {
  user: User | null
  organization: Organization | null
  agents: Agent[]
  teams: AgentTeam[]
  conversations: Conversation[]
  evaluations: Evaluation[]
  analytics: AnalyticsData | null
  settings: UserSettings | null
  isLoading: boolean
  error: string | null
}

// API Response Types
export interface ApiResponse<T> {
  data: T
  success: boolean
  message?: string
  error?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    limit: number
    total: number
    totalPages: number
  }
}

// Filter and Search Types
export interface AgentFilter {
  status?: Agent['status'][]
  capabilities?: string[]
  integrations?: string[]
  search?: string
  sortBy?: 'name' | 'createdAt' | 'lastActive' | 'performance'
  sortOrder?: 'asc' | 'desc'
}

export interface ConversationFilter {
  agentId?: string
  channel?: IntegrationChannel['type'][]
  status?: Conversation['status'][]
  dateRange?: {
    start: Date
    end: Date
  }
  search?: string
}

// Notification Types
export interface Notification {
  id: string
  type: 'info' | 'success' | 'warning' | 'error'
  title: string
  message: string
  timestamp: Date
  read: boolean
  actionUrl?: string
  actionLabel?: string
}