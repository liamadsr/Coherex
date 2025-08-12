-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "vector";

-- Create enums
CREATE TYPE agent_status AS ENUM ('draft', 'active', 'paused', 'archived');
CREATE TYPE data_source_type AS ENUM ('gmail', 'slack', 'github', 'database', 'api', 'file');
CREATE TYPE data_source_status AS ENUM ('active', 'inactive', 'error');
CREATE TYPE execution_status AS ENUM ('pending', 'running', 'completed', 'failed');

-- Teams table
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agents table
CREATE TABLE agents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  description TEXT,
  config JSONB NOT NULL DEFAULT '{}',
  status agent_status DEFAULT 'draft',
  version INTEGER DEFAULT 1,
  created_by UUID REFERENCES auth.users(id),
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Data Sources table (centralized, shared across agents)
CREATE TABLE data_sources (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  type data_source_type NOT NULL,
  config JSONB NOT NULL DEFAULT '{}', -- Connection details (encrypted)
  status data_source_status DEFAULT 'active',
  team_id UUID REFERENCES teams(id),
  created_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Agent-DataSource associations
CREATE TABLE agent_data_sources (
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  data_source_id UUID REFERENCES data_sources(id) ON DELETE CASCADE,
  permissions JSONB DEFAULT '{"read": true, "write": false}',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (agent_id, data_source_id)
);

-- Agent Executions
CREATE TABLE agent_executions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  sandbox_id TEXT, -- E2B sandbox ID
  status execution_status NOT NULL DEFAULT 'pending',
  input JSONB,
  output JSONB,
  logs TEXT[],
  duration_ms INTEGER,
  cost_cents INTEGER,
  started_at TIMESTAMPTZ,
  completed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Knowledge Documents (for RAG)
CREATE TABLE knowledge_documents (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  content TEXT,
  embedding vector(1536), -- OpenAI embeddings dimension
  metadata JSONB,
  data_source_id UUID REFERENCES data_sources(id),
  team_id UUID REFERENCES teams(id),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_agents_team_id ON agents(team_id);
CREATE INDEX idx_agents_status ON agents(status);
CREATE INDEX idx_agents_created_by ON agents(created_by);

CREATE INDEX idx_data_sources_team_id ON data_sources(team_id);
CREATE INDEX idx_data_sources_type ON data_sources(type);
CREATE INDEX idx_data_sources_status ON data_sources(status);

CREATE INDEX idx_agent_executions_agent_id ON agent_executions(agent_id);
CREATE INDEX idx_agent_executions_status ON agent_executions(status);
CREATE INDEX idx_agent_executions_created_at ON agent_executions(created_at);

CREATE INDEX idx_knowledge_documents_team_id ON knowledge_documents(team_id);
CREATE INDEX idx_knowledge_documents_data_source_id ON knowledge_documents(data_source_id);

-- Vector similarity search index
CREATE INDEX idx_knowledge_documents_embedding ON knowledge_documents 
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Updated at trigger function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_agents_updated_at BEFORE UPDATE ON agents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_data_sources_updated_at BEFORE UPDATE ON data_sources
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_teams_updated_at BEFORE UPDATE ON teams
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_knowledge_documents_updated_at BEFORE UPDATE ON knowledge_documents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Row Level Security (RLS) Policies
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Basic RLS policies (to be refined based on auth strategy)
-- Allow authenticated users to see their team's data
CREATE POLICY "Users can view their team's agents" ON agents
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can create agents for their team" ON agents
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can update their team's agents" ON agents
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their team's agents" ON agents
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM auth.users WHERE id = auth.uid()
    )
  );

-- Similar policies for other tables
CREATE POLICY "Users can view their team's data sources" ON data_sources
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM auth.users WHERE id = auth.uid()
    )
  );

CREATE POLICY "Users can manage their team's data sources" ON data_sources
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM auth.users WHERE id = auth.uid()
    )
  );