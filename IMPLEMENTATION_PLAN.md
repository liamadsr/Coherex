# Coherex Agent Platform: Implementation Plan

## Overview
Build a "Docker for AI Agents" platform using E2B sandboxes for execution, Supabase for data management, and Vercel AI SDK v5 for agent intelligence.

## Technology Stack

### Core Technologies
- **Frontend**: Next.js 15 (existing setup)
- **UI Components**: shadcn/ui (already configured)
- **AI Framework**: Vercel AI SDK v5 (already in use - keep v5)
- **Execution Environment**: E2B JavaScript SDK
- **Database**: Supabase (PostgreSQL + pgvector + Realtime)
- **Language**: TypeScript throughout

## Architecture Overview

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Next.js 15    │────▶│  API Routes      │────▶│  E2B Sandboxes  │
│   (Frontend)    │     │  (Vercel AI SDK) │     │  (Agent Runtime)│
└─────────────────┘     └──────────────────┘     └─────────────────┘
        │                        │                         │
        ▼                        ▼                         ▼
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Supabase      │────▶│  Data Sources    │────▶│  Integrations   │
│   - PostgreSQL  │     │  (Centralized)   │     │  (OAuth/APIs)   │
│   - Realtime    │     │  - Shared across │     │  - Gmail        │
│   - Auth        │     │    agents        │     │  - Slack        │
│   - Storage     │     └──────────────────┘     │  - GitHub       │
└─────────────────┘                               └─────────────────┘
```

## Key Design Principles

1. **Centralized Data Sources**: Users set up data sources once, multiple agents can access them
2. **YAML/JSON Configs**: Portable, versionable agent definitions
3. **Natural Language Builder**: Conversational interface for creating agents
4. **Sandbox Execution**: E2B provides secure, isolated environments
5. **Real-time Updates**: Supabase realtime for agent status monitoring

## Database Schema

### Core Tables

```sql
-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL, -- Agent YAML/JSON configuration
  status TEXT DEFAULT 'draft', -- draft, active, paused, archived
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Sources (centralized, shared across agents)
CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- gmail, slack, github, database, api
  config JSONB NOT NULL, -- Connection details (encrypted)
  status TEXT DEFAULT 'active',
  team_id UUID REFERENCES teams(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent-DataSource associations
CREATE TABLE agent_data_sources (
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  data_source_id UUID REFERENCES data_sources(id) ON DELETE CASCADE,
  permissions JSONB, -- Read, write, etc.
  PRIMARY KEY (agent_id, data_source_id)
);

-- Agent Executions
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id),
  sandbox_id TEXT, -- E2B sandbox ID
  status TEXT NOT NULL, -- pending, running, completed, failed
  input JSONB,
  output JSONB,
  logs TEXT[],
  duration_ms INTEGER,
  cost_cents INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Base (for RAG)
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  content TEXT,
  embedding vector(1536), -- OpenAI embeddings dimension
  metadata JSONB,
  data_source_id UUID REFERENCES data_sources(id),
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);
```

## Implementation Phases

### Phase 1: Database & Core Infrastructure (Week 1)

#### 1.1 Supabase Setup
- [ ] Create Supabase project
- [ ] Set up database schema
- [ ] Configure row-level security
- [ ] Set up auth policies
- [ ] Enable pgvector extension

#### 1.2 Environment Configuration
- [ ] Add Supabase environment variables
- [ ] Configure E2B API keys
- [ ] Set up development/production configs

#### 1.3 Core Libraries
- [ ] Create Supabase client wrapper
- [ ] Set up type generation from database
- [ ] Configure real-time subscriptions

### Phase 2: Agent Builder Service (Week 1-2)

#### 2.1 Natural Language Processing
- [ ] Implement conversational agent builder
- [ ] Create prompt templates for agent generation
- [ ] Build validation system for agent configs

#### 2.2 Agent Configuration
- [ ] Define agent YAML/JSON schema
- [ ] Create configuration validator
- [ ] Build template library (email, slack, data analysis)

#### 2.3 API Endpoints
- [ ] `/api/agents/create` - Generate agent from conversation
- [ ] `/api/agents/[id]` - CRUD operations
- [ ] `/api/agents/validate` - Config validation

### Phase 3: E2B Integration (Week 2-3)

#### 3.1 E2B Setup
- [ ] Install E2B JavaScript SDK
- [ ] Create sandbox management service
- [ ] Implement execution queue

#### 3.2 Agent Runtime
- [ ] Build standardized runtime framework
- [ ] Create plugin system for integrations
- [ ] Implement error handling and retries

#### 3.3 Execution API
- [ ] `/api/agents/[id]/execute` - Run agent
- [ ] `/api/agents/[id]/stop` - Stop execution
- [ ] `/api/agents/[id]/logs` - Stream logs

### Phase 4: Data Source Management (Week 3)

#### 4.1 Data Source Registry
- [ ] Create data source types and schemas
- [ ] Build connection validators
- [ ] Implement credential encryption

#### 4.2 Integration Framework
- [ ] OAuth2 flow implementation
- [ ] API key management
- [ ] Webhook receivers

#### 4.3 Data Access Layer
- [ ] Centralized data access API
- [ ] Permission management
- [ ] Rate limiting

### Phase 5: Frontend Enhancement (Week 3-4)

#### 5.1 Agent Management
- [ ] Agent builder conversation UI
- [ ] Agent list and details pages
- [ ] Agent testing playground
- [ ] Version history viewer

#### 5.2 Data Source UI
- [ ] Data source connection wizard
- [ ] Connection status monitoring
- [ ] Permission management interface

#### 5.3 Knowledge Base
- [ ] Document upload and processing
- [ ] Embedding generation
- [ ] Search interface

#### 5.4 Real-time Features
- [ ] Live execution monitoring
- [ ] Log streaming
- [ ] Status updates

### Phase 6: Integrations (Week 4-5)

#### 6.1 Core Integrations
- [ ] Gmail (read, send, summarize)
- [ ] Slack (read, post, monitor)
- [ ] GitHub (issues, PRs, commits)

#### 6.2 Integration Features
- [ ] Scheduled execution
- [ ] Event-driven triggers
- [ ] Webhook processing

### Phase 7: Production Features (Week 5-6)

#### 7.1 Monitoring & Analytics
- [ ] Usage tracking
- [ ] Cost calculation
- [ ] Performance metrics
- [ ] Error tracking

#### 7.2 Security & Compliance
- [ ] API rate limiting
- [ ] Usage quotas
- [ ] Audit logging
- [ ] Data encryption

#### 7.3 Team Features
- [ ] Agent sharing
- [ ] Team workspaces
- [ ] Role-based access

## File Structure

```
src/
├── app/
│   ├── api/
│   │   ├── agents/
│   │   │   ├── create/route.ts      # Agent creation with AI
│   │   │   ├── validate/route.ts    # Config validation
│   │   │   ├── [id]/
│   │   │   │   ├── route.ts         # CRUD operations
│   │   │   │   ├── execute/route.ts # Run agent in E2B
│   │   │   │   ├── stop/route.ts    # Stop execution
│   │   │   │   └── logs/route.ts    # Get execution logs
│   │   ├── data-sources/
│   │   │   ├── connect/route.ts     # OAuth flows
│   │   │   ├── validate/route.ts    # Test connection
│   │   │   └── [id]/
│   │   │       ├── route.ts         # CRUD operations
│   │   │       └── sync/route.ts    # Sync data
│   │   ├── knowledge/
│   │   │   ├── upload/route.ts      # Document upload
│   │   │   ├── embed/route.ts       # Generate embeddings
│   │   │   └── search/route.ts      # Vector search
│   │   └── e2b/
│   │       ├── sandbox/route.ts     # Sandbox management
│   │       └── health/route.ts      # E2B status check
│   ├── (authenticated)/             # Protected routes
│   ├── agents/                      # Agent pages (existing)
│   ├── knowledge/                   # Knowledge base (existing)
│   ├── integrations/               # Integration pages (existing)
│   └── teams/                      # Team management (existing)
├── components/
│   ├── agents/
│   │   ├── AgentBuilder.tsx        # Conversational builder
│   │   ├── AgentCard.tsx           # List item component
│   │   ├── AgentExecutor.tsx       # Testing playground
│   │   └── AgentConfig.tsx         # Config editor
│   ├── data-sources/
│   │   ├── DataSourceWizard.tsx    # Connection wizard
│   │   ├── DataSourceList.tsx      # List view
│   │   └── DataSourceStatus.tsx    # Status indicator
│   └── knowledge/
│       ├── DocumentUploader.tsx    # File upload
│       ├── DocumentList.tsx        # Document browser
│       └── SearchInterface.tsx     # Search UI
├── lib/
│   ├── supabase/
│   │   ├── client.ts               # Client initialization
│   │   ├── queries.ts              # Database queries
│   │   └── types.ts                # Generated types
│   ├── e2b/
│   │   ├── client.ts               # E2B SDK wrapper
│   │   ├── runtime.ts              # Agent runtime
│   │   └── sandbox.ts              # Sandbox manager
│   ├── ai/
│   │   ├── agent-builder.ts        # Agent generation
│   │   ├── prompts.ts              # Prompt templates
│   │   └── tools.ts                # AI tool definitions
│   └── integrations/
│       ├── gmail.ts                # Gmail integration
│       ├── slack.ts                # Slack integration
│       └── github.ts               # GitHub integration
└── types/
    ├── agent.ts                    # Agent types
    ├── data-source.ts              # Data source types
    └── execution.ts                # Execution types
```

## MVP Deliverables (2 Weeks)

### Week 1
- [ ] Supabase setup with core schema
- [ ] Basic agent builder (text to config)
- [ ] E2B sandbox execution
- [ ] Simple agent templates (3)

### Week 2
- [ ] Data source management
- [ ] Agent execution UI
- [ ] One working integration (Slack)
- [ ] Real-time status updates

## Success Metrics

- Agent creation time: < 2 minutes
- Sandbox startup time: < 200ms
- Execution reliability: > 99%
- User can create and run an agent in < 5 clicks

## Technical Decisions

1. **JavaScript SDK over Python**: Unified tech stack with Next.js
2. **Supabase over separate DBs**: Simplifies infrastructure
3. **Vercel AI SDK over LangChain**: Better production performance
4. **E2B over Kubernetes**: Eliminates container complexity
5. **YAML/JSON configs**: Portable and versionable

## Security Considerations

- All credentials encrypted at rest
- Row-level security for multi-tenancy
- API rate limiting per user/team
- Sandbox isolation for code execution
- OAuth2 for external integrations

## Cost Optimization

- E2B: Pay per execution minute
- Supabase: Free tier covers MVP
- Vercel: Existing deployment
- OpenAI: Usage-based pricing

## Next Steps

1. Set up Supabase project
2. Install E2B SDK
3. Create database schema
4. Build agent creation endpoint
5. Test with simple email agent

## Notes

- Keep using Vercel AI SDK v5 (no upgrade)
- All existing UI components are placeholders
- Focus on making existing routes functional
- Maintain existing project structure