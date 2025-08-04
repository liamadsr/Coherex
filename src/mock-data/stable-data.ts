import { faker } from '@faker-js/faker'
import { Agent, User, Organization, Team, Conversation, ConversationMessage, KnowledgeSource } from '@/types'

// Set a stable seed for consistent data
faker.seed(12345)

// Bot avatar emojis
const botAvatars = ['🤖', '🦾', '🧠', '🦿', '⚡', '🔮', '💫', '🌟', '🎯', '🚀', '💡', '🔧', '⚙️', '🛠️', '🔌', '📡', '🛰️', '🌐', '💻', '🖥️']

// Generate stable mock data that persists across requests
export const stableAgents: Agent[] = Array.from({ length: 20 }, (_, i) => ({
  id: `agent-${i + 1}`,
  name: faker.person.fullName(),
  email: faker.internet.email().toLowerCase(),
  description: faker.lorem.sentence(),
  status: faker.helpers.arrayElement(['active', 'inactive', 'training', 'error'] as const),
  personality: faker.helpers.arrayElements(['friendly', 'professional', 'creative', 'analytical', 'empathetic'], 3),
  capabilities: faker.helpers.arrayElements([
    'customer-support',
    'sales',
    'technical-support',
    'content-creation',
    'data-analysis',
    'scheduling',
    'research',
    'translation'
  ], 4),
  channels: faker.helpers.arrayElements(['email', 'slack', 'teams', 'sms', 'voice', 'web-chat'], 2),
  model: faker.helpers.arrayElement(['gpt-4', 'gpt-3.5-turbo', 'claude-3-opus', 'claude-3-sonnet']),
  temperature: faker.number.float({ min: 0, max: 1, fractionDigits: 1 }),
  maxTokens: faker.helpers.arrayElement([1000, 2000, 4000, 8000]),
  systemPrompt: faker.lorem.paragraph(),
  avatar: botAvatars[i % botAvatars.length],
  metrics: {
    totalConversations: faker.number.int({ min: 100, max: 5000 }),
    avgResponseTime: faker.number.float({ min: 0.5, max: 5, fractionDigits: 1 }),
    satisfactionScore: faker.number.float({ min: 3.5, max: 5, fractionDigits: 1 }),
    successRate: faker.number.int({ min: 85, max: 99 }),
    uptime: faker.number.float({ min: 98, max: 99.9, fractionDigits: 1 }),
    errorsCount: faker.number.int({ min: 0, max: 10 })
  },
  integrations: faker.helpers.arrayElements(['slack', 'zendesk', 'salesforce', 'hubspot', 'intercom'], 2),
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent(),
  organizationId: 'org-1',
  userId: 'user-1'
}))

export const stableUsers: User[] = [
  {
    id: 'user-1',
    email: 'test@coherex.ai',
    name: 'Test User',
    role: 'admin',
    avatar: faker.image.avatar(),
    organizationId: 'org-1',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  },
  ...Array.from({ length: 9 }, (_, i) => ({
    id: `user-${i + 2}`,
    email: faker.internet.email().toLowerCase(),
    name: faker.person.fullName(),
    role: faker.helpers.arrayElement(['admin', 'manager', 'member'] as const),
    avatar: faker.image.avatar(),
    organizationId: 'org-1',
    createdAt: faker.date.past(),
    updatedAt: faker.date.recent()
  }))
]

export const stableOrganization: Organization = {
  id: 'org-1',
  name: 'coherex Demo',
  domain: 'coherex.ai',
  logo: faker.image.url(),
  plan: 'enterprise',
  settings: {
    allowedDomains: ['coherex.ai'],
    ssoEnabled: true,
    mfaRequired: false
  },
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent()
}

export const stableTeams: Team[] = Array.from({ length: 5 }, (_, i) => ({
  id: `team-${i + 1}`,
  name: faker.company.name() + ' Team',
  description: faker.lorem.sentence(),
  type: faker.helpers.arrayElement(['support', 'sales', 'operations'] as const),
  agentIds: faker.helpers.arrayElements(stableAgents.map(a => a.id), 3),
  memberIds: faker.helpers.arrayElements(stableUsers.map(u => u.id), 4),
  organizationId: 'org-1',
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent()
}))

// Predefined conversation templates for better categorization
const conversationTemplates = {
  issue: [
    "I'm having a problem with the login feature",
    "The app keeps crashing when I try to upload files",
    "There's an error message appearing on checkout",
    "Something is broken with the payment system",
    "I can't access my account, getting error 500"
  ],
  question: [
    "How do I reset my password?",
    "What are the pricing plans available?",
    "Can you help me understand how to use this feature?",
    "Where can I find the documentation?",
    "When will the new update be released?"
  ],
  bug: [
    "Found a bug in the navigation menu",
    "The search function has a glitch",
    "There's a visual bug on mobile devices",
    "Reporting a bug with the export functionality",
    "Bug report: notifications not working properly"
  ],
  feature: [
    "Feature request: add dark mode",
    "I'd like to request a new export format",
    "Can you add integration with Slack?",
    "Please add batch processing feature",
    "Would love to see real-time collaboration"
  ],
  support: [
    "Need help setting up my account",
    "Can you assist with the installation?",
    "I need support with the configuration",
    "Help me understand the best practices",
    "Technical support needed for deployment"
  ],
  sales: [
    "I'd like to upgrade my subscription",
    "What's the price for enterprise plan?",
    "Can I get a demo of the premium features?",
    "Interested in purchasing additional licenses",
    "Need a quote for annual subscription"
  ],
  feedback: [
    "Great product! Here's my feedback",
    "I have some suggestions for improvement",
    "My experience with the platform so far",
    "Here's what I think about the new update",
    "Feedback on the user interface"
  ]
}

export const stableConversations: Conversation[] = Array.from({ length: 50 }, (_, i) => {
  // Distribute conversations across categories
  const categories = Object.keys(conversationTemplates)
  const category = categories[i % categories.length]
  const templates = conversationTemplates[category as keyof typeof conversationTemplates]
  const lastMessage = faker.helpers.arrayElement(templates)
  
  const messageCount = faker.number.int({ min: 2, max: 20 })
  const conversationId = `conv-${i + 1}`
  const startTime = faker.date.recent({ days: 7 })
  
  // Generate messages array
  const messages: ConversationMessage[] = Array.from({ length: messageCount }, (_, msgIndex) => ({
    id: `${conversationId}-msg-${msgIndex + 1}`,
    conversationId,
    sender: msgIndex % 2 === 0 ? 'user' : 'agent',
    content: msgIndex === messageCount - 1 ? lastMessage : faker.lorem.sentence(),
    metadata: {},
    timestamp: new Date(startTime.getTime() + msgIndex * 60000)
  }))
  
  const user = faker.helpers.arrayElement(stableUsers)
  
  return {
    id: conversationId,
    title: faker.lorem.sentence(),
    status: faker.helpers.arrayElement(['active', 'resolved', 'escalated'] as const),
    channel: faker.helpers.arrayElement(['email', 'slack', 'teams', 'web-chat']),
    agentId: faker.helpers.arrayElement(stableAgents.map(a => a.id)),
    userId: user.id,
    user: {
      name: user.name,
      email: user.email,
      avatar: user.avatar
    },
    messages,
    lastMessage,
    messageCount,
    satisfaction: faker.helpers.maybe(() => faker.number.int({ min: 1, max: 5 })),
    tags: faker.helpers.arrayElements(['urgent', 'vip', 'technical', 'billing'], { min: 0, max: 2 }),
    metadata: {
      sentiment: faker.helpers.arrayElement(['positive', 'neutral', 'negative']),
      language: faker.helpers.arrayElement(['en', 'es', 'fr', 'de']),
      platform: faker.helpers.arrayElement(['web', 'mobile', 'desktop'])
    },
    organizationId: 'org-1',
    createdAt: startTime,
    updatedAt: new Date(startTime.getTime() + messageCount * 60000)
  }
})

export const stableKnowledgeSources: KnowledgeSource[] = Array.from({ length: 10 }, (_, i) => ({
  id: `ks-${i + 1}`,
  name: faker.company.name() + ' Knowledge Base',
  type: faker.helpers.arrayElement(['confluence', 'notion', 'google-drive', 'sharepoint', 'github', 'custom'] as const),
  status: faker.helpers.arrayElement(['connected', 'syncing', 'error', 'disconnected'] as const),
  description: faker.lorem.sentence(),
  config: {
    url: faker.internet.url(),
    apiKey: faker.string.alphanumeric(32),
    syncInterval: faker.helpers.arrayElement([300, 900, 1800, 3600])
  },
  documentsCount: faker.number.int({ min: 10, max: 1000 }),
  lastSynced: faker.date.recent(),
  organizationId: 'org-1',
  createdAt: faker.date.past(),
  updatedAt: faker.date.recent()
}))