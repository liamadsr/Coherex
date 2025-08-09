import { Sandbox } from '@e2b/code-interpreter'
import { supabase } from '@/lib/supabase/client'
import { e2bClient } from './client'
import { AgentRuntime } from './runtime'
import type { Database } from '@/lib/supabase/types'

type Agent = Database['public']['Tables']['agents']['Row']
type AgentSession = Database['public']['Tables']['agent_sessions']['Row']

export type ExecutionMode = 'ephemeral' | 'persistent' | 'hybrid'
export type SessionStatus = 'active' | 'idle' | 'hibernated' | 'stopped' | 'error'

interface SessionConfig {
  idle_timeout_minutes: number
  max_session_duration_hours: number
  auto_hibernate: boolean
  preserve_context: boolean
  max_context_messages: number
}

interface ConversationMessage {
  role: 'user' | 'assistant' | 'system'
  content: string
  timestamp: string
  metadata?: Record<string, any>
}

export class PersistentSandboxManager {
  private activeSandboxes: Map<string, Sandbox> = new Map() // sessionId -> Sandbox
  private sessionTimers: Map<string, NodeJS.Timeout> = new Map() // sessionId -> idle timer
  
  /**
   * Get or create a session for an agent based on its execution mode
   */
  async getOrCreateSession(
    agent: Agent,
    createNew: boolean = false
  ): Promise<AgentSession | null> {
    const executionMode = (agent.execution_mode || 'ephemeral') as ExecutionMode
    
    // Ephemeral mode doesn't use sessions
    if (executionMode === 'ephemeral') {
      return null
    }
    
    // Check for existing active session unless explicitly creating new
    if (!createNew) {
      const { data: existingSession } = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('agent_id', agent.id)
        .in('status', ['active', 'idle', 'hibernated'])
        .order('last_activity_at', { ascending: false })
        .limit(1)
        .single()
      
      if (existingSession) {
        // Resume hibernated session if needed
        if (existingSession.status === 'hibernated') {
          await this.resumeSession(existingSession)
        }
        return existingSession
      }
    }
    
    // Create new session
    return await this.createSession(agent)
  }
  
  /**
   * Create a new persistent session
   */
  async createSession(agent: Agent): Promise<AgentSession> {
    // Create sandbox
    const sandbox = await e2bClient.createSandbox(agent.id, {
      timeout: 3600, // 1 hour for persistent sessions
      metadata: { sessionType: 'persistent' }
    })
    
    // Set environment variables
    const envVars = this.getEnvironmentVariables(agent)
    await e2bClient.setEnvironmentVariables(sandbox, envVars)
    
    // Install required packages
    const packages = this.getRequiredPackages(agent)
    if (packages.length > 0) {
      await e2bClient.installPackages(sandbox, packages)
    }
    
    // Initialize the agent runtime in the sandbox
    await this.initializeAgentInSandbox(sandbox, agent)
    
    // Create database record
    const { data: session, error } = await supabase
      .from('agent_sessions')
      .insert({
        agent_id: agent.id,
        sandbox_id: sandbox.sandboxId,
        status: 'active' as SessionStatus,
        conversation_context: [],
        metadata: {
          model: agent.model,
          execution_mode: agent.execution_mode
        }
      })
      .select()
      .single()
    
    if (error || !session) {
      // Clean up sandbox if database insert fails
      await sandbox.kill()
      throw new Error('Failed to create session record')
    }
    
    // Store sandbox reference
    this.activeSandboxes.set(session.id, sandbox)
    
    // Set up idle timer
    this.resetIdleTimer(session.id, agent)
    
    // Log activity
    await this.logActivity(session.id, 'started', null, null)
    
    return session
  }
  
  /**
   * Execute in a persistent session
   */
  async executeInSession(
    sessionId: string,
    input: string,
    includeContext: boolean = true
  ): Promise<any> {
    // Try to get sandbox from memory first
    let sandbox = this.activeSandboxes.get(sessionId)
    
    // If not in memory, try to reconnect using stored sandbox_id
    if (!sandbox) {
      // Get session from database
      const { data: session } = await supabase
        .from('agent_sessions')
        .select('*, agents(*)')
        .eq('id', sessionId)
        .single()
      
      if (!session || !session.sandbox_id) {
        throw new Error('Session not found or sandbox ID missing')
      }
      
      if (session.status === 'stopped') {
        throw new Error('Session is stopped')
      }
      
      if (session.status === 'hibernated') {
        // Resume hibernated session
        await this.resumeSession(session)
        sandbox = this.activeSandboxes.get(sessionId)
      } else {
        // Try to reconnect to existing sandbox
        try {
          sandbox = await this.reconnectToSandbox(session.sandbox_id, session.agent_id)
          if (sandbox) {
            this.activeSandboxes.set(sessionId, sandbox)
            
            // Re-initialize the agent in the reconnected sandbox
            const agent = session.agents as unknown as Agent
            await this.initializeAgentInSandbox(
              sandbox, 
              agent, 
              session.conversation_context as ConversationMessage[]
            )
          }
        } catch (error) {
          console.error('Failed to reconnect to sandbox:', error)
          // If reconnection fails, create new sandbox
          const agent = session.agents as unknown as Agent
          sandbox = await this.createAndStoreSandbox(sessionId, agent, session)
        }
      }
    }
    
    if (!sandbox) {
      throw new Error('Failed to get or create sandbox for session')
    }
    
    // Get session and agent details
    const { data: session } = await supabase
      .from('agent_sessions')
      .select('*, agents(*)')
      .eq('id', sessionId)
      .single()
    
    if (!session || !session.agents) {
      throw new Error('Session or agent not found')
    }
    
    const agent = session.agents as unknown as Agent
    
    // Reset idle timer
    this.resetIdleTimer(sessionId, agent)
    
    // Prepare conversation context if needed
    const context = includeContext ? 
      (session.conversation_context as ConversationMessage[]) : []
    
    // Execute with context
    const code = this.generateContextualExecution(agent, input, context)
    const result = await e2bClient.executeCode(sandbox, code, 'python')
    
    // Update conversation context
    if (includeContext && result.success) {
      const newContext = [
        ...context,
        { role: 'user' as const, content: input, timestamp: new Date().toISOString() },
        { role: 'assistant' as const, content: result.output, timestamp: new Date().toISOString() }
      ]
      
      // Trim context if it exceeds max messages
      const sessionConfig = agent.session_config as SessionConfig
      const maxMessages = sessionConfig?.max_context_messages || 50
      const trimmedContext = newContext.slice(-maxMessages)
      
      await supabase
        .from('agent_sessions')
        .update({ 
          conversation_context: trimmedContext,
          execution_count: session.execution_count + 1
        })
        .eq('id', sessionId)
    }
    
    // Log activity
    await this.logActivity(sessionId, 'execution', input, result.output)
    
    return result
  }
  
  /**
   * Hibernate a session (preserve state but free resources)
   */
  async hibernateSession(sessionId: string): Promise<void> {
    const sandbox = this.activeSandboxes.get(sessionId)
    if (!sandbox) return
    
    // Save any necessary state before closing
    // In a real implementation, you might serialize the Python interpreter state
    
    // Close sandbox
    await sandbox.kill()
    this.activeSandboxes.delete(sessionId)
    
    // Clear idle timer
    const timer = this.sessionTimers.get(sessionId)
    if (timer) {
      clearTimeout(timer)
      this.sessionTimers.delete(sessionId)
    }
    
    // Update database
    await supabase
      .from('agent_sessions')
      .update({ 
        status: 'hibernated' as SessionStatus,
        hibernated_at: new Date().toISOString()
      })
      .eq('id', sessionId)
    
    await this.logActivity(sessionId, 'hibernated', null, null)
  }
  
  /**
   * Resume a hibernated session
   */
  async resumeSession(session: AgentSession): Promise<void> {
    // Get agent details
    const { data: agent } = await supabase
      .from('agents')
      .select('*')
      .eq('id', session.agent_id)
      .single()
    
    if (!agent) {
      throw new Error('Agent not found')
    }
    
    // Create new sandbox
    const sandbox = await e2bClient.createSandbox(agent.id, {
      timeout: 3600,
      metadata: { sessionType: 'persistent', resumed: true }
    })
    
    // Restore environment and packages
    const envVars = this.getEnvironmentVariables(agent)
    await e2bClient.setEnvironmentVariables(sandbox, envVars)
    
    const packages = this.getRequiredPackages(agent)
    if (packages.length > 0) {
      await e2bClient.installPackages(sandbox, packages)
    }
    
    // Restore agent with context
    await this.initializeAgentInSandbox(sandbox, agent, session.conversation_context as ConversationMessage[])
    
    // Update references
    this.activeSandboxes.set(session.id, sandbox)
    
    // Update database
    await supabase
      .from('agent_sessions')
      .update({ 
        status: 'active' as SessionStatus,
        sandbox_id: sandbox.sandboxId,
        hibernated_at: null
      })
      .eq('id', session.id)
    
    // Reset idle timer
    this.resetIdleTimer(session.id, agent)
    
    await this.logActivity(session.id, 'resumed', null, null)
  }
  
  /**
   * Stop a session completely
   */
  async stopSession(sessionId: string): Promise<void> {
    // Clean up sandbox
    const sandbox = this.activeSandboxes.get(sessionId)
    if (sandbox) {
      await sandbox.kill()
      this.activeSandboxes.delete(sessionId)
    }
    
    // Clear timer
    const timer = this.sessionTimers.get(sessionId)
    if (timer) {
      clearTimeout(timer)
      this.sessionTimers.delete(sessionId)
    }
    
    // Update database
    await supabase
      .from('agent_sessions')
      .update({ 
        status: 'stopped' as SessionStatus,
        stopped_at: new Date().toISOString()
      })
      .eq('id', sessionId)
    
    await this.logActivity(sessionId, 'stopped', null, null)
  }
  
  /**
   * Check and hibernate idle sessions
   */
  async checkIdleSessions(): Promise<void> {
    const { data: idleSessions } = await supabase
      .from('active_agent_sessions')
      .select('*')
      .eq('should_hibernate', true)
    
    if (idleSessions) {
      for (const session of idleSessions) {
        await this.hibernateSession(session.id)
      }
    }
  }
  
  /**
   * Initialize agent in sandbox with optional context
   */
  private async initializeAgentInSandbox(
    sandbox: Sandbox,
    agent: Agent,
    context: ConversationMessage[] = []
  ): Promise<void> {
    const initCode = `
import json
import os
import sys
from datetime import datetime

# Global agent configuration
AGENT_CONFIG = ${JSON.stringify(AgentRuntime.parseConfig(agent))}
CONVERSATION_CONTEXT = ${JSON.stringify(context)}

# Initialize LLM client
def init_llm():
    model = AGENT_CONFIG.get('model', 'gpt-4')
    if model.startswith('gpt'):
        from openai import OpenAI
        return OpenAI(api_key=os.environ.get('OPENAI_API_KEY')), 'openai'
    elif model.startswith('claude'):
        from anthropic import Anthropic
        return Anthropic(api_key=os.environ.get('ANTHROPIC_API_KEY')), 'anthropic'
    return None, None

CLIENT, PROVIDER = init_llm()

print(f"Agent {AGENT_CONFIG['name']} initialized in persistent session")
print(f"Context messages: {len(CONVERSATION_CONTEXT)}")
`
    
    await sandbox.runCode(initCode)
  }
  
  /**
   * Generate execution code with context
   */
  private generateContextualExecution(
    agent: Agent,
    input: string,
    context: ConversationMessage[]
  ): string {
    const config = AgentRuntime.parseConfig(agent)
    
    return `
# Execute with conversation context
def execute_with_context(user_input):
    messages = []
    
    # Add system prompt
    messages.append({
        "role": "system",
        "content": "${config.systemPrompt}"
    })
    
    # Add conversation history
    for msg in CONVERSATION_CONTEXT[-10:]:  # Last 10 messages for context
        messages.append({
            "role": msg["role"],
            "content": msg["content"]
        })
    
    # Add current input
    messages.append({
        "role": "user",
        "content": user_input
    })
    
    # Call LLM
    if PROVIDER == 'openai':
        response = CLIENT.chat.completions.create(
            model="${config.model}",
            messages=messages,
            temperature=${config.temperature},
            max_tokens=${config.maxTokens}
        )
        return response.choices[0].message.content
    elif PROVIDER == 'anthropic':
        # Convert to Anthropic format
        system = messages[0]["content"]
        conversation = messages[1:]
        
        response = CLIENT.messages.create(
            model="${config.model}",
            system=system,
            messages=conversation,
            temperature=${config.temperature},
            max_tokens=${config.maxTokens}
        )
        return response.content[0].text
    
    return "LLM provider not initialized"

# Execute
result = execute_with_context("""${input}""")
print(json.dumps({"success": True, "output": result}))
`
  }
  
  /**
   * Reset idle timer for a session
   */
  private resetIdleTimer(sessionId: string, agent: Agent): void {
    // Clear existing timer
    const existingTimer = this.sessionTimers.get(sessionId)
    if (existingTimer) {
      clearTimeout(existingTimer)
    }
    
    // Get timeout config
    const sessionConfig = agent.session_config as SessionConfig
    const timeoutMinutes = sessionConfig?.idle_timeout_minutes || 30
    
    // Set new timer
    const timer = setTimeout(async () => {
      await this.hibernateSession(sessionId)
    }, timeoutMinutes * 60 * 1000)
    
    this.sessionTimers.set(sessionId, timer)
  }
  
  /**
   * Get environment variables for agent
   */
  private getEnvironmentVariables(agent: Agent): Record<string, string> {
    const envVars: Record<string, string> = {}
    const model = agent.model || 'gpt-4'
    
    if (model.startsWith('gpt')) {
      if (process.env.OPENAI_API_KEY) {
        envVars.OPENAI_API_KEY = process.env.OPENAI_API_KEY
      }
    } else if (model.startsWith('claude')) {
      if (process.env.ANTHROPIC_API_KEY) {
        envVars.ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY
      }
    }
    
    return envVars
  }
  
  /**
   * Get required packages for agent
   */
  private getRequiredPackages(agent: Agent): string[] {
    const packages: string[] = []
    const model = agent.model || 'gpt-4'
    
    if (model.startsWith('gpt')) {
      packages.push('openai')
    } else if (model.startsWith('claude')) {
      packages.push('anthropic')
    }
    
    packages.push('requests', 'json5')
    return packages
  }
  
  /**
   * Log session activity
   */
  private async logActivity(
    sessionId: string,
    activityType: string,
    input: any,
    output: any
  ): Promise<void> {
    await supabase
      .from('session_activities')
      .insert({
        session_id: sessionId,
        activity_type: activityType,
        input: input ? { data: input } : null,
        output: output ? { data: output } : null
      })
  }
  
  /**
   * Get all active sessions
   */
  async getActiveSessions(): Promise<AgentSession[]> {
    const { data } = await supabase
      .from('agent_sessions')
      .select('*')
      .in('status', ['active', 'idle'])
      .order('last_activity_at', { ascending: false })
    
    return data || []
  }
  
  /**
   * Reconnect to an existing sandbox
   */
  private async reconnectToSandbox(
    sandboxId: string,
    agentId: string
  ): Promise<Sandbox | null> {
    try {
      // Use E2B's connect method to reconnect to existing sandbox
      const sandbox = await Sandbox.connect(sandboxId, {
        apiKey: process.env.E2B_API_KEY
      })
      
      console.log(`Successfully reconnected to sandbox ${sandboxId}`)
      return sandbox
    } catch (error) {
      console.error(`Failed to reconnect to sandbox ${sandboxId}:`, error)
      return null
    }
  }
  
  /**
   * Create new sandbox and update session
   */
  private async createAndStoreSandbox(
    sessionId: string,
    agent: Agent,
    session: any
  ): Promise<Sandbox> {
    // Create new sandbox
    const sandbox = await e2bClient.createSandbox(agent.id, {
      timeout: 3600,
      metadata: { sessionType: 'persistent', sessionId }
    })
    
    // Set environment variables
    const envVars = this.getEnvironmentVariables(agent)
    await e2bClient.setEnvironmentVariables(sandbox, envVars)
    
    // Install required packages
    const packages = this.getRequiredPackages(agent)
    if (packages.length > 0) {
      await e2bClient.installPackages(sandbox, packages)
    }
    
    // Initialize with existing context
    await this.initializeAgentInSandbox(
      sandbox,
      agent,
      session.conversation_context as ConversationMessage[]
    )
    
    // Update database with new sandbox ID
    await supabase
      .from('agent_sessions')
      .update({ 
        sandbox_id: sandbox.sandboxId,
        status: 'active' as SessionStatus
      })
      .eq('id', sessionId)
    
    // Store in memory
    this.activeSandboxes.set(sessionId, sandbox)
    
    return sandbox
  }
  
  /**
   * Clean up on shutdown
   */
  async shutdown(): Promise<void> {
    // Stop all active sessions
    for (const [sessionId, sandbox] of this.activeSandboxes) {
      await sandbox.kill()
      await this.stopSession(sessionId)
    }
    
    // Clear all timers
    for (const timer of this.sessionTimers.values()) {
      clearTimeout(timer)
    }
    
    this.activeSandboxes.clear()
    this.sessionTimers.clear()
  }
}

// Export singleton instance
export const sessionManager = new PersistentSandboxManager()