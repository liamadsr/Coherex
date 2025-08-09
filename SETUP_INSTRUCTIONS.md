# Coherex Setup Instructions

## Prerequisites
- Node.js 18+ installed
- Supabase account (free tier works)
- E2B account (free tier works)
- OpenAI API key

## Quick Setup

### 1. Database Setup (Supabase)

1. Go to your Supabase project dashboard: https://supabase.com/dashboard/project/tpalyivuslawjkqcsqvd

2. Navigate to the SQL Editor and run the schema from `/supabase/schema.sql`

3. Alternatively, run this simplified schema first to get started:

```sql
-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create basic agents table
CREATE TABLE IF NOT EXISTS agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create basic data sources table
CREATE TABLE IF NOT EXISTS data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type TEXT NOT NULL,
  config JSONB NOT NULL DEFAULT '{}',
  status TEXT DEFAULT 'active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create agent executions table
CREATE TABLE IF NOT EXISTS agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  sandbox_id TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  input JSONB,
  output JSONB,
  logs TEXT[],
  duration_ms INTEGER,
  cost_cents INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### 2. Environment Variables

Copy `.env.local.example` to `.env.local` and update with your credentials:

```bash
cp .env.local.example .env.local
```

Edit `.env.local` with your actual values:
- Supabase credentials are already set
- E2B API key is already set
- Add your OpenAI API key

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Development Server

```bash
npm run dev
```

The app will be available at http://localhost:3000 (or 3002 if 3000 is in use)

### 5. Test Connections

Visit http://localhost:3002/api/test-connections to verify:
- ✅ Supabase connection
- ✅ E2B sandbox creation

## Next Steps

1. **Run full database schema**: Execute the complete schema from `/supabase/schema.sql` in Supabase SQL Editor

2. **Test agent creation**: Visit http://localhost:3002/agents/new to create your first agent

3. **Configure integrations**: Add OAuth credentials for Gmail, Slack, etc.

## Troubleshooting

### Supabase Connection Issues
- Ensure your Supabase project is active
- Check that the database schema has been created
- Verify environment variables are correct

### E2B Issues
- Ensure E2B_API_KEY is set correctly
- Check your E2B account has available credits
- Sandboxes may take a few seconds to start initially

### Port Already in Use
The dev server will automatically use port 3002 if 3000 is occupied

## Architecture Overview

```
Frontend (Next.js 15)
    ↓
API Routes (Vercel AI SDK v5)
    ↓
Supabase (Database + Auth + Realtime)
    ↓
E2B Sandboxes (Agent Execution)
```

## Key Features

- **Agent Builder**: Natural language to agent configuration
- **E2B Sandboxes**: Secure execution environment
- **Data Sources**: Centralized data management
- **Real-time Updates**: Via Supabase subscriptions
- **Knowledge Base**: Vector embeddings for RAG