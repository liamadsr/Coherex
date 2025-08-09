-- Add missing fields to match mock agent structure
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS email TEXT,
ADD COLUMN IF NOT EXISTS personality TEXT[],
ADD COLUMN IF NOT EXISTS capabilities TEXT[],
ADD COLUMN IF NOT EXISTS channels TEXT[],
ADD COLUMN IF NOT EXISTS integrations TEXT[],
ADD COLUMN IF NOT EXISTS knowledge_sources TEXT[],
ADD COLUMN IF NOT EXISTS model TEXT,
ADD COLUMN IF NOT EXISTS temperature DECIMAL(2,1),
ADD COLUMN IF NOT EXISTS max_tokens INTEGER,
ADD COLUMN IF NOT EXISTS system_prompt TEXT,
ADD COLUMN IF NOT EXISTS avatar TEXT,
ADD COLUMN IF NOT EXISTS metrics JSONB DEFAULT '{
  "conversationsHandled": 0,
  "averageResponseTime": "0s",
  "satisfactionScore": 0,
  "accuracyScore": 0,
  "uptime": 100,
  "totalMessages": 0,
  "successfulResolutions": 0
}',
ADD COLUMN IF NOT EXISTS organization_id UUID,
ADD COLUMN IF NOT EXISTS user_id UUID;

-- Update the agent_status enum to match mock values
ALTER TYPE agent_status ADD VALUE IF NOT EXISTS 'inactive';
ALTER TYPE agent_status ADD VALUE IF NOT EXISTS 'training';
ALTER TYPE agent_status ADD VALUE IF NOT EXISTS 'error';

-- Add indexes for new fields
CREATE INDEX IF NOT EXISTS idx_agents_email ON agents(email);
CREATE INDEX IF NOT EXISTS idx_agents_model ON agents(model);
CREATE INDEX IF NOT EXISTS idx_agents_organization_id ON agents(organization_id);
CREATE INDEX IF NOT EXISTS idx_agents_user_id ON agents(user_id);

-- Add GIN indexes for array fields for better query performance
CREATE INDEX IF NOT EXISTS idx_agents_capabilities ON agents USING GIN(capabilities);
CREATE INDEX IF NOT EXISTS idx_agents_channels ON agents USING GIN(channels);
CREATE INDEX IF NOT EXISTS idx_agents_integrations ON agents USING GIN(integrations);