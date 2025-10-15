export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      ai_insights: {
        Row: {
          actionable: boolean
          category: string
          confidence: number
          created_at: string
          description: string
          id: string
          impact_value: string | null
          metadata: Json | null
          organization_id: string | null
          priority: string
          related_module: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          actionable?: boolean
          category: string
          confidence?: number
          created_at?: string
          description: string
          id?: string
          impact_value?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          related_module?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          actionable?: boolean
          category?: string
          confidence?: number
          created_at?: string
          description?: string
          id?: string
          impact_value?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          related_module?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_reports: {
        Row: {
          content: string
          created_at: string
          date_range_end: string | null
          date_range_start: string | null
          format: string
          generated_at: string
          id: string
          modules: string[] | null
          raw_data: Json | null
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          format: string
          generated_at?: string
          id?: string
          modules?: string[] | null
          raw_data?: Json | null
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          date_range_end?: string | null
          date_range_start?: string | null
          format?: string
          generated_at?: string
          id?: string
          modules?: string[] | null
          raw_data?: Json | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_generated_documents: {
        Row: {
          id: string
          title: string
          content: string
          prompt: string
          generated_by: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          title: string
          content: string
          prompt: string
          generated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          title?: string
          content?: string
          prompt?: string
          generated_by?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_comments: {
        Row: {
          content: string
          created_at: string
          document_id: string
          id: string
          user_id: string | null
        }
        Insert: {
          content: string
          created_at?: string
          document_id: string
          id?: string
          user_id?: string | null
        }
        Update: {
          content?: string
          created_at?: string
          document_id?: string
          id?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_comments_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_comments_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      document_versions: {
        Row: {
          content: string
          created_at: string | null
          document_id: string
          id: string
          updated_by: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          document_id: string
          id?: string
          updated_by?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          document_id?: string
          id?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ai_generated_documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_versions_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_suggestions: {
        Row: {
          action_data: Json | null
          created_at: string | null
          description: string
          id: string
          is_acted_upon: boolean | null
          is_dismissed: boolean | null
          is_read: boolean | null
          organization_id: string | null
          priority: number | null
          tenant_id: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
          valid_until: string | null
        }
        Insert: {
          action_data?: Json | null
          created_at?: string | null
          description: string
          id?: string
          is_acted_upon?: boolean | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          organization_id?: string | null
          priority?: number | null
          tenant_id?: string | null
          title: string
          type: string
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Update: {
          action_data?: Json | null
          created_at?: string | null
          description?: string
          id?: string
          is_acted_upon?: boolean | null
          is_dismissed?: boolean | null
          is_read?: boolean | null
          organization_id?: string | null
          priority?: number | null
          tenant_id?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_suggestions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_suggestions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      alert_votes: {
        Row: {
          created_at: string | null
          id: string
          shared_alert_id: string
          user_id: string
          vote_type: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          shared_alert_id: string
          user_id: string
          vote_type?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          shared_alert_id?: string
          user_id?: string
          vote_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "alert_votes_shared_alert_id_fkey"
            columns: ["shared_alert_id"]
            isOneToOne: false
            referencedRelation: "shared_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string
          resource_id: string | null
          resource_type: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id: string
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      automated_reports: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          filters: Json | null
          format: string | null
          id: string
          is_active: boolean | null
          last_generated_at: string | null
          name: string
          next_scheduled_at: string | null
          organization_id: string | null
          recipients: Json
          report_type: string
          schedule_cron: string
          template_config: Json | null
          tenant_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          name: string
          next_scheduled_at?: string | null
          organization_id?: string | null
          recipients?: Json
          report_type: string
          schedule_cron: string
          template_config?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          filters?: Json | null
          format?: string | null
          id?: string
          is_active?: boolean | null
          last_generated_at?: string | null
          name?: string
          next_scheduled_at?: string | null
          organization_id?: string | null
          recipients?: Json
          report_type?: string
          schedule_cron?: string
          template_config?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automated_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automated_reports_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_executions: {
        Row: {
          completed_at: string | null
          duration_ms: number | null
          error_message: string | null
          execution_log: Json | null
          id: string
          started_at: string | null
          status: string
          trigger_data: Json | null
          triggered_by: string | null
          workflow_id: string | null
        }
        Insert: {
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_log?: Json | null
          id?: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          triggered_by?: string | null
          workflow_id?: string | null
        }
        Update: {
          completed_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          execution_log?: Json | null
          id?: string
          started_at?: string | null
          status?: string
          trigger_data?: Json | null
          triggered_by?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "automation_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_workflows: {
        Row: {
          actions: Json
          conditions: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          organization_id: string | null
          tenant_id: string | null
          trigger_config: Json
          trigger_type: string
          updated_at: string | null
        }
        Insert: {
          actions?: Json
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          organization_id?: string | null
          tenant_id?: string | null
          trigger_config?: Json
          trigger_type: string
          updated_at?: string | null
        }
        Update: {
          actions?: Json
          conditions?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          organization_id?: string | null
          tenant_id?: string | null
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_workflows_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      certificate_alerts: {
        Row: {
          alert_date: string
          alert_type: string
          certificate_id: string
          created_at: string
          id: string
          is_read: boolean | null
        }
        Insert: {
          alert_date?: string
          alert_type: string
          certificate_id: string
          created_at?: string
          id?: string
          is_read?: boolean | null
        }
        Update: {
          alert_date?: string
          alert_type?: string
          certificate_id?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "certificate_alerts_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "employee_certificates"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          certificate_number: string
          certificate_type: string
          created_at: string | null
          employee_id: string | null
          expiry_date: string
          id: string
          issue_date: string
          issuing_authority: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          certificate_number: string
          certificate_type: string
          created_at?: string | null
          employee_id?: string | null
          expiry_date: string
          id?: string
          issue_date: string
          issuing_authority: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          certificate_number?: string
          certificate_type?: string
          created_at?: string | null
          employee_id?: string | null
          expiry_date?: string
          id?: string
          issue_date?: string
          issuing_authority?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certificates_employee_id_fkey"
            columns: ["employee_id"]
            isOneToOne: false
            referencedRelation: "employees"
            referencedColumns: ["id"]
          },
        ]
      }
      certification_requirements: {
        Row: {
          certification_type_id: string | null
          created_at: string | null
          experience_required_months: number | null
          id: string
          is_mandatory: boolean | null
          position: string
          updated_at: string | null
        }
        Insert: {
          certification_type_id?: string | null
          created_at?: string | null
          experience_required_months?: number | null
          id?: string
          is_mandatory?: boolean | null
          position: string
          updated_at?: string | null
        }
        Update: {
          certification_type_id?: string | null
          created_at?: string | null
          experience_required_months?: number | null
          id?: string
          is_mandatory?: boolean | null
          position?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "certification_requirements_certification_type_id_fkey"
            columns: ["certification_type_id"]
            isOneToOne: false
            referencedRelation: "maritime_certification_types"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_members: {
        Row: {
          channel_id: string
          id: string
          joined_at: string
          last_read_at: string | null
          notification_settings: Json | null
          role: string
          user_id: string
        }
        Insert: {
          channel_id: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          notification_settings?: Json | null
          role?: string
          user_id: string
        }
        Update: {
          channel_id?: string
          id?: string
          joined_at?: string
          last_read_at?: string | null
          notification_settings?: Json | null
          role?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_ai_analysis: {
        Row: {
          analysis_data: Json
          analysis_type: string
          checklist_id: string
          confidence_level: number | null
          created_at: string
          created_by_ai_model: string
          critical_issues: number | null
          id: string
          inconsistencies: string[] | null
          issues_found: number | null
          missing_fields: string[] | null
          overall_score: number
          recommendations: string[] | null
        }
        Insert: {
          analysis_data?: Json
          analysis_type: string
          checklist_id: string
          confidence_level?: number | null
          created_at?: string
          created_by_ai_model?: string
          critical_issues?: number | null
          id?: string
          inconsistencies?: string[] | null
          issues_found?: number | null
          missing_fields?: string[] | null
          overall_score: number
          recommendations?: string[] | null
        }
        Update: {
          analysis_data?: Json
          analysis_type?: string
          checklist_id?: string
          confidence_level?: number | null
          created_at?: string
          created_by_ai_model?: string
          critical_issues?: number | null
          id?: string
          inconsistencies?: string[] | null
          issues_found?: number | null
          missing_fields?: string[] | null
          overall_score?: number
          recommendations?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_ai_analysis_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "operational_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_evidence: {
        Row: {
          captured_at: string
          checklist_item_id: string
          description: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          metadata: Json | null
        }
        Insert: {
          captured_at?: string
          checklist_item_id: string
          description?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          metadata?: Json | null
        }
        Update: {
          captured_at?: string
          checklist_item_id?: string
          description?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_evidence_checklist_item_id_fkey"
            columns: ["checklist_item_id"]
            isOneToOne: false
            referencedRelation: "checklist_items"
            referencedColumns: ["id"]
          },
        ]
      }
      checklist_items: {
        Row: {
          ai_validation_result: Json | null
          checklist_id: string
          completed: boolean
          completed_at: string | null
          completed_by: string | null
          created_at: string
          criticality: string
          description: string | null
          evidence_urls: string[] | null
          id: string
          notes: string | null
          order_index: number
          required: boolean
          title: string
          updated_at: string
          voice_note_url: string | null
        }
        Insert: {
          ai_validation_result?: Json | null
          checklist_id: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          criticality?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          notes?: string | null
          order_index?: number
          required?: boolean
          title: string
          updated_at?: string
          voice_note_url?: string | null
        }
        Update: {
          ai_validation_result?: Json | null
          checklist_id?: string
          completed?: boolean
          completed_at?: string | null
          completed_by?: string | null
          created_at?: string
          criticality?: string
          description?: string | null
          evidence_urls?: string[] | null
          id?: string
          notes?: string | null
          order_index?: number
          required?: boolean
          title?: string
          updated_at?: string
          voice_note_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_items_checklist_id_fkey"
            columns: ["checklist_id"]
            isOneToOne: false
            referencedRelation: "operational_checklists"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_channels: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          is_active: boolean
          is_public: boolean
          last_message_at: string | null
          member_count: number
          name: string
          organization_id: string | null
          settings: Json | null
          tenant_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          last_message_at?: string | null
          member_count?: number
          name: string
          organization_id?: string | null
          settings?: Json | null
          tenant_id?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          is_active?: boolean
          is_public?: boolean
          last_message_at?: string | null
          member_count?: number
          name?: string
          organization_id?: string | null
          settings?: Json | null
          tenant_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "communication_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "communication_channels_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      conversation_participants: {
        Row: {
          conversation_id: string
          id: string
          is_active: boolean | null
          joined_at: string
          role: string | null
          user_id: string
        }
        Insert: {
          conversation_id: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          role?: string | null
          user_id: string
        }
        Update: {
          conversation_id?: string
          id?: string
          is_active?: boolean | null
          joined_at?: string
          role?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "conversation_participants_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      conversations: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          last_message_at: string | null
          title: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          last_message_at?: string | null
          title?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      copilot_conversations: {
        Row: {
          context_data: Json | null
          ended_at: string | null
          id: string
          message_count: number | null
          session_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          context_data?: Json | null
          ended_at?: string | null
          id?: string
          message_count?: number | null
          session_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          context_data?: Json | null
          ended_at?: string | null
          id?: string
          message_count?: number | null
          session_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: []
      }
      copilot_messages: {
        Row: {
          actions: Json | null
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          suggestions: Json | null
          type: string
        }
        Insert: {
          actions?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          suggestions?: Json | null
          type: string
        }
        Update: {
          actions?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          suggestions?: Json | null
          type?: string
        }
        Relationships: [
          {
            foreignKeyName: "copilot_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "copilot_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_ai_insights: {
        Row: {
          analysis_type: string
          confidence_score: number | null
          created_at: string
          crew_member_id: string
          generated_by: string
          id: string
          improvement_areas: Json | null
          insights_data: Json
          next_actions: Json | null
          recommendations: Json | null
          risk_factors: Json | null
          strengths: Json | null
          updated_at: string
        }
        Insert: {
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          crew_member_id: string
          generated_by?: string
          id?: string
          improvement_areas?: Json | null
          insights_data?: Json
          next_actions?: Json | null
          recommendations?: Json | null
          risk_factors?: Json | null
          strengths?: Json | null
          updated_at?: string
        }
        Update: {
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          crew_member_id?: string
          generated_by?: string
          id?: string
          improvement_areas?: Json | null
          insights_data?: Json
          next_actions?: Json | null
          recommendations?: Json | null
          risk_factors?: Json | null
          strengths?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_ai_insights_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_ai_recommendations: {
        Row: {
          category: string
          confidence_score: number | null
          created_at: string | null
          crew_member_id: string
          deadline: string | null
          description: string
          id: string
          metadata: Json | null
          priority: string | null
          recommendation_type: string
          status: string | null
          suggested_action: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          confidence_score?: number | null
          created_at?: string | null
          crew_member_id: string
          deadline?: string | null
          description: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          recommendation_type: string
          status?: string | null
          suggested_action?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          confidence_score?: number | null
          created_at?: string | null
          crew_member_id?: string
          deadline?: string | null
          description?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          recommendation_type?: string
          status?: string | null
          suggested_action?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_ai_recommendations_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_assignments: {
        Row: {
          created_at: string | null
          crew_member_id: string | null
          end_date: string | null
          id: string
          notes: string | null
          position: string
          start_date: string
          status: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string | null
          crew_member_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          position: string
          start_date: string
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string | null
          crew_member_id?: string | null
          end_date?: string | null
          id?: string
          notes?: string | null
          position?: string
          start_date?: string
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_assignments_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_assignments_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_certifications: {
        Row: {
          certificate_file_url: string | null
          certificate_number: string | null
          certification_name: string
          certification_type: string
          completion_percentage: number | null
          course_location: string | null
          course_provider: string | null
          created_at: string
          crew_member_id: string
          document_url: string | null
          expiry_date: string | null
          grade: number | null
          id: string
          is_internal_course: boolean | null
          issue_date: string
          issuing_authority: string
          notes: string | null
          renewal_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          certificate_file_url?: string | null
          certificate_number?: string | null
          certification_name: string
          certification_type: string
          completion_percentage?: number | null
          course_location?: string | null
          course_provider?: string | null
          created_at?: string
          crew_member_id: string
          document_url?: string | null
          expiry_date?: string | null
          grade?: number | null
          id?: string
          is_internal_course?: boolean | null
          issue_date: string
          issuing_authority: string
          notes?: string | null
          renewal_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          certificate_file_url?: string | null
          certificate_number?: string | null
          certification_name?: string
          certification_type?: string
          completion_percentage?: number | null
          course_location?: string | null
          course_provider?: string | null
          created_at?: string
          crew_member_id?: string
          document_url?: string | null
          expiry_date?: string | null
          grade?: number | null
          id?: string
          is_internal_course?: boolean | null
          issue_date?: string
          issuing_authority?: string
          notes?: string | null
          renewal_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_certifications_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_communications: {
        Row: {
          content: string | null
          conversation_id: string | null
          created_at: string
          file_url: string | null
          id: string
          is_read: boolean | null
          is_urgent: boolean | null
          message_type: string
          metadata: Json | null
          read_at: string | null
          recipient_id: string | null
          sender_id: string | null
          voice_duration: number | null
        }
        Insert: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          message_type: string
          metadata?: Json | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          voice_duration?: number | null
        }
        Update: {
          content?: string | null
          conversation_id?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          is_read?: boolean | null
          is_urgent?: boolean | null
          message_type?: string
          metadata?: Json | null
          read_at?: string | null
          recipient_id?: string | null
          sender_id?: string | null
          voice_duration?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_communications_recipient_id_fkey"
            columns: ["recipient_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_communications_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_development_goals: {
        Row: {
          category: string
          completed_at: string | null
          created_at: string
          crew_member_id: string
          current_progress: number | null
          deadline: string | null
          description: string | null
          id: string
          milestones: Json | null
          priority: string | null
          progress_history: Json | null
          reward_points: number | null
          status: string | null
          target_value: number | null
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          category: string
          completed_at?: string | null
          created_at?: string
          crew_member_id: string
          current_progress?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          priority?: string | null
          progress_history?: Json | null
          reward_points?: number | null
          status?: string | null
          target_value?: number | null
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          completed_at?: string | null
          created_at?: string
          crew_member_id?: string
          current_progress?: number | null
          deadline?: string | null
          description?: string | null
          id?: string
          milestones?: Json | null
          priority?: string | null
          progress_history?: Json | null
          reward_points?: number | null
          status?: string | null
          target_value?: number | null
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_development_goals_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_documents: {
        Row: {
          created_at: string
          crew_member_id: string
          description: string | null
          document_name: string
          document_type: string
          file_size: number | null
          file_url: string
          id: string
          tags: string[] | null
          upload_date: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          crew_member_id: string
          description?: string | null
          document_name: string
          document_type: string
          file_size?: number | null
          file_url: string
          id?: string
          tags?: string[] | null
          upload_date?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          crew_member_id?: string
          description?: string | null
          document_name?: string
          document_type?: string
          file_size?: number | null
          file_url?: string
          id?: string
          tags?: string[] | null
          upload_date?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_documents_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_dossier: {
        Row: {
          cat_number: string | null
          cir_expiry_date: string | null
          cir_number: string | null
          created_at: string
          crew_member_id: string
          employee_registration: string | null
          id: string
          internal_registration: string
          notes: string | null
          previous_position: string | null
          profile_photo_url: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          cat_number?: string | null
          cir_expiry_date?: string | null
          cir_number?: string | null
          created_at?: string
          crew_member_id: string
          employee_registration?: string | null
          id?: string
          internal_registration: string
          notes?: string | null
          previous_position?: string | null
          profile_photo_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          cat_number?: string | null
          cir_expiry_date?: string | null
          cir_number?: string | null
          created_at?: string
          crew_member_id?: string
          employee_registration?: string | null
          id?: string
          internal_registration?: string
          notes?: string | null
          previous_position?: string | null
          profile_photo_url?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_dossier_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_dossier_documents: {
        Row: {
          created_at: string | null
          crew_member_id: string
          document_category: string
          document_name: string
          expiry_date: string | null
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          is_confidential: boolean | null
          notes: string | null
          tags: string[] | null
          upload_date: string | null
          uploaded_by: string | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string | null
          crew_member_id: string
          document_category: string
          document_name: string
          expiry_date?: string | null
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          is_confidential?: boolean | null
          notes?: string | null
          tags?: string[] | null
          upload_date?: string | null
          uploaded_by?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string | null
          crew_member_id?: string
          document_category?: string
          document_name?: string
          expiry_date?: string | null
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          is_confidential?: boolean | null
          notes?: string | null
          tags?: string[] | null
          upload_date?: string | null
          uploaded_by?: string | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_dossier_documents_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_embarkations: {
        Row: {
          completed_operations: number | null
          created_at: string
          crew_member_id: string
          disembark_date: string | null
          disembark_location: string | null
          disembark_location_details: Json | null
          dp_class: string | null
          dp_operation_modes: string[] | null
          dp_operation_type: string | null
          embark_date: string
          embark_location: string | null
          embark_location_details: Json | null
          equipment_operated: string[] | null
          function_role: string
          hours_worked: number | null
          id: string
          observations: string | null
          operation_notes: string | null
          performance_rating: number | null
          updated_at: string
          vessel_class: string | null
          vessel_name: string
          vessel_type: string
        }
        Insert: {
          completed_operations?: number | null
          created_at?: string
          crew_member_id: string
          disembark_date?: string | null
          disembark_location?: string | null
          disembark_location_details?: Json | null
          dp_class?: string | null
          dp_operation_modes?: string[] | null
          dp_operation_type?: string | null
          embark_date: string
          embark_location?: string | null
          embark_location_details?: Json | null
          equipment_operated?: string[] | null
          function_role: string
          hours_worked?: number | null
          id?: string
          observations?: string | null
          operation_notes?: string | null
          performance_rating?: number | null
          updated_at?: string
          vessel_class?: string | null
          vessel_name: string
          vessel_type: string
        }
        Update: {
          completed_operations?: number | null
          created_at?: string
          crew_member_id?: string
          disembark_date?: string | null
          disembark_location?: string | null
          disembark_location_details?: Json | null
          dp_class?: string | null
          dp_operation_modes?: string[] | null
          dp_operation_type?: string | null
          embark_date?: string
          embark_location?: string | null
          embark_location_details?: Json | null
          equipment_operated?: string[] | null
          function_role?: string
          hours_worked?: number | null
          id?: string
          observations?: string | null
          operation_notes?: string | null
          performance_rating?: number | null
          updated_at?: string
          vessel_class?: string | null
          vessel_name?: string
          vessel_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_embarkations_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_evaluations: {
        Row: {
          behavioral_score: number
          created_at: string
          crew_member_id: string
          embarkation_id: string | null
          evaluation_date: string
          evaluation_period: string
          evaluator_name: string
          id: string
          improvement_areas: string | null
          incidents: string | null
          overall_score: number
          positive_feedback: string | null
          technical_score: number
          updated_at: string
        }
        Insert: {
          behavioral_score: number
          created_at?: string
          crew_member_id: string
          embarkation_id?: string | null
          evaluation_date: string
          evaluation_period: string
          evaluator_name: string
          id?: string
          improvement_areas?: string | null
          incidents?: string | null
          overall_score: number
          positive_feedback?: string | null
          technical_score: number
          updated_at?: string
        }
        Update: {
          behavioral_score?: number
          created_at?: string
          crew_member_id?: string
          embarkation_id?: string | null
          evaluation_date?: string
          evaluation_period?: string
          evaluator_name?: string
          id?: string
          improvement_areas?: string | null
          incidents?: string | null
          overall_score?: number
          positive_feedback?: string | null
          technical_score?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_evaluations_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_evaluations_embarkation_id_fkey"
            columns: ["embarkation_id"]
            isOneToOne: false
            referencedRelation: "crew_embarkations"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_gamification_profiles: {
        Row: {
          achievements: Json | null
          badges_earned: Json | null
          created_at: string
          crew_member_id: string
          current_level: number | null
          id: string
          last_activity: string | null
          leaderboard_rank: number | null
          skill_progression: Json | null
          streaks: Json | null
          total_experience_points: number | null
          updated_at: string
        }
        Insert: {
          achievements?: Json | null
          badges_earned?: Json | null
          created_at?: string
          crew_member_id: string
          current_level?: number | null
          id?: string
          last_activity?: string | null
          leaderboard_rank?: number | null
          skill_progression?: Json | null
          streaks?: Json | null
          total_experience_points?: number | null
          updated_at?: string
        }
        Update: {
          achievements?: Json | null
          badges_earned?: Json | null
          created_at?: string
          crew_member_id?: string
          current_level?: number | null
          id?: string
          last_activity?: string | null
          leaderboard_rank?: number | null
          skill_progression?: Json | null
          streaks?: Json | null
          total_experience_points?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_gamification_profiles_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: true
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_members: {
        Row: {
          contract_end: string | null
          contract_start: string | null
          created_at: string | null
          email: string | null
          emergency_contact: Json | null
          employee_id: string
          experience_years: number | null
          full_name: string
          id: string
          join_date: string | null
          leave_date: string | null
          nationality: string
          organization_id: string | null
          passport_number: string | null
          phone: string | null
          position: string
          rank: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: Json | null
          employee_id: string
          experience_years?: number | null
          full_name: string
          id?: string
          join_date?: string | null
          leave_date?: string | null
          nationality: string
          organization_id?: string | null
          passport_number?: string | null
          phone?: string | null
          position: string
          rank?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          contract_end?: string | null
          contract_start?: string | null
          created_at?: string | null
          email?: string | null
          emergency_contact?: Json | null
          employee_id?: string
          experience_years?: number | null
          full_name?: string
          id?: string
          join_date?: string | null
          leave_date?: string | null
          nationality?: string
          organization_id?: string | null
          passport_number?: string | null
          phone?: string | null
          position?: string
          rank?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_members_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_performance_reviews: {
        Row: {
          behavioral_score: number
          career_progression_notes: string | null
          created_at: string | null
          crew_member_id: string
          embarkation_id: string | null
          id: string
          improvement_areas: string | null
          incidents: string | null
          leadership_score: number | null
          next_review_date: string | null
          overall_score: number
          positive_feedback: string | null
          recommendations: string | null
          review_date: string
          review_period: string
          review_status: string | null
          reviewer_name: string
          reviewer_position: string | null
          safety_score: number
          strengths: string | null
          technical_score: number
          updated_at: string | null
        }
        Insert: {
          behavioral_score: number
          career_progression_notes?: string | null
          created_at?: string | null
          crew_member_id: string
          embarkation_id?: string | null
          id?: string
          improvement_areas?: string | null
          incidents?: string | null
          leadership_score?: number | null
          next_review_date?: string | null
          overall_score: number
          positive_feedback?: string | null
          recommendations?: string | null
          review_date: string
          review_period: string
          review_status?: string | null
          reviewer_name: string
          reviewer_position?: string | null
          safety_score: number
          strengths?: string | null
          technical_score: number
          updated_at?: string | null
        }
        Update: {
          behavioral_score?: number
          career_progression_notes?: string | null
          created_at?: string | null
          crew_member_id?: string
          embarkation_id?: string | null
          id?: string
          improvement_areas?: string | null
          incidents?: string | null
          leadership_score?: number | null
          next_review_date?: string | null
          overall_score?: number
          positive_feedback?: string | null
          recommendations?: string | null
          review_date?: string
          review_period?: string
          review_status?: string | null
          reviewer_name?: string
          reviewer_position?: string | null
          safety_score?: number
          strengths?: string | null
          technical_score?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_performance_reviews_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_performance_reviews_embarkation_id_fkey"
            columns: ["embarkation_id"]
            isOneToOne: false
            referencedRelation: "crew_embarkations"
            referencedColumns: ["id"]
          },
        ]
      }
      dashboard_activities: {
        Row: {
          activity_type: string
          created_at: string | null
          description: string | null
          entity_id: string | null
          id: string
          metadata: Json | null
          module: string
          title: string
          user_avatar: string | null
          user_name: string
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          module: string
          title: string
          user_avatar?: string | null
          user_name: string
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          description?: string | null
          entity_id?: string | null
          id?: string
          metadata?: Json | null
          module?: string
          title?: string
          user_avatar?: string | null
          user_name?: string
        }
        Relationships: []
      }
      dashboard_alerts: {
        Row: {
          action_url: string | null
          alert_type: string
          created_at: string | null
          department: string | null
          description: string | null
          expires_at: string | null
          id: string
          is_read: boolean | null
          module: string
          priority: string | null
          title: string
          user_id: string | null
        }
        Insert: {
          action_url?: string | null
          alert_type: string
          created_at?: string | null
          department?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          module: string
          priority?: string | null
          title: string
          user_id?: string | null
        }
        Update: {
          action_url?: string | null
          alert_type?: string
          created_at?: string | null
          department?: string | null
          description?: string | null
          expires_at?: string | null
          id?: string
          is_read?: boolean | null
          module?: string
          priority?: string | null
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      dashboard_metrics: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          metric_change: number | null
          metric_name: string
          metric_target: number | null
          metric_type: string
          metric_unit: string | null
          metric_value: number
          recorded_at: string | null
          user_role: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          metric_change?: number | null
          metric_name: string
          metric_target?: number | null
          metric_type: string
          metric_unit?: string | null
          metric_value: number
          recorded_at?: string | null
          user_role?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          metric_change?: number | null
          metric_name?: string
          metric_target?: number | null
          metric_type?: string
          metric_unit?: string | null
          metric_value?: number
          recorded_at?: string | null
          user_role?: string | null
          vessel_id?: string | null
        }
        Relationships: []
      }
      emergency_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          description: string | null
          id: string
          location: Json | null
          organization_id: string | null
          reported_by: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string
          status: string
          title: string
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          description?: string | null
          id?: string
          location?: Json | null
          organization_id?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          description?: string | null
          id?: string
          location?: Json | null
          organization_id?: string | null
          reported_by?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "emergency_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "emergency_alerts_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      employee_certificates: {
        Row: {
          certificate_name: string
          certificate_type: string
          created_at: string
          employee_id: string
          expiry_date: string
          file_path: string
          id: string
          issue_date: string
          issuer: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          certificate_name: string
          certificate_type: string
          created_at?: string
          employee_id: string
          expiry_date: string
          file_path: string
          id?: string
          issue_date: string
          issuer?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          certificate_name?: string
          certificate_type?: string
          created_at?: string
          employee_id?: string
          expiry_date?: string
          file_path?: string
          id?: string
          issue_date?: string
          issuer?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          contract_end: string | null
          contract_start: string
          created_at: string | null
          department: string
          email: string
          employee_id: string
          full_name: string
          id: string
          nationality: string | null
          organization_id: string | null
          passport_number: string | null
          phone: string | null
          position: string
          status: string | null
          updated_at: string | null
          user_id: string | null
          vessel_assignment: string | null
        }
        Insert: {
          contract_end?: string | null
          contract_start: string
          created_at?: string | null
          department: string
          email: string
          employee_id: string
          full_name: string
          id?: string
          nationality?: string | null
          organization_id?: string | null
          passport_number?: string | null
          phone?: string | null
          position: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vessel_assignment?: string | null
        }
        Update: {
          contract_end?: string | null
          contract_start?: string
          created_at?: string | null
          department?: string
          email?: string
          employee_id?: string
          full_name?: string
          id?: string
          nationality?: string | null
          organization_id?: string | null
          passport_number?: string | null
          phone?: string | null
          position?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vessel_assignment?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "employees_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      error_logs: {
        Row: {
          component_stack: string | null
          error_message: string
          error_stack: string | null
          id: string
          metadata: Json | null
          resolved: boolean
          timestamp: string
          url: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          component_stack?: string | null
          error_message: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          component_stack?: string | null
          error_message?: string
          error_stack?: string | null
          id?: string
          metadata?: Json | null
          resolved?: boolean
          timestamp?: string
          url?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      expenses: {
        Row: {
          amount: number
          category: string
          created_at: string
          date: string
          description: string
          id: string
          notes: string | null
          receipt_url: string | null
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          date: string
          description: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          date?: string
          description?: string
          id?: string
          notes?: string | null
          receipt_url?: string | null
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      forecast_history: {
        Row: {
          id: string
          source: string
          forecast_summary: string
          created_by: string
          created_at: string
        }
        Insert: {
          id?: string
          source: string
          forecast_summary: string
          created_by: string
          created_at?: string
        }
        Update: {
          id?: string
          source?: string
          forecast_summary?: string
          created_by?: string
          created_at?: string
        }
        Relationships: []
      }
      flight_price_history: {
        Row: {
          airline_code: string
          booking_class: string
          captured_at: string
          created_at: string
          currency: string
          departure_date: string
          flight_number: string | null
          id: string
          metadata: Json | null
          passenger_count: number | null
          price: number
          route_code: string
          source: string
        }
        Insert: {
          airline_code: string
          booking_class?: string
          captured_at?: string
          created_at?: string
          currency?: string
          departure_date: string
          flight_number?: string | null
          id?: string
          metadata?: Json | null
          passenger_count?: number | null
          price: number
          route_code: string
          source?: string
        }
        Update: {
          airline_code?: string
          booking_class?: string
          captured_at?: string
          created_at?: string
          currency?: string
          departure_date?: string
          flight_number?: string | null
          id?: string
          metadata?: Json | null
          passenger_count?: number | null
          price?: number
          route_code?: string
          source?: string
        }
        Relationships: []
      }
      help_center_analytics: {
        Row: {
          action_type: string
          created_at: string
          id: string
          knowledge_item_id: string | null
          session_data: Json | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          created_at?: string
          id?: string
          knowledge_item_id?: string | null
          session_data?: Json | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          created_at?: string
          id?: string
          knowledge_item_id?: string | null
          session_data?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "help_center_analytics_knowledge_item_id_fkey"
            columns: ["knowledge_item_id"]
            isOneToOne: false
            referencedRelation: "knowledge_base"
            referencedColumns: ["id"]
          },
        ]
      }
      help_system_settings: {
        Row: {
          created_at: string
          id: string
          setting_key: string
          setting_value: Json
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          setting_key: string
          setting_value: Json
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          setting_key?: string
          setting_value?: Json
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      hotel_price_history: {
        Row: {
          captured_at: string
          check_in_date: string
          check_out_date: string
          city: string
          country: string
          created_at: string
          currency: string
          guest_count: number | null
          hotel_id: string
          hotel_name: string
          id: string
          metadata: Json | null
          price_per_night: number
          rating: number | null
          room_type: string | null
          source: string
          total_price: number
        }
        Insert: {
          captured_at?: string
          check_in_date: string
          check_out_date: string
          city: string
          country?: string
          created_at?: string
          currency?: string
          guest_count?: number | null
          hotel_id: string
          hotel_name: string
          id?: string
          metadata?: Json | null
          price_per_night: number
          rating?: number | null
          room_type?: string | null
          source?: string
          total_price: number
        }
        Update: {
          captured_at?: string
          check_in_date?: string
          check_out_date?: string
          city?: string
          country?: string
          created_at?: string
          currency?: string
          guest_count?: number | null
          hotel_id?: string
          hotel_name?: string
          id?: string
          metadata?: Json | null
          price_per_night?: number
          rating?: number | null
          room_type?: string | null
          source?: string
          total_price?: number
        }
        Relationships: []
      }
      intelligent_notifications: {
        Row: {
          action_data: Json | null
          action_text: string | null
          action_type: string | null
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          priority: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          action_data?: Json | null
          action_text?: string | null
          action_type?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          priority: string
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          action_data?: Json | null
          action_text?: string | null
          action_type?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          priority?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      knowledge_base: {
        Row: {
          author_id: string | null
          content: string
          created_at: string
          difficulty: string
          helpful_votes: number | null
          id: string
          metadata: Json | null
          module: string
          rating: number | null
          status: string
          steps: Json | null
          tags: string[] | null
          title: string
          type: string
          updated_at: string
          views: number | null
        }
        Insert: {
          author_id?: string | null
          content: string
          created_at?: string
          difficulty?: string
          helpful_votes?: number | null
          id?: string
          metadata?: Json | null
          module: string
          rating?: number | null
          status?: string
          steps?: Json | null
          tags?: string[] | null
          title: string
          type: string
          updated_at?: string
          views?: number | null
        }
        Update: {
          author_id?: string | null
          content?: string
          created_at?: string
          difficulty?: string
          helpful_votes?: number | null
          id?: string
          metadata?: Json | null
          module?: string
          rating?: number | null
          status?: string
          steps?: Json | null
          tags?: string[] | null
          title?: string
          type?: string
          updated_at?: string
          views?: number | null
        }
        Relationships: []
      }
      maintenance_records: {
        Row: {
          actual_cost: number | null
          actual_duration: number | null
          assigned_technician: string | null
          completed_date: string | null
          cost_estimate: number | null
          created_at: string
          created_by: string | null
          description: string | null
          estimated_duration: number | null
          id: string
          location: string | null
          maintenance_type: string
          next_maintenance_date: string | null
          organization_id: string | null
          parts_required: string[] | null
          priority: string
          scheduled_date: string
          status: string
          title: string
          updated_at: string
          vessel_id: string
        }
        Insert: {
          actual_cost?: number | null
          actual_duration?: number | null
          assigned_technician?: string | null
          completed_date?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          location?: string | null
          maintenance_type: string
          next_maintenance_date?: string | null
          organization_id?: string | null
          parts_required?: string[] | null
          priority?: string
          scheduled_date: string
          status?: string
          title: string
          updated_at?: string
          vessel_id: string
        }
        Update: {
          actual_cost?: number | null
          actual_duration?: number | null
          assigned_technician?: string | null
          completed_date?: string | null
          cost_estimate?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          estimated_duration?: number | null
          id?: string
          location?: string | null
          maintenance_type?: string
          next_maintenance_date?: string | null
          organization_id?: string | null
          parts_required?: string[] | null
          priority?: string
          scheduled_date?: string
          status?: string
          title?: string
          updated_at?: string
          vessel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_records_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      maintenance_schedules: {
        Row: {
          completed_date: string | null
          cost: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          maintenance_type: string
          notes: string | null
          scheduled_date: string
          status: string | null
          updated_at: string | null
          vendor: string | null
          vessel_id: string | null
        }
        Insert: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          maintenance_type: string
          notes?: string | null
          scheduled_date: string
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
          vessel_id?: string | null
        }
        Update: {
          completed_date?: string | null
          cost?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          maintenance_type?: string
          notes?: string | null
          scheduled_date?: string
          status?: string | null
          updated_at?: string | null
          vendor?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_schedules_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      maritime_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          ai_confidence: number | null
          alert_type: string
          auto_generated: boolean | null
          created_at: string
          description: string
          id: string
          is_acknowledged: boolean | null
          organization_id: string | null
          predicted_impact: string | null
          recommendations: string[] | null
          related_data: Json | null
          resolution_notes: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          vessel_id: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_confidence?: number | null
          alert_type: string
          auto_generated?: boolean | null
          created_at?: string
          description: string
          id?: string
          is_acknowledged?: boolean | null
          organization_id?: string | null
          predicted_impact?: string | null
          recommendations?: string[] | null
          related_data?: Json | null
          resolution_notes?: string | null
          severity: string
          status?: string
          title: string
          updated_at?: string
          vessel_id: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_confidence?: number | null
          alert_type?: string
          auto_generated?: boolean | null
          created_at?: string
          description?: string
          id?: string
          is_acknowledged?: boolean | null
          organization_id?: string | null
          predicted_impact?: string | null
          recommendations?: string[] | null
          related_data?: Json | null
          resolution_notes?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          vessel_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "maritime_alerts_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      maritime_certificates: {
        Row: {
          certificate_number: string | null
          certification_type_id: string | null
          created_at: string | null
          crew_member_id: string | null
          document_url: string | null
          expiry_date: string
          id: string
          issue_date: string
          issuing_authority: string
          issuing_country: string | null
          notes: string | null
          renewal_cost: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          certificate_number?: string | null
          certification_type_id?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          document_url?: string | null
          expiry_date: string
          id?: string
          issue_date: string
          issuing_authority: string
          issuing_country?: string | null
          notes?: string | null
          renewal_cost?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          certificate_number?: string | null
          certification_type_id?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          document_url?: string | null
          expiry_date?: string
          id?: string
          issue_date?: string
          issuing_authority?: string
          issuing_country?: string | null
          notes?: string | null
          renewal_cost?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maritime_certificates_certification_type_id_fkey"
            columns: ["certification_type_id"]
            isOneToOne: false
            referencedRelation: "maritime_certification_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maritime_certificates_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      maritime_certification_types: {
        Row: {
          category: string
          code: string
          created_at: string | null
          description: string | null
          id: string
          is_mandatory: boolean | null
          issuing_authorities: string[] | null
          name: string
          updated_at: string | null
          validity_period_months: number
        }
        Insert: {
          category: string
          code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          issuing_authorities?: string[] | null
          name: string
          updated_at?: string | null
          validity_period_months: number
        }
        Update: {
          category?: string
          code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_mandatory?: boolean | null
          issuing_authorities?: string[] | null
          name?: string
          updated_at?: string | null
          validity_period_months?: number
        }
        Relationships: []
      }
      message_read_status: {
        Row: {
          id: string
          message_id: string
          read_at: string
          user_id: string
        }
        Insert: {
          id?: string
          message_id: string
          read_at?: string
          user_id: string
        }
        Update: {
          id?: string
          message_id?: string
          read_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "message_read_status_message_id_fkey"
            columns: ["message_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          edited_at: string | null
          id: string
          is_edited: boolean | null
          message_type: string | null
          metadata: Json | null
          reply_to_id: string | null
          sender_id: string
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id: string
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          reply_to_id?: string | null
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "conversations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_reply_to_id_fkey"
            columns: ["reply_to_id"]
            isOneToOne: false
            referencedRelation: "messages"
            referencedColumns: ["id"]
          },
        ]
      }
      mmi_jobs: {
        Row: {
          asset_name: string | null
          can_postpone: boolean | null
          component_name: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          job_id: string
          priority: string | null
          status: string | null
          suggestion_ia: string | null
          title: string
          updated_at: string
          vessel_name: string | null
        }
        Insert: {
          asset_name?: string | null
          can_postpone?: boolean | null
          component_name?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          job_id: string
          priority?: string | null
          status?: string | null
          suggestion_ia?: string | null
          title: string
          updated_at?: string
          vessel_name?: string | null
        }
        Update: {
          asset_name?: string | null
          can_postpone?: boolean | null
          component_name?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          job_id?: string
          priority?: string | null
          status?: string | null
          suggestion_ia?: string | null
          title?: string
          updated_at?: string
          vessel_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mmi_jobs_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      mmi_os_resolvidas: {
        Row: {
          acao_realizada: string | null
          causa_confirmada: string | null
          componente: string | null
          created_at: string | null
          descricao_tecnica: string | null
          duracao_execucao: string | null
          efetiva: boolean | null
          evidencia_url: string | null
          id: string
          job_id: string | null
          os_id: string
          resolvido_em: string | null
        }
        Insert: {
          acao_realizada?: string | null
          causa_confirmada?: string | null
          componente?: string | null
          created_at?: string | null
          descricao_tecnica?: string | null
          duracao_execucao?: string | null
          efetiva?: boolean | null
          evidencia_url?: string | null
          id?: string
          job_id?: string | null
          os_id: string
          resolvido_em?: string | null
        }
        Update: {
          acao_realizada?: string | null
          causa_confirmada?: string | null
          componente?: string | null
          created_at?: string | null
          descricao_tecnica?: string | null
          duracao_execucao?: string | null
          efetiva?: boolean | null
          evidencia_url?: string | null
          id?: string
          job_id?: string | null
          os_id?: string
          resolvido_em?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mmi_os_resolvidas_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "mmi_jobs"
            referencedColumns: ["id"]
          },
        ]
      }
      modules: {
        Row: {
          created_at: string
          description: string
          id: string
          name: string
          path: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          name: string
          path: string
          status: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          name?: string
          path?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      nautilus_messages: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_read: boolean | null
          priority: string | null
          receiver_id: string | null
          sender_id: string | null
          subject: string | null
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          priority?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          priority?: string | null
          receiver_id?: string | null
          sender_id?: string | null
          subject?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      notification_settings: {
        Row: {
          created_at: string | null
          daily_summary: boolean | null
          email_enabled: boolean | null
          id: string
          price_drop_threshold: number | null
          push_enabled: boolean | null
          updated_at: string | null
          user_id: string
          weekly_report: boolean | null
        }
        Insert: {
          created_at?: string | null
          daily_summary?: boolean | null
          email_enabled?: boolean | null
          id?: string
          price_drop_threshold?: number | null
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id: string
          weekly_report?: boolean | null
        }
        Update: {
          created_at?: string | null
          daily_summary?: boolean | null
          email_enabled?: boolean | null
          id?: string
          price_drop_threshold?: number | null
          push_enabled?: boolean | null
          updated_at?: string | null
          user_id?: string
          weekly_report?: boolean | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          action_data: Json | null
          created_at: string
          expires_at: string | null
          id: string
          message: string
          organization_id: string | null
          priority: string
          read: boolean
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message: string
          organization_id?: string | null
          priority?: string
          read?: boolean
          title: string
          type?: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          created_at?: string
          expires_at?: string | null
          id?: string
          message?: string
          organization_id?: string | null
          priority?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      onboarding_progress: {
        Row: {
          company_profile: Json | null
          completed_at: string | null
          completed_steps: Json | null
          created_at: string | null
          current_step: string
          id: string
          is_completed: boolean | null
          organization_id: string | null
          preferences: Json | null
          tenant_id: string | null
          updated_at: string | null
          user_id: string | null
          user_type: string | null
        }
        Insert: {
          company_profile?: Json | null
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: string
          id?: string
          is_completed?: boolean | null
          organization_id?: string | null
          preferences?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Update: {
          company_profile?: Json | null
          completed_at?: string | null
          completed_steps?: Json | null
          created_at?: string | null
          current_step?: string
          id?: string
          is_completed?: boolean | null
          organization_id?: string | null
          preferences?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          user_id?: string | null
          user_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onboarding_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "onboarding_progress_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_alerts: {
        Row: {
          action_required: string | null
          affected_crew_member_id: string | null
          affected_vessel_id: string | null
          alert_type: string
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          organization_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          source_data: Json | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          action_required?: string | null
          affected_crew_member_id?: string | null
          affected_vessel_id?: string | null
          alert_type: string
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          source_data?: Json | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          action_required?: string | null
          affected_crew_member_id?: string | null
          affected_vessel_id?: string | null
          alert_type?: string
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          organization_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          source_data?: Json | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_alerts_affected_crew_member_id_fkey"
            columns: ["affected_crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_alerts_affected_vessel_id_fkey"
            columns: ["affected_vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_alerts_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "operational_alerts_resolved_by_fkey"
            columns: ["resolved_by"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_checklists: {
        Row: {
          ai_analysis: Json | null
          compliance_score: number | null
          created_at: string
          created_by: string
          id: string
          metadata: Json | null
          offline_sync: boolean | null
          organization_id: string | null
          source_file_url: string | null
          source_type: string
          status: string
          title: string
          type: string
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          compliance_score?: number | null
          created_at?: string
          created_by: string
          id?: string
          metadata?: Json | null
          offline_sync?: boolean | null
          organization_id?: string | null
          source_file_url?: string | null
          source_type?: string
          status?: string
          title: string
          type: string
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          compliance_score?: number | null
          created_at?: string
          created_by?: string
          id?: string
          metadata?: Json | null
          offline_sync?: boolean | null
          organization_id?: string | null
          source_file_url?: string | null
          source_type?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "operational_checklists_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      operational_metrics: {
        Row: {
          alerts_threshold: Json | null
          created_at: string
          current_value: number
          historical_data: Json | null
          id: string
          last_calculation: string | null
          metric_name: string
          metric_type: string
          organization_id: string | null
          target_value: number | null
          trend: string | null
          unit: string | null
          updated_at: string
        }
        Insert: {
          alerts_threshold?: Json | null
          created_at?: string
          current_value: number
          historical_data?: Json | null
          id?: string
          last_calculation?: string | null
          metric_name: string
          metric_type: string
          organization_id?: string | null
          target_value?: number | null
          trend?: string | null
          unit?: string | null
          updated_at?: string
        }
        Update: {
          alerts_threshold?: Json | null
          created_at?: string
          current_value?: number
          historical_data?: Json | null
          id?: string
          last_calculation?: string | null
          metric_name?: string
          metric_type?: string
          organization_id?: string | null
          target_value?: number | null
          trend?: string | null
          unit?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "operational_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      optimization_actions: {
        Row: {
          applied_at: string | null
          category: string
          created_at: string
          description: string
          effort: string
          estimated_improvement: string | null
          id: string
          impact: string
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          applied_at?: string | null
          category: string
          created_at?: string
          description: string
          effort: string
          estimated_improvement?: string | null
          id?: string
          impact: string
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          applied_at?: string | null
          category?: string
          created_at?: string
          description?: string
          effort?: string
          estimated_improvement?: string | null
          id?: string
          impact?: string
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      organization_billing: {
        Row: {
          base_amount: number
          billing_period_end: string
          billing_period_start: string
          created_at: string
          currency: string | null
          discount_amount: number | null
          id: string
          line_items: Json | null
          organization_id: string
          paid_at: string | null
          payment_method: string | null
          status: string
          stripe_invoice_id: string | null
          total_amount: number
          updated_at: string
          usage_amount: number | null
        }
        Insert: {
          base_amount?: number
          billing_period_end: string
          billing_period_start: string
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          id?: string
          line_items?: Json | null
          organization_id: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          stripe_invoice_id?: string | null
          total_amount?: number
          updated_at?: string
          usage_amount?: number | null
        }
        Update: {
          base_amount?: number
          billing_period_end?: string
          billing_period_start?: string
          created_at?: string
          currency?: string | null
          discount_amount?: number | null
          id?: string
          line_items?: Json | null
          organization_id?: string
          paid_at?: string | null
          payment_method?: string | null
          status?: string
          stripe_invoice_id?: string | null
          total_amount?: number
          updated_at?: string
          usage_amount?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_billing_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_branding: {
        Row: {
          accent_color: string | null
          business_rules: Json | null
          company_name: string
          created_at: string
          custom_fields: Json | null
          default_currency: string | null
          default_language: string | null
          enabled_modules: Json | null
          id: string
          logo_url: string | null
          module_settings: Json | null
          organization_id: string
          primary_color: string | null
          secondary_color: string | null
          theme_mode: string | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string | null
          business_rules?: Json | null
          company_name: string
          created_at?: string
          custom_fields?: Json | null
          default_currency?: string | null
          default_language?: string | null
          enabled_modules?: Json | null
          id?: string
          logo_url?: string | null
          module_settings?: Json | null
          organization_id: string
          primary_color?: string | null
          secondary_color?: string | null
          theme_mode?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string | null
          business_rules?: Json | null
          company_name?: string
          created_at?: string
          custom_fields?: Json | null
          default_currency?: string | null
          default_language?: string | null
          enabled_modules?: Json | null
          id?: string
          logo_url?: string | null
          module_settings?: Json | null
          organization_id?: string
          primary_color?: string | null
          secondary_color?: string | null
          theme_mode?: string | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_branding_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: true
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_metrics: {
        Row: {
          active_users: number | null
          alerts_generated: number | null
          api_calls: number | null
          created_at: string
          documents_processed: number | null
          id: string
          logins_count: number | null
          metric_date: string
          module_usage: Json | null
          organization_id: string
          storage_used_gb: number | null
          total_vessels: number | null
        }
        Insert: {
          active_users?: number | null
          alerts_generated?: number | null
          api_calls?: number | null
          created_at?: string
          documents_processed?: number | null
          id?: string
          logins_count?: number | null
          metric_date?: string
          module_usage?: Json | null
          organization_id: string
          storage_used_gb?: number | null
          total_vessels?: number | null
        }
        Update: {
          active_users?: number | null
          alerts_generated?: number | null
          api_calls?: number | null
          created_at?: string
          documents_processed?: number | null
          id?: string
          logins_count?: number | null
          metric_date?: string
          module_usage?: Json | null
          organization_id?: string
          storage_used_gb?: number | null
          total_vessels?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "organization_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organization_users: {
        Row: {
          created_at: string
          departments: string[] | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          last_active_at: string | null
          organization_id: string
          permissions: Json | null
          role: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          departments?: string[] | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          organization_id: string
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          departments?: string[] | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_users_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      organizations: {
        Row: {
          billing_email: string | null
          created_at: string
          domain: string | null
          features: Json | null
          id: string
          max_storage_gb: number | null
          max_users: number | null
          max_vessels: number | null
          metadata: Json | null
          name: string
          owner_id: string | null
          plan_type: string
          slug: string
          status: string
          stripe_customer_id: string | null
          subscription_ends_at: string | null
          trial_ends_at: string | null
          updated_at: string
        }
        Insert: {
          billing_email?: string | null
          created_at?: string
          domain?: string | null
          features?: Json | null
          id?: string
          max_storage_gb?: number | null
          max_users?: number | null
          max_vessels?: number | null
          metadata?: Json | null
          name: string
          owner_id?: string | null
          plan_type?: string
          slug: string
          status?: string
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Update: {
          billing_email?: string | null
          created_at?: string
          domain?: string | null
          features?: Json | null
          id?: string
          max_storage_gb?: number | null
          max_users?: number | null
          max_vessels?: number | null
          metadata?: Json | null
          name?: string
          owner_id?: string | null
          plan_type?: string
          slug?: string
          status?: string
          stripe_customer_id?: string | null
          subscription_ends_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      peotram_ai_analysis: {
        Row: {
          ai_model_used: string
          analysis_data: Json
          analysis_type: string
          audit_id: string
          category_scores: Json | null
          comparative_analysis: Json | null
          confidence_level: number | null
          created_at: string
          critical_findings: string[] | null
          document_id: string | null
          id: string
          overall_compliance: number | null
          recommendations: string[] | null
          risk_assessment: Json | null
        }
        Insert: {
          ai_model_used?: string
          analysis_data?: Json
          analysis_type: string
          audit_id: string
          category_scores?: Json | null
          comparative_analysis?: Json | null
          confidence_level?: number | null
          created_at?: string
          critical_findings?: string[] | null
          document_id?: string | null
          id?: string
          overall_compliance?: number | null
          recommendations?: string[] | null
          risk_assessment?: Json | null
        }
        Update: {
          ai_model_used?: string
          analysis_data?: Json
          analysis_type?: string
          audit_id?: string
          category_scores?: Json | null
          comparative_analysis?: Json | null
          confidence_level?: number | null
          created_at?: string
          critical_findings?: string[] | null
          document_id?: string | null
          id?: string
          overall_compliance?: number | null
          recommendations?: string[] | null
          risk_assessment?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_ai_analysis_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "peotram_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peotram_ai_analysis_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "peotram_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_audits: {
        Row: {
          audit_date: string
          audit_period: string
          audit_type: string
          auditor_name: string | null
          compliance_score: number | null
          created_at: string
          created_by: string
          final_score: number | null
          id: string
          metadata: Json | null
          non_conformities_count: number | null
          organization_id: string | null
          predicted_score: number | null
          shore_location: string | null
          status: string
          template_id: string | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          audit_date: string
          audit_period: string
          audit_type?: string
          auditor_name?: string | null
          compliance_score?: number | null
          created_at?: string
          created_by: string
          final_score?: number | null
          id?: string
          metadata?: Json | null
          non_conformities_count?: number | null
          organization_id?: string | null
          predicted_score?: number | null
          shore_location?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          audit_date?: string
          audit_period?: string
          audit_type?: string
          auditor_name?: string | null
          compliance_score?: number | null
          created_at?: string
          created_by?: string
          final_score?: number | null
          id?: string
          metadata?: Json | null
          non_conformities_count?: number | null
          organization_id?: string | null
          predicted_score?: number | null
          shore_location?: string | null
          status?: string
          template_id?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_audits_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "peotram_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peotram_audits_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_documents: {
        Row: {
          ai_analysis_result: Json | null
          ai_confidence: number | null
          audit_id: string
          category: string
          compliance_status: string | null
          created_at: string
          document_name: string
          document_type: string
          file_url: string
          id: string
          issues_found: string[] | null
          manual_verification: boolean | null
          required: boolean
          subcategory: string | null
          uploaded_at: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          ai_analysis_result?: Json | null
          ai_confidence?: number | null
          audit_id: string
          category: string
          compliance_status?: string | null
          created_at?: string
          document_name: string
          document_type: string
          file_url: string
          id?: string
          issues_found?: string[] | null
          manual_verification?: boolean | null
          required?: boolean
          subcategory?: string | null
          uploaded_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          ai_analysis_result?: Json | null
          ai_confidence?: number | null
          audit_id?: string
          category?: string
          compliance_status?: string | null
          created_at?: string
          document_name?: string
          document_type?: string
          file_url?: string
          id?: string
          issues_found?: string[] | null
          manual_verification?: boolean | null
          required?: boolean
          subcategory?: string | null
          uploaded_at?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_documents_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "peotram_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_non_conformities: {
        Row: {
          area_department: string | null
          audit_id: string | null
          corrective_action: string | null
          created_at: string
          created_by: string | null
          description: string
          element_name: string
          element_number: string
          evidence_urls: string[] | null
          id: string
          non_conformity_type: string
          responsible_person: string | null
          severity_score: number | null
          status: string
          target_date: string | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          area_department?: string | null
          audit_id?: string | null
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          element_name: string
          element_number: string
          evidence_urls?: string[] | null
          id?: string
          non_conformity_type: string
          responsible_person?: string | null
          severity_score?: number | null
          status?: string
          target_date?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          area_department?: string | null
          audit_id?: string | null
          corrective_action?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          element_name?: string
          element_number?: string
          evidence_urls?: string[] | null
          id?: string
          non_conformity_type?: string
          responsible_person?: string | null
          severity_score?: number | null
          status?: string
          target_date?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_non_conformities_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "peotram_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peotram_non_conformities_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_score_predictions: {
        Row: {
          audit_id: string
          based_on_documents: number | null
          created_at: string
          id: string
          improvement_scenarios: Json | null
          predicted_score: number
          prediction_confidence: number | null
          prediction_model: string
          recommended_actions: string[] | null
          risk_factors: string[] | null
          score_breakdown: Json
          updated_at: string
        }
        Insert: {
          audit_id: string
          based_on_documents?: number | null
          created_at?: string
          id?: string
          improvement_scenarios?: Json | null
          predicted_score: number
          prediction_confidence?: number | null
          prediction_model?: string
          recommended_actions?: string[] | null
          risk_factors?: string[] | null
          score_breakdown?: Json
          updated_at?: string
        }
        Update: {
          audit_id?: string
          based_on_documents?: number | null
          created_at?: string
          id?: string
          improvement_scenarios?: Json | null
          predicted_score?: number
          prediction_confidence?: number | null
          prediction_model?: string
          recommended_actions?: string[] | null
          risk_factors?: string[] | null
          score_breakdown?: Json
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "peotram_score_predictions_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "peotram_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_templates: {
        Row: {
          checklist_type: string
          created_at: string
          created_by: string | null
          id: string
          is_active: boolean
          template_data: Json
          updated_at: string
          version: string
          year: number
        }
        Insert: {
          checklist_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          template_data?: Json
          updated_at?: string
          version?: string
          year: number
        }
        Update: {
          checklist_type?: string
          created_at?: string
          created_by?: string | null
          id?: string
          is_active?: boolean
          template_data?: Json
          updated_at?: string
          version?: string
          year?: number
        }
        Relationships: []
      }
      performance_metrics: {
        Row: {
          category: string
          created_at: string
          id: string
          metric_name: string
          metric_unit: string
          metric_value: number
          recorded_at: string
          status: string
          target_value: number | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          metric_name: string
          metric_unit: string
          metric_value: number
          recorded_at?: string
          status: string
          target_value?: number | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          metric_name?: string
          metric_unit?: string
          metric_value?: number
          recorded_at?: string
          status?: string
          target_value?: number | null
        }
        Relationships: []
      }
      ports: {
        Row: {
          code: string
          coordinates: unknown | null
          country: string
          created_at: string | null
          facilities: string[] | null
          id: string
          name: string
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          code: string
          coordinates?: unknown | null
          country: string
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          name: string
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          code?: string
          coordinates?: unknown | null
          country?: string
          created_at?: string | null
          facilities?: string[] | null
          id?: string
          name?: string
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      price_alerts: {
        Row: {
          availability_status: string | null
          category: string | null
          check_frequency_minutes: number | null
          created_at: string
          current_price: number | null
          description: string | null
          discount_percentage: number | null
          id: string
          image_url: string | null
          is_active: boolean
          last_checked_at: string | null
          organization_id: string | null
          product_name: string
          product_url: string
          store_name: string | null
          target_price: number
          updated_at: string
          user_id: string
        }
        Insert: {
          availability_status?: string | null
          category?: string | null
          check_frequency_minutes?: number | null
          created_at?: string
          current_price?: number | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          last_checked_at?: string | null
          organization_id?: string | null
          product_name: string
          product_url: string
          store_name?: string | null
          target_price: number
          updated_at?: string
          user_id: string
        }
        Update: {
          availability_status?: string | null
          category?: string | null
          check_frequency_minutes?: number | null
          created_at?: string
          current_price?: number | null
          description?: string | null
          discount_percentage?: number | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          last_checked_at?: string | null
          organization_id?: string | null
          product_name?: string
          product_url?: string
          store_name?: string | null
          target_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      price_history: {
        Row: {
          alert_id: string
          checked_at: string
          id: string
          price: number
        }
        Insert: {
          alert_id: string
          checked_at?: string
          id?: string
          price: number
        }
        Update: {
          alert_id?: string
          checked_at?: string
          id?: string
          price?: number
        }
        Relationships: [
          {
            foreignKeyName: "price_history_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "price_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      price_notifications: {
        Row: {
          alert_id: string
          created_at: string
          id: string
          is_read: boolean
          message: string
          user_id: string
        }
        Insert: {
          alert_id: string
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          user_id: string
        }
        Update: {
          alert_id?: string
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "price_notifications_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "price_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      processed_documents: {
        Row: {
          category: string | null
          created_at: string
          entities: string[] | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          key_points: string[] | null
          original_text: string | null
          processed_at: string | null
          processing_status: string
          sentiment: string | null
          summary: string | null
          user_id: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          entities?: string[] | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          key_points?: string[] | null
          original_text?: string | null
          processed_at?: string | null
          processing_status?: string
          sentiment?: string | null
          summary?: string | null
          user_id: string
        }
        Update: {
          category?: string | null
          created_at?: string
          entities?: string[] | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          key_points?: string[] | null
          original_text?: string | null
          processed_at?: string | null
          processing_status?: string
          sentiment?: string | null
          summary?: string | null
          user_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          email: string
          employee_id: string | null
          full_name: string | null
          hire_date: string | null
          id: string
          manager_id: string | null
          phone: string | null
          position: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email: string
          employee_id?: string | null
          full_name?: string | null
          hire_date?: string | null
          id: string
          manager_id?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          email?: string
          employee_id?: string | null
          full_name?: string | null
          hire_date?: string | null
          id?: string
          manager_id?: string | null
          phone?: string | null
          position?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_manager_id_fkey"
            columns: ["manager_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      real_time_notifications: {
        Row: {
          category: string
          created_at: string | null
          data: Json | null
          expires_at: string | null
          id: string
          message: string
          organization_id: string | null
          priority: string
          read_at: string | null
          title: string
          type: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          category?: string
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message: string
          organization_id?: string | null
          priority?: string
          read_at?: string | null
          title: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          data?: Json | null
          expires_at?: string | null
          id?: string
          message?: string
          organization_id?: string | null
          priority?: string
          read_at?: string | null
          title?: string
          type?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "real_time_notifications_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_attachments: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          file_url: string
          id: string
          reservation_id: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          file_url: string
          id?: string
          reservation_id: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          file_url?: string
          id?: string
          reservation_id?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "reservation_attachments_reservation_id_fkey"
            columns: ["reservation_id"]
            isOneToOne: false
            referencedRelation: "reservations"
            referencedColumns: ["id"]
          },
        ]
      }
      reservation_templates: {
        Row: {
          created_at: string
          created_by: string | null
          id: string
          is_public: boolean | null
          name: string
          organization_id: string | null
          template_data: Json
          template_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          name: string
          organization_id?: string | null
          template_data: Json
          template_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          id?: string
          is_public?: boolean | null
          name?: string
          organization_id?: string | null
          template_data?: Json
          template_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      reservations: {
        Row: {
          address: string | null
          attachments: string[] | null
          confirmation_number: string | null
          contact_info: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          end_date: string
          id: string
          location: string | null
          notes: string | null
          reservation_type: string
          room_type: string | null
          start_date: string
          status: string | null
          supplier_url: string | null
          title: string
          total_amount: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          attachments?: string[] | null
          confirmation_number?: string | null
          contact_info?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date: string
          id?: string
          location?: string | null
          notes?: string | null
          reservation_type: string
          room_type?: string | null
          start_date: string
          status?: string | null
          supplier_url?: string | null
          title: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          attachments?: string[] | null
          confirmation_number?: string | null
          contact_info?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          end_date?: string
          id?: string
          location?: string | null
          notes?: string | null
          reservation_type?: string
          room_type?: string | null
          start_date?: string
          status?: string | null
          supplier_url?: string | null
          title?: string
          total_amount?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          can_delete: boolean | null
          can_manage: boolean | null
          can_read: boolean | null
          can_write: boolean | null
          created_at: string | null
          id: string
          permission_name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Insert: {
          can_delete?: boolean | null
          can_manage?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string | null
          id?: string
          permission_name: string
          role: Database["public"]["Enums"]["user_role"]
        }
        Update: {
          can_delete?: boolean | null
          can_manage?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string | null
          id?: string
          permission_name?: string
          role?: Database["public"]["Enums"]["user_role"]
        }
        Relationships: []
      }
      routes: {
        Row: {
          created_at: string | null
          destination_port_id: string | null
          distance_nautical_miles: number | null
          estimated_duration_hours: number | null
          id: string
          is_active: boolean | null
          name: string
          origin_port_id: string | null
          route_points: Json | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          destination_port_id?: string | null
          distance_nautical_miles?: number | null
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          name: string
          origin_port_id?: string | null
          route_points?: Json | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          destination_port_id?: string | null
          distance_nautical_miles?: number | null
          estimated_duration_hours?: number | null
          id?: string
          is_active?: boolean | null
          name?: string
          origin_port_id?: string | null
          route_points?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "routes_destination_port_id_fkey"
            columns: ["destination_port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "routes_origin_port_id_fkey"
            columns: ["origin_port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
        ]
      }
      saas_plans: {
        Row: {
          created_at: string | null
          description: string | null
          features: Json | null
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          max_api_calls_per_month: number
          max_storage_gb: number
          max_users: number
          max_vessels: number
          name: string
          price_monthly: number
          price_yearly: number
          slug: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_api_calls_per_month?: number
          max_storage_gb?: number
          max_users?: number
          max_vessels?: number
          name: string
          price_monthly?: number
          price_yearly?: number
          slug: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          max_api_calls_per_month?: number
          max_storage_gb?: number
          max_users?: number
          max_vessels?: number
          name?: string
          price_monthly?: number
          price_yearly?: number
          slug?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      saas_tenants: {
        Row: {
          billing_cycle: string | null
          billing_email: string | null
          created_at: string | null
          custom_domain: string | null
          description: string | null
          features: Json | null
          id: string
          max_api_calls_per_month: number
          max_storage_gb: number
          max_users: number
          max_vessels: number
          metadata: Json | null
          name: string
          plan_type: string
          slug: string
          status: string
          stripe_customer_id: string | null
          subdomain: string | null
          subscription_ends_at: string | null
          subscription_starts_at: string | null
          trial_ends_at: string | null
          updated_at: string | null
        }
        Insert: {
          billing_cycle?: string | null
          billing_email?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          max_api_calls_per_month?: number
          max_storage_gb?: number
          max_users?: number
          max_vessels?: number
          metadata?: Json | null
          name: string
          plan_type?: string
          slug: string
          status?: string
          stripe_customer_id?: string | null
          subdomain?: string | null
          subscription_ends_at?: string | null
          subscription_starts_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Update: {
          billing_cycle?: string | null
          billing_email?: string | null
          created_at?: string | null
          custom_domain?: string | null
          description?: string | null
          features?: Json | null
          id?: string
          max_api_calls_per_month?: number
          max_storage_gb?: number
          max_users?: number
          max_vessels?: number
          metadata?: Json | null
          name?: string
          plan_type?: string
          slug?: string
          status?: string
          stripe_customer_id?: string | null
          subdomain?: string | null
          subscription_ends_at?: string | null
          subscription_starts_at?: string | null
          trial_ends_at?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      shared_alerts: {
        Row: {
          alert_id: string
          created_at: string | null
          description: string | null
          downvotes: number | null
          id: string
          is_featured: boolean | null
          shared_by: string
          title: string
          upvotes: number | null
        }
        Insert: {
          alert_id: string
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          id?: string
          is_featured?: boolean | null
          shared_by: string
          title: string
          upvotes?: number | null
        }
        Update: {
          alert_id?: string
          created_at?: string | null
          description?: string | null
          downvotes?: number | null
          id?: string
          is_featured?: boolean | null
          shared_by?: string
          title?: string
          upvotes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "shared_alerts_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "price_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      system_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string
          recorded_at: string
          unit: string | null
          value: number
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type: string
          recorded_at?: string
          unit?: string | null
          value: number
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string
          recorded_at?: string
          unit?: string | null
          value?: number
        }
        Relationships: []
      }
      system_status: {
        Row: {
          created_at: string
          description: string | null
          id: string
          last_check: string
          metadata: Json | null
          response_time: number | null
          service_name: string
          status: string
          updated_at: string
          uptime_percentage: number | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          last_check?: string
          metadata?: Json | null
          response_time?: number | null
          service_name: string
          status: string
          updated_at?: string
          uptime_percentage?: number | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          last_check?: string
          metadata?: Json | null
          response_time?: number | null
          service_name?: string
          status?: string
          updated_at?: string
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      tenant_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown | null
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          resource_id: string | null
          resource_type: string
          tenant_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type: string
          tenant_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          id?: string
          ip_address?: unknown | null
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          resource_id?: string | null
          resource_type?: string
          tenant_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_audit_logs_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_branding: {
        Row: {
          accent_color: string
          background_color: string | null
          business_rules: Json | null
          button_style: Json | null
          company_name: string
          created_at: string | null
          custom_fields: Json | null
          date_format: string
          default_currency: string
          default_language: string
          enabled_modules: Json | null
          favicon_url: string | null
          header_style: Json | null
          id: string
          logo_url: string | null
          module_settings: Json | null
          primary_color: string
          secondary_color: string
          sidebar_style: Json | null
          tenant_id: string
          text_color: string | null
          theme_mode: string
          timezone: string
          updated_at: string | null
        }
        Insert: {
          accent_color?: string
          background_color?: string | null
          business_rules?: Json | null
          button_style?: Json | null
          company_name: string
          created_at?: string | null
          custom_fields?: Json | null
          date_format?: string
          default_currency?: string
          default_language?: string
          enabled_modules?: Json | null
          favicon_url?: string | null
          header_style?: Json | null
          id?: string
          logo_url?: string | null
          module_settings?: Json | null
          primary_color?: string
          secondary_color?: string
          sidebar_style?: Json | null
          tenant_id: string
          text_color?: string | null
          theme_mode?: string
          timezone?: string
          updated_at?: string | null
        }
        Update: {
          accent_color?: string
          background_color?: string | null
          business_rules?: Json | null
          button_style?: Json | null
          company_name?: string
          created_at?: string | null
          custom_fields?: Json | null
          date_format?: string
          default_currency?: string
          default_language?: string
          enabled_modules?: Json | null
          favicon_url?: string | null
          header_style?: Json | null
          id?: string
          logo_url?: string | null
          module_settings?: Json | null
          primary_color?: string
          secondary_color?: string
          sidebar_style?: Json | null
          tenant_id?: string
          text_color?: string | null
          theme_mode?: string
          timezone?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_branding_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_domains: {
        Row: {
          created_at: string | null
          domain: string
          id: string
          is_verified: boolean | null
          ssl_status: string | null
          tenant_id: string
          updated_at: string | null
          verification_token: string | null
        }
        Insert: {
          created_at?: string | null
          domain: string
          id?: string
          is_verified?: boolean | null
          ssl_status?: string | null
          tenant_id: string
          updated_at?: string | null
          verification_token?: string | null
        }
        Update: {
          created_at?: string | null
          domain?: string
          id?: string
          is_verified?: boolean | null
          ssl_status?: string | null
          tenant_id?: string
          updated_at?: string | null
          verification_token?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_domains_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_subscriptions: {
        Row: {
          amount: number
          billing_cycle: string
          cancelled_at: string | null
          created_at: string | null
          currency: string
          current_period_end: string
          current_period_start: string
          id: string
          plan_id: string
          status: string
          stripe_subscription_id: string | null
          tenant_id: string
          trial_end: string | null
          trial_start: string | null
          updated_at: string | null
        }
        Insert: {
          amount: number
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          current_period_end: string
          current_period_start: string
          id?: string
          plan_id: string
          status?: string
          stripe_subscription_id?: string | null
          tenant_id: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Update: {
          amount?: number
          billing_cycle?: string
          cancelled_at?: string | null
          created_at?: string | null
          currency?: string
          current_period_end?: string
          current_period_start?: string
          id?: string
          plan_id?: string
          status?: string
          stripe_subscription_id?: string | null
          tenant_id?: string
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "saas_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tenant_subscriptions_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_usage: {
        Row: {
          active_users: number | null
          api_calls_made: number | null
          created_at: string | null
          documents_processed: number | null
          id: string
          metadata: Json | null
          peotram_audits_created: number | null
          period_end: string
          period_start: string
          reports_generated: number | null
          storage_used_gb: number | null
          tenant_id: string
          total_logins: number | null
          vessels_managed: number | null
        }
        Insert: {
          active_users?: number | null
          api_calls_made?: number | null
          created_at?: string | null
          documents_processed?: number | null
          id?: string
          metadata?: Json | null
          peotram_audits_created?: number | null
          period_end: string
          period_start: string
          reports_generated?: number | null
          storage_used_gb?: number | null
          tenant_id: string
          total_logins?: number | null
          vessels_managed?: number | null
        }
        Update: {
          active_users?: number | null
          api_calls_made?: number | null
          created_at?: string | null
          documents_processed?: number | null
          id?: string
          metadata?: Json | null
          peotram_audits_created?: number | null
          period_end?: string
          period_start?: string
          reports_generated?: number | null
          storage_used_gb?: number | null
          tenant_id?: string
          total_logins?: number | null
          vessels_managed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_usage_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      tenant_users: {
        Row: {
          avatar_url: string | null
          created_at: string | null
          department: string | null
          display_name: string | null
          id: string
          invited_at: string | null
          job_title: string | null
          joined_at: string | null
          last_active_at: string | null
          metadata: Json | null
          permissions: Json | null
          role: string
          status: string
          tenant_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          id?: string
          invited_at?: string | null
          job_title?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          metadata?: Json | null
          permissions?: Json | null
          role?: string
          status?: string
          tenant_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string | null
          department?: string | null
          display_name?: string | null
          id?: string
          invited_at?: string | null
          job_title?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          metadata?: Json | null
          permissions?: Json | null
          role?: string
          status?: string
          tenant_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "tenant_users_tenant_id_fkey"
            columns: ["tenant_id"]
            isOneToOne: false
            referencedRelation: "saas_tenants"
            referencedColumns: ["id"]
          },
        ]
      }
      travel_predictions: {
        Row: {
          best_booking_window_end: string | null
          best_booking_window_start: string | null
          confidence_score: number
          created_at: string
          current_avg_price: number
          demand_level: string | null
          id: string
          metadata: Json | null
          predicted_price: number
          prediction_date: string
          price_trend: string
          recommendation: string | null
          route_or_destination: string
          seasonal_factor: number | null
          type: string
          updated_at: string
        }
        Insert: {
          best_booking_window_end?: string | null
          best_booking_window_start?: string | null
          confidence_score?: number
          created_at?: string
          current_avg_price: number
          demand_level?: string | null
          id?: string
          metadata?: Json | null
          predicted_price: number
          prediction_date: string
          price_trend: string
          recommendation?: string | null
          route_or_destination: string
          seasonal_factor?: number | null
          type: string
          updated_at?: string
        }
        Update: {
          best_booking_window_end?: string | null
          best_booking_window_start?: string | null
          confidence_score?: number
          created_at?: string
          current_avg_price?: number
          demand_level?: string | null
          id?: string
          metadata?: Json | null
          predicted_price?: number
          prediction_date?: string
          price_trend?: string
          recommendation?: string | null
          route_or_destination?: string
          seasonal_factor?: number | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      travel_price_alerts: {
        Row: {
          alert_type: string
          created_at: string
          current_price: number | null
          expires_at: string | null
          id: string
          metadata: Json | null
          notification_sent: boolean | null
          passengers_or_guests: number | null
          route_or_destination: string
          status: string
          target_price: number | null
          travel_date: string | null
          triggered_at: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          alert_type: string
          created_at?: string
          current_price?: number | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          notification_sent?: boolean | null
          passengers_or_guests?: number | null
          route_or_destination: string
          status?: string
          target_price?: number | null
          travel_date?: string | null
          triggered_at?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          alert_type?: string
          created_at?: string
          current_price?: number | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          notification_sent?: boolean | null
          passengers_or_guests?: number | null
          route_or_destination?: string
          status?: string
          target_price?: number | null
          travel_date?: string | null
          triggered_at?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      travel_recommendations: {
        Row: {
          action_deadline: string | null
          created_at: string
          description: string
          estimated_savings: number | null
          id: string
          is_active: boolean | null
          is_read: boolean | null
          metadata: Json | null
          priority: string
          recommendation_type: string
          route_or_destination: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          action_deadline?: string | null
          created_at?: string
          description: string
          estimated_savings?: number | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          priority?: string
          recommendation_type: string
          route_or_destination?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          action_deadline?: string | null
          created_at?: string
          description?: string
          estimated_savings?: number | null
          id?: string
          is_active?: boolean | null
          is_read?: boolean | null
          metadata?: Json | null
          priority?: string
          recommendation_type?: string
          route_or_destination?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_id: string
          category: string
          created_at: string
          description: string
          id: string
          max_progress: number
          points: number
          progress: number
          title: string
          unlocked: boolean
          unlocked_at: string | null
          user_id: string
        }
        Insert: {
          achievement_id: string
          category: string
          created_at?: string
          description: string
          id?: string
          max_progress?: number
          points?: number
          progress?: number
          title: string
          unlocked?: boolean
          unlocked_at?: string | null
          user_id: string
        }
        Update: {
          achievement_id?: string
          category?: string
          created_at?: string
          description?: string
          id?: string
          max_progress?: number
          points?: number
          progress?: number
          title?: string
          unlocked?: boolean
          unlocked_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_dashboard_configs: {
        Row: {
          active_widgets: Json | null
          config_name: string
          created_at: string | null
          filters: Json | null
          id: string
          is_default: boolean | null
          layout_type: string
          updated_at: string | null
          user_id: string
          widget_positions: Json | null
        }
        Insert: {
          active_widgets?: Json | null
          config_name?: string
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          layout_type?: string
          updated_at?: string | null
          user_id: string
          widget_positions?: Json | null
        }
        Update: {
          active_widgets?: Json | null
          config_name?: string
          created_at?: string | null
          filters?: Json | null
          id?: string
          is_default?: boolean | null
          layout_type?: string
          updated_at?: string | null
          user_id?: string
          widget_positions?: Json | null
        }
        Relationships: []
      }
      user_feature_permissions: {
        Row: {
          area_access: string[] | null
          expires_at: string | null
          feature_module: string
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          location_type: string
          organization_id: string | null
          permission_level: string
          user_id: string | null
          vessel_access: string[] | null
        }
        Insert: {
          area_access?: string[] | null
          expires_at?: string | null
          feature_module: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          location_type?: string
          organization_id?: string | null
          permission_level?: string
          user_id?: string | null
          vessel_access?: string[] | null
        }
        Update: {
          area_access?: string[] | null
          expires_at?: string | null
          feature_module?: string
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          location_type?: string
          organization_id?: string | null
          permission_level?: string
          user_id?: string | null
          vessel_access?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "user_feature_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      user_feedback: {
        Row: {
          attachments: Json | null
          browser_info: string | null
          created_at: string
          description: string
          id: string
          page_url: string | null
          priority: string
          rating: number | null
          status: string
          title: string
          type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          browser_info?: string | null
          created_at?: string
          description: string
          id?: string
          page_url?: string | null
          priority?: string
          rating?: number | null
          status?: string
          title: string
          type: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          browser_info?: string | null
          created_at?: string
          description?: string
          id?: string
          page_url?: string | null
          priority?: string
          rating?: number | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_recommendations: {
        Row: {
          context: string
          created_at: string
          generated_at: string
          id: string
          insights: Json | null
          quick_actions: Json | null
          recommendations: Json
          user_id: string | null
        }
        Insert: {
          context: string
          created_at?: string
          generated_at?: string
          id?: string
          insights?: Json | null
          quick_actions?: Json | null
          recommendations?: Json
          user_id?: string | null
        }
        Update: {
          context?: string
          created_at?: string
          generated_at?: string
          id?: string
          insights?: Json | null
          quick_actions?: Json | null
          recommendations?: Json
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string | null
          department: string | null
          id: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      user_statistics: {
        Row: {
          active_alerts: number | null
          alerts_triggered: number | null
          created_at: string | null
          id: string
          total_alerts: number | null
          total_savings: number | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          active_alerts?: number | null
          alerts_triggered?: number | null
          created_at?: string | null
          id?: string
          total_alerts?: number | null
          total_savings?: number | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          active_alerts?: number | null
          alerts_triggered?: number | null
          created_at?: string | null
          id?: string
          total_alerts?: number | null
          total_savings?: number | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
      }
      ux_metrics: {
        Row: {
          category: string
          created_at: string
          id: string
          metric_name: string
          metric_unit: string
          metric_value: number
          recorded_at: string
          status: string
          target_value: number | null
          user_id: string | null
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          metric_name: string
          metric_unit: string
          metric_value: number
          recorded_at?: string
          status: string
          target_value?: number | null
          user_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          metric_name?: string
          metric_unit?: string
          metric_value?: number
          recorded_at?: string
          status?: string
          target_value?: number | null
          user_id?: string | null
        }
        Relationships: []
      }
      vessel_certificates: {
        Row: {
          category: string
          certificate_name: string
          certificate_number: string
          certificate_type: string
          compliance_score: number | null
          created_at: string
          expiry_date: string
          file_url: string | null
          holder_name: string
          id: string
          issue_date: string
          issuing_authority: string
          last_inspection: string | null
          next_inspection: string | null
          notes: string | null
          organization_id: string | null
          regulatory_body: string
          renewal_cost: number | null
          risk_level: string
          status: string
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          category: string
          certificate_name: string
          certificate_number: string
          certificate_type: string
          compliance_score?: number | null
          created_at?: string
          expiry_date: string
          file_url?: string | null
          holder_name: string
          id?: string
          issue_date: string
          issuing_authority: string
          last_inspection?: string | null
          next_inspection?: string | null
          notes?: string | null
          organization_id?: string | null
          regulatory_body: string
          renewal_cost?: number | null
          risk_level?: string
          status?: string
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          category?: string
          certificate_name?: string
          certificate_number?: string
          certificate_type?: string
          compliance_score?: number | null
          created_at?: string
          expiry_date?: string
          file_url?: string | null
          holder_name?: string
          id?: string
          issue_date?: string
          issuing_authority?: string
          last_inspection?: string | null
          next_inspection?: string | null
          notes?: string | null
          organization_id?: string | null
          regulatory_body?: string
          renewal_cost?: number | null
          risk_level?: string
          status?: string
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_certificates_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_tracking: {
        Row: {
          created_at: string | null
          engine_status: string | null
          fuel_level: number | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          recorded_at: string | null
          speed_knots: number | null
          vessel_id: string | null
          weather_conditions: Json | null
        }
        Insert: {
          created_at?: string | null
          engine_status?: string | null
          fuel_level?: number | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          recorded_at?: string | null
          speed_knots?: number | null
          vessel_id?: string | null
          weather_conditions?: Json | null
        }
        Update: {
          created_at?: string | null
          engine_status?: string | null
          fuel_level?: number | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          recorded_at?: string | null
          speed_knots?: number | null
          vessel_id?: string | null
          weather_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_tracking_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessels: {
        Row: {
          beam: number | null
          capacity: number | null
          created_at: string | null
          current_fuel_level: number | null
          current_location: string | null
          current_port_id: string | null
          draft: number | null
          eta: string | null
          flag_state: string
          fuel_capacity: number | null
          gross_tonnage: number | null
          id: string
          imo_number: string | null
          last_maintenance_date: string | null
          length: number | null
          name: string
          next_maintenance_date: string | null
          next_port: string | null
          operational_hours: number | null
          organization_id: string | null
          status: string | null
          updated_at: string | null
          vessel_type: string
        }
        Insert: {
          beam?: number | null
          capacity?: number | null
          created_at?: string | null
          current_fuel_level?: number | null
          current_location?: string | null
          current_port_id?: string | null
          draft?: number | null
          eta?: string | null
          flag_state: string
          fuel_capacity?: number | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: string | null
          last_maintenance_date?: string | null
          length?: number | null
          name: string
          next_maintenance_date?: string | null
          next_port?: string | null
          operational_hours?: number | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_type: string
        }
        Update: {
          beam?: number | null
          capacity?: number | null
          created_at?: string | null
          current_fuel_level?: number | null
          current_location?: string | null
          current_port_id?: string | null
          draft?: number | null
          eta?: string | null
          flag_state?: string
          fuel_capacity?: number | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: string | null
          last_maintenance_date?: string | null
          length?: number | null
          name?: string
          next_maintenance_date?: string | null
          next_port?: string | null
          operational_hours?: number | null
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "vessels_current_port_id_fkey"
            columns: ["current_port_id"]
            isOneToOne: false
            referencedRelation: "ports"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_commands: {
        Row: {
          action_executed: string | null
          command_text: string
          created_at: string
          id: string
          intent: string
          module_target: string | null
          response_time: number | null
          success: boolean | null
          user_id: string
        }
        Insert: {
          action_executed?: string | null
          command_text: string
          created_at?: string
          id?: string
          intent: string
          module_target?: string | null
          response_time?: number | null
          success?: boolean | null
          user_id: string
        }
        Update: {
          action_executed?: string | null
          command_text?: string
          created_at?: string
          id?: string
          intent?: string
          module_target?: string | null
          response_time?: number | null
          success?: boolean | null
          user_id?: string
        }
        Relationships: []
      }
      voice_conversations: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          session_id: string | null
          started_at: string
          status: string
          title: string | null
          total_duration: number | null
          total_messages: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          session_id?: string | null
          started_at?: string
          status?: string
          title?: string | null
          total_duration?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          session_id?: string | null
          started_at?: string
          status?: string
          title?: string | null
          total_duration?: number | null
          total_messages?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      voice_messages: {
        Row: {
          action_data: Json | null
          action_type: string | null
          audio_url: string | null
          content: string
          conversation_id: string
          created_at: string
          duration: number | null
          id: string
          transcript: string | null
          type: string
          user_id: string
        }
        Insert: {
          action_data?: Json | null
          action_type?: string | null
          audio_url?: string | null
          content: string
          conversation_id: string
          created_at?: string
          duration?: number | null
          id?: string
          transcript?: string | null
          type: string
          user_id: string
        }
        Update: {
          action_data?: Json | null
          action_type?: string | null
          audio_url?: string | null
          content?: string
          conversation_id?: string
          created_at?: string
          duration?: number | null
          id?: string
          transcript?: string | null
          type?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "voice_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_metrics: {
        Row: {
          id: string
          metadata: Json | null
          metric_type: string
          metric_value: number
          recorded_at: string
          session_id: string | null
          user_id: string | null
        }
        Insert: {
          id?: string
          metadata?: Json | null
          metric_type: string
          metric_value: number
          recorded_at?: string
          session_id?: string | null
          user_id?: string | null
        }
        Update: {
          id?: string
          metadata?: Json | null
          metric_type?: string
          metric_value?: number
          recorded_at?: string
          session_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      voice_settings: {
        Row: {
          auto_listen: boolean | null
          context_awareness: boolean | null
          created_at: string
          custom_instructions: string | null
          expertise: string[] | null
          id: string
          language: string | null
          microphone_sensitivity: number | null
          proactive_help: boolean | null
          response_length: string | null
          tone: string | null
          updated_at: string
          user_id: string
          voice_id: string | null
          volume: number | null
        }
        Insert: {
          auto_listen?: boolean | null
          context_awareness?: boolean | null
          created_at?: string
          custom_instructions?: string | null
          expertise?: string[] | null
          id?: string
          language?: string | null
          microphone_sensitivity?: number | null
          proactive_help?: boolean | null
          response_length?: string | null
          tone?: string | null
          updated_at?: string
          user_id: string
          voice_id?: string | null
          volume?: number | null
        }
        Update: {
          auto_listen?: boolean | null
          context_awareness?: boolean | null
          created_at?: string
          custom_instructions?: string | null
          expertise?: string[] | null
          id?: string
          language?: string | null
          microphone_sensitivity?: number | null
          proactive_help?: boolean | null
          response_length?: string | null
          tone?: string | null
          updated_at?: string
          user_id?: string
          voice_id?: string | null
          volume?: number | null
        }
        Relationships: []
      }
      voyages: {
        Row: {
          actual_arrival: string | null
          actual_departure: string | null
          cargo_manifest: Json | null
          created_at: string | null
          fuel_consumption: number | null
          id: string
          planned_arrival: string | null
          planned_departure: string | null
          route_id: string | null
          status: string | null
          updated_at: string | null
          vessel_id: string | null
          voyage_number: string
        }
        Insert: {
          actual_arrival?: string | null
          actual_departure?: string | null
          cargo_manifest?: Json | null
          created_at?: string | null
          fuel_consumption?: number | null
          id?: string
          planned_arrival?: string | null
          planned_departure?: string | null
          route_id?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
          voyage_number: string
        }
        Update: {
          actual_arrival?: string | null
          actual_departure?: string | null
          cargo_manifest?: Json | null
          created_at?: string | null
          fuel_consumption?: number | null
          id?: string
          planned_arrival?: string | null
          planned_departure?: string | null
          route_id?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
          voyage_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "voyages_route_id_fkey"
            columns: ["route_id"]
            isOneToOne: false
            referencedRelation: "routes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voyages_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          id: string
          title: string
          content: string
          created_by: string
          created_at: string
          updated_at: string
          is_favorite: boolean
          is_private: boolean
        }
        Insert: {
          id?: string
          title: string
          content: string
          created_by: string
          created_at?: string
          updated_at?: string
          is_favorite?: boolean
          is_private?: boolean
        }
        Update: {
          id?: string
          title?: string
          content?: string
          created_by?: string
          created_at?: string
          updated_at?: string
          is_favorite?: boolean
          is_private?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "templates_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      mmi_os_ia_feed: {
        Row: {
          acao_realizada: string | null
          causa_confirmada: string | null
          componente: string | null
          descricao_tecnica: string | null
          duracao_execucao: string | null
          efetiva: boolean | null
          job_id: string | null
          resolvido_em: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      calculate_checklist_compliance_score: {
        Args: { checklist_items: Json }
        Returns: number
      }
      calculate_crew_overall_performance: {
        Args: { crew_uuid: string }
        Returns: number
      }
      calculate_peotram_compliance_score: {
        Args: { audit_uuid: string }
        Returns: number
      }
      can_access_employee_data: {
        Args: { target_employee_id: string; user_uuid?: string }
        Returns: boolean
      }
      can_manage_tenant: {
        Args: { tenant_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      check_organization_limits: {
        Args: { limit_type: string; org_id: string }
        Returns: boolean
      }
      check_tenant_limits: {
        Args: { limit_type: string; tenant_uuid: string }
        Returns: boolean
      }
      create_sample_peotram_audit: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      detect_reservation_conflicts: {
        Args: {
          p_end_date: string
          p_exclude_id?: string
          p_start_date: string
          p_user_id: string
        }
        Returns: {
          conflicting_end_date: string
          conflicting_reservation_id: string
          conflicting_start_date: string
          conflicting_title: string
        }[]
      }
      generate_crew_ai_recommendations: {
        Args: { crew_uuid: string }
        Returns: undefined
      }
      generate_next_checklist_date: {
        Args: { frequency: string; last_date?: string }
        Returns: string
      }
      get_current_organization_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_tenant_id: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_reservation_stats: {
        Args: { p_user_id?: string }
        Returns: {
          cancelled_reservations: number
          completed_reservations: number
          confirmed_reservations: number
          conflicts_count: number
          pending_reservations: number
          total_amount: number
          total_reservations: number
        }[]
      }
      get_user_organization_role: {
        Args: { org_id: string; user_uuid?: string }
        Returns: string
      }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_tenant_role: {
        Args: { tenant_uuid: string; user_uuid?: string }
        Returns: string
      }
      has_feature_permission: {
        Args: {
          feature_name: string
          required_level?: string
          target_vessel_id?: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: {
          permission_name: string
          permission_type?: string
          user_uuid?: string
        }
        Returns: boolean
      }
      is_admin: {
        Args: { _user_id: string }
        Returns: boolean
      }
      user_belongs_to_org: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      user_belongs_to_organization: {
        Args: { org_id: string; user_uuid?: string }
        Returns: boolean
      }
      user_belongs_to_tenant: {
        Args: { tenant_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      user_in_organization: {
        Args: { org_id: string; user_id: string }
        Returns: boolean
      }
      user_in_tenant: {
        Args: { tenant_id: string; user_id: string }
        Returns: boolean
      }
      user_is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      user_role:
        | "admin"
        | "hr_manager"
        | "employee"
        | "manager"
        | "hr_analyst"
        | "department_manager"
        | "supervisor"
        | "coordinator"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      user_role: [
        "admin",
        "hr_manager",
        "employee",
        "manager",
        "hr_analyst",
        "department_manager",
        "supervisor",
        "coordinator",
      ],
    },
  },
} as const;
