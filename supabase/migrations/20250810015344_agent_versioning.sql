-- Agent Versioning System Migration

-- 1. Create agent_versions table
CREATE TABLE IF NOT EXISTS agent_versions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID NOT NULL REFERENCES agents(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('draft', 'production', 'archived')),
  
  -- Agent configuration (store all agent data)
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  
  -- Metadata
  published_at TIMESTAMPTZ,
  published_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Constraints
  UNIQUE(agent_id, version_number)
);

-- Indexes for agent_versions
CREATE INDEX idx_agent_versions_agent_id ON agent_versions(agent_id);
CREATE INDEX idx_agent_versions_status ON agent_versions(status);
CREATE INDEX idx_agent_versions_created_at ON agent_versions(created_at DESC);

-- 2. Create preview_links table
CREATE TABLE IF NOT EXISTS preview_links (
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
  CHECK (max_conversations > 0),
  CHECK (conversation_count >= 0)
);

-- Indexes for preview_links
CREATE INDEX idx_preview_links_token ON preview_links(token) WHERE revoked_at IS NULL;
CREATE INDEX idx_preview_links_expires ON preview_links(expires_at) WHERE revoked_at IS NULL;
CREATE INDEX idx_preview_links_agent_version ON preview_links(agent_version_id);

-- 3. Create preview_feedback table
CREATE TABLE IF NOT EXISTS preview_feedback (
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

-- Index for preview_feedback
CREATE INDEX idx_preview_feedback_link ON preview_feedback(preview_link_id);
CREATE INDEX idx_preview_feedback_created ON preview_feedback(created_at DESC);

-- 4. Create preview_conversations table
CREATE TABLE IF NOT EXISTS preview_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  preview_link_id UUID NOT NULL REFERENCES preview_links(id) ON DELETE CASCADE,
  messages JSONB NOT NULL DEFAULT '[]',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  ended_at TIMESTAMPTZ
);

-- Index for preview_conversations
CREATE INDEX idx_preview_conversations_link ON preview_conversations(preview_link_id);
CREATE INDEX idx_preview_conversations_created ON preview_conversations(created_at DESC);

-- 5. Add version columns to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS current_version_id UUID REFERENCES agent_versions(id),
ADD COLUMN IF NOT EXISTS draft_version_id UUID REFERENCES agent_versions(id);

-- Create indexes for new columns
CREATE INDEX IF NOT EXISTS idx_agents_current_version ON agents(current_version_id);
CREATE INDEX IF NOT EXISTS idx_agents_draft_version ON agents(draft_version_id);
-- 6. Migrate existing agents to version 1
-- This creates version 1 for all existing agents
INSERT INTO agent_versions (
  agent_id,
  version_number,
  status,
  name,
  description,
  config,
  published_at,
  created_at
)
SELECT 
  id as agent_id,
  1 as version_number,
  CASE 
    WHEN status = 'draft' THEN 'draft'
    WHEN status IN ('active', 'inactive', 'training', 'error') THEN 'production'
    ELSE 'archived'
  END as status,
  name,
  description,
  jsonb_build_object(
    'model', COALESCE(model, 'gpt-4'),
    'temperature', COALESCE(temperature, 0.7),
    'maxTokens', COALESCE(max_tokens, 2000),
    'systemPrompt', system_prompt,
    'personality', personality,
    'capabilities', capabilities,
    'channels', channels,
    'integrations', integrations,
    'knowledgeSources', knowledge_sources,
    'email', email,
    'avatar', avatar,
    'executionMode', COALESCE(execution_mode, 'ephemeral'),
    'config', config
  ) as config,
  CASE 
    WHEN status != 'draft' THEN created_at
    ELSE NULL
  END as published_at,
  created_at
FROM agents
WHERE NOT EXISTS (
  SELECT 1 FROM agent_versions av WHERE av.agent_id = agents.id
);

-- 7. Update agents to reference their version 1
UPDATE agents 
SET current_version_id = av.id
FROM agent_versions av
WHERE av.agent_id = agents.id 
  AND av.version_number = 1 
  AND av.status = 'production'
  AND agents.current_version_id IS NULL;

UPDATE agents 
SET draft_version_id = av.id
FROM agent_versions av
WHERE av.agent_id = agents.id 
  AND av.version_number = 1 
  AND av.status = 'draft'
  AND agents.draft_version_id IS NULL;

-- 8. Helper functions for version management

-- Function to create a new draft version
CREATE OR REPLACE FUNCTION create_draft_version(p_agent_id UUID)
RETURNS UUID AS $$
DECLARE
  v_new_version_id UUID;
  v_next_version_number INTEGER;
BEGIN
  -- Get next version number
  SELECT COALESCE(MAX(version_number), 0) + 1 
  INTO v_next_version_number
  FROM agent_versions 
  WHERE agent_id = p_agent_id;
  
  -- Create new draft version copying from current production or latest version
  INSERT INTO agent_versions (
    agent_id, version_number, status, name, description, config, created_by
  )
  SELECT 
    p_agent_id,
    v_next_version_number,
    'draft',
    av.name,
    av.description,
    av.config,
    auth.uid()
  FROM agent_versions av
  WHERE av.agent_id = p_agent_id
  AND av.version_number = (
    SELECT MAX(version_number) 
    FROM agent_versions 
    WHERE agent_id = p_agent_id
  )
  RETURNING id INTO v_new_version_id;
  
  -- Update agent's draft_version_id
  UPDATE agents 
  SET draft_version_id = v_new_version_id
  WHERE id = p_agent_id;
  
  RETURN v_new_version_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to publish a version
CREATE OR REPLACE FUNCTION publish_version(p_version_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_agent_id UUID;
  v_old_production_id UUID;
BEGIN
  -- Get agent_id
  SELECT agent_id INTO v_agent_id
  FROM agent_versions
  WHERE id = p_version_id;
  
  -- Archive current production version
  UPDATE agent_versions
  SET status = 'archived'
  WHERE agent_id = v_agent_id
  AND status = 'production';
  
  -- Set new version as production
  UPDATE agent_versions
  SET 
    status = 'production',
    published_at = NOW(),
    published_by = auth.uid()
  WHERE id = p_version_id;
  
  -- Update agent's current_version_id
  UPDATE agents
  SET 
    current_version_id = p_version_id,
    draft_version_id = NULL
  WHERE id = v_agent_id;
  
  RETURN TRUE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to rollback to a previous version
CREATE OR REPLACE FUNCTION rollback_to_version(p_version_id UUID)
RETURNS UUID AS $$
DECLARE
  v_agent_id UUID;
  v_new_draft_id UUID;
  v_version_data RECORD;
BEGIN
  -- Get version data
  SELECT * INTO v_version_data
  FROM agent_versions
  WHERE id = p_version_id;
  
  -- Create new draft from that version
  INSERT INTO agent_versions (
    agent_id, version_number, status, name, description, config, created_by
  )
  VALUES (
    v_version_data.agent_id,
    (SELECT COALESCE(MAX(version_number), 0) + 1 FROM agent_versions WHERE agent_id = v_version_data.agent_id),
    'draft',
    v_version_data.name,
    v_version_data.description,
    v_version_data.config,
    auth.uid()
  )
  RETURNING id INTO v_new_draft_id;
  
  -- Update agent's draft_version_id
  UPDATE agents
  SET draft_version_id = v_new_draft_id
  WHERE id = v_version_data.agent_id;
  
  RETURN v_new_draft_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 9. Row Level Security (RLS) policies

-- Enable RLS on new tables
ALTER TABLE agent_versions ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_links ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE preview_conversations ENABLE ROW LEVEL SECURITY;

-- Agent versions policies
CREATE POLICY "Users can view agent versions they own"
  ON agent_versions FOR SELECT
  USING (
    agent_id IN (
      SELECT id FROM agents 
      WHERE created_by = auth.uid() OR team_id IS NOT NULL
    )
  );

CREATE POLICY "Users can create agent versions they own"
  ON agent_versions FOR INSERT
  WITH CHECK (
    agent_id IN (
      SELECT id FROM agents WHERE created_by = auth.uid()
    )
  );

CREATE POLICY "Users can update draft versions they own"
  ON agent_versions FOR UPDATE
  USING (
    status = 'draft' AND
    agent_id IN (
      SELECT id FROM agents WHERE created_by = auth.uid()
    )
  );

-- Preview links policies
CREATE POLICY "Users can view their preview links"
  ON preview_links FOR SELECT
  USING (created_by = auth.uid());

CREATE POLICY "Users can create preview links"
  ON preview_links FOR INSERT
  WITH CHECK (created_by = auth.uid());

CREATE POLICY "Users can update their preview links"
  ON preview_links FOR UPDATE
  USING (created_by = auth.uid());

-- Preview feedback is public (anyone with link can submit)
CREATE POLICY "Anyone can submit preview feedback"
  ON preview_feedback FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Link creators can view feedback"
  ON preview_feedback FOR SELECT
  USING (
    preview_link_id IN (
      SELECT id FROM preview_links WHERE created_by = auth.uid()
    )
  );

-- Preview conversations are accessible by token (handled at API level)
CREATE POLICY "Preview conversations are managed by API"
  ON preview_conversations FOR ALL
  USING (true);