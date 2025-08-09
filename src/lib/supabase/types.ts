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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      agent_status: 'draft' | 'active' | 'paused' | 'archived'
      data_source_type: 'gmail' | 'slack' | 'github' | 'database' | 'api' | 'file'
      data_source_status: 'active' | 'inactive' | 'error'
      execution_status: 'pending' | 'running' | 'completed' | 'failed'
    }
  }
}