# Agent Versioning & Preview System - Implementation Plan

## Overview
Implement an enterprise-grade agent versioning system with shareable preview links for stakeholder testing and approval workflows.

## Core Features
1. **Version Control** - Track all agent versions with full history
2. **Zero Downtime** - Keep production live while editing
3. **Shareable Previews** - Test with stakeholders without auth
4. **Rollback Capability** - Restore any previous version
5. **Feedback Collection** - Gather feedback on preview versions

## Database Schema

### 1. Update `agents` table
```sql
ALTER TABLE agents 
ADD COLUMN current_version_id UUID REFERENCES agent_versions(id),
ADD COLUMN draft_version_id UUID REFERENCES agent_versions(id);
```

### 2. Create `agent_versions` table
```sql
CREATE TABLE agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'production', 'archived')),
  
  -- Agent configuration (all current agent fields)
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Constraints
  UNIQUE(agent_id, version_number)
);

-- Indexes
CREATE INDEX idx_agent_versions_agent_id ON agent_versions(agent_id);
CREATE INDEX idx_agent_versions_status ON agent_versions(status);
```

### 3. Create `preview_links` table
```sql
CREATE TABLE preview_links (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_version_id UUID NOT NULL REFERENCES agent_versions(id) ON DELETE CASCADE,
  token TEXT UNIQUE NOT NULL DEFAULT encode(gen_random_bytes(32), 'hex'),
  
  -- Settings
  expires_at TIMESTAMPTZ NOT NULL,
  password_hash TEXT,
  max_conversations INTEGER DEFAULT 100,
  conversation_count INTEGER DEFAULT 0,
  include_feedback BOOLEAN DEFAULT true,
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  revoked_at TIMESTAMPTZ,
  last_accessed_at TIMESTAMPTZ,
  
  -- Constraints
  CHECK (expires_at > created_at),
  CHECK (max_conversations > 0)
);

-- Indexes
CREATE INDEX idx_preview_links_token ON preview_links(token) WHERE revoked_at IS NULL;
CREATE INDEX idx_preview_links_expires ON preview_links(expires_at) WHERE revoked_at IS NULL;
```

### 4. Create `preview_feedback` table
```sql
CREATE TABLE preview_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preview_link_id UUID NOT NULL REFERENCES preview_links(id) ON DELETE CASCADE,
  
  -- Feedback data
  name TEXT,
  email TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  feedback_text TEXT,
  metadata JSONB DEFAULT '{}',
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ip_address INET,
  user_agent TEXT
);

-- Index
CREATE INDEX idx_preview_feedback_link ON preview_feedback(preview_link_id);
```

### 5. Create `preview_conversations` table
```sql
CREATE TABLE preview_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preview_link_id UUID NOT NULL REFERENCES preview_links(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);
```

## API Endpoints

### Version Management
- `GET /api/agents/:id/versions` - List all versions
- `GET /api/agents/:id/versions/:versionId` - Get specific version
- `POST /api/agents/:id/versions` - Create new version (draft)
- `PUT /api/agents/:id/versions/:versionId` - Update draft version
- `POST /api/agents/:id/versions/:versionId/publish` - Publish version
- `POST /api/agents/:id/versions/:versionId/rollback` - Rollback to version

### Preview Links
- `POST /api/agents/:id/versions/:versionId/preview` - Generate preview link
- `GET /api/preview/:token` - Get preview data (public)
- `POST /api/preview/:token/verify` - Verify password (if protected)
- `DELETE /api/preview/:token` - Revoke preview link
- `GET /api/agents/:id/preview-links` - List active preview links
- `POST /api/preview/:token/feedback` - Submit feedback

## Frontend Components

### 1. Version Management UI
```typescript
// components/agents/VersionHistory.tsx
- Display version list with metadata
- Show current production version
- Enable rollback with confirmation
- Display version diff viewer

// components/agents/VersionBadge.tsx
- Show version number and status
- Visual indicators for draft/production
```

### 2. Preview System
```typescript
// components/agents/SharePreviewModal.tsx
- Configure preview settings
- Generate and display link
- Copy to clipboard functionality
- Email sharing option
- Manage active links

// app/preview/[token]/page.tsx
- Public chat interface
- No authentication required
- Preview watermark
- Feedback form
- Conversation limits
```

### 3. Agent Builder Updates
```typescript
// Update agent builder to be version-aware
- Show current version being edited
- Display "Based on version X" for drafts
- Add publish button for drafts
- Add preview button
```

## Implementation Phases

### Phase 1: Database & Core Backend (Day 1-2)
1. Create database migrations
2. Update Supabase types
3. Implement version creation logic
4. Create version management API endpoints

### Phase 2: Preview System (Day 2-3)
1. Implement preview link generation
2. Create public preview page
3. Add password protection
4. Implement conversation limits
5. Add feedback collection

### Phase 3: Frontend Integration (Day 3-4)
1. Update agent builder for versions
2. Create version history component
3. Implement share preview modal
4. Update agent list page
5. Add version badges

### Phase 4: Testing & Polish (Day 5)
1. End-to-end testing
2. Error handling
3. Loading states
4. Analytics integration
5. Documentation

## State Management

```typescript
// stores/agent-version-store.ts
interface AgentVersionStore {
  currentVersion: AgentVersion | null
  draftVersion: AgentVersion | null
  versions: AgentVersion[]
  
  // Actions
  loadVersions: (agentId: string) => Promise<void>
  createDraft: () => Promise<void>
  updateDraft: (data: Partial<AgentVersion>) => Promise<void>
  publishDraft: () => Promise<void>
  rollback: (versionId: string) => Promise<void>
  
  // Preview
  generatePreviewLink: (settings: PreviewSettings) => Promise<PreviewLink>
  revokePreviewLink: (linkId: string) => Promise<void>
}
```

## Security Considerations

1. **Preview Links**
   - Use cryptographically secure random tokens
   - Implement rate limiting
   - Add IP-based access logs
   - Optional password protection
   - Automatic expiration

2. **Version Access**
   - Only org members can view versions
   - Track who publishes/rollbacks
   - Audit log for all version changes

3. **Public Preview Page**
   - No access to production data
   - Sandboxed environment
   - Limited conversation count
   - No authentication tokens exposed

## Migration Strategy

1. **Existing Agents**
   - Create Version 1 from current data
   - Set as current_version_id
   - Mark as 'production' status

2. **Draft Agents**
   - Convert to Version 1 with 'draft' status
   - Maintain editing capability

## Success Metrics

- Zero downtime during deployments
- Average preview feedback score > 4/5
- Rollback success rate 100%
- Preview link usage rate > 50%
- Time to production reduced by 30%

## Future Enhancements

1. **Approval Workflows** - Require approval before publishing
2. **A/B Testing** - Run multiple versions simultaneously
3. **Scheduled Publishing** - Publish at specific times
4. **Version Comparison** - Visual diff between versions
5. **Collaborative Editing** - Multiple users editing drafts
6. **Preview Analytics** - Detailed preview usage stats

## Technical Decisions

1. **Why separate versions table?**
   - Clean separation of concerns
   - Easy to query version history
   - Supports future features like branching

2. **Why token-based preview links?**
   - No authentication required
   - Easy to share
   - Secure and revocable

3. **Why JSONB for config?**
   - Flexible schema evolution
   - Easy to store complex configurations
   - Native PostgreSQL support

## Testing Strategy

1. **Unit Tests**
   - Version creation/update logic
   - Preview link generation
   - Rollback functionality

2. **Integration Tests**
   - Full version lifecycle
   - Preview link access
   - Feedback submission

3. **E2E Tests**
   - Create agent → Share preview → Collect feedback → Publish
   - Edit production → Test draft → Publish → Rollback

## Documentation Needed

1. User guide for version management
2. Preview link best practices
3. API documentation
4. Migration guide for existing users

---

## Implementation Order (Detailed)

### Step 1: Database Setup
```bash
# Run migrations in Supabase
supabase migration new agent_versioning
# Add SQL from above
supabase db push
```

### Step 2: Update Types
```bash
# Generate new types
npm run supabase:types
```

### Step 3: Backend APIs
1. `/api/agents/[id]/versions/route.ts`
2. `/api/agents/[id]/versions/[versionId]/route.ts`
3. `/api/agents/[id]/versions/[versionId]/publish/route.ts`
4. `/api/preview/[token]/route.ts`

### Step 4: Frontend Components
1. `VersionBadge.tsx`
2. `VersionHistory.tsx`
3. `SharePreviewModal.tsx`
4. Update `AgentBuilder.tsx`

### Step 5: Public Preview Page
1. Create `/app/preview/[token]/page.tsx`
2. Add chat interface
3. Add feedback form

### Step 6: Integration
1. Update agent list
2. Update agent detail
3. Add version indicators
4. Test complete flow