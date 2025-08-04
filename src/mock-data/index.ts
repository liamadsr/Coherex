import { faker } from '@faker-js/faker'
import {
  User,
  Organization,
  Agent,
  AgentTeam,
  Conversation,
  ConversationMessage,
  KnowledgeSource,
  Evaluation,
  EvaluationCriteria,
  IntegrationChannel,
  CodeExecution,
  AnalyticsData,
  UserSettings,
  ApiKey,
  AgentTemplate
} from '@/types'
import { 
  stableAgents, 
  stableUsers, 
  stableOrganization, 
  stableTeams, 
  stableConversations, 
  stableKnowledgeSources 
} from './stable-data'

// Helper function to create realistic delays
export const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// Generate mock organizations
export const generateMockOrganizations = (count: number = 5): Organization[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    slug: faker.lorem.slug(),
    logo: faker.image.avatar(),
    plan: faker.helpers.arrayElement(['free', 'pro', 'enterprise'] as const),
    billingStatus: faker.helpers.arrayElement(['active', 'past_due', 'cancelled'] as const),
    createdAt: faker.date.recent({ days: 90 }),
    updatedAt: faker.date.recent({ days: 30 })
  }))
}

// Generate mock users
export const generateMockUsers = (count: number = 20, organizationIds: string[]): User[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.person.fullName(),
    email: faker.internet.email(),
    avatar: faker.image.avatar(),
    role: faker.helpers.arrayElement(['admin', 'user', 'viewer'] as const),
    organizationId: faker.helpers.arrayElement(organizationIds),
    createdAt: faker.date.recent({ days: 60 }),
    updatedAt: faker.date.recent({ days: 10 })
  }))
}

// Generate mock agents
export const generateMockAgents = (count: number = 50, organizationIds: string[], userIds: string[]): Agent[] => {
  const personalityTraits = [
    'friendly', 'professional', 'empathetic', 'analytical', 'creative', 'detail-oriented',
    'patient', 'enthusiastic', 'helpful', 'knowledgeable', 'diplomatic', 'efficient'
  ]
  
  const capabilities = [
    'email', 'chat', 'knowledge-base', 'data-analysis', 'code-execution', 'document-processing',
    'voice', 'image-analysis', 'scheduling', 'reporting', 'integration-management', 'multilingual'
  ]
  
  const integrations = [
    'slack', 'teams', 'salesforce', 'zendesk', 'hubspot', 'jira', 'confluence',
    'sharepoint', 'google-drive', 'notion', 'intercom', 'helpscout'
  ]

  const channels = ['email', 'slack', 'web-chat', 'phone', 'api']
  const models = ['gpt-4', 'gpt-3.5-turbo', 'claude-3', 'gemini-pro']

  return Array.from({ length: count }, () => {
    const createdAt = faker.date.recent({ days: 30 })
    return {
      id: faker.string.uuid(),
      name: `${faker.person.firstName()} ${faker.helpers.arrayElement(['Assistant', 'Agent', 'Helper', 'Specialist'])}`,
      email: faker.internet.email(),
      description: faker.lorem.sentence({ min: 10, max: 20 }),
      status: faker.helpers.arrayElement(['active', 'inactive', 'training', 'error'] as const),
      personality: faker.helpers.arrayElements(personalityTraits, { min: 2, max: 4 }),
      capabilities: faker.helpers.arrayElements(capabilities, { min: 3, max: 6 }),
      channels: faker.helpers.arrayElements(channels, { min: 1, max: 3 }),
      integrations: faker.helpers.arrayElements(integrations, { min: 1, max: 4 }),
      knowledgeSources: faker.helpers.arrayElements(['company-docs', 'faq', 'product-catalog', 'policies'], { min: 1, max: 3 }),
      model: faker.helpers.arrayElement(models),
      temperature: faker.number.float({ min: 0.1, max: 1.5, fractionDigits: 1 }),
      maxTokens: faker.number.int({ min: 1000, max: 4000 }),
      systemPrompt: faker.lorem.paragraph({ min: 3, max: 6 }),
      avatar: ['🤖', '🦾', '🧠', '🦿', '⚡', '🔮', '💫', '🌟', '🎯', '🚀', '💡', '🔧', '⚙️', '🛠️', '🔌', '📡', '🛰️', '🌐', '💻', '🖥️'][Math.floor(Math.random() * 20)],
      metrics: {
        conversationsHandled: faker.number.int({ min: 50, max: 5000 }),
        averageResponseTime: `${faker.number.float({ min: 0.5, max: 10, fractionDigits: 1 })}s`,
        satisfactionScore: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
        accuracyScore: faker.number.float({ min: 0.7, max: 1.0, fractionDigits: 2 }),
        uptime: faker.number.float({ min: 95, max: 100, fractionDigits: 1 }),
        totalMessages: faker.number.int({ min: 100, max: 20000 }),
        successfulResolutions: faker.number.int({ min: 80, max: 95 })
      },
      createdAt,
      updatedAt: faker.date.between({ from: createdAt, to: new Date() }),
      organizationId: faker.helpers.arrayElement(organizationIds),
      userId: faker.helpers.arrayElement(userIds)
    }
  })
}

// Generate mock agent teams
export const generateMockAgentTeams = (count: number = 15, agentIds: string[], organizationIds: string[]): AgentTeam[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: `${faker.company.buzzAdjective()} ${faker.helpers.arrayElement(['Support', 'Sales', 'Analytics', 'Operations'])} Team`,
    description: faker.lorem.paragraph(),
    agentIds: faker.helpers.arrayElements(agentIds, { min: 2, max: 5 }),
    status: faker.helpers.arrayElement(['active', 'inactive'] as const),
    purpose: faker.lorem.sentence(),
    collaborationRules: [
      'Share knowledge across team members',
      'Escalate complex issues to team lead',
      'Maintain consistent brand voice'
    ],
    createdAt: faker.date.recent({ days: 20 }),
    updatedAt: faker.date.recent({ days: 5 }),
    organizationId: faker.helpers.arrayElement(organizationIds)
  }))
}

// Generate mock conversations
export const generateMockConversations = (count: number = 200, agentIds: string[]): Conversation[] => {
  return Array.from({ length: count }, () => {
    const messageCount = faker.number.int({ min: 2, max: 12 })
    const conversationId = faker.string.uuid()
    const startTime = faker.date.recent({ days: 7 })
    
    const messages: ConversationMessage[] = Array.from({ length: messageCount }, (_, index) => ({
      id: faker.string.uuid(),
      conversationId,
      sender: index % 2 === 0 ? 'user' : 'agent',
      content: faker.lorem.sentences({ min: 1, max: 3 }),
      metadata: {},
      timestamp: new Date(startTime.getTime() + index * 60000) // 1 minute apart
    }))

    const userId = faker.string.uuid()
    const userName = faker.person.fullName()
    const lastMessage = messages[messages.length - 1]?.content || faker.lorem.sentence()

    return {
      id: conversationId,
      agentId: faker.helpers.arrayElement(agentIds),
      userId,
      user: {
        name: userName,
        email: faker.internet.email({ firstName: userName.split(' ')[0], lastName: userName.split(' ')[1] }),
        avatar: faker.helpers.maybe(() => faker.image.avatar())
      },
      channel: faker.helpers.arrayElement(['email', 'slack', 'teams', 'sms', 'voice', 'web-chat'] as const),
      status: faker.helpers.arrayElement(['active', 'resolved', 'escalated'] as const),
      messages,
      lastMessage,
      messageCount,
      satisfaction: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 })),
      tags: faker.helpers.arrayElements(['urgent', 'billing', 'technical', 'general', 'complaint'], { min: 0, max: 2 }),
      createdAt: startTime,
      updatedAt: new Date(startTime.getTime() + messageCount * 60000)
    }
  })
}

// Generate mock knowledge sources
export const generateMockKnowledgeSources = (count: number = 25): KnowledgeSource[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.company.buzzNoun(),
    type: faker.helpers.arrayElement(['document', 'website', 'database', 'api', 'integration'] as const),
    status: faker.helpers.arrayElement(['connected', 'syncing', 'error', 'disconnected'] as const),
    lastSync: faker.helpers.maybe(() => faker.date.recent({ days: 1 })),
    documentsCount: faker.number.int({ min: 10, max: 1000 }),
    sizeBytes: faker.number.int({ min: 1024, max: 1073741824 }), // 1KB to 1GB
    metadata: {
      source: faker.internet.url(),
      format: faker.helpers.arrayElement(['pdf', 'docx', 'html', 'json', 'csv'])
    },
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 5 })
  }))
}

// Generate mock evaluations
export const generateMockEvaluations = (count: number = 100, agentIds: string[]): Evaluation[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    agentId: faker.helpers.arrayElement(agentIds),
    conversationId: faker.helpers.maybe(() => faker.string.uuid()),
    evaluatorType: faker.helpers.arrayElement(['accuracy', 'safety', 'helpfulness', 'brand_compliance', 'performance'] as const),
    score: faker.number.float({ min: 0.1, max: 1.0, fractionDigits: 2 }),
    criteria: faker.helpers.arrayElements(['clear_communication', 'accurate_information', 'professional_tone', 'timely_response'], { min: 2, max: 4 }),
    feedback: faker.lorem.paragraph(),
    improvementSuggestions: [
      faker.lorem.sentence(),
      faker.lorem.sentence()
    ],
    createdAt: faker.date.recent({ days: 7 })
  }))
}

// Generate mock evaluation criteria
export const generateMockEvaluationCriteria = (): EvaluationCriteria[] => {
  const criteria = [
    { name: 'Response Accuracy', type: 'accuracy' as const, description: 'How accurate and correct the agent\'s responses are' },
    { name: 'Safety Compliance', type: 'safety' as const, description: 'Adherence to safety guidelines and avoiding harmful content' },
    { name: 'Helpfulness Score', type: 'helpfulness' as const, description: 'How helpful and useful the responses are to users' },
    { name: 'Brand Alignment', type: 'brand_compliance' as const, description: 'Consistency with brand voice and guidelines' },
    { name: 'Response Time', type: 'performance' as const, description: 'Speed of response and overall performance metrics' }
  ]

  return criteria.map(item => ({
    id: faker.string.uuid(),
    name: item.name,
    description: item.description,
    type: item.type,
    weight: faker.number.float({ min: 0.1, max: 1.0, fractionDigits: 1 }),
    thresholds: {
      excellent: 0.9,
      good: 0.75,
      fair: 0.6,
      poor: 0.4
    },
    isActive: true,
    createdAt: faker.date.recent({ days: 30 }),
    updatedAt: faker.date.recent({ days: 5 })
  }))
}

// Generate mock integration channels
export const generateMockIntegrationChannels = (count: number = 10, agentIds: string[]): IntegrationChannel[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.company.name(),
    type: faker.helpers.arrayElement(['email', 'slack', 'teams', 'sms', 'voice', 'web-chat'] as const),
    status: faker.helpers.arrayElement(['connected', 'disconnected', 'error', 'configuring'] as const),
    config: {
      apiKey: 'sk-' + faker.string.alphanumeric(32),
      webhookUrl: faker.internet.url(),
      settings: faker.helpers.objectEntry(faker.lorem.words())
    },
    agentIds: faker.helpers.arrayElements(agentIds, { min: 1, max: 3 }),
    createdAt: faker.date.recent({ days: 15 }),
    updatedAt: faker.date.recent({ days: 2 })
  }))
}

// Generate mock analytics data
export const generateMockAnalyticsData = (agentIds: string[]): AnalyticsData => {
  return {
    agentPerformance: agentIds.slice(0, 10).map(agentId => ({
      agentId,
      metrics: {
        conversationsHandled: faker.number.int({ min: 50, max: 500 }),
        averageResponseTime: `${faker.number.float({ min: 0.5, max: 5, fractionDigits: 1 })}s`,
        satisfactionScore: faker.number.float({ min: 3.5, max: 5.0, fractionDigits: 1 }),
        accuracyScore: faker.number.float({ min: 0.8, max: 1.0, fractionDigits: 2 }),
        uptime: faker.number.float({ min: 98, max: 100, fractionDigits: 1 }),
        totalMessages: faker.number.int({ min: 200, max: 2000 }),
        successfulResolutions: faker.number.int({ min: 85, max: 98 })
      },
      trends: [
        {
          period: '7d',
          values: Array.from({ length: 7 }, () => faker.number.float({ min: 0.7, max: 1.0, fractionDigits: 2 }))
        },
        {
          period: '30d',
          values: Array.from({ length: 30 }, () => faker.number.float({ min: 0.7, max: 1.0, fractionDigits: 2 }))
        }
      ]
    })),
    platformStats: {
      totalAgents: agentIds.length,
      activeConversations: faker.number.int({ min: 50, max: 200 }),
      avgResponseTime: faker.number.float({ min: 1.2, max: 3.5, fractionDigits: 1 }),
      userSatisfaction: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
      totalUsers: faker.number.int({ min: 500, max: 5000 }),
      systemUptime: faker.number.float({ min: 99.5, max: 100, fractionDigits: 2 })
    },
    usageMetrics: {
      conversationsPerHour: Array.from({ length: 24 }, () => faker.number.int({ min: 5, max: 50 })),
      peakHours: [9, 10, 11, 14, 15, 16], // Business hours
      channelDistribution: {
        email: faker.number.int({ min: 30, max: 50 }),
        slack: faker.number.int({ min: 20, max: 35 }),
        'web-chat': faker.number.int({ min: 15, max: 25 }),
        teams: faker.number.int({ min: 10, max: 20 }),
        sms: faker.number.int({ min: 5, max: 15 })
      },
      topPerformingAgents: faker.helpers.arrayElements(agentIds, 5)
    }
  }
}

// Generate mock user settings
export const generateMockUserSettings = (userId: string): UserSettings => {
  return {
    id: faker.string.uuid(),
    userId,
    notifications: {
      email: true,
      inApp: true,
      sms: false,
      agentAlerts: true,
      systemUpdates: false
    },
    preferences: {
      theme: faker.helpers.arrayElement(['light', 'dark', 'system'] as const),
      timezone: faker.location.timeZone(),
      language: 'en',
      dashboardLayout: faker.helpers.arrayElement(['compact', 'comfortable', 'spacious'] as const)
    },
    security: {
      twoFactorEnabled: faker.datatype.boolean(),
      sessionTimeout: faker.number.int({ min: 30, max: 480 }), // 30 minutes to 8 hours
      allowedIPs: []
    },
    updatedAt: faker.date.recent({ days: 1 })
  }
}

// Generate mock API keys
export const generateMockApiKeys = (count: number = 5): ApiKey[] => {
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.lorem.words(2),
    key: `sk-${faker.string.alphanumeric(48)}`,
    permissions: faker.helpers.arrayElements(['read', 'write', 'admin'], { min: 1, max: 3 }),
    lastUsed: faker.helpers.maybe(() => faker.date.recent({ days: 30 })),
    expiresAt: faker.helpers.maybe(() => faker.date.future({ years: 1 })),
    isActive: faker.datatype.boolean({ probability: 0.8 }),
    createdAt: faker.date.recent({ days: 90 })
  }))
}

// Generate mock agent templates
export const generateMockAgentTemplates = (count: number = 20): AgentTemplate[] => {
  const categories = ['Customer Support', 'Sales', 'Marketing', 'Data Analysis', 'DevOps', 'HR', 'Finance']
  
  return Array.from({ length: count }, () => ({
    id: faker.string.uuid(),
    name: faker.lorem.words(3),
    description: faker.lorem.paragraph(),
    category: faker.helpers.arrayElement(categories),
    personality: faker.helpers.arrayElements(['friendly', 'professional', 'analytical', 'creative'], { min: 2, max: 3 }),
    capabilities: faker.helpers.arrayElements(['email', 'chat', 'data-analysis', 'reporting'], { min: 2, max: 4 }),
    integrations: faker.helpers.arrayElements(['slack', 'salesforce', 'hubspot'], { min: 1, max: 2 }),
    isPublic: faker.datatype.boolean({ probability: 0.7 }),
    usageCount: faker.number.int({ min: 0, max: 1000 }),
    rating: faker.number.float({ min: 3.0, max: 5.0, fractionDigits: 1 }),
    createdAt: faker.date.recent({ days: 60 })
  }))
}

// Create comprehensive mock data set
export const generateMockData = () => {
  const organizations = generateMockOrganizations(5)
  const organizationIds = organizations.map(org => org.id)
  
  const users = generateMockUsers(20, organizationIds)
  const userIds = users.map(user => user.id)
  
  const agents = generateMockAgents(50, organizationIds, userIds)
  const agentIds = agents.map(agent => agent.id)
  
  const teams = generateMockAgentTeams(15, agentIds, organizationIds)
  const conversations = generateMockConversations(200, agentIds)
  const knowledgeSources = generateMockKnowledgeSources(25)
  const evaluations = generateMockEvaluations(100, agentIds)
  const evaluationCriteria = generateMockEvaluationCriteria()
  const integrationChannels = generateMockIntegrationChannels(10, agentIds)
  const analytics = generateMockAnalyticsData(agentIds)
  const userSettings = generateMockUserSettings(users[0].id)
  const apiKeys = generateMockApiKeys(5)
  const agentTemplates = generateMockAgentTemplates(20)

  return {
    organizations,
    users,
    agents,
    teams,
    conversations,
    knowledgeSources,
    evaluations,
    evaluationCriteria,
    integrationChannels,
    analytics,
    userSettings,
    apiKeys,
    agentTemplates
  }
}

// Mock API functions with realistic delays
export const mockApi = {
  // Authentication
  login: async (email: string, password: string) => {
    await delay(1000)
    
    // Accept test credentials or any email/password for demo
    const validEmails = ['test@coherex.ai', 'admin@coherex.ai', 'demo@coherex.ai']
    const isValidLogin = validEmails.includes(email) || email.includes('@')
    
    if (!isValidLogin) {
      return {
        success: false,
        error: 'Invalid credentials'
      }
    }
    
    // Find user by email or use first user
    const user = stableUsers.find(u => u.email === email) || stableUsers[0]
    
    return {
      success: true,
      data: {
        user: {
          ...user,
          email: email,
          name: email === 'test@coherex.ai' ? 'Test User' : email.split('@')[0].charAt(0).toUpperCase() + email.split('@')[0].slice(1)
        },
        organization: stableOrganization,
        token: faker.string.alphanumeric(64)
      }
    }
  },

  signup: async (data: any) => {
    await delay(1500)
    const mockData = generateMockData()
    const newUser = {
      ...mockData.users[0],
      id: faker.string.uuid(),
      email: data.email,
      name: data.fullName,
    }
    return {
      success: true,
      data: {
        user: newUser,
        organization: mockData.organizations[0],
        token: faker.string.alphanumeric(64)
      }
    }
  },

  logout: async () => {
    await delay(500)
    return {
      success: true,
      message: 'Logged out successfully'
    }
  },

  forgotPassword: async (email: string) => {
    await delay(1000)
    return {
      success: true,
      message: 'Password reset email sent'
    }
  },

  verifyEmail: async (token: string) => {
    await delay(800)
    return {
      success: true,
      message: 'Email verified successfully'
    }
  },

  validateToken: async (token: string) => {
    await delay(500)
    const mockData = generateMockData()
    return {
      success: true,
      data: mockData.users[0]
    }
  },

  // Agents
  getAgents: async (filters?: any) => {
    await delay(800)
    return {
      success: true,
      data: stableAgents,
      pagination: {
        page: 1,
        limit: 20,
        total: stableAgents.length,
        totalPages: Math.ceil(stableAgents.length / 20)
      }
    }
  },

  getAgent: async (id: string) => {
    await delay(500)
    const agent = stableAgents.find(a => a.id === id)
    if (!agent) {
      return {
        success: false,
        error: 'Agent not found'
      }
    }
    return {
      success: true,
      data: agent
    }
  },

  getAgentMetrics: async (agentId: string) => {
    await delay(600)
    const mockData = generateMockData()
    const agent = mockData.agents.find(a => a.id === agentId) || mockData.agents[0]
    
    return {
      totalConversations: faker.number.int({ min: 50, max: 500 }),
      successRate: faker.number.int({ min: 85, max: 98 }),
      avgResponseTime: faker.number.float({ min: 0.5, max: 3.0, fractionDigits: 1 }),
      activeUsers: faker.number.int({ min: 10, max: 100 }),
      satisfactionScore: faker.number.float({ min: 4.0, max: 5.0, fractionDigits: 1 }),
      uptime: faker.number.float({ min: 98, max: 100, fractionDigits: 1 }),
      errorsCount: faker.number.int({ min: 0, max: 5 })
    }
  },

  getAgentConversations: async (agentId: string) => {
    await delay(700)
    const mockData = generateMockData()
    const agentConversations = mockData.conversations
      .filter(c => c.agentId === agentId)
      .slice(0, 20) // Limit to recent conversations
    
    return agentConversations
  },

  updateAgentStatus: async (agentId: string, status: 'active' | 'inactive') => {
    await delay(800)
    // In a real app, this would update the database
    return { success: true, message: `Agent status updated to ${status}` }
  },

  deleteAgent: async (agentId: string) => {
    await delay(1000)
    // In a real app, this would delete the agent from the database
    return { success: true, message: 'Agent deleted successfully' }
  },

  updateAgent: async (agentId: string, data: any) => {
    await delay(1000)
    const agent = stableAgents.find(a => a.id === agentId)
    if (!agent) {
      return {
        success: false,
        error: 'Agent not found'
      }
    }
    // Update the agent in our stable data
    Object.assign(agent, data, { updatedAt: new Date() })
    return {
      success: true,
      data: agent
    }
  },

  getAgentMetrics: async (agentId: string) => {
    await delay(500)
    return {
      totalConversations: faker.number.int({ min: 100, max: 5000 }),
      activeConversations: faker.number.int({ min: 0, max: 50 }),
      avgResponseTime: faker.number.float({ min: 0.5, max: 5, fractionDigits: 1 }),
      satisfactionScore: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
      successRate: faker.number.int({ min: 85, max: 99 }),
      uptime: faker.number.float({ min: 98, max: 99.9, fractionDigits: 1 }),
      errorsCount: faker.number.int({ min: 0, max: 10 }),
      lastActive: faker.date.recent(),
    }
  },

  getAgentConversations: async (agentId: string) => {
    await delay(800)
    // Filter conversations for this agent and ensure they have messages
    const agentConversations = stableConversations
      .filter(conv => conv.agentId === agentId)
      .map(conv => {
        // Generate messages if not present
        if (!conv.messages || conv.messages.length === 0) {
          const messageCount = faker.number.int({ min: 2, max: 12 })
          const startTime = new Date(conv.createdAt)
          
          const messages: ConversationMessage[] = Array.from({ length: messageCount }, (_, index) => ({
            id: `${conv.id}-msg-${index + 1}`,
            conversationId: conv.id,
            sender: index % 2 === 0 ? 'user' : 'agent',
            content: index % 2 === 0 
              ? faker.lorem.sentences({ min: 1, max: 3 })
              : faker.lorem.sentences({ min: 2, max: 4 }),
            metadata: index === 0 ? { isFirstMessage: true } : {},
            timestamp: new Date(startTime.getTime() + index * 60000) // 1 minute apart
          }))
          
          return { ...conv, messages }
        }
        return conv
      })
    
    return agentConversations
  },

  // Conversations
  getConversations: async (agentId?: string) => {
    await delay(600)
    const conversations = agentId 
      ? stableConversations.filter(c => c.agentId === agentId)
      : stableConversations
    return { success: true, data: conversations }
  },

  getConversation: async (id: string) => {
    await delay(500)
    const conversation = stableConversations.find(c => c.id === id)
    if (!conversation) {
      return {
        success: false,
        error: 'Conversation not found'
      }
    }
    
    // Ensure conversation has messages
    if (!conversation.messages || conversation.messages.length === 0) {
      const messageCount = faker.number.int({ min: 2, max: 12 })
      const startTime = new Date(conversation.createdAt)
      
      const messages: ConversationMessage[] = Array.from({ length: messageCount }, (_, index) => ({
        id: `${conversation.id}-msg-${index + 1}`,
        conversationId: conversation.id,
        sender: index % 2 === 0 ? 'user' : 'agent',
        content: index % 2 === 0 
          ? faker.lorem.sentences({ min: 1, max: 3 })
          : faker.lorem.sentences({ min: 2, max: 4 }),
        metadata: index === 0 ? { isFirstMessage: true } : {},
        timestamp: new Date(startTime.getTime() + index * 60000) // 1 minute apart
      }))
      
      return {
        success: true,
        data: { ...conversation, messages }
      }
    }
    
    return {
      success: true,
      data: conversation
    }
  },

  // Teams
  getTeams: async () => {
    await delay(600)
    return { 
      success: true, 
      data: stableTeams 
    }
  },

  getTeam: async (id: string) => {
    await delay(500)
    const team = stableTeams.find(t => t.id === id)
    if (!team) {
      return {
        success: false,
        error: 'Team not found'
      }
    }
    return {
      success: true,
      data: team
    }
  },

  createTeam: async (data: any) => {
    await delay(1000)
    const newTeam = {
      id: `team-${Date.now()}`,
      name: data.name,
      description: data.description,
      type: data.type,
      agentIds: data.agentIds || [],
      memberIds: data.memberIds || [],
      organizationId: stableOrganization.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    stableTeams.push(newTeam)
    return {
      success: true,
      data: newTeam
    }
  },

  updateTeam: async (id: string, data: any) => {
    await delay(800)
    const team = stableTeams.find(t => t.id === id)
    if (!team) {
      return {
        success: false,
        error: 'Team not found'
      }
    }
    Object.assign(team, data, { updatedAt: new Date() })
    return {
      success: true,
      data: team
    }
  },

  deleteTeam: async (id: string) => {
    await delay(800)
    const index = stableTeams.findIndex(t => t.id === id)
    if (index === -1) {
      return {
        success: false,
        error: 'Team not found'
      }
    }
    stableTeams.splice(index, 1)
    return {
      success: true,
      message: 'Team deleted successfully'
    }
  },

  // Knowledge Base
  getKnowledgeSources: async () => {
    await delay(600)
    return {
      success: true,
      data: stableKnowledgeSources
    }
  },

  getKnowledgeSource: async (id: string) => {
    await delay(500)
    const source = stableKnowledgeSources.find(s => s.id === id)
    if (!source) {
      return {
        success: false,
        error: 'Knowledge source not found'
      }
    }
    return {
      success: true,
      data: source
    }
  },

  createKnowledgeSource: async (data: any) => {
    await delay(1000)
    const newSource = {
      id: `ks-${Date.now()}`,
      name: data.name,
      type: data.type,
      status: 'connected' as const,
      description: data.description,
      config: data.config || {},
      documentsCount: 0,
      lastSynced: new Date(),
      organizationId: stableOrganization.id,
      createdAt: new Date(),
      updatedAt: new Date()
    }
    stableKnowledgeSources.push(newSource)
    return {
      success: true,
      data: newSource
    }
  },

  getKnowledgeDocuments: async () => {
    await delay(600)
    const mockData = generateMockData()
    return {
      success: true,
      data: mockData.knowledgeDocuments || []
    }
  },

  // Analytics
  getAnalytics: async () => {
    await delay(1200)
    const mockData = generateMockData()
    return { success: true, data: mockData.analytics }
  },

  // Orchestrator responses
  orchestratorChat: async (message: string) => {
    await delay(2000) // Simulate thinking time
    
    const responses = [
      {
        response: "I'll help you create a customer support agent. Let me ask a few questions to understand your needs better.",
        suggestedConfig: {
          personality: ['friendly', 'helpful', 'patient'],
          capabilities: ['email', 'chat', 'knowledge-base'],
          integrations: ['zendesk', 'intercom']
        },
        nextQuestions: [
          "What's the primary role of this agent?",
          "Which communication channels should it use?",
          "What knowledge sources should it access?"
        ]
      },
      {
        response: "Great! Based on your requirements, I recommend creating a data analysis agent with Python capabilities.",
        suggestedConfig: {
          personality: ['analytical', 'detail-oriented', 'precise'],
          capabilities: ['data-analysis', 'code-execution', 'reporting'],
          integrations: ['google-sheets', 'salesforce', 'database']
        },
        nextQuestions: [
          "What types of data will this agent analyze?",
          "Do you need real-time or batch processing?",
          "What reporting format do you prefer?"
        ]
      }
    ]

    return {
      success: true,
      data: faker.helpers.arrayElement(responses)
    }
  },

  // Agent Management
  createAgent: async (agentData: any) => {
    await delay(2000)
    const mockData = generateMockData()
    
    // Create a new agent based on the form data
    const newAgent = {
      id: faker.string.uuid(),
      name: agentData.name,
      email: agentData.email,
      description: agentData.description,
      status: 'training' as const,
      personality: agentData.personality,
      capabilities: agentData.capabilities,
      channels: agentData.channels,
      model: agentData.model,
      temperature: agentData.temperature,
      maxTokens: agentData.maxTokens,
      systemPrompt: agentData.systemPrompt,
      metrics: {
        totalConversations: 0,
        avgResponseTime: 0,
        satisfactionScore: 0,
        successRate: 0,
        uptime: 100,
        errorsCount: 0
      },
      integrations: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      organizationId: mockData.organizations[0].id,
      userId: mockData.users[0].id
    }

    return {
      success: true,
      data: newAgent
    }
  }
}

// Export the generated data as default
const mockData = generateMockData()
export default mockData