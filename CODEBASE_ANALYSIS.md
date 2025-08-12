# Coherex Codebase Analysis

## Overview
The Coherex project is a Next.js 15 application with TypeScript, using shadcn/ui components and Vercel AI SDK v5. The codebase has a comprehensive structure with placeholder pages and components that need to be made functional.

## Current Stack
- **Framework**: Next.js 15.4.5 (with Turbopack)
- **Language**: TypeScript
- **UI Library**: shadcn/ui (all components already set up)
- **AI SDK**: Vercel AI SDK v5 (`@ai-sdk/openai`, `@ai-sdk/react`, `ai`)
- **State Management**: Zustand
- **Data Fetching**: TanStack Query v5
- **Styling**: Tailwind CSS v4
- **Forms**: React Hook Form + Zod validation

## Project Structure

### Core Routes (All Currently Placeholders)

#### 1. **Agents** (`/agents/*`)
- `/agents` - Main agents listing page with grid/list view
- `/agents/new` - Agent builder page
- `/agents/[id]` - Individual agent details
- `/agents/[id]/edit` - Agent configuration editor
- **Current State**: Uses mock data from `mockApi`, fully styled UI but no real functionality

#### 2. **Knowledge Base** (`/knowledge/*`)
- `/knowledge` - Main knowledge base overview
- `/knowledge/documents` - Document management
- `/knowledge/sources` - Data source connections
- `/knowledge/search` - Search interface
- `/knowledge/sync` - Sync status and controls
- **Current State**: Placeholder UI with tabs for different views

#### 3. **Integrations** (`/integrations/*`)
- `/integrations` - Available integrations catalog
- `/integrations/connected` - Active integrations
- `/integrations/[id]/connect` - OAuth/connection flow
- **Current State**: Beautiful integration cards but no actual connections

#### 4. **Conversations** (`/conversations/*`)
- `/conversations` - Conversation history
- `/conversations/[id]` - Individual conversation view
- `/conversations/clusters` - Conversation clustering/analysis
- **Current State**: Mock conversation data display

#### 5. **Teams** (`/teams/*`)
- `/teams` - Team management
- `/teams/new` - Create new team
- `/teams/[id]` - Team details and members
- **Current State**: Basic team CRUD interface

#### 6. **Analytics** (`/analytics/*`)
- `/analytics` - Overview dashboard
- `/analytics/usage` - Usage metrics
- `/analytics/costs` - Cost tracking
- `/analytics/performance` - Performance metrics
- `/analytics/roi` - ROI calculations
- **Current State**: Charts with mock data using Recharts

#### 7. **Evaluation** (`/evaluation/*`)
- `/evaluation` - Evaluation dashboard
- `/evaluation/agents` - Agent performance evaluation
- `/evaluation/criteria` - Evaluation criteria management
- `/evaluation/reports` - Evaluation reports
- **Current State**: Placeholder evaluation interface

#### 8. **MCP** (`/mcp/*`)
- `/mcp` - MCP server management
- `/mcp/[id]` - Individual MCP server details
- **Current State**: Basic MCP server cards

#### 9. **Settings** (`/settings/*`)
- `/settings` - General settings
- `/settings/profile` - User profile
- `/settings/organization` - Organization settings
- `/settings/notifications` - Notification preferences
- **Current State**: Settings forms without backend

### API Routes (Minimal Implementation)

#### Working Routes:
- `/api/primitives/chatbot` - Basic chatbot with Vercel AI SDK v5 (uses OpenAI)
- `/api/waitlist` - Waitlist submission endpoint

#### Placeholder/Test Routes:
- `/api/test-generate` - Empty test endpoint
- `/api/test-search` - Empty test endpoint

### Key Components

#### Layouts:
- `MainLayout` - Main app layout with sidebar and topbar
- `AuthLayout` - Authentication pages layout
- `Sidebar` - Navigation sidebar (fully functional UI)
- `TopBar` - Top navigation bar

#### UI Components (All from shadcn/ui):
- All standard shadcn/ui components are installed and configured
- Custom components like `prompt-kit` for chat interfaces
- `AIAssistantPanel` and `AIAssistantToggle` for AI features

#### Data Management:
- **Stores**: Zustand stores for agents, conversations, UI state
- **Queries**: TanStack Query hooks for data fetching
- **Mock Data**: Comprehensive mock data in `/mock-data`

### Authentication & Protected Routes
- Auth context exists but not connected to real auth
- Protected route wrapper component exists
- Login/Signup/Forgot Password pages are placeholders

## Current Functionality

### What Works:
1. **UI/UX**: All UI components and layouts are functional
2. **Navigation**: Full routing and navigation works
3. **Mock Data**: Comprehensive mock data system
4. **Basic Chatbot**: Simple AI chat using Vercel AI SDK v5
5. **State Management**: Zustand stores are set up
6. **Data Fetching**: TanStack Query is configured

### What Needs Implementation:
1. **Database**: No real database connection (uses mock data)
2. **Authentication**: No real auth system
3. **Agent Execution**: No agent runtime or E2B integration
4. **Data Sources**: No real data source connections
5. **Integrations**: No OAuth or API integrations
6. **Knowledge Base**: No document processing or embeddings
7. **Real-time Updates**: No WebSocket/real-time features
8. **File Upload**: UI exists but no backend processing

## Key Files to Modify

### For Agent Builder:
- `/src/app/agents/new/page.tsx` - Make conversational builder functional
- `/src/app/api/agents/create/route.ts` - Create new API endpoint
- `/src/hooks/queries/use-agents.ts` - Replace mock with real API calls

### For E2B Integration:
- Create `/src/lib/e2b/client.ts` - E2B SDK wrapper
- Create `/src/app/api/agents/[id]/execute/route.ts` - Execution endpoint

### For Supabase:
- Create `/src/lib/supabase/client.ts` - Supabase client
- Update all query hooks to use Supabase instead of mockApi

### For Knowledge Base:
- `/src/app/knowledge/documents/page.tsx` - Add upload functionality
- Create `/src/app/api/knowledge/embed/route.ts` - Embedding generation

## Dependencies Already Available

Key packages already installed:
- `@ai-sdk/openai` - OpenAI integration
- `@ai-sdk/react` - React hooks for AI
- `ai` v5.0.7 - Core Vercel AI SDK
- `@tanstack/react-query` - Data fetching
- `zustand` - State management
- `react-hook-form` - Forms
- `zod` - Validation
- `framer-motion` - Animations
- `recharts` - Charts
- `react-markdown` - Markdown rendering

## Next Steps

1. **Install E2B SDK**: `npm install @e2b/code-interpreter`
2. **Install Supabase**: `npm install @supabase/supabase-js`
3. **Set up environment variables** for E2B and Supabase
4. **Create database schema** in Supabase
5. **Replace mock API** with real Supabase queries
6. **Implement agent builder** using existing chatbot as template
7. **Add E2B execution** to agent runtime
8. **Connect data sources** to Supabase

## Important Notes

- All UI is complete and polished - focus on backend functionality
- Maintain Vercel AI SDK v5 (don't upgrade)
- Use existing component patterns and styles
- Mock data provides good examples of expected data structures
- TanStack Query is already set up for caching and optimistic updates