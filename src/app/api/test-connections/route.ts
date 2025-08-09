import { NextResponse } from 'next/server'
import { supabase } from '@/lib/supabase/client'
import { Sandbox } from '@e2b/code-interpreter'

export async function GET() {
  const results = {
    supabase: false,
    e2b: false,
    errors: [] as string[]
  }

  // Test Supabase connection
  try {
    const { data, error } = await supabase
      .from('agents')
      .select('count')
      .limit(1)
    
    if (error) {
      results.errors.push(`Supabase error: ${error.message}`)
    } else {
      results.supabase = true
    }
  } catch (error) {
    results.errors.push(`Supabase connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  // Test E2B connection
  try {
    const apiKey = process.env.E2B_API_KEY
    
    if (!apiKey) {
      results.errors.push('E2B_API_KEY is not set')
    } else {
      // Create a test sandbox
      const sandbox = await Sandbox.create({
        apiKey,
        timeout: 60 // 1 minute timeout for test
      })
      
      // Run a simple test
      const result = await sandbox.runCode('print("E2B test successful")')
      
      if (!result.error) {
        results.e2b = true
      } else {
        results.errors.push(`E2B execution error: ${result.error}`)
      }
      
      // Clean up
      await sandbox.kill()
    }
  } catch (error) {
    results.errors.push(`E2B connection failed: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }

  const status = results.supabase && results.e2b ? 200 : 500

  return NextResponse.json({
    success: results.supabase && results.e2b,
    connections: {
      supabase: results.supabase ? 'Connected' : 'Failed',
      e2b: results.e2b ? 'Connected' : 'Failed'
    },
    errors: results.errors,
    timestamp: new Date().toISOString()
  }, { status })
}