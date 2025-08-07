import { openai } from '@ai-sdk/openai'
import { anthropic } from '@ai-sdk/anthropic'
import { streamText, convertToCoreMessages } from 'ai'
import { NextRequest } from 'next/server'
import { OrchestratorResponse } from '@/types'

// System prompt for the meta agent
const META_AGENT_SYSTEM_PROMPT = `You are a Meta Agent - an AI assistant specialized in helping users design, configure, and implement other AI agents for the Coherex platform.

Your primary responsibilities:
1. **Agent Design Consultation**: Help users conceptualize and design AI agents for specific use cases
2. **Configuration Recommendations**: Suggest optimal personality traits, capabilities, and integrations
3. **System Prompt Generation**: Create effective system prompts for new agents
4. **Best Practices Guidance**: Provide recommendations based on AI agent implementation best practices

Available personality traits: professional, friendly, technical, empathetic, analytical, creative, concise, detailed
Available capabilities: customer-support, sales, data-analysis, content-creation, code-review, research, scheduling, translation
Available channels: email, slack, web-chat, phone, api
Available models: gpt-4, gpt-3.5-turbo, claude-3, gemini-pro

When helping users, always:
- Ask clarifying questions to understand their specific needs
- Provide concrete, actionable recommendations
- Suggest appropriate personality traits and capabilities
- Recommend suitable communication channels
- Generate system prompts that are clear and effective
- Offer next steps or follow-up questions

Format your responses to include:
1. A conversational response addressing the user's question
2. Specific configuration suggestions when appropriate
3. Follow-up questions to gather more information

Be helpful, knowledgeable, and focused on practical implementation guidance.`

export async function POST(req: NextRequest) {
  try {
    const { messages, model = 'gpt-4' } = await req.json()

    // Validate required environment variables
    if (!process.env.OPENAI_API_KEY && !process.env.ANTHROPIC_API_KEY) {
      return new Response(
        JSON.stringify({ 
          error: 'No AI provider API keys configured. Please set OPENAI_API_KEY or ANTHROPIC_API_KEY in your environment variables.' 
        }),
        { 
          status: 500,
          headers: { 'Content-Type': 'application/json' }
        }
      )
    }

    // Select AI provider based on model
    let aiProvider
    if (model.startsWith('claude')) {
      if (!process.env.ANTHROPIC_API_KEY) {
        return new Response(
          JSON.stringify({ 
            error: 'Anthropic API key not configured. Please set ANTHROPIC_API_KEY in your environment variables.' 
          }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      aiProvider = anthropic(model)
    } else {
      if (!process.env.OPENAI_API_KEY) {
        return new Response(
          JSON.stringify({ 
            error: 'OpenAI API key not configured. Please set OPENAI_API_KEY in your environment variables.' 
          }),
          { 
            status: 500,
            headers: { 'Content-Type': 'application/json' }
          }
        )
      }
      aiProvider = openai(model)
    }

    // Convert messages to the format expected by the AI SDK
    const coreMessages = convertToCoreMessages(messages)

    // Create streaming response
    const result = await streamText({
      model: aiProvider,
      system: META_AGENT_SYSTEM_PROMPT,
      messages: coreMessages,
      temperature: 0.7,
      maxTokens: 1000,
    })

    // Return streaming response
    return result.toDataStreamResponse()

  } catch (error) {
    console.error('Meta agent chat error:', error)
    
    return new Response(
      JSON.stringify({ 
        error: 'Failed to process chat request. Please try again.' 
      }),
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    )
  }
}

// Helper function to parse agent suggestions from AI response
export function parseAgentSuggestions(response: string): Partial<OrchestratorResponse> {
  // This function can be used by the frontend to extract structured data
  // from the AI response for form auto-population
  
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
  const personalityMatches = response.match(/personality[^:]*:?\s*([^.\n]*)/gi)
  if (personalityMatches) {
    const traits = ['professional', 'friendly', 'technical', 'empathetic', 'analytical', 'creative', 'concise', 'detailed']
    traits.forEach(trait => {
      if (response.toLowerCase().includes(trait)) {
        suggestions.suggestedConfig!.personality.push(trait)
      }
    })
  }

  // Extract capabilities
  const capabilityMatches = response.match(/capabilit[^:]*:?\s*([^.\n]*)/gi)
  if (capabilityMatches) {
    const capabilities = ['customer-support', 'sales', 'data-analysis', 'content-creation', 'code-review', 'research', 'scheduling', 'translation']
    capabilities.forEach(capability => {
      if (response.toLowerCase().includes(capability.replace('-', ' '))) {
        suggestions.suggestedConfig!.capabilities.push(capability)
      }
    })
  }

  // Extract integrations/channels
  const integrations = ['email', 'slack', 'web-chat', 'phone', 'api']
  integrations.forEach(integration => {
    if (response.toLowerCase().includes(integration.replace('-', ' '))) {
      suggestions.suggestedConfig!.integrations.push(integration)
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
