import { create } from 'zustand'
import { devtools, persist } from 'zustand/middleware'
import { immer } from 'zustand/middleware/immer'
import type { Agent, AgentTeam, Conversation, KnowledgeSource, Integration, AgentTemplate, AnalyticsData, Notification } from '@/types'

// Agent slice
interface AgentSlice {
  agents: Agent[]
  selectedAgent: Agent | null
  isLoadingAgents: boolean
  agentFilters: {
    status: string[]
    capabilities: string[]
    search: string
  }
  setAgents: (agents: Agent[]) => void
  addAgent: (agent: Agent) => void
  updateAgent: (id: string, updates: Partial<Agent>) => void
  deleteAgent: (id: string) => void
  selectAgent: (agent: Agent | null) => void
  setAgentFilters: (filters: Partial<AgentSlice['agentFilters']>) => void
  setLoadingAgents: (loading: boolean) => void
}

// Team slice
interface TeamSlice {
  teams: AgentTeam[]
  selectedTeam: AgentTeam | null
  isLoadingTeams: boolean
  setTeams: (teams: AgentTeam[]) => void
  addTeam: (team: AgentTeam) => void
  updateTeam: (id: string, updates: Partial<AgentTeam>) => void
  deleteTeam: (id: string) => void
  selectTeam: (team: AgentTeam | null) => void
  setLoadingTeams: (loading: boolean) => void
}

// Conversation slice
interface ConversationSlice {
  conversations: Conversation[]
  selectedConversation: Conversation | null
  isLoadingConversations: boolean
  conversationFilters: {
    status: string[]
    channel: string[]
    agentId: string | null
    search: string
  }
  setConversations: (conversations: Conversation[]) => void
  addConversation: (conversation: Conversation) => void
  updateConversation: (id: string, updates: Partial<Conversation>) => void
  selectConversation: (conversation: Conversation | null) => void
  setConversationFilters: (filters: Partial<ConversationSlice['conversationFilters']>) => void
  setLoadingConversations: (loading: boolean) => void
}

// Knowledge slice
interface KnowledgeSlice {
  knowledgeSources: KnowledgeSource[]
  selectedKnowledgeSource: KnowledgeSource | null
  isLoadingKnowledge: boolean
  setKnowledgeSources: (sources: KnowledgeSource[]) => void
  addKnowledgeSource: (source: KnowledgeSource) => void
  updateKnowledgeSource: (id: string, updates: Partial<KnowledgeSource>) => void
  deleteKnowledgeSource: (id: string) => void
  selectKnowledgeSource: (source: KnowledgeSource | null) => void
  setLoadingKnowledge: (loading: boolean) => void
}

// Integration slice
interface IntegrationSlice {
  integrations: Integration[]
  selectedIntegration: Integration | null
  isLoadingIntegrations: boolean
  setIntegrations: (integrations: Integration[]) => void
  updateIntegration: (id: string, updates: Partial<Integration>) => void
  selectIntegration: (integration: Integration | null) => void
  setLoadingIntegrations: (loading: boolean) => void
}

// Template slice
interface TemplateSlice {
  templates: AgentTemplate[]
  selectedTemplate: AgentTemplate | null
  isLoadingTemplates: boolean
  setTemplates: (templates: AgentTemplate[]) => void
  addTemplate: (template: AgentTemplate) => void
  updateTemplate: (id: string, updates: Partial<AgentTemplate>) => void
  deleteTemplate: (id: string) => void
  selectTemplate: (template: AgentTemplate | null) => void
  setLoadingTemplates: (loading: boolean) => void
}

// Analytics slice
interface AnalyticsSlice {
  analytics: AnalyticsData | null
  isLoadingAnalytics: boolean
  dateRange: { start: Date; end: Date }
  setAnalytics: (analytics: AnalyticsData) => void
  setDateRange: (range: { start: Date; end: Date }) => void
  setLoadingAnalytics: (loading: boolean) => void
}

// UI slice
interface UISlice {
  sidebarOpen: boolean
  aiAssistantOpen: boolean
  theme: 'light' | 'dark' | 'system'
  notifications: Notification[]
  toggleSidebar: () => void
  setSidebarOpen: (open: boolean) => void
  toggleAIAssistant: () => void
  setAIAssistantOpen: (open: boolean) => void
  setTheme: (theme: UISlice['theme']) => void
  addNotification: (notification: Notification) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

// Combined store type
export interface StoreState extends 
  AgentSlice, 
  TeamSlice, 
  ConversationSlice, 
  KnowledgeSlice, 
  IntegrationSlice, 
  TemplateSlice, 
  AnalyticsSlice, 
  UISlice {}

// Create the store
export const useStore = create<StoreState>()(
  devtools(
    persist(
      immer((set) => ({
        // Agent state
        agents: [],
        selectedAgent: null,
        isLoadingAgents: false,
        agentFilters: {
          status: [],
          capabilities: [],
          search: '',
        },
        setAgents: (agents) => set((state) => { state.agents = agents }),
        addAgent: (agent) => set((state) => { state.agents.push(agent) }),
        updateAgent: (id, updates) => set((state) => {
          const index = state.agents.findIndex(a => a.id === id)
          if (index !== -1) {
            state.agents[index] = { ...state.agents[index], ...updates }
          }
        }),
        deleteAgent: (id) => set((state) => {
          state.agents = state.agents.filter(a => a.id !== id)
          if (state.selectedAgent?.id === id) {
            state.selectedAgent = null
          }
        }),
        selectAgent: (agent) => set((state) => { state.selectedAgent = agent }),
        setAgentFilters: (filters) => set((state) => {
          state.agentFilters = { ...state.agentFilters, ...filters }
        }),
        setLoadingAgents: (loading) => set((state) => { state.isLoadingAgents = loading }),

        // Team state
        teams: [],
        selectedTeam: null,
        isLoadingTeams: false,
        setTeams: (teams) => set((state) => { state.teams = teams }),
        addTeam: (team) => set((state) => { state.teams.push(team) }),
        updateTeam: (id, updates) => set((state) => {
          const index = state.teams.findIndex(t => t.id === id)
          if (index !== -1) {
            state.teams[index] = { ...state.teams[index], ...updates }
          }
        }),
        deleteTeam: (id) => set((state) => {
          state.teams = state.teams.filter(t => t.id !== id)
          if (state.selectedTeam?.id === id) {
            state.selectedTeam = null
          }
        }),
        selectTeam: (team) => set((state) => { state.selectedTeam = team }),
        setLoadingTeams: (loading) => set((state) => { state.isLoadingTeams = loading }),

        // Conversation state
        conversations: [],
        selectedConversation: null,
        isLoadingConversations: false,
        conversationFilters: {
          status: [],
          channel: [],
          agentId: null,
          search: '',
        },
        setConversations: (conversations) => set((state) => { state.conversations = conversations }),
        addConversation: (conversation) => set((state) => { state.conversations.push(conversation) }),
        updateConversation: (id, updates) => set((state) => {
          const index = state.conversations.findIndex(c => c.id === id)
          if (index !== -1) {
            state.conversations[index] = { ...state.conversations[index], ...updates }
          }
        }),
        selectConversation: (conversation) => set((state) => { state.selectedConversation = conversation }),
        setConversationFilters: (filters) => set((state) => {
          state.conversationFilters = { ...state.conversationFilters, ...filters }
        }),
        setLoadingConversations: (loading) => set((state) => { state.isLoadingConversations = loading }),

        // Knowledge state
        knowledgeSources: [],
        selectedKnowledgeSource: null,
        isLoadingKnowledge: false,
        setKnowledgeSources: (sources) => set((state) => { state.knowledgeSources = sources }),
        addKnowledgeSource: (source) => set((state) => { state.knowledgeSources.push(source) }),
        updateKnowledgeSource: (id, updates) => set((state) => {
          const index = state.knowledgeSources.findIndex(k => k.id === id)
          if (index !== -1) {
            state.knowledgeSources[index] = { ...state.knowledgeSources[index], ...updates }
          }
        }),
        deleteKnowledgeSource: (id) => set((state) => {
          state.knowledgeSources = state.knowledgeSources.filter(k => k.id !== id)
          if (state.selectedKnowledgeSource?.id === id) {
            state.selectedKnowledgeSource = null
          }
        }),
        selectKnowledgeSource: (source) => set((state) => { state.selectedKnowledgeSource = source }),
        setLoadingKnowledge: (loading) => set((state) => { state.isLoadingKnowledge = loading }),

        // Integration state
        integrations: [],
        selectedIntegration: null,
        isLoadingIntegrations: false,
        setIntegrations: (integrations) => set((state) => { state.integrations = integrations }),
        updateIntegration: (id, updates) => set((state) => {
          const index = state.integrations.findIndex(i => i.id === id)
          if (index !== -1) {
            state.integrations[index] = { ...state.integrations[index], ...updates }
          }
        }),
        selectIntegration: (integration) => set((state) => { state.selectedIntegration = integration }),
        setLoadingIntegrations: (loading) => set((state) => { state.isLoadingIntegrations = loading }),

        // Template state
        templates: [],
        selectedTemplate: null,
        isLoadingTemplates: false,
        setTemplates: (templates) => set((state) => { state.templates = templates }),
        addTemplate: (template) => set((state) => { state.templates.push(template) }),
        updateTemplate: (id, updates) => set((state) => {
          const index = state.templates.findIndex((t: AgentTemplate) => t.id === id)
          if (index !== -1) {
            state.templates[index] = { ...state.templates[index], ...updates }
          }
        }),
        deleteTemplate: (id) => set((state) => {
          state.templates = state.templates.filter((t: AgentTemplate) => t.id !== id)
          if (state.selectedTemplate?.id === id) {
            state.selectedTemplate = null
          }
        }),
        selectTemplate: (template) => set((state) => { state.selectedTemplate = template }),
        setLoadingTemplates: (loading) => set((state) => { state.isLoadingTemplates = loading }),

        // Analytics state
        analytics: null,
        isLoadingAnalytics: false,
        dateRange: {
          start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
          end: new Date(),
        },
        setAnalytics: (analytics) => set((state) => { state.analytics = analytics }),
        setDateRange: (range) => set((state) => { state.dateRange = range }),
        setLoadingAnalytics: (loading) => set((state) => { state.isLoadingAnalytics = loading }),

        // UI state
        sidebarOpen: true,
        aiAssistantOpen: false,
        theme: 'system',
        notifications: [],
        toggleSidebar: () => set((state) => { state.sidebarOpen = !state.sidebarOpen }),
        setSidebarOpen: (open) => set((state) => { state.sidebarOpen = open }),
        toggleAIAssistant: () => set((state) => { state.aiAssistantOpen = !state.aiAssistantOpen }),
        setAIAssistantOpen: (open) => set((state) => { state.aiAssistantOpen = open }),
        setTheme: (theme) => set((state) => { state.theme = theme }),
        addNotification: (notification) => set((state) => { state.notifications.push(notification) }),
        removeNotification: (id) => set((state) => {
          state.notifications = state.notifications.filter(n => n.id !== id)
        }),
        clearNotifications: () => set((state) => { state.notifications = [] }),
      })),
      {
        name: 'coherex-store',
        partialize: (state) => ({
          // Only persist UI preferences and filters
          sidebarOpen: state.sidebarOpen,
          aiAssistantOpen: state.aiAssistantOpen,
          theme: state.theme,
          agentFilters: state.agentFilters,
          conversationFilters: state.conversationFilters,
        }),
      }
    ),
    {
      name: 'coherexStore',
    }
  )
)

// Selectors
export const useAgents = () => useStore((state) => ({
  agents: state.agents,
  selectedAgent: state.selectedAgent,
  isLoading: state.isLoadingAgents,
  filters: state.agentFilters,
}))

export const useTeams = () => useStore((state) => ({
  teams: state.teams,
  selectedTeam: state.selectedTeam,
  isLoading: state.isLoadingTeams,
}))

export const useConversations = () => useStore((state) => ({
  conversations: state.conversations,
  selectedConversation: state.selectedConversation,
  isLoading: state.isLoadingConversations,
  filters: state.conversationFilters,
}))

export const useUI = () => useStore((state) => ({
  sidebarOpen: state.sidebarOpen,
  aiAssistantOpen: state.aiAssistantOpen,
  theme: state.theme,
  notifications: state.notifications,
  toggleSidebar: state.toggleSidebar,
  setSidebarOpen: state.setSidebarOpen,
  toggleAIAssistant: state.toggleAIAssistant,
  setAIAssistantOpen: state.setAIAssistantOpen,
  setTheme: state.setTheme,
}))