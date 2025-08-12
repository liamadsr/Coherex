import { NextRequest, NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/lib/supabase/api-client-production'

export async function GET(req: NextRequest) {
  try {
    const { supabase } = await createRouteHandlerClient(req)
    
    // Test auth status
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    // Test database connection
    const { count, error: dbError } = await supabase
      .from('agents')
      .select('*', { count: 'exact', head: true })
    
    return NextResponse.json({
      auth: {
        isAuthenticated: !!user,
        user: user ? { id: user.id, email: user.email } : null,
        error: authError?.message
      },
      database: {
        connected: !dbError,
        agentCount: count,
        error: dbError?.message
      },
      config: {
        supabaseUrl: process.env.NEXT_PUBLIC_SUPABASE_URL,
        hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        hasServiceKey: !!process.env.SUPABASE_SERVICE_ROLE_KEY
      }
    })
  } catch (error) {
    return NextResponse.json({
      error: 'Test failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

export async function POST(req: NextRequest) {
  try {
    const { email, password } = await req.json()
    const { supabase } = await createRouteHandlerClient(req)
    
    // Try to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email: email || 'demo@coherex.ai',
      password: password || 'password123'
    })
    
    if (error) {
      return NextResponse.json({
        success: false,
        error: error.message,
        code: error.status,
        details: error
      }, { status: 400 })
    }
    
    return NextResponse.json({
      success: true,
      user: data.user ? { id: data.user.id, email: data.user.email } : null,
      session: !!data.session
    })
  } catch (error) {
    return NextResponse.json({
      success: false,
      error: 'Sign in failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}