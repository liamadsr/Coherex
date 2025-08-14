import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api-client-production'
import { e2bClient } from '@/lib/e2b/client'
import { sessionManager } from '@/lib/e2b/session-manager'
import { AgentRuntime } from '@/lib/e2b/runtime'

interface FileInfo {
  name: string
  path: string
  type: 'file' | 'directory'
  size?: number
  lastModified?: string
}

// GET /api/agents/[id]/files - List files in agent sandbox
export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await createRouteHandlerClient(req)
    const { id: agentId } = await params
    const { searchParams } = new URL(req.url)
    const path = searchParams.get('path') || '/'
    const sessionId = searchParams.get('sessionId')
    
    // Handle test agent (for agent builder)
    if (agentId === 'test-agent') {
      // For test agents, show virtual files with sample runtime code
      const testConfig = {
        id: 'test-agent',
        name: 'Test Agent',
        type: 'custom' as const,
        model: 'gpt-4',
        temperature: 0.7,
        maxTokens: 2000,
        systemPrompt: 'You are a helpful AI assistant.',
        description: 'Test agent for previewing runtime code'
      }
      
      const context = {
        agent: testConfig,
        input: '# Sample input for demonstration'
      }
      
      // Generate both Python and JavaScript versions
      const pythonCode = AgentRuntime.generatePythonRuntime(context)
      const jsCode = AgentRuntime.generateJavaScriptRuntime(context)
      
      const files: FileInfo[] = [
        {
          name: 'agent.py',
          path: '/agent.py',
          type: 'file',
          size: pythonCode.length,
          lastModified: new Date().toISOString()
        },
        {
          name: 'agent.js',
          path: '/agent.js',
          type: 'file',
          size: jsCode.length,
          lastModified: new Date().toISOString()
        },
        {
          name: 'config.json',
          path: '/config.json',
          type: 'file',
          size: JSON.stringify(testConfig, null, 2).length,
          lastModified: new Date().toISOString()
        }
      ]
      
      return NextResponse.json({
        files,
        isVirtual: true,
        message: 'Preview of generated runtime code'
      })
    }
    
    // Verify agent exists and user has access
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Get the current sandbox for this agent
    let sandbox = e2bClient.getSandbox(agentId)
    
    // If no sandbox exists and sessionId provided, try to get from session
    if (!sandbox && sessionId) {
      const session = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
        .then(r => r.data)
        
      if (session && session.status === 'active') {
        sandbox = e2bClient.getSandbox(session.id)
      }
    }
    
    if (!sandbox) {
      // Generate the agent runtime code to show what would be deployed
      const config = AgentRuntime.parseConfig(agent)
      const context = {
        agent: config,
        input: '# Sample input for demonstration'
      }
      
      // Generate both Python and JavaScript versions
      const pythonCode = AgentRuntime.generatePythonRuntime(context)
      const jsCode = AgentRuntime.generateJavaScriptRuntime(context)
      
      // Return virtual file system showing the generated code
      const files: FileInfo[] = [
        {
          name: 'agent.py',
          path: '/agent.py',
          type: 'file',
          size: pythonCode.length,
          lastModified: new Date().toISOString()
        },
        {
          name: 'agent.js',
          path: '/agent.js',
          type: 'file',
          size: jsCode.length,
          lastModified: new Date().toISOString()
        },
        {
          name: 'config.json',
          path: '/config.json',
          type: 'file',
          size: JSON.stringify(config, null, 2).length,
          lastModified: new Date().toISOString()
        }
      ]
      
      return NextResponse.json({
        files,
        isVirtual: true,
        message: 'No active sandbox. Showing generated runtime code.'
      })
    }
    
    // List files in the sandbox
    try {
      // E2B doesn't have a direct listFiles method, so we'll use a workaround
      // Execute a command to list files
      const listCommand = `ls -la ${path} 2>/dev/null || echo "[]"`
      const result = await sandbox.runCode(listCommand)
      
      if (result.error) {
        return NextResponse.json(
          { error: 'Failed to list files', details: result.error },
          { status: 500 }
        )
      }
      
      // Parse the ls output
      const output = result.results?.[0]?.text || ''
      const lines = output.split('\n').filter(line => line.trim())
      const files: FileInfo[] = []
      
      // Skip the first line (total) and parse each file
      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(/\s+/)
        if (parts.length >= 9) {
          const permissions = parts[0]
          const size = parseInt(parts[4]) || 0
          const name = parts.slice(8).join(' ')
          
          if (name !== '.' && name !== '..') {
            files.push({
              name,
              path: path === '/' ? `/${name}` : `${path}/${name}`,
              type: permissions.startsWith('d') ? 'directory' : 'file',
              size,
              lastModified: new Date().toISOString()
            })
          }
        }
      }
      
      return NextResponse.json({
        files,
        isVirtual: false,
        currentPath: path
      })
      
    } catch (error) {
      console.error('Error listing files:', error)
      return NextResponse.json(
        { error: 'Failed to list files' },
        { status: 500 }
      )
    }
    
  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// POST /api/agents/[id]/files - Read or write a file
export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { supabase } = await createRouteHandlerClient(req)
    const { id: agentId } = await params
    const { action, path, content, sessionId } = await req.json()
    
    // Handle test agent (for agent builder)
    if (agentId === 'test-agent') {
      if (action === 'read') {
        const testConfig = {
          id: 'test-agent',
          name: 'Test Agent',
          type: 'custom' as const,
          model: 'gpt-4',
          temperature: 0.7,
          maxTokens: 2000,
          systemPrompt: 'You are a helpful AI assistant.',
          description: 'Test agent for previewing runtime code'
        }
        
        const context = {
          agent: testConfig,
          input: '# Sample input for demonstration'
        }
        
        // Return the generated code based on the requested file
        if (path === '/agent.py') {
          return NextResponse.json({
            content: AgentRuntime.generatePythonRuntime(context),
            isVirtual: true
          })
        } else if (path === '/agent.js') {
          return NextResponse.json({
            content: AgentRuntime.generateJavaScriptRuntime(context),
            isVirtual: true
          })
        } else if (path === '/config.json') {
          return NextResponse.json({
            content: JSON.stringify(testConfig, null, 2),
            isVirtual: true
          })
        }
      }
      
      // Test agents don't support write/delete operations
      return NextResponse.json(
        { error: 'Test agents do not support file modifications' },
        { status: 400 }
      )
    }
    
    // Verify agent exists and user has access
    const { data: agent, error: fetchError } = await supabase
      .from('agents')
      .select('*')
      .eq('id', agentId)
      .single()

    if (fetchError || !agent) {
      return NextResponse.json(
        { error: 'Agent not found' },
        { status: 404 }
      )
    }
    
    // Handle virtual files (when no sandbox is active)
    if (action === 'read' && !e2bClient.getSandbox(agentId)) {
      const config = AgentRuntime.parseConfig(agent)
      const context = {
        agent: config,
        input: '# Sample input for demonstration'
      }
      
      // Return the generated code based on the requested file
      if (path === '/agent.py') {
        return NextResponse.json({
          content: AgentRuntime.generatePythonRuntime(context),
          isVirtual: true
        })
      } else if (path === '/agent.js') {
        return NextResponse.json({
          content: AgentRuntime.generateJavaScriptRuntime(context),
          isVirtual: true
        })
      } else if (path === '/config.json') {
        return NextResponse.json({
          content: JSON.stringify(config, null, 2),
          isVirtual: true
        })
      } else {
        return NextResponse.json(
          { error: 'File not found' },
          { status: 404 }
        )
      }
    }
    
    // Get the sandbox
    let sandbox = e2bClient.getSandbox(agentId)
    
    if (!sandbox && sessionId) {
      const session = await supabase
        .from('agent_sessions')
        .select('*')
        .eq('id', sessionId)
        .single()
        .then(r => r.data)
        
      if (session && session.status === 'active') {
        sandbox = e2bClient.getSandbox(session.id)
      }
    }
    
    if (!sandbox) {
      return NextResponse.json(
        { error: 'No active sandbox. Start the agent to create a sandbox.' },
        { status: 400 }
      )
    }
    
    if (action === 'read') {
      // Read file from sandbox
      try {
        const content = await e2bClient.downloadFile(sandbox, path)
        if (content === null) {
          return NextResponse.json(
            { error: 'File not found' },
            { status: 404 }
          )
        }
        
        return NextResponse.json({
          content,
          isVirtual: false
        })
      } catch (error) {
        console.error('Error reading file:', error)
        return NextResponse.json(
          { error: 'Failed to read file' },
          { status: 500 }
        )
      }
      
    } else if (action === 'write') {
      // Write file to sandbox
      if (!content) {
        return NextResponse.json(
          { error: 'Content is required for write action' },
          { status: 400 }
        )
      }
      
      try {
        const success = await e2bClient.uploadFile(sandbox, path, content)
        if (!success) {
          return NextResponse.json(
            { error: 'Failed to write file' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'File saved successfully'
        })
      } catch (error) {
        console.error('Error writing file:', error)
        return NextResponse.json(
          { error: 'Failed to write file' },
          { status: 500 }
        )
      }
      
    } else if (action === 'delete') {
      // Delete file from sandbox
      try {
        const deleteCommand = `rm -f ${path}`
        const result = await sandbox.runCode(deleteCommand)
        
        if (result.error) {
          return NextResponse.json(
            { error: 'Failed to delete file' },
            { status: 500 }
          )
        }
        
        return NextResponse.json({
          success: true,
          message: 'File deleted successfully'
        })
      } catch (error) {
        console.error('Error deleting file:', error)
        return NextResponse.json(
          { error: 'Failed to delete file' },
          { status: 500 }
        )
      }
      
    } else {
      return NextResponse.json(
        { error: 'Invalid action. Use read, write, or delete.' },
        { status: 400 }
      )
    }
    
  } catch (error) {
    console.error('Files API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}