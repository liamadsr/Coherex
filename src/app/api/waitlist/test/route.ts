import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const scriptUrl = process.env.GOOGLE_SCRIPT_URL || ''
  
  return NextResponse.json({
    configured: !!scriptUrl,
    scriptUrl: scriptUrl ? '***CONFIGURED***' : 'NOT CONFIGURED',
    message: scriptUrl 
      ? 'Google Script URL is configured. Try submitting an email through the form.' 
      : 'Google Script URL is NOT configured. Please follow the setup guide.',
    setupInstructions: !scriptUrl ? [
      '1. Open your Google Sheet',
      '2. Go to Extensions > Apps Script',
      '3. Copy the code from google-apps-script.js',
      '4. Deploy as Web App',
      '5. Add the URL to .env.local as GOOGLE_SCRIPT_URL=your_url_here',
      '6. Restart your development server'
    ] : null
  })
}