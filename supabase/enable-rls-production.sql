-- Production RLS policies with proper authentication
-- Run this when you have Supabase Auth configured

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Drop any existing dev policies
DROP POLICY IF EXISTS "Allow public read access to agents" ON agents;
DROP POLICY IF EXISTS "Allow public insert access to agents" ON agents;
DROP POLICY IF EXISTS "Allow public update access to agents" ON agents;
DROP POLICY IF EXISTS "Allow public delete access to agents" ON agents;
DROP POLICY IF EXISTS "Allow public read access to data_sources" ON data_sources;
DROP POLICY IF EXISTS "Allow public insert access to data_sources" ON data_sources;
DROP POLICY IF EXISTS "Allow public update access to data_sources" ON data_sources;
DROP POLICY IF EXISTS "Allow public delete access to data_sources" ON data_sources;
DROP POLICY IF EXISTS "Allow public read access to agent_executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow public insert access to agent_executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow public update access to agent_executions" ON agent_executions;
DROP POLICY IF EXISTS "Allow public read access to agent_data_sources" ON agent_data_sources;
DROP POLICY IF EXISTS "Allow public insert access to agent_data_sources" ON agent_data_sources;
DROP POLICY IF EXISTS "Allow public delete access to agent_data_sources" ON agent_data_sources;
DROP POLICY IF EXISTS "Allow public read access to knowledge_documents" ON knowledge_documents;
DROP POLICY IF EXISTS "Allow public insert access to knowledge_documents" ON knowledge_documents;
DROP POLICY IF EXISTS "Allow public update access to knowledge_documents" ON knowledge_documents;
DROP POLICY IF EXISTS "Allow public delete access to knowledge_documents" ON knowledge_documents;
DROP POLICY IF EXISTS "Allow public read access to teams" ON teams;
DROP POLICY IF EXISTS "Allow public insert access to teams" ON teams;
DROP POLICY IF EXISTS "Allow public update access to teams" ON teams;

-- Agents policies (authenticated users only)
CREATE POLICY "Users can view their own agents" ON agents
  FOR SELECT USING (
    auth.uid() = created_by 
    OR 
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create agents" ON agents
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Users can update their own agents" ON agents
  FOR UPDATE USING (
    auth.uid() = created_by 
    OR 
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can delete their own agents" ON agents
  FOR DELETE USING (
    auth.uid() = created_by 
    OR 
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Data sources policies
CREATE POLICY "Users can view their team's data sources" ON data_sources
  FOR SELECT USING (
    auth.uid() = created_by 
    OR 
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create data sources" ON data_sources
  FOR INSERT WITH CHECK (
    auth.uid() = created_by
  );

CREATE POLICY "Users can update their team's data sources" ON data_sources
  FOR UPDATE USING (
    auth.uid() = created_by 
    OR 
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can delete their team's data sources" ON data_sources
  FOR DELETE USING (
    auth.uid() = created_by 
    OR 
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Agent executions policies
CREATE POLICY "Users can view executions of their agents" ON agent_executions
  FOR SELECT USING (
    agent_id IN (
      SELECT id FROM agents WHERE created_by = auth.uid()
    )
    OR
    agent_id IN (
      SELECT id FROM agents WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can create executions for their agents" ON agent_executions
  FOR INSERT WITH CHECK (
    agent_id IN (
      SELECT id FROM agents WHERE created_by = auth.uid()
    )
    OR
    agent_id IN (
      SELECT id FROM agents WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

CREATE POLICY "Users can update executions of their agents" ON agent_executions
  FOR UPDATE USING (
    agent_id IN (
      SELECT id FROM agents WHERE created_by = auth.uid()
    )
    OR
    agent_id IN (
      SELECT id FROM agents WHERE team_id IN (
        SELECT team_id FROM team_members WHERE user_id = auth.uid()
      )
    )
  );

-- Knowledge documents policies
CREATE POLICY "Users can view their team's documents" ON knowledge_documents
  FOR SELECT USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create documents for their team" ON knowledge_documents
  FOR INSERT WITH CHECK (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their team's documents" ON knowledge_documents
  FOR UPDATE USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role IN ('admin', 'editor')
    )
  );

CREATE POLICY "Users can delete their team's documents" ON knowledge_documents
  FOR DELETE USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Teams policies
CREATE POLICY "Users can view teams they belong to" ON teams
  FOR SELECT USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Authenticated users can create teams" ON teams
  FOR INSERT WITH CHECK (
    auth.uid() IS NOT NULL
  );

CREATE POLICY "Team admins can update team details" ON teams
  FOR UPDATE USING (
    id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- Note: You'll need to create a team_members table for proper team management
CREATE TABLE IF NOT EXISTS team_members (
  team_id UUID REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  role TEXT CHECK (role IN ('admin', 'editor', 'viewer')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  PRIMARY KEY (team_id, user_id)
);

ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their team memberships" ON team_members
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Team admins can manage members" ON team_members
  FOR ALL USING (
    team_id IN (
      SELECT team_id FROM team_members WHERE user_id = auth.uid() AND role = 'admin'
    )
  );