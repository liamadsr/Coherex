-- Re-enable RLS with development-friendly policies
-- These policies allow public access for development
-- Replace with proper auth-based policies for production

-- Enable RLS on all tables
ALTER TABLE agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_data_sources ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions ENABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;

-- Development policies (allows all operations for testing)
-- IMPORTANT: Replace these with proper auth policies before production!

-- Agents policies (public access for development)
CREATE POLICY "Allow public read access to agents" ON agents
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to agents" ON agents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to agents" ON agents
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to agents" ON agents
  FOR DELETE USING (true);

-- Data sources policies (public access for development)
CREATE POLICY "Allow public read access to data_sources" ON data_sources
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to data_sources" ON data_sources
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to data_sources" ON data_sources
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to data_sources" ON data_sources
  FOR DELETE USING (true);

-- Agent executions policies (public access for development)
CREATE POLICY "Allow public read access to agent_executions" ON agent_executions
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to agent_executions" ON agent_executions
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to agent_executions" ON agent_executions
  FOR UPDATE USING (true);

-- Agent data sources policies (public access for development)
CREATE POLICY "Allow public read access to agent_data_sources" ON agent_data_sources
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to agent_data_sources" ON agent_data_sources
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public delete access to agent_data_sources" ON agent_data_sources
  FOR DELETE USING (true);

-- Knowledge documents policies (public access for development)
CREATE POLICY "Allow public read access to knowledge_documents" ON knowledge_documents
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to knowledge_documents" ON knowledge_documents
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to knowledge_documents" ON knowledge_documents
  FOR UPDATE USING (true);

CREATE POLICY "Allow public delete access to knowledge_documents" ON knowledge_documents
  FOR DELETE USING (true);

-- Teams policies (public access for development)
CREATE POLICY "Allow public read access to teams" ON teams
  FOR SELECT USING (true);

CREATE POLICY "Allow public insert access to teams" ON teams
  FOR INSERT WITH CHECK (true);

CREATE POLICY "Allow public update access to teams" ON teams
  FOR UPDATE USING (true);

/*
NOTE: For production, replace the above policies with proper auth-based ones like:

CREATE POLICY "Users can view their own agents" ON agents
  FOR SELECT USING (auth.uid() = created_by);

CREATE POLICY "Users can create agents" ON agents
  FOR INSERT WITH CHECK (auth.uid() = created_by);

CREATE POLICY "Users can update their own agents" ON agents
  FOR UPDATE USING (auth.uid() = created_by);

CREATE POLICY "Users can delete their own agents" ON agents
  FOR DELETE USING (auth.uid() = created_by);
*/