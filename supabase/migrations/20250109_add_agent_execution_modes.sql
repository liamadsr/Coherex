-- Add execution mode support for agents
-- Supports ephemeral (one-off), persistent (long-running), and hybrid modes

-- Add execution mode to agents table
ALTER TABLE agents 
ADD COLUMN IF NOT EXISTS execution_mode TEXT DEFAULT 'ephemeral' 
CHECK (execution_mode IN ('ephemeral', 'persistent', 'hybrid'));

ALTER TABLE agents
ADD COLUMN IF NOT EXISTS session_config JSONB DEFAULT '{
  "idle_timeout_minutes": 30,
  "max_session_duration_hours": 24,
  "auto_hibernate": true,
  "preserve_context": true,
  "max_context_messages": 50
}';

-- Track active agent sessions for persistent and hybrid modes
CREATE TABLE IF NOT EXISTS agent_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  agent_id UUID REFERENCES agents(id) ON DELETE CASCADE,
  sandbox_id TEXT UNIQUE, -- E2B sandbox ID
  status TEXT CHECK (status IN ('active', 'idle', 'hibernated', 'stopped', 'error')),
  started_at TIMESTAMPTZ DEFAULT NOW(),
  last_activity_at TIMESTAMPTZ DEFAULT NOW(),
  hibernated_at TIMESTAMPTZ,
  stopped_at TIMESTAMPTZ,
  conversation_context JSONB DEFAULT '[]', -- Message history
  execution_count INTEGER DEFAULT 0,
  total_duration_ms INTEGER DEFAULT 0,
  total_tokens_used INTEGER DEFAULT 0,
  cost_cents INTEGER DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  error_message TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Session activity tracking for audit and debugging
CREATE TABLE IF NOT EXISTS session_activities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  session_id UUID REFERENCES agent_sessions(id) ON DELETE CASCADE,
  activity_type TEXT CHECK (activity_type IN (
    'started', 'message_received', 'message_sent', 'execution', 
    'hibernated', 'resumed', 'stopped', 'error', 'timeout'
  )),
  input JSONB,
  output JSONB,
  duration_ms INTEGER,
  tokens_used INTEGER,
  error TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_agent_sessions_agent_id ON agent_sessions(agent_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_status ON agent_sessions(status);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_sandbox_id ON agent_sessions(sandbox_id);
CREATE INDEX IF NOT EXISTS idx_agent_sessions_last_activity ON agent_sessions(last_activity_at);
CREATE INDEX IF NOT EXISTS idx_session_activities_session_id ON session_activities(session_id);
CREATE INDEX IF NOT EXISTS idx_session_activities_created_at ON session_activities(created_at);

-- Function to auto-update last_activity_at
CREATE OR REPLACE FUNCTION update_session_last_activity()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE agent_sessions 
  SET last_activity_at = NOW(),
      execution_count = execution_count + 1
  WHERE id = NEW.session_id
    AND NEW.activity_type IN ('message_received', 'message_sent', 'execution');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger to update last activity
DROP TRIGGER IF EXISTS trigger_update_session_activity ON session_activities;
CREATE TRIGGER trigger_update_session_activity
AFTER INSERT ON session_activities
FOR EACH ROW
EXECUTE FUNCTION update_session_last_activity();

-- View for active sessions with agent details
CREATE OR REPLACE VIEW active_agent_sessions AS
SELECT 
  s.*,
  a.name as agent_name,
  a.model as agent_model,
  a.execution_mode,
  EXTRACT(EPOCH FROM (NOW() - s.last_activity_at)) / 60 as minutes_since_activity,
  CASE 
    WHEN s.status = 'active' AND EXTRACT(EPOCH FROM (NOW() - s.last_activity_at)) / 60 > 
         COALESCE((a.session_config->>'idle_timeout_minutes')::INTEGER, 30)
    THEN true
    ELSE false
  END as should_hibernate
FROM agent_sessions s
JOIN agents a ON s.agent_id = a.id
WHERE s.status IN ('active', 'idle');

-- Function to clean up old stopped sessions
CREATE OR REPLACE FUNCTION cleanup_old_sessions()
RETURNS void AS $$
BEGIN
  DELETE FROM agent_sessions
  WHERE status = 'stopped'
    AND stopped_at < NOW() - INTERVAL '7 days';
END;
$$ LANGUAGE plpgsql;