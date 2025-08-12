export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      agents: {
        Row: {
          id: string
          name: string
          description: string | null
          config: Json
          status: 'draft' | 'active' | 'paused' | 'archived'
          version: number
          created_by: string | null
          team_id: string | null
          created_at: string
          updated_at: string
          current_version_id: string | null
          draft_version_id: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          config: Json
          status?: 'draft' | 'active' | 'paused' | 'archived'
          version?: number
          created_by?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
          current_version_id?: string | null
          draft_version_id?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          config?: Json
          status?: 'draft' | 'active' | 'paused' | 'archived'
          version?: number
          created_by?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
          current_version_id?: string | null
          draft_version_id?: string | null
        }
      }
      data_sources: {
        Row: {
          id: string
          name: string
          type: 'gmail' | 'slack' | 'github' | 'database' | 'api' | 'file'
          config: Json
          status: 'active' | 'inactive' | 'error'
          team_id: string | null
          created_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          type: 'gmail' | 'slack' | 'github' | 'database' | 'api' | 'file'
          config: Json
          status?: 'active' | 'inactive' | 'error'
          team_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          type?: 'gmail' | 'slack' | 'github' | 'database' | 'api' | 'file'
          config?: Json
          status?: 'active' | 'inactive' | 'error'
          team_id?: string | null
          created_by?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agent_data_sources: {
        Row: {
          agent_id: string
          data_source_id: string
          permissions: Json | null
          created_at: string
        }
        Insert: {
          agent_id: string
          data_source_id: string
          permissions?: Json | null
          created_at?: string
        }
        Update: {
          agent_id?: string
          data_source_id?: string
          permissions?: Json | null
          created_at?: string
        }
      }
      agent_executions: {
        Row: {
          id: string
          agent_id: string
          sandbox_id: string | null
          status: 'pending' | 'running' | 'completed' | 'failed'
          input: Json | null
          output: Json | null
          logs: string[] | null
          duration_ms: number | null
          cost_cents: number | null
          started_at: string | null
          completed_at: string | null
          created_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          sandbox_id?: string | null
          status: 'pending' | 'running' | 'completed' | 'failed'
          input?: Json | null
          output?: Json | null
          logs?: string[] | null
          duration_ms?: number | null
          cost_cents?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          sandbox_id?: string | null
          status?: 'pending' | 'running' | 'completed' | 'failed'
          input?: Json | null
          output?: Json | null
          logs?: string[] | null
          duration_ms?: number | null
          cost_cents?: number | null
          started_at?: string | null
          completed_at?: string | null
          created_at?: string
        }
      }
      knowledge_documents: {
        Row: {
          id: string
          title: string
          content: string | null
          embedding: number[] | null
          metadata: Json | null
          data_source_id: string | null
          team_id: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content?: string | null
          embedding?: number[] | null
          metadata?: Json | null
          data_source_id?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string | null
          embedding?: number[] | null
          metadata?: Json | null
          data_source_id?: string | null
          team_id?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      teams: {
        Row: {
          id: string
          name: string
          description: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          created_at?: string
          updated_at?: string
        }
      }
      agent_versions: {
        Row: {
          id: string
          agent_id: string
          version_number: number
          status: 'draft' | 'production' | 'archived'
          name: string
          description: string | null
          config: Json
          published_at: string | null
          published_by: string | null
          created_at: string
          created_by: string | null
          updated_at: string
        }
        Insert: {
          id?: string
          agent_id: string
          version_number: number
          status: 'draft' | 'production' | 'archived'
          name: string
          description?: string | null
          config?: Json
          published_at?: string | null
          published_by?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
        Update: {
          id?: string
          agent_id?: string
          version_number?: number
          status?: 'draft' | 'production' | 'archived'
          name?: string
          description?: string | null
          config?: Json
          published_at?: string | null
          published_by?: string | null
          created_at?: string
          created_by?: string | null
          updated_at?: string
        }
      }
      preview_links: {
        Row: {
          id: string
          agent_version_id: string
          token: string
          expires_at: string
          password_hash: string | null
          max_conversations: number
          conversation_count: number
          include_feedback: boolean
          created_by: string | null
          created_at: string
          revoked_at: string | null
          last_accessed_at: string | null
        }
        Insert: {
          id?: string
          agent_version_id: string
          token?: string
          expires_at: string
          password_hash?: string | null
          max_conversations?: number
          conversation_count?: number
          include_feedback?: boolean
          created_by?: string | null
          created_at?: string
          revoked_at?: string | null
          last_accessed_at?: string | null
        }
        Update: {
          id?: string
          agent_version_id?: string
          token?: string
          expires_at?: string
          password_hash?: string | null
          max_conversations?: number
          conversation_count?: number
          include_feedback?: boolean
          created_by?: string | null
          created_at?: string
          revoked_at?: string | null
          last_accessed_at?: string | null
        }
      }
      preview_feedback: {
        Row: {
          id: string
          preview_link_id: string
          name: string | null
          email: string | null
          rating: number | null
          feedback_text: string | null
          metadata: Json
          created_at: string
          ip_address: string | null
          user_agent: string | null
        }
        Insert: {
          id?: string
          preview_link_id: string
          name?: string | null
          email?: string | null
          rating?: number | null
          feedback_text?: string | null
          metadata?: Json
          created_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
        Update: {
          id?: string
          preview_link_id?: string
          name?: string | null
          email?: string | null
          rating?: number | null
          feedback_text?: string | null
          metadata?: Json
          created_at?: string
          ip_address?: string | null
          user_agent?: string | null
        }
      }
      preview_conversations: {
        Row: {
          id: string
          preview_link_id: string
          messages: Json
          created_at: string
          ended_at: string | null
        }
        Insert: {
          id?: string
          preview_link_id: string
          messages?: Json
          created_at?: string
          ended_at?: string | null
        }
        Update: {
          id?: string
          preview_link_id?: string
          messages?: Json
          created_at?: string
          ended_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      create_draft_version: {
        Args: { p_agent_id: string }
        Returns: string
      }
      publish_version: {
        Args: { p_version_id: string }
        Returns: boolean
      }
      rollback_to_version: {
        Args: { p_version_id: string }
        Returns: string
      }
    }
    Enums: {
      agent_status: 'draft' | 'active' | 'paused' | 'archived'
      data_source_type: 'gmail' | 'slack' | 'github' | 'database' | 'api' | 'file'
      data_source_status: 'active' | 'inactive' | 'error'
      execution_status: 'pending' | 'running' | 'completed' | 'failed'
    }
  }
}