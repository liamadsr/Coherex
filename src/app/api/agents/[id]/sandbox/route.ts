import { NextRequest, NextResponse } from 'next/server'
import { e2bClient } from '@/lib/e2b/client'

// POST /api/agents/[id]/sandbox - Create or get sandbox for agent
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const { sessionId, config } = await req.json()
    
    // Try to create a sandbox
    try {
      const sandboxId = sessionId || agentId
      const sandbox = await e2bClient.createSandbox(sandboxId, {
        timeout: 300 // 5 minutes
      })
      
      if (sandbox) {
        // Write the agent configuration to the sandbox
        const configContent = JSON.stringify(config, null, 2)
        await e2bClient.uploadFile(sandbox, '/config.json', configContent)
        
        // Write initial agent scripts
        const pythonScript = `#!/usr/bin/env python3
# Agent runtime script
import json
import sys

# Load configuration
with open('/config.json', 'r') as f:
    config = json.load(f)

print(f"Agent {config.get('model', 'unknown')} initialized")
print(f"Temperature: {config.get('temperature', 0.7)}")
print(f"Max tokens: {config.get('maxTokens', 2000)}")
print("Ready to process inputs...")
`
        
        const jsScript = `#!/usr/bin/env node
// Agent runtime script
const fs = require('fs');

// Load configuration
const config = JSON.parse(fs.readFileSync('/config.json', 'utf8'));

console.log(\`Agent \${config.model || 'unknown'} initialized\`);
console.log(\`Temperature: \${config.temperature || 0.7}\`);
console.log(\`Max tokens: \${config.maxTokens || 2000}\`);
console.log('Ready to process inputs...');
`
        
        await e2bClient.uploadFile(sandbox, '/agent.py', pythonScript)
        await e2bClient.uploadFile(sandbox, '/agent.js', jsScript)
        
        return NextResponse.json({
          success: true,
          sandboxId,
          message: 'Sandbox created successfully'
        })
      }
    } catch (error: any) {
      // E2B not configured or failed to create sandbox
      console.log('E2B sandbox creation failed:', error.message)
      
      // Return success but indicate it's running in simulation mode
      return NextResponse.json({
        success: true,
        sandboxId: null,
        message: 'Running in simulation mode (E2B not configured)',
        simulationMode: true
      })
    }
    
  } catch (error) {
    console.error('Sandbox API error:', error)
    return NextResponse.json(
      { error: 'Failed to create sandbox' },
      { status: 500 }
    )
  }
}

// DELETE /api/agents/[id]/sandbox - Stop and cleanup sandbox
export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: agentId } = await params
    const { searchParams } = new URL(req.url)
    const sessionId = searchParams.get('sessionId')
    
    const sandboxId = sessionId || agentId
    const sandbox = e2bClient.getSandbox(sandboxId)
    
    if (sandbox) {
      await e2bClient.stopSandbox(sandboxId)
      return NextResponse.json({
        success: true,
        message: 'Sandbox stopped successfully'
      })
    }
    
    return NextResponse.json({
      success: true,
      message: 'No sandbox to stop'
    })
    
  } catch (error) {
    console.error('Sandbox cleanup error:', error)
    return NextResponse.json(
      { error: 'Failed to stop sandbox' },
      { status: 500 }
    )
  }
}