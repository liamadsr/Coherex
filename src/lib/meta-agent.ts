import { OrchestratorResponse } from '@/types'

// Agent configuration constants from the existing agent creation form
export const PERSONALITY_TRAITS = [
  { id: 'professional', label: 'Professional' },
  { id: 'friendly', label: 'Friendly' },
  { id: 'technical', label: 'Technical' },
  { id: 'empathetic', label: 'Empathetic' },
  { id: 'analytical', label: 'Analytical' },
  { id: 'creative', label: 'Creative' },
  { id: 'concise', label: 'Concise' },
  { id: 'detailed', label: 'Detailed' },
]

export const CAPABILITIES = [
  { id: 'customer-support', label: 'Customer Support' },
  { id: 'sales', label: 'Sales & Lead Generation' },
  { id: 'data-analysis', label: 'Data Analysis' },
  { id: 'content-creation', label: 'Content Creation' },
  { id: 'code-review', label: 'Code Review' },
  { id: 'research', label: 'Research & Insights' },
  { id: 'scheduling', label: 'Scheduling & Calendar' },
  { id: 'translation', label: 'Translation' },
]

export const CHANNELS = [
  { id: 'email', label: 'Email' },
  { id: 'slack', label: 'Slack' },
  { id: 'web-chat', label: 'Web Chat' },
  { id: 'phone', label: 'Phone' },
  { id: 'api', label: 'API' },
]

export const AI_MODELS = [
  { id: 'gpt-4', label: 'GPT-4', description: 'Most capable model for complex tasks' },
  { id: 'gpt-3.5-turbo', label: 'GPT-3.5 Turbo', description: 'Fast and efficient for most tasks' },
  { id: 'claude-3', label: 'Claude 3', description: 'Excellent for analysis and reasoning' },
  { id: 'gemini-pro', label: 'Gemini Pro', description: 'Google\'s most capable model' },
]

// Types for meta agent functionality
export interface AgentUseCase {
  type: string
  description: string
  suggestedPersonality: string[]
  suggestedCapabilities: string[]
  suggestedChannels: string[]
  suggestedModel: string
  temperature: number
  maxTokens: number
}

export interface SystemPromptTemplate {
  name: string
  description: string
  template: string
  variables: string[]
}

export interface MetaAgentSuggestion {
  confidence: number
  reasoning: string
  suggestions: {
    personality: string[]
    capabilities: string[]
    channels: string[]
    model: string
    temperature: number
    maxTokens: number
    systemPrompt: string
  }
}

// Predefined use cases with optimal configurations
export const AGENT_USE_CASES: AgentUseCase[] = [
  {
    type: 'customer-support',
    description: 'Handle customer inquiries, troubleshooting, and support tickets',
    suggestedPersonality: ['professional', 'empathetic', 'friendly'],
    suggestedCapabilities: ['customer-support'],
    suggestedChannels: ['email', 'web-chat', 'slack'],
    suggestedModel: 'gpt-4',
    temperature: 0.3,
    maxTokens: 1500,
  },
  {
    type: 'sales-assistant',
    description: 'Generate leads, qualify prospects, and assist with sales processes',
    suggestedPersonality: ['professional', 'friendly', 'analytical'],
    suggestedCapabilities: ['sales', 'research'],
    suggestedChannels: ['email', 'web-chat', 'phone'],
    suggestedModel: 'gpt-4',
    temperature: 0.5,
    maxTokens: 2000,
  },
  {
    type: 'content-creator',
    description: 'Create blog posts, marketing copy, and creative content',
    suggestedPersonality: ['creative', 'detailed', 'professional'],
    suggestedCapabilities: ['content-creation', 'research'],
    suggestedChannels: ['api', 'web-chat'],
    suggestedModel: 'gpt-4',
    temperature: 0.8,
    maxTokens: 3000,
  },
  {
    type: 'data-analyst',
    description: 'Analyze data, generate reports, and provide insights',
    suggestedPersonality: ['analytical', 'technical', 'detailed'],
    suggestedCapabilities: ['data-analysis', 'research'],
    suggestedChannels: ['api', 'email'],
    suggestedModel: 'claude-3',
    temperature: 0.2,
    maxTokens: 2500,
  },
  {
    type: 'code-reviewer',
    description: 'Review code, suggest improvements, and ensure best practices',
    suggestedPersonality: ['technical', 'analytical', 'detailed'],
    suggestedCapabilities: ['code-review', 'research'],
    suggestedChannels: ['api', 'slack'],
    suggestedModel: 'gpt-4',
    temperature: 0.1,
    maxTokens: 2000,
  },
  {
    type: 'scheduler',
    description: 'Manage calendars, schedule meetings, and coordinate appointments',
    suggestedPersonality: ['professional', 'concise', 'friendly'],
    suggestedCapabilities: ['scheduling'],
    suggestedChannels: ['email', 'slack', 'web-chat'],
    suggestedModel: 'gpt-3.5-turbo',
    temperature: 0.3,
    maxTokens: 1000,
  },
]

// System prompt templates for different agent types
export const SYSTEM_PROMPT_TEMPLATES: SystemPromptTemplate[] = [
  {
    name: 'Customer Support Agent',
    description: 'Professional customer service representative',
    template: `You are a professional customer support agent for {company_name}. Your role is to:

1. Provide helpful, accurate, and timely responses to customer inquiries
2. Maintain a {personality_tone} and empathetic tone in all interactions
3. Escalate complex issues to human agents when necessary
4. Follow company policies and procedures

Key guidelines:
- Always greet customers warmly and professionally
- Listen carefully to understand their concerns
- Provide clear, step-by-step solutions when possible
- Ask clarifying questions if needed
- Thank customers for their patience and business

Remember: Your goal is to resolve customer issues efficiently while maintaining a positive customer experience.`,
    variables: ['company_name', 'personality_tone'],
  },
  {
    name: 'Sales Assistant',
    description: 'Engaging sales and lead generation agent',
    template: `You are a {personality_tone} sales assistant for {company_name}. Your primary objectives are to:

1. Qualify leads and understand prospect needs
2. Present relevant products/services that match their requirements
3. Build rapport and trust with potential customers
4. Guide prospects through the sales funnel
5. Schedule demos or meetings with sales representatives

Sales approach:
- Ask open-ended questions to understand pain points
- Listen actively and respond with relevant solutions
- Provide value before asking for anything in return
- Handle objections professionally and empathetically
- Always follow up appropriately

Remember: Focus on helping prospects solve their problems rather than just selling products.`,
    variables: ['company_name', 'personality_tone'],
  },
  {
    name: 'Content Creator',
    description: 'Creative content generation specialist',
    template: `You are a {personality_tone} content creator specializing in {content_type}. Your role is to:

1. Create engaging, high-quality content that resonates with the target audience
2. Maintain brand voice and consistency across all content
3. Research topics thoroughly to ensure accuracy and relevance
4. Optimize content for SEO and engagement
5. Adapt writing style based on platform and audience

Content guidelines:
- Write compelling headlines and introductions
- Use clear, concise language appropriate for the audience
- Include relevant examples and case studies
- Ensure all content is original and plagiarism-free
- Follow brand guidelines and tone of voice

Remember: Great content educates, entertains, or inspires while serving the audience's needs.`,
    variables: ['personality_tone', 'content_type'],
  },
  {
    name: 'Data Analyst',
    description: 'Technical data analysis and insights specialist',
    template: `You are a {personality_tone} data analyst with expertise in {analysis_domain}. Your responsibilities include:

1. Analyzing complex datasets to identify patterns and trends
2. Creating clear, actionable insights from data
3. Presenting findings in an accessible, non-technical manner
4. Recommending data-driven solutions and strategies
5. Ensuring data accuracy and methodology transparency

Analysis approach:
- Start with clear problem definition and objectives
- Use appropriate statistical methods and tools
- Validate findings through multiple approaches when possible
- Present results with appropriate context and limitations
- Provide actionable recommendations based on insights

Remember: Your goal is to transform raw data into valuable business intelligence that drives informed decision-making.`,
    variables: ['personality_tone', 'analysis_domain'],
  },
]

/**
 * Generate agent configuration suggestions based on use case description
 */
export function generateAgentSuggestions(useCase: string, description?: string): MetaAgentSuggestion {
  const normalizedUseCase = useCase.toLowerCase()
  
  // Find matching predefined use case
  const matchingUseCase = AGENT_USE_CASES.find(uc => 
    normalizedUseCase.includes(uc.type.replace('-', ' ')) ||
    normalizedUseCase.includes(uc.type)
  )

  if (matchingUseCase) {
    return {
      confidence: 0.9,
      reasoning: `Based on the "${matchingUseCase.type}" use case, I recommend this configuration for optimal performance.`,
      suggestions: {
        personality: matchingUseCase.suggestedPersonality,
        capabilities: matchingUseCase.suggestedCapabilities,
        channels: matchingUseCase.suggestedChannels,
        model: matchingUseCase.suggestedModel,
        temperature: matchingUseCase.temperature,
        maxTokens: matchingUseCase.maxTokens,
        systemPrompt: generateSystemPrompt(matchingUseCase.type, {
          company_name: '[Your Company Name]',
          personality_tone: matchingUseCase.suggestedPersonality.join(', '),
        }),
      },
    }
  }

  // Fallback suggestions for unknown use cases
  return {
    confidence: 0.6,
    reasoning: 'Based on general best practices, here are some recommended starting configurations.',
    suggestions: {
      personality: ['professional', 'friendly'],
      capabilities: ['customer-support'],
      channels: ['web-chat', 'email'],
      model: 'gpt-4',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: 'You are a helpful AI assistant. Be professional, accurate, and helpful in all your responses.',
    },
  }
}

/**
 * Generate system prompt based on agent type and variables
 */
export function generateSystemPrompt(agentType: string, variables: Record<string, string> = {}): string {
  const template = SYSTEM_PROMPT_TEMPLATES.find(t => 
    t.name.toLowerCase().includes(agentType.replace('-', ' ')) ||
    agentType.includes(t.name.toLowerCase().replace(' ', '-'))
  )

  if (!template) {
    return 'You are a helpful AI assistant. Be professional, accurate, and helpful in all your responses.'
  }

  let prompt = template.template
  
  // Replace template variables
  Object.entries(variables).forEach(([key, value]) => {
    prompt = prompt.replace(new RegExp(`{${key}}`, 'g'), value)
  })

  // Replace any remaining variables with placeholders
  template.variables.forEach(variable => {
    if (!variables[variable]) {
      prompt = prompt.replace(new RegExp(`{${variable}}`, 'g'), `[${variable.replace('_', ' ').toUpperCase()}]`)
    }
  })

  return prompt
}

/**
 * Get capability recommendations based on selected personality traits
 */
export function getCapabilityRecommendations(personalityTraits: string[]): string[] {
  const recommendations: string[] = []

  if (personalityTraits.includes('empathetic') || personalityTraits.includes('friendly')) {
    recommendations.push('customer-support')
  }
  
  if (personalityTraits.includes('analytical') || personalityTraits.includes('technical')) {
    recommendations.push('data-analysis', 'code-review')
  }
  
  if (personalityTraits.includes('creative')) {
    recommendations.push('content-creation')
  }
  
  if (personalityTraits.includes('professional')) {
    recommendations.push('sales', 'scheduling')
  }
  
  if (personalityTraits.includes('detailed')) {
    recommendations.push('research')
  }

  return [...new Set(recommendations)] // Remove duplicates
}

/**
 * Get channel recommendations based on capabilities
 */
export function getChannelRecommendations(capabilities: string[]): string[] {
  const recommendations: string[] = []

  if (capabilities.includes('customer-support')) {
    recommendations.push('email', 'web-chat', 'phone')
  }
  
  if (capabilities.includes('sales')) {
    recommendations.push('email', 'web-chat', 'phone')
  }
  
  if (capabilities.includes('data-analysis') || capabilities.includes('code-review')) {
    recommendations.push('api', 'email')
  }
  
  if (capabilities.includes('content-creation')) {
    recommendations.push('api', 'web-chat')
  }
  
  if (capabilities.includes('scheduling')) {
    recommendations.push('email', 'slack', 'web-chat')
  }

  return [...new Set(recommendations)] // Remove duplicates
}

/**
 * Get model recommendations based on capabilities and complexity
 */
export function getModelRecommendations(capabilities: string[]): { model: string; reasoning: string } {
  const complexCapabilities = ['data-analysis', 'code-review', 'research']
  const creativeCapabilities = ['content-creation']
  const standardCapabilities = ['customer-support', 'sales', 'scheduling', 'translation']

  if (capabilities.some(cap => complexCapabilities.includes(cap))) {
    return {
      model: 'gpt-4',
      reasoning: 'GPT-4 is recommended for complex analytical and technical tasks requiring advanced reasoning.'
    }
  }
  
  if (capabilities.some(cap => creativeCapabilities.includes(cap))) {
    return {
      model: 'gpt-4',
      reasoning: 'GPT-4 provides the best creative writing and content generation capabilities.'
    }
  }
  
  if (capabilities.some(cap => standardCapabilities.includes(cap))) {
    return {
      model: 'gpt-3.5-turbo',
      reasoning: 'GPT-3.5 Turbo offers excellent performance for standard conversational tasks at lower cost.'
    }
  }

  return {
    model: 'gpt-4',
    reasoning: 'GPT-4 is recommended as the default choice for versatile agent capabilities.'
  }
}

/**
 * Parse AI response and extract structured suggestions
 */
export function parseAIResponseToSuggestions(response: string): Partial<OrchestratorResponse> {
  const suggestions: Partial<OrchestratorResponse> = {
    response,
    suggestedConfig: {
      personality: [],
      capabilities: [],
      integrations: []
    },
    nextQuestions: []
  }

  // Extract personality traits
  PERSONALITY_TRAITS.forEach(trait => {
    if (response.toLowerCase().includes(trait.label.toLowerCase()) || 
        response.toLowerCase().includes(trait.id)) {
      suggestions.suggestedConfig!.personality.push(trait.id)
    }
  })

  // Extract capabilities
  CAPABILITIES.forEach(capability => {
    if (response.toLowerCase().includes(capability.label.toLowerCase()) || 
        response.toLowerCase().includes(capability.id.replace('-', ' '))) {
      suggestions.suggestedConfig!.capabilities.push(capability.id)
    }
  })

  // Extract channels/integrations
  CHANNELS.forEach(channel => {
    if (response.toLowerCase().includes(channel.label.toLowerCase()) || 
        response.toLowerCase().includes(channel.id.replace('-', ' '))) {
      suggestions.suggestedConfig!.integrations.push(channel.id)
    }
  })

  // Extract questions (lines ending with ?)
  const questionMatches = response.match(/[^.!?]*\?/g)
  if (questionMatches) {
    suggestions.nextQuestions = questionMatches
      .map(q => q.trim())
      .filter(q => q.length > 10)
      .slice(0, 3) // Limit to 3 questions
  }

  return suggestions
}

/**
 * Validate agent configuration and provide recommendations
 */
export function validateAgentConfiguration(config: {
  personality: string[]
  capabilities: string[]
  channels: string[]
  model: string
  temperature: number
  maxTokens: number
}): { isValid: boolean; warnings: string[]; suggestions: string[] } {
  const warnings: string[] = []
  const suggestions: string[] = []

  // Check personality-capability alignment
  if (config.personality.includes('technical') && !config.capabilities.some(cap => 
    ['code-review', 'data-analysis'].includes(cap))) {
    suggestions.push('Consider adding technical capabilities like code review or data analysis for a technical personality.')
  }

  if (config.personality.includes('creative') && !config.capabilities.includes('content-creation')) {
    suggestions.push('Consider adding content creation capability for a creative personality.')
  }

  // Check model-capability alignment
  if (config.capabilities.some(cap => ['data-analysis', 'code-review'].includes(cap)) && 
      config.model === 'gpt-3.5-turbo') {
    warnings.push('GPT-4 is recommended for complex analytical tasks.')
  }

  // Check temperature settings
  if (config.capabilities.includes('data-analysis') && config.temperature > 0.3) {
    warnings.push('Lower temperature (0.1-0.3) is recommended for analytical tasks to ensure consistency.')
  }

  if (config.capabilities.includes('content-creation') && config.temperature < 0.5) {
    suggestions.push('Higher temperature (0.7-0.9) might improve creativity for content creation.')
  }

  // Check token limits
  if (config.capabilities.includes('content-creation') && config.maxTokens < 2000) {
    suggestions.push('Consider increasing max tokens to 2000+ for content creation tasks.')
  }

  return {
    isValid: warnings.length === 0,
    warnings,
    suggestions
  }
}
