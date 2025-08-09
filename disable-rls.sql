-- Temporarily disable RLS for testing
ALTER TABLE agents DISABLE ROW LEVEL SECURITY;
ALTER TABLE data_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_data_sources DISABLE ROW LEVEL SECURITY;
ALTER TABLE agent_executions DISABLE ROW LEVEL SECURITY;
ALTER TABLE knowledge_documents DISABLE ROW LEVEL SECURITY;
ALTER TABLE teams DISABLE ROW LEVEL SECURITY;

-- Drop policies that reference auth.users
DROP POLICY IF EXISTS "Users can view their team's agents" ON agents;
DROP POLICY IF EXISTS "Users can create agents for their team" ON agents;
DROP POLICY IF EXISTS "Users can update their team's agents" ON agents;
DROP POLICY IF EXISTS "Users can delete their team's agents" ON agents;
DROP POLICY IF EXISTS "Users can view their team's data sources" ON data_sources;
DROP POLICY IF EXISTS "Users can manage their team's data sources" ON data_sources;