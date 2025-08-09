import { Sandbox } from '@e2b/code-interpreter'

// E2B API Key from environment
const E2B_API_KEY = process.env.E2B_API_KEY

if (!E2B_API_KEY && process.env.NODE_ENV === 'production') {
  console.warn('E2B_API_KEY is not set. E2B functionality will be limited.')
}

export interface SandboxOptions {
  timeout?: number // in seconds, default 300 (5 minutes)
  metadata?: Record<string, any>
}

export interface ExecutionResult {
  success: boolean
  output?: any
  error?: string
  logs?: string[]
  executionTime?: number
}

class E2BClient {
  private sandboxes: Map<string, Sandbox> = new Map()

  /**
   * Create a new sandbox for agent execution
   */
  async createSandbox(agentId: string, options: SandboxOptions = {}): Promise<Sandbox> {
    try {
      // Create sandbox with custom timeout
      const sandbox = await Sandbox.create({
        apiKey: E2B_API_KEY,
        timeout: options.timeout || 300, // 5 minutes default
      })

      // Store sandbox reference
      this.sandboxes.set(agentId, sandbox)

      return sandbox
    } catch (error) {
      console.error('Failed to create E2B sandbox:', error)
      throw new Error(`Failed to create sandbox: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  /**
   * Execute code in a sandbox
   */
  async executeCode(
    sandbox: Sandbox,
    code: string,
    language: 'python' | 'javascript' = 'python'
  ): Promise<ExecutionResult> {
    try {
      const startTime = Date.now()
      
      // Execute code based on language
      const execution = await sandbox.runCode(code)
      
      const executionTime = Date.now() - startTime

      return {
        success: !execution.error,
        output: execution.results,
        error: execution.error,
        logs: execution.logs,
        executionTime
      }
    } catch (error) {
      console.error('Failed to execute code:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown execution error'
      }
    }
  }

  /**
   * Execute an agent configuration in a sandbox
   */
  async executeAgent(
    agentId: string,
    agentConfig: any,
    input: any
  ): Promise<ExecutionResult> {
    let sandbox: Sandbox | undefined

    try {
      // Create sandbox for this agent
      sandbox = await this.createSandbox(agentId)

      // Prepare agent runtime code
      const runtimeCode = this.generateAgentRuntime(agentConfig, input)

      // Execute the agent
      const result = await this.executeCode(sandbox, runtimeCode)

      return result
    } catch (error) {
      console.error('Failed to execute agent:', error)
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    } finally {
      // Clean up sandbox
      if (sandbox) {
        await this.closeSandbox(agentId)
      }
    }
  }

  /**
   * Generate runtime code for agent execution
   */
  private generateAgentRuntime(agentConfig: any, input: any): string {
    // This is a simplified version - we'll expand this based on agent config structure
    const code = `
import json
import sys

# Agent configuration
config = ${JSON.stringify(agentConfig)}

# Input data
input_data = ${JSON.stringify(input)}

# Agent execution logic
def execute_agent(config, input_data):
    """Execute agent based on configuration"""
    result = {
        "status": "completed",
        "output": None,
        "metadata": {}
    }
    
    # Parse agent type and execute accordingly
    agent_type = config.get("type", "generic")
    
    if agent_type == "data_processor":
        # Data processing logic
        result["output"] = process_data(input_data)
    elif agent_type == "analyzer":
        # Analysis logic
        result["output"] = analyze_data(input_data)
    else:
        # Generic execution
        result["output"] = f"Processed input: {input_data}"
    
    return result

def process_data(data):
    """Process data based on configuration"""
    # Add data processing logic here
    return {"processed": True, "data": data}

def analyze_data(data):
    """Analyze data based on configuration"""
    # Add analysis logic here
    return {"analysis": "completed", "insights": []}

# Execute the agent
try:
    result = execute_agent(config, input_data)
    print(json.dumps(result))
except Exception as e:
    error_result = {
        "status": "error",
        "error": str(e)
    }
    print(json.dumps(error_result))
    sys.exit(1)
`
    return code
  }

  /**
   * Upload a file to sandbox
   */
  async uploadFile(
    sandbox: Sandbox,
    filePath: string,
    content: string | Buffer
  ): Promise<boolean> {
    try {
      await sandbox.writeFile(filePath, content)
      return true
    } catch (error) {
      console.error('Failed to upload file to sandbox:', error)
      return false
    }
  }

  /**
   * Download a file from sandbox
   */
  async downloadFile(sandbox: Sandbox, filePath: string): Promise<string | null> {
    try {
      const content = await sandbox.readFile(filePath)
      return content
    } catch (error) {
      console.error('Failed to download file from sandbox:', error)
      return null
    }
  }

  /**
   * Install packages in sandbox
   */
  async installPackages(
    sandbox: Sandbox,
    packages: string[]
  ): Promise<boolean> {
    try {
      const installCmd = `pip install ${packages.join(' ')}`
      const result = await sandbox.runCode(installCmd)
      return !result.error
    } catch (error) {
      console.error('Failed to install packages:', error)
      return false
    }
  }

  /**
   * Get sandbox by agent ID
   */
  getSandbox(agentId: string): Sandbox | undefined {
    return this.sandboxes.get(agentId)
  }

  /**
   * Close and clean up a sandbox
   */
  async closeSandbox(agentId: string): Promise<void> {
    const sandbox = this.sandboxes.get(agentId)
    if (sandbox) {
      try {
        await sandbox.close()
        this.sandboxes.delete(agentId)
      } catch (error) {
        console.error('Failed to close sandbox:', error)
      }
    }
  }

  /**
   * Close all active sandboxes
   */
  async closeAllSandboxes(): Promise<void> {
    const closePromises = Array.from(this.sandboxes.keys()).map(agentId =>
      this.closeSandbox(agentId)
    )
    await Promise.all(closePromises)
  }
}

// Export singleton instance
export const e2bClient = new E2BClient()

// Export types
export type { Sandbox }