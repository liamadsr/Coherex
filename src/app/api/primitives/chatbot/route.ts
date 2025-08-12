import { openai } from "@ai-sdk/openai"
import { convertToModelMessages, streamText, tool, UIMessage } from "ai"
import { z } from "zod"
import { createRouteHandlerClient } from '@/lib/supabase/api-client-production'
import { NextRequest } from 'next/server'

export const maxDuration = 30

export async function POST(req: NextRequest) {
  const { supabase } = await createRouteHandlerClient(req)
  const { messages }: { messages: UIMessage[] } = await req.json()

  const result = streamText({
    model: openai("gpt-4.1-nano"),
    system:
      `You are a helpful AI assistant specialized in creating and managing AI agents. You can:
      - Create AI agents based on user requirements
      - List and provide information about existing agents
      - Execute agents with test inputs
      - Get current date and time information
      
      When users ask you to create an agent:
      1. Understand their requirements
      2. Determine the appropriate agent type (data_processor, analyzer, chatbot, automation, or custom)
      3. Use the createAgent tool to generate and save it
      4. Provide the link to view/test the created agent
      
      Example interactions:
      - "Create an agent that analyzes CSV files" → Create an analyzer agent
      - "I need something to monitor Slack messages" → Create an automation agent for Slack monitoring
      - "Build a customer support bot" → Create a chatbot agent
      - "Show me my agents" → Use listAgents tool
      - "Run agent [id] with input [data]" → Use executeAgent tool
      
      Always be helpful and guide users through the agent creation process.`,
    messages: convertToModelMessages(messages),
    tools: {
      getTime: tool({
        description: "Get the current time in a specific timezone",
        inputSchema: z.object({
          timezone: z
            .string()
            .describe("A valid IANA timezone, e.g. 'Europe/Paris'"),
        }),
        execute: async ({ timezone }) => {
          try {
            const now = new Date()
            const time = now.toLocaleString("en-US", {
              timeZone: timezone,
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              hour12: false,
            })

            return { time, timezone }
          } catch {
            return { error: "Invalid timezone format." }
          }
        },
      }),
      createAgent: tool({
        description: "Create a new AI agent based on user requirements",
        inputSchema: z.object({
          name: z.string().describe("Name for the agent"),
          description: z.string().describe("What the agent should do"),
          type: z.enum(['data_processor', 'analyzer', 'chatbot', 'automation', 'custom'])
            .describe("Type of agent based on its primary function"),
          model: z.string().optional().default('gpt-4-turbo-preview')
            .describe("AI model to use"),
          systemPrompt: z.string().optional()
            .describe("System instructions for the agent"),
          capabilities: z.array(z.string()).optional()
            .describe("List of capabilities or tools the agent should have"),
        }),
        execute: async ({ name, description, type, model, systemPrompt, capabilities }) => {
          try {
            // Create agent configuration
            const config = {
              name,
              type,
              model,
              temperature: 0.7,
              maxTokens: 2000,
              systemPrompt: systemPrompt || `You are ${name}. ${description}`,
              tools: capabilities?.map(cap => ({
                name: cap.toLowerCase().replace(/\s+/g, '_'),
                description: cap,
                parameters: {}
              })) || [],
              dataSources: [],
              outputFormat: 'json' as const,
              settings: {}
            }

            // Save to database
            const { data: agent, error } = await supabase
              .from('agents')
              .insert({
                name,
                description,
                config,
                status: 'draft',
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString()
              })
              .select()
              .single()

            if (error) {
              return { 
                success: false, 
                error: `Failed to create agent: ${error.message}` 
              }
            }

            return {
              success: true,
              agent: {
                id: agent.id,
                name: agent.name,
                description: agent.description,
                status: agent.status,
                type: config.type,
                model: config.model
              },
              message: `Successfully created agent "${name}"! You can now test it or configure it further.`,
              viewUrl: `/agents/${agent.id}`
            }
          } catch (error) {
            return {
              success: false,
              error: `Failed to create agent: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          }
        },
      }),
      listAgents: tool({
        description: "List all existing agents",
        inputSchema: z.object({
          status: z.enum(['all', 'active', 'draft', 'inactive']).optional().default('all')
            .describe("Filter agents by status")
        }),
        execute: async ({ status }) => {
          try {
            let query = supabase.from('agents').select('*').order('created_at', { ascending: false })
            
            if (status !== 'all') {
              query = query.eq('status', status)
            }

            const { data: agents, error } = await query

            if (error) {
              return {
                success: false,
                error: `Failed to fetch agents: ${error.message}`
              }
            }

            return {
              success: true,
              agents: agents?.map(agent => ({
                id: agent.id,
                name: agent.name,
                description: agent.description,
                status: agent.status,
                type: (agent.config as any)?.type || 'custom',
                createdAt: agent.created_at
              })) || [],
              count: agents?.length || 0,
              message: agents?.length ? 
                `Found ${agents.length} agent${agents.length === 1 ? '' : 's'}` :
                'No agents found. Would you like me to help you create one?'
            }
          } catch (error) {
            return {
              success: false,
              error: `Failed to list agents: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          }
        },
      }),
      executeAgent: tool({
        description: "Execute an agent with given input",
        inputSchema: z.object({
          agentId: z.string().describe("ID of the agent to execute"),
          input: z.string().describe("Input data for the agent")
        }),
        execute: async ({ agentId, input }) => {
          try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'}/api/agents/${agentId}/execute`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({ input, options: {} })
            })

            const result = await response.json()

            if (!response.ok) {
              return {
                success: false,
                error: result.error || 'Failed to execute agent'
              }
            }

            return {
              success: true,
              executionId: result.executionId,
              output: result.output,
              duration: result.duration,
              message: 'Agent executed successfully',
              logs: result.logs
            }
          } catch (error) {
            return {
              success: false,
              error: `Failed to execute agent: ${error instanceof Error ? error.message : 'Unknown error'}`
            }
          }
        },
      }),
      getCurrentDate: tool({
        description: "Get the current date and time with timezone information",
        inputSchema: z.object({}),
        execute: async () => {
          const now = new Date()
          return {
            timestamp: now.getTime(),
            iso: now.toISOString(),
            local: now.toLocaleString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
              timeZoneName: "short",
            }),
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
            utc: now.toUTCString(),
          }
        },
      }),
    },
  })

  return result.toUIMessageStreamResponse()
}
