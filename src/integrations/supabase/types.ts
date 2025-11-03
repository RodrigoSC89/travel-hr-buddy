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
      academy_courses: {
        Row: {
          assessments: Json | null
          certificate_template: string | null
          course_description: string | null
          course_name: string
          created_at: string | null
          duration_hours: number | null
          id: string
          instructor_id: string | null
          is_published: boolean | null
          metadata: Json | null
          modules: Json | null
          organization_id: string | null
          passing_score: number | null
          updated_at: string | null
        }
        Insert: {
          assessments?: Json | null
          certificate_template?: string | null
          course_description?: string | null
          course_name: string
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          metadata?: Json | null
          modules?: Json | null
          organization_id?: string | null
          passing_score?: number | null
          updated_at?: string | null
        }
        Update: {
          assessments?: Json | null
          certificate_template?: string | null
          course_description?: string | null
          course_name?: string
          created_at?: string | null
          duration_hours?: number | null
          id?: string
          instructor_id?: string | null
          is_published?: boolean | null
          metadata?: Json | null
          modules?: Json | null
          organization_id?: string | null
          passing_score?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_courses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      academy_progress: {
        Row: {
          assessment_scores: Json | null
          certificate_issued: boolean | null
          completed_at: string | null
          completed_modules: number[] | null
          course_id: string | null
          created_at: string | null
          current_module: number | null
          id: string
          metadata: Json | null
          progress_percent: number | null
          started_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assessment_scores?: Json | null
          certificate_issued?: boolean | null
          completed_at?: string | null
          completed_modules?: number[] | null
          course_id?: string | null
          created_at?: string | null
          current_module?: number | null
          id?: string
          metadata?: Json | null
          progress_percent?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assessment_scores?: Json | null
          certificate_issued?: boolean | null
          completed_at?: string | null
          completed_modules?: number[] | null
          course_id?: string | null
          created_at?: string | null
          current_module?: number | null
          id?: string
          metadata?: Json | null
          progress_percent?: number | null
          started_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "academy_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "academy_courses"
            referencedColumns: ["id"]
          },
        ]
      }
      access_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          ip_address: unknown
          module_accessed: string
          result: string
          severity: string
          timestamp: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          module_accessed: string
          result: string
          severity?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          ip_address?: unknown
          module_accessed?: string
          result?: string
          severity?: string
          timestamp?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      active_sessions: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          ip_address: unknown
          is_active: boolean | null
          last_activity: string
          refresh_token: string | null
          session_token: string
          user_agent: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string
          refresh_token?: string | null
          session_token: string
          user_agent?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          ip_address?: unknown
          is_active?: boolean | null
          last_activity?: string
          refresh_token?: string | null
          session_token?: string
          user_agent?: string | null
          user_id?: string
        }
        Relationships: []
      }
      adaptive_parameters: {
        Row: {
          auto_adjust: boolean | null
          baseline_value: number
          created_at: string | null
          current_value: number
          id: string
          last_adjusted_at: string | null
          module_name: string
          parameter_name: string
          tenant_id: string | null
          threshold_percent: number | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          auto_adjust?: boolean | null
          baseline_value: number
          created_at?: string | null
          current_value: number
          id?: string
          last_adjusted_at?: string | null
          module_name: string
          parameter_name: string
          tenant_id?: string | null
          threshold_percent?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          auto_adjust?: boolean | null
          baseline_value?: number
          created_at?: string | null
          current_value?: number
          id?: string
          last_adjusted_at?: string | null
          module_name?: string
          parameter_name?: string
          tenant_id?: string | null
          threshold_percent?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "adaptive_parameters_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      agent_registry: {
        Row: {
          agent_id: string
          capabilities: Json
          created_at: string
          id: string
          last_heartbeat: string | null
          metadata: Json | null
          name: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          capabilities?: Json
          created_at?: string
          id?: string
          last_heartbeat?: string | null
          metadata?: Json | null
          name: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          capabilities?: Json
          created_at?: string
          id?: string
          last_heartbeat?: string | null
          metadata?: Json | null
          name?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      agent_swarm_metrics: {
        Row: {
          agent_id: string
          avg_response_time_ms: number
          created_at: string
          error_count: number
          id: string
          last_task_at: string | null
          success_count: number
          task_count: number
          updated_at: string
        }
        Insert: {
          agent_id: string
          avg_response_time_ms?: number
          created_at?: string
          error_count?: number
          id?: string
          last_task_at?: string | null
          success_count?: number
          task_count?: number
          updated_at?: string
        }
        Update: {
          agent_id?: string
          avg_response_time_ms?: number
          created_at?: string
          error_count?: number
          id?: string
          last_task_at?: string | null
          success_count?: number
          task_count?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_swarm_metrics_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agent_registry"
            referencedColumns: ["agent_id"]
          },
        ]
      }
      ai_commands: {
        Row: {
          command_hash: string
          command_text: string
          command_type: string
          completed_at: string | null
          created_at: string
          error_details: string | null
          execution_status: string
          execution_time_ms: number | null
          id: string
          mission_id: string | null
          parameters: Json | null
          result: Json | null
          source_module: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          command_hash: string
          command_text: string
          command_type: string
          completed_at?: string | null
          created_at?: string
          error_details?: string | null
          execution_status: string
          execution_time_ms?: number | null
          id?: string
          mission_id?: string | null
          parameters?: Json | null
          result?: Json | null
          source_module: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          command_hash?: string
          command_text?: string
          command_type?: string
          completed_at?: string | null
          created_at?: string
          error_details?: string | null
          execution_status?: string
          execution_time_ms?: number | null
          id?: string
          mission_id?: string | null
          parameters?: Json | null
          result?: Json | null
          source_module?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_document_templates: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_favorite: boolean | null
          is_private: boolean | null
          organization_id: string | null
          pdf_settings: Json | null
          tags: string[] | null
          template_type: string
          title: string
          updated_at: string | null
          user_id: string | null
          variables: Json | null
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_private?: boolean | null
          organization_id?: string | null
          pdf_settings?: Json | null
          tags?: string[] | null
          template_type: string
          title: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_favorite?: boolean | null
          is_private?: boolean | null
          organization_id?: string | null
          pdf_settings?: Json | null
          tags?: string[] | null
          template_type?: string
          title?: string
          updated_at?: string | null
          user_id?: string | null
          variables?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_document_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_documents: {
        Row: {
          created_at: string
          file_name: string
          file_size: number | null
          file_type: string
          id: string
          ocr_status: string
          organization_id: string | null
          storage_path: string
          updated_at: string
          uploaded_by: string | null
        }
        Insert: {
          created_at?: string
          file_name: string
          file_size?: number | null
          file_type: string
          id?: string
          ocr_status?: string
          organization_id?: string | null
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Update: {
          created_at?: string
          file_name?: string
          file_size?: number | null
          file_type?: string
          id?: string
          ocr_status?: string
          organization_id?: string | null
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_feedback_scores: {
        Row: {
          command_data: Json
          command_type: string
          created_at: string
          feedback_data: Json | null
          id: string
          improvements: Json | null
          self_score: number
          user_id: string | null
        }
        Insert: {
          command_data?: Json
          command_type: string
          created_at?: string
          feedback_data?: Json | null
          id?: string
          improvements?: Json | null
          self_score: number
          user_id?: string | null
        }
        Update: {
          command_data?: Json
          command_type?: string
          created_at?: string
          feedback_data?: Json | null
          id?: string
          improvements?: Json | null
          self_score?: number
          user_id?: string | null
        }
        Relationships: []
      }
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
      ai_logs: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          metadata: Json | null
          model: string | null
          prompt_hash: string
          prompt_length: number
          response_length: number | null
          response_time_ms: number | null
          service: string
          status: string
          tokens_used: number | null
          user_id_hash: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          prompt_hash: string
          prompt_length: number
          response_length?: number | null
          response_time_ms?: number | null
          service: string
          status: string
          tokens_used?: number | null
          user_id_hash?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          metadata?: Json | null
          model?: string | null
          prompt_hash?: string
          prompt_length?: number
          response_length?: number | null
          response_time_ms?: number | null
          service?: string
          status?: string
          tokens_used?: number | null
          user_id_hash?: string | null
        }
        Relationships: []
      }
      ai_memory_events: {
        Row: {
          confidence: number | null
          context: string | null
          created_at: string
          embedding: string | null
          event_data: Json
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          confidence?: number | null
          context?: string | null
          created_at?: string
          embedding?: string | null
          event_data?: Json
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          confidence?: number | null
          context?: string | null
          created_at?: string
          embedding?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ai_performance_metrics: {
        Row: {
          approval_count: number | null
          avg_confidence: number | null
          correction_count: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_value: number
          module_name: string
          period_end: string
          period_start: string
          rejection_count: number | null
          success_rate: number | null
          tenant_id: string | null
        }
        Insert: {
          approval_count?: number | null
          avg_confidence?: number | null
          correction_count?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_value: number
          module_name: string
          period_end: string
          period_start: string
          rejection_count?: number | null
          success_rate?: number | null
          tenant_id?: string | null
        }
        Update: {
          approval_count?: number | null
          avg_confidence?: number | null
          correction_count?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_value?: number
          module_name?: string
          period_end?: string
          period_start?: string
          rejection_count?: number | null
          success_rate?: number | null
          tenant_id?: string | null
        }
        Relationships: []
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
      ai_suggestions: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          confidence: number | null
          created_at: string | null
          effectiveness_score: number | null
          expected_impact: string | null
          expires_at: string | null
          id: string
          issue_description: string
          metadata: Json | null
          module_name: string
          severity: string
          status: string | null
          suggestion_text: string
          suggestion_type: string
          tenant_id: string | null
          vessel_id: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          confidence?: number | null
          created_at?: string | null
          effectiveness_score?: number | null
          expected_impact?: string | null
          expires_at?: string | null
          id?: string
          issue_description: string
          metadata?: Json | null
          module_name: string
          severity: string
          status?: string | null
          suggestion_text: string
          suggestion_type: string
          tenant_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          confidence?: number | null
          created_at?: string | null
          effectiveness_score?: number | null
          expected_impact?: string | null
          expires_at?: string | null
          id?: string
          issue_description?: string
          metadata?: Json | null
          module_name?: string
          severity?: string
          status?: string | null
          suggestion_text?: string
          suggestion_type?: string
          tenant_id?: string | null
          vessel_id?: string | null
        }
        Relationships: []
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
      analytics_dashboards: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_public: boolean | null
          layout: Json | null
          name: string
          organization_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          layout?: Json | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_public?: boolean | null
          layout?: Json | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_dashboards_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          browser: string | null
          city: string | null
          country_code: string | null
          created_at: string | null
          device_type: string | null
          event_category: string | null
          event_name: string
          id: string
          ip_address: unknown
          organization_id: string | null
          os: string | null
          page_url: string | null
          properties: Json | null
          referrer: string | null
          session_id: string | null
          timestamp: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_name: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          os?: string | null
          page_url?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          city?: string | null
          country_code?: string | null
          created_at?: string | null
          device_type?: string | null
          event_category?: string | null
          event_name?: string
          id?: string
          ip_address?: unknown
          organization_id?: string | null
          os?: string | null
          page_url?: string | null
          properties?: Json | null
          referrer?: string | null
          session_id?: string | null
          timestamp?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_insights: {
        Row: {
          action_taken: boolean | null
          action_taken_at: string | null
          confidence: number | null
          content: string
          created_at: string | null
          data_reference: Json | null
          expires_at: string | null
          id: string
          insight_type: string
          is_actionable: boolean | null
          organization_id: string | null
          priority: string | null
          title: string
        }
        Insert: {
          action_taken?: boolean | null
          action_taken_at?: string | null
          confidence?: number | null
          content: string
          created_at?: string | null
          data_reference?: Json | null
          expires_at?: string | null
          id?: string
          insight_type: string
          is_actionable?: boolean | null
          organization_id?: string | null
          priority?: string | null
          title: string
        }
        Update: {
          action_taken?: boolean | null
          action_taken_at?: string | null
          confidence?: number | null
          content?: string
          created_at?: string | null
          data_reference?: Json | null
          expires_at?: string | null
          id?: string
          insight_type?: string
          is_actionable?: boolean | null
          organization_id?: string | null
          priority?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_insights_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_metrics: {
        Row: {
          aggregation_type: string | null
          created_at: string | null
          dimensions: Json | null
          id: string
          metric_name: string
          metric_unit: string | null
          metric_value: number
          organization_id: string | null
          period_end: string
          period_start: string
          updated_at: string | null
        }
        Insert: {
          aggregation_type?: string | null
          created_at?: string | null
          dimensions?: Json | null
          id?: string
          metric_name: string
          metric_unit?: string | null
          metric_value: number
          organization_id?: string | null
          period_end: string
          period_start: string
          updated_at?: string | null
        }
        Update: {
          aggregation_type?: string | null
          created_at?: string | null
          dimensions?: Json | null
          id?: string
          metric_name?: string
          metric_unit?: string | null
          metric_value?: number
          organization_id?: string | null
          period_end?: string
          period_start?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_reports: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          file_size: number | null
          file_url: string | null
          format: string
          id: string
          name: string
          organization_id: string | null
          parameters: Json | null
          report_type: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_size?: number | null
          file_url?: string | null
          format: string
          id?: string
          name: string
          organization_id?: string | null
          parameters?: Json | null
          report_type: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          file_size?: number | null
          file_url?: string | null
          format?: string
          id?: string
          name?: string
          organization_id?: string | null
          parameters?: Json | null
          report_type?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_widgets: {
        Row: {
          config: Json | null
          created_at: string | null
          dashboard_id: string | null
          data_source: string | null
          id: string
          position: Json | null
          query_config: Json | null
          title: string
          updated_at: string | null
          widget_type: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          dashboard_id?: string | null
          data_source?: string | null
          id?: string
          position?: Json | null
          query_config?: Json | null
          title: string
          updated_at?: string | null
          widget_type: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          dashboard_id?: string | null
          data_source?: string | null
          id?: string
          position?: Json | null
          query_config?: Json | null
          title?: string
          updated_at?: string | null
          widget_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "analytics_widgets_dashboard_id_fkey"
            columns: ["dashboard_id"]
            isOneToOne: false
            referencedRelation: "analytics_dashboards"
            referencedColumns: ["id"]
          },
        ]
      }
      api_analytics: {
        Row: {
          avg_response_time_ms: number | null
          created_at: string | null
          endpoint: string
          failed_requests: number | null
          id: string
          method: string | null
          organization_id: string | null
          p95_response_time_ms: number | null
          p99_response_time_ms: number | null
          period_end: string
          period_start: string
          successful_requests: number | null
          total_data_transferred: number | null
          total_requests: number | null
          unique_api_keys: number | null
        }
        Insert: {
          avg_response_time_ms?: number | null
          created_at?: string | null
          endpoint: string
          failed_requests?: number | null
          id?: string
          method?: string | null
          organization_id?: string | null
          p95_response_time_ms?: number | null
          p99_response_time_ms?: number | null
          period_end: string
          period_start: string
          successful_requests?: number | null
          total_data_transferred?: number | null
          total_requests?: number | null
          unique_api_keys?: number | null
        }
        Update: {
          avg_response_time_ms?: number | null
          created_at?: string | null
          endpoint?: string
          failed_requests?: number | null
          id?: string
          method?: string | null
          organization_id?: string | null
          p95_response_time_ms?: number | null
          p99_response_time_ms?: number | null
          period_end?: string
          period_start?: string
          successful_requests?: number | null
          total_data_transferred?: number | null
          total_requests?: number | null
          unique_api_keys?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "api_analytics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_gateway_requests: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          endpoint: string
          error_message: string | null
          id: string
          ip_address: unknown
          method: string
          organization_id: string | null
          request_headers: Json | null
          request_size: number | null
          response_headers: Json | null
          response_size: number | null
          response_time_ms: number | null
          status_code: number
          user_agent: string | null
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          method: string
          organization_id?: string | null
          request_headers?: Json | null
          request_size?: number | null
          response_headers?: Json | null
          response_size?: number | null
          response_time_ms?: number | null
          status_code: number
          user_agent?: string | null
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          ip_address?: unknown
          method?: string
          organization_id?: string | null
          request_headers?: Json | null
          request_size?: number | null
          response_headers?: Json | null
          response_size?: number | null
          response_time_ms?: number | null
          status_code?: number
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_gateway_requests_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "api_gateway_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_gateway_webhook_deliveries: {
        Row: {
          attempt_number: number | null
          created_at: string | null
          delivered_at: string | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          response_time_ms: number | null
          status: string | null
          webhook_id: string | null
        }
        Insert: {
          attempt_number?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          status?: string | null
          webhook_id?: string | null
        }
        Update: {
          attempt_number?: number | null
          created_at?: string | null
          delivered_at?: string | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          response_time_ms?: number | null
          status?: string | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_gateway_webhook_deliveries_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "api_gateway_webhooks"
            referencedColumns: ["id"]
          },
        ]
      }
      api_gateway_webhooks: {
        Row: {
          created_at: string | null
          events: string[]
          failure_count: number | null
          headers: Json | null
          id: string
          is_active: boolean | null
          last_failure_at: string | null
          last_success_at: string | null
          last_triggered_at: string | null
          organization_id: string | null
          retry_count: number | null
          retry_delay_seconds: number | null
          secret_key: string
          timeout_seconds: number | null
          updated_at: string | null
          user_id: string | null
          webhook_name: string
          webhook_url: string
        }
        Insert: {
          created_at?: string | null
          events: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          organization_id?: string | null
          retry_count?: number | null
          retry_delay_seconds?: number | null
          secret_key: string
          timeout_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
          webhook_name: string
          webhook_url: string
        }
        Update: {
          created_at?: string | null
          events?: string[]
          failure_count?: number | null
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_failure_at?: string | null
          last_success_at?: string | null
          last_triggered_at?: string | null
          organization_id?: string | null
          retry_count?: number | null
          retry_delay_seconds?: number | null
          secret_key?: string
          timeout_seconds?: number | null
          updated_at?: string | null
          user_id?: string | null
          webhook_name?: string
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_gateway_webhooks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_keys: {
        Row: {
          allowed_endpoints: string[] | null
          allowed_ips: string[] | null
          created_at: string | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at: string | null
          metadata: Json | null
          organization_id: string | null
          rate_limit_per_day: number | null
          rate_limit_per_hour: number | null
          rate_limit_per_minute: number | null
          tier: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          allowed_endpoints?: string[] | null
          allowed_ips?: string[] | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash: string
          key_name: string
          key_prefix: string
          last_used_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          allowed_endpoints?: string[] | null
          allowed_ips?: string[] | null
          created_at?: string | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          key_hash?: string
          key_name?: string
          key_prefix?: string
          last_used_at?: string | null
          metadata?: Json | null
          organization_id?: string | null
          rate_limit_per_day?: number | null
          rate_limit_per_hour?: number | null
          rate_limit_per_minute?: number | null
          tier?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_keys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      api_rate_limits: {
        Row: {
          api_key_id: string | null
          created_at: string | null
          id: string
          limit_exceeded: boolean | null
          request_count: number | null
          updated_at: string | null
          window_end: string
          window_start: string
          window_type: string
        }
        Insert: {
          api_key_id?: string | null
          created_at?: string | null
          id?: string
          limit_exceeded?: boolean | null
          request_count?: number | null
          updated_at?: string | null
          window_end: string
          window_start: string
          window_type: string
        }
        Update: {
          api_key_id?: string | null
          created_at?: string | null
          id?: string
          limit_exceeded?: boolean | null
          request_count?: number | null
          updated_at?: string | null
          window_end?: string
          window_start?: string
          window_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "api_rate_limits_api_key_id_fkey"
            columns: ["api_key_id"]
            isOneToOne: false
            referencedRelation: "api_keys"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_center_logs: {
        Row: {
          action: string
          ai_response: Json | null
          audit_id: string
          audit_type: string
          checklist_data: Json | null
          compliance_score: number | null
          created_at: string | null
          evidence_files: string[] | null
          id: string
          metadata: Json | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          ai_response?: Json | null
          audit_id: string
          audit_type: string
          checklist_data?: Json | null
          compliance_score?: number | null
          created_at?: string | null
          evidence_files?: string[] | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          ai_response?: Json | null
          audit_id?: string
          audit_type?: string
          checklist_data?: Json | null
          compliance_score?: number | null
          created_at?: string | null
          evidence_files?: string[] | null
          id?: string
          metadata?: Json | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      audit_evidence: {
        Row: {
          audit_id: string
          file_name: string
          file_path: string
          file_size: number | null
          file_type: string
          id: string
          metadata: Json | null
          uploaded_at: string | null
          uploaded_by: string | null
        }
        Insert: {
          audit_id: string
          file_name: string
          file_path: string
          file_size?: number | null
          file_type: string
          id?: string
          metadata?: Json | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Update: {
          audit_id?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          file_type?: string
          id?: string
          metadata?: Json | null
          uploaded_at?: string | null
          uploaded_by?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      autofix_history: {
        Row: {
          applied_at: string
          applied_by: string | null
          details: Json | null
          file_path: string
          fix_applied: string
          id: string
          issue_type: string
          reverted_at: string | null
          status: string | null
        }
        Insert: {
          applied_at?: string
          applied_by?: string | null
          details?: Json | null
          file_path: string
          fix_applied: string
          id?: string
          issue_type: string
          reverted_at?: string | null
          status?: string | null
        }
        Update: {
          applied_at?: string
          applied_by?: string | null
          details?: Json | null
          file_path?: string
          fix_applied?: string
          id?: string
          issue_type?: string
          reverted_at?: string | null
          status?: string | null
        }
        Relationships: []
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
      automation_logs: {
        Row: {
          actions_executed: Json | null
          error_message: string | null
          executed_at: string
          execution_time_ms: number | null
          id: string
          rule_id: string | null
          status: string
          trigger_data: Json | null
        }
        Insert: {
          actions_executed?: Json | null
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          rule_id?: string | null
          status: string
          trigger_data?: Json | null
        }
        Update: {
          actions_executed?: Json | null
          error_message?: string | null
          executed_at?: string
          execution_time_ms?: number | null
          id?: string
          rule_id?: string | null
          status?: string
          trigger_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_logs_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: false
            referencedRelation: "automation_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_rules: {
        Row: {
          actions: Json
          conditions: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          execution_count: number
          id: string
          is_active: boolean
          last_executed_at: string | null
          organization_id: string | null
          rule_name: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          organization_id?: string | null
          rule_name: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          execution_count?: number
          id?: string
          is_active?: boolean
          last_executed_at?: string | null
          organization_id?: string | null
          rule_name?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      beta_feedback: {
        Row: {
          attachments: Json | null
          created_at: string | null
          description: string
          feature_name: string
          feedback_type: string
          id: string
          metadata: Json | null
          priority: string | null
          rating: number | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          created_at?: string | null
          description: string
          feature_name: string
          feedback_type: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          rating?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          created_at?: string | null
          description?: string
          feature_name?: string
          feedback_type?: string
          id?: string
          metadata?: Json | null
          priority?: string | null
          rating?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      channel_messages: {
        Row: {
          channel_id: string | null
          created_at: string | null
          id: string
          is_urgent: boolean | null
          message_content: string
          message_type: string | null
          metadata: Json | null
          read_by: string[] | null
          sender_id: string | null
        }
        Insert: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          is_urgent?: boolean | null
          message_content: string
          message_type?: string | null
          metadata?: Json | null
          read_by?: string[] | null
          sender_id?: string | null
        }
        Update: {
          channel_id?: string | null
          created_at?: string | null
          id?: string
          is_urgent?: boolean | null
          message_content?: string
          message_type?: string | null
          metadata?: Json | null
          read_by?: string[] | null
          sender_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "communication_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      channel_status_log: {
        Row: {
          channel_id: string
          created_at: string | null
          id: string
          message: string
          status: string
          timestamp: string
        }
        Insert: {
          channel_id: string
          created_at?: string | null
          id?: string
          message: string
          status: string
          timestamp?: string
        }
        Update: {
          channel_id?: string
          created_at?: string | null
          id?: string
          message?: string
          status?: string
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "channel_status_log_channel_id_fkey"
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
      checklist_completions: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          checklist_name: string
          completed_at: string | null
          completed_by: string | null
          completion_data: Json
          id: string
          notes: string | null
          score: number | null
          started_at: string
          status: string | null
          vessel_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          checklist_name: string
          completed_at?: string | null
          completed_by?: string | null
          completion_data: Json
          id?: string
          notes?: string | null
          score?: number | null
          started_at?: string
          status?: string | null
          vessel_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          checklist_name?: string
          completed_at?: string | null
          completed_by?: string | null
          completion_data?: Json
          id?: string
          notes?: string | null
          score?: number | null
          started_at?: string
          status?: string | null
          vessel_id?: string | null
        }
        Relationships: []
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
      cognitive_feedback: {
        Row: {
          after_state: Json | null
          applied: boolean | null
          before_state: Json | null
          context: Json | null
          correction_type: string | null
          created_at: string | null
          decision_id: string
          id: string
          impact_score: number | null
          module_name: string | null
          operator_action: string | null
          operator_id: string | null
          reason: string | null
          timestamp: string | null
        }
        Insert: {
          after_state?: Json | null
          applied?: boolean | null
          before_state?: Json | null
          context?: Json | null
          correction_type?: string | null
          created_at?: string | null
          decision_id: string
          id?: string
          impact_score?: number | null
          module_name?: string | null
          operator_action?: string | null
          operator_id?: string | null
          reason?: string | null
          timestamp?: string | null
        }
        Update: {
          after_state?: Json | null
          applied?: boolean | null
          before_state?: Json | null
          context?: Json | null
          correction_type?: string | null
          created_at?: string | null
          decision_id?: string
          id?: string
          impact_score?: number | null
          module_name?: string | null
          operator_action?: string | null
          operator_id?: string | null
          reason?: string | null
          timestamp?: string | null
        }
        Relationships: []
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
      connected_integrations: {
        Row: {
          created_at: string | null
          id: string
          integration_name: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          oauth_access_token: string | null
          oauth_refresh_token: string | null
          oauth_token_expires_at: string | null
          organization_id: string | null
          provider: string
          scopes: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          integration_name: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          oauth_access_token?: string | null
          oauth_refresh_token?: string | null
          oauth_token_expires_at?: string | null
          organization_id?: string | null
          provider: string
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          integration_name?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          oauth_access_token?: string | null
          oauth_refresh_token?: string | null
          oauth_token_expires_at?: string | null
          organization_id?: string | null
          provider?: string
          scopes?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      context_snapshots: {
        Row: {
          context_data: Json
          context_type: string
          created_at: string | null
          id: string
          source_module: string
          sync_status: string | null
          tenant_id: string | null
          updated_at: string | null
          version: number | null
          vessel_id: string | null
        }
        Insert: {
          context_data?: Json
          context_type: string
          created_at?: string | null
          id?: string
          source_module: string
          sync_status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          version?: number | null
          vessel_id?: string | null
        }
        Update: {
          context_data?: Json
          context_type?: string
          created_at?: string | null
          id?: string
          source_module?: string
          sync_status?: string | null
          tenant_id?: string | null
          updated_at?: string | null
          version?: number | null
          vessel_id?: string | null
        }
        Relationships: []
      }
      context_sync_logs: {
        Row: {
          action: string
          context_type: string
          created_at: string | null
          error_message: string | null
          id: string
          metadata: Json | null
          source_module: string
          success: boolean | null
          sync_duration_ms: number | null
          target_modules: string[] | null
        }
        Insert: {
          action: string
          context_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          source_module: string
          success?: boolean | null
          sync_duration_ms?: number | null
          target_modules?: string[] | null
        }
        Update: {
          action?: string
          context_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          metadata?: Json | null
          source_module?: string
          success?: boolean | null
          sync_duration_ms?: number | null
          target_modules?: string[] | null
        }
        Relationships: []
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
      copilot_sessions: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          messages: Json | null
          metadata: Json | null
          recommendations: Json | null
          session_name: string | null
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          metadata?: Json | null
          recommendations?: Json | null
          session_name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json | null
          metadata?: Json | null
          recommendations?: Json | null
          session_name?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: []
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
      crew_health_logs: {
        Row: {
          created_at: string | null
          crew_member_id: string
          energy_level: number | null
          id: string
          mood: number | null
          notes: string | null
          sleep_quality: number | null
          stress_level: number | null
          timestamp: string | null
        }
        Insert: {
          created_at?: string | null
          crew_member_id: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          timestamp?: string | null
        }
        Update: {
          created_at?: string | null
          crew_member_id?: string
          energy_level?: number | null
          id?: string
          mood?: number | null
          notes?: string | null
          sleep_quality?: number | null
          stress_level?: number | null
          timestamp?: string | null
        }
        Relationships: []
      }
      crew_health_metrics: {
        Row: {
          anomaly_detected: boolean | null
          anomaly_type: string | null
          blood_pressure: string | null
          created_at: string | null
          crew_member_id: string | null
          fatigue_level: number | null
          heart_rate: number | null
          id: string
          metadata: Json | null
          metric_date: string | null
          mood_score: number | null
          notes: string | null
          sleep_hours: number | null
          stress_level: number | null
          updated_at: string | null
        }
        Insert: {
          anomaly_detected?: boolean | null
          anomaly_type?: string | null
          blood_pressure?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          fatigue_level?: number | null
          heart_rate?: number | null
          id?: string
          metadata?: Json | null
          metric_date?: string | null
          mood_score?: number | null
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          updated_at?: string | null
        }
        Update: {
          anomaly_detected?: boolean | null
          anomaly_type?: string | null
          blood_pressure?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          fatigue_level?: number | null
          heart_rate?: number | null
          id?: string
          metadata?: Json | null
          metric_date?: string | null
          mood_score?: number | null
          notes?: string | null
          sleep_hours?: number | null
          stress_level?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      crew_status: {
        Row: {
          created_at: string | null
          crew_member_id: string
          department: string | null
          full_name: string | null
          id: string
          position: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          crew_member_id: string
          department?: string | null
          full_name?: string | null
          id?: string
          position?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          crew_member_id?: string
          department?: string | null
          full_name?: string | null
          id?: string
          position?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
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
      decision_history: {
        Row: {
          changed_by: string | null
          created_at: string | null
          decision_id: string
          id: string
          metadata: Json | null
          new_status: string
          previous_status: string
          reason: string | null
        }
        Insert: {
          changed_by?: string | null
          created_at?: string | null
          decision_id: string
          id?: string
          metadata?: Json | null
          new_status: string
          previous_status: string
          reason?: string | null
        }
        Update: {
          changed_by?: string | null
          created_at?: string | null
          decision_id?: string
          id?: string
          metadata?: Json | null
          new_status?: string
          previous_status?: string
          reason?: string | null
        }
        Relationships: []
      }
      distributed_decisions: {
        Row: {
          approved_by: string | null
          confidence: number | null
          context: Json
          created_at: string | null
          decision_level: string
          decision_status: string | null
          decision_type: string
          escalation_reason: string | null
          executed_at: string | null
          id: string
          outcome: string | null
          priority: string
          simulation_result: Json | null
          tenant_id: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          approved_by?: string | null
          confidence?: number | null
          context?: Json
          created_at?: string | null
          decision_level: string
          decision_status?: string | null
          decision_type: string
          escalation_reason?: string | null
          executed_at?: string | null
          id?: string
          outcome?: string | null
          priority: string
          simulation_result?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          approved_by?: string | null
          confidence?: number | null
          context?: Json
          created_at?: string | null
          decision_level?: string
          decision_status?: string | null
          decision_type?: string
          escalation_reason?: string | null
          executed_at?: string | null
          id?: string
          outcome?: string | null
          priority?: string
          simulation_result?: Json | null
          tenant_id?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: []
      }
      document_template_versions: {
        Row: {
          change_description: string | null
          created_at: string | null
          created_by: string | null
          id: string
          is_current: boolean | null
          organization_id: string | null
          template_content: string
          template_id: string | null
          template_name: string
          variables: Json | null
          version_number: number
        }
        Insert: {
          change_description?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_current?: boolean | null
          organization_id?: string | null
          template_content: string
          template_id?: string | null
          template_name: string
          variables?: Json | null
          version_number?: number
        }
        Update: {
          change_description?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_current?: boolean | null
          organization_id?: string | null
          template_content?: string
          template_id?: string | null
          template_name?: string
          variables?: Json | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_template_versions_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string
          description: string | null
          id: string
          is_public: boolean | null
          metadata: Json | null
          name: string
          organization_id: string | null
          tags: string[] | null
          updated_at: string
          user_id: string
          variables: string[] | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          name: string
          organization_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id: string
          variables?: string[] | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string
          description?: string | null
          id?: string
          is_public?: boolean | null
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          tags?: string[] | null
          updated_at?: string
          user_id?: string
          variables?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "document_templates_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_incidents: {
        Row: {
          description: string
          id: string
          incident_type: string
          location: Json | null
          metadata: Json | null
          reported_at: string
          reported_by: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          vessel_id: string | null
        }
        Insert: {
          description: string
          id?: string
          incident_type: string
          location?: Json | null
          metadata?: Json | null
          reported_at?: string
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          vessel_id?: string | null
        }
        Update: {
          description?: string
          id?: string
          incident_type?: string
          location?: Json | null
          metadata?: Json | null
          reported_at?: string
          reported_by?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          vessel_id?: string | null
        }
        Relationships: []
      }
      dp_inference_logs: {
        Row: {
          confidence_score: number | null
          created_at: string
          id: string
          inference_type: string
          input_data: Json
          model_version: string | null
          output_data: Json
          plan_id: string | null
          processing_time_ms: number | null
          vessel_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          inference_type: string
          input_data?: Json
          model_version?: string | null
          output_data?: Json
          plan_id?: string | null
          processing_time_ms?: number | null
          vessel_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string
          id?: string
          inference_type?: string
          input_data?: Json
          model_version?: string | null
          output_data?: Json
          plan_id?: string | null
          processing_time_ms?: number | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_inference_logs_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "peodp_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "dp_inference_logs_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      drone_missions: {
        Row: {
          actual_trajectory: Json | null
          completion_percentage: number | null
          created_at: string
          drone_id: string
          end_time: string | null
          id: string
          max_depth_meters: number | null
          metadata: Json | null
          mission_name: string
          mission_objectives: Json | null
          mission_type: string
          organization_id: string | null
          planned_waypoints: Json | null
          start_time: string | null
          status: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          actual_trajectory?: Json | null
          completion_percentage?: number | null
          created_at?: string
          drone_id: string
          end_time?: string | null
          id?: string
          max_depth_meters?: number | null
          metadata?: Json | null
          mission_name: string
          mission_objectives?: Json | null
          mission_type: string
          organization_id?: string | null
          planned_waypoints?: Json | null
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          actual_trajectory?: Json | null
          completion_percentage?: number | null
          created_at?: string
          drone_id?: string
          end_time?: string | null
          id?: string
          max_depth_meters?: number | null
          metadata?: Json | null
          mission_name?: string
          mission_objectives?: Json | null
          mission_type?: string
          organization_id?: string | null
          planned_waypoints?: Json | null
          start_time?: string | null
          status?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      drone_telemetry: {
        Row: {
          battery_percentage: number | null
          created_at: string
          depth_meters: number | null
          drone_id: string
          heading_degrees: number | null
          id: string
          metadata: Json | null
          mission_id: string | null
          pitch_degrees: number | null
          position_x: number | null
          position_y: number | null
          position_z: number | null
          pressure_bar: number | null
          roll_degrees: number | null
          signal_strength_dbm: number | null
          status: string | null
          timestamp: string
          velocity_ms: number | null
          water_temperature_celsius: number | null
        }
        Insert: {
          battery_percentage?: number | null
          created_at?: string
          depth_meters?: number | null
          drone_id: string
          heading_degrees?: number | null
          id?: string
          metadata?: Json | null
          mission_id?: string | null
          pitch_degrees?: number | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          pressure_bar?: number | null
          roll_degrees?: number | null
          signal_strength_dbm?: number | null
          status?: string | null
          timestamp?: string
          velocity_ms?: number | null
          water_temperature_celsius?: number | null
        }
        Update: {
          battery_percentage?: number | null
          created_at?: string
          depth_meters?: number | null
          drone_id?: string
          heading_degrees?: number | null
          id?: string
          metadata?: Json | null
          mission_id?: string | null
          pitch_degrees?: number | null
          position_x?: number | null
          position_y?: number | null
          position_z?: number | null
          pressure_bar?: number | null
          roll_degrees?: number | null
          signal_strength_dbm?: number | null
          status?: string | null
          timestamp?: string
          velocity_ms?: number | null
          water_temperature_celsius?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drone_telemetry_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "drone_missions"
            referencedColumns: ["id"]
          },
        ]
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
      employee_notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          title: string
          type: string
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      employee_requests: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          request_type: string
          status: string
          title: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          request_type: string
          status?: string
          title: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          request_type?: string
          status?: string
          title?: string
          updated_at?: string | null
          user_id?: string
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
      evolution_insights: {
        Row: {
          category: string
          created_at: string | null
          cycle_id: string
          evolution_score: number | null
          frequency: number
          generated_at: string | null
          id: string
          impact: string
          pattern: string
          recommendation: string
          tenant_id: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          cycle_id: string
          evolution_score?: number | null
          frequency: number
          generated_at?: string | null
          id?: string
          impact: string
          pattern: string
          recommendation: string
          tenant_id?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          cycle_id?: string
          evolution_score?: number | null
          frequency?: number
          generated_at?: string | null
          id?: string
          impact?: string
          pattern?: string
          recommendation?: string
          tenant_id?: string | null
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
      external_entities: {
        Row: {
          created_at: string
          entity_id: string
          entity_type: string
          id: string
          metadata: Json | null
          name: string
          status: string
          trust_score: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          entity_id: string
          entity_type: string
          id?: string
          metadata?: Json | null
          name: string
          status?: string
          trust_score?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          entity_id?: string
          entity_type?: string
          id?: string
          metadata?: Json | null
          name?: string
          status?: string
          trust_score?: number
          updated_at?: string
        }
        Relationships: []
      }
      extracted_data: {
        Row: {
          confidence_score: number | null
          content: string | null
          document_id: string | null
          extracted_at: string
          extraction_type: string
          id: string
          structured_data: Json | null
        }
        Insert: {
          confidence_score?: number | null
          content?: string | null
          document_id?: string | null
          extracted_at?: string
          extraction_type: string
          id?: string
          structured_data?: Json | null
        }
        Update: {
          confidence_score?: number | null
          content?: string | null
          document_id?: string | null
          extracted_at?: string
          extraction_type?: string
          id?: string
          structured_data?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "extracted_data_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "ai_documents"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_events: {
        Row: {
          ai_decision_id: string | null
          confidence: number | null
          corrected_decision: string | null
          created_at: string | null
          feedback_category: string
          feedback_type: string
          id: string
          learning_applied: boolean | null
          metadata: Json | null
          module_name: string
          original_decision: string | null
          processed: boolean | null
          reason: string | null
          source: string
          tenant_id: string | null
          user_id: string | null
        }
        Insert: {
          ai_decision_id?: string | null
          confidence?: number | null
          corrected_decision?: string | null
          created_at?: string | null
          feedback_category: string
          feedback_type: string
          id?: string
          learning_applied?: boolean | null
          metadata?: Json | null
          module_name: string
          original_decision?: string | null
          processed?: boolean | null
          reason?: string | null
          source: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Update: {
          ai_decision_id?: string | null
          confidence?: number | null
          corrected_decision?: string | null
          created_at?: string | null
          feedback_category?: string
          feedback_type?: string
          id?: string
          learning_applied?: boolean | null
          metadata?: Json | null
          module_name?: string
          original_decision?: string | null
          processed?: boolean | null
          reason?: string | null
          source?: string
          tenant_id?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      financial_transactions: {
        Row: {
          amount: number
          category: string
          created_at: string
          created_by: string | null
          description: string
          id: string
          invoice_number: string | null
          notes: string | null
          organization_id: string | null
          payment_method: string | null
          transaction_date: string
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          category: string
          created_at?: string
          created_by?: string | null
          description: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          transaction_date?: string
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          category?: string
          created_at?: string
          created_by?: string | null
          description?: string
          id?: string
          invoice_number?: string | null
          notes?: string | null
          organization_id?: string | null
          payment_method?: string | null
          transaction_date?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "financial_transactions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      fine_tune_requests: {
        Row: {
          completed_at: string | null
          created_at: string | null
          deviation_percent: number | null
          id: string
          module_name: string
          request_id: string
          requested_at: string | null
          result: Json | null
          status: string | null
          tenant_id: string | null
          training_data: Json | null
          trigger_reason: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          deviation_percent?: number | null
          id?: string
          module_name: string
          request_id: string
          requested_at?: string | null
          result?: Json | null
          status?: string | null
          tenant_id?: string | null
          training_data?: Json | null
          trigger_reason: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          deviation_percent?: number | null
          id?: string
          module_name?: string
          request_id?: string
          requested_at?: string | null
          result?: Json | null
          status?: string | null
          tenant_id?: string | null
          training_data?: Json | null
          trigger_reason?: string
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
      fuel_logs: {
        Row: {
          consumption_rate_lph: number | null
          created_at: string | null
          fuel_type: string
          id: string
          location_latitude: number | null
          location_longitude: number | null
          notes: string | null
          organization_id: string | null
          quantity_liters: number
          timestamp: string
          updated_at: string | null
          vessel_id: string | null
          vessel_speed_knots: number | null
          weather_condition: string | null
        }
        Insert: {
          consumption_rate_lph?: number | null
          created_at?: string | null
          fuel_type?: string
          id?: string
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          quantity_liters: number
          timestamp?: string
          updated_at?: string | null
          vessel_id?: string | null
          vessel_speed_knots?: number | null
          weather_condition?: string | null
        }
        Update: {
          consumption_rate_lph?: number | null
          created_at?: string | null
          fuel_type?: string
          id?: string
          location_latitude?: number | null
          location_longitude?: number | null
          notes?: string | null
          organization_id?: string | null
          quantity_liters?: number
          timestamp?: string
          updated_at?: string | null
          vessel_id?: string | null
          vessel_speed_knots?: number | null
          weather_condition?: string | null
        }
        Relationships: []
      }
      fuel_optimizations: {
        Row: {
          created_at: string
          created_by: string | null
          destination: string
          distance_nm: number
          estimated_consumption: number
          id: string
          optimization_factors: Json | null
          optimized_consumption: number | null
          organization_id: string | null
          origin: string
          route_name: string
          savings_percentage: number | null
          status: string
          updated_at: string
          vessel_id: string | null
          weather_conditions: Json | null
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          destination: string
          distance_nm: number
          estimated_consumption: number
          id?: string
          optimization_factors?: Json | null
          optimized_consumption?: number | null
          organization_id?: string | null
          origin: string
          route_name: string
          savings_percentage?: number | null
          status?: string
          updated_at?: string
          vessel_id?: string | null
          weather_conditions?: Json | null
        }
        Update: {
          created_at?: string
          created_by?: string | null
          destination?: string
          distance_nm?: number
          estimated_consumption?: number
          id?: string
          optimization_factors?: Json | null
          optimized_consumption?: number | null
          organization_id?: string | null
          origin?: string
          route_name?: string
          savings_percentage?: number | null
          status?: string
          updated_at?: string
          vessel_id?: string | null
          weather_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_optimizations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      global_knowledge: {
        Row: {
          aggregated_data: Json
          confidence_score: number | null
          created_at: string | null
          id: string
          knowledge_type: string
          performance_metrics: Json | null
          source_count: number | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          aggregated_data: Json
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          knowledge_type: string
          performance_metrics?: Json | null
          source_count?: number | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          aggregated_data?: Json
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          knowledge_type?: string
          performance_metrics?: Json | null
          source_count?: number | null
          updated_at?: string | null
          version?: number | null
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
      ia_context_log: {
        Row: {
          confidence_score: number | null
          context_snapshot: Json | null
          created_at: string | null
          execution_time_ms: number | null
          id: string
          metadata: Json | null
          model_used: string | null
          module_id: string | null
          prompt: string
          response: string
          session_id: string
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          context_snapshot?: Json | null
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          module_id?: string | null
          prompt: string
          response: string
          session_id: string
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          context_snapshot?: Json | null
          created_at?: string | null
          execution_time_ms?: number | null
          id?: string
          metadata?: Json | null
          model_used?: string | null
          module_id?: string | null
          prompt?: string
          response?: string
          session_id?: string
          user_id?: string | null
        }
        Relationships: []
      }
      ia_performance_log: {
        Row: {
          cpu_usage_percent: number | null
          created_at: string | null
          error_message: string | null
          execution_time_ms: number
          id: string
          input_size_bytes: number | null
          memory_used_mb: number | null
          metadata: Json | null
          model_version: string | null
          module_name: string
          operation_type: string
          output_size_bytes: number | null
          success: boolean | null
        }
        Insert: {
          cpu_usage_percent?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms: number
          id?: string
          input_size_bytes?: number | null
          memory_used_mb?: number | null
          metadata?: Json | null
          model_version?: string | null
          module_name: string
          operation_type: string
          output_size_bytes?: number | null
          success?: boolean | null
        }
        Update: {
          cpu_usage_percent?: number | null
          created_at?: string | null
          error_message?: string | null
          execution_time_ms?: number
          id?: string
          input_size_bytes?: number | null
          memory_used_mb?: number | null
          metadata?: Json | null
          model_version?: string | null
          module_name?: string
          operation_type?: string
          output_size_bytes?: number | null
          success?: boolean | null
        }
        Relationships: []
      }
      ia_response_cache: {
        Row: {
          cached_response: string
          created_at: string | null
          id: string
          last_used_at: string | null
          model_used: string | null
          prompt_hash: string
          usage_count: number | null
        }
        Insert: {
          cached_response: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          model_used?: string | null
          prompt_hash: string
          usage_count?: number | null
        }
        Update: {
          cached_response?: string
          created_at?: string | null
          id?: string
          last_used_at?: string | null
          model_used?: string | null
          prompt_hash?: string
          usage_count?: number | null
        }
        Relationships: []
      }
      ia_suggestions_log: {
        Row: {
          accepted: boolean | null
          accepted_at: string | null
          category: string | null
          confidence_score: number | null
          context: Json | null
          created_at: string | null
          feedback: string | null
          id: string
          impact_level: string | null
          metadata: Json | null
          suggestion_text: string
          suggestion_type: string
          user_id: string | null
        }
        Insert: {
          accepted?: boolean | null
          accepted_at?: string | null
          category?: string | null
          confidence_score?: number | null
          context?: Json | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          impact_level?: string | null
          metadata?: Json | null
          suggestion_text: string
          suggestion_type: string
          user_id?: string | null
        }
        Update: {
          accepted?: boolean | null
          accepted_at?: string | null
          category?: string | null
          confidence_score?: number | null
          context?: Json | null
          created_at?: string | null
          feedback?: string | null
          id?: string
          impact_level?: string | null
          metadata?: Json | null
          suggestion_text?: string
          suggestion_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      incident_reports: {
        Row: {
          ai_analysis: Json | null
          assigned_to: string | null
          closed_at: string | null
          code: string
          created_at: string | null
          description: string
          evidence: Json | null
          id: string
          location: string
          metadata: Json | null
          replay_status: string | null
          reported_at: string
          reported_by: string | null
          severity: string
          status: string
          title: string
          type: string
          updated_at: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          assigned_to?: string | null
          closed_at?: string | null
          code: string
          created_at?: string | null
          description: string
          evidence?: Json | null
          id?: string
          location: string
          metadata?: Json | null
          replay_status?: string | null
          reported_at?: string
          reported_by?: string | null
          severity: string
          status?: string
          title: string
          type: string
          updated_at?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          assigned_to?: string | null
          closed_at?: string | null
          code?: string
          created_at?: string | null
          description?: string
          evidence?: Json | null
          id?: string
          location?: string
          metadata?: Json | null
          replay_status?: string | null
          reported_at?: string
          reported_by?: string | null
          severity?: string
          status?: string
          title?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      incidents: {
        Row: {
          created_at: string
          description: string | null
          id: string
          incident_type: string
          location: string | null
          metadata: Json | null
          occurred_at: string
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          incident_type: string
          location?: string | null
          metadata?: Json | null
          occurred_at?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          incident_type?: string
          location?: string | null
          metadata?: Json | null
          occurred_at?: string
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incidents_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      integration_credentials: {
        Row: {
          access_token: string
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          provider: string
          refresh_token: string | null
          scope: string | null
          token_type: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          access_token: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          access_token?: string
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          provider?: string
          refresh_token?: string | null
          scope?: string | null
          token_type?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      integration_logs: {
        Row: {
          action: string
          created_at: string
          error_message: string | null
          id: string
          provider: string
          request_data: Json | null
          response_data: Json | null
          status: string
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          error_message?: string | null
          id?: string
          provider: string
          request_data?: Json | null
          response_data?: Json | null
          status: string
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          error_message?: string | null
          id?: string
          provider?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      integrations_registry: {
        Row: {
          config: Json | null
          created_at: string | null
          id: string
          integration_name: string
          is_active: boolean | null
          last_sync_at: string | null
          metadata: Json | null
          oauth_connected: boolean | null
          organization_id: string | null
          provider: string
          updated_at: string | null
          user_id: string | null
          webhook_secret: string | null
          webhook_url: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_name: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          oauth_connected?: boolean | null
          organization_id?: string | null
          provider: string
          updated_at?: string | null
          user_id?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          id?: string
          integration_name?: string
          is_active?: boolean | null
          last_sync_at?: string | null
          metadata?: Json | null
          oauth_connected?: boolean | null
          organization_id?: string | null
          provider?: string
          updated_at?: string | null
          user_id?: string | null
          webhook_secret?: string | null
          webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "integrations_registry_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      interop_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message: Json
          protocol_type: string
          status: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message: Json
          protocol_type: string
          status: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message?: Json
          protocol_type?: string
          status?: string
        }
        Relationships: []
      }
      joint_mission_log: {
        Row: {
          created_at: string
          details: Json
          event_type: string
          id: string
          mission_id: string
          severity: string
        }
        Insert: {
          created_at?: string
          details: Json
          event_type: string
          id?: string
          mission_id: string
          severity?: string
        }
        Update: {
          created_at?: string
          details?: Json
          event_type?: string
          id?: string
          mission_id?: string
          severity?: string
        }
        Relationships: []
      }
      joint_mission_tasks: {
        Row: {
          assigned_at: string
          assigned_entity: string
          completed_at: string | null
          created_at: string
          id: string
          mission_id: string
          payload: Json
          result: Json | null
          status: string
          task_name: string
          updated_at: string
        }
        Insert: {
          assigned_at?: string
          assigned_entity: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id: string
          payload: Json
          result?: Json | null
          status?: string
          task_name: string
          updated_at?: string
        }
        Update: {
          assigned_at?: string
          assigned_entity?: string
          completed_at?: string | null
          created_at?: string
          id?: string
          mission_id?: string
          payload?: Json
          result?: Json | null
          status?: string
          task_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "joint_mission_tasks_assigned_entity_fkey"
            columns: ["assigned_entity"]
            isOneToOne: false
            referencedRelation: "external_entities"
            referencedColumns: ["entity_id"]
          },
        ]
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
      learning_adjustments: {
        Row: {
          applied_by: string | null
          approved_by: string | null
          confidence: number | null
          created_at: string | null
          id: string
          impact: string | null
          metadata: Json | null
          module_name: string
          new_value: number
          old_value: number
          parameter_name: string
          reason: string
          rollback_at: string | null
          tenant_id: string | null
        }
        Insert: {
          applied_by?: string | null
          approved_by?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          impact?: string | null
          metadata?: Json | null
          module_name: string
          new_value: number
          old_value: number
          parameter_name: string
          reason: string
          rollback_at?: string | null
          tenant_id?: string | null
        }
        Update: {
          applied_by?: string | null
          approved_by?: string | null
          confidence?: number | null
          created_at?: string | null
          id?: string
          impact?: string | null
          metadata?: Json | null
          module_name?: string
          new_value?: number
          old_value?: number
          parameter_name?: string
          reason?: string
          rollback_at?: string | null
          tenant_id?: string | null
        }
        Relationships: []
      }
      learning_events: {
        Row: {
          context: Json
          created_at: string | null
          event_type: string
          id: string
          metadata: Json | null
          module_name: string | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          context?: Json
          created_at?: string | null
          event_type: string
          id?: string
          metadata?: Json | null
          module_name?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          context?: Json
          created_at?: string | null
          event_type?: string
          id?: string
          metadata?: Json | null
          module_name?: string | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      local_knowledge: {
        Row: {
          content: Json
          created_at: string | null
          id: string
          knowledge_type: string
          last_sync: string | null
          updated_at: string | null
          version: number | null
        }
        Insert: {
          content: Json
          created_at?: string | null
          id?: string
          knowledge_type: string
          last_sync?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          content?: Json
          created_at?: string | null
          id?: string
          knowledge_type?: string
          last_sync?: string | null
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      logistics_inventory: {
        Row: {
          category: string
          created_at: string
          id: string
          item_code: string
          item_name: string
          last_restocked_at: string | null
          location: string | null
          min_stock_level: number
          organization_id: string | null
          quantity: number
          supplier: string | null
          unit: string
          unit_price: number | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          item_code: string
          item_name: string
          last_restocked_at?: string | null
          location?: string | null
          min_stock_level?: number
          organization_id?: string | null
          quantity?: number
          supplier?: string | null
          unit: string
          unit_price?: number | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          item_code?: string
          item_name?: string
          last_restocked_at?: string | null
          location?: string | null
          min_stock_level?: number
          organization_id?: string | null
          quantity?: number
          supplier?: string | null
          unit?: string
          unit_price?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "logistics_inventory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      logistics_shipments: {
        Row: {
          actual_delivery: string | null
          carrier: string
          created_at: string | null
          current_location: string | null
          destination: string
          estimated_delivery: string | null
          id: string
          metadata: Json | null
          notes: string | null
          order_id: string | null
          organization_id: string | null
          origin: string
          shipped_at: string | null
          status: string
          tracking_number: string
          updated_at: string | null
          volume_m3: number | null
          weight_kg: number | null
        }
        Insert: {
          actual_delivery?: string | null
          carrier: string
          created_at?: string | null
          current_location?: string | null
          destination: string
          estimated_delivery?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          organization_id?: string | null
          origin: string
          shipped_at?: string | null
          status?: string
          tracking_number: string
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Update: {
          actual_delivery?: string | null
          carrier?: string
          created_at?: string | null
          current_location?: string | null
          destination?: string
          estimated_delivery?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          order_id?: string | null
          organization_id?: string | null
          origin?: string
          shipped_at?: string | null
          status?: string
          tracking_number?: string
          updated_at?: string | null
          volume_m3?: number | null
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "logistics_shipments_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "logistics_supply_orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logistics_shipments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      logistics_suppliers: {
        Row: {
          address: string | null
          contact_person: string | null
          country: string | null
          created_at: string | null
          delivery_time_days: number | null
          email: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          organization_id: string | null
          payment_terms: string | null
          phone: string | null
          rating: number | null
          supplier_code: string
          supplier_name: string
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          supplier_code: string
          supplier_name: string
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_person?: string | null
          country?: string | null
          created_at?: string | null
          delivery_time_days?: number | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          payment_terms?: string | null
          phone?: string | null
          rating?: number | null
          supplier_code?: string
          supplier_name?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logistics_suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      logistics_supply_orders: {
        Row: {
          actual_delivery_date: string | null
          approved_by: string | null
          created_at: string
          delivery_address: string | null
          estimated_delivery_date: string | null
          failure_reason: string | null
          id: string
          item_id: string | null
          notes: string | null
          order_number: string
          organization_id: string | null
          priority: string
          quantity: number
          requested_by: string | null
          status: string
          supplier: string | null
          updated_at: string
        }
        Insert: {
          actual_delivery_date?: string | null
          approved_by?: string | null
          created_at?: string
          delivery_address?: string | null
          estimated_delivery_date?: string | null
          failure_reason?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          order_number: string
          organization_id?: string | null
          priority?: string
          quantity: number
          requested_by?: string | null
          status?: string
          supplier?: string | null
          updated_at?: string
        }
        Update: {
          actual_delivery_date?: string | null
          approved_by?: string | null
          created_at?: string
          delivery_address?: string | null
          estimated_delivery_date?: string | null
          failure_reason?: string | null
          id?: string
          item_id?: string | null
          notes?: string | null
          order_number?: string
          organization_id?: string | null
          priority?: string
          quantity?: number
          requested_by?: string | null
          status?: string
          supplier?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "logistics_supply_orders_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "logistics_inventory"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "logistics_supply_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      logs: {
        Row: {
          created_at: string
          id: string
          level: string
          message: string
          metadata: Json | null
          module: string
          organization_id: string | null
          timestamp: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          level: string
          message: string
          metadata?: Json | null
          module: string
          organization_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          level?: string
          message?: string
          metadata?: Json | null
          module?: string
          organization_id?: string | null
          timestamp?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      metric_history: {
        Row: {
          adjustment_triggered: boolean | null
          created_at: string | null
          deviation_percent: number | null
          id: string
          module_name: string
          parameter_name: string
          performance_score: number | null
          tenant_id: string | null
          timestamp: string | null
          value: number
          vessel_id: string | null
        }
        Insert: {
          adjustment_triggered?: boolean | null
          created_at?: string | null
          deviation_percent?: number | null
          id?: string
          module_name: string
          parameter_name: string
          performance_score?: number | null
          tenant_id?: string | null
          timestamp?: string | null
          value: number
          vessel_id?: string | null
        }
        Update: {
          adjustment_triggered?: boolean | null
          created_at?: string | null
          deviation_percent?: number | null
          id?: string
          module_name?: string
          parameter_name?: string
          performance_score?: number | null
          tenant_id?: string | null
          timestamp?: string | null
          value?: number
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "metric_history_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_control_logs: {
        Row: {
          created_at: string
          event_data: Json | null
          event_type: string
          id: string
          message: string | null
          mission_id: string
          severity: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_data?: Json | null
          event_type: string
          id?: string
          message?: string | null
          mission_id: string
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_data?: Json | null
          event_type?: string
          id?: string
          message?: string | null
          mission_id?: string
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      mission_logs: {
        Row: {
          created_at: string
          created_by: string | null
          crew_members: string[]
          description: string | null
          id: string
          location: string | null
          metadata: Json | null
          mission_date: string
          mission_id: string | null
          mission_name: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          crew_members?: string[]
          description?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          mission_date: string
          mission_id?: string | null
          mission_name: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          crew_members?: string[]
          description?: string | null
          id?: string
          location?: string | null
          metadata?: Json | null
          mission_date?: string
          mission_id?: string | null
          mission_name?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_logs_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_resources: {
        Row: {
          allocated_at: string | null
          created_at: string | null
          id: string
          metadata: Json | null
          mission_id: string | null
          notes: string | null
          quantity: number
          released_at: string | null
          resource_name: string
          resource_type: string
          status: string
        }
        Insert: {
          allocated_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mission_id?: string | null
          notes?: string | null
          quantity?: number
          released_at?: string | null
          resource_name: string
          resource_type: string
          status?: string
        }
        Update: {
          allocated_at?: string | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          mission_id?: string | null
          notes?: string | null
          quantity?: number
          released_at?: string | null
          resource_name?: string
          resource_type?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_resources_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          mission_id: string
          name: string
          priority: string
          status: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          mission_id: string
          name: string
          priority?: string
          status?: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          mission_id?: string
          name?: string
          priority?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      mission_timeline: {
        Row: {
          actual_date: string | null
          created_at: string | null
          description: string | null
          id: string
          metadata: Json | null
          milestone_name: string
          mission_id: string | null
          notification_sent: boolean | null
          responsible_user_id: string | null
          scheduled_date: string
          status: string
          updated_at: string | null
        }
        Insert: {
          actual_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          milestone_name: string
          mission_id?: string | null
          notification_sent?: boolean | null
          responsible_user_id?: string | null
          scheduled_date: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          actual_date?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          milestone_name?: string
          mission_id?: string | null
          notification_sent?: boolean | null
          responsible_user_id?: string | null
          scheduled_date?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_timeline_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_workflows: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          execution_count: number | null
          id: string
          is_active: boolean | null
          last_executed_at: string | null
          name: string
          organization_id: string | null
          status: string | null
          updated_at: string | null
          workflow_definition: Json
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
          workflow_definition: Json
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          execution_count?: number | null
          id?: string
          is_active?: boolean | null
          last_executed_at?: string | null
          name?: string
          organization_id?: string | null
          status?: string | null
          updated_at?: string | null
          workflow_definition?: Json
        }
        Relationships: []
      }
      missions: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          assigned_agents: Json | null
          assigned_vessel_id: string | null
          code: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_date: string | null
          end_time: string | null
          id: string
          location: Json | null
          metadata: Json | null
          mission_code: string
          mission_name: string
          mission_type: string
          name: string | null
          notes: string | null
          objectives: string[] | null
          organization_id: string | null
          priority: string
          progress_percent: number | null
          start_date: string | null
          start_time: string | null
          status: string
          type: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_agents?: Json | null
          assigned_vessel_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          location?: Json | null
          metadata?: Json | null
          mission_code: string
          mission_name: string
          mission_type: string
          name?: string | null
          notes?: string | null
          objectives?: string[] | null
          organization_id?: string | null
          priority?: string
          progress_percent?: number | null
          start_date?: string | null
          start_time?: string | null
          status?: string
          type?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          assigned_agents?: Json | null
          assigned_vessel_id?: string | null
          code?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          end_time?: string | null
          id?: string
          location?: Json | null
          metadata?: Json | null
          mission_code?: string
          mission_name?: string
          mission_type?: string
          name?: string | null
          notes?: string | null
          objectives?: string[] | null
          organization_id?: string | null
          priority?: string
          progress_percent?: number | null
          start_date?: string | null
          start_time?: string | null
          status?: string
          type?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "missions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "missions_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      module_health: {
        Row: {
          cpu_usage: number | null
          created_at: string | null
          error_count: number | null
          health_score: number | null
          id: string
          last_check_at: string | null
          last_error: string | null
          memory_usage: number | null
          metadata: Json | null
          module_name: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          cpu_usage?: number | null
          created_at?: string | null
          error_count?: number | null
          health_score?: number | null
          id?: string
          last_check_at?: string | null
          last_error?: string | null
          memory_usage?: number | null
          metadata?: Json | null
          module_name: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          cpu_usage?: number | null
          created_at?: string | null
          error_count?: number | null
          health_score?: number | null
          id?: string
          last_check_at?: string | null
          last_error?: string | null
          memory_usage?: number | null
          metadata?: Json | null
          module_name?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      module_permissions: {
        Row: {
          can_delete: boolean | null
          can_manage: boolean | null
          can_read: boolean | null
          can_write: boolean | null
          created_at: string
          id: string
          module_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at: string
        }
        Insert: {
          can_delete?: boolean | null
          can_manage?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string
          id?: string
          module_name: string
          role: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Update: {
          can_delete?: boolean | null
          can_manage?: boolean | null
          can_read?: boolean | null
          can_write?: boolean | null
          created_at?: string
          id?: string
          module_name?: string
          role?: Database["public"]["Enums"]["user_role"]
          updated_at?: string
        }
        Relationships: []
      }
      nautilus_conversations: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          messages: Json
          timestamp: string | null
          user_id: string
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          messages: Json
          timestamp?: string | null
          user_id: string
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          messages?: Json
          timestamp?: string | null
          user_id?: string
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
      nautilus_workflows: {
        Row: {
          created_at: string | null
          created_by: string
          description: string | null
          id: string
          name: string
          steps: Json
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by: string
          description?: string | null
          id?: string
          name: string
          steps: Json
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string
          description?: string | null
          id?: string
          name?: string
          steps?: Json
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
      parameter_adjustments: {
        Row: {
          adjusted_by: string | null
          created_at: string | null
          delta_percent: number
          id: string
          impact_score: number | null
          module_name: string
          new_value: number
          old_value: number
          parameter_name: string
          reason: string | null
          tenant_id: string | null
          vessel_id: string | null
        }
        Insert: {
          adjusted_by?: string | null
          created_at?: string | null
          delta_percent: number
          id?: string
          impact_score?: number | null
          module_name: string
          new_value: number
          old_value: number
          parameter_name: string
          reason?: string | null
          tenant_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          adjusted_by?: string | null
          created_at?: string | null
          delta_percent?: number
          id?: string
          impact_score?: number | null
          module_name?: string
          new_value?: number
          old_value?: number
          parameter_name?: string
          reason?: string | null
          tenant_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "parameter_adjustments_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      peodp_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          crew_composition: Json | null
          dp_class: string
          environmental_limits: Json | null
          equipment_config: Json | null
          id: string
          operation_type: string
          safety_procedures: Json | null
          status: string
          updated_at: string
          valid_from: string | null
          valid_until: string | null
          vessel_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          crew_composition?: Json | null
          dp_class: string
          environmental_limits?: Json | null
          equipment_config?: Json | null
          id?: string
          operation_type: string
          safety_procedures?: Json | null
          status?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          vessel_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          crew_composition?: Json | null
          dp_class?: string
          environmental_limits?: Json | null
          equipment_config?: Json | null
          id?: string
          operation_type?: string
          safety_procedures?: Json | null
          status?: string
          updated_at?: string
          valid_from?: string | null
          valid_until?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peodp_plans_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
          browser: string | null
          category: string
          component: string | null
          connection_type: string | null
          created_at: string
          device_type: string | null
          id: string
          metadata: Json | null
          metric_name: string
          metric_type: string | null
          metric_unit: string
          metric_value: number
          page_url: string | null
          recorded_at: string
          session_id: string | null
          status: string
          target_value: number | null
          unit: string | null
          user_id: string | null
        }
        Insert: {
          browser?: string | null
          category: string
          component?: string | null
          connection_type?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          metadata?: Json | null
          metric_name: string
          metric_type?: string | null
          metric_unit: string
          metric_value: number
          page_url?: string | null
          recorded_at?: string
          session_id?: string | null
          status: string
          target_value?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Update: {
          browser?: string | null
          category?: string
          component?: string | null
          connection_type?: string | null
          created_at?: string
          device_type?: string | null
          id?: string
          metadata?: Json | null
          metric_name?: string
          metric_type?: string | null
          metric_unit?: string
          metric_value?: number
          page_url?: string | null
          recorded_at?: string
          session_id?: string | null
          status?: string
          target_value?: number | null
          unit?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      performance_scores: {
        Row: {
          adaptation_score: number | null
          created_at: string | null
          id: string
          module_name: string
          overall_score: number
          prediction_score: number | null
          tactical_score: number | null
          tenant_id: string | null
          timestamp: string | null
          trend: string | null
        }
        Insert: {
          adaptation_score?: number | null
          created_at?: string | null
          id?: string
          module_name: string
          overall_score: number
          prediction_score?: number | null
          tactical_score?: number | null
          tenant_id?: string | null
          timestamp?: string | null
          trend?: string | null
        }
        Update: {
          adaptation_score?: number | null
          created_at?: string | null
          id?: string
          module_name?: string
          overall_score?: number
          prediction_score?: number | null
          tactical_score?: number | null
          tenant_id?: string | null
          timestamp?: string | null
          trend?: string | null
        }
        Relationships: []
      }
      ports: {
        Row: {
          code: string
          coordinates: unknown
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
          coordinates?: unknown
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
          coordinates?: unknown
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
      project_dependencies: {
        Row: {
          created_at: string
          dependency_type: string
          depends_on_task_id: string | null
          id: string
          task_id: string | null
        }
        Insert: {
          created_at?: string
          dependency_type?: string
          depends_on_task_id?: string | null
          id?: string
          task_id?: string | null
        }
        Update: {
          created_at?: string
          dependency_type?: string
          depends_on_task_id?: string | null
          id?: string
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "project_dependencies_depends_on_task_id_fkey"
            columns: ["depends_on_task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_dependencies_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "project_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      project_tasks: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string
          id: string
          organization_id: string | null
          priority: string
          progress: number
          project_id: string
          project_name: string
          start_date: string
          status: string
          task_name: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date: string
          id?: string
          organization_id?: string | null
          priority?: string
          progress?: number
          project_id: string
          project_name: string
          start_date: string
          status?: string
          task_name: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string
          id?: string
          organization_id?: string | null
          priority?: string
          progress?: number
          project_id?: string
          project_name?: string
          start_date?: string
          status?: string
          task_name?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      rendered_documents: {
        Row: {
          created_at: string | null
          format: string
          html_content: string | null
          id: string
          pdf_url: string | null
          rendered_at: string | null
          rendered_by: string | null
          template_id: string
          title: string
          variables: Json | null
        }
        Insert: {
          created_at?: string | null
          format: string
          html_content?: string | null
          id?: string
          pdf_url?: string | null
          rendered_at?: string | null
          rendered_by?: string | null
          template_id: string
          title: string
          variables?: Json | null
        }
        Update: {
          created_at?: string | null
          format?: string
          html_content?: string | null
          id?: string
          pdf_url?: string | null
          rendered_at?: string | null
          rendered_by?: string | null
          template_id?: string
          title?: string
          variables?: Json | null
        }
        Relationships: []
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
      rls_access_logs: {
        Row: {
          access_granted: boolean
          created_at: string
          id: string
          metadata: Json | null
          operation: string
          policy_name: string | null
          row_data: Json | null
          table_name: string
          user_id: string | null
        }
        Insert: {
          access_granted: boolean
          created_at?: string
          id?: string
          metadata?: Json | null
          operation: string
          policy_name?: string | null
          row_data?: Json | null
          table_name: string
          user_id?: string | null
        }
        Update: {
          access_granted?: boolean
          created_at?: string
          id?: string
          metadata?: Json | null
          operation?: string
          policy_name?: string | null
          row_data?: Json | null
          table_name?: string
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
      route_ai_suggestions: {
        Row: {
          ai_reasoning: string | null
          created_at: string | null
          created_by: string | null
          destination: Json
          fuel_estimate: number | null
          id: string
          origin: Json
          risk_score: number | null
          suggested_route: Json
          time_estimate_hours: number | null
          weather_data: Json | null
        }
        Insert: {
          ai_reasoning?: string | null
          created_at?: string | null
          created_by?: string | null
          destination: Json
          fuel_estimate?: number | null
          id?: string
          origin: Json
          risk_score?: number | null
          suggested_route: Json
          time_estimate_hours?: number | null
          weather_data?: Json | null
        }
        Update: {
          ai_reasoning?: string | null
          created_at?: string | null
          created_by?: string | null
          destination?: Json
          fuel_estimate?: number | null
          id?: string
          origin?: Json
          risk_score?: number | null
          suggested_route?: Json
          time_estimate_hours?: number | null
          weather_data?: Json | null
        }
        Relationships: []
      }
      route_segments: {
        Row: {
          arrival_port: string
          created_at: string | null
          current_factor: number | null
          departure_port: string
          distance_nm: number
          estimated_duration_hours: number | null
          id: string
          organization_id: string | null
          route_id: string | null
          segment_name: string
          updated_at: string | null
          weather_factor: number | null
        }
        Insert: {
          arrival_port: string
          created_at?: string | null
          current_factor?: number | null
          departure_port: string
          distance_nm: number
          estimated_duration_hours?: number | null
          id?: string
          organization_id?: string | null
          route_id?: string | null
          segment_name: string
          updated_at?: string | null
          weather_factor?: number | null
        }
        Update: {
          arrival_port?: string
          created_at?: string | null
          current_factor?: number | null
          departure_port?: string
          distance_nm?: number
          estimated_duration_hours?: number | null
          id?: string
          organization_id?: string | null
          route_id?: string | null
          segment_name?: string
          updated_at?: string | null
          weather_factor?: number | null
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
      satellite_events: {
        Row: {
          altitude: number | null
          event_data: Json | null
          event_type: string
          id: string
          latitude: number | null
          longitude: number | null
          norad_id: number
          satellite_id: string
          timestamp: string
        }
        Insert: {
          altitude?: number | null
          event_data?: Json | null
          event_type: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          norad_id: number
          satellite_id: string
          timestamp?: string
        }
        Update: {
          altitude?: number | null
          event_data?: Json | null
          event_type?: string
          id?: string
          latitude?: number | null
          longitude?: number | null
          norad_id?: number
          satellite_id?: string
          timestamp?: string
        }
        Relationships: []
      }
      satellite_orbits: {
        Row: {
          altitude: number
          created_at: string
          eccentricity: number | null
          id: string
          inclination: number | null
          last_updated: string
          latitude: number
          longitude: number
          name: string
          norad_id: number
          orbital_period: number | null
          tle_line1: string | null
          tle_line2: string | null
          velocity: number
        }
        Insert: {
          altitude: number
          created_at?: string
          eccentricity?: number | null
          id?: string
          inclination?: number | null
          last_updated?: string
          latitude: number
          longitude: number
          name: string
          norad_id: number
          orbital_period?: number | null
          tle_line1?: string | null
          tle_line2?: string | null
          velocity: number
        }
        Update: {
          altitude?: number
          created_at?: string
          eccentricity?: number | null
          id?: string
          inclination?: number | null
          last_updated?: string
          latitude?: number
          longitude?: number
          name?: string
          norad_id?: number
          orbital_period?: number | null
          tle_line1?: string | null
          tle_line2?: string | null
          velocity?: number
        }
        Relationships: []
      }
      satellite_positions: {
        Row: {
          altitude: number
          created_at: string | null
          eccentricity: number | null
          id: string
          inclination: number | null
          last_updated: string | null
          latitude: number
          longitude: number
          name: string
          norad_id: string
          orbital_period: number | null
          status: string | null
          tle_line1: string | null
          tle_line2: string | null
          velocity: number
        }
        Insert: {
          altitude: number
          created_at?: string | null
          eccentricity?: number | null
          id?: string
          inclination?: number | null
          last_updated?: string | null
          latitude: number
          longitude: number
          name: string
          norad_id: string
          orbital_period?: number | null
          status?: string | null
          tle_line1?: string | null
          tle_line2?: string | null
          velocity: number
        }
        Update: {
          altitude?: number
          created_at?: string | null
          eccentricity?: number | null
          id?: string
          inclination?: number | null
          last_updated?: string | null
          latitude?: number
          longitude?: number
          name?: string
          norad_id?: string
          orbital_period?: number | null
          status?: string | null
          tle_line1?: string | null
          tle_line2?: string | null
          velocity?: number
        }
        Relationships: []
      }
      satellite_tracks: {
        Row: {
          altitude_km: number
          azimuth: number | null
          created_at: string | null
          elevation: number | null
          id: string
          latitude: number
          longitude: number
          norad_id: number | null
          organization_id: string | null
          range_km: number | null
          satellite_id: string
          satellite_name: string
          timestamp: string
          tle_line1: string | null
          tle_line2: string | null
          velocity_kmh: number
          visibility_status: string | null
        }
        Insert: {
          altitude_km: number
          azimuth?: number | null
          created_at?: string | null
          elevation?: number | null
          id?: string
          latitude: number
          longitude: number
          norad_id?: number | null
          organization_id?: string | null
          range_km?: number | null
          satellite_id: string
          satellite_name: string
          timestamp?: string
          tle_line1?: string | null
          tle_line2?: string | null
          velocity_kmh: number
          visibility_status?: string | null
        }
        Update: {
          altitude_km?: number
          azimuth?: number | null
          created_at?: string | null
          elevation?: number | null
          id?: string
          latitude?: number
          longitude?: number
          norad_id?: number | null
          organization_id?: string | null
          range_km?: number | null
          satellite_id?: string
          satellite_name?: string
          timestamp?: string
          tle_line1?: string | null
          tle_line2?: string | null
          velocity_kmh?: number
          visibility_status?: string | null
        }
        Relationships: []
      }
      session_tokens: {
        Row: {
          created_at: string
          device_info: Json | null
          expires_at: string
          id: string
          last_activity_at: string
          revoked: boolean | null
          revoked_at: string | null
          revoked_reason: string | null
          token: string
          user_id: string
        }
        Insert: {
          created_at?: string
          device_info?: Json | null
          expires_at: string
          id?: string
          last_activity_at?: string
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_reason?: string | null
          token: string
          user_id: string
        }
        Update: {
          created_at?: string
          device_info?: Json | null
          expires_at?: string
          id?: string
          last_activity_at?: string
          revoked?: boolean | null
          revoked_at?: string | null
          revoked_reason?: string | null
          token?: string
          user_id?: string
        }
        Relationships: []
      }
      sgso_actions: {
        Row: {
          action_description: string | null
          action_title: string
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          due_date: string | null
          evidence_url: string | null
          id: string
          metadata: Json | null
          plan_id: string | null
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_description?: string | null
          action_title: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_description?: string | null
          action_title?: string
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          due_date?: string | null
          evidence_url?: string | null
          id?: string
          metadata?: Json | null
          plan_id?: string | null
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sgso_actions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "sgso_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      sgso_audit_items: {
        Row: {
          audit_id: string
          comment: string | null
          completed_at: string | null
          compliance_status: string
          corrective_action: string | null
          created_at: string | null
          deadline: string | null
          evidence: string | null
          id: string
          metadata: Json | null
          requirement_number: number
          requirement_title: string
          responsible: string | null
        }
        Insert: {
          audit_id: string
          comment?: string | null
          completed_at?: string | null
          compliance_status: string
          corrective_action?: string | null
          created_at?: string | null
          deadline?: string | null
          evidence?: string | null
          id?: string
          metadata?: Json | null
          requirement_number: number
          requirement_title: string
          responsible?: string | null
        }
        Update: {
          audit_id?: string
          comment?: string | null
          completed_at?: string | null
          compliance_status?: string
          corrective_action?: string | null
          created_at?: string | null
          deadline?: string | null
          evidence?: string | null
          id?: string
          metadata?: Json | null
          requirement_number?: number
          requirement_title?: string
          responsible?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sgso_audit_items_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "sgso_audits"
            referencedColumns: ["id"]
          },
        ]
      }
      sgso_audits: {
        Row: {
          audit_date: string
          audit_type: string | null
          auditor_id: string | null
          compliance_score: number | null
          created_at: string | null
          findings: string | null
          id: string
          metadata: Json | null
          next_audit_date: string | null
          non_conformities_count: number | null
          recommendations: string | null
          status: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          audit_date: string
          audit_type?: string | null
          auditor_id?: string | null
          compliance_score?: number | null
          created_at?: string | null
          findings?: string | null
          id?: string
          metadata?: Json | null
          next_audit_date?: string | null
          non_conformities_count?: number | null
          recommendations?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          audit_date?: string
          audit_type?: string | null
          auditor_id?: string | null
          compliance_score?: number | null
          created_at?: string | null
          findings?: string | null
          id?: string
          metadata?: Json | null
          next_audit_date?: string | null
          non_conformities_count?: number | null
          recommendations?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: []
      }
      sgso_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          content: Json | null
          created_at: string | null
          created_by: string | null
          effective_date: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          plan_name: string
          plan_version: string | null
          review_date: string | null
          status: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          plan_name: string
          plan_version?: string | null
          review_date?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          effective_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          plan_name?: string
          plan_version?: string | null
          review_date?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sgso_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sgso_plans_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
      system_backups: {
        Row: {
          backup_status: string
          backup_type: string
          completed_at: string | null
          created_at: string
          created_by: string | null
          error_message: string | null
          file_path: string
          file_size: number | null
          id: string
          metadata: Json | null
        }
        Insert: {
          backup_status?: string
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          backup_status?: string
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          error_message?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          metadata?: Json | null
        }
        Relationships: []
      }
      system_context_snapshots: {
        Row: {
          active_modules: Json | null
          context_id: string
          created_at: string | null
          id: string
          performance_metrics: Json | null
          recent_events: Json | null
          summary: string | null
          system_status: Json | null
          updated_at: string | null
        }
        Insert: {
          active_modules?: Json | null
          context_id: string
          created_at?: string | null
          id?: string
          performance_metrics?: Json | null
          recent_events?: Json | null
          summary?: string | null
          system_status?: Json | null
          updated_at?: string | null
        }
        Update: {
          active_modules?: Json | null
          context_id?: string
          created_at?: string | null
          id?: string
          performance_metrics?: Json | null
          recent_events?: Json | null
          summary?: string | null
          system_status?: Json | null
          updated_at?: string | null
        }
        Relationships: []
      }
      system_health: {
        Row: {
          created_at: string | null
          error_rate: number | null
          id: string
          last_check: string | null
          last_error: string | null
          metadata: Json | null
          response_time_ms: number | null
          service_name: string
          status: string
          updated_at: string | null
          uptime_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          error_rate?: number | null
          id?: string
          last_check?: string | null
          last_error?: string | null
          metadata?: Json | null
          response_time_ms?: number | null
          service_name: string
          status: string
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          error_rate?: number | null
          id?: string
          last_check?: string | null
          last_error?: string | null
          metadata?: Json | null
          response_time_ms?: number | null
          service_name?: string
          status?: string
          updated_at?: string | null
          uptime_percentage?: number | null
        }
        Relationships: []
      }
      system_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          id: string
          module: string
          severity: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          id?: string
          module: string
          severity?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          id?: string
          module?: string
          severity?: string | null
          user_id?: string | null
        }
        Relationships: []
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
      system_observations: {
        Row: {
          created_at: string | null
          id: string
          message: string
          metadata: Json | null
          module_name: string
          observation_type: string
          resolved: boolean | null
          resolved_at: string | null
          severity: string
          tenant_id: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          message: string
          metadata?: Json | null
          module_name: string
          observation_type: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity: string
          tenant_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          message?: string
          metadata?: Json | null
          module_name?: string
          observation_type?: string
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string
          tenant_id?: string | null
          vessel_id?: string | null
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
      tactical_decisions: {
        Row: {
          action_taken: string
          context: Json | null
          created_at: string | null
          decision_id: string
          executed_at: string | null
          id: string
          module_name: string
          override_by: string | null
          priority: string
          success: boolean | null
          tenant_id: string | null
          trigger_type: string
          vessel_id: string | null
        }
        Insert: {
          action_taken: string
          context?: Json | null
          created_at?: string | null
          decision_id: string
          executed_at?: string | null
          id?: string
          module_name: string
          override_by?: string | null
          priority: string
          success?: boolean | null
          tenant_id?: string | null
          trigger_type: string
          vessel_id?: string | null
        }
        Update: {
          action_taken?: string
          context?: Json | null
          created_at?: string | null
          decision_id?: string
          executed_at?: string | null
          id?: string
          module_name?: string
          override_by?: string | null
          priority?: string
          success?: boolean | null
          tenant_id?: string | null
          trigger_type?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tactical_decisions_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      template_placeholders: {
        Row: {
          created_at: string | null
          default_value: string | null
          id: string
          is_required: boolean | null
          options: Json | null
          placeholder_key: string
          placeholder_label: string
          placeholder_type: string
          template_id: string
        }
        Insert: {
          created_at?: string | null
          default_value?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          placeholder_key: string
          placeholder_label: string
          placeholder_type?: string
          template_id: string
        }
        Update: {
          created_at?: string | null
          default_value?: string | null
          id?: string
          is_required?: boolean | null
          options?: Json | null
          placeholder_key?: string
          placeholder_label?: string
          placeholder_type?: string
          template_id?: string
        }
        Relationships: []
      }
      template_variables: {
        Row: {
          created_at: string
          default_value: string | null
          description: string | null
          id: string
          is_required: boolean | null
          template_id: string | null
          variable_name: string
          variable_type: string
        }
        Insert: {
          created_at?: string
          default_value?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          template_id?: string | null
          variable_name: string
          variable_type?: string
        }
        Update: {
          created_at?: string
          default_value?: string | null
          description?: string | null
          id?: string
          is_required?: boolean | null
          template_id?: string | null
          variable_name?: string
          variable_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_variables_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      templates: {
        Row: {
          category: string | null
          content: Json
          created_at: string | null
          created_by: string | null
          id: string
          is_favorite: boolean | null
          is_private: boolean | null
          is_system: boolean | null
          metadata: Json | null
          tags: string[] | null
          title: string
          updated_at: string | null
          version: number | null
        }
        Insert: {
          category?: string | null
          content: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_favorite?: boolean | null
          is_private?: boolean | null
          is_system?: boolean | null
          metadata?: Json | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          version?: number | null
        }
        Update: {
          category?: string | null
          content?: Json
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_favorite?: boolean | null
          is_private?: boolean | null
          is_system?: boolean | null
          metadata?: Json | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          version?: number | null
        }
        Relationships: []
      }
      tenant_audit_logs: {
        Row: {
          action: string
          created_at: string | null
          id: string
          ip_address: unknown
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
          ip_address?: unknown
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
          ip_address?: unknown
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
      tenant_modules: {
        Row: {
          config: Json | null
          created_at: string | null
          enabled: boolean | null
          id: string
          module_name: string
          tenant_id: string
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          module_name: string
          tenant_id: string
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          enabled?: boolean | null
          id?: string
          module_name?: string
          tenant_id?: string
          updated_at?: string | null
        }
        Relationships: []
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
          invited_by: string | null
          job_title: string | null
          joined_at: string | null
          last_active_at: string | null
          last_seen_at: string | null
          metadata: Json | null
          permissions: Json | null
          phone: string | null
          preferences: Json | null
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
          invited_by?: string | null
          job_title?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          last_seen_at?: string | null
          metadata?: Json | null
          permissions?: Json | null
          phone?: string | null
          preferences?: Json | null
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
          invited_by?: string | null
          job_title?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          last_seen_at?: string | null
          metadata?: Json | null
          permissions?: Json | null
          phone?: string | null
          preferences?: Json | null
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
      training_deltas: {
        Row: {
          baseline_value: number | null
          confidence: number | null
          created_at: string | null
          current_value: number | null
          cycle_id: string
          delta_value: number | null
          deltas: Json | null
          id: string
          metric_name: string
          module_name: string
          source: string
          tenant_id: string | null
        }
        Insert: {
          baseline_value?: number | null
          confidence?: number | null
          created_at?: string | null
          current_value?: number | null
          cycle_id: string
          delta_value?: number | null
          deltas?: Json | null
          id?: string
          metric_name: string
          module_name: string
          source: string
          tenant_id?: string | null
        }
        Update: {
          baseline_value?: number | null
          confidence?: number | null
          created_at?: string | null
          current_value?: number | null
          cycle_id?: string
          delta_value?: number | null
          deltas?: Json | null
          id?: string
          metric_name?: string
          module_name?: string
          source?: string
          tenant_id?: string | null
        }
        Relationships: []
      }
      travel_itineraries: {
        Row: {
          booking_reference: string | null
          created_at: string
          departure_date: string
          destination: string
          id: string
          metadata: Json | null
          organization_id: string | null
          origin: string
          return_date: string | null
          segments: Json | null
          status: string
          total_cost: number | null
          trip_name: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          booking_reference?: string | null
          created_at?: string
          departure_date: string
          destination: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          origin: string
          return_date?: string | null
          segments?: Json | null
          status?: string
          total_cost?: number | null
          trip_name: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          booking_reference?: string | null
          created_at?: string
          departure_date?: string
          destination?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          origin?: string
          return_date?: string | null
          segments?: Json | null
          status?: string
          total_cost?: number | null
          trip_name?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      travel_logs: {
        Row: {
          event_data: Json | null
          event_type: string
          id: string
          itinerary_id: string | null
          timestamp: string
        }
        Insert: {
          event_data?: Json | null
          event_type: string
          id?: string
          itinerary_id?: string | null
          timestamp?: string
        }
        Update: {
          event_data?: Json | null
          event_type?: string
          id?: string
          itinerary_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "travel_logs_itinerary_id_fkey"
            columns: ["itinerary_id"]
            isOneToOne: false
            referencedRelation: "travel_itineraries"
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
      trust_events: {
        Row: {
          created_at: string
          details: Json
          entity_id: string
          event_type: string
          id: string
          severity: string
          trust_score_after: number
          trust_score_before: number | null
        }
        Insert: {
          created_at?: string
          details: Json
          entity_id: string
          event_type: string
          id?: string
          severity?: string
          trust_score_after: number
          trust_score_before?: number | null
        }
        Update: {
          created_at?: string
          details?: Json
          entity_id?: string
          event_type?: string
          id?: string
          severity?: string
          trust_score_after?: number
          trust_score_before?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_events_entity_id_fkey"
            columns: ["entity_id"]
            isOneToOne: false
            referencedRelation: "external_entities"
            referencedColumns: ["entity_id"]
          },
        ]
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
      vault_documents: {
        Row: {
          category: string
          content: string
          created_at: string | null
          embedding: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          is_archived: boolean | null
          metadata: Json | null
          organization_id: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
          version: number | null
        }
        Insert: {
          category: string
          content: string
          created_at?: string | null
          embedding?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Update: {
          category?: string
          content?: string
          created_at?: string | null
          embedding?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          is_archived?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
          version?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "vault_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      vault_search_logs: {
        Row: {
          created_at: string | null
          id: string
          query: string
          results: Json | null
          results_count: number | null
          search_duration_ms: number | null
          search_type: string
          similarity_scores: number[] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          query: string
          results?: Json | null
          results_count?: number | null
          search_duration_ms?: number | null
          search_type?: string
          similarity_scores?: number[] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          query?: string
          results?: Json | null
          results_count?: number | null
          search_duration_ms?: number | null
          search_type?: string
          similarity_scores?: number[] | null
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
      vessel_performance_metrics: {
        Row: {
          created_at: string
          fuel_efficiency: number | null
          id: string
          metadata: Json | null
          positioning_accuracy: number | null
          recorded_at: string
          response_time: number | null
          thruster_efficiency: number | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          fuel_efficiency?: number | null
          id?: string
          metadata?: Json | null
          positioning_accuracy?: number | null
          recorded_at?: string
          response_time?: number | null
          thruster_efficiency?: number | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          fuel_efficiency?: number | null
          id?: string
          metadata?: Json | null
          positioning_accuracy?: number | null
          recorded_at?: string
          response_time?: number | null
          thruster_efficiency?: number | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_performance_metrics_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_speeds: {
        Row: {
          created_at: string | null
          fuel_efficiency_rating: number | null
          id: string
          optimal_speed_knots: number | null
          organization_id: string | null
          recorded_speed_knots: number
          route_segment_id: string | null
          timestamp: string
          vessel_id: string | null
        }
        Insert: {
          created_at?: string | null
          fuel_efficiency_rating?: number | null
          id?: string
          optimal_speed_knots?: number | null
          organization_id?: string | null
          recorded_speed_knots: number
          route_segment_id?: string | null
          timestamp?: string
          vessel_id?: string | null
        }
        Update: {
          created_at?: string | null
          fuel_efficiency_rating?: number | null
          id?: string
          optimal_speed_knots?: number | null
          organization_id?: string | null
          recorded_speed_knots?: number
          route_segment_id?: string | null
          timestamp?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_speeds_route_segment_id_fkey"
            columns: ["route_segment_id"]
            isOneToOne: false
            referencedRelation: "route_segments"
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
          flag: string | null
          flag_state: string
          fuel_capacity: number | null
          gross_tonnage: number | null
          id: string
          imo_number: string | null
          last_maintenance_date: string | null
          length: number | null
          metadata: Json | null
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
          flag?: string | null
          flag_state: string
          fuel_capacity?: number | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: string | null
          last_maintenance_date?: string | null
          length?: number | null
          metadata?: Json | null
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
          flag?: string | null
          flag_state?: string
          fuel_capacity?: number | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: string | null
          last_maintenance_date?: string | null
          length?: number | null
          metadata?: Json | null
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
      voice_logs: {
        Row: {
          action_taken: string | null
          audio_duration_ms: number | null
          command_text: string
          created_at: string | null
          error_message: string | null
          id: string
          intent_detected: string | null
          metadata: Json | null
          response_text: string | null
          success: boolean | null
          transcription_confidence: number | null
          user_id: string | null
        }
        Insert: {
          action_taken?: string | null
          audio_duration_ms?: number | null
          command_text: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          intent_detected?: string | null
          metadata?: Json | null
          response_text?: string | null
          success?: boolean | null
          transcription_confidence?: number | null
          user_id?: string | null
        }
        Update: {
          action_taken?: string | null
          audio_duration_ms?: number | null
          command_text?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          intent_detected?: string | null
          metadata?: Json | null
          response_text?: string | null
          success?: boolean | null
          transcription_confidence?: number | null
          user_id?: string | null
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
      watchdog_behavior_alerts: {
        Row: {
          actual_behavior: string | null
          alert_type: string
          anomaly_detected: string
          auto_resolved: boolean | null
          component_name: string
          created_at: string | null
          deviation_score: number | null
          expected_behavior: string | null
          id: string
          metadata: Json | null
          resolution_action: string | null
          resolved_at: string | null
          severity: string
        }
        Insert: {
          actual_behavior?: string | null
          alert_type: string
          anomaly_detected: string
          auto_resolved?: boolean | null
          component_name: string
          created_at?: string | null
          deviation_score?: number | null
          expected_behavior?: string | null
          id?: string
          metadata?: Json | null
          resolution_action?: string | null
          resolved_at?: string | null
          severity: string
        }
        Update: {
          actual_behavior?: string | null
          alert_type?: string
          anomaly_detected?: string
          auto_resolved?: boolean | null
          component_name?: string
          created_at?: string | null
          deviation_score?: number | null
          expected_behavior?: string | null
          id?: string
          metadata?: Json | null
          resolution_action?: string | null
          resolved_at?: string | null
          severity?: string
        }
        Relationships: []
      }
      watchdog_logs: {
        Row: {
          ai_analysis: Json | null
          auto_fix_attempted: boolean | null
          auto_fix_success: boolean | null
          context: Json | null
          created_at: string
          error_id: string
          error_type: string
          id: string
          message: string
          module_name: string | null
          resolution_notes: string | null
          resolved_at: string | null
          severity: string
          stack_trace: string | null
          user_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          auto_fix_attempted?: boolean | null
          auto_fix_success?: boolean | null
          context?: Json | null
          created_at?: string
          error_id: string
          error_type: string
          id?: string
          message: string
          module_name?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          auto_fix_attempted?: boolean | null
          auto_fix_success?: boolean | null
          context?: Json | null
          created_at?: string
          error_id?: string
          error_type?: string
          id?: string
          message?: string
          module_name?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          severity?: string
          stack_trace?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      webhook_events: {
        Row: {
          created_at: string | null
          error_message: string | null
          event_name: string
          event_type: string
          headers: Json | null
          id: string
          integration_id: string | null
          organization_id: string | null
          payload: Json
          processed_at: string | null
          source_ip: string | null
          status: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_name: string
          event_type: string
          headers?: Json | null
          id?: string
          integration_id?: string | null
          organization_id?: string | null
          payload: Json
          processed_at?: string | null
          source_ip?: string | null
          status?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_name?: string
          event_type?: string
          headers?: Json | null
          id?: string
          integration_id?: string | null
          organization_id?: string | null
          payload?: Json
          processed_at?: string | null
          source_ip?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_events_integration_id_fkey"
            columns: ["integration_id"]
            isOneToOne: false
            referencedRelation: "connected_integrations"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_execution_logs: {
        Row: {
          execution_id: string
          id: string
          input: Json | null
          output: Json | null
          status: string
          step_index: number
          step_name: string
          timestamp: string | null
        }
        Insert: {
          execution_id: string
          id?: string
          input?: Json | null
          output?: Json | null
          status: string
          step_index: number
          step_name: string
          timestamp?: string | null
        }
        Update: {
          execution_id?: string
          id?: string
          input?: Json | null
          output?: Json | null
          status?: string
          step_index?: number
          step_name?: string
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_execution_logs_execution_id_fkey"
            columns: ["execution_id"]
            isOneToOne: false
            referencedRelation: "workflow_executions"
            referencedColumns: ["id"]
          },
        ]
      }
      workflow_executions: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_step: number | null
          id: string
          started_at: string | null
          status: string
          total_steps: number
          workflow_id: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          started_at?: string | null
          status: string
          total_steps: number
          workflow_id: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_step?: number | null
          id?: string
          started_at?: string | null
          status?: string
          total_steps?: number
          workflow_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "workflow_executions_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "nautilus_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_channels: {
        Row: {
          channel_type: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          organization_id: string | null
          updated_at: string | null
        }
        Insert: {
          channel_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Update: {
          channel_type?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_channels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_documents: {
        Row: {
          channel_id: string | null
          content: Json | null
          created_at: string | null
          created_by: string | null
          id: string
          title: string
          updated_at: string | null
          updated_by: string | null
          version: number | null
          yjs_state: string | null
        }
        Insert: {
          channel_id?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
          yjs_state?: string | null
        }
        Update: {
          channel_id?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          title?: string
          updated_at?: string | null
          updated_by?: string | null
          version?: number | null
          yjs_state?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_documents_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "workspace_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_events: {
        Row: {
          channel_id: string | null
          color: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          end_time: string
          event_type: string | null
          id: string
          is_all_day: boolean | null
          location: string | null
          recurrence_rule: string | null
          start_time: string
          title: string
          updated_at: string | null
        }
        Insert: {
          channel_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time: string
          event_type?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          start_time: string
          title: string
          updated_at?: string | null
        }
        Update: {
          channel_id?: string | null
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          end_time?: string
          event_type?: string | null
          id?: string
          is_all_day?: boolean | null
          location?: string | null
          recurrence_rule?: string | null
          start_time?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_events_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "workspace_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_files: {
        Row: {
          channel_id: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          id: string
          storage_path: string
          thumbnail_path: string | null
          updated_at: string | null
          uploaded_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path: string
          thumbnail_path?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          id?: string
          storage_path?: string
          thumbnail_path?: string | null
          updated_at?: string | null
          uploaded_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_files_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "workspace_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_members: {
        Row: {
          channel_id: string | null
          id: string
          joined_at: string | null
          last_seen_at: string | null
          role: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          id?: string
          joined_at?: string | null
          last_seen_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          id?: string
          joined_at?: string | null
          last_seen_at?: string | null
          role?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_members_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "workspace_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_messages: {
        Row: {
          attachments: Json | null
          channel_id: string | null
          content: string
          created_at: string | null
          edited_at: string | null
          id: string
          is_edited: boolean | null
          message_type: string | null
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          attachments?: Json | null
          channel_id?: string | null
          content: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          attachments?: Json | null
          channel_id?: string | null
          content?: string
          created_at?: string | null
          edited_at?: string | null
          id?: string
          is_edited?: boolean | null
          message_type?: string | null
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_messages_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "workspace_channels"
            referencedColumns: ["id"]
          },
        ]
      }
      workspace_presence: {
        Row: {
          channel_id: string | null
          current_activity: string | null
          id: string
          last_activity_at: string | null
          status: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          channel_id?: string | null
          current_activity?: string | null
          id?: string
          last_activity_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          channel_id?: string | null
          current_activity?: string | null
          id?: string
          last_activity_at?: string | null
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workspace_presence_channel_id_fkey"
            columns: ["channel_id"]
            isOneToOne: false
            referencedRelation: "workspace_channels"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
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
      cleanup_old_logs: { Args: never; Returns: undefined }
      create_sample_peotram_audit: { Args: never; Returns: string }
      create_session_token: {
        Args: { p_device_info?: Json; p_expires_in_hours?: number }
        Returns: {
          expires_at: string
          token: string
          token_id: string
        }[]
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
      get_active_sessions: {
        Args: never
        Returns: {
          created_at: string
          device_info: Json
          expires_at: string
          id: string
          last_activity_at: string
          revoked: boolean
          token: string
        }[]
      }
      get_current_organization_id: { Args: never; Returns: string }
      get_current_tenant_id: { Args: never; Returns: string }
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
      increment_api_rate_limit: {
        Args: { p_api_key_id: string; p_window_type: string }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      jobs_trend_by_month: {
        Args: never
        Returns: {
          count: number
          month: string
        }[]
      }
      log_user_action: {
        Args: {
          p_action: string
          p_details?: Json
          p_resource_id?: string
          p_resource_type: string
          p_status?: string
        }
        Returns: string
      }
      match_mmi_jobs: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          component_id: string
          created_at: string
          description: string
          id: string
          similarity: number
          title: string
        }[]
      }
      revoke_session_token: {
        Args: { p_reason?: string; p_token_id: string }
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
      user_has_role: {
        Args: { _role: string; _user_id: string }
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
      user_tenant_id: { Args: { _user_id: string }; Returns: string }
      validate_session_token: {
        Args: { p_token: string }
        Returns: {
          expires_at: string
          is_valid: boolean
          user_id: string
        }[]
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
        | "auditor"
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
        "auditor",
      ],
    },
  },
} as const;
