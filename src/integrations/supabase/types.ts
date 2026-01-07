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
    PostgrestVersion: "14.1"
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
      action_items: {
        Row: {
          assigned_to: string | null
          assigned_to_email: string | null
          assigned_to_name: string | null
          assigned_to_phone: string | null
          comments: Json | null
          completion_date: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          evidence_files: Json | null
          id: string
          notification_sent_at: string | null
          organization_id: string | null
          priority: string | null
          reminder_count: number | null
          responsibility_matrix_id: string | null
          source_module: string | null
          source_reference_id: string | null
          start_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          vessel_id: string | null
          zapier_webhook_url: string | null
        }
        Insert: {
          assigned_to?: string | null
          assigned_to_email?: string | null
          assigned_to_name?: string | null
          assigned_to_phone?: string | null
          comments?: Json | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          evidence_files?: Json | null
          id?: string
          notification_sent_at?: string | null
          organization_id?: string | null
          priority?: string | null
          reminder_count?: number | null
          responsibility_matrix_id?: string | null
          source_module?: string | null
          source_reference_id?: string | null
          start_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vessel_id?: string | null
          zapier_webhook_url?: string | null
        }
        Update: {
          assigned_to?: string | null
          assigned_to_email?: string | null
          assigned_to_name?: string | null
          assigned_to_phone?: string | null
          comments?: Json | null
          completion_date?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          evidence_files?: Json | null
          id?: string
          notification_sent_at?: string | null
          organization_id?: string | null
          priority?: string | null
          reminder_count?: number | null
          responsibility_matrix_id?: string | null
          source_module?: string | null
          source_reference_id?: string | null
          start_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vessel_id?: string | null
          zapier_webhook_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "action_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_responsibility_matrix_id_fkey"
            columns: ["responsibility_matrix_id"]
            isOneToOne: false
            referencedRelation: "responsibility_matrices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "action_items_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
      ai_audit_logs: {
        Row: {
          ai_response: string | null
          approval_comments: string | null
          approval_decision: string | null
          approved_at: string | null
          approved_by: string | null
          approved_by_name: string | null
          confidence_score: number | null
          created_at: string | null
          id: string
          input_hash: string | null
          interaction_type: string | null
          ip_address: unknown
          model_parameters: Json | null
          model_provider: string | null
          model_version: string | null
          module_name: string | null
          organization_id: string | null
          quality_score: number | null
          rag_enabled: boolean | null
          rag_source_documents: string[] | null
          rag_sources: Json | null
          requires_approval: boolean | null
          response_hash: string | null
          response_time_ms: number | null
          session_id: string | null
          tokens_input: number | null
          tokens_output: number | null
          trust_score: number | null
          user_agent: string | null
          user_id: string | null
          user_input: string
          user_name: string | null
          user_permission_level: string | null
          user_role: string | null
        }
        Insert: {
          ai_response?: string | null
          approval_comments?: string | null
          approval_decision?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          input_hash?: string | null
          interaction_type?: string | null
          ip_address?: unknown
          model_parameters?: Json | null
          model_provider?: string | null
          model_version?: string | null
          module_name?: string | null
          organization_id?: string | null
          quality_score?: number | null
          rag_enabled?: boolean | null
          rag_source_documents?: string[] | null
          rag_sources?: Json | null
          requires_approval?: boolean | null
          response_hash?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          trust_score?: number | null
          user_agent?: string | null
          user_id?: string | null
          user_input: string
          user_name?: string | null
          user_permission_level?: string | null
          user_role?: string | null
        }
        Update: {
          ai_response?: string | null
          approval_comments?: string | null
          approval_decision?: string | null
          approved_at?: string | null
          approved_by?: string | null
          approved_by_name?: string | null
          confidence_score?: number | null
          created_at?: string | null
          id?: string
          input_hash?: string | null
          interaction_type?: string | null
          ip_address?: unknown
          model_parameters?: Json | null
          model_provider?: string | null
          model_version?: string | null
          module_name?: string | null
          organization_id?: string | null
          quality_score?: number | null
          rag_enabled?: boolean | null
          rag_source_documents?: string[] | null
          rag_sources?: Json | null
          requires_approval?: boolean | null
          response_hash?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          tokens_input?: number | null
          tokens_output?: number | null
          trust_score?: number | null
          user_agent?: string | null
          user_id?: string | null
          user_input?: string
          user_name?: string | null
          user_permission_level?: string | null
          user_role?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_audit_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_behavior_snapshots: {
        Row: {
          accuracy_score: number | null
          anomalies_detected: number | null
          behavior_type: string | null
          confidence_avg: number | null
          correct_decisions: number | null
          created_at: string
          decisions_count: number | null
          f1_score: number | null
          id: string
          learning_rate: number | null
          metadata: Json | null
          model_version: string | null
          module_name: string
          organization_id: string | null
          precision_score: number | null
          recall_score: number | null
          snapshot_date: string
        }
        Insert: {
          accuracy_score?: number | null
          anomalies_detected?: number | null
          behavior_type?: string | null
          confidence_avg?: number | null
          correct_decisions?: number | null
          created_at?: string
          decisions_count?: number | null
          f1_score?: number | null
          id?: string
          learning_rate?: number | null
          metadata?: Json | null
          model_version?: string | null
          module_name: string
          organization_id?: string | null
          precision_score?: number | null
          recall_score?: number | null
          snapshot_date?: string
        }
        Update: {
          accuracy_score?: number | null
          anomalies_detected?: number | null
          behavior_type?: string | null
          confidence_avg?: number | null
          correct_decisions?: number | null
          created_at?: string
          decisions_count?: number | null
          f1_score?: number | null
          id?: string
          learning_rate?: number | null
          metadata?: Json | null
          model_version?: string | null
          module_name?: string
          organization_id?: string | null
          precision_score?: number | null
          recall_score?: number | null
          snapshot_date?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_behavior_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_chat_conversations: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          module_context: string | null
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          module_context?: string | null
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          module_context?: string | null
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      ai_chat_messages: {
        Row: {
          content: string
          conversation_id: string
          created_at: string
          id: string
          metadata: Json | null
          role: string
          tokens_used: number | null
        }
        Insert: {
          content: string
          conversation_id: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role: string
          tokens_used?: number | null
        }
        Update: {
          content?: string
          conversation_id?: string
          created_at?: string
          id?: string
          metadata?: Json | null
          role?: string
          tokens_used?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_chat_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "ai_chat_conversations"
            referencedColumns: ["id"]
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
      ai_configurations: {
        Row: {
          config_key: string
          config_value: Json
          created_at: string
          description: string | null
          id: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          config_key: string
          config_value: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          config_key?: string
          config_value?: Json
          created_at?: string
          description?: string | null
          id?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      ai_decisions: {
        Row: {
          action_payload: Json | null
          action_type: string | null
          confidence: number
          confidence_level: string
          created_at: string
          created_by: string | null
          description: string
          executed_at: string | null
          feedback_actual_outcome: string | null
          feedback_notes: string | null
          feedback_provided_at: string | null
          feedback_was_correct: boolean | null
          id: string
          impact: string
          justification_evidence: Json | null
          justification_expected_outcome: string | null
          justification_reasoning: string
          justification_risks: Json | null
          rejected_reason: string | null
          rolled_back_at: string | null
          status: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          action_payload?: Json | null
          action_type?: string | null
          confidence: number
          confidence_level: string
          created_at?: string
          created_by?: string | null
          description: string
          executed_at?: string | null
          feedback_actual_outcome?: string | null
          feedback_notes?: string | null
          feedback_provided_at?: string | null
          feedback_was_correct?: boolean | null
          id?: string
          impact: string
          justification_evidence?: Json | null
          justification_expected_outcome?: string | null
          justification_reasoning: string
          justification_risks?: Json | null
          rejected_reason?: string | null
          rolled_back_at?: string | null
          status?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          action_payload?: Json | null
          action_type?: string | null
          confidence?: number
          confidence_level?: string
          created_at?: string
          created_by?: string | null
          description?: string
          executed_at?: string | null
          feedback_actual_outcome?: string | null
          feedback_notes?: string | null
          feedback_provided_at?: string | null
          feedback_was_correct?: boolean | null
          id?: string
          impact?: string
          justification_evidence?: Json | null
          justification_expected_outcome?: string | null
          justification_reasoning?: string
          justification_risks?: Json | null
          rejected_reason?: string | null
          rolled_back_at?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      ai_document_insights: {
        Row: {
          classification: string | null
          confidence: number | null
          created_at: string
          created_by: string | null
          dates: Json | null
          document_id: string
          entities: Json | null
          extracted_text: string | null
          highlights: Json | null
          id: string
          keywords: string[] | null
          language: string | null
          ocr_engine: string | null
          organization_id: string | null
          processing_time_ms: number | null
          summary: string | null
          tables_detected: Json | null
          updated_at: string
        }
        Insert: {
          classification?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          dates?: Json | null
          document_id: string
          entities?: Json | null
          extracted_text?: string | null
          highlights?: Json | null
          id?: string
          keywords?: string[] | null
          language?: string | null
          ocr_engine?: string | null
          organization_id?: string | null
          processing_time_ms?: number | null
          summary?: string | null
          tables_detected?: Json | null
          updated_at?: string
        }
        Update: {
          classification?: string | null
          confidence?: number | null
          created_at?: string
          created_by?: string | null
          dates?: Json | null
          document_id?: string
          entities?: Json | null
          extracted_text?: string | null
          highlights?: Json | null
          id?: string
          keywords?: string[] | null
          language?: string | null
          ocr_engine?: string | null
          organization_id?: string | null
          processing_time_ms?: number | null
          summary?: string | null
          tables_detected?: Json | null
          updated_at?: string
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
      ai_generated_documents: {
        Row: {
          ai_model: string | null
          approved_at: string | null
          approved_by: string | null
          confidence_score: number | null
          content: string | null
          created_at: string
          created_by: string | null
          document_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          prompt_used: string | null
          status: string
          template_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_model?: string | null
          approved_at?: string | null
          approved_by?: string | null
          confidence_score?: number | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          prompt_used?: string | null
          status?: string
          template_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_model?: string | null
          approved_at?: string | null
          approved_by?: string | null
          confidence_score?: number | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          prompt_used?: string | null
          status?: string
          template_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ai_generated_documents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      ai_inspection_feedback: {
        Row: {
          confidence_score: number | null
          created_at: string | null
          feedback_text: string | null
          id: string
          inspection_id: string | null
          inspection_type: string | null
          inspector_id: string | null
          is_non_conformity: boolean | null
        }
        Insert: {
          confidence_score?: number | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          inspection_id?: string | null
          inspection_type?: string | null
          inspector_id?: string | null
          is_non_conformity?: boolean | null
        }
        Update: {
          confidence_score?: number | null
          created_at?: string | null
          feedback_text?: string | null
          id?: string
          inspection_id?: string | null
          inspection_type?: string | null
          inspector_id?: string | null
          is_non_conformity?: boolean | null
        }
        Relationships: []
      }
      ai_learning_metrics: {
        Row: {
          accuracy_rate: number | null
          average_confidence: number | null
          correct_decisions: number
          created_at: string
          decisions_by_confidence: Json | null
          decisions_by_type: Json | null
          id: string
          period_end: string
          period_start: string
          total_decisions: number
        }
        Insert: {
          accuracy_rate?: number | null
          average_confidence?: number | null
          correct_decisions?: number
          created_at?: string
          decisions_by_confidence?: Json | null
          decisions_by_type?: Json | null
          id?: string
          period_end: string
          period_start: string
          total_decisions?: number
        }
        Update: {
          accuracy_rate?: number | null
          average_confidence?: number | null
          correct_decisions?: number
          created_at?: string
          decisions_by_confidence?: Json | null
          decisions_by_type?: Json | null
          id?: string
          period_end?: string
          period_start?: string
          total_decisions?: number
        }
        Relationships: []
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
      ai_memory: {
        Row: {
          content: Json
          created_at: string
          embedding: string | null
          id: string
          importance: number | null
          memory_type: string
          organization_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          content?: Json
          created_at?: string
          embedding?: string | null
          id?: string
          importance?: number | null
          memory_type: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          content?: Json
          created_at?: string
          embedding?: string | null
          id?: string
          importance?: number | null
          memory_type?: string
          organization_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_memory_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      ai_self_healing_logs: {
        Row: {
          action_result: string | null
          action_taken: string | null
          ai_model: string | null
          confidence_score: number | null
          correction_type: string | null
          created_at: string
          error_stack: string | null
          event_type: string
          execution_time_ms: number | null
          id: string
          issue_description: string
          metadata: Json | null
          module_affected: string
          organization_id: string | null
          resolved_at: string | null
          root_cause: string | null
          severity: string
          triggered_by: string | null
          updated_at: string
        }
        Insert: {
          action_result?: string | null
          action_taken?: string | null
          ai_model?: string | null
          confidence_score?: number | null
          correction_type?: string | null
          created_at?: string
          error_stack?: string | null
          event_type: string
          execution_time_ms?: number | null
          id?: string
          issue_description: string
          metadata?: Json | null
          module_affected: string
          organization_id?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          triggered_by?: string | null
          updated_at?: string
        }
        Update: {
          action_result?: string | null
          action_taken?: string | null
          ai_model?: string | null
          confidence_score?: number | null
          correction_type?: string | null
          created_at?: string
          error_stack?: string | null
          event_type?: string
          execution_time_ms?: number | null
          id?: string
          issue_description?: string
          metadata?: Json | null
          module_affected?: string
          organization_id?: string | null
          resolved_at?: string | null
          root_cause?: string | null
          severity?: string
          triggered_by?: string | null
          updated_at?: string
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
      ai_training_history: {
        Row: {
          ai_response: Json | null
          correctness: boolean | null
          created_at: string | null
          crew_member_id: string | null
          difficulty_at_time: string | null
          id: string
          interaction_data: Json
          interaction_type: string
          occurred_at: string | null
          organization_id: string
          performance_score: number | null
          session_id: string | null
          time_spent_seconds: number | null
        }
        Insert: {
          ai_response?: Json | null
          correctness?: boolean | null
          created_at?: string | null
          crew_member_id?: string | null
          difficulty_at_time?: string | null
          id?: string
          interaction_data: Json
          interaction_type: string
          occurred_at?: string | null
          organization_id: string
          performance_score?: number | null
          session_id?: string | null
          time_spent_seconds?: number | null
        }
        Update: {
          ai_response?: Json | null
          correctness?: boolean | null
          created_at?: string | null
          crew_member_id?: string | null
          difficulty_at_time?: string | null
          id?: string
          interaction_data?: Json
          interaction_type?: string
          occurred_at?: string | null
          organization_id?: string
          performance_score?: number | null
          session_id?: string | null
          time_spent_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_history_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_training_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_training_history_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "ai_training_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_training_sessions: {
        Row: {
          ai_feedback: Json | null
          ai_model_used: string | null
          completed_at: string | null
          content: Json
          created_at: string | null
          crew_member_id: string | null
          difficulty_level: string | null
          duration_minutes: number | null
          final_score: number | null
          id: string
          learning_objectives: Json | null
          next_recommended_topic: string | null
          organization_id: string
          performance_metrics: Json | null
          personalization_data: Json | null
          progress_percentage: number | null
          session_type: string
          started_at: string | null
          status: string | null
          topic: string
          updated_at: string | null
        }
        Insert: {
          ai_feedback?: Json | null
          ai_model_used?: string | null
          completed_at?: string | null
          content: Json
          created_at?: string | null
          crew_member_id?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          final_score?: number | null
          id?: string
          learning_objectives?: Json | null
          next_recommended_topic?: string | null
          organization_id: string
          performance_metrics?: Json | null
          personalization_data?: Json | null
          progress_percentage?: number | null
          session_type: string
          started_at?: string | null
          status?: string | null
          topic: string
          updated_at?: string | null
        }
        Update: {
          ai_feedback?: Json | null
          ai_model_used?: string | null
          completed_at?: string | null
          content?: Json
          created_at?: string | null
          crew_member_id?: string | null
          difficulty_level?: string | null
          duration_minutes?: number | null
          final_score?: number | null
          id?: string
          learning_objectives?: Json | null
          next_recommended_topic?: string | null
          organization_id?: string
          performance_metrics?: Json | null
          personalization_data?: Json | null
          progress_percentage?: number | null
          session_type?: string
          started_at?: string | null
          status?: string | null
          topic?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_training_sessions_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_training_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_usage_logs: {
        Row: {
          created_at: string | null
          error_message: string | null
          id: string
          message_count: number | null
          metadata: Json | null
          module_id: string
          module_name: string
          organization_id: string | null
          response_time_ms: number | null
          session_id: string | null
          success: boolean | null
          tokens_input: number | null
          tokens_output: number | null
          user_id: string | null
          voice_duration_seconds: number | null
          voice_enabled: boolean | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_count?: number | null
          metadata?: Json | null
          module_id: string
          module_name: string
          organization_id?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          success?: boolean | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
          voice_duration_seconds?: number | null
          voice_enabled?: boolean | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          id?: string
          message_count?: number | null
          metadata?: Json | null
          module_id?: string
          module_name?: string
          organization_id?: string | null
          response_time_ms?: number | null
          session_id?: string | null
          success?: boolean | null
          tokens_input?: number | null
          tokens_output?: number | null
          user_id?: string | null
          voice_duration_seconds?: number | null
          voice_enabled?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      ais_events: {
        Row: {
          course: number | null
          created_at: string | null
          destination: string | null
          eta: string | null
          event_type: string
          id: string
          mmsi: string | null
          organization_id: string | null
          position: Json | null
          raw_data: Json | null
          recorded_at: string | null
          speed: number | null
          vessel_id: string | null
        }
        Insert: {
          course?: number | null
          created_at?: string | null
          destination?: string | null
          eta?: string | null
          event_type: string
          id?: string
          mmsi?: string | null
          organization_id?: string | null
          position?: Json | null
          raw_data?: Json | null
          recorded_at?: string | null
          speed?: number | null
          vessel_id?: string | null
        }
        Update: {
          course?: number | null
          created_at?: string | null
          destination?: string | null
          eta?: string | null
          event_type?: string
          id?: string
          mmsi?: string | null
          organization_id?: string | null
          position?: Json | null
          raw_data?: Json | null
          recorded_at?: string | null
          speed?: number | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ais_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ais_events_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      api_configurations: {
        Row: {
          api_name: string
          avg_response_time_ms: number | null
          base_url: string
          created_at: string | null
          current_usage_today: number | null
          display_name: string
          error_rate_percent: number | null
          id: string
          is_active: boolean | null
          is_production: boolean | null
          last_health_check: string | null
          last_health_status: string | null
          last_usage_reset: string | null
          metadata: Json | null
          rate_limit_per_day: number | null
          rate_limit_per_minute: number | null
          updated_at: string | null
        }
        Insert: {
          api_name: string
          avg_response_time_ms?: number | null
          base_url: string
          created_at?: string | null
          current_usage_today?: number | null
          display_name: string
          error_rate_percent?: number | null
          id?: string
          is_active?: boolean | null
          is_production?: boolean | null
          last_health_check?: string | null
          last_health_status?: string | null
          last_usage_reset?: string | null
          metadata?: Json | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Update: {
          api_name?: string
          avg_response_time_ms?: number | null
          base_url?: string
          created_at?: string | null
          current_usage_today?: number | null
          display_name?: string
          error_rate_percent?: number | null
          id?: string
          is_active?: boolean | null
          is_production?: boolean | null
          last_health_check?: string | null
          last_health_status?: string | null
          last_usage_reset?: string | null
          metadata?: Json | null
          rate_limit_per_day?: number | null
          rate_limit_per_minute?: number | null
          updated_at?: string | null
        }
        Relationships: []
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
      api_integrations: {
        Row: {
          api_category: string | null
          api_name: string
          config: Json | null
          created_at: string | null
          error_count: number | null
          id: string
          last_checked: string | null
          next_check: string | null
          org_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          api_category?: string | null
          api_name: string
          config?: Json | null
          created_at?: string | null
          error_count?: number | null
          id?: string
          last_checked?: string | null
          next_check?: string | null
          org_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          api_category?: string | null
          api_name?: string
          config?: Json | null
          created_at?: string | null
          error_count?: number | null
          id?: string
          last_checked?: string | null
          next_check?: string | null
          org_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_integrations_org_id_fkey"
            columns: ["org_id"]
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
      api_quota_tracking: {
        Row: {
          api_name: string
          id: string
          last_updated: string | null
          org_id: string | null
          quota_limit: number | null
          quota_used: number | null
          reset_at: string | null
        }
        Insert: {
          api_name: string
          id?: string
          last_updated?: string | null
          org_id?: string | null
          quota_limit?: number | null
          quota_used?: number | null
          reset_at?: string | null
        }
        Update: {
          api_name?: string
          id?: string
          last_updated?: string | null
          org_id?: string | null
          quota_limit?: number | null
          quota_used?: number | null
          reset_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "api_quota_tracking_org_id_fkey"
            columns: ["org_id"]
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
      api_request_logs: {
        Row: {
          api_name: string
          created_at: string | null
          endpoint: string
          error_message: string | null
          id: string
          method: string | null
          organization_id: string | null
          request_params: Json | null
          response_preview: string | null
          response_time_ms: number | null
          status_code: number | null
          success: boolean | null
          user_id: string | null
        }
        Insert: {
          api_name: string
          created_at?: string | null
          endpoint: string
          error_message?: string | null
          id?: string
          method?: string | null
          organization_id?: string | null
          request_params?: Json | null
          response_preview?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          success?: boolean | null
          user_id?: string | null
        }
        Update: {
          api_name?: string
          created_at?: string | null
          endpoint?: string
          error_message?: string | null
          id?: string
          method?: string | null
          organization_id?: string | null
          request_params?: Json | null
          response_preview?: string | null
          response_time_ms?: number | null
          status_code?: number | null
          success?: boolean | null
          user_id?: string | null
        }
        Relationships: []
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
          entity_id: string | null
          entity_type: string | null
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
          entity_id?: string | null
          entity_type?: string | null
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
          entity_id?: string | null
          entity_type?: string | null
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
      autonomous_tasks: {
        Row: {
          actions: Json | null
          approved_at: string | null
          approved_by: string | null
          autonomy_level: number | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          decision_confidence: number | null
          decision_logic: Json | null
          description: string | null
          equipment_id: string | null
          error_message: string | null
          execution_logs: Json | null
          id: string
          metadata: Json | null
          mission_id: string | null
          name: string
          organization_id: string | null
          priority: string
          result: Json | null
          scheduled_at: string | null
          started_at: string | null
          status: string
          task_name: string | null
          task_type: string
          trigger_conditions: Json | null
          updated_at: string
        }
        Insert: {
          actions?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          autonomy_level?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          decision_confidence?: number | null
          decision_logic?: Json | null
          description?: string | null
          equipment_id?: string | null
          error_message?: string | null
          execution_logs?: Json | null
          id?: string
          metadata?: Json | null
          mission_id?: string | null
          name: string
          organization_id?: string | null
          priority?: string
          result?: Json | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          task_name?: string | null
          task_type: string
          trigger_conditions?: Json | null
          updated_at?: string
        }
        Update: {
          actions?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          autonomy_level?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          decision_confidence?: number | null
          decision_logic?: Json | null
          description?: string | null
          equipment_id?: string | null
          error_message?: string | null
          execution_logs?: Json | null
          id?: string
          metadata?: Json | null
          mission_id?: string | null
          name?: string
          organization_id?: string | null
          priority?: string
          result?: Json | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          task_name?: string | null
          task_type?: string
          trigger_conditions?: Json | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "autonomous_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      autonomy_configs: {
        Row: {
          allowed_task_types: string[] | null
          auto_approve_low_risk: boolean | null
          autonomy_level: number | null
          created_at: string | null
          entity_id: string | null
          entity_type: string
          id: string
          is_enabled: boolean | null
          notification_preferences: Json | null
          require_approval_threshold: number | null
          updated_at: string | null
        }
        Insert: {
          allowed_task_types?: string[] | null
          auto_approve_low_risk?: boolean | null
          autonomy_level?: number | null
          created_at?: string | null
          entity_id?: string | null
          entity_type: string
          id?: string
          is_enabled?: boolean | null
          notification_preferences?: Json | null
          require_approval_threshold?: number | null
          updated_at?: string | null
        }
        Update: {
          allowed_task_types?: string[] | null
          auto_approve_low_risk?: boolean | null
          autonomy_level?: number | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string
          id?: string
          is_enabled?: boolean | null
          notification_preferences?: Json | null
          require_approval_threshold?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      autonomy_decision_logs: {
        Row: {
          confidence_score: number | null
          decision_data: Json | null
          decision_type: string
          id: string
          reasoning: string | null
          task_id: string | null
          timestamp: string | null
        }
        Insert: {
          confidence_score?: number | null
          decision_data?: Json | null
          decision_type: string
          id?: string
          reasoning?: string | null
          task_id?: string | null
          timestamp?: string | null
        }
        Update: {
          confidence_score?: number | null
          decision_data?: Json | null
          decision_type?: string
          id?: string
          reasoning?: string | null
          task_id?: string | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "autonomy_decision_logs_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "autonomous_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      autonomy_metrics: {
        Row: {
          approved_tasks: number | null
          avg_completion_time_minutes: number | null
          avg_confidence_score: number | null
          created_at: string | null
          id: string
          metadata: Json | null
          metric_date: string
          rejected_tasks: number | null
          total_tasks: number | null
        }
        Insert: {
          approved_tasks?: number | null
          avg_completion_time_minutes?: number | null
          avg_confidence_score?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date: string
          rejected_tasks?: number | null
          total_tasks?: number | null
        }
        Update: {
          approved_tasks?: number | null
          avg_completion_time_minutes?: number | null
          avg_confidence_score?: number | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          metric_date?: string
          rejected_tasks?: number | null
          total_tasks?: number | null
        }
        Relationships: []
      }
      autonomy_rules: {
        Row: {
          actions: Json
          conditions: Json
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          organization_id: string | null
          priority: number
          rule_type: string
          updated_at: string
        }
        Insert: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          organization_id?: string | null
          priority?: number
          rule_type: string
          updated_at?: string
        }
        Update: {
          actions?: Json
          conditions?: Json
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          priority?: number
          rule_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "autonomy_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      backup_logs: {
        Row: {
          backup_type: string
          completed_at: string | null
          created_at: string
          duration_ms: number | null
          error_message: string | null
          id: string
          size_bytes: number | null
          status: string
          storage_location: string | null
          tables_backed_up: string[] | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          backup_type: string
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          size_bytes?: number | null
          status: string
          storage_location?: string | null
          tables_backed_up?: string[] | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          backup_type?: string
          completed_at?: string | null
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          size_bytes?: number | null
          status?: string
          storage_location?: string | null
          tables_backed_up?: string[] | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: []
      }
      behavioral_risk_assessments: {
        Row: {
          assessment_date: string | null
          behavior_score: number | null
          created_at: string | null
          created_by: string | null
          crew_member_id: string | null
          emotional_score: number | null
          id: string
          incident_history_score: number | null
          next_assessment_date: string | null
          organization_id: string | null
          recommendations: Json | null
          risk_level: string | null
          stress_fatigue_score: number | null
          total_risk_score: number | null
          vessel_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          behavior_score?: number | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          emotional_score?: number | null
          id?: string
          incident_history_score?: number | null
          next_assessment_date?: string | null
          organization_id?: string | null
          recommendations?: Json | null
          risk_level?: string | null
          stress_fatigue_score?: number | null
          total_risk_score?: number | null
          vessel_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          behavior_score?: number | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          emotional_score?: number | null
          id?: string
          incident_history_score?: number | null
          next_assessment_date?: string | null
          organization_id?: string | null
          recommendations?: Json | null
          risk_level?: string | null
          stress_fatigue_score?: number | null
          total_risk_score?: number | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "behavioral_risk_assessments_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavioral_risk_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "behavioral_risk_assessments_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      beta_email_logs: {
        Row: {
          created_at: string | null
          email_type: string
          error_message: string | null
          id: string
          recipient_email: string
          recipient_name: string | null
          resend_id: string | null
          sent_at: string | null
          status: string
          subject: string
        }
        Insert: {
          created_at?: string | null
          email_type: string
          error_message?: string | null
          id?: string
          recipient_email: string
          recipient_name?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject: string
        }
        Update: {
          created_at?: string | null
          email_type?: string
          error_message?: string | null
          id?: string
          recipient_email?: string
          recipient_name?: string | null
          resend_id?: string | null
          sent_at?: string | null
          status?: string
          subject?: string
        }
        Relationships: []
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
      brazilian_ports: {
        Row: {
          city: string
          created_at: string | null
          high_tide_threshold: number | null
          id: string
          is_monitored: boolean | null
          latitude: number
          longitude: number
          low_tide_threshold: number | null
          metadata: Json | null
          port_code: string
          port_name: string
          state: string
          timezone: string | null
        }
        Insert: {
          city: string
          created_at?: string | null
          high_tide_threshold?: number | null
          id?: string
          is_monitored?: boolean | null
          latitude: number
          longitude: number
          low_tide_threshold?: number | null
          metadata?: Json | null
          port_code: string
          port_name: string
          state: string
          timezone?: string | null
        }
        Update: {
          city?: string
          created_at?: string | null
          high_tide_threshold?: number | null
          id?: string
          is_monitored?: boolean | null
          latitude?: number
          longitude?: number
          low_tide_threshold?: number | null
          metadata?: Json | null
          port_code?: string
          port_name?: string
          state?: string
          timezone?: string | null
        }
        Relationships: []
      }
      broa_records: {
        Row: {
          affected_equipment: Json | null
          ai_cause_analysis: string | null
          broa_number: string
          cause_analysis: string | null
          corrective_actions: string | null
          created_at: string | null
          created_by: string | null
          description: string
          downtime_event_id: string | null
          id: string
          occurrence_date: string
          occurrence_time: string
          organization_id: string | null
          pdf_path: string | null
          preventive_actions: string | null
          sent_to_authorities_at: string | null
          signatures: Json | null
          status: string | null
          technical_analysis: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          affected_equipment?: Json | null
          ai_cause_analysis?: string | null
          broa_number: string
          cause_analysis?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          description: string
          downtime_event_id?: string | null
          id?: string
          occurrence_date: string
          occurrence_time: string
          organization_id?: string | null
          pdf_path?: string | null
          preventive_actions?: string | null
          sent_to_authorities_at?: string | null
          signatures?: Json | null
          status?: string | null
          technical_analysis?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          affected_equipment?: Json | null
          ai_cause_analysis?: string | null
          broa_number?: string
          cause_analysis?: string | null
          corrective_actions?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string
          downtime_event_id?: string | null
          id?: string
          occurrence_date?: string
          occurrence_time?: string
          organization_id?: string | null
          pdf_path?: string | null
          preventive_actions?: string | null
          sent_to_authorities_at?: string | null
          signatures?: Json | null
          status?: string | null
          technical_analysis?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "broa_records_downtime_event_id_fkey"
            columns: ["downtime_event_id"]
            isOneToOne: false
            referencedRelation: "downtime_events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broa_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "broa_records_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      cargo_operations: {
        Row: {
          ai_optimized: boolean | null
          containers_discharged: number | null
          containers_loaded: number | null
          created_at: string | null
          end_time: string | null
          id: string
          metadata: Json | null
          operation_type: string
          optimization_score: number | null
          organization_id: string | null
          port: string
          stability_gm: number | null
          start_time: string | null
          status: string | null
          updated_at: string | null
          utilization_percent: number | null
          vessel_id: string | null
        }
        Insert: {
          ai_optimized?: boolean | null
          containers_discharged?: number | null
          containers_loaded?: number | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          operation_type: string
          optimization_score?: number | null
          organization_id?: string | null
          port: string
          stability_gm?: number | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          utilization_percent?: number | null
          vessel_id?: string | null
        }
        Update: {
          ai_optimized?: boolean | null
          containers_discharged?: number | null
          containers_loaded?: number | null
          created_at?: string | null
          end_time?: string | null
          id?: string
          metadata?: Json | null
          operation_type?: string
          optimization_score?: number | null
          organization_id?: string | null
          port?: string
          stability_gm?: number | null
          start_time?: string | null
          status?: string | null
          updated_at?: string | null
          utilization_percent?: number | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cargo_operations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cargo_operations_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_courses: {
        Row: {
          applicable_ranks: string[] | null
          category: string | null
          content_type: string | null
          content_url: string | null
          created_at: string
          created_by: string | null
          description: string | null
          duration_minutes: number | null
          id: string
          is_active: boolean | null
          is_mandatory: boolean | null
          language: string | null
          organization_id: string | null
          passing_score: number | null
          prerequisites: string[] | null
          stcw_reference: string | null
          thumbnail_url: string | null
          title: string
          updated_at: string
          validity_months: number | null
          version: string | null
        }
        Insert: {
          applicable_ranks?: string[] | null
          category?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          language?: string | null
          organization_id?: string | null
          passing_score?: number | null
          prerequisites?: string[] | null
          stcw_reference?: string | null
          thumbnail_url?: string | null
          title: string
          updated_at?: string
          validity_months?: number | null
          version?: string | null
        }
        Update: {
          applicable_ranks?: string[] | null
          category?: string | null
          content_type?: string | null
          content_url?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          duration_minutes?: number | null
          id?: string
          is_active?: boolean | null
          is_mandatory?: boolean | null
          language?: string | null
          organization_id?: string | null
          passing_score?: number | null
          prerequisites?: string[] | null
          stcw_reference?: string | null
          thumbnail_url?: string | null
          title?: string
          updated_at?: string
          validity_months?: number | null
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cbt_courses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      cbt_progress: {
        Row: {
          attempts: number | null
          certificate_issued: boolean | null
          certificate_number: string | null
          completed_at: string | null
          course_id: string | null
          created_at: string
          crew_member_id: string | null
          expiry_date: string | null
          id: string
          last_accessed_at: string | null
          organization_id: string | null
          progress_percent: number | null
          score: number | null
          started_at: string | null
          status: string | null
          time_spent_minutes: number | null
          updated_at: string
        }
        Insert: {
          attempts?: number | null
          certificate_issued?: boolean | null
          certificate_number?: string | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          crew_member_id?: string | null
          expiry_date?: string | null
          id?: string
          last_accessed_at?: string | null
          organization_id?: string | null
          progress_percent?: number | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Update: {
          attempts?: number | null
          certificate_issued?: boolean | null
          certificate_number?: string | null
          completed_at?: string | null
          course_id?: string | null
          created_at?: string
          crew_member_id?: string | null
          expiry_date?: string | null
          id?: string
          last_accessed_at?: string | null
          organization_id?: string | null
          progress_percent?: number | null
          score?: number | null
          started_at?: string | null
          status?: string | null
          time_spent_minutes?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "cbt_progress_course_id_fkey"
            columns: ["course_id"]
            isOneToOne: false
            referencedRelation: "cbt_courses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_progress_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cbt_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      certificate_blockchain: {
        Row: {
          block_id: string
          certificate_data: Json
          created_at: string | null
          hash: string
          id: string
          previous_hash: string
          signature: string
        }
        Insert: {
          block_id: string
          certificate_data: Json
          created_at?: string | null
          hash: string
          id?: string
          previous_hash: string
          signature: string
        }
        Update: {
          block_id?: string
          certificate_data?: Json
          created_at?: string | null
          hash?: string
          id?: string
          previous_hash?: string
          signature?: string
        }
        Relationships: []
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
      channel_permissions: {
        Row: {
          channel_id: string
          channel_name: string
          channel_type: string
          created_at: string
          expires_at: string | null
          granted_at: string
          granted_by: string | null
          id: string
          is_active: boolean
          metadata: Json | null
          organization_id: string | null
          permission_level: string
          updated_at: string
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          channel_id: string
          channel_name: string
          channel_type?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          organization_id?: string | null
          permission_level?: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          channel_id?: string
          channel_name?: string
          channel_type?: string
          created_at?: string
          expires_at?: string | null
          granted_at?: string
          granted_by?: string | null
          id?: string
          is_active?: boolean
          metadata?: Json | null
          organization_id?: string | null
          permission_level?: string
          updated_at?: string
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "channel_permissions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "channel_permissions_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      charter_contracts: {
        Row: {
          charter_type: string
          charterer: string
          contract_document_url: string | null
          contract_number: string
          created_at: string | null
          currency: string | null
          daily_hire: number | null
          demurrage_rate: number | null
          despatch_rate: number | null
          end_date: string
          id: string
          metadata: Json | null
          off_hire_days: number | null
          organization_id: string | null
          owner: string
          payment_terms: string | null
          start_date: string
          status: string | null
          terms_conditions: Json | null
          total_value: number | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          charter_type: string
          charterer: string
          contract_document_url?: string | null
          contract_number: string
          created_at?: string | null
          currency?: string | null
          daily_hire?: number | null
          demurrage_rate?: number | null
          despatch_rate?: number | null
          end_date: string
          id?: string
          metadata?: Json | null
          off_hire_days?: number | null
          organization_id?: string | null
          owner: string
          payment_terms?: string | null
          start_date: string
          status?: string | null
          terms_conditions?: Json | null
          total_value?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          charter_type?: string
          charterer?: string
          contract_document_url?: string | null
          contract_number?: string
          created_at?: string | null
          currency?: string | null
          daily_hire?: number | null
          demurrage_rate?: number | null
          despatch_rate?: number | null
          end_date?: string
          id?: string
          metadata?: Json | null
          off_hire_days?: number | null
          organization_id?: string | null
          owner?: string
          payment_terms?: string | null
          start_date?: string
          status?: string | null
          terms_conditions?: Json | null
          total_value?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "charter_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "charter_contracts_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      checklist_records: {
        Row: {
          assigned_to: string | null
          checklist_type: string
          completed_at: string | null
          completed_by: string | null
          completed_items: number | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          items: Json
          metadata: Json | null
          name: string
          organization_id: string | null
          status: string
          total_items: number | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          checklist_type: string
          completed_at?: string | null
          completed_by?: string | null
          completed_items?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          items?: Json
          metadata?: Json | null
          name: string
          organization_id?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          checklist_type?: string
          completed_at?: string | null
          completed_by?: string | null
          completed_items?: number | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          items?: Json
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          status?: string
          total_items?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "checklist_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "checklist_records_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      class_surveys: {
        Row: {
          certificates_issued: string[] | null
          classification_society_id: string | null
          completed_date: string | null
          conditions_of_class: Json | null
          cost: number | null
          created_at: string
          documents: string[] | null
          due_date: string
          findings: Json | null
          id: string
          notes: string | null
          organization_id: string | null
          recommendations: Json | null
          status: string | null
          survey_location: string | null
          survey_name: string
          survey_type: string
          surveyor_name: string | null
          updated_at: string
          vessel_id: string | null
          window_end: string | null
          window_start: string | null
        }
        Insert: {
          certificates_issued?: string[] | null
          classification_society_id?: string | null
          completed_date?: string | null
          conditions_of_class?: Json | null
          cost?: number | null
          created_at?: string
          documents?: string[] | null
          due_date: string
          findings?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          recommendations?: Json | null
          status?: string | null
          survey_location?: string | null
          survey_name: string
          survey_type: string
          surveyor_name?: string | null
          updated_at?: string
          vessel_id?: string | null
          window_end?: string | null
          window_start?: string | null
        }
        Update: {
          certificates_issued?: string[] | null
          classification_society_id?: string | null
          completed_date?: string | null
          conditions_of_class?: Json | null
          cost?: number | null
          created_at?: string
          documents?: string[] | null
          due_date?: string
          findings?: Json | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          recommendations?: Json | null
          status?: string | null
          survey_location?: string | null
          survey_name?: string
          survey_type?: string
          surveyor_name?: string | null
          updated_at?: string
          vessel_id?: string | null
          window_end?: string | null
          window_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "class_surveys_classification_society_id_fkey"
            columns: ["classification_society_id"]
            isOneToOne: false
            referencedRelation: "classification_societies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_surveys_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "class_surveys_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      classification_societies: {
        Row: {
          code: string
          country: string | null
          created_at: string
          id: string
          is_iacs_member: boolean | null
          logo_url: string | null
          name: string
          website: string | null
        }
        Insert: {
          code: string
          country?: string | null
          created_at?: string
          id?: string
          is_iacs_member?: boolean | null
          logo_url?: string | null
          name: string
          website?: string | null
        }
        Update: {
          code?: string
          country?: string | null
          created_at?: string
          id?: string
          is_iacs_member?: boolean | null
          logo_url?: string | null
          name?: string
          website?: string | null
        }
        Relationships: []
      }
      clone_context_storage: {
        Row: {
          clone_id: string
          context_data: Json
          created_at: string
          id: string
          updated_at: string
        }
        Insert: {
          clone_id: string
          context_data?: Json
          created_at?: string
          id?: string
          updated_at?: string
        }
        Update: {
          clone_id?: string
          context_data?: Json
          created_at?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "clone_context_storage_clone_id_fkey"
            columns: ["clone_id"]
            isOneToOne: false
            referencedRelation: "clone_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      clone_registry: {
        Row: {
          capabilities: Json | null
          clone_name: string
          clone_type: string | null
          context_limit: number | null
          created_at: string | null
          id: string
          last_sync_at: string | null
          memory_snapshot: Json | null
          metadata: Json | null
          organization_id: string | null
          parent_id: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          capabilities?: Json | null
          clone_name: string
          clone_type?: string | null
          context_limit?: number | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          memory_snapshot?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          capabilities?: Json | null
          clone_name?: string
          clone_type?: string | null
          context_limit?: number | null
          created_at?: string | null
          id?: string
          last_sync_at?: string | null
          memory_snapshot?: Json | null
          metadata?: Json | null
          organization_id?: string | null
          parent_id?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clone_registry_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clone_snapshots: {
        Row: {
          context: Json | null
          created_at: string
          id: string
          llm_state: Json | null
          metadata: Json | null
          modules: Json | null
          organization_id: string | null
          timestamp: string
        }
        Insert: {
          context?: Json | null
          created_at?: string
          id?: string
          llm_state?: Json | null
          metadata?: Json | null
          modules?: Json | null
          organization_id?: string | null
          timestamp?: string
        }
        Update: {
          context?: Json | null
          created_at?: string
          id?: string
          llm_state?: Json | null
          metadata?: Json | null
          modules?: Json | null
          organization_id?: string | null
          timestamp?: string
        }
        Relationships: [
          {
            foreignKeyName: "clone_snapshots_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      clone_sync_log: {
        Row: {
          completed_at: string | null
          created_at: string | null
          error_message: string | null
          id: string
          rows_synced: number | null
          source_instance_id: string | null
          started_at: string | null
          status: string | null
          sync_type: string | null
          target_instance_id: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          rows_synced?: number | null
          source_instance_id?: string | null
          started_at?: string | null
          status?: string | null
          sync_type?: string | null
          target_instance_id?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          error_message?: string | null
          id?: string
          rows_synced?: number | null
          source_instance_id?: string | null
          started_at?: string | null
          status?: string | null
          sync_type?: string | null
          target_instance_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clone_sync_log_source_instance_id_fkey"
            columns: ["source_instance_id"]
            isOneToOne: false
            referencedRelation: "mirror_instances"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clone_sync_log_target_instance_id_fkey"
            columns: ["target_instance_id"]
            isOneToOne: false
            referencedRelation: "mirror_instances"
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
      compliance_ai_recommendations: {
        Row: {
          action_type: string | null
          applied_at: string | null
          applied_by: string | null
          category: string | null
          confidence: number | null
          created_at: string | null
          dismissed_reason: string | null
          expires_at: string | null
          generated_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          priority: string | null
          reasoning: string | null
          recommendation: string
          status: string | null
          suggested_action: Json | null
          target_id: string | null
          target_type: string
        }
        Insert: {
          action_type?: string | null
          applied_at?: string | null
          applied_by?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          dismissed_reason?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          reasoning?: string | null
          recommendation: string
          status?: string | null
          suggested_action?: Json | null
          target_id?: string | null
          target_type: string
        }
        Update: {
          action_type?: string | null
          applied_at?: string | null
          applied_by?: string | null
          category?: string | null
          confidence?: number | null
          created_at?: string | null
          dismissed_reason?: string | null
          expires_at?: string | null
          generated_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          reasoning?: string | null
          recommendation?: string
          status?: string | null
          suggested_action?: Json | null
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "compliance_ai_recommendations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_audit_logs: {
        Row: {
          audit_type: string | null
          created_at: string
          id: string
          level: string
          metadata: Json | null
          recommendations: Json | null
          rules_evaluated: Json | null
          score: number
          timestamp: string
          user_id: string | null
          vessel_id: string | null
          violations: Json | null
        }
        Insert: {
          audit_type?: string | null
          created_at?: string
          id?: string
          level: string
          metadata?: Json | null
          recommendations?: Json | null
          rules_evaluated?: Json | null
          score: number
          timestamp?: string
          user_id?: string | null
          vessel_id?: string | null
          violations?: Json | null
        }
        Update: {
          audit_type?: string | null
          created_at?: string
          id?: string
          level?: string
          metadata?: Json | null
          recommendations?: Json | null
          rules_evaluated?: Json | null
          score?: number
          timestamp?: string
          user_id?: string | null
          vessel_id?: string | null
          violations?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_audit_logs_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_audit_trail: {
        Row: {
          action: string
          actor_id: string | null
          actor_name: string | null
          created_at: string | null
          entity_id: string
          entity_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          new_values: Json | null
          old_values: Json | null
          organization_id: string | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_id?: string | null
          actor_name?: string | null
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          new_values?: Json | null
          old_values?: Json | null
          organization_id?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_audit_trail_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_evidences: {
        Row: {
          created_at: string | null
          description: string | null
          file_hash: string | null
          file_name: string | null
          file_size: number | null
          file_type: string | null
          file_url: string | null
          id: string
          organization_id: string | null
          related_risk_id: string | null
          related_rule_id: string | null
          review_notes: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          uploader_id: string | null
          validity_end: string | null
          validity_start: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          file_hash?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          organization_id?: string | null
          related_risk_id?: string | null
          related_rule_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          uploader_id?: string | null
          validity_end?: string | null
          validity_start?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          file_hash?: string | null
          file_name?: string | null
          file_size?: number | null
          file_type?: string | null
          file_url?: string | null
          id?: string
          organization_id?: string | null
          related_risk_id?: string | null
          related_rule_id?: string | null
          review_notes?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          uploader_id?: string | null
          validity_end?: string | null
          validity_start?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_evidences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidences_related_risk_id_fkey"
            columns: ["related_risk_id"]
            isOneToOne: false
            referencedRelation: "compliance_risks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_evidences_related_rule_id_fkey"
            columns: ["related_rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_items: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          evidence_urls: string[] | null
          id: string
          item_type: string
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          priority: string | null
          regulation: string | null
          status: string | null
          title: string
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          evidence_urls?: string[] | null
          id?: string
          item_type: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          priority?: string | null
          regulation?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          evidence_urls?: string[] | null
          id?: string
          item_type?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          priority?: string | null
          regulation?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_items_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_reports: {
        Row: {
          assigned_to: string | null
          attachments: Json | null
          category: string | null
          created_at: string | null
          description: string
          id: string
          is_anonymous: boolean | null
          metadata: Json | null
          organization_id: string | null
          report_number: string | null
          reporter_email: string | null
          reporter_name: string | null
          resolution: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          title: string | null
          updated_at: string | null
        }
        Insert: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          description: string
          id?: string
          is_anonymous?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          report_number?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Update: {
          assigned_to?: string | null
          attachments?: Json | null
          category?: string | null
          created_at?: string | null
          description?: string
          id?: string
          is_anonymous?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          report_number?: string | null
          reporter_email?: string | null
          reporter_name?: string | null
          resolution?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          title?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_reports_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_risks: {
        Row: {
          associated_rule_id: string | null
          category: string | null
          control_measures: Json | null
          created_at: string | null
          department: string | null
          description: string | null
          id: string
          impact: number | null
          mitigation: string | null
          organization_id: string | null
          owner_id: string | null
          probability: number | null
          review_date: string | null
          risk_score: number | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          associated_rule_id?: string | null
          category?: string | null
          control_measures?: Json | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          impact?: number | null
          mitigation?: string | null
          organization_id?: string | null
          owner_id?: string | null
          probability?: number | null
          review_date?: string | null
          risk_score?: number | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          associated_rule_id?: string | null
          category?: string | null
          control_measures?: Json | null
          created_at?: string | null
          department?: string | null
          description?: string | null
          id?: string
          impact?: number | null
          mitigation?: string | null
          organization_id?: string | null
          owner_id?: string | null
          probability?: number | null
          review_date?: string | null
          risk_score?: number | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_risks_associated_rule_id_fkey"
            columns: ["associated_rule_id"]
            isOneToOne: false
            referencedRelation: "compliance_rules"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "compliance_risks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_rules: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string | null
          effective_date: string | null
          expiry_date: string | null
          id: string
          jurisdiction: string | null
          legal_reference: string | null
          metadata: Json | null
          organization_id: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          jurisdiction?: string | null
          legal_reference?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          effective_date?: string | null
          expiry_date?: string | null
          id?: string
          jurisdiction?: string | null
          legal_reference?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_rules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_thirdparties: {
        Row: {
          adverse_media: boolean | null
          blocked_at: string | null
          blocked_reason: string | null
          check_results: Json | null
          country: string | null
          created_at: string | null
          document_number: string | null
          document_type: string | null
          id: string
          last_check_at: string | null
          legal_name: string | null
          name: string
          next_check_at: string | null
          notes: string | null
          organization_id: string | null
          pep_hit: boolean | null
          risk_level: string | null
          risk_score: number | null
          sanctions_hit: boolean | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          adverse_media?: boolean | null
          blocked_at?: string | null
          blocked_reason?: string | null
          check_results?: Json | null
          country?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          id?: string
          last_check_at?: string | null
          legal_name?: string | null
          name: string
          next_check_at?: string | null
          notes?: string | null
          organization_id?: string | null
          pep_hit?: boolean | null
          risk_level?: string | null
          risk_score?: number | null
          sanctions_hit?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          adverse_media?: boolean | null
          blocked_at?: string | null
          blocked_reason?: string | null
          check_results?: Json | null
          country?: string | null
          created_at?: string | null
          document_number?: string | null
          document_type?: string | null
          id?: string
          last_check_at?: string | null
          legal_name?: string | null
          name?: string
          next_check_at?: string | null
          notes?: string | null
          organization_id?: string | null
          pep_hit?: boolean | null
          risk_level?: string | null
          risk_score?: number | null
          sanctions_hit?: boolean | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_thirdparties_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_workflows: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          current_step: number | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string | null
          started_at: string | null
          status: string | null
          steps: Json | null
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string | null
          workflow_type: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id?: string | null
          started_at?: string | null
          status?: string | null
          steps?: Json | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          workflow_type?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          current_step?: number | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          started_at?: string | null
          status?: string | null
          steps?: Json | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string | null
          workflow_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      containers: {
        Row: {
          booking_reference: string | null
          cargo_description: string | null
          container_number: string
          container_type: string
          created_at: string | null
          dangerous_goods: boolean | null
          dg_class: string | null
          dg_un_number: string | null
          discharge_port: string | null
          id: string
          loading_port: string | null
          operation_id: string | null
          organization_id: string | null
          position: string | null
          seal_number: string | null
          size: string
          status: string | null
          updated_at: string | null
          vessel_id: string | null
          weight_kg: number
        }
        Insert: {
          booking_reference?: string | null
          cargo_description?: string | null
          container_number: string
          container_type: string
          created_at?: string | null
          dangerous_goods?: boolean | null
          dg_class?: string | null
          dg_un_number?: string | null
          discharge_port?: string | null
          id?: string
          loading_port?: string | null
          operation_id?: string | null
          organization_id?: string | null
          position?: string | null
          seal_number?: string | null
          size: string
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
          weight_kg: number
        }
        Update: {
          booking_reference?: string | null
          cargo_description?: string | null
          container_number?: string
          container_type?: string
          created_at?: string | null
          dangerous_goods?: boolean | null
          dg_class?: string | null
          dg_un_number?: string | null
          discharge_port?: string | null
          id?: string
          loading_port?: string | null
          operation_id?: string | null
          organization_id?: string | null
          position?: string | null
          seal_number?: string | null
          size?: string
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
          weight_kg?: number
        }
        Relationships: [
          {
            foreignKeyName: "containers_operation_id_fkey"
            columns: ["operation_id"]
            isOneToOne: false
            referencedRelation: "cargo_operations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "containers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "containers_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      context_history: {
        Row: {
          confidence_score: number | null
          context_key: string
          context_type: string
          context_value: Json | null
          created_at: string
          expires_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          source_module: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          confidence_score?: number | null
          context_key: string
          context_type: string
          context_value?: Json | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          source_module?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          confidence_score?: number | null
          context_key?: string
          context_type?: string
          context_value?: Json | null
          created_at?: string
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          source_module?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "context_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      coordination_agents: {
        Row: {
          agent_name: string
          agent_type: string
          capabilities: string[] | null
          created_at: string
          current_task_count: number | null
          id: string
          last_heartbeat: string | null
          max_concurrent_tasks: number | null
          metadata: Json | null
          performance_score: number | null
          priority_level: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          agent_name: string
          agent_type: string
          capabilities?: string[] | null
          created_at?: string
          current_task_count?: number | null
          id?: string
          last_heartbeat?: string | null
          max_concurrent_tasks?: number | null
          metadata?: Json | null
          performance_score?: number | null
          priority_level?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          agent_name?: string
          agent_type?: string
          capabilities?: string[] | null
          created_at?: string
          current_task_count?: number | null
          id?: string
          last_heartbeat?: string | null
          max_concurrent_tasks?: number | null
          metadata?: Json | null
          performance_score?: number | null
          priority_level?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      coordination_decisions: {
        Row: {
          agent_id: string | null
          confidence_score: number | null
          created_at: string
          decision_data: Json
          decision_type: string
          execution_time_ms: number | null
          id: string
          outcome: string | null
          reasoning: string | null
          task_id: string | null
        }
        Insert: {
          agent_id?: string | null
          confidence_score?: number | null
          created_at?: string
          decision_data: Json
          decision_type: string
          execution_time_ms?: number | null
          id?: string
          outcome?: string | null
          reasoning?: string | null
          task_id?: string | null
        }
        Update: {
          agent_id?: string | null
          confidence_score?: number | null
          created_at?: string
          decision_data?: Json
          decision_type?: string
          execution_time_ms?: number | null
          id?: string
          outcome?: string | null
          reasoning?: string | null
          task_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "coordination_decisions_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "coordination_agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coordination_decisions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "coordination_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      coordination_tasks: {
        Row: {
          assigned_agent_id: string | null
          completed_at: string | null
          created_at: string
          deadline: string | null
          dependencies: string[] | null
          description: string | null
          error_message: string | null
          id: string
          input_data: Json | null
          max_retries: number | null
          metadata: Json | null
          output_data: Json | null
          priority: number | null
          retry_count: number | null
          started_at: string | null
          status: string | null
          task_name: string
          task_type: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          dependencies?: string[] | null
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          max_retries?: number | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          task_name: string
          task_type: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          completed_at?: string | null
          created_at?: string
          deadline?: string | null
          dependencies?: string[] | null
          description?: string | null
          error_message?: string | null
          id?: string
          input_data?: Json | null
          max_retries?: number | null
          metadata?: Json | null
          output_data?: Json | null
          priority?: number | null
          retry_count?: number | null
          started_at?: string | null
          status?: string | null
          task_name?: string
          task_type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coordination_tasks_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "coordination_agents"
            referencedColumns: ["id"]
          },
        ]
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
      crew_competency_assessments: {
        Row: {
          assessment_date: string
          assessor_id: string | null
          assessor_name: string | null
          competency_id: string | null
          created_at: string
          crew_member_id: string | null
          evidence_reference: string | null
          evidence_type: string | null
          expiry_date: string | null
          id: string
          notes: string | null
          organization_id: string | null
          score: number | null
          status: string | null
          updated_at: string
        }
        Insert: {
          assessment_date: string
          assessor_id?: string | null
          assessor_name?: string | null
          competency_id?: string | null
          created_at?: string
          crew_member_id?: string | null
          evidence_reference?: string | null
          evidence_type?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          assessment_date?: string
          assessor_id?: string | null
          assessor_name?: string | null
          competency_id?: string | null
          created_at?: string
          crew_member_id?: string | null
          evidence_reference?: string | null
          evidence_type?: string | null
          expiry_date?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crew_competency_assessments_competency_id_fkey"
            columns: ["competency_id"]
            isOneToOne: false
            referencedRelation: "stcw_competencies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_competency_assessments_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_competency_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      crew_emotional_intelligence: {
        Row: {
          created_at: string | null
          created_by: string | null
          crew_member_id: string | null
          empathy_score: number | null
          id: string
          motivation_score: number | null
          organization_id: string | null
          recommendations: Json | null
          self_awareness_score: number | null
          self_regulation_score: number | null
          social_skills_score: number | null
          test_date: string | null
          total_eq_score: number | null
          trend: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          empathy_score?: number | null
          id?: string
          motivation_score?: number | null
          organization_id?: string | null
          recommendations?: Json | null
          self_awareness_score?: number | null
          self_regulation_score?: number | null
          social_skills_score?: number | null
          test_date?: string | null
          total_eq_score?: number | null
          trend?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          empathy_score?: number | null
          id?: string
          motivation_score?: number | null
          organization_id?: string | null
          recommendations?: Json | null
          self_awareness_score?: number | null
          self_regulation_score?: number | null
          social_skills_score?: number | null
          test_date?: string | null
          total_eq_score?: number | null
          trend?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_emotional_intelligence_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_emotional_intelligence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_emotional_intelligence_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      crew_health_checkins: {
        Row: {
          created_at: string
          crew_member_name: string | null
          energy_level: number
          id: string
          mood: number
          notes: string | null
          physical_health: number | null
          sleep_quality: number
          social_interaction: number | null
          stress_level: number
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          crew_member_name?: string | null
          energy_level: number
          id?: string
          mood: number
          notes?: string | null
          physical_health?: number | null
          sleep_quality: number
          social_interaction?: number | null
          stress_level: number
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          crew_member_name?: string | null
          energy_level?: number
          id?: string
          mood?: number
          notes?: string | null
          physical_health?: number | null
          sleep_quality?: number
          social_interaction?: number | null
          stress_level?: number
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: []
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
      crew_learning_progress: {
        Row: {
          completed_modules: Json | null
          created_at: string | null
          crew_member_id: string
          current_level: string | null
          id: string
          last_activity_at: string | null
          organization_id: string
          progress_percentage: number | null
          topic: string
          total_time_minutes: number | null
          updated_at: string | null
        }
        Insert: {
          completed_modules?: Json | null
          created_at?: string | null
          crew_member_id: string
          current_level?: string | null
          id?: string
          last_activity_at?: string | null
          organization_id: string
          progress_percentage?: number | null
          topic: string
          total_time_minutes?: number | null
          updated_at?: string | null
        }
        Update: {
          completed_modules?: Json | null
          created_at?: string | null
          crew_member_id?: string
          current_level?: string | null
          id?: string
          last_activity_at?: string | null
          organization_id?: string
          progress_percentage?: number | null
          topic?: string
          total_time_minutes?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_learning_progress_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_learning_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      crew_payroll: {
        Row: {
          allotments: Json | null
          allowances: Json | null
          approved_at: string | null
          approved_by: string | null
          bank_reference: string | null
          base_salary: number
          bonuses: Json | null
          created_at: string
          crew_member_id: string | null
          currency: string | null
          days_onboard: number | null
          deductions: Json | null
          gross_pay: number | null
          id: string
          net_pay: number | null
          notes: string | null
          organization_id: string | null
          overtime_amount: number | null
          overtime_hours: number | null
          overtime_rate: number | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          payroll_period_end: string
          payroll_period_start: string
          pension_contribution: number | null
          tax_amount: number | null
          union_dues: number | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          allotments?: Json | null
          allowances?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          bank_reference?: string | null
          base_salary: number
          bonuses?: Json | null
          created_at?: string
          crew_member_id?: string | null
          currency?: string | null
          days_onboard?: number | null
          deductions?: Json | null
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          notes?: string | null
          organization_id?: string | null
          overtime_amount?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payroll_period_end: string
          payroll_period_start: string
          pension_contribution?: number | null
          tax_amount?: number | null
          union_dues?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          allotments?: Json | null
          allowances?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          bank_reference?: string | null
          base_salary?: number
          bonuses?: Json | null
          created_at?: string
          crew_member_id?: string | null
          currency?: string | null
          days_onboard?: number | null
          deductions?: Json | null
          gross_pay?: number | null
          id?: string
          net_pay?: number | null
          notes?: string | null
          organization_id?: string | null
          overtime_amount?: number | null
          overtime_hours?: number | null
          overtime_rate?: number | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          payroll_period_end?: string
          payroll_period_start?: string
          pension_contribution?: number | null
          tax_amount?: number | null
          union_dues?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_payroll_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_payroll_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_payroll_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_performance: {
        Row: {
          created_at: string
          crew_member_id: string | null
          crew_member_name: string | null
          evaluation_period_end: string
          evaluation_period_start: string
          evaluator_id: string | null
          evaluator_name: string | null
          id: string
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          overall_performance_rating: number | null
          safety_compliance_score: number | null
          status: string | null
          teamwork_score: number | null
          technical_skills_score: number | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          crew_member_id?: string | null
          crew_member_name?: string | null
          evaluation_period_end?: string
          evaluation_period_start?: string
          evaluator_id?: string | null
          evaluator_name?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          overall_performance_rating?: number | null
          safety_compliance_score?: number | null
          status?: string | null
          teamwork_score?: number | null
          technical_skills_score?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          crew_member_id?: string | null
          crew_member_name?: string | null
          evaluation_period_end?: string
          evaluation_period_start?: string
          evaluator_id?: string | null
          evaluator_name?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          overall_performance_rating?: number | null
          safety_compliance_score?: number | null
          status?: string | null
          teamwork_score?: number | null
          technical_skills_score?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_performance_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_performance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_performance_vessel_id_fkey"
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
      crew_training_quizzes: {
        Row: {
          ai_generated: boolean | null
          category: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          id: string
          organization_id: string
          passing_score: number | null
          questions: Json
          time_limit_minutes: number | null
          title: string
          updated_at: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          organization_id: string
          passing_score?: number | null
          questions: Json
          time_limit_minutes?: number | null
          title: string
          updated_at?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          id?: string
          organization_id?: string
          passing_score?: number | null
          questions?: Json
          time_limit_minutes?: number | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_training_quizzes_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_training_quizzes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      crew_training_results: {
        Row: {
          answers: Json
          completed_at: string | null
          created_at: string | null
          crew_member_id: string
          id: string
          organization_id: string
          passed: boolean
          quiz_id: string
          score: number
          time_taken_minutes: number | null
        }
        Insert: {
          answers: Json
          completed_at?: string | null
          created_at?: string | null
          crew_member_id: string
          id?: string
          organization_id: string
          passed: boolean
          quiz_id: string
          score: number
          time_taken_minutes?: number | null
        }
        Update: {
          answers?: Json
          completed_at?: string | null
          created_at?: string | null
          crew_member_id?: string
          id?: string
          organization_id?: string
          passed?: boolean
          quiz_id?: string
          score?: number
          time_taken_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "crew_training_results_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_training_results_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crew_training_results_quiz_id_fkey"
            columns: ["quiz_id"]
            isOneToOne: false
            referencedRelation: "crew_training_quizzes"
            referencedColumns: ["id"]
          },
        ]
      }
      cron_execution_logs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          duration_ms: number | null
          error_message: string | null
          id: string
          job_name: string
          result: Json | null
          started_at: string | null
          status: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          job_name: string
          result?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          duration_ms?: number | null
          error_message?: string | null
          id?: string
          job_name?: string
          result?: Json | null
          started_at?: string | null
          status?: string | null
        }
        Relationships: []
      }
      cts_conformity_checks: {
        Row: {
          ai_analysis: Json | null
          check_date: string | null
          checked_by: string | null
          corrective_actions: Json | null
          corrective_actions_required: boolean | null
          created_at: string | null
          cts_record_id: string | null
          id: string
          next_check_date: string | null
          non_conformities: Json | null
          organization_id: string | null
          overall_status: string | null
          risk_level: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          check_date?: string | null
          checked_by?: string | null
          corrective_actions?: Json | null
          corrective_actions_required?: boolean | null
          created_at?: string | null
          cts_record_id?: string | null
          id?: string
          next_check_date?: string | null
          non_conformities?: Json | null
          organization_id?: string | null
          overall_status?: string | null
          risk_level?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          check_date?: string | null
          checked_by?: string | null
          corrective_actions?: Json | null
          corrective_actions_required?: boolean | null
          created_at?: string | null
          cts_record_id?: string | null
          id?: string
          next_check_date?: string | null
          non_conformities?: Json | null
          organization_id?: string | null
          overall_status?: string | null
          risk_level?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cts_conformity_checks_cts_record_id_fkey"
            columns: ["cts_record_id"]
            isOneToOne: false
            referencedRelation: "cts_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cts_conformity_checks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cts_conformity_checks_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      cts_records: {
        Row: {
          certification_docs: Json | null
          certified_equipment: Json | null
          classification_society: string | null
          created_at: string | null
          created_by: string | null
          cts_number: string
          expiry_date: string
          flag_state: string
          id: string
          issue_date: string
          organization_id: string | null
          required_positions: Json | null
          status: string | null
          updated_at: string | null
          vessel_categories: Json | null
          vessel_id: string | null
        }
        Insert: {
          certification_docs?: Json | null
          certified_equipment?: Json | null
          classification_society?: string | null
          created_at?: string | null
          created_by?: string | null
          cts_number: string
          expiry_date: string
          flag_state: string
          id?: string
          issue_date: string
          organization_id?: string | null
          required_positions?: Json | null
          status?: string | null
          updated_at?: string | null
          vessel_categories?: Json | null
          vessel_id?: string | null
        }
        Update: {
          certification_docs?: Json | null
          certified_equipment?: Json | null
          classification_society?: string | null
          created_at?: string | null
          created_by?: string | null
          cts_number?: string
          expiry_date?: string
          flag_state?: string
          id?: string
          issue_date?: string
          organization_id?: string | null
          required_positions?: Json | null
          status?: string | null
          updated_at?: string | null
          vessel_categories?: Json | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "cts_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "cts_records_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      document_approvals: {
        Row: {
          approver_id: string | null
          approver_name: string | null
          approver_role: string | null
          comments: string | null
          created_at: string | null
          decision: string | null
          document_id: string | null
          id: string
          ip_address: unknown
          required_role: string | null
          signature_data: Json | null
          signed_at: string | null
          step_name: string
          step_order: number
          version: number
        }
        Insert: {
          approver_id?: string | null
          approver_name?: string | null
          approver_role?: string | null
          comments?: string | null
          created_at?: string | null
          decision?: string | null
          document_id?: string | null
          id?: string
          ip_address?: unknown
          required_role?: string | null
          signature_data?: Json | null
          signed_at?: string | null
          step_name: string
          step_order: number
          version: number
        }
        Update: {
          approver_id?: string | null
          approver_name?: string | null
          approver_role?: string | null
          comments?: string | null
          created_at?: string | null
          decision?: string | null
          document_id?: string | null
          id?: string
          ip_address?: unknown
          required_role?: string | null
          signature_data?: Json | null
          signed_at?: string | null
          step_name?: string
          step_order?: number
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_approvals_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      document_distribution: {
        Row: {
          access_count: number | null
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledgment_signature: Json | null
          distributed_at: string | null
          distributed_by: string | null
          distribution_method: string | null
          document_id: string | null
          first_accessed_at: string | null
          id: string
          recipient_id: string | null
          recipient_name: string | null
          recipient_type: string | null
          version: number
        }
        Insert: {
          access_count?: number | null
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledgment_signature?: Json | null
          distributed_at?: string | null
          distributed_by?: string | null
          distribution_method?: string | null
          document_id?: string | null
          first_accessed_at?: string | null
          id?: string
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_type?: string | null
          version: number
        }
        Update: {
          access_count?: number | null
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledgment_signature?: Json | null
          distributed_at?: string | null
          distributed_by?: string | null
          distribution_method?: string | null
          document_id?: string | null
          first_accessed_at?: string | null
          id?: string
          recipient_id?: string | null
          recipient_name?: string | null
          recipient_type?: string | null
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_distribution_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      document_processing_queue: {
        Row: {
          attempts: number | null
          completed_at: string | null
          created_at: string
          created_by: string | null
          document_id: string
          error_message: string | null
          file_name: string
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          max_attempts: number | null
          options: Json | null
          organization_id: string | null
          priority: number | null
          processor_type: string | null
          result: Json | null
          scheduled_at: string | null
          started_at: string | null
          status: string
          updated_at: string
        }
        Insert: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          document_id: string
          error_message?: string | null
          file_name: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          max_attempts?: number | null
          options?: Json | null
          organization_id?: string | null
          priority?: number | null
          processor_type?: string | null
          result?: Json | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          attempts?: number | null
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string
          error_message?: string | null
          file_name?: string
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          max_attempts?: number | null
          options?: Json | null
          organization_id?: string | null
          priority?: number | null
          processor_type?: string | null
          result?: Json | null
          scheduled_at?: string | null
          started_at?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      document_registry: {
        Row: {
          category: Database["public"]["Enums"]["document_category"]
          checksum: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          document_number: string
          effective_date: string | null
          expiry_date: string | null
          file_path: string | null
          file_size: number | null
          file_type: string | null
          id: string
          is_current_version: boolean | null
          ism_code_reference: string | null
          marpol_reference: string | null
          metadata: Json | null
          mlc_reference: string | null
          organization_id: string | null
          parent_document_id: string | null
          review_date: string | null
          revision_number: string | null
          solas_reference: string | null
          status: Database["public"]["Enums"]["approval_status"] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          version: number
          vessel_id: string | null
        }
        Insert: {
          category: Database["public"]["Enums"]["document_category"]
          checksum?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_number: string
          effective_date?: string | null
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_current_version?: boolean | null
          ism_code_reference?: string | null
          marpol_reference?: string | null
          metadata?: Json | null
          mlc_reference?: string | null
          organization_id?: string | null
          parent_document_id?: string | null
          review_date?: string | null
          revision_number?: string | null
          solas_reference?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          version?: number
          vessel_id?: string | null
        }
        Update: {
          category?: Database["public"]["Enums"]["document_category"]
          checksum?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_number?: string
          effective_date?: string | null
          expiry_date?: string | null
          file_path?: string | null
          file_size?: number | null
          file_type?: string | null
          id?: string
          is_current_version?: boolean | null
          ism_code_reference?: string | null
          marpol_reference?: string | null
          metadata?: Json | null
          mlc_reference?: string | null
          organization_id?: string | null
          parent_document_id?: string | null
          review_date?: string | null
          revision_number?: string | null
          solas_reference?: string | null
          status?: Database["public"]["Enums"]["approval_status"] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          version?: number
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_registry_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_registry_parent_document_id_fkey"
            columns: ["parent_document_id"]
            isOneToOne: false
            referencedRelation: "document_registry"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_registry_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
      document_versions: {
        Row: {
          change_summary: string | null
          changed_at: string | null
          changed_by: string | null
          checksum: string | null
          document_id: string | null
          document_snapshot: Json | null
          file_path: string
          file_size: number | null
          id: string
          version: number
        }
        Insert: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by?: string | null
          checksum?: string | null
          document_id?: string | null
          document_snapshot?: Json | null
          file_path: string
          file_size?: number | null
          id?: string
          version: number
        }
        Update: {
          change_summary?: string | null
          changed_at?: string | null
          changed_by?: string | null
          checksum?: string | null
          document_id?: string | null
          document_snapshot?: Json | null
          file_path?: string
          file_size?: number | null
          id?: string
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "document_versions_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "document_registry"
            referencedColumns: ["id"]
          },
        ]
      }
      downtime_events: {
        Row: {
          ai_analysis: Json | null
          approved_at: string | null
          approved_by: string | null
          contract_id: string | null
          created_at: string | null
          created_by: string | null
          duration_hours: number | null
          end_time: string | null
          evidence_files: Json | null
          id: string
          impact_level: string | null
          justification_required: boolean | null
          justification_status: string | null
          justification_text: string | null
          organization_id: string | null
          reason: string
          reason_category: string | null
          start_time: string
          system_affected: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_hours?: number | null
          end_time?: string | null
          evidence_files?: Json | null
          id?: string
          impact_level?: string | null
          justification_required?: boolean | null
          justification_status?: string | null
          justification_text?: string | null
          organization_id?: string | null
          reason: string
          reason_category?: string | null
          start_time: string
          system_affected?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          approved_at?: string | null
          approved_by?: string | null
          contract_id?: string | null
          created_at?: string | null
          created_by?: string | null
          duration_hours?: number | null
          end_time?: string | null
          evidence_files?: Json | null
          id?: string
          impact_level?: string | null
          justification_required?: boolean | null
          justification_status?: string | null
          justification_text?: string | null
          organization_id?: string | null
          reason?: string
          reason_category?: string | null
          start_time?: string
          system_affected?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "downtime_events_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "vessel_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "downtime_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "downtime_events_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_academy_progress: {
        Row: {
          average_score: number | null
          category: string
          completed_at: string | null
          completed_lessons: number | null
          created_at: string | null
          id: string
          last_lesson_at: string | null
          module_id: string
          module_name: string
          organization_id: string | null
          progress_percent: number | null
          quiz_scores: Json | null
          time_spent_minutes: number | null
          total_lessons: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          average_score?: number | null
          category: string
          completed_at?: string | null
          completed_lessons?: number | null
          created_at?: string | null
          id?: string
          last_lesson_at?: string | null
          module_id: string
          module_name: string
          organization_id?: string | null
          progress_percent?: number | null
          quiz_scores?: Json | null
          time_spent_minutes?: number | null
          total_lessons?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          average_score?: number | null
          category?: string
          completed_at?: string | null
          completed_lessons?: number | null
          created_at?: string | null
          id?: string
          last_lesson_at?: string | null
          module_id?: string
          module_name?: string
          organization_id?: string | null
          progress_percent?: number | null
          quiz_scores?: Json | null
          time_spent_minutes?: number | null
          total_lessons?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_academy_progress_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_incidents: {
        Row: {
          created_at: string | null
          dp_class: string | null
          id: string
          incident_date: string
          link: string | null
          location: string | null
          root_cause: string | null
          severity: string | null
          source: string | null
          status: string | null
          summary: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          vessel: string | null
        }
        Insert: {
          created_at?: string | null
          dp_class?: string | null
          id: string
          incident_date: string
          link?: string | null
          location?: string | null
          root_cause?: string | null
          severity?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          vessel?: string | null
        }
        Update: {
          created_at?: string | null
          dp_class?: string | null
          id?: string
          incident_date?: string
          link?: string | null
          location?: string | null
          root_cause?: string | null
          severity?: string | null
          source?: string | null
          status?: string | null
          summary?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          vessel?: string | null
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
      dp_logbook_entries: {
        Row: {
          ai_response: string | null
          bookmarked: boolean | null
          content: string | null
          created_at: string | null
          entry_type: string
          id: string
          importance: string | null
          metadata: Json | null
          organization_id: string | null
          related_topics: string[] | null
          tags: string[] | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          ai_response?: string | null
          bookmarked?: boolean | null
          content?: string | null
          created_at?: string | null
          entry_type: string
          id?: string
          importance?: string | null
          metadata?: Json | null
          organization_id?: string | null
          related_topics?: string[] | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          ai_response?: string | null
          bookmarked?: boolean | null
          content?: string | null
          created_at?: string | null
          entry_type?: string
          id?: string
          importance?: string | null
          metadata?: Json | null
          organization_id?: string | null
          related_topics?: string[] | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_logbook_entries_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_mentor_sessions: {
        Row: {
          completed_at: string | null
          context: Json | null
          created_at: string | null
          difficulty_level: string | null
          id: string
          messages: Json | null
          organization_id: string | null
          performance_score: number | null
          session_type: string
          topic: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          messages?: Json | null
          organization_id?: string | null
          performance_score?: number | null
          session_type?: string
          topic?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          completed_at?: string | null
          context?: Json | null
          created_at?: string | null
          difficulty_level?: string | null
          id?: string
          messages?: Json | null
          organization_id?: string | null
          performance_score?: number | null
          session_type?: string
          topic?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_mentor_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_proficiency_assessments: {
        Row: {
          ai_evaluation: Json | null
          areas_for_improvement: string[] | null
          assessment_type: string
          assessor_notes: string | null
          category_scores: Json
          created_at: string | null
          id: string
          next_assessment_date: string | null
          organization_id: string | null
          overall_level: string
          recommended_training: Json | null
          strengths: string[] | null
          user_id: string | null
        }
        Insert: {
          ai_evaluation?: Json | null
          areas_for_improvement?: string[] | null
          assessment_type: string
          assessor_notes?: string | null
          category_scores?: Json
          created_at?: string | null
          id?: string
          next_assessment_date?: string | null
          organization_id?: string | null
          overall_level: string
          recommended_training?: Json | null
          strengths?: string[] | null
          user_id?: string | null
        }
        Update: {
          ai_evaluation?: Json | null
          areas_for_improvement?: string[] | null
          assessment_type?: string
          assessor_notes?: string | null
          category_scores?: Json
          created_at?: string | null
          id?: string
          next_assessment_date?: string | null
          organization_id?: string | null
          overall_level?: string
          recommended_training?: Json | null
          strengths?: string[] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_proficiency_assessments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_qa_repository: {
        Row: {
          answer: string
          category: string
          created_at: string | null
          created_by: string | null
          difficulty_level: string | null
          helpful_votes: number | null
          id: string
          is_featured: boolean | null
          organization_id: string | null
          question: string
          regulatory_references: string[] | null
          related_documents: string[] | null
          subcategory: string | null
          tags: string[] | null
          updated_at: string | null
          view_count: number | null
        }
        Insert: {
          answer: string
          category: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          helpful_votes?: number | null
          id?: string
          is_featured?: boolean | null
          organization_id?: string | null
          question: string
          regulatory_references?: string[] | null
          related_documents?: string[] | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          view_count?: number | null
        }
        Update: {
          answer?: string
          category?: string
          created_at?: string | null
          created_by?: string | null
          difficulty_level?: string | null
          helpful_votes?: number | null
          id?: string
          is_featured?: boolean | null
          organization_id?: string | null
          question?: string
          regulatory_references?: string[] | null
          related_documents?: string[] | null
          subcategory?: string | null
          tags?: string[] | null
          updated_at?: string | null
          view_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_qa_repository_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_quizzes: {
        Row: {
          answers: Json | null
          completed_at: string | null
          correct_count: number | null
          created_at: string | null
          feedback: Json | null
          id: string
          organization_id: string | null
          passed: boolean | null
          questions: Json
          quiz_type: string
          score: number | null
          time_limit_minutes: number | null
          time_spent_minutes: number | null
          topic: string
          total_questions: number
          user_id: string | null
        }
        Insert: {
          answers?: Json | null
          completed_at?: string | null
          correct_count?: number | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          organization_id?: string | null
          passed?: boolean | null
          questions?: Json
          quiz_type: string
          score?: number | null
          time_limit_minutes?: number | null
          time_spent_minutes?: number | null
          topic: string
          total_questions: number
          user_id?: string | null
        }
        Update: {
          answers?: Json | null
          completed_at?: string | null
          correct_count?: number | null
          created_at?: string | null
          feedback?: Json | null
          id?: string
          organization_id?: string | null
          passed?: boolean | null
          questions?: Json
          quiz_type?: string
          score?: number | null
          time_limit_minutes?: number | null
          time_spent_minutes?: number | null
          topic?: string
          total_questions?: number
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_quizzes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      dp_simulations: {
        Row: {
          ai_evaluation: Json | null
          completed_at: string | null
          created_at: string | null
          difficulty: string | null
          failure_events: Json | null
          feedback: string | null
          id: string
          initial_conditions: Json
          organization_id: string | null
          passed: boolean | null
          performance_score: number | null
          scenario_name: string
          scenario_type: string
          time_to_resolve_seconds: number | null
          user_decisions: Json | null
          user_id: string | null
        }
        Insert: {
          ai_evaluation?: Json | null
          completed_at?: string | null
          created_at?: string | null
          difficulty?: string | null
          failure_events?: Json | null
          feedback?: string | null
          id?: string
          initial_conditions?: Json
          organization_id?: string | null
          passed?: boolean | null
          performance_score?: number | null
          scenario_name: string
          scenario_type: string
          time_to_resolve_seconds?: number | null
          user_decisions?: Json | null
          user_id?: string | null
        }
        Update: {
          ai_evaluation?: Json | null
          completed_at?: string | null
          created_at?: string | null
          difficulty?: string | null
          failure_events?: Json | null
          feedback?: string | null
          id?: string
          initial_conditions?: Json
          organization_id?: string | null
          passed?: boolean | null
          performance_score?: number | null
          scenario_name?: string
          scenario_type?: string
          time_to_resolve_seconds?: number | null
          user_decisions?: Json | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "dp_simulations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      drill_corrective_actions: {
        Row: {
          action_description: string
          action_title: string
          ai_generated: boolean | null
          assigned_to: string | null
          category: string | null
          completed_at: string | null
          completion_notes: string | null
          created_at: string | null
          created_by: string | null
          drill_id: string | null
          due_date: string | null
          evaluation_id: string | null
          evidence_urls: Json | null
          id: string
          organization_id: string
          priority: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          action_description: string
          action_title: string
          ai_generated?: boolean | null
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          drill_id?: string | null
          due_date?: string | null
          evaluation_id?: string | null
          evidence_urls?: Json | null
          id?: string
          organization_id: string
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          action_description?: string
          action_title?: string
          ai_generated?: boolean | null
          assigned_to?: string | null
          category?: string | null
          completed_at?: string | null
          completion_notes?: string | null
          created_at?: string | null
          created_by?: string | null
          drill_id?: string | null
          due_date?: string | null
          evaluation_id?: string | null
          evidence_urls?: Json | null
          id?: string
          organization_id?: string
          priority?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "drill_corrective_actions_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_corrective_actions_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_corrective_actions_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "smart_drills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_corrective_actions_evaluation_id_fkey"
            columns: ["evaluation_id"]
            isOneToOne: false
            referencedRelation: "drill_evaluations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_corrective_actions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      drill_evaluations: {
        Row: {
          ai_generated: boolean | null
          completion_rate: number | null
          created_at: string | null
          drill_id: string
          duration_actual_minutes: number | null
          evaluated_at: string | null
          evaluator_id: string | null
          execution_session_id: string
          id: string
          organization_id: string
          overall_score: number
          participants_count: number | null
          performance_metrics: Json | null
          recommendations: Json | null
          strengths: Json | null
          updated_at: string | null
          weaknesses: Json | null
        }
        Insert: {
          ai_generated?: boolean | null
          completion_rate?: number | null
          created_at?: string | null
          drill_id: string
          duration_actual_minutes?: number | null
          evaluated_at?: string | null
          evaluator_id?: string | null
          execution_session_id: string
          id?: string
          organization_id: string
          overall_score: number
          participants_count?: number | null
          performance_metrics?: Json | null
          recommendations?: Json | null
          strengths?: Json | null
          updated_at?: string | null
          weaknesses?: Json | null
        }
        Update: {
          ai_generated?: boolean | null
          completion_rate?: number | null
          created_at?: string | null
          drill_id?: string
          duration_actual_minutes?: number | null
          evaluated_at?: string | null
          evaluator_id?: string | null
          execution_session_id?: string
          id?: string
          organization_id?: string
          overall_score?: number
          participants_count?: number | null
          performance_metrics?: Json | null
          recommendations?: Json | null
          strengths?: Json | null
          updated_at?: string | null
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "drill_evaluations_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "smart_drills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_evaluations_evaluator_id_fkey"
            columns: ["evaluator_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_evaluations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      drill_responses: {
        Row: {
          ai_feedback: Json | null
          correctness_score: number | null
          created_at: string | null
          crew_member_id: string | null
          decision_points: Json | null
          drill_id: string
          execution_session_id: string | null
          id: string
          organization_id: string
          response_data: Json
          response_quality: string | null
          submitted_at: string | null
          time_taken_seconds: number | null
        }
        Insert: {
          ai_feedback?: Json | null
          correctness_score?: number | null
          created_at?: string | null
          crew_member_id?: string | null
          decision_points?: Json | null
          drill_id: string
          execution_session_id?: string | null
          id?: string
          organization_id: string
          response_data: Json
          response_quality?: string | null
          submitted_at?: string | null
          time_taken_seconds?: number | null
        }
        Update: {
          ai_feedback?: Json | null
          correctness_score?: number | null
          created_at?: string | null
          crew_member_id?: string | null
          decision_points?: Json | null
          drill_id?: string
          execution_session_id?: string | null
          id?: string
          organization_id?: string
          response_data?: Json
          response_quality?: string | null
          submitted_at?: string | null
          time_taken_seconds?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "drill_responses_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_responses_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "smart_drills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drill_responses_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      drill_simulations: {
        Row: {
          actual_date: string | null
          ai_analysis: Json | null
          coordinator_id: string | null
          created_at: string
          description: string | null
          drill_code: string
          drill_status: string | null
          drill_type: string
          duration_minutes: number | null
          id: string
          lessons_learned: string | null
          objectives: string[] | null
          participants_count: number | null
          pass_fail: string | null
          results: Json | null
          scenario: string | null
          scheduled_date: string | null
          score: number | null
          title: string
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          actual_date?: string | null
          ai_analysis?: Json | null
          coordinator_id?: string | null
          created_at?: string
          description?: string | null
          drill_code: string
          drill_status?: string | null
          drill_type: string
          duration_minutes?: number | null
          id?: string
          lessons_learned?: string | null
          objectives?: string[] | null
          participants_count?: number | null
          pass_fail?: string | null
          results?: Json | null
          scenario?: string | null
          scheduled_date?: string | null
          score?: number | null
          title: string
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          actual_date?: string | null
          ai_analysis?: Json | null
          coordinator_id?: string | null
          created_at?: string
          description?: string | null
          drill_code?: string
          drill_status?: string | null
          drill_type?: string
          duration_minutes?: number | null
          id?: string
          lessons_learned?: string | null
          objectives?: string[] | null
          participants_count?: number | null
          pass_fail?: string | null
          results?: Json | null
          scenario?: string | null
          scheduled_date?: string | null
          score?: number | null
          title?: string
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: []
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
      drydock_events: {
        Row: {
          actual_cost: number | null
          actual_end_date: string | null
          actual_start_date: string | null
          class_requirements: Json | null
          created_at: string
          created_by: string | null
          currency: string | null
          documents: string[] | null
          estimated_cost: number | null
          event_type: string
          id: string
          notes: string | null
          organization_id: string | null
          planned_end_date: string
          planned_start_date: string
          shipyard_location: string | null
          shipyard_name: string
          status: string | null
          updated_at: string
          vessel_id: string | null
          work_scope: Json | null
        }
        Insert: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          class_requirements?: Json | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          documents?: string[] | null
          estimated_cost?: number | null
          event_type: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          planned_end_date: string
          planned_start_date: string
          shipyard_location?: string | null
          shipyard_name: string
          status?: string | null
          updated_at?: string
          vessel_id?: string | null
          work_scope?: Json | null
        }
        Update: {
          actual_cost?: number | null
          actual_end_date?: string | null
          actual_start_date?: string | null
          class_requirements?: Json | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          documents?: string[] | null
          estimated_cost?: number | null
          event_type?: string
          id?: string
          notes?: string | null
          organization_id?: string | null
          planned_end_date?: string
          planned_start_date?: string
          shipyard_location?: string | null
          shipyard_name?: string
          status?: string | null
          updated_at?: string
          vessel_id?: string | null
          work_scope?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "drydock_events_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "drydock_events_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      due_diligence_reports: {
        Row: {
          adverse_media: Json | null
          ai_analysis: Json | null
          created_at: string
          findings: Json | null
          id: string
          pep_check: Json | null
          recommendations: string | null
          report_code: string
          report_status: string | null
          report_type: string
          reviewed_at: string | null
          reviewed_by: string | null
          risk_level: string | null
          risk_score: number | null
          sanctions_check: Json | null
          screening_sources: string[] | null
          subject_details: Json | null
          subject_id: string | null
          subject_name: string
          subject_type: string
          updated_at: string
          valid_until: string | null
        }
        Insert: {
          adverse_media?: Json | null
          ai_analysis?: Json | null
          created_at?: string
          findings?: Json | null
          id?: string
          pep_check?: Json | null
          recommendations?: string | null
          report_code: string
          report_status?: string | null
          report_type: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          risk_score?: number | null
          sanctions_check?: Json | null
          screening_sources?: string[] | null
          subject_details?: Json | null
          subject_id?: string | null
          subject_name: string
          subject_type: string
          updated_at?: string
          valid_until?: string | null
        }
        Update: {
          adverse_media?: Json | null
          ai_analysis?: Json | null
          created_at?: string
          findings?: Json | null
          id?: string
          pep_check?: Json | null
          recommendations?: string | null
          report_code?: string
          report_status?: string | null
          report_type?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          risk_level?: string | null
          risk_score?: number | null
          sanctions_check?: Json | null
          screening_sources?: string[] | null
          subject_details?: Json | null
          subject_id?: string | null
          subject_name?: string
          subject_type?: string
          updated_at?: string
          valid_until?: string | null
        }
        Relationships: []
      }
      ecdis_data: {
        Row: {
          backup_arrangements: string | null
          chart_folios: string[] | null
          created_at: string
          ecdis_manufacturer: string | null
          ecdis_model: string | null
          enc_cells_installed: number | null
          enc_permit_status: string | null
          id: string
          last_sync_at: string | null
          last_update_date: string | null
          next_update_due: string | null
          organization_id: string | null
          routes: Json | null
          software_version: string | null
          type_approval_number: string | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          backup_arrangements?: string | null
          chart_folios?: string[] | null
          created_at?: string
          ecdis_manufacturer?: string | null
          ecdis_model?: string | null
          enc_cells_installed?: number | null
          enc_permit_status?: string | null
          id?: string
          last_sync_at?: string | null
          last_update_date?: string | null
          next_update_due?: string | null
          organization_id?: string | null
          routes?: Json | null
          software_version?: string | null
          type_approval_number?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          backup_arrangements?: string | null
          chart_folios?: string[] | null
          created_at?: string
          ecdis_manufacturer?: string | null
          ecdis_model?: string | null
          enc_cells_installed?: number | null
          enc_permit_status?: string | null
          id?: string
          last_sync_at?: string | null
          last_update_date?: string | null
          next_update_due?: string | null
          organization_id?: string | null
          routes?: Json | null
          software_version?: string | null
          type_approval_number?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ecdis_data_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ecdis_data_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      equipment_sensors: {
        Row: {
          created_at: string
          equipment_id: string
          equipment_name: string
          id: string
          is_anomaly: boolean | null
          location: string | null
          max_threshold: number | null
          metadata: Json | null
          min_threshold: number | null
          recorded_at: string | null
          sensor_status: string | null
          sensor_type: string
          unit: string
          value: number
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          equipment_id: string
          equipment_name: string
          id?: string
          is_anomaly?: boolean | null
          location?: string | null
          max_threshold?: number | null
          metadata?: Json | null
          min_threshold?: number | null
          recorded_at?: string | null
          sensor_status?: string | null
          sensor_type: string
          unit: string
          value: number
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          equipment_id?: string
          equipment_name?: string
          id?: string
          is_anomaly?: boolean | null
          location?: string | null
          max_threshold?: number | null
          metadata?: Json | null
          min_threshold?: number | null
          recorded_at?: string | null
          sensor_status?: string | null
          sensor_type?: string
          unit?: string
          value?: number
          vessel_id?: string | null
        }
        Relationships: []
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
      evidences: {
        Row: {
          ai_analysis: Json | null
          ai_generated: boolean | null
          collected_at: string
          collected_by: string | null
          created_at: string
          description: string | null
          evidence_code: string
          evidence_status: string | null
          evidence_type: string
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          module_source: string
          related_audit_id: string | null
          reviewed_at: string | null
          reviewer_id: string | null
          tags: string[] | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          ai_generated?: boolean | null
          collected_at?: string
          collected_by?: string | null
          created_at?: string
          description?: string | null
          evidence_code: string
          evidence_status?: string | null
          evidence_type: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          module_source: string
          related_audit_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          ai_generated?: boolean | null
          collected_at?: string
          collected_by?: string | null
          created_at?: string
          description?: string | null
          evidence_code?: string
          evidence_status?: string | null
          evidence_type?: string
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          module_source?: string
          related_audit_id?: string | null
          reviewed_at?: string | null
          reviewer_id?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string
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
      executive_kpis: {
        Row: {
          category: string
          created_at: string
          id: string
          kpi_name: string
          kpi_target: number | null
          kpi_unit: string | null
          kpi_value: number
          metadata: Json | null
          period_end: string | null
          period_start: string | null
          trend: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          id?: string
          kpi_name: string
          kpi_target?: number | null
          kpi_unit?: string | null
          kpi_value: number
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          trend?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          id?: string
          kpi_name?: string
          kpi_target?: number | null
          kpi_unit?: string | null
          kpi_value?: number
          metadata?: Json | null
          period_end?: string | null
          period_start?: string | null
          trend?: string | null
          updated_at?: string
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
      external_api_logs: {
        Row: {
          api_name: string
          endpoint: string | null
          error_message: string | null
          id: string
          method: string | null
          org_id: string | null
          request_payload: Json | null
          response_summary: Json | null
          response_time_ms: number | null
          status_code: number | null
          timestamp: string | null
        }
        Insert: {
          api_name: string
          endpoint?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          org_id?: string | null
          request_payload?: Json | null
          response_summary?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
          timestamp?: string | null
        }
        Update: {
          api_name?: string
          endpoint?: string | null
          error_message?: string | null
          id?: string
          method?: string | null
          org_id?: string | null
          request_payload?: Json | null
          response_summary?: Json | null
          response_time_ms?: number | null
          status_code?: number | null
          timestamp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_api_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      feature_flags: {
        Row: {
          created_at: string | null
          description: string | null
          enabled: boolean | null
          flag_name: string
          id: string
          org_id: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          flag_name: string
          id?: string
          org_id?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          enabled?: boolean | null
          flag_name?: string
          id?: string
          org_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "feature_flags_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      forecast_history: {
        Row: {
          accuracy_score: number | null
          actual_value: number | null
          confidence_level: number | null
          context_data: Json | null
          created_at: string | null
          forecast_type: string
          id: string
          model_used: string | null
          module_name: string
          organization_id: string | null
          parameters: Json | null
          predicted_value: number
          prediction_date: string
          target_date: string
          validated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          actual_value?: number | null
          confidence_level?: number | null
          context_data?: Json | null
          created_at?: string | null
          forecast_type: string
          id?: string
          model_used?: string | null
          module_name: string
          organization_id?: string | null
          parameters?: Json | null
          predicted_value: number
          prediction_date: string
          target_date: string
          validated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          actual_value?: number | null
          confidence_level?: number | null
          context_data?: Json | null
          created_at?: string | null
          forecast_type?: string
          id?: string
          model_used?: string | null
          module_name?: string
          organization_id?: string | null
          parameters?: Json | null
          predicted_value?: number
          prediction_date?: string
          target_date?: string
          validated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "forecast_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "forecast_history_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
      fuel_usage: {
        Row: {
          consumption_rate: number | null
          cost_usd: number | null
          created_at: string | null
          efficiency_score: number | null
          fuel_type: string | null
          id: string
          metadata: Json | null
          notes: string | null
          port_of_bunkering: string | null
          quantity_liters: number
          recorded_at: string | null
          vessel_id: string | null
        }
        Insert: {
          consumption_rate?: number | null
          cost_usd?: number | null
          created_at?: string | null
          efficiency_score?: number | null
          fuel_type?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          port_of_bunkering?: string | null
          quantity_liters: number
          recorded_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          consumption_rate?: number | null
          cost_usd?: number | null
          created_at?: string | null
          efficiency_score?: number | null
          fuel_type?: string | null
          id?: string
          metadata?: Json | null
          notes?: string | null
          port_of_bunkering?: string | null
          quantity_liters?: number
          recorded_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "fuel_usage_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      geofence_zones: {
        Row: {
          active: boolean
          center_lat: number
          center_lng: number
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          name: string
          organization_id: string | null
          radius_km: number
          type: string
          updated_at: string
        }
        Insert: {
          active?: boolean
          center_lat: number
          center_lng: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          radius_km?: number
          type: string
          updated_at?: string
        }
        Update: {
          active?: boolean
          center_lat?: number
          center_lng?: number
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          radius_km?: number
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "geofence_zones_organization_id_fkey"
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
      gmud_changes: {
        Row: {
          actual_end: string | null
          actual_start: string | null
          ai_analysis: Json | null
          approver_id: string | null
          change_number: string
          change_status: string
          change_type: string
          created_at: string
          description: string | null
          id: string
          impact_assessment: string | null
          planned_end: string | null
          planned_start: string | null
          priority: string
          requester_id: string | null
          risk_level: string | null
          rollback_plan: string | null
          title: string
          updated_at: string
        }
        Insert: {
          actual_end?: string | null
          actual_start?: string | null
          ai_analysis?: Json | null
          approver_id?: string | null
          change_number: string
          change_status?: string
          change_type?: string
          created_at?: string
          description?: string | null
          id?: string
          impact_assessment?: string | null
          planned_end?: string | null
          planned_start?: string | null
          priority?: string
          requester_id?: string | null
          risk_level?: string | null
          rollback_plan?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          actual_end?: string | null
          actual_start?: string | null
          ai_analysis?: Json | null
          approver_id?: string | null
          change_number?: string
          change_status?: string
          change_type?: string
          created_at?: string
          description?: string | null
          id?: string
          impact_assessment?: string | null
          planned_end?: string | null
          planned_start?: string | null
          priority?: string
          requester_id?: string | null
          risk_level?: string | null
          rollback_plan?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      gmud_implementation: {
        Row: {
          actual_implementation_date: string | null
          checklist_items: Json | null
          created_at: string | null
          evidence_files: Json | null
          gmud_request_id: string | null
          id: string
          implemented_by: string | null
          lessons_learned: string | null
          status: string | null
          test_passed: boolean | null
          test_results: string | null
          updated_at: string | null
        }
        Insert: {
          actual_implementation_date?: string | null
          checklist_items?: Json | null
          created_at?: string | null
          evidence_files?: Json | null
          gmud_request_id?: string | null
          id?: string
          implemented_by?: string | null
          lessons_learned?: string | null
          status?: string | null
          test_passed?: boolean | null
          test_results?: string | null
          updated_at?: string | null
        }
        Update: {
          actual_implementation_date?: string | null
          checklist_items?: Json | null
          created_at?: string | null
          evidence_files?: Json | null
          gmud_request_id?: string | null
          id?: string
          implemented_by?: string | null
          lessons_learned?: string | null
          status?: string | null
          test_passed?: boolean | null
          test_results?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gmud_implementation_gmud_request_id_fkey"
            columns: ["gmud_request_id"]
            isOneToOne: false
            referencedRelation: "gmud_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      gmud_requests: {
        Row: {
          change_type: string
          created_at: string | null
          created_by: string | null
          current_approver_role: string | null
          description: string
          gmud_number: string
          id: string
          impact_areas: Json | null
          impact_assessment: string | null
          implementation_date: string | null
          justification: string
          organization_id: string | null
          risk_level: string | null
          rollback_plan: string | null
          status: string | null
          technical_docs: Json | null
          title: string
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          change_type: string
          created_at?: string | null
          created_by?: string | null
          current_approver_role?: string | null
          description: string
          gmud_number: string
          id?: string
          impact_areas?: Json | null
          impact_assessment?: string | null
          implementation_date?: string | null
          justification: string
          organization_id?: string | null
          risk_level?: string | null
          rollback_plan?: string | null
          status?: string | null
          technical_docs?: Json | null
          title: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          change_type?: string
          created_at?: string | null
          created_by?: string | null
          current_approver_role?: string | null
          description?: string
          gmud_number?: string
          id?: string
          impact_areas?: Json | null
          impact_assessment?: string | null
          implementation_date?: string | null
          justification?: string
          organization_id?: string | null
          risk_level?: string | null
          rollback_plan?: string | null
          status?: string | null
          technical_docs?: Json | null
          title?: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gmud_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gmud_requests_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      gmud_responsibility_matrix: {
        Row: {
          created_at: string | null
          gmud_request_id: string | null
          id: string
          raci_matrix: Json | null
          roles: Json | null
        }
        Insert: {
          created_at?: string | null
          gmud_request_id?: string | null
          id?: string
          raci_matrix?: Json | null
          roles?: Json | null
        }
        Update: {
          created_at?: string | null
          gmud_request_id?: string | null
          id?: string
          raci_matrix?: Json | null
          roles?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "gmud_responsibility_matrix_gmud_request_id_fkey"
            columns: ["gmud_request_id"]
            isOneToOne: false
            referencedRelation: "gmud_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      gmud_signatures: {
        Row: {
          comments: string | null
          created_at: string | null
          deadline: string | null
          gmud_request_id: string | null
          id: string
          notification_sent_at: string | null
          reminder_sent_at: string | null
          role: string
          role_order: number
          signed_at: string | null
          signed_by: string | null
          signed_by_name: string | null
          status: string | null
        }
        Insert: {
          comments?: string | null
          created_at?: string | null
          deadline?: string | null
          gmud_request_id?: string | null
          id?: string
          notification_sent_at?: string | null
          reminder_sent_at?: string | null
          role: string
          role_order: number
          signed_at?: string | null
          signed_by?: string | null
          signed_by_name?: string | null
          status?: string | null
        }
        Update: {
          comments?: string | null
          created_at?: string | null
          deadline?: string | null
          gmud_request_id?: string | null
          id?: string
          notification_sent_at?: string | null
          reminder_sent_at?: string | null
          role?: string
          role_order?: number
          signed_at?: string | null
          signed_by?: string | null
          signed_by_name?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gmud_signatures_gmud_request_id_fkey"
            columns: ["gmud_request_id"]
            isOneToOne: false
            referencedRelation: "gmud_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      gnss_ai_recommendations: {
        Row: {
          applied_at: string | null
          applied_by: string | null
          confidence: number | null
          created_at: string | null
          description: string | null
          device_id: string | null
          id: string
          is_applied: boolean | null
          metadata: Json | null
          org_id: string | null
          predicted_trajectory: Json | null
          recommendation_type: string
          suggested_action: string | null
          title: string
          vessel_id: string | null
        }
        Insert: {
          applied_at?: string | null
          applied_by?: string | null
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          is_applied?: boolean | null
          metadata?: Json | null
          org_id?: string | null
          predicted_trajectory?: Json | null
          recommendation_type: string
          suggested_action?: string | null
          title: string
          vessel_id?: string | null
        }
        Update: {
          applied_at?: string | null
          applied_by?: string | null
          confidence?: number | null
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          is_applied?: boolean | null
          metadata?: Json | null
          org_id?: string | null
          predicted_trajectory?: Json | null
          recommendation_type?: string
          suggested_action?: string | null
          title?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gnss_ai_recommendations_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "gnss_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gnss_ai_recommendations_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gnss_ai_recommendations_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      gnss_alerts: {
        Row: {
          actual_value: number | null
          alert_type: string
          created_at: string | null
          description: string | null
          device_id: string | null
          id: string
          is_resolved: boolean | null
          latitude: number | null
          longitude: number | null
          metadata: Json | null
          org_id: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          threshold_value: number | null
          title: string
          vessel_id: string | null
        }
        Insert: {
          actual_value?: number | null
          alert_type: string
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          is_resolved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          org_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          threshold_value?: number | null
          title: string
          vessel_id?: string | null
        }
        Update: {
          actual_value?: number | null
          alert_type?: string
          created_at?: string | null
          description?: string | null
          device_id?: string | null
          id?: string
          is_resolved?: boolean | null
          latitude?: number | null
          longitude?: number | null
          metadata?: Json | null
          org_id?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          threshold_value?: number | null
          title?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gnss_alerts_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "gnss_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gnss_alerts_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gnss_alerts_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      gnss_correction_stations: {
        Row: {
          altitude: number | null
          created_at: string | null
          data_quality: number | null
          id: string
          is_active: boolean | null
          last_data_at: string | null
          latitude: number
          longitude: number
          metadata: Json | null
          provider: string
          station_code: string
          station_name: string
          updated_at: string | null
        }
        Insert: {
          altitude?: number | null
          created_at?: string | null
          data_quality?: number | null
          id?: string
          is_active?: boolean | null
          last_data_at?: string | null
          latitude: number
          longitude: number
          metadata?: Json | null
          provider: string
          station_code: string
          station_name: string
          updated_at?: string | null
        }
        Update: {
          altitude?: number | null
          created_at?: string | null
          data_quality?: number | null
          id?: string
          is_active?: boolean | null
          last_data_at?: string | null
          latitude?: number
          longitude?: number
          metadata?: Json | null
          provider?: string
          station_code?: string
          station_name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      gnss_devices: {
        Row: {
          configuration: Json | null
          created_at: string | null
          device_name: string
          device_type: string | null
          firmware_version: string | null
          id: string
          is_active: boolean | null
          is_online: boolean | null
          last_seen_at: string | null
          manufacturer: string | null
          metadata: Json | null
          model: string | null
          org_id: string | null
          serial_number: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          configuration?: Json | null
          created_at?: string | null
          device_name: string
          device_type?: string | null
          firmware_version?: string | null
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          last_seen_at?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          org_id?: string | null
          serial_number?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          configuration?: Json | null
          created_at?: string | null
          device_name?: string
          device_type?: string | null
          firmware_version?: string | null
          id?: string
          is_active?: boolean | null
          is_online?: boolean | null
          last_seen_at?: string | null
          manufacturer?: string | null
          metadata?: Json | null
          model?: string | null
          org_id?: string | null
          serial_number?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gnss_devices_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gnss_devices_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      gnss_waypoints: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean | null
          latitude: number
          longitude: number
          metadata: Json | null
          name: string
          org_id: string | null
          radius_meters: number | null
          updated_at: string | null
          vessel_id: string | null
          waypoint_type: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          latitude: number
          longitude: number
          metadata?: Json | null
          name: string
          org_id?: string | null
          radius_meters?: number | null
          updated_at?: string | null
          vessel_id?: string | null
          waypoint_type?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          latitude?: number
          longitude?: number
          metadata?: Json | null
          name?: string
          org_id?: string | null
          radius_meters?: number | null
          updated_at?: string | null
          vessel_id?: string | null
          waypoint_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "gnss_waypoints_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gnss_waypoints_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      health_checkins: {
        Row: {
          checked_by: string | null
          checkin_type: string | null
          created_at: string | null
          crew_member_id: string | null
          id: string
          location: string | null
          notes: string | null
          organization_id: string | null
          status: string | null
          symptoms: string[] | null
          temperature: number | null
        }
        Insert: {
          checked_by?: string | null
          checkin_type?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          symptoms?: string[] | null
          temperature?: number | null
        }
        Update: {
          checked_by?: string | null
          checkin_type?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          id?: string
          location?: string | null
          notes?: string | null
          organization_id?: string | null
          status?: string | null
          symptoms?: string[] | null
          temperature?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "health_checkins_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "health_checkins_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      hire_calculations: {
        Row: {
          ai_confidence: number | null
          calculated_by_ai: boolean | null
          contract_id: string | null
          created_at: string | null
          demurrage: number | null
          despatch: number | null
          gross_hire: number
          id: string
          invoice_number: string | null
          net_hire: number
          notes: string | null
          off_hire_deduction: number | null
          payment_status: string | null
          period_end: string
          period_start: string
          total_due: number
        }
        Insert: {
          ai_confidence?: number | null
          calculated_by_ai?: boolean | null
          contract_id?: string | null
          created_at?: string | null
          demurrage?: number | null
          despatch?: number | null
          gross_hire: number
          id?: string
          invoice_number?: string | null
          net_hire: number
          notes?: string | null
          off_hire_deduction?: number | null
          payment_status?: string | null
          period_end: string
          period_start: string
          total_due: number
        }
        Update: {
          ai_confidence?: number | null
          calculated_by_ai?: boolean | null
          contract_id?: string | null
          created_at?: string | null
          demurrage?: number | null
          despatch?: number | null
          gross_hire?: number
          id?: string
          invoice_number?: string | null
          net_hire?: number
          notes?: string | null
          off_hire_deduction?: number | null
          payment_status?: string | null
          period_end?: string
          period_start?: string
          total_due?: number
        }
        Relationships: [
          {
            foreignKeyName: "hire_calculations_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "charter_contracts"
            referencedColumns: ["id"]
          },
        ]
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
      hull_inspections: {
        Row: {
          anodes_condition: string | null
          coating_condition: string | null
          created_at: string
          findings: Json | null
          fouling_level: string | null
          hull_condition_score: number | null
          id: string
          inspection_date: string
          inspection_type: string
          inspector_company: string | null
          inspector_name: string | null
          next_inspection_due: string | null
          organization_id: string | null
          photos: string[] | null
          recommendations: Json | null
          report_file: string | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          anodes_condition?: string | null
          coating_condition?: string | null
          created_at?: string
          findings?: Json | null
          fouling_level?: string | null
          hull_condition_score?: number | null
          id?: string
          inspection_date: string
          inspection_type: string
          inspector_company?: string | null
          inspector_name?: string | null
          next_inspection_due?: string | null
          organization_id?: string | null
          photos?: string[] | null
          recommendations?: Json | null
          report_file?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          anodes_condition?: string | null
          coating_condition?: string | null
          created_at?: string
          findings?: Json | null
          fouling_level?: string | null
          hull_condition_score?: number | null
          id?: string
          inspection_date?: string
          inspection_type?: string
          inspector_company?: string | null
          inspector_name?: string | null
          next_inspection_due?: string | null
          organization_id?: string | null
          photos?: string[] | null
          recommendations?: Json | null
          report_file?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hull_inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hull_inspections_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      human_factors_incidents: {
        Row: {
          ai_analysis: Json | null
          attention_lapse: boolean | null
          communication_issue: boolean | null
          created_at: string | null
          created_by: string | null
          crew_member_id: string | null
          fatigue_level: number | null
          id: string
          incident_id: string | null
          organization_id: string | null
          other_factors: Json | null
          overconfidence: boolean | null
          personal_issues: boolean | null
          procedure_violation: boolean | null
          risk_taking: boolean | null
          stress_level: number | null
          substance_related: boolean | null
          vessel_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          attention_lapse?: boolean | null
          communication_issue?: boolean | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          fatigue_level?: number | null
          id?: string
          incident_id?: string | null
          organization_id?: string | null
          other_factors?: Json | null
          overconfidence?: boolean | null
          personal_issues?: boolean | null
          procedure_violation?: boolean | null
          risk_taking?: boolean | null
          stress_level?: number | null
          substance_related?: boolean | null
          vessel_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          attention_lapse?: boolean | null
          communication_issue?: boolean | null
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          fatigue_level?: number | null
          id?: string
          incident_id?: string | null
          organization_id?: string | null
          other_factors?: Json | null
          overconfidence?: boolean | null
          personal_issues?: boolean | null
          procedure_violation?: boolean | null
          risk_taking?: boolean | null
          stress_level?: number | null
          substance_related?: boolean | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "human_factors_incidents_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "human_factors_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "human_factors_incidents_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      ia_adoption_metrics: {
        Row: {
          accepted_suggestions: number | null
          avg_response_time_ms: number | null
          created_at: string | null
          feature_usage: Json | null
          id: string
          module_name: string
          organization_id: string | null
          period_end: string
          period_start: string
          rejected_suggestions: number | null
          total_interactions: number | null
          updated_at: string | null
          user_satisfaction_score: number | null
        }
        Insert: {
          accepted_suggestions?: number | null
          avg_response_time_ms?: number | null
          created_at?: string | null
          feature_usage?: Json | null
          id?: string
          module_name: string
          organization_id?: string | null
          period_end: string
          period_start: string
          rejected_suggestions?: number | null
          total_interactions?: number | null
          updated_at?: string | null
          user_satisfaction_score?: number | null
        }
        Update: {
          accepted_suggestions?: number | null
          avg_response_time_ms?: number | null
          created_at?: string | null
          feature_usage?: Json | null
          id?: string
          module_name?: string
          organization_id?: string | null
          period_end?: string
          period_start?: string
          rejected_suggestions?: number | null
          total_interactions?: number | null
          updated_at?: string | null
          user_satisfaction_score?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ia_adoption_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      imca_incidents: {
        Row: {
          category: string
          created_at: string | null
          created_by: string | null
          description: string
          id: string
          imca_reference: string | null
          incident_date: string | null
          is_imca_official: boolean | null
          lessons_learned: string | null
          organization_id: string | null
          recommendations: Json | null
          related_vessel_id: string | null
          root_cause: string | null
          severity: string | null
          source_url: string | null
          tags: Json | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          created_by?: string | null
          description: string
          id?: string
          imca_reference?: string | null
          incident_date?: string | null
          is_imca_official?: boolean | null
          lessons_learned?: string | null
          organization_id?: string | null
          recommendations?: Json | null
          related_vessel_id?: string | null
          root_cause?: string | null
          severity?: string | null
          source_url?: string | null
          tags?: Json | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          created_by?: string | null
          description?: string
          id?: string
          imca_reference?: string | null
          incident_date?: string | null
          is_imca_official?: boolean | null
          lessons_learned?: string | null
          organization_id?: string | null
          recommendations?: Json | null
          related_vessel_id?: string | null
          root_cause?: string | null
          severity?: string | null
          source_url?: string | null
          tags?: Json | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "imca_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "imca_incidents_related_vessel_id_fkey"
            columns: ["related_vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      incident_comments: {
        Row: {
          attachments: Json | null
          comment_text: string
          comment_type: string | null
          created_at: string | null
          created_by: string | null
          has_attachments: boolean | null
          id: string
          incident_id: string
        }
        Insert: {
          attachments?: Json | null
          comment_text: string
          comment_type?: string | null
          created_at?: string | null
          created_by?: string | null
          has_attachments?: boolean | null
          id?: string
          incident_id: string
        }
        Update: {
          attachments?: Json | null
          comment_text?: string
          comment_type?: string | null
          created_at?: string | null
          created_by?: string | null
          has_attachments?: boolean | null
          id?: string
          incident_id?: string
        }
        Relationships: []
      }
      incident_drills: {
        Row: {
          ai_generated: boolean | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          drill_type: string
          evaluation_criteria: Json | null
          expected_duration_minutes: number | null
          id: string
          objectives: Json | null
          organization_id: string
          scenario: Json | null
          scheduled_date: string | null
          status: string | null
          title: string
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          drill_type: string
          evaluation_criteria?: Json | null
          expected_duration_minutes?: number | null
          id?: string
          objectives?: Json | null
          organization_id: string
          scenario?: Json | null
          scheduled_date?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          drill_type?: string
          evaluation_criteria?: Json | null
          expected_duration_minutes?: number | null
          id?: string
          objectives?: Json | null
          organization_id?: string
          scenario?: Json | null
          scheduled_date?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "incident_drills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_drills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "incident_drills_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
          gps_coordinates: string | null
          id: string
          incident_date: string | null
          incident_number: string | null
          location: string
          metadata: Json | null
          photo_urls: string[] | null
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
          gps_coordinates?: string | null
          id?: string
          incident_date?: string | null
          incident_number?: string | null
          location: string
          metadata?: Json | null
          photo_urls?: string[] | null
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
          gps_coordinates?: string | null
          id?: string
          incident_date?: string | null
          incident_number?: string | null
          location?: string
          metadata?: Json | null
          photo_urls?: string[] | null
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
      incident_types: {
        Row: {
          auto_notify_roles: string[] | null
          category: string
          created_at: string | null
          default_severity: string | null
          description: string | null
          id: string
          is_active: boolean | null
          requires_immediate_action: boolean | null
          requires_investigation: boolean | null
          response_sla_hours: number | null
          type_name: string
          updated_at: string | null
        }
        Insert: {
          auto_notify_roles?: string[] | null
          category: string
          created_at?: string | null
          default_severity?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          requires_immediate_action?: boolean | null
          requires_investigation?: boolean | null
          response_sla_hours?: number | null
          type_name: string
          updated_at?: string | null
        }
        Update: {
          auto_notify_roles?: string[] | null
          category?: string
          created_at?: string | null
          default_severity?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          requires_immediate_action?: boolean | null
          requires_investigation?: boolean | null
          response_sla_hours?: number | null
          type_name?: string
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
      inspector_profiles: {
        Row: {
          accuracy_score: number | null
          created_at: string | null
          expertise: string[] | null
          historical_focus_areas: string[] | null
          id: string
          inspection_count: number | null
          name: string | null
          preferences: Json | null
          specializations: string[] | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string | null
          expertise?: string[] | null
          historical_focus_areas?: string[] | null
          id?: string
          inspection_count?: number | null
          name?: string | null
          preferences?: Json | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string | null
          expertise?: string[] | null
          historical_focus_areas?: string[] | null
          id?: string
          inspection_count?: number | null
          name?: string | null
          preferences?: Json | null
          specializations?: string[] | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
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
          level: string | null
          message: string | null
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
          level?: string | null
          message?: string | null
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
          level?: string | null
          message?: string | null
          provider?: string
          request_data?: Json | null
          response_data?: Json | null
          status?: string
          user_id?: string | null
        }
        Relationships: []
      }
      integration_plugins: {
        Row: {
          capabilities: string[] | null
          config_schema: Json | null
          created_at: string | null
          default_config: Json | null
          description: string | null
          id: string
          is_enabled: boolean | null
          plugin_name: string
          plugin_type: string
          updated_at: string | null
          version: string | null
        }
        Insert: {
          capabilities?: string[] | null
          config_schema?: Json | null
          created_at?: string | null
          default_config?: Json | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          plugin_name: string
          plugin_type: string
          updated_at?: string | null
          version?: string | null
        }
        Update: {
          capabilities?: string[] | null
          config_schema?: Json | null
          created_at?: string | null
          default_config?: Json | null
          description?: string | null
          id?: string
          is_enabled?: boolean | null
          plugin_name?: string
          plugin_type?: string
          updated_at?: string | null
          version?: string | null
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
      inventory_items: {
        Row: {
          category: string | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          is_critical: boolean | null
          item_code: string
          location: string | null
          max_quantity: number | null
          metadata: Json | null
          min_quantity: number | null
          name: string
          notes: string | null
          organization_id: string | null
          quantity: number | null
          status: string | null
          supplier_name: string | null
          unit: string | null
          unit_cost: number | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_critical?: boolean | null
          item_code: string
          location?: string | null
          max_quantity?: number | null
          metadata?: Json | null
          min_quantity?: number | null
          name: string
          notes?: string | null
          organization_id?: string | null
          quantity?: number | null
          status?: string | null
          supplier_name?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          is_critical?: boolean | null
          item_code?: string
          location?: string | null
          max_quantity?: number | null
          metadata?: Json | null
          min_quantity?: number | null
          name?: string
          notes?: string | null
          organization_id?: string | null
          quantity?: number | null
          status?: string | null
          supplier_name?: string | null
          unit?: string | null
          unit_cost?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_items_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_items_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_sensor_data: {
        Row: {
          created_at: string
          id: string
          location: string | null
          metadata: Json | null
          sensor_id: string
          sensor_type: string
          status: string | null
          timestamp: string
          unit: string | null
          updated_at: string
          value: number
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          sensor_id: string
          sensor_type: string
          status?: string | null
          timestamp?: string
          unit?: string | null
          updated_at?: string
          value: number
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          sensor_id?: string
          sensor_type?: string
          status?: string | null
          timestamp?: string
          unit?: string | null
          updated_at?: string
          value?: number
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensor_data_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      iot_sensors: {
        Row: {
          created_at: string
          current_value: number | null
          id: string
          last_reading_at: string | null
          location: string | null
          metadata: Json | null
          organization_id: string | null
          sensor_id: string
          sensor_type: string
          status: string | null
          thresholds: Json | null
          unit: string | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          current_value?: number | null
          id?: string
          last_reading_at?: string | null
          location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          sensor_id: string
          sensor_type: string
          status?: string | null
          thresholds?: Json | null
          unit?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          current_value?: number | null
          id?: string
          last_reading_at?: string | null
          location?: string | null
          metadata?: Json | null
          organization_id?: string | null
          sensor_id?: string
          sensor_type?: string
          status?: string | null
          thresholds?: Json | null
          unit?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "iot_sensors_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "iot_sensors_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      job_embeddings: {
        Row: {
          created_at: string
          embedding: Json
          id: string
          job_id: string
          metadata: Json | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          embedding: Json
          id?: string
          job_id: string
          metadata?: Json | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          embedding?: Json
          id?: string
          job_id?: string
          metadata?: Json | null
          updated_at?: string
        }
        Relationships: []
      }
      jobs: {
        Row: {
          assigned_to: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      logs_observability: {
        Row: {
          error_message: string | null
          id: string
          metadata: Json | null
          method: string | null
          org_id: string | null
          response_time_ms: number | null
          route: string | null
          status_code: number | null
          timestamp: string | null
          user_id: string | null
        }
        Insert: {
          error_message?: string | null
          id?: string
          metadata?: Json | null
          method?: string | null
          org_id?: string | null
          response_time_ms?: number | null
          route?: string | null
          status_code?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Update: {
          error_message?: string | null
          id?: string
          metadata?: Json | null
          method?: string | null
          org_id?: string | null
          response_time_ms?: number | null
          route?: string | null
          status_code?: number | null
          timestamp?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      maintenance_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          component: string | null
          created_at: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          recommended_action: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          vessel_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          component?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          recommended_action?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          vessel_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          component?: string | null
          created_at?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          recommended_action?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_alerts_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      maintenance_tasks: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          attachments: Json | null
          completed_date: string | null
          component_id: string | null
          component_name: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          estimated_hours: number | null
          id: string
          labor_cost: number | null
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          parts_cost: number | null
          parts_required: Json | null
          priority: string | null
          scheduled_date: string | null
          status: string | null
          task_type: string | null
          title: string
          total_cost: number | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          completed_date?: string | null
          component_id?: string | null
          component_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labor_cost?: number | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          parts_cost?: number | null
          parts_required?: Json | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          task_type?: string | null
          title: string
          total_cost?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          attachments?: Json | null
          completed_date?: string | null
          component_id?: string | null
          component_name?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          estimated_hours?: number | null
          id?: string
          labor_cost?: number | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          parts_cost?: number | null
          parts_required?: Json | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          task_type?: string | null
          title?: string
          total_cost?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "maintenance_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "maintenance_tasks_vessel_id_fkey"
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
      mirror_instances: {
        Row: {
          config: Json | null
          created_at: string | null
          endpoint: string | null
          id: string
          instance_name: string
          last_sync: string | null
          name: string | null
          region: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          instance_name: string
          last_sync?: string | null
          name?: string | null
          region?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          endpoint?: string | null
          id?: string
          instance_name?: string
          last_sync?: string | null
          name?: string | null
          region?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      mission_agents: {
        Row: {
          agent_id: string
          agent_type: string | null
          assigned_at: string | null
          completed_at: string | null
          created_at: string | null
          id: string
          mission_id: string
          notes: string | null
          performance_score: number | null
          role: string | null
          status: string | null
        }
        Insert: {
          agent_id: string
          agent_type?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mission_id: string
          notes?: string | null
          performance_score?: number | null
          role?: string | null
          status?: string | null
        }
        Update: {
          agent_id?: string
          agent_type?: string | null
          assigned_at?: string | null
          completed_at?: string | null
          created_at?: string | null
          id?: string
          mission_id?: string
          notes?: string | null
          performance_score?: number | null
          role?: string | null
          status?: string | null
        }
        Relationships: []
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
      mission_coordination_plans: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          checkpoints: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          end_date: string | null
          id: string
          lead_vessel_id: string | null
          metadata: Json | null
          mission_type: string
          objectives: Json | null
          organization_id: string | null
          participating_vessels: string[] | null
          priority: number
          resources: Json | null
          risk_assessment: Json | null
          start_date: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          checkpoints?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lead_vessel_id?: string | null
          metadata?: Json | null
          mission_type?: string
          objectives?: Json | null
          organization_id?: string | null
          participating_vessels?: string[] | null
          priority?: number
          resources?: Json | null
          risk_assessment?: Json | null
          start_date?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          checkpoints?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          lead_vessel_id?: string | null
          metadata?: Json | null
          mission_type?: string
          objectives?: Json | null
          organization_id?: string | null
          participating_vessels?: string[] | null
          priority?: number
          resources?: Json | null
          risk_assessment?: Json | null
          start_date?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mission_coordination_plans_lead_vessel_id_fkey"
            columns: ["lead_vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_coordination_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      mission_logs: {
        Row: {
          created_at: string
          created_by: string | null
          crew_members: string[]
          description: string | null
          id: string
          location: string | null
          log_type: string | null
          message: string | null
          metadata: Json | null
          mission_date: string
          mission_id: string | null
          mission_name: string
          status: string
          timestamp: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          crew_members?: string[]
          description?: string | null
          id?: string
          location?: string | null
          log_type?: string | null
          message?: string | null
          metadata?: Json | null
          mission_date: string
          mission_id?: string | null
          mission_name: string
          status?: string
          timestamp?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          crew_members?: string[]
          description?: string | null
          id?: string
          location?: string | null
          log_type?: string | null
          message?: string | null
          metadata?: Json | null
          mission_date?: string
          mission_id?: string | null
          mission_name?: string
          status?: string
          timestamp?: string | null
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
      mission_vessels: {
        Row: {
          assigned_at: string | null
          id: string
          mission_id: string | null
          notes: string | null
          role: string | null
          status: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          assigned_at?: string | null
          id?: string
          mission_id?: string | null
          notes?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          assigned_at?: string | null
          id?: string
          mission_id?: string | null
          notes?: string | null
          role?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mission_vessels_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mission_vessels_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
          assigned_systems: Json | null
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
          mission_id: string | null
          mission_name: string
          mission_type: string
          name: string | null
          notes: string | null
          objectives: string[] | null
          organization_id: string | null
          priority: string
          progress_percent: number | null
          progress_percentage: number | null
          resources: Json | null
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
          assigned_systems?: Json | null
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
          mission_id?: string | null
          mission_name: string
          mission_type: string
          name?: string | null
          notes?: string | null
          objectives?: string[] | null
          organization_id?: string | null
          priority?: string
          progress_percent?: number | null
          progress_percentage?: number | null
          resources?: Json | null
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
          assigned_systems?: Json | null
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
          mission_id?: string | null
          mission_name?: string
          mission_type?: string
          name?: string | null
          notes?: string | null
          objectives?: string[] | null
          organization_id?: string | null
          priority?: string
          progress_percent?: number | null
          progress_percentage?: number | null
          resources?: Json | null
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
      mlc_evidence: {
        Row: {
          captured_at: string | null
          captured_by: string | null
          created_at: string
          description: string | null
          file_name: string
          file_size: number | null
          file_type: string | null
          file_url: string
          geolocation: Json | null
          id: string
          inspection_id: string
          item_id: string | null
          nc_id: string | null
        }
        Insert: {
          captured_at?: string | null
          captured_by?: string | null
          created_at?: string
          description?: string | null
          file_name: string
          file_size?: number | null
          file_type?: string | null
          file_url: string
          geolocation?: Json | null
          id?: string
          inspection_id: string
          item_id?: string | null
          nc_id?: string | null
        }
        Update: {
          captured_at?: string | null
          captured_by?: string | null
          created_at?: string
          description?: string | null
          file_name?: string
          file_size?: number | null
          file_type?: string | null
          file_url?: string
          geolocation?: Json | null
          id?: string
          inspection_id?: string
          item_id?: string | null
          nc_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mlc_evidence_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "mlc_inspections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlc_evidence_nc_id_fkey"
            columns: ["nc_id"]
            isOneToOne: false
            referencedRelation: "mlc_non_conformities"
            referencedColumns: ["id"]
          },
        ]
      }
      mlc_inspection_items: {
        Row: {
          ai_assisted: boolean | null
          answered_at: string | null
          created_at: string
          evidence_notes: string | null
          id: string
          inspection_id: string
          item_id: string
          observation: string | null
          regulation_code: string
          status: string | null
          title_number: number
          updated_at: string
        }
        Insert: {
          ai_assisted?: boolean | null
          answered_at?: string | null
          created_at?: string
          evidence_notes?: string | null
          id?: string
          inspection_id: string
          item_id: string
          observation?: string | null
          regulation_code: string
          status?: string | null
          title_number: number
          updated_at?: string
        }
        Update: {
          ai_assisted?: boolean | null
          answered_at?: string | null
          created_at?: string
          evidence_notes?: string | null
          id?: string
          inspection_id?: string
          item_id?: string
          observation?: string | null
          regulation_code?: string
          status?: string | null
          title_number?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mlc_inspection_items_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "mlc_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      mlc_inspections: {
        Row: {
          compliance_score: number | null
          compliant_items: number | null
          created_at: string
          end_date: string | null
          gross_tonnage: number | null
          id: string
          inspection_type: string | null
          inspector_name: string | null
          inspector_organization: string | null
          na_items: number | null
          non_compliant_items: number | null
          notes: string | null
          port: string | null
          port_country: string | null
          start_date: string
          status: string | null
          total_items: number | null
          updated_at: string
          user_id: string | null
          vessel_flag: string | null
          vessel_imo: string | null
          vessel_name: string
          vessel_type: string | null
        }
        Insert: {
          compliance_score?: number | null
          compliant_items?: number | null
          created_at?: string
          end_date?: string | null
          gross_tonnage?: number | null
          id?: string
          inspection_type?: string | null
          inspector_name?: string | null
          inspector_organization?: string | null
          na_items?: number | null
          non_compliant_items?: number | null
          notes?: string | null
          port?: string | null
          port_country?: string | null
          start_date?: string
          status?: string | null
          total_items?: number | null
          updated_at?: string
          user_id?: string | null
          vessel_flag?: string | null
          vessel_imo?: string | null
          vessel_name: string
          vessel_type?: string | null
        }
        Update: {
          compliance_score?: number | null
          compliant_items?: number | null
          created_at?: string
          end_date?: string | null
          gross_tonnage?: number | null
          id?: string
          inspection_type?: string | null
          inspector_name?: string | null
          inspector_organization?: string | null
          na_items?: number | null
          non_compliant_items?: number | null
          notes?: string | null
          port?: string | null
          port_country?: string | null
          start_date?: string
          status?: string | null
          total_items?: number | null
          updated_at?: string
          user_id?: string | null
          vessel_flag?: string | null
          vessel_imo?: string | null
          vessel_name?: string
          vessel_type?: string | null
        }
        Relationships: []
      }
      mlc_non_conformities: {
        Row: {
          ai_confidence: number | null
          closed_at: string | null
          closed_by: string | null
          corrective_action: string | null
          created_at: string
          deadline: string | null
          id: string
          inspection_id: string
          item_id: string
          legal_reference: string | null
          mlc_standard: string | null
          nc_type: string
          observed_condition: string
          responsible_party: string | null
          risk_assessment: string | null
          severity: string | null
          status: string | null
          technical_analysis: string | null
          updated_at: string
        }
        Insert: {
          ai_confidence?: number | null
          closed_at?: string | null
          closed_by?: string | null
          corrective_action?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          inspection_id: string
          item_id: string
          legal_reference?: string | null
          mlc_standard?: string | null
          nc_type: string
          observed_condition: string
          responsible_party?: string | null
          risk_assessment?: string | null
          severity?: string | null
          status?: string | null
          technical_analysis?: string | null
          updated_at?: string
        }
        Update: {
          ai_confidence?: number | null
          closed_at?: string | null
          closed_by?: string | null
          corrective_action?: string | null
          created_at?: string
          deadline?: string | null
          id?: string
          inspection_id?: string
          item_id?: string
          legal_reference?: string | null
          mlc_standard?: string | null
          nc_type?: string
          observed_condition?: string
          responsible_party?: string | null
          risk_assessment?: string | null
          severity?: string | null
          status?: string | null
          technical_analysis?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "mlc_non_conformities_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "mlc_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      mlc_reports: {
        Row: {
          action_plan_json: Json | null
          created_at: string
          executive_summary: string | null
          file_format: string | null
          file_url: string | null
          findings_json: Json | null
          generated_at: string
          id: string
          inspection_id: string
          inspector_signature: string | null
          master_signature: string | null
          report_number: string | null
          report_type: string | null
          signed_at: string | null
        }
        Insert: {
          action_plan_json?: Json | null
          created_at?: string
          executive_summary?: string | null
          file_format?: string | null
          file_url?: string | null
          findings_json?: Json | null
          generated_at?: string
          id?: string
          inspection_id: string
          inspector_signature?: string | null
          master_signature?: string | null
          report_number?: string | null
          report_type?: string | null
          signed_at?: string | null
        }
        Update: {
          action_plan_json?: Json | null
          created_at?: string
          executive_summary?: string | null
          file_format?: string | null
          file_url?: string | null
          findings_json?: Json | null
          generated_at?: string
          id?: string
          inspection_id?: string
          inspector_signature?: string | null
          master_signature?: string | null
          report_number?: string | null
          report_type?: string | null
          signed_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mlc_reports_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "mlc_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      mlc_rest_hours: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          compliant: boolean | null
          created_at: string
          crew_member_id: string | null
          id: string
          notes: string | null
          organization_id: string | null
          record_date: string
          rest_periods: Json
          total_rest_hours: number | null
          total_work_hours: number | null
          vessel_id: string | null
          violation_details: string | null
          violation_type: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          compliant?: boolean | null
          created_at?: string
          crew_member_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          record_date: string
          rest_periods?: Json
          total_rest_hours?: number | null
          total_work_hours?: number | null
          vessel_id?: string | null
          violation_details?: string | null
          violation_type?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          compliant?: boolean | null
          created_at?: string
          crew_member_id?: string | null
          id?: string
          notes?: string | null
          organization_id?: string | null
          record_date?: string
          rest_periods?: Json
          total_rest_hours?: number | null
          total_work_hours?: number | null
          vessel_id?: string | null
          violation_details?: string | null
          violation_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mlc_rest_hours_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlc_rest_hours_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mlc_rest_hours_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      mmi_history: {
        Row: {
          actual_hours: number | null
          ai_recommendation: string | null
          completed_date: string | null
          component_name: string | null
          created_at: string
          estimated_hours: number | null
          id: string
          maintenance_type: string | null
          metadata: Json | null
          notes: string | null
          priority: string | null
          scheduled_date: string | null
          status: string | null
          system_name: string | null
          task_description: string
          technician_id: string | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          actual_hours?: number | null
          ai_recommendation?: string | null
          completed_date?: string | null
          component_name?: string | null
          created_at?: string
          estimated_hours?: number | null
          id?: string
          maintenance_type?: string | null
          metadata?: Json | null
          notes?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          system_name?: string | null
          task_description: string
          technician_id?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          actual_hours?: number | null
          ai_recommendation?: string | null
          completed_date?: string | null
          component_name?: string | null
          created_at?: string
          estimated_hours?: number | null
          id?: string
          maintenance_type?: string | null
          metadata?: Json | null
          notes?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          system_name?: string | null
          task_description?: string
          technician_id?: string | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mmi_history_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      mmi_job_history: {
        Row: {
          action: string | null
          component: string | null
          created_at: string
          description: string | null
          embedding: string | null
          id: string
          job_id: string
          metadata: Json | null
          organization_id: string | null
          outcome: string | null
        }
        Insert: {
          action?: string | null
          component?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          job_id: string
          metadata?: Json | null
          organization_id?: string | null
          outcome?: string | null
        }
        Update: {
          action?: string | null
          component?: string | null
          created_at?: string
          description?: string | null
          embedding?: string | null
          id?: string
          job_id?: string
          metadata?: Json | null
          organization_id?: string | null
          outcome?: string | null
        }
        Relationships: []
      }
      mmi_maintenance_jobs: {
        Row: {
          actual_hours: number | null
          assigned_to: string | null
          completed_date: string | null
          component_id: string | null
          component_name: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          embedding: string | null
          estimated_hours: number | null
          id: string
          job_type: string | null
          metadata: Json | null
          organization_id: string | null
          priority: string | null
          scheduled_date: string | null
          status: string | null
          tags: string[] | null
          title: string
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          component_id?: string | null
          component_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          embedding?: string | null
          estimated_hours?: number | null
          id?: string
          job_type?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          actual_hours?: number | null
          assigned_to?: string | null
          completed_date?: string | null
          component_id?: string | null
          component_name?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          embedding?: string | null
          estimated_hours?: number | null
          id?: string
          job_type?: string | null
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          scheduled_date?: string | null
          status?: string | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mmi_maintenance_jobs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mmi_maintenance_jobs_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      mmi_os_resolvidas: {
        Row: {
          acao_tomada: string
          componente_id: string | null
          componente_nome: string | null
          created_at: string | null
          criticidade: string | null
          custo_estimado: number | null
          descricao: string | null
          embedding: string | null
          id: string
          job_id: string | null
          metadata: Json | null
          origem: string | null
          resolvido_em: string | null
          resolvido_por: string | null
          resultado: string | null
          tags: string[] | null
          tecnico_responsavel: string | null
          tempo_resolucao_horas: number | null
          titulo: string
          updated_at: string | null
        }
        Insert: {
          acao_tomada: string
          componente_id?: string | null
          componente_nome?: string | null
          created_at?: string | null
          criticidade?: string | null
          custo_estimado?: number | null
          descricao?: string | null
          embedding?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          origem?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          resultado?: string | null
          tags?: string[] | null
          tecnico_responsavel?: string | null
          tempo_resolucao_horas?: number | null
          titulo: string
          updated_at?: string | null
        }
        Update: {
          acao_tomada?: string
          componente_id?: string | null
          componente_nome?: string | null
          created_at?: string | null
          criticidade?: string | null
          custo_estimado?: number | null
          descricao?: string | null
          embedding?: string | null
          id?: string
          job_id?: string | null
          metadata?: Json | null
          origem?: string | null
          resolvido_em?: string | null
          resolvido_por?: string | null
          resultado?: string | null
          tags?: string[] | null
          tecnico_responsavel?: string | null
          tempo_resolucao_horas?: number | null
          titulo?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "mmi_os_resolvidas_job_id_fkey"
            columns: ["job_id"]
            isOneToOne: false
            referencedRelation: "mmi_maintenance_jobs"
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
      modules: {
        Row: {
          active: boolean | null
          config: Json | null
          created_at: string
          description: string | null
          id: string
          name: string
          organization_id: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          active?: boolean | null
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          organization_id?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          active?: boolean | null
          config?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          organization_id?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "modules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      modules_registry: {
        Row: {
          category: string | null
          created_at: string | null
          depends_on: string[] | null
          description: string | null
          enabled_by_default: boolean | null
          icon: string | null
          id: string
          requires_role: string[] | null
          route: string
          slug: string
          status: string | null
          title: string
          version: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          depends_on?: string[] | null
          description?: string | null
          enabled_by_default?: boolean | null
          icon?: string | null
          id?: string
          requires_role?: string[] | null
          route: string
          slug: string
          status?: string | null
          title: string
          version?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          depends_on?: string[] | null
          description?: string | null
          enabled_by_default?: boolean | null
          icon?: string | null
          id?: string
          requires_role?: string[] | null
          route?: string
          slug?: string
          status?: string | null
          title?: string
          version?: string | null
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
      noncompliance_explanations: {
        Row: {
          ai_analysis: Json | null
          created_at: string | null
          crew_member_id: string | null
          explanation: string
          id: string
          noncompliance_id: string
          organization_id: string
          reviewed_at: string | null
          reviewed_by: string | null
          severity: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          created_at?: string | null
          crew_member_id?: string | null
          explanation: string
          id?: string
          noncompliance_id: string
          organization_id: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          created_at?: string | null
          crew_member_id?: string | null
          explanation?: string
          id?: string
          noncompliance_id?: string
          organization_id?: string
          reviewed_at?: string | null
          reviewed_by?: string | null
          severity?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "noncompliance_explanations_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noncompliance_explanations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "noncompliance_explanations_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
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
      oauth_connections: {
        Row: {
          access_token: string | null
          created_at: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          organization_id: string | null
          provider: string
          provider_user_id: string | null
          refresh_token: string | null
          scope: string | null
          token_expires_at: string | null
          updated_at: string | null
        }
        Insert: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          provider: string
          provider_user_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Update: {
          access_token?: string | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          organization_id?: string | null
          provider?: string
          provider_user_id?: string | null
          refresh_token?: string | null
          scope?: string | null
          token_expires_at?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "oauth_connections_organization_id_fkey"
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
      onnx_models: {
        Row: {
          accuracy_score: number | null
          created_at: string
          description: string | null
          file_path: string | null
          file_size_bytes: number | null
          id: string
          input_schema: Json | null
          is_active: boolean | null
          metadata: Json | null
          model_name: string
          model_type: string
          model_version: string
          name: string | null
          organization_id: string | null
          output_schema: Json | null
          performance_metrics: Json | null
          status: string | null
          updated_at: string
          version: string | null
        }
        Insert: {
          accuracy_score?: number | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          metadata?: Json | null
          model_name: string
          model_type: string
          model_version?: string
          name?: string | null
          organization_id?: string | null
          output_schema?: Json | null
          performance_metrics?: Json | null
          status?: string | null
          updated_at?: string
          version?: string | null
        }
        Update: {
          accuracy_score?: number | null
          created_at?: string
          description?: string | null
          file_path?: string | null
          file_size_bytes?: number | null
          id?: string
          input_schema?: Json | null
          is_active?: boolean | null
          metadata?: Json | null
          model_name?: string
          model_type?: string
          model_version?: string
          name?: string | null
          organization_id?: string | null
          output_schema?: Json | null
          performance_metrics?: Json | null
          status?: string | null
          updated_at?: string
          version?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "onnx_models_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      organization_members: {
        Row: {
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          joined_at: string | null
          last_active_at: string | null
          metadata: Json | null
          organization_id: string
          permissions: Json | null
          role: string
          status: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          metadata?: Json | null
          organization_id: string
          permissions?: Json | null
          role: string
          status?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          joined_at?: string | null
          last_active_at?: string | null
          metadata?: Json | null
          organization_id?: string
          permissions?: Json | null
          role?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "organization_members_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
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
      ovid_answers: {
        Row: {
          answer: string | null
          chapter_id: string
          created_at: string
          id: string
          inspection_id: string
          observation: string | null
          question_id: string
          updated_at: string
        }
        Insert: {
          answer?: string | null
          chapter_id: string
          created_at?: string
          id?: string
          inspection_id: string
          observation?: string | null
          question_id: string
          updated_at?: string
        }
        Update: {
          answer?: string | null
          chapter_id?: string
          created_at?: string
          id?: string
          inspection_id?: string
          observation?: string | null
          question_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "ovid_answers_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "ovid_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      ovid_evidence_photos: {
        Row: {
          answer_id: string | null
          caption: string | null
          created_at: string
          file_name: string
          file_path: string
          file_size: number | null
          id: string
          inspection_id: string
          latitude: number | null
          longitude: number | null
          mime_type: string | null
          question_id: string
          taken_at: string | null
        }
        Insert: {
          answer_id?: string | null
          caption?: string | null
          created_at?: string
          file_name: string
          file_path: string
          file_size?: number | null
          id?: string
          inspection_id: string
          latitude?: number | null
          longitude?: number | null
          mime_type?: string | null
          question_id: string
          taken_at?: string | null
        }
        Update: {
          answer_id?: string | null
          caption?: string | null
          created_at?: string
          file_name?: string
          file_path?: string
          file_size?: number | null
          id?: string
          inspection_id?: string
          latitude?: number | null
          longitude?: number | null
          mime_type?: string | null
          question_id?: string
          taken_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ovid_evidence_photos_answer_id_fkey"
            columns: ["answer_id"]
            isOneToOne: false
            referencedRelation: "ovid_answers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ovid_evidence_photos_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "ovid_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      ovid_inspections: {
        Row: {
          completed_at: string | null
          compliance_score: number | null
          compliant_count: number | null
          created_at: string
          id: string
          imo_number: string
          inspection_date: string
          inspector_name: string
          location: string | null
          non_compliant_count: number | null
          not_applicable_count: number | null
          notes: string | null
          operator: string | null
          status: string
          total_questions: number | null
          updated_at: string
          user_id: string | null
          vessel_name: string
          vessel_type: string
        }
        Insert: {
          completed_at?: string | null
          compliance_score?: number | null
          compliant_count?: number | null
          created_at?: string
          id?: string
          imo_number: string
          inspection_date: string
          inspector_name: string
          location?: string | null
          non_compliant_count?: number | null
          not_applicable_count?: number | null
          notes?: string | null
          operator?: string | null
          status?: string
          total_questions?: number | null
          updated_at?: string
          user_id?: string | null
          vessel_name: string
          vessel_type: string
        }
        Update: {
          completed_at?: string | null
          compliance_score?: number | null
          compliant_count?: number | null
          created_at?: string
          id?: string
          imo_number?: string
          inspection_date?: string
          inspector_name?: string
          location?: string | null
          non_compliant_count?: number | null
          not_applicable_count?: number | null
          notes?: string | null
          operator?: string | null
          status?: string
          total_questions?: number | null
          updated_at?: string
          user_id?: string | null
          vessel_name?: string
          vessel_type?: string
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
      peo_dp_ai_evidences: {
        Row: {
          ai_corrective_plan: string | null
          ai_normative_reference: string | null
          ai_risk_assessment: string | null
          ai_technical_analysis: string | null
          audit_id: string | null
          created_at: string | null
          id: string
          non_conformity_description: string | null
          requirement_id: string | null
          requirement_number: string | null
          section: string | null
        }
        Insert: {
          ai_corrective_plan?: string | null
          ai_normative_reference?: string | null
          ai_risk_assessment?: string | null
          ai_technical_analysis?: string | null
          audit_id?: string | null
          created_at?: string | null
          id?: string
          non_conformity_description?: string | null
          requirement_id?: string | null
          requirement_number?: string | null
          section?: string | null
        }
        Update: {
          ai_corrective_plan?: string | null
          ai_normative_reference?: string | null
          ai_risk_assessment?: string | null
          ai_technical_analysis?: string | null
          audit_id?: string | null
          created_at?: string | null
          id?: string
          non_conformity_description?: string | null
          requirement_id?: string | null
          requirement_number?: string | null
          section?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peo_dp_ai_evidences_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "peo_dp_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peo_dp_ai_evidences_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "peo_dp_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      peo_dp_audits: {
        Row: {
          audit_date: string | null
          audit_status: string | null
          auditor_name: string | null
          company_name: string | null
          created_at: string | null
          id: string
          organization_id: string | null
          overall_conformity: number | null
          program_id: string | null
          section_31_conformity: number | null
          section_32_conformity: number | null
          section_33_conformity: number | null
          section_34_conformity: number | null
          section_35_conformity: number | null
          section_36_conformity: number | null
          section_37_conformity: number | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          audit_date?: string | null
          audit_status?: string | null
          auditor_name?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          overall_conformity?: number | null
          program_id?: string | null
          section_31_conformity?: number | null
          section_32_conformity?: number | null
          section_33_conformity?: number | null
          section_34_conformity?: number | null
          section_35_conformity?: number | null
          section_36_conformity?: number | null
          section_37_conformity?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          audit_date?: string | null
          audit_status?: string | null
          auditor_name?: string | null
          company_name?: string | null
          created_at?: string | null
          id?: string
          organization_id?: string | null
          overall_conformity?: number | null
          program_id?: string | null
          section_31_conformity?: number | null
          section_32_conformity?: number | null
          section_33_conformity?: number | null
          section_34_conformity?: number | null
          section_35_conformity?: number | null
          section_36_conformity?: number | null
          section_37_conformity?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peo_dp_audits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peo_dp_audits_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "peo_dp_program"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peo_dp_audits_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      peo_dp_program: {
        Row: {
          created_at: string | null
          id: string
          publication_date: string | null
          total_requirements: number | null
          total_sections: number | null
          version: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          publication_date?: string | null
          total_requirements?: number | null
          total_sections?: number | null
          version?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          id?: string
          publication_date?: string | null
          total_requirements?: number | null
          total_sections?: number | null
          version?: string | null
          year?: number
        }
        Relationships: []
      }
      peo_dp_requirements: {
        Row: {
          created_at: string | null
          criticality_level: string | null
          evidence_required: string[] | null
          frequency: string | null
          id: string
          program_id: string | null
          requirement_description: string | null
          requirement_number: string
          requirement_title: string
          section: string
          section_name: string
        }
        Insert: {
          created_at?: string | null
          criticality_level?: string | null
          evidence_required?: string[] | null
          frequency?: string | null
          id?: string
          program_id?: string | null
          requirement_description?: string | null
          requirement_number: string
          requirement_title: string
          section: string
          section_name: string
        }
        Update: {
          created_at?: string | null
          criticality_level?: string | null
          evidence_required?: string[] | null
          frequency?: string | null
          id?: string
          program_id?: string | null
          requirement_description?: string | null
          requirement_number?: string
          requirement_title?: string
          section?: string
          section_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "peo_dp_requirements_program_id_fkey"
            columns: ["program_id"]
            isOneToOne: false
            referencedRelation: "peo_dp_program"
            referencedColumns: ["id"]
          },
        ]
      }
      peo_dp_responses: {
        Row: {
          ai_analysis: string | null
          ai_corrective_plan: string | null
          audit_id: string | null
          auditor_notes: string | null
          evidence_files: string[] | null
          id: string
          requirement_id: string | null
          response_date: string | null
          status: string
        }
        Insert: {
          ai_analysis?: string | null
          ai_corrective_plan?: string | null
          audit_id?: string | null
          auditor_notes?: string | null
          evidence_files?: string[] | null
          id?: string
          requirement_id?: string | null
          response_date?: string | null
          status: string
        }
        Update: {
          ai_analysis?: string | null
          ai_corrective_plan?: string | null
          audit_id?: string | null
          auditor_notes?: string | null
          evidence_files?: string[] | null
          id?: string
          requirement_id?: string | null
          response_date?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "peo_dp_responses_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "peo_dp_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peo_dp_responses_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "peo_dp_requirements"
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
      peodp_requirements_2021: {
        Row: {
          category: string | null
          created_at: string | null
          criticality: string | null
          element_name: string
          element_number: number
          evidence_required: string[] | null
          id: string
          reference_document: string | null
          requirement_code: string
          requirement_text: string
          updated_at: string | null
          verification_method: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          criticality?: string | null
          element_name: string
          element_number: number
          evidence_required?: string[] | null
          id?: string
          reference_document?: string | null
          requirement_code: string
          requirement_text: string
          updated_at?: string | null
          verification_method?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          criticality?: string | null
          element_name?: string
          element_number?: number
          evidence_required?: string[] | null
          id?: string
          reference_document?: string | null
          requirement_code?: string
          requirement_text?: string
          updated_at?: string | null
          verification_method?: string | null
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
      peotram_ai_evidences_2024: {
        Row: {
          ai_confidence: number | null
          audit_id: string | null
          audit_response_id: string | null
          corrective_action_plan: string | null
          docx_file_path: string | null
          element_number: number | null
          evidence_title: string
          full_content: string | null
          generated_at: string | null
          generated_by_ai: boolean | null
          id: string
          item_number: string | null
          norm_reference: string | null
          pdf_file_path: string | null
          recommendations: string | null
          risk_identified: string | null
          technical_analysis: string | null
        }
        Insert: {
          ai_confidence?: number | null
          audit_id?: string | null
          audit_response_id?: string | null
          corrective_action_plan?: string | null
          docx_file_path?: string | null
          element_number?: number | null
          evidence_title: string
          full_content?: string | null
          generated_at?: string | null
          generated_by_ai?: boolean | null
          id?: string
          item_number?: string | null
          norm_reference?: string | null
          pdf_file_path?: string | null
          recommendations?: string | null
          risk_identified?: string | null
          technical_analysis?: string | null
        }
        Update: {
          ai_confidence?: number | null
          audit_id?: string | null
          audit_response_id?: string | null
          corrective_action_plan?: string | null
          docx_file_path?: string | null
          element_number?: number | null
          evidence_title?: string
          full_content?: string | null
          generated_at?: string | null
          generated_by_ai?: boolean | null
          id?: string
          item_number?: string | null
          norm_reference?: string | null
          pdf_file_path?: string | null
          recommendations?: string | null
          risk_identified?: string | null
          technical_analysis?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_ai_evidences_2024_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "peotram_audits_2024"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peotram_ai_evidences_2024_audit_response_id_fkey"
            columns: ["audit_response_id"]
            isOneToOne: false
            referencedRelation: "peotram_audit_responses_2024"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_audit_responses_2024: {
        Row: {
          audit_id: string | null
          auditor_notes: string | null
          documentary_evidence: string[] | null
          element_number: number
          id: string
          item_id: string | null
          item_number: string
          nc_classification: string | null
          observed_condition: string | null
          photographic_evidence: string[] | null
          response_date: string | null
          score: number | null
          status: string
          updated_at: string | null
        }
        Insert: {
          audit_id?: string | null
          auditor_notes?: string | null
          documentary_evidence?: string[] | null
          element_number: number
          id?: string
          item_id?: string | null
          item_number: string
          nc_classification?: string | null
          observed_condition?: string | null
          photographic_evidence?: string[] | null
          response_date?: string | null
          score?: number | null
          status: string
          updated_at?: string | null
        }
        Update: {
          audit_id?: string | null
          auditor_notes?: string | null
          documentary_evidence?: string[] | null
          element_number?: number
          id?: string
          item_id?: string | null
          item_number?: string
          nc_classification?: string | null
          observed_condition?: string | null
          photographic_evidence?: string[] | null
          response_date?: string | null
          score?: number | null
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_audit_responses_2024_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "peotram_audits_2024"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peotram_audit_responses_2024_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "peotram_items_2024"
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
      peotram_audits_2024: {
        Row: {
          audit_date: string
          audit_status: string | null
          auditor_id: string | null
          auditor_name: string | null
          conformant_items: number | null
          created_at: string | null
          element_1_score: number | null
          element_10_score: number | null
          element_11_score: number | null
          element_12_score: number | null
          element_13_score: number | null
          element_2_score: number | null
          element_3_score: number | null
          element_4_score: number | null
          element_5_score: number | null
          element_6_score: number | null
          element_7_score: number | null
          element_8_score: number | null
          element_9_score: number | null
          end_date: string | null
          id: string
          non_conformant_items: number | null
          notes: string | null
          observations_items: number | null
          organization_id: string | null
          overall_score: number | null
          report_docx_path: string | null
          report_pdf_path: string | null
          start_date: string | null
          structure_id: string | null
          total_items_evaluated: number | null
          updated_at: string | null
          vessel_id: string | null
          vessel_imo: string | null
          vessel_name: string | null
        }
        Insert: {
          audit_date?: string
          audit_status?: string | null
          auditor_id?: string | null
          auditor_name?: string | null
          conformant_items?: number | null
          created_at?: string | null
          element_1_score?: number | null
          element_10_score?: number | null
          element_11_score?: number | null
          element_12_score?: number | null
          element_13_score?: number | null
          element_2_score?: number | null
          element_3_score?: number | null
          element_4_score?: number | null
          element_5_score?: number | null
          element_6_score?: number | null
          element_7_score?: number | null
          element_8_score?: number | null
          element_9_score?: number | null
          end_date?: string | null
          id?: string
          non_conformant_items?: number | null
          notes?: string | null
          observations_items?: number | null
          organization_id?: string | null
          overall_score?: number | null
          report_docx_path?: string | null
          report_pdf_path?: string | null
          start_date?: string | null
          structure_id?: string | null
          total_items_evaluated?: number | null
          updated_at?: string | null
          vessel_id?: string | null
          vessel_imo?: string | null
          vessel_name?: string | null
        }
        Update: {
          audit_date?: string
          audit_status?: string | null
          auditor_id?: string | null
          auditor_name?: string | null
          conformant_items?: number | null
          created_at?: string | null
          element_1_score?: number | null
          element_10_score?: number | null
          element_11_score?: number | null
          element_12_score?: number | null
          element_13_score?: number | null
          element_2_score?: number | null
          element_3_score?: number | null
          element_4_score?: number | null
          element_5_score?: number | null
          element_6_score?: number | null
          element_7_score?: number | null
          element_8_score?: number | null
          element_9_score?: number | null
          end_date?: string | null
          id?: string
          non_conformant_items?: number | null
          notes?: string | null
          observations_items?: number | null
          organization_id?: string | null
          overall_score?: number | null
          report_docx_path?: string | null
          report_pdf_path?: string | null
          start_date?: string | null
          structure_id?: string | null
          total_items_evaluated?: number | null
          updated_at?: string | null
          vessel_id?: string | null
          vessel_imo?: string | null
          vessel_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_audits_2024_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "peotram_structures"
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
      peotram_elements: {
        Row: {
          created_at: string | null
          description: string | null
          element_name: string
          element_number: number
          id: string
          is_critical: boolean | null
          items: Json | null
          peotram_audit_id: string | null
          score: number | null
          status: string | null
          updated_at: string | null
          weight_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          element_name: string
          element_number: number
          id?: string
          is_critical?: boolean | null
          items?: Json | null
          peotram_audit_id?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
          weight_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          element_name?: string
          element_number?: number
          id?: string
          is_critical?: boolean | null
          items?: Json | null
          peotram_audit_id?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
          weight_percentage?: number | null
        }
        Relationships: []
      }
      peotram_elements_2024: {
        Row: {
          created_at: string | null
          description: string | null
          documentation_required: Json | null
          element_name: string
          element_number: number
          element_sigla: string | null
          id: string
          importance_level: string | null
          is_critical: boolean | null
          norms_referenced: string[] | null
          structure_id: string | null
          total_items: number | null
          weight_percentage: number | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          documentation_required?: Json | null
          element_name: string
          element_number: number
          element_sigla?: string | null
          id?: string
          importance_level?: string | null
          is_critical?: boolean | null
          norms_referenced?: string[] | null
          structure_id?: string | null
          total_items?: number | null
          weight_percentage?: number | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          documentation_required?: Json | null
          element_name?: string
          element_number?: number
          element_sigla?: string | null
          id?: string
          importance_level?: string | null
          is_critical?: boolean | null
          norms_referenced?: string[] | null
          structure_id?: string | null
          total_items?: number | null
          weight_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_elements_2024_structure_id_fkey"
            columns: ["structure_id"]
            isOneToOne: false
            referencedRelation: "peotram_structures"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_evidences: {
        Row: {
          ai_confidence: number | null
          corrective_action: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          evidence_type: string | null
          file_path: string | null
          generated_at: string | null
          generated_by_ai: boolean | null
          id: string
          norm_reference: string | null
          organization_id: string | null
          peotram_item_id: string | null
          recommendations: string | null
          risk_identified: string | null
          signature_data: Json | null
          signature_path: string | null
          signed_at: string | null
          technical_analysis: string | null
          title: string
        }
        Insert: {
          ai_confidence?: number | null
          corrective_action?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evidence_type?: string | null
          file_path?: string | null
          generated_at?: string | null
          generated_by_ai?: boolean | null
          id?: string
          norm_reference?: string | null
          organization_id?: string | null
          peotram_item_id?: string | null
          recommendations?: string | null
          risk_identified?: string | null
          signature_data?: Json | null
          signature_path?: string | null
          signed_at?: string | null
          technical_analysis?: string | null
          title: string
        }
        Update: {
          ai_confidence?: number | null
          corrective_action?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evidence_type?: string | null
          file_path?: string | null
          generated_at?: string | null
          generated_by_ai?: boolean | null
          id?: string
          norm_reference?: string | null
          organization_id?: string | null
          peotram_item_id?: string | null
          recommendations?: string | null
          risk_identified?: string | null
          signature_data?: Json | null
          signature_path?: string | null
          signed_at?: string | null
          technical_analysis?: string | null
          title?: string
        }
        Relationships: [
          {
            foreignKeyName: "peotram_evidences_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peotram_evidences_peotram_item_id_fkey"
            columns: ["peotram_item_id"]
            isOneToOne: false
            referencedRelation: "peotram_items"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_items: {
        Row: {
          auditor_notes: string | null
          created_at: string | null
          evidence_required: Json | null
          id: string
          item_description: string
          item_number: string
          norm_reference: string | null
          peotram_element_id: string | null
          requirement: string | null
          score: number | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          auditor_notes?: string | null
          created_at?: string | null
          evidence_required?: Json | null
          id?: string
          item_description: string
          item_number: string
          norm_reference?: string | null
          peotram_element_id?: string | null
          requirement?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          auditor_notes?: string | null
          created_at?: string | null
          evidence_required?: Json | null
          id?: string
          item_description?: string
          item_number?: string
          norm_reference?: string | null
          peotram_element_id?: string | null
          requirement?: string | null
          score?: number | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_items_peotram_element_id_fkey"
            columns: ["peotram_element_id"]
            isOneToOne: false
            referencedRelation: "peotram_elements"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_items_2024: {
        Row: {
          created_at: string | null
          criticality_level: string | null
          description: string | null
          element_id: string | null
          evidence_required: string[] | null
          id: string
          item_name: string
          item_number: string
          norm_reference: string | null
          possible_non_conformities: string[] | null
          requirement: string | null
          section_id: string | null
          verification_criteria_compliant: string | null
          verification_criteria_non_compliant: string | null
        }
        Insert: {
          created_at?: string | null
          criticality_level?: string | null
          description?: string | null
          element_id?: string | null
          evidence_required?: string[] | null
          id?: string
          item_name: string
          item_number: string
          norm_reference?: string | null
          possible_non_conformities?: string[] | null
          requirement?: string | null
          section_id?: string | null
          verification_criteria_compliant?: string | null
          verification_criteria_non_compliant?: string | null
        }
        Update: {
          created_at?: string | null
          criticality_level?: string | null
          description?: string | null
          element_id?: string | null
          evidence_required?: string[] | null
          id?: string
          item_name?: string
          item_number?: string
          norm_reference?: string | null
          possible_non_conformities?: string[] | null
          requirement?: string | null
          section_id?: string | null
          verification_criteria_compliant?: string | null
          verification_criteria_non_compliant?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_items_2024_element_id_fkey"
            columns: ["element_id"]
            isOneToOne: false
            referencedRelation: "peotram_elements_2024"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "peotram_items_2024_section_id_fkey"
            columns: ["section_id"]
            isOneToOne: false
            referencedRelation: "peotram_sections"
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
      peotram_sections: {
        Row: {
          created_at: string | null
          description: string | null
          element_id: string | null
          id: string
          section_name: string
          section_number: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          element_id?: string | null
          id?: string
          section_name: string
          section_number: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          element_id?: string | null
          id?: string
          section_name?: string
          section_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "peotram_sections_element_id_fkey"
            columns: ["element_id"]
            isOneToOne: false
            referencedRelation: "peotram_elements_2024"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_signatures: {
        Row: {
          audit_id: string | null
          id: string
          ip_address: string | null
          signature_data: string | null
          signature_image_path: string | null
          signed_at: string | null
          signer_email: string | null
          signer_name: string
          signer_role: string
        }
        Insert: {
          audit_id?: string | null
          id?: string
          ip_address?: string | null
          signature_data?: string | null
          signature_image_path?: string | null
          signed_at?: string | null
          signer_email?: string | null
          signer_name: string
          signer_role: string
        }
        Update: {
          audit_id?: string | null
          id?: string
          ip_address?: string | null
          signature_data?: string | null
          signature_image_path?: string | null
          signed_at?: string | null
          signer_email?: string | null
          signer_name?: string
          signer_role?: string
        }
        Relationships: [
          {
            foreignKeyName: "peotram_signatures_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "peotram_audits_2024"
            referencedColumns: ["id"]
          },
        ]
      }
      peotram_structures: {
        Row: {
          created_at: string | null
          created_by: string | null
          cycle: string
          id: string
          total_elements: number | null
          total_items: number | null
          updated_at: string | null
          year: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          cycle: string
          id?: string
          total_elements?: number | null
          total_items?: number | null
          updated_at?: string | null
          year: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          cycle?: string
          id?: string
          total_elements?: number | null
          total_items?: number | null
          updated_at?: string | null
          year?: number
        }
        Relationships: []
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
      peotram_voice_chats: {
        Row: {
          ai_response_audio_path: string | null
          ai_response_text: string | null
          context_element: number | null
          context_item: string | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          language: string | null
          organization_id: string | null
          peotram_audit_id: string | null
          question: string
          user_id: string | null
        }
        Insert: {
          ai_response_audio_path?: string | null
          ai_response_text?: string | null
          context_element?: number | null
          context_item?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          organization_id?: string | null
          peotram_audit_id?: string | null
          question: string
          user_id?: string | null
        }
        Update: {
          ai_response_audio_path?: string | null
          ai_response_text?: string | null
          context_element?: number | null
          context_item?: string | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          organization_id?: string | null
          peotram_audit_id?: string | null
          question?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "peotram_voice_chats_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      performance_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          current_value: number | null
          id: string
          message: string | null
          metadata: Json | null
          metric_name: string | null
          module_name: string | null
          organization_id: string | null
          resolved_at: string | null
          severity: string | null
          status: string | null
          threshold_value: number | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          message?: string | null
          metadata?: Json | null
          metric_name?: string | null
          module_name?: string | null
          organization_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          threshold_value?: number | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          current_value?: number | null
          id?: string
          message?: string | null
          metadata?: Json | null
          metric_name?: string | null
          module_name?: string | null
          organization_id?: string | null
          resolved_at?: string | null
          severity?: string | null
          status?: string | null
          threshold_value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "performance_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      performance_outliers: {
        Row: {
          created_at: string
          detected_at: string | null
          deviation_percent: number | null
          entity_id: string
          entity_name: string | null
          entity_type: string
          expected_value: number | null
          id: string
          is_resolved: boolean | null
          metadata: Json | null
          metric_name: string
          metric_value: number | null
          organization_id: string | null
          resolution_notes: string | null
          resolved_at: string | null
          resolved_by: string | null
          severity: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          detected_at?: string | null
          deviation_percent?: number | null
          entity_id: string
          entity_name?: string | null
          entity_type: string
          expected_value?: number | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          metric_name: string
          metric_value?: number | null
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          detected_at?: string | null
          deviation_percent?: number | null
          entity_id?: string
          entity_name?: string | null
          entity_type?: string
          expected_value?: number | null
          id?: string
          is_resolved?: boolean | null
          metadata?: Json | null
          metric_name?: string
          metric_value?: number | null
          organization_id?: string | null
          resolution_notes?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          severity?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "performance_outliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      port_calls: {
        Row: {
          actual_costs: number | null
          agent_contact: string | null
          agent_name: string | null
          ai_optimized: boolean | null
          ata: string | null
          atb: string | null
          atd: string | null
          berth_number: string | null
          country: string | null
          created_at: string | null
          documents_status: string | null
          estimated_costs: number | null
          eta: string
          etb: string | null
          etd: string | null
          id: string
          metadata: Json | null
          optimization_savings: number | null
          organization_id: string | null
          port_code: string | null
          port_name: string
          psc_risk_level: string | null
          purpose: string
          status: string | null
          updated_at: string | null
          vessel_id: string | null
          waiting_time_hours: number | null
        }
        Insert: {
          actual_costs?: number | null
          agent_contact?: string | null
          agent_name?: string | null
          ai_optimized?: boolean | null
          ata?: string | null
          atb?: string | null
          atd?: string | null
          berth_number?: string | null
          country?: string | null
          created_at?: string | null
          documents_status?: string | null
          estimated_costs?: number | null
          eta: string
          etb?: string | null
          etd?: string | null
          id?: string
          metadata?: Json | null
          optimization_savings?: number | null
          organization_id?: string | null
          port_code?: string | null
          port_name: string
          psc_risk_level?: string | null
          purpose: string
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
          waiting_time_hours?: number | null
        }
        Update: {
          actual_costs?: number | null
          agent_contact?: string | null
          agent_name?: string | null
          ai_optimized?: boolean | null
          ata?: string | null
          atb?: string | null
          atd?: string | null
          berth_number?: string | null
          country?: string | null
          created_at?: string | null
          documents_status?: string | null
          estimated_costs?: number | null
          eta?: string
          etb?: string | null
          etd?: string | null
          id?: string
          metadata?: Json | null
          optimization_savings?: number | null
          organization_id?: string | null
          port_code?: string | null
          port_name?: string
          psc_risk_level?: string | null
          purpose?: string
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
          waiting_time_hours?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "port_calls_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "port_calls_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      port_costs: {
        Row: {
          actual_amount: number | null
          approved_by: string | null
          cost_category: string
          created_at: string | null
          currency: string | null
          description: string | null
          estimated_amount: number | null
          id: string
          invoice_reference: string | null
          port_call_id: string | null
        }
        Insert: {
          actual_amount?: number | null
          approved_by?: string | null
          cost_category: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          estimated_amount?: number | null
          id?: string
          invoice_reference?: string | null
          port_call_id?: string | null
        }
        Update: {
          actual_amount?: number | null
          approved_by?: string | null
          cost_category?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          estimated_amount?: number | null
          id?: string
          invoice_reference?: string | null
          port_call_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "port_costs_port_call_id_fkey"
            columns: ["port_call_id"]
            isOneToOne: false
            referencedRelation: "port_calls"
            referencedColumns: ["id"]
          },
        ]
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
      preovid_audits: {
        Row: {
          answered_questions: number | null
          audit_date: string
          completed_at: string | null
          compliant_count: number | null
          created_at: string | null
          created_by: string | null
          id: string
          inspector_company: string | null
          inspector_name: string
          metadata: Json | null
          non_compliant_count: number | null
          not_applicable_count: number | null
          notes: string | null
          observation_count: number | null
          organization_id: string | null
          overall_score: number | null
          port_location: string | null
          started_at: string | null
          status: string
          submitted_at: string | null
          total_questions: number | null
          updated_at: string | null
          vessel_id: string | null
          vessel_imo: string | null
          vessel_name: string
          vessel_type: string | null
        }
        Insert: {
          answered_questions?: number | null
          audit_date?: string
          completed_at?: string | null
          compliant_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          inspector_company?: string | null
          inspector_name: string
          metadata?: Json | null
          non_compliant_count?: number | null
          not_applicable_count?: number | null
          notes?: string | null
          observation_count?: number | null
          organization_id?: string | null
          overall_score?: number | null
          port_location?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          total_questions?: number | null
          updated_at?: string | null
          vessel_id?: string | null
          vessel_imo?: string | null
          vessel_name: string
          vessel_type?: string | null
        }
        Update: {
          answered_questions?: number | null
          audit_date?: string
          completed_at?: string | null
          compliant_count?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          inspector_company?: string | null
          inspector_name?: string
          metadata?: Json | null
          non_compliant_count?: number | null
          not_applicable_count?: number | null
          notes?: string | null
          observation_count?: number | null
          organization_id?: string | null
          overall_score?: number | null
          port_location?: string | null
          started_at?: string | null
          status?: string
          submitted_at?: string | null
          total_questions?: number | null
          updated_at?: string | null
          vessel_id?: string | null
          vessel_imo?: string | null
          vessel_name?: string
          vessel_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preovid_audits_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preovid_audits_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      preovid_blocks: {
        Row: {
          block_number: number
          code: string
          created_at: string | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          name_pt: string | null
          order_index: number
          total_items: number | null
        }
        Insert: {
          block_number: number
          code: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          name_pt?: string | null
          order_index: number
          total_items?: number | null
        }
        Update: {
          block_number?: number
          code?: string
          created_at?: string | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          name_pt?: string | null
          order_index?: number
          total_items?: number | null
        }
        Relationships: []
      }
      preovid_items: {
        Row: {
          block_id: string | null
          category: string | null
          chapter_number: string
          created_at: string | null
          guidance_notes: string | null
          id: string
          is_active: boolean | null
          is_critical: boolean | null
          order_index: number | null
          question_code: string
          question_text: string
          regulatory_reference: string | null
          risk_level: string | null
          updated_at: string | null
          vessel_types: string[] | null
        }
        Insert: {
          block_id?: string | null
          category?: string | null
          chapter_number: string
          created_at?: string | null
          guidance_notes?: string | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          order_index?: number | null
          question_code: string
          question_text: string
          regulatory_reference?: string | null
          risk_level?: string | null
          updated_at?: string | null
          vessel_types?: string[] | null
        }
        Update: {
          block_id?: string | null
          category?: string | null
          chapter_number?: string
          created_at?: string | null
          guidance_notes?: string | null
          id?: string
          is_active?: boolean | null
          is_critical?: boolean | null
          order_index?: number | null
          question_code?: string
          question_text?: string
          regulatory_reference?: string | null
          risk_level?: string | null
          updated_at?: string | null
          vessel_types?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "preovid_items_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "preovid_blocks"
            referencedColumns: ["id"]
          },
        ]
      }
      preovid_responses: {
        Row: {
          ai_suggestion: string | null
          answered_at: string | null
          answered_by: string | null
          assigned_to: string | null
          audit_id: string
          block_id: string | null
          chapter_number: string
          corrective_action: string | null
          corrective_action_deadline: string | null
          created_at: string | null
          evidence_photos: Json | null
          evidence_text: string | null
          id: string
          inspector_notes: string | null
          is_flagged: boolean | null
          item_id: string | null
          priority: string | null
          question_code: string
          question_text: string
          response_status: string
          updated_at: string | null
        }
        Insert: {
          ai_suggestion?: string | null
          answered_at?: string | null
          answered_by?: string | null
          assigned_to?: string | null
          audit_id: string
          block_id?: string | null
          chapter_number: string
          corrective_action?: string | null
          corrective_action_deadline?: string | null
          created_at?: string | null
          evidence_photos?: Json | null
          evidence_text?: string | null
          id?: string
          inspector_notes?: string | null
          is_flagged?: boolean | null
          item_id?: string | null
          priority?: string | null
          question_code: string
          question_text: string
          response_status?: string
          updated_at?: string | null
        }
        Update: {
          ai_suggestion?: string | null
          answered_at?: string | null
          answered_by?: string | null
          assigned_to?: string | null
          audit_id?: string
          block_id?: string | null
          chapter_number?: string
          corrective_action?: string | null
          corrective_action_deadline?: string | null
          created_at?: string | null
          evidence_photos?: Json | null
          evidence_text?: string | null
          id?: string
          inspector_notes?: string | null
          is_flagged?: boolean | null
          item_id?: string | null
          priority?: string | null
          question_code?: string
          question_text?: string
          response_status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "preovid_responses_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "preovid_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preovid_responses_block_id_fkey"
            columns: ["block_id"]
            isOneToOne: false
            referencedRelation: "preovid_blocks"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "preovid_responses_item_id_fkey"
            columns: ["item_id"]
            isOneToOne: false
            referencedRelation: "preovid_items"
            referencedColumns: ["id"]
          },
        ]
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
          frequency: string | null
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
          frequency?: string | null
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
          frequency?: string | null
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
      priority_shifts: {
        Row: {
          context: Json | null
          created_at: string | null
          id: string
          is_active: boolean | null
          module_name: string
          new_priority: number
          old_priority: number
          organization_id: string | null
          reason: string | null
          reverted_at: string | null
          shift_type: string | null
          triggered_by: string | null
        }
        Insert: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          module_name: string
          new_priority: number
          old_priority: number
          organization_id?: string | null
          reason?: string | null
          reverted_at?: string | null
          shift_type?: string | null
          triggered_by?: string | null
        }
        Update: {
          context?: Json | null
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          module_name?: string
          new_priority?: number
          old_priority?: number
          organization_id?: string | null
          reason?: string | null
          reverted_at?: string | null
          shift_type?: string | null
          triggered_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "priority_shifts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      proactive_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          ai_suggestion: string | null
          alert_type: string
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          resolved_at: string | null
          severity: string
          source: string
          status: string
          title: string
          vessel_id: string | null
          webhook_sent: boolean | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_suggestion?: string | null
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          source: string
          status?: string
          title: string
          vessel_id?: string | null
          webhook_sent?: boolean | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          ai_suggestion?: string | null
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          resolved_at?: string | null
          severity?: string
          source?: string
          status?: string
          title?: string
          vessel_id?: string | null
          webhook_sent?: boolean | null
        }
        Relationships: []
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
      procurement_orders: {
        Row: {
          approved_at: string | null
          approved_by: string | null
          created_at: string
          currency: string | null
          delivery_date: string | null
          delivery_port: string | null
          id: string
          items: Json | null
          metadata: Json | null
          notes: string | null
          order_number: string
          order_type: string | null
          organization_id: string | null
          priority: string | null
          requested_by: string | null
          status: string | null
          subtotal: number | null
          supplier_id: string | null
          supplier_name: string | null
          total_amount: number | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          delivery_port?: string | null
          id?: string
          items?: Json | null
          metadata?: Json | null
          notes?: string | null
          order_number: string
          order_type?: string | null
          organization_id?: string | null
          priority?: string | null
          requested_by?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          supplier_name?: string | null
          total_amount?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          approved_at?: string | null
          approved_by?: string | null
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          delivery_port?: string | null
          id?: string
          items?: Json | null
          metadata?: Json | null
          notes?: string | null
          order_number?: string
          order_type?: string | null
          organization_id?: string | null
          priority?: string | null
          requested_by?: string | null
          status?: string | null
          subtotal?: number | null
          supplier_id?: string | null
          supplier_name?: string | null
          total_amount?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "procurement_orders_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "procurement_orders_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
      psc_deficiencies: {
        Row: {
          action_code: string | null
          category: string | null
          corrected_at: string | null
          corrective_action: string | null
          corrective_deadline: string | null
          created_at: string | null
          deficiency_code: string
          deficiency_description: string
          evidence_files: string[] | null
          id: string
          inspection_id: string | null
          severity: string | null
          status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          action_code?: string | null
          category?: string | null
          corrected_at?: string | null
          corrective_action?: string | null
          corrective_deadline?: string | null
          created_at?: string | null
          deficiency_code: string
          deficiency_description: string
          evidence_files?: string[] | null
          id?: string
          inspection_id?: string | null
          severity?: string | null
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          action_code?: string | null
          category?: string | null
          corrected_at?: string | null
          corrective_action?: string | null
          corrective_deadline?: string | null
          created_at?: string | null
          deficiency_code?: string
          deficiency_description?: string
          evidence_files?: string[] | null
          id?: string
          inspection_id?: string | null
          severity?: string | null
          status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psc_deficiencies_inspection_id_fkey"
            columns: ["inspection_id"]
            isOneToOne: false
            referencedRelation: "psc_inspections"
            referencedColumns: ["id"]
          },
        ]
      }
      psc_inspections: {
        Row: {
          created_at: string | null
          deficiencies_count: number | null
          detention: boolean | null
          detention_reason: string | null
          id: string
          inspection_date: string
          inspection_focus: string[] | null
          inspection_type: string | null
          organization_id: string | null
          port_country: string
          port_name: string
          port_state_authority: string | null
          report_file_path: string | null
          risk_score: number | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string | null
          deficiencies_count?: number | null
          detention?: boolean | null
          detention_reason?: string | null
          id?: string
          inspection_date: string
          inspection_focus?: string[] | null
          inspection_type?: string | null
          organization_id?: string | null
          port_country: string
          port_name: string
          port_state_authority?: string | null
          report_file_path?: string | null
          risk_score?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string | null
          deficiencies_count?: number | null
          detention?: boolean | null
          detention_reason?: string | null
          id?: string
          inspection_date?: string
          inspection_focus?: string[] | null
          inspection_type?: string | null
          organization_id?: string | null
          port_country?: string
          port_name?: string
          port_state_authority?: string | null
          report_file_path?: string | null
          risk_score?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "psc_inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "psc_inspections_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      regulations: {
        Row: {
          ai_summary: Json | null
          applies_to: Json | null
          authority: string
          category: string
          compliance_deadline: string | null
          created_at: string
          description: string | null
          documentation_required: string[] | null
          effective_date: string | null
          full_text: string | null
          id: string
          is_mandatory: boolean | null
          penalties: string | null
          reg_code: string
          reg_status: string | null
          related_regulations: string[] | null
          requirements: Json | null
          revision_date: string | null
          source_url: string | null
          subcategory: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_summary?: Json | null
          applies_to?: Json | null
          authority: string
          category: string
          compliance_deadline?: string | null
          created_at?: string
          description?: string | null
          documentation_required?: string[] | null
          effective_date?: string | null
          full_text?: string | null
          id?: string
          is_mandatory?: boolean | null
          penalties?: string | null
          reg_code: string
          reg_status?: string | null
          related_regulations?: string[] | null
          requirements?: Json | null
          revision_date?: string | null
          source_url?: string | null
          subcategory?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_summary?: Json | null
          applies_to?: Json | null
          authority?: string
          category?: string
          compliance_deadline?: string | null
          created_at?: string
          description?: string | null
          documentation_required?: string[] | null
          effective_date?: string | null
          full_text?: string | null
          id?: string
          is_mandatory?: boolean | null
          penalties?: string | null
          reg_code?: string
          reg_status?: string | null
          related_regulations?: string[] | null
          requirements?: Json | null
          revision_date?: string | null
          source_url?: string | null
          subcategory?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      replicated_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          error_message: string | null
          id: string
          last_sync_at: string | null
          log_type: string
          organization_id: string | null
          payload: Json | null
          source_vessel_id: string | null
          status: string
          sync_attempts: number
          target_vessel_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          log_type?: string
          organization_id?: string | null
          payload?: Json | null
          source_vessel_id?: string | null
          status?: string
          sync_attempts?: number
          target_vessel_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          error_message?: string | null
          id?: string
          last_sync_at?: string | null
          log_type?: string
          organization_id?: string | null
          payload?: Json | null
          source_vessel_id?: string | null
          status?: string
          sync_attempts?: number
          target_vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "replicated_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replicated_logs_source_vessel_id_fkey"
            columns: ["source_vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "replicated_logs_target_vessel_id_fkey"
            columns: ["target_vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      reservation_payments: {
        Row: {
          amount: number
          created_at: string
          created_by: string | null
          currency: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          payer_email: string | null
          payer_name: string | null
          payment_date: string | null
          payment_method: string | null
          payment_status: string | null
          receipt_url: string | null
          refund_amount: number | null
          refund_date: string | null
          reservation_id: string | null
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          receipt_url?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          reservation_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          created_by?: string | null
          currency?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          payer_email?: string | null
          payer_name?: string | null
          payment_date?: string | null
          payment_method?: string | null
          payment_status?: string | null
          receipt_url?: string | null
          refund_amount?: number | null
          refund_date?: string | null
          reservation_id?: string | null
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reservation_payments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      responsibility_matrices: {
        Row: {
          activities: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          matrix_data: Json | null
          name: string
          organization_id: string | null
          people_roles: Json | null
          status: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          activities?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          matrix_data?: Json | null
          name: string
          organization_id?: string | null
          people_roles?: Json | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          activities?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          matrix_data?: Json | null
          name?: string
          organization_id?: string | null
          people_roles?: Json | null
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "responsibility_matrices_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "responsibility_matrices_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_quotations: {
        Row: {
          attachments: string[] | null
          created_at: string
          currency: string | null
          delivery_date: string | null
          id: string
          notes: string | null
          payment_terms: string | null
          quoted_items: Json
          reviewed_at: string | null
          reviewed_by: string | null
          rfq_id: string | null
          status: string | null
          submitted_at: string | null
          supplier_id: string | null
          total_amount: number | null
          validity_date: string | null
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          quoted_items?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          rfq_id?: string | null
          status?: string | null
          submitted_at?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          validity_date?: string | null
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          currency?: string | null
          delivery_date?: string | null
          id?: string
          notes?: string | null
          payment_terms?: string | null
          quoted_items?: Json
          reviewed_at?: string | null
          reviewed_by?: string | null
          rfq_id?: string | null
          status?: string | null
          submitted_at?: string | null
          supplier_id?: string | null
          total_amount?: number | null
          validity_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_quotations_rfq_id_fkey"
            columns: ["rfq_id"]
            isOneToOne: false
            referencedRelation: "rfq_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_quotations_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      rfq_requests: {
        Row: {
          awarded_amount: number | null
          awarded_at: string | null
          awarded_supplier_id: string | null
          budget_estimate: number | null
          category: string | null
          created_at: string
          created_by: string | null
          currency: string | null
          deadline: string | null
          delivery_date: string | null
          delivery_port: string | null
          description: string | null
          id: string
          invited_suppliers: string[] | null
          items: Json
          organization_id: string | null
          rfq_number: string
          status: string | null
          title: string
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          awarded_amount?: number | null
          awarded_at?: string | null
          awarded_supplier_id?: string | null
          budget_estimate?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deadline?: string | null
          delivery_date?: string | null
          delivery_port?: string | null
          description?: string | null
          id?: string
          invited_suppliers?: string[] | null
          items?: Json
          organization_id?: string | null
          rfq_number: string
          status?: string | null
          title: string
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          awarded_amount?: number | null
          awarded_at?: string | null
          awarded_supplier_id?: string | null
          budget_estimate?: number | null
          category?: string | null
          created_at?: string
          created_by?: string | null
          currency?: string | null
          deadline?: string | null
          delivery_date?: string | null
          delivery_port?: string | null
          description?: string | null
          id?: string
          invited_suppliers?: string[] | null
          items?: Json
          organization_id?: string | null
          rfq_number?: string
          status?: string | null
          title?: string
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rfq_requests_awarded_supplier_id_fkey"
            columns: ["awarded_supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_requests_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "rfq_requests_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          action_required: boolean | null
          alert_type: string
          created_at: string | null
          id: string
          message: string | null
          resolved: boolean | null
          resolved_at: string | null
          risk_assessment_id: string | null
          severity: string
          title: string
          vessel_id: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_required?: boolean | null
          alert_type: string
          created_at?: string | null
          id?: string
          message?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          risk_assessment_id?: string | null
          severity: string
          title: string
          vessel_id?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          action_required?: boolean | null
          alert_type?: string
          created_at?: string | null
          id?: string
          message?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          risk_assessment_id?: string | null
          severity?: string
          title?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_alerts_risk_assessment_id_fkey"
            columns: ["risk_assessment_id"]
            isOneToOne: false
            referencedRelation: "risk_assessments"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_assessments: {
        Row: {
          affected_areas: string[] | null
          ai_classification: Json | null
          assessed_at: string | null
          created_at: string | null
          id: string
          linked_findings: string[] | null
          mitigation_actions: Json | null
          module_type: string
          risk_description: string | null
          risk_level: string
          risk_score: number
          risk_title: string
          risk_type: string
          status: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          affected_areas?: string[] | null
          ai_classification?: Json | null
          assessed_at?: string | null
          created_at?: string | null
          id?: string
          linked_findings?: string[] | null
          mitigation_actions?: Json | null
          module_type: string
          risk_description?: string | null
          risk_level: string
          risk_score: number
          risk_title: string
          risk_type: string
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          affected_areas?: string[] | null
          ai_classification?: Json | null
          assessed_at?: string | null
          created_at?: string | null
          id?: string
          linked_findings?: string[] | null
          mitigation_actions?: Json | null
          module_type?: string
          risk_description?: string | null
          risk_level?: string
          risk_score?: number
          risk_title?: string
          risk_type?: string
          status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: []
      }
      risk_forecast: {
        Row: {
          created_at: string
          description: string | null
          factors: Json | null
          forecast_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          recommendations: Json | null
          risk_level: string
          risk_score: number
          valid_from: string
          valid_until: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          factors?: Json | null
          forecast_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          recommendations?: Json | null
          risk_level: string
          risk_score: number
          valid_from?: string
          valid_until?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          factors?: Json | null
          forecast_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          recommendations?: Json | null
          risk_level?: string
          risk_score?: number
          valid_from?: string
          valid_until?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "risk_forecast_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "risk_forecast_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      risk_heatmap_data: {
        Row: {
          coordinates: Json | null
          created_at: string | null
          id: string
          metadata: Json | null
          module_type: string
          period_date: string | null
          region: string | null
          risk_count: number | null
          risk_intensity: number
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          module_type: string
          period_date?: string | null
          region?: string | null
          risk_count?: number | null
          risk_intensity: number
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          coordinates?: Json | null
          created_at?: string | null
          id?: string
          metadata?: Json | null
          module_type?: string
          period_date?: string | null
          region?: string | null
          risk_count?: number | null
          risk_intensity?: number
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: []
      }
      risk_matrix: {
        Row: {
          ai_analysis: Json | null
          category: string
          created_at: string
          description: string | null
          id: string
          impact: number
          likelihood: number
          mitigation_plan: string | null
          owner_id: string | null
          residual_risk: number | null
          review_date: string | null
          risk_code: string
          risk_status: string | null
          title: string
          updated_at: string
        }
        Insert: {
          ai_analysis?: Json | null
          category: string
          created_at?: string
          description?: string | null
          id?: string
          impact: number
          likelihood: number
          mitigation_plan?: string | null
          owner_id?: string | null
          residual_risk?: number | null
          review_date?: string | null
          risk_code: string
          risk_status?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          ai_analysis?: Json | null
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          impact?: number
          likelihood?: number
          mitigation_plan?: string | null
          owner_id?: string | null
          residual_risk?: number | null
          review_date?: string | null
          risk_code?: string
          risk_status?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      risk_trends: {
        Row: {
          average_risk_score: number | null
          created_at: string | null
          critical_risks_count: number | null
          high_risks_count: number | null
          id: string
          key_issues: Json | null
          low_risks_count: number | null
          medium_risks_count: number | null
          module_type: string
          period_end: string
          period_start: string
          trend_direction: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          average_risk_score?: number | null
          created_at?: string | null
          critical_risks_count?: number | null
          high_risks_count?: number | null
          id?: string
          key_issues?: Json | null
          low_risks_count?: number | null
          medium_risks_count?: number | null
          module_type: string
          period_end: string
          period_start: string
          trend_direction?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          average_risk_score?: number | null
          created_at?: string | null
          critical_risks_count?: number | null
          high_risks_count?: number | null
          id?: string
          key_issues?: Json | null
          low_risks_count?: number | null
          medium_risks_count?: number | null
          module_type?: string
          period_end?: string
          period_start?: string
          trend_direction?: string | null
          updated_at?: string | null
          vessel_id?: string | null
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
      route_optimizations: {
        Row: {
          arrival_lat: number
          arrival_lng: number
          arrival_port: string
          created_at: string
          created_by: string | null
          departure_date: string
          departure_lat: number
          departure_lng: number
          departure_port: string
          emissions_estimate: number | null
          eta: string | null
          fuel_consumption: number | null
          fuel_cost: number | null
          id: string
          risk_score: number | null
          route_data: Json | null
          route_score: number | null
          status: string | null
          total_distance: number | null
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          arrival_lat: number
          arrival_lng: number
          arrival_port: string
          created_at?: string
          created_by?: string | null
          departure_date: string
          departure_lat: number
          departure_lng: number
          departure_port: string
          emissions_estimate?: number | null
          eta?: string | null
          fuel_consumption?: number | null
          fuel_cost?: number | null
          id?: string
          risk_score?: number | null
          route_data?: Json | null
          route_score?: number | null
          status?: string | null
          total_distance?: number | null
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          arrival_lat?: number
          arrival_lng?: number
          arrival_port?: string
          created_at?: string
          created_by?: string | null
          departure_date?: string
          departure_lat?: number
          departure_lng?: number
          departure_port?: string
          emissions_estimate?: number | null
          eta?: string | null
          fuel_consumption?: number | null
          fuel_cost?: number | null
          id?: string
          risk_score?: number | null
          route_data?: Json | null
          route_score?: number | null
          status?: string | null
          total_distance?: number | null
          updated_at?: string
          vessel_id?: string | null
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
      safety_briefings: {
        Row: {
          briefing_date: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          imca_incident_id: string | null
          organization_id: string | null
          participants: Json | null
          presenter_id: string | null
          quiz_questions: Json | null
          quiz_results: Json | null
          status: string | null
          title: string
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          briefing_date?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          imca_incident_id?: string | null
          organization_id?: string | null
          participants?: Json | null
          presenter_id?: string | null
          quiz_questions?: Json | null
          quiz_results?: Json | null
          status?: string | null
          title: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          briefing_date?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          imca_incident_id?: string | null
          organization_id?: string | null
          participants?: Json | null
          presenter_id?: string | null
          quiz_questions?: Json | null
          quiz_results?: Json | null
          status?: string | null
          title?: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_briefings_imca_incident_id_fkey"
            columns: ["imca_incident_id"]
            isOneToOne: false
            referencedRelation: "imca_incidents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_briefings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_briefings_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      safety_incidents: {
        Row: {
          attachments: Json | null
          corrective_actions: Json | null
          created_at: string
          description: string | null
          id: string
          immediate_actions: string | null
          incident_date: string
          incident_location: string | null
          incident_number: string | null
          incident_type: string
          injuries_count: number | null
          metadata: Json | null
          organization_id: string | null
          persons_involved: Json | null
          reported_by: string | null
          reported_by_name: string | null
          root_cause: string | null
          severity: string | null
          status: string | null
          title: string
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          attachments?: Json | null
          corrective_actions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          immediate_actions?: string | null
          incident_date?: string
          incident_location?: string | null
          incident_number?: string | null
          incident_type?: string
          injuries_count?: number | null
          metadata?: Json | null
          organization_id?: string | null
          persons_involved?: Json | null
          reported_by?: string | null
          reported_by_name?: string | null
          root_cause?: string | null
          severity?: string | null
          status?: string | null
          title: string
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          attachments?: Json | null
          corrective_actions?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          immediate_actions?: string | null
          incident_date?: string
          incident_location?: string | null
          incident_number?: string | null
          incident_type?: string
          injuries_count?: number | null
          metadata?: Json | null
          organization_id?: string | null
          persons_involved?: Json | null
          reported_by?: string | null
          reported_by_name?: string | null
          root_cause?: string | null
          severity?: string | null
          status?: string | null
          title?: string
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "safety_incidents_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "safety_incidents_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      satcom_links: {
        Row: {
          bandwidth_kbps: number | null
          config: Json | null
          created_at: string
          failure_reason: string | null
          id: string
          is_primary: boolean
          last_failure_at: string | null
          last_ping_at: string | null
          latency_ms: number | null
          name: string
          priority: number
          provider: string
          signal_strength: number | null
          status: string
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          bandwidth_kbps?: number | null
          config?: Json | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          is_primary?: boolean
          last_failure_at?: string | null
          last_ping_at?: string | null
          latency_ms?: number | null
          name: string
          priority?: number
          provider: string
          signal_strength?: number | null
          status?: string
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          bandwidth_kbps?: number | null
          config?: Json | null
          created_at?: string
          failure_reason?: string | null
          id?: string
          is_primary?: boolean
          last_failure_at?: string | null
          last_ping_at?: string | null
          latency_ms?: number | null
          name?: string
          priority?: number
          provider?: string
          signal_strength?: number | null
          status?: string
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "satcom_links_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      satcom_logs: {
        Row: {
          bandwidth_kbps: number | null
          created_at: string
          error_message: string | null
          id: string
          latency_ms: number | null
          message_content: string | null
          metadata: Json | null
          provider: string
          signal_strength: number | null
          status: string
          transmission_type: string
          vessel_id: string | null
        }
        Insert: {
          bandwidth_kbps?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          message_content?: string | null
          metadata?: Json | null
          provider: string
          signal_strength?: number | null
          status: string
          transmission_type: string
          vessel_id?: string | null
        }
        Update: {
          bandwidth_kbps?: number | null
          created_at?: string
          error_message?: string | null
          id?: string
          latency_ms?: number | null
          message_content?: string | null
          metadata?: Json | null
          provider?: string
          signal_strength?: number | null
          status?: string
          transmission_type?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "satcom_logs_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      satellite_alerts: {
        Row: {
          acknowledged: boolean | null
          alert_type: string
          created_at: string
          description: string | null
          id: string
          is_resolved: boolean | null
          message: string
          metadata: Json | null
          organization_id: string | null
          resolved_at: string | null
          satellite_id: string | null
          severity: string
          title: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          alert_type: string
          created_at?: string
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          message: string
          metadata?: Json | null
          organization_id?: string | null
          resolved_at?: string | null
          satellite_id?: string | null
          severity?: string
          title?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          alert_type?: string
          created_at?: string
          description?: string | null
          id?: string
          is_resolved?: boolean | null
          message?: string
          metadata?: Json | null
          organization_id?: string | null
          resolved_at?: string | null
          satellite_id?: string | null
          severity?: string
          title?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "satellite_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "satellite_alerts_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
      }
      satellite_coverage_maps: {
        Row: {
          coverage_geojson: Json
          coverage_radius_km: number | null
          created_at: string | null
          elevation_angle_degrees: number | null
          id: string
          metadata: Json | null
          next_pass_at: string | null
          quality_score: number | null
          satellite_id: string | null
          visibility_duration_minutes: number | null
        }
        Insert: {
          coverage_geojson?: Json
          coverage_radius_km?: number | null
          created_at?: string | null
          elevation_angle_degrees?: number | null
          id?: string
          metadata?: Json | null
          next_pass_at?: string | null
          quality_score?: number | null
          satellite_id?: string | null
          visibility_duration_minutes?: number | null
        }
        Update: {
          coverage_geojson?: Json
          coverage_radius_km?: number | null
          created_at?: string | null
          elevation_angle_degrees?: number | null
          id?: string
          metadata?: Json | null
          next_pass_at?: string | null
          quality_score?: number | null
          satellite_id?: string | null
          visibility_duration_minutes?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "satellite_coverage_maps_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
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
      satellite_mission_links: {
        Row: {
          created_at: string
          id: string
          is_active: boolean | null
          link_type: string
          metadata: Json | null
          mission_id: string | null
          satellite_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          link_type?: string
          metadata?: Json | null
          mission_id?: string | null
          satellite_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean | null
          link_type?: string
          metadata?: Json | null
          mission_id?: string | null
          satellite_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "satellite_mission_links_mission_id_fkey"
            columns: ["mission_id"]
            isOneToOne: false
            referencedRelation: "missions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "satellite_mission_links_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
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
      satellite_passes: {
        Row: {
          created_at: string
          duration_seconds: number | null
          id: string
          is_visible: boolean | null
          max_elevation: number | null
          observer_lat: number
          observer_lon: number
          organization_id: string | null
          rise_time: string
          satellite_id: string | null
          set_time: string | null
        }
        Insert: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_visible?: boolean | null
          max_elevation?: number | null
          observer_lat: number
          observer_lon: number
          organization_id?: string | null
          rise_time: string
          satellite_id?: string | null
          set_time?: string | null
        }
        Update: {
          created_at?: string
          duration_seconds?: number | null
          id?: string
          is_visible?: boolean | null
          max_elevation?: number | null
          observer_lat?: number
          observer_lon?: number
          organization_id?: string | null
          rise_time?: string
          satellite_id?: string | null
          set_time?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "satellite_passes_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "satellite_passes_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
      }
      satellite_positions: {
        Row: {
          altitude: number
          azimuth: number | null
          calculated_at: string | null
          created_at: string | null
          eccentricity: number | null
          elevation: number | null
          id: string
          inclination: number | null
          last_updated: string | null
          latitude: number
          longitude: number
          name: string
          norad_id: string
          orbital_period: number | null
          satellite_id: string | null
          status: string | null
          tle_line1: string | null
          tle_line2: string | null
          velocity: number
        }
        Insert: {
          altitude: number
          azimuth?: number | null
          calculated_at?: string | null
          created_at?: string | null
          eccentricity?: number | null
          elevation?: number | null
          id?: string
          inclination?: number | null
          last_updated?: string | null
          latitude: number
          longitude: number
          name: string
          norad_id: string
          orbital_period?: number | null
          satellite_id?: string | null
          status?: string | null
          tle_line1?: string | null
          tle_line2?: string | null
          velocity: number
        }
        Update: {
          altitude?: number
          azimuth?: number | null
          calculated_at?: string | null
          created_at?: string | null
          eccentricity?: number | null
          elevation?: number | null
          id?: string
          inclination?: number | null
          last_updated?: string | null
          latitude?: number
          longitude?: number
          name?: string
          norad_id?: string
          orbital_period?: number | null
          satellite_id?: string | null
          status?: string | null
          tle_line1?: string | null
          tle_line2?: string | null
          velocity?: number
        }
        Relationships: [
          {
            foreignKeyName: "satellite_positions_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
      }
      satellite_telemetry: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          satellite_id: string | null
          status: string | null
          telemetry_type: string
          timestamp: string
          unit: string | null
          value: number | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          satellite_id?: string | null
          status?: string | null
          telemetry_type: string
          timestamp?: string
          unit?: string | null
          value?: number | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          satellite_id?: string | null
          status?: string | null
          telemetry_type?: string
          timestamp?: string
          unit?: string | null
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "satellite_telemetry_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
      }
      satellite_tracking: {
        Row: {
          altitude_km: number | null
          created_at: string | null
          id: string
          next_pass: string | null
          norad_id: string | null
          position_lat: number | null
          position_lon: number | null
          satellite_name: string
          timestamp: string | null
          tle_line1: string | null
          tle_line2: string | null
          velocity_kms: number | null
          visibility: string | null
        }
        Insert: {
          altitude_km?: number | null
          created_at?: string | null
          id?: string
          next_pass?: string | null
          norad_id?: string | null
          position_lat?: number | null
          position_lon?: number | null
          satellite_name: string
          timestamp?: string | null
          tle_line1?: string | null
          tle_line2?: string | null
          velocity_kms?: number | null
          visibility?: string | null
        }
        Update: {
          altitude_km?: number | null
          created_at?: string | null
          id?: string
          next_pass?: string | null
          norad_id?: string | null
          position_lat?: number | null
          position_lon?: number | null
          satellite_name?: string
          timestamp?: string | null
          tle_line1?: string | null
          tle_line2?: string | null
          velocity_kms?: number | null
          visibility?: string | null
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
      satellites: {
        Row: {
          apogee_km: number | null
          created_at: string
          id: string
          inclination_degrees: number | null
          is_active: boolean | null
          launch_date: string | null
          metadata: Json | null
          name: string
          norad_id: string | null
          operator: string | null
          orbital_period_minutes: number | null
          organization_id: string | null
          perigee_km: number | null
          satellite_type: string | null
          tle_line1: string | null
          tle_line2: string | null
          updated_at: string
        }
        Insert: {
          apogee_km?: number | null
          created_at?: string
          id?: string
          inclination_degrees?: number | null
          is_active?: boolean | null
          launch_date?: string | null
          metadata?: Json | null
          name: string
          norad_id?: string | null
          operator?: string | null
          orbital_period_minutes?: number | null
          organization_id?: string | null
          perigee_km?: number | null
          satellite_type?: string | null
          tle_line1?: string | null
          tle_line2?: string | null
          updated_at?: string
        }
        Update: {
          apogee_km?: number | null
          created_at?: string
          id?: string
          inclination_degrees?: number | null
          is_active?: boolean | null
          launch_date?: string | null
          metadata?: Json | null
          name?: string
          norad_id?: string | null
          operator?: string | null
          orbital_period_minutes?: number | null
          organization_id?: string | null
          perigee_km?: number | null
          satellite_type?: string | null
          tle_line1?: string | null
          tle_line2?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "satellites_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      scheduled_tasks: {
        Row: {
          assigned_team: string | null
          assigned_to: string | null
          auto_retry: boolean | null
          created_at: string | null
          created_by: string | null
          cron_expression: string | null
          dependencies: Json | null
          execution_count: number | null
          execution_timeout_minutes: number | null
          expires_at: string | null
          failure_count: number | null
          id: string
          interval_minutes: number | null
          is_active: boolean | null
          last_error: string | null
          last_executed_at: string | null
          last_result: Json | null
          max_executions: number | null
          max_retries: number | null
          next_execution_at: string | null
          notification_recipients: Json | null
          organization_id: string
          priority: string | null
          recurrence_pattern: Json | null
          retry_attempts: number | null
          retry_delay_minutes: number | null
          schedule_type: string
          scheduled_datetime: string | null
          starts_at: string | null
          status: string | null
          success_count: number | null
          task_config: Json | null
          task_description: string | null
          task_metadata: Json | null
          task_name: string
          task_type: string
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          assigned_team?: string | null
          assigned_to?: string | null
          auto_retry?: boolean | null
          created_at?: string | null
          created_by?: string | null
          cron_expression?: string | null
          dependencies?: Json | null
          execution_count?: number | null
          execution_timeout_minutes?: number | null
          expires_at?: string | null
          failure_count?: number | null
          id?: string
          interval_minutes?: number | null
          is_active?: boolean | null
          last_error?: string | null
          last_executed_at?: string | null
          last_result?: Json | null
          max_executions?: number | null
          max_retries?: number | null
          next_execution_at?: string | null
          notification_recipients?: Json | null
          organization_id: string
          priority?: string | null
          recurrence_pattern?: Json | null
          retry_attempts?: number | null
          retry_delay_minutes?: number | null
          schedule_type: string
          scheduled_datetime?: string | null
          starts_at?: string | null
          status?: string | null
          success_count?: number | null
          task_config?: Json | null
          task_description?: string | null
          task_metadata?: Json | null
          task_name: string
          task_type: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          assigned_team?: string | null
          assigned_to?: string | null
          auto_retry?: boolean | null
          created_at?: string | null
          created_by?: string | null
          cron_expression?: string | null
          dependencies?: Json | null
          execution_count?: number | null
          execution_timeout_minutes?: number | null
          expires_at?: string | null
          failure_count?: number | null
          id?: string
          interval_minutes?: number | null
          is_active?: boolean | null
          last_error?: string | null
          last_executed_at?: string | null
          last_result?: Json | null
          max_executions?: number | null
          max_retries?: number | null
          next_execution_at?: string | null
          notification_recipients?: Json | null
          organization_id?: string
          priority?: string | null
          recurrence_pattern?: Json | null
          retry_attempts?: number | null
          retry_delay_minutes?: number | null
          schedule_type?: string
          scheduled_datetime?: string | null
          starts_at?: string | null
          status?: string | null
          success_count?: number | null
          task_config?: Json | null
          task_description?: string | null
          task_metadata?: Json | null
          task_name?: string
          task_type?: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_tasks_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "scheduled_tasks_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      security_audit_logs: {
        Row: {
          action: string
          created_at: string
          details: Json | null
          event_type: string
          id: string
          ip_address: unknown
          metadata: Json | null
          resource_id: string | null
          resource_type: string | null
          severity: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          details?: Json | null
          event_type: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          details?: Json | null
          event_type?: string
          id?: string
          ip_address?: unknown
          metadata?: Json | null
          resource_id?: string | null
          resource_type?: string | null
          severity?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      security_scan_results: {
        Row: {
          created_at: string
          description: string | null
          finding_code: string
          id: string
          recommendation: string | null
          resolved_at: string | null
          resolved_by: string | null
          scan_type: string
          severity: string
          status: string | null
          table_name: string | null
          title: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          finding_code: string
          id?: string
          recommendation?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scan_type: string
          severity: string
          status?: string | null
          table_name?: string | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string | null
          finding_code?: string
          id?: string
          recommendation?: string | null
          resolved_at?: string | null
          resolved_by?: string | null
          scan_type?: string
          severity?: string
          status?: string | null
          table_name?: string | null
          title?: string
        }
        Relationships: []
      }
      sensor_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          organization_id: string | null
          resolved_at: string | null
          sensor_id: string
          sensor_type: string
          severity: string
          threshold: number | null
          value: number | null
          vessel_id: string | null
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          organization_id?: string | null
          resolved_at?: string | null
          sensor_id: string
          sensor_type: string
          severity?: string
          threshold?: number | null
          value?: number | null
          vessel_id?: string | null
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          organization_id?: string | null
          resolved_at?: string | null
          sensor_id?: string
          sensor_type?: string
          severity?: string
          threshold?: number | null
          value?: number | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_alerts_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      sensor_logs: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          organization_id: string | null
          sensor_id: string
          sensor_type: string
          timestamp: string
          unit: string | null
          value: number
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          sensor_id: string
          sensor_type: string
          timestamp?: string
          unit?: string | null
          value: number
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          sensor_id?: string
          sensor_type?: string
          timestamp?: string
          unit?: string | null
          value?: number
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sensor_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sensor_logs_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
      sgso_action_plans: {
        Row: {
          action_type: string | null
          audit_id: string | null
          code: string
          created_at: string | null
          created_by: string | null
          deadline: string
          description: string | null
          evidence_ids: string[] | null
          finding_id: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          progress: number | null
          responsible: string
          status: string | null
          title: string
          updated_at: string | null
          verification_date: string | null
          verification_method: string | null
          verified_by: string | null
        }
        Insert: {
          action_type?: string | null
          audit_id?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          deadline: string
          description?: string | null
          evidence_ids?: string[] | null
          finding_id?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          progress?: number | null
          responsible: string
          status?: string | null
          title: string
          updated_at?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verified_by?: string | null
        }
        Update: {
          action_type?: string | null
          audit_id?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string
          description?: string | null
          evidence_ids?: string[] | null
          finding_id?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          progress?: number | null
          responsible?: string
          status?: string | null
          title?: string
          updated_at?: string | null
          verification_date?: string | null
          verification_method?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sgso_action_plans_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "sgso_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sgso_action_plans_finding_id_fkey"
            columns: ["finding_id"]
            isOneToOne: false
            referencedRelation: "sgso_findings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sgso_action_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      sgso_evidence: {
        Row: {
          audit_id: string | null
          compliance_status: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          evidence_type: string | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          justification: string | null
          ocr_confidence: number | null
          ocr_text: string | null
          organization_id: string | null
          practice_name: string
          practice_number: string
          title: string
          updated_at: string | null
        }
        Insert: {
          audit_id?: string | null
          compliance_status?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evidence_type?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          justification?: string | null
          ocr_confidence?: number | null
          ocr_text?: string | null
          organization_id?: string | null
          practice_name: string
          practice_number: string
          title: string
          updated_at?: string | null
        }
        Update: {
          audit_id?: string | null
          compliance_status?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          evidence_type?: string | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          justification?: string | null
          ocr_confidence?: number | null
          ocr_text?: string | null
          organization_id?: string | null
          practice_name?: string
          practice_number?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sgso_evidence_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "sgso_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sgso_evidence_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sgso_findings: {
        Row: {
          audit_id: string | null
          closed_at: string | null
          closed_by: string | null
          code: string
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string | null
          evidence_ids: string[] | null
          id: string
          organization_id: string | null
          practice_number: string
          responsible: string | null
          root_cause: string | null
          severity: string
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          audit_id?: string | null
          closed_at?: string | null
          closed_by?: string | null
          code: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          evidence_ids?: string[] | null
          id?: string
          organization_id?: string | null
          practice_number: string
          responsible?: string | null
          root_cause?: string | null
          severity: string
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          audit_id?: string | null
          closed_at?: string | null
          closed_by?: string | null
          code?: string
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          evidence_ids?: string[] | null
          id?: string
          organization_id?: string | null
          practice_number?: string
          responsible?: string | null
          root_cause?: string | null
          severity?: string
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sgso_findings_audit_id_fkey"
            columns: ["audit_id"]
            isOneToOne: false
            referencedRelation: "sgso_audits"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sgso_findings_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      smart_drill_executions: {
        Row: {
          ai_evaluation: Json | null
          created_at: string | null
          drill_id: string
          evaluated_at: string | null
          executed_at: string
          execution_data: Json | null
          id: string
          organization_id: string
          overall_score: number | null
          participants: Json
          recommendations: Json | null
          scenario_id: string | null
          strengths: Json | null
          weaknesses: Json | null
        }
        Insert: {
          ai_evaluation?: Json | null
          created_at?: string | null
          drill_id: string
          evaluated_at?: string | null
          executed_at: string
          execution_data?: Json | null
          id?: string
          organization_id: string
          overall_score?: number | null
          participants: Json
          recommendations?: Json | null
          scenario_id?: string | null
          strengths?: Json | null
          weaknesses?: Json | null
        }
        Update: {
          ai_evaluation?: Json | null
          created_at?: string | null
          drill_id?: string
          evaluated_at?: string | null
          executed_at?: string
          execution_data?: Json | null
          id?: string
          organization_id?: string
          overall_score?: number | null
          participants?: Json
          recommendations?: Json | null
          scenario_id?: string | null
          strengths?: Json | null
          weaknesses?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_drill_executions_drill_id_fkey"
            columns: ["drill_id"]
            isOneToOne: false
            referencedRelation: "incident_drills"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_drill_executions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_drill_executions_scenario_id_fkey"
            columns: ["scenario_id"]
            isOneToOne: false
            referencedRelation: "smart_drill_scenarios"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_drill_scenarios: {
        Row: {
          ai_model_version: string | null
          avg_score: number | null
          context_factors: Json | null
          created_at: string | null
          decision_points: Json | null
          difficulty: string | null
          drill_type: string
          expected_actions: Json | null
          id: string
          organization_id: string
          scenario_data: Json
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          ai_model_version?: string | null
          avg_score?: number | null
          context_factors?: Json | null
          created_at?: string | null
          decision_points?: Json | null
          difficulty?: string | null
          drill_type: string
          expected_actions?: Json | null
          id?: string
          organization_id: string
          scenario_data: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          ai_model_version?: string | null
          avg_score?: number | null
          context_factors?: Json | null
          created_at?: string | null
          decision_points?: Json | null
          difficulty?: string | null
          drill_type?: string
          expected_actions?: Json | null
          id?: string
          organization_id?: string
          scenario_data?: Json
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_drill_scenarios_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_drills: {
        Row: {
          ai_generated: boolean | null
          ai_model_version: string | null
          average_score: number | null
          completion_rate: number | null
          created_at: string | null
          created_by: string | null
          description: string | null
          difficulty: string | null
          drill_type: string
          duration_minutes: number | null
          evaluation_criteria: Json | null
          id: string
          objectives: Json | null
          organization_id: string
          participants_required: number | null
          scenario: Json | null
          scheduled_date: string | null
          status: string | null
          title: string
          total_executions: number | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          ai_generated?: boolean | null
          ai_model_version?: string | null
          average_score?: number | null
          completion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          drill_type: string
          duration_minutes?: number | null
          evaluation_criteria?: Json | null
          id?: string
          objectives?: Json | null
          organization_id: string
          participants_required?: number | null
          scenario?: Json | null
          scheduled_date?: string | null
          status?: string | null
          title: string
          total_executions?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          ai_generated?: boolean | null
          ai_model_version?: string | null
          average_score?: number | null
          completion_rate?: number | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          difficulty?: string | null
          drill_type?: string
          duration_minutes?: number | null
          evaluation_criteria?: Json | null
          id?: string
          objectives?: Json | null
          organization_id?: string
          participants_required?: number | null
          scenario?: Json | null
          scheduled_date?: string | null
          status?: string | null
          title?: string
          total_executions?: number | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_drills_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_drills_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "smart_drills_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_workflow_steps: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          conditions: Json | null
          config: Json | null
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          position: number | null
          priority: string | null
          result: Json | null
          started_at: string | null
          status: string
          step_number: number
          step_type: string
          tags: string[] | null
          title: string | null
          workflow_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          conditions?: Json | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          position?: number | null
          priority?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          step_number: number
          step_type: string
          tags?: string[] | null
          title?: string | null
          workflow_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          conditions?: Json | null
          config?: Json | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          position?: number | null
          priority?: string | null
          result?: Json | null
          started_at?: string | null
          status?: string
          step_number?: number
          step_type?: string
          tags?: string[] | null
          title?: string | null
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "smart_workflow_steps_workflow_id_fkey"
            columns: ["workflow_id"]
            isOneToOne: false
            referencedRelation: "smart_workflows"
            referencedColumns: ["id"]
          },
        ]
      }
      smart_workflows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          organization_id: string | null
          status: string
          steps: Json | null
          trigger_config: Json | null
          trigger_type: string | null
          updated_at: string
          workflow_type: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          organization_id?: string | null
          status?: string
          steps?: Json | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string
          workflow_type?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          organization_id?: string | null
          status?: string
          steps?: Json | null
          trigger_config?: Json | null
          trigger_type?: string | null
          updated_at?: string
          workflow_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "smart_workflows_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sonar_ai_analysis: {
        Row: {
          anomalies: Json | null
          confidence_score: number | null
          created_at: string
          id: string
          interpretation: string | null
          model_version: string | null
          patterns_detected: Json | null
          processing_time_ms: number | null
          recommendations: string[] | null
          scan_id: string
          sonar_data_id: string | null
          zones_of_interest: Json | null
        }
        Insert: {
          anomalies?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          interpretation?: string | null
          model_version?: string | null
          patterns_detected?: Json | null
          processing_time_ms?: number | null
          recommendations?: string[] | null
          scan_id: string
          sonar_data_id?: string | null
          zones_of_interest?: Json | null
        }
        Update: {
          anomalies?: Json | null
          confidence_score?: number | null
          created_at?: string
          id?: string
          interpretation?: string | null
          model_version?: string | null
          patterns_detected?: Json | null
          processing_time_ms?: number | null
          recommendations?: string[] | null
          scan_id?: string
          sonar_data_id?: string | null
          zones_of_interest?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "sonar_ai_analysis_sonar_data_id_fkey"
            columns: ["sonar_data_id"]
            isOneToOne: false
            referencedRelation: "sonar_data"
            referencedColumns: ["id"]
          },
        ]
      }
      sonar_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          analysis_id: string | null
          created_at: string | null
          description: string | null
          frequency_range: string | null
          id: string
          is_acknowledged: boolean | null
          location: Json | null
          metadata: Json | null
          mission_id: string | null
          organization_id: string | null
          resolved: boolean | null
          resolved_at: string | null
          severity: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          analysis_id?: string | null
          created_at?: string | null
          description?: string | null
          frequency_range?: string | null
          id?: string
          is_acknowledged?: boolean | null
          location?: Json | null
          metadata?: Json | null
          mission_id?: string | null
          organization_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          analysis_id?: string | null
          created_at?: string | null
          description?: string | null
          frequency_range?: string | null
          id?: string
          is_acknowledged?: boolean | null
          location?: Json | null
          metadata?: Json | null
          mission_id?: string | null
          organization_id?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          severity?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sonar_alerts_analysis_id_fkey"
            columns: ["analysis_id"]
            isOneToOne: false
            referencedRelation: "sonar_analysis"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sonar_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sonar_analyses: {
        Row: {
          ai_summary: string | null
          analysis_type: string
          confidence_score: number | null
          created_at: string
          detected_objects: Json | null
          id: string
          metadata: Json | null
          recommendations: Json | null
          reviewed_at: string | null
          reviewed_by: string | null
          scan_id: string | null
          threat_level: string | null
        }
        Insert: {
          ai_summary?: string | null
          analysis_type: string
          confidence_score?: number | null
          created_at?: string
          detected_objects?: Json | null
          id?: string
          metadata?: Json | null
          recommendations?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_id?: string | null
          threat_level?: string | null
        }
        Update: {
          ai_summary?: string | null
          analysis_type?: string
          confidence_score?: number | null
          created_at?: string
          detected_objects?: Json | null
          id?: string
          metadata?: Json | null
          recommendations?: Json | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          scan_id?: string | null
          threat_level?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sonar_analyses_scan_id_fkey"
            columns: ["scan_id"]
            isOneToOne: false
            referencedRelation: "sonar_data"
            referencedColumns: ["scan_id"]
          },
        ]
      }
      sonar_analysis: {
        Row: {
          ai_model: string | null
          analysis_type: string
          anomalies: Json | null
          confidence_score: number | null
          created_at: string | null
          created_by: string | null
          frequency_data: Json | null
          id: string
          input_id: string | null
          metadata: Json | null
          mission_id: string | null
          organization_id: string | null
          patterns_detected: Json | null
          processed_at: string | null
          recommendations: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ai_model?: string | null
          analysis_type: string
          anomalies?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          frequency_data?: Json | null
          id?: string
          input_id?: string | null
          metadata?: Json | null
          mission_id?: string | null
          organization_id?: string | null
          patterns_detected?: Json | null
          processed_at?: string | null
          recommendations?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_model?: string | null
          analysis_type?: string
          anomalies?: Json | null
          confidence_score?: number | null
          created_at?: string | null
          created_by?: string | null
          frequency_data?: Json | null
          id?: string
          input_id?: string | null
          metadata?: Json | null
          mission_id?: string | null
          organization_id?: string | null
          patterns_detected?: Json | null
          processed_at?: string | null
          recommendations?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sonar_analysis_input_id_fkey"
            columns: ["input_id"]
            isOneToOne: false
            referencedRelation: "sonar_inputs"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sonar_analysis_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      sonar_data: {
        Row: {
          ai_analysis: Json | null
          anomalies_detected: number | null
          created_at: string
          depth_meters: number | null
          frequency_khz: number | null
          id: string
          location: Json | null
          operator_id: string | null
          processed_at: string | null
          quality_score: number | null
          range_meters: number | null
          raw_data: Json | null
          scan_id: string
          scan_type: string | null
          timestamp: string | null
          vessel_id: string | null
        }
        Insert: {
          ai_analysis?: Json | null
          anomalies_detected?: number | null
          created_at?: string
          depth_meters?: number | null
          frequency_khz?: number | null
          id?: string
          location?: Json | null
          operator_id?: string | null
          processed_at?: string | null
          quality_score?: number | null
          range_meters?: number | null
          raw_data?: Json | null
          scan_id: string
          scan_type?: string | null
          timestamp?: string | null
          vessel_id?: string | null
        }
        Update: {
          ai_analysis?: Json | null
          anomalies_detected?: number | null
          created_at?: string
          depth_meters?: number | null
          frequency_khz?: number | null
          id?: string
          location?: Json | null
          operator_id?: string | null
          processed_at?: string | null
          quality_score?: number | null
          range_meters?: number | null
          raw_data?: Json | null
          scan_id?: string
          scan_type?: string | null
          timestamp?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sonar_data_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      sonar_detection_logs: {
        Row: {
          bearing_degrees: number | null
          characteristics: Json | null
          classification: string | null
          confidence: number | null
          created_at: string
          depth_meters: number | null
          detection_type: string
          frequency_khz: number | null
          id: string
          is_threat: boolean | null
          is_verified: boolean | null
          location: Json | null
          metadata: Json | null
          range_meters: number | null
          signal_strength: number | null
          sonar_data_id: string | null
          status: string | null
          updated_at: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          bearing_degrees?: number | null
          characteristics?: Json | null
          classification?: string | null
          confidence?: number | null
          created_at?: string
          depth_meters?: number | null
          detection_type: string
          frequency_khz?: number | null
          id?: string
          is_threat?: boolean | null
          is_verified?: boolean | null
          location?: Json | null
          metadata?: Json | null
          range_meters?: number | null
          signal_strength?: number | null
          sonar_data_id?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          bearing_degrees?: number | null
          characteristics?: Json | null
          classification?: string | null
          confidence?: number | null
          created_at?: string
          depth_meters?: number | null
          detection_type?: string
          frequency_khz?: number | null
          id?: string
          is_threat?: boolean | null
          is_verified?: boolean | null
          location?: Json | null
          metadata?: Json | null
          range_meters?: number | null
          signal_strength?: number | null
          sonar_data_id?: string | null
          status?: string | null
          updated_at?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sonar_detection_logs_sonar_data_id_fkey"
            columns: ["sonar_data_id"]
            isOneToOne: false
            referencedRelation: "sonar_data"
            referencedColumns: ["id"]
          },
        ]
      }
      sonar_inputs: {
        Row: {
          created_at: string | null
          depth_m: number | null
          frequency_khz: number | null
          id: string
          raw_data: Json | null
          signal_strength: number | null
          sonar_type: string | null
          timestamp: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string | null
          depth_m?: number | null
          frequency_khz?: number | null
          id?: string
          raw_data?: Json | null
          signal_strength?: number | null
          sonar_type?: string | null
          timestamp?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string | null
          depth_m?: number | null
          frequency_khz?: number | null
          id?: string
          raw_data?: Json | null
          signal_strength?: number | null
          sonar_type?: string | null
          timestamp?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "sonar_inputs_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      starfix_inspections: {
        Row: {
          authority: string | null
          country_code: string | null
          created_at: string | null
          deficiencies_count: number | null
          detentions_count: number | null
          findings: Json | null
          findings_count: number | null
          follow_up_required: boolean | null
          id: string
          inspection_date: string
          inspection_id: string
          inspection_type: string
          last_sync_at: string | null
          organization_id: string
          port_name: string | null
          raw_data: Json | null
          starfix_vessel_id: string
          status: string | null
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          authority?: string | null
          country_code?: string | null
          created_at?: string | null
          deficiencies_count?: number | null
          detentions_count?: number | null
          findings?: Json | null
          findings_count?: number | null
          follow_up_required?: boolean | null
          id?: string
          inspection_date: string
          inspection_id: string
          inspection_type: string
          last_sync_at?: string | null
          organization_id: string
          port_name?: string | null
          raw_data?: Json | null
          starfix_vessel_id: string
          status?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          authority?: string | null
          country_code?: string | null
          created_at?: string | null
          deficiencies_count?: number | null
          detentions_count?: number | null
          findings?: Json | null
          findings_count?: number | null
          follow_up_required?: boolean | null
          id?: string
          inspection_date?: string
          inspection_id?: string
          inspection_type?: string
          last_sync_at?: string | null
          organization_id?: string
          port_name?: string | null
          raw_data?: Json | null
          starfix_vessel_id?: string
          status?: string | null
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "starfix_inspections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "starfix_inspections_starfix_vessel_id_fkey"
            columns: ["starfix_vessel_id"]
            isOneToOne: false
            referencedRelation: "starfix_vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      starfix_performance_metrics: {
        Row: {
          avg_deficiencies_per_inspection: number | null
          benchmark_comparison: Json | null
          created_at: string | null
          deficiency_ratio: number | null
          id: string
          inspection_frequency: number | null
          last_sync_at: string | null
          metric_date: string
          organization_id: string
          performance_trend: string | null
          psc_detention_rate: number | null
          risk_rating: string | null
          sire_viq_score: number | null
          starfix_vessel_id: string
          sync_status: string | null
          updated_at: string | null
        }
        Insert: {
          avg_deficiencies_per_inspection?: number | null
          benchmark_comparison?: Json | null
          created_at?: string | null
          deficiency_ratio?: number | null
          id?: string
          inspection_frequency?: number | null
          last_sync_at?: string | null
          metric_date: string
          organization_id: string
          performance_trend?: string | null
          psc_detention_rate?: number | null
          risk_rating?: string | null
          sire_viq_score?: number | null
          starfix_vessel_id: string
          sync_status?: string | null
          updated_at?: string | null
        }
        Update: {
          avg_deficiencies_per_inspection?: number | null
          benchmark_comparison?: Json | null
          created_at?: string | null
          deficiency_ratio?: number | null
          id?: string
          inspection_frequency?: number | null
          last_sync_at?: string | null
          metric_date?: string
          organization_id?: string
          performance_trend?: string | null
          psc_detention_rate?: number | null
          risk_rating?: string | null
          sire_viq_score?: number | null
          starfix_vessel_id?: string
          sync_status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "starfix_performance_metrics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "starfix_performance_metrics_starfix_vessel_id_fkey"
            columns: ["starfix_vessel_id"]
            isOneToOne: false
            referencedRelation: "starfix_vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      starfix_vessels: {
        Row: {
          build_year: number | null
          classification_society: string | null
          created_at: string | null
          deadweight_tonnage: number | null
          flag_state: string | null
          gross_tonnage: number | null
          id: string
          imo_number: string | null
          last_sync_at: string | null
          organization_id: string
          raw_data: Json | null
          starfix_vessel_id: string
          sync_error: string | null
          sync_status: string | null
          updated_at: string | null
          vessel_id: string | null
          vessel_name: string
          vessel_type: string | null
        }
        Insert: {
          build_year?: number | null
          classification_society?: string | null
          created_at?: string | null
          deadweight_tonnage?: number | null
          flag_state?: string | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: string | null
          last_sync_at?: string | null
          organization_id: string
          raw_data?: Json | null
          starfix_vessel_id: string
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
          vessel_name: string
          vessel_type?: string | null
        }
        Update: {
          build_year?: number | null
          classification_society?: string | null
          created_at?: string | null
          deadweight_tonnage?: number | null
          flag_state?: string | null
          gross_tonnage?: number | null
          id?: string
          imo_number?: string | null
          last_sync_at?: string | null
          organization_id?: string
          raw_data?: Json | null
          starfix_vessel_id?: string
          sync_error?: string | null
          sync_status?: string | null
          updated_at?: string | null
          vessel_id?: string | null
          vessel_name?: string
          vessel_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "starfix_vessels_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "starfix_vessels_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      status_components: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          name: string
          status: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          name?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      status_incident_updates: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: string
          incident_id: string
          message: string
          status: string
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          incident_id: string
          message: string
          status: string
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: string
          incident_id?: string
          message?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "status_incident_updates_incident_id_fkey"
            columns: ["incident_id"]
            isOneToOne: false
            referencedRelation: "status_incidents"
            referencedColumns: ["id"]
          },
        ]
      }
      status_incidents: {
        Row: {
          affected_components: string[] | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: string
          resolved_at: string | null
          severity: string
          started_at: string
          status: string
          title: string
          updated_at: string | null
        }
        Insert: {
          affected_components?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity: string
          started_at?: string
          status: string
          title: string
          updated_at?: string | null
        }
        Update: {
          affected_components?: string[] | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: string
          resolved_at?: string | null
          severity?: string
          started_at?: string
          status?: string
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      status_uptime_records: {
        Row: {
          component_id: string | null
          created_at: string | null
          date: string
          id: string
          total_downtime_minutes: number | null
          uptime_percentage: number | null
        }
        Insert: {
          component_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          total_downtime_minutes?: number | null
          uptime_percentage?: number | null
        }
        Update: {
          component_id?: string | null
          created_at?: string | null
          date?: string
          id?: string
          total_downtime_minutes?: number | null
          uptime_percentage?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "status_uptime_records_component_id_fkey"
            columns: ["component_id"]
            isOneToOne: false
            referencedRelation: "status_components"
            referencedColumns: ["id"]
          },
        ]
      }
      stcw_competencies: {
        Row: {
          applicable_ranks: string[] | null
          assessment_criteria: Json | null
          code: string
          created_at: string
          description: string | null
          function_area: string | null
          id: string
          level: string | null
          name: string
          sea_service_months: number | null
          stcw_chapter: string | null
          stcw_table: string
          training_required: boolean | null
        }
        Insert: {
          applicable_ranks?: string[] | null
          assessment_criteria?: Json | null
          code: string
          created_at?: string
          description?: string | null
          function_area?: string | null
          id?: string
          level?: string | null
          name: string
          sea_service_months?: number | null
          stcw_chapter?: string | null
          stcw_table: string
          training_required?: boolean | null
        }
        Update: {
          applicable_ranks?: string[] | null
          assessment_criteria?: Json | null
          code?: string
          created_at?: string
          description?: string | null
          function_area?: string | null
          id?: string
          level?: string | null
          name?: string
          sea_service_months?: number | null
          stcw_chapter?: string | null
          stcw_table?: string
          training_required?: boolean | null
        }
        Relationships: []
      }
      suppliers: {
        Row: {
          address: string | null
          approved_at: string | null
          approved_by: string | null
          category: string[] | null
          certifications: string[] | null
          city: string | null
          company_name: string
          contact_email: string | null
          contact_name: string | null
          contact_phone: string | null
          countries: string[] | null
          country: string | null
          created_at: string
          id: string
          is_active: boolean | null
          is_approved: boolean | null
          lead_time_days: number | null
          notes: string | null
          organization_id: string | null
          payment_terms: string | null
          ports_served: string[] | null
          rating: number | null
          services: string[] | null
          total_orders: number | null
          total_value: number | null
          trading_name: string | null
          updated_at: string
          website: string | null
        }
        Insert: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string[] | null
          certifications?: string[] | null
          city?: string | null
          company_name: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          countries?: string[] | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          lead_time_days?: number | null
          notes?: string | null
          organization_id?: string | null
          payment_terms?: string | null
          ports_served?: string[] | null
          rating?: number | null
          services?: string[] | null
          total_orders?: number | null
          total_value?: number | null
          trading_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Update: {
          address?: string | null
          approved_at?: string | null
          approved_by?: string | null
          category?: string[] | null
          certifications?: string[] | null
          city?: string | null
          company_name?: string
          contact_email?: string | null
          contact_name?: string | null
          contact_phone?: string | null
          countries?: string[] | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean | null
          is_approved?: boolean | null
          lead_time_days?: number | null
          notes?: string | null
          organization_id?: string | null
          payment_terms?: string | null
          ports_served?: string[] | null
          rating?: number | null
          services?: string[] | null
          total_orders?: number | null
          total_value?: number | null
          trading_name?: string | null
          updated_at?: string
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "suppliers_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      system_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          created_at: string
          id: string
          message: string
          metadata: Json | null
          severity: string
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          severity?: string
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          severity?: string
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: []
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
      system_health_checks: {
        Row: {
          check_type: string
          created_at: string
          details: Json | null
          id: string
          response_time_ms: number | null
          status: string
        }
        Insert: {
          check_type: string
          created_at?: string
          details?: Json | null
          id?: string
          response_time_ms?: number | null
          status: string
        }
        Update: {
          check_type?: string
          created_at?: string
          details?: Json | null
          id?: string
          response_time_ms?: number | null
          status?: string
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
      task_assignments: {
        Row: {
          assigned_by: string | null
          completed_at: string | null
          created_at: string
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          priority: string
          related_entity_id: string | null
          related_entity_type: string | null
          status: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          title: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_by?: string | null
          completed_at?: string | null
          created_at?: string
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string
          related_entity_id?: string | null
          related_entity_type?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "task_assignments_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      team_dynamics: {
        Row: {
          assessment_date: string | null
          cohesion_score: number | null
          communication_score: number | null
          conflict_resolution_score: number | null
          created_at: string | null
          created_by: string | null
          id: string
          leadership_score: number | null
          organization_id: string | null
          overall_team_health: number | null
          recommendations: Json | null
          team_building_activities: Json | null
          trust_score: number | null
          vessel_id: string | null
        }
        Insert: {
          assessment_date?: string | null
          cohesion_score?: number | null
          communication_score?: number | null
          conflict_resolution_score?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          leadership_score?: number | null
          organization_id?: string | null
          overall_team_health?: number | null
          recommendations?: Json | null
          team_building_activities?: Json | null
          trust_score?: number | null
          vessel_id?: string | null
        }
        Update: {
          assessment_date?: string | null
          cohesion_score?: number | null
          communication_score?: number | null
          conflict_resolution_score?: number | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          leadership_score?: number | null
          organization_id?: string | null
          overall_team_health?: number | null
          recommendations?: Json | null
          team_building_activities?: Json | null
          trust_score?: number | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "team_dynamics_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "team_dynamics_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      telemetry_alerts: {
        Row: {
          acknowledged: boolean | null
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          id: string
          message: string
          metadata: Json | null
          recommended_action: string | null
          resolved: boolean | null
          resolved_at: string | null
          sensor_id: string
          severity: string
        }
        Insert: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          id?: string
          message: string
          metadata?: Json | null
          recommended_action?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          sensor_id: string
          severity: string
        }
        Update: {
          acknowledged?: boolean | null
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          id?: string
          message?: string
          metadata?: Json | null
          recommended_action?: string | null
          resolved?: boolean | null
          resolved_at?: string | null
          sensor_id?: string
          severity?: string
        }
        Relationships: []
      }
      telemetry_insights: {
        Row: {
          confidence: number | null
          created_at: string
          description: string
          expires_at: string | null
          id: string
          insight_type: string
          metadata: Json | null
          predicted_issue: string | null
          priority: number | null
          recommended_action: string | null
          sensor_id: string | null
          status: string | null
          title: string
        }
        Insert: {
          confidence?: number | null
          created_at?: string
          description: string
          expires_at?: string | null
          id?: string
          insight_type: string
          metadata?: Json | null
          predicted_issue?: string | null
          priority?: number | null
          recommended_action?: string | null
          sensor_id?: string | null
          status?: string | null
          title: string
        }
        Update: {
          confidence?: number | null
          created_at?: string
          description?: string
          expires_at?: string | null
          id?: string
          insight_type?: string
          metadata?: Json | null
          predicted_issue?: string | null
          priority?: number | null
          recommended_action?: string | null
          sensor_id?: string | null
          status?: string | null
          title?: string
        }
        Relationships: []
      }
      telemetry_logs: {
        Row: {
          created_at: string
          id: string
          location: string | null
          metadata: Json | null
          sensor_id: string
          sensor_type: string
          status: string | null
          timestamp: string
          unit: string | null
          value: number
          vessel_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          sensor_id: string
          sensor_type: string
          status?: string | null
          timestamp?: string
          unit?: string | null
          value: number
          vessel_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          location?: string | null
          metadata?: Json | null
          sensor_id?: string
          sensor_type?: string
          status?: string | null
          timestamp?: string
          unit?: string | null
          value?: number
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "telemetry_logs_vessel_id_fkey"
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
      terrastar_alert_subscriptions: {
        Row: {
          alert_types: Json
          created_at: string | null
          id: string
          is_active: boolean | null
          last_alert_at: string | null
          notification_channels: Json | null
          organization_id: string
          thresholds: Json | null
          updated_at: string | null
          user_id: string | null
          vessel_id: string | null
        }
        Insert: {
          alert_types: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_alert_at?: string | null
          notification_channels?: Json | null
          organization_id: string
          thresholds?: Json | null
          updated_at?: string | null
          user_id?: string | null
          vessel_id?: string | null
        }
        Update: {
          alert_types?: Json
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          last_alert_at?: string | null
          notification_channels?: Json | null
          organization_id?: string
          thresholds?: Json | null
          updated_at?: string | null
          user_id?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terrastar_alert_subscriptions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terrastar_alert_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terrastar_alert_subscriptions_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      terrastar_corrections: {
        Row: {
          accuracy_horizontal: number | null
          accuracy_vertical: number | null
          correction_age_seconds: number | null
          correction_type: string
          created_at: string | null
          id: string
          organization_id: string
          position_data: Json
          quality_indicators: Json | null
          recorded_at: string
          satellite_count: number | null
          service_level: string | null
          signal_strength: number | null
          status: string | null
          sync_status: string | null
          vessel_id: string | null
        }
        Insert: {
          accuracy_horizontal?: number | null
          accuracy_vertical?: number | null
          correction_age_seconds?: number | null
          correction_type: string
          created_at?: string | null
          id?: string
          organization_id: string
          position_data: Json
          quality_indicators?: Json | null
          recorded_at: string
          satellite_count?: number | null
          service_level?: string | null
          signal_strength?: number | null
          status?: string | null
          sync_status?: string | null
          vessel_id?: string | null
        }
        Update: {
          accuracy_horizontal?: number | null
          accuracy_vertical?: number | null
          correction_age_seconds?: number | null
          correction_type?: string
          created_at?: string | null
          id?: string
          organization_id?: string
          position_data?: Json
          quality_indicators?: Json | null
          recorded_at?: string
          satellite_count?: number | null
          service_level?: string | null
          signal_strength?: number | null
          status?: string | null
          sync_status?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "terrastar_corrections_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "terrastar_corrections_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      tide_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string | null
          id: string
          is_acknowledged: boolean | null
          message: string
          metadata: Json | null
          organization_id: string | null
          port_id: string
          port_name: string
          severity: string
          threshold_exceeded: number | null
          tide_height: number | null
          tide_time: string | null
          title: string
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message: string
          metadata?: Json | null
          organization_id?: string | null
          port_id: string
          port_name: string
          severity: string
          threshold_exceeded?: number | null
          tide_height?: number | null
          tide_time?: string | null
          title: string
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string | null
          id?: string
          is_acknowledged?: boolean | null
          message?: string
          metadata?: Json | null
          organization_id?: string | null
          port_id?: string
          port_name?: string
          severity?: string
          threshold_exceeded?: number | null
          tide_height?: number | null
          tide_time?: string | null
          title?: string
        }
        Relationships: []
      }
      tide_cache: {
        Row: {
          api_source: string | null
          created_at: string | null
          expires_at: string
          id: string
          latitude: number
          longitude: number
          port_id: string
          port_name: string
          tide_data: Json
          valid_date: string
        }
        Insert: {
          api_source?: string | null
          created_at?: string | null
          expires_at: string
          id?: string
          latitude: number
          longitude: number
          port_id: string
          port_name: string
          tide_data: Json
          valid_date: string
        }
        Update: {
          api_source?: string | null
          created_at?: string | null
          expires_at?: string
          id?: string
          latitude?: number
          longitude?: number
          port_id?: string
          port_name?: string
          tide_data?: Json
          valid_date?: string
        }
        Relationships: []
      }
      tracking_gnss_logs: {
        Row: {
          accuracy: number | null
          altitude: number | null
          correction_age_ms: number | null
          correction_source: string | null
          created_at: string | null
          device_id: string | null
          fix_type: string | null
          hdop: number | null
          heading: number | null
          id: string
          latitude: number
          longitude: number
          org_id: string | null
          pdop: number | null
          raw_data: Json | null
          recorded_at: string
          satellites_used: number | null
          signal_quality: number | null
          speed: number | null
          vdop: number | null
          vessel_id: string | null
        }
        Insert: {
          accuracy?: number | null
          altitude?: number | null
          correction_age_ms?: number | null
          correction_source?: string | null
          created_at?: string | null
          device_id?: string | null
          fix_type?: string | null
          hdop?: number | null
          heading?: number | null
          id?: string
          latitude: number
          longitude: number
          org_id?: string | null
          pdop?: number | null
          raw_data?: Json | null
          recorded_at?: string
          satellites_used?: number | null
          signal_quality?: number | null
          speed?: number | null
          vdop?: number | null
          vessel_id?: string | null
        }
        Update: {
          accuracy?: number | null
          altitude?: number | null
          correction_age_ms?: number | null
          correction_source?: string | null
          created_at?: string | null
          device_id?: string | null
          fix_type?: string | null
          hdop?: number | null
          heading?: number | null
          id?: string
          latitude?: number
          longitude?: number
          org_id?: string | null
          pdop?: number | null
          raw_data?: Json | null
          recorded_at?: string
          satellites_used?: number | null
          signal_quality?: number | null
          speed?: number | null
          vdop?: number | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_gnss_logs_device_id_fkey"
            columns: ["device_id"]
            isOneToOne: false
            referencedRelation: "gnss_devices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_gnss_logs_org_id_fkey"
            columns: ["org_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_gnss_logs_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      tracking_sessions: {
        Row: {
          created_at: string | null
          ended_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          satellite_id: string | null
          session_data: Json | null
          started_at: string | null
          status: string | null
          tracking_mode: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          satellite_id?: string | null
          session_data?: Json | null
          started_at?: string | null
          status?: string | null
          tracking_mode?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          ended_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          satellite_id?: string | null
          session_data?: Json | null
          started_at?: string | null
          status?: string | null
          tracking_mode?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tracking_sessions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tracking_sessions_satellite_id_fkey"
            columns: ["satellite_id"]
            isOneToOne: false
            referencedRelation: "satellites"
            referencedColumns: ["id"]
          },
        ]
      }
      training_completions: {
        Row: {
          attempts: number | null
          certificate_issued: boolean | null
          certificate_url: string | null
          completed_at: string | null
          completion_date: string | null
          course_id: string | null
          created_at: string
          id: string
          metadata: Json | null
          notes: string | null
          passed: boolean | null
          quiz_answers: Json | null
          quiz_score: number | null
          score: number | null
          time_spent_minutes: number | null
          training_module_id: string | null
          user_id: string
          vessel_id: string | null
        }
        Insert: {
          attempts?: number | null
          certificate_issued?: boolean | null
          certificate_url?: string | null
          completed_at?: string | null
          completion_date?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          passed?: boolean | null
          quiz_answers?: Json | null
          quiz_score?: number | null
          score?: number | null
          time_spent_minutes?: number | null
          training_module_id?: string | null
          user_id: string
          vessel_id?: string | null
        }
        Update: {
          attempts?: number | null
          certificate_issued?: boolean | null
          certificate_url?: string | null
          completed_at?: string | null
          completion_date?: string | null
          course_id?: string | null
          created_at?: string
          id?: string
          metadata?: Json | null
          notes?: string | null
          passed?: boolean | null
          quiz_answers?: Json | null
          quiz_score?: number | null
          score?: number | null
          time_spent_minutes?: number | null
          training_module_id?: string | null
          user_id?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_completions_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
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
      training_learning_paths: {
        Row: {
          ai_recommended: boolean | null
          assessment_scores: Json | null
          competency_level_target: string | null
          completed_at: string | null
          created_at: string | null
          crew_member_id: string | null
          current_module_index: number | null
          customization_notes: string | null
          estimated_duration_hours: number | null
          id: string
          last_activity_at: string | null
          learning_modules: Json
          modules_completed: Json | null
          organization_id: string
          path_description: string | null
          path_name: string
          prerequisites: Json | null
          progress_percentage: number | null
          skills_acquired: Json | null
          started_at: string | null
          status: string | null
          target_role: string | null
          updated_at: string | null
        }
        Insert: {
          ai_recommended?: boolean | null
          assessment_scores?: Json | null
          competency_level_target?: string | null
          completed_at?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          current_module_index?: number | null
          customization_notes?: string | null
          estimated_duration_hours?: number | null
          id?: string
          last_activity_at?: string | null
          learning_modules: Json
          modules_completed?: Json | null
          organization_id: string
          path_description?: string | null
          path_name: string
          prerequisites?: Json | null
          progress_percentage?: number | null
          skills_acquired?: Json | null
          started_at?: string | null
          status?: string | null
          target_role?: string | null
          updated_at?: string | null
        }
        Update: {
          ai_recommended?: boolean | null
          assessment_scores?: Json | null
          competency_level_target?: string | null
          completed_at?: string | null
          created_at?: string | null
          crew_member_id?: string | null
          current_module_index?: number | null
          customization_notes?: string | null
          estimated_duration_hours?: number | null
          id?: string
          last_activity_at?: string | null
          learning_modules?: Json
          modules_completed?: Json | null
          organization_id?: string
          path_description?: string | null
          path_name?: string
          prerequisites?: Json | null
          progress_percentage?: number | null
          skills_acquired?: Json | null
          started_at?: string | null
          status?: string | null
          target_role?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_learning_paths_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_learning_paths_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      training_modules: {
        Row: {
          audit_id: string | null
          category: string | null
          content: Json | null
          created_at: string | null
          created_by: string | null
          description: string | null
          duration_hours: number | null
          expiration_months: number | null
          gap_detected: string | null
          id: string
          norm_reference: string | null
          organization_id: string | null
          quiz: Json | null
          status: string | null
          title: string
          training_content: string | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          audit_id?: string | null
          category?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          expiration_months?: number | null
          gap_detected?: string | null
          id?: string
          norm_reference?: string | null
          organization_id?: string | null
          quiz?: Json | null
          status?: string | null
          title: string
          training_content?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          audit_id?: string | null
          category?: string | null
          content?: Json | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          duration_hours?: number | null
          expiration_months?: number | null
          gap_detected?: string | null
          id?: string
          norm_reference?: string | null
          organization_id?: string | null
          quiz?: Json | null
          status?: string | null
          title?: string
          training_content?: string | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_modules_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_modules_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      training_records: {
        Row: {
          certificate_expiry_date: string | null
          certificate_number: string | null
          certificate_url: string | null
          created_at: string
          crew_member_id: string | null
          duration_hours: number | null
          end_date: string | null
          id: string
          is_mandatory: boolean | null
          metadata: Json | null
          notes: string | null
          organization_id: string | null
          passed: boolean | null
          score: number | null
          start_date: string
          status: string | null
          training_name: string
          training_provider: string | null
          training_type: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          certificate_expiry_date?: string | null
          certificate_number?: string | null
          certificate_url?: string | null
          created_at?: string
          crew_member_id?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          is_mandatory?: boolean | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          passed?: boolean | null
          score?: number | null
          start_date?: string
          status?: string | null
          training_name: string
          training_provider?: string | null
          training_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          certificate_expiry_date?: string | null
          certificate_number?: string | null
          certificate_url?: string | null
          created_at?: string
          crew_member_id?: string | null
          duration_hours?: number | null
          end_date?: string | null
          id?: string
          is_mandatory?: boolean | null
          metadata?: Json | null
          notes?: string | null
          organization_id?: string | null
          passed?: boolean | null
          score?: number | null
          start_date?: string
          status?: string | null
          training_name?: string
          training_provider?: string | null
          training_type?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "training_records_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "training_records_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      trust_compliance_logs: {
        Row: {
          action_type: string
          compliance_score: number | null
          created_at: string | null
          details: Json | null
          entity_id: string | null
          entity_type: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          risk_indicators: Json | null
          trust_level: string | null
          user_id: string | null
        }
        Insert: {
          action_type: string
          compliance_score?: number | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          risk_indicators?: Json | null
          trust_level?: string | null
          user_id?: string | null
        }
        Update: {
          action_type?: string
          compliance_score?: number | null
          created_at?: string | null
          details?: Json | null
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          risk_indicators?: Json | null
          trust_level?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "trust_compliance_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
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
      user_organizations: {
        Row: {
          created_at: string | null
          id: string
          is_primary: boolean | null
          organization_id: string
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          organization_id: string
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          is_primary?: boolean | null
          organization_id?: string
          user_id?: string
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
      user_settings: {
        Row: {
          created_at: string
          id: string
          settings_key: string
          settings_value: Json | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          id?: string
          settings_key: string
          settings_value?: Json | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          id?: string
          settings_key?: string
          settings_value?: Json | null
          updated_at?: string
          user_id?: string | null
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
      vessel_ai_contexts: {
        Row: {
          context_id: string
          created_at: string | null
          global_data: Json | null
          id: string
          interaction_count: number | null
          last_sync: string | null
          local_data: Json | null
          model_version: string | null
          updated_at: string | null
          vessel_id: string
        }
        Insert: {
          context_id: string
          created_at?: string | null
          global_data?: Json | null
          id?: string
          interaction_count?: number | null
          last_sync?: string | null
          local_data?: Json | null
          model_version?: string | null
          updated_at?: string | null
          vessel_id: string
        }
        Update: {
          context_id?: string
          created_at?: string | null
          global_data?: Json | null
          id?: string
          interaction_count?: number | null
          last_sync?: string | null
          local_data?: Json | null
          model_version?: string | null
          updated_at?: string | null
          vessel_id?: string
        }
        Relationships: []
      }
      vessel_alert_notifications: {
        Row: {
          alert_id: string | null
          id: string
          metadata: Json | null
          notification_type: string
          read_at: string | null
          sent_at: string
          user_id: string | null
        }
        Insert: {
          alert_id?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          sent_at?: string
          user_id?: string | null
        }
        Update: {
          alert_id?: string | null
          id?: string
          metadata?: Json | null
          notification_type?: string
          read_at?: string | null
          sent_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_alert_notifications_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "vessel_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_alerts: {
        Row: {
          acknowledged_at: string | null
          acknowledged_by: string | null
          alert_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          resolved_at: string | null
          severity: string
          status: string
          title: string
          updated_at: string
          vessel_id: string | null
        }
        Insert: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title: string
          updated_at?: string
          vessel_id?: string | null
        }
        Update: {
          acknowledged_at?: string | null
          acknowledged_by?: string | null
          alert_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          resolved_at?: string | null
          severity?: string
          status?: string
          title?: string
          updated_at?: string
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_alerts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_alerts_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
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
      vessel_contracts: {
        Row: {
          client_name: string
          contract_number: string
          created_at: string | null
          created_by: string | null
          end_date: string
          id: string
          operator_name: string | null
          organization_id: string | null
          penalty_currency: string | null
          penalty_per_hour: number | null
          sla_downtime_percent: number | null
          start_date: string
          status: string | null
          terms_conditions: Json | null
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          client_name: string
          contract_number: string
          created_at?: string | null
          created_by?: string | null
          end_date: string
          id?: string
          operator_name?: string | null
          organization_id?: string | null
          penalty_currency?: string | null
          penalty_per_hour?: number | null
          sla_downtime_percent?: number | null
          start_date: string
          status?: string | null
          terms_conditions?: Json | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          client_name?: string
          contract_number?: string
          created_at?: string | null
          created_by?: string | null
          end_date?: string
          id?: string
          operator_name?: string | null
          organization_id?: string | null
          penalty_currency?: string | null
          penalty_per_hour?: number | null
          sla_downtime_percent?: number | null
          start_date?: string
          status?: string | null
          terms_conditions?: Json | null
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_contracts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_contracts_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_history: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string | null
          documents: Json | null
          event_date: string
          event_type: string
          id: string
          metadata: Json | null
          organization_id: string | null
          relevance_score: number | null
          title: string
          updated_at: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          documents?: Json | null
          event_date: string
          event_type: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          relevance_score?: number | null
          title: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          documents?: Json | null
          event_date?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          relevance_score?: number | null
          title?: string
          updated_at?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_history_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_history_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_manuals: {
        Row: {
          created_at: string | null
          created_by: string | null
          file_path: string
          file_size: number | null
          id: string
          manual_type: string
          metadata: Json | null
          ocr_processed: boolean | null
          organization_id: string | null
          searchable_text: string | null
          status: string | null
          title: string
          updated_at: string | null
          upload_date: string | null
          version: string | null
          vessel_id: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          file_path: string
          file_size?: number | null
          id?: string
          manual_type: string
          metadata?: Json | null
          ocr_processed?: boolean | null
          organization_id?: string | null
          searchable_text?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          upload_date?: string | null
          version?: string | null
          vessel_id?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          file_path?: string
          file_size?: number | null
          id?: string
          manual_type?: string
          metadata?: Json | null
          ocr_processed?: boolean | null
          organization_id?: string | null
          searchable_text?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          upload_date?: string | null
          version?: string | null
          vessel_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_manuals_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_manuals_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      vessel_performance: {
        Row: {
          created_at: string
          crew_performance_avg: number | null
          evaluation_period_end: string
          evaluation_period_start: string
          fuel_efficiency_score: number | null
          id: string
          incidents_count: number | null
          maintenance_compliance_score: number | null
          metadata: Json | null
          notes: string | null
          operational_uptime_percent: number | null
          organization_id: string | null
          overall_performance_rating: number | null
          safety_score: number | null
          updated_at: string
          vessel_id: string | null
          vessel_name: string | null
        }
        Insert: {
          created_at?: string
          crew_performance_avg?: number | null
          evaluation_period_end?: string
          evaluation_period_start?: string
          fuel_efficiency_score?: number | null
          id?: string
          incidents_count?: number | null
          maintenance_compliance_score?: number | null
          metadata?: Json | null
          notes?: string | null
          operational_uptime_percent?: number | null
          organization_id?: string | null
          overall_performance_rating?: number | null
          safety_score?: number | null
          updated_at?: string
          vessel_id?: string | null
          vessel_name?: string | null
        }
        Update: {
          created_at?: string
          crew_performance_avg?: number | null
          evaluation_period_end?: string
          evaluation_period_start?: string
          fuel_efficiency_score?: number | null
          id?: string
          incidents_count?: number | null
          maintenance_compliance_score?: number | null
          metadata?: Json | null
          notes?: string | null
          operational_uptime_percent?: number | null
          organization_id?: string | null
          overall_performance_rating?: number | null
          safety_score?: number | null
          updated_at?: string
          vessel_id?: string | null
          vessel_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_performance_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_performance_vessel_id_fkey"
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
      vessel_status: {
        Row: {
          alerts: Json | null
          cargo_status: string | null
          created_at: string | null
          crew_count: number | null
          engine_status: string | null
          eta: string | null
          fuel_level: number | null
          heading: number | null
          id: string
          last_port: string | null
          location: Json | null
          next_port: string | null
          recorded_at: string | null
          sensors_data: Json | null
          speed: number | null
          status: string | null
          vessel_id: string | null
          weather_conditions: Json | null
        }
        Insert: {
          alerts?: Json | null
          cargo_status?: string | null
          created_at?: string | null
          crew_count?: number | null
          engine_status?: string | null
          eta?: string | null
          fuel_level?: number | null
          heading?: number | null
          id?: string
          last_port?: string | null
          location?: Json | null
          next_port?: string | null
          recorded_at?: string | null
          sensors_data?: Json | null
          speed?: number | null
          status?: string | null
          vessel_id?: string | null
          weather_conditions?: Json | null
        }
        Update: {
          alerts?: Json | null
          cargo_status?: string | null
          created_at?: string | null
          crew_count?: number | null
          engine_status?: string | null
          eta?: string | null
          fuel_level?: number | null
          heading?: number | null
          id?: string
          last_port?: string | null
          location?: Json | null
          next_port?: string | null
          recorded_at?: string | null
          sensors_data?: Json | null
          speed?: number | null
          status?: string | null
          vessel_id?: string | null
          weather_conditions?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "vessel_status_vessel_id_fkey"
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
      vessel_trust_relationships: {
        Row: {
          created_at: string
          established_at: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          relationship_type: string
          source_vessel_id: string | null
          status: string
          target_vessel_id: string | null
          trust_level: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          established_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          relationship_type?: string
          source_vessel_id?: string | null
          status?: string
          target_vessel_id?: string | null
          trust_level?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          established_at?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          relationship_type?: string
          source_vessel_id?: string | null
          status?: string
          target_vessel_id?: string | null
          trust_level?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "vessel_trust_relationships_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_trust_relationships_source_vessel_id_fkey"
            columns: ["source_vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "vessel_trust_relationships_target_vessel_id_fkey"
            columns: ["target_vessel_id"]
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
      voice_transcripts: {
        Row: {
          audio_url: string | null
          confidence: number | null
          created_at: string | null
          duration_seconds: number | null
          id: string
          language: string | null
          metadata: Json | null
          organization_id: string | null
          status: string | null
          transcript: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          audio_url?: string | null
          confidence?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          metadata?: Json | null
          organization_id?: string | null
          status?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          audio_url?: string | null
          confidence?: number | null
          created_at?: string | null
          duration_seconds?: number | null
          id?: string
          language?: string | null
          metadata?: Json | null
          organization_id?: string | null
          status?: string | null
          transcript?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voice_transcripts_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      voyage_accounting: {
        Row: {
          actual_costs: number | null
          actual_revenue: number | null
          ai_analyzed: boolean | null
          ai_recommendations: Json | null
          arrival_date: string | null
          arrival_port: string
          budget_costs: number | null
          budget_revenue: number | null
          cargo_quantity: number | null
          cargo_type: string | null
          created_at: string | null
          departure_date: string
          departure_port: string
          id: string
          margin_percent: number | null
          net_result: number | null
          organization_id: string | null
          status: string | null
          tce_daily: number | null
          updated_at: string | null
          vessel_id: string | null
          voyage_number: string
        }
        Insert: {
          actual_costs?: number | null
          actual_revenue?: number | null
          ai_analyzed?: boolean | null
          ai_recommendations?: Json | null
          arrival_date?: string | null
          arrival_port: string
          budget_costs?: number | null
          budget_revenue?: number | null
          cargo_quantity?: number | null
          cargo_type?: string | null
          created_at?: string | null
          departure_date: string
          departure_port: string
          id?: string
          margin_percent?: number | null
          net_result?: number | null
          organization_id?: string | null
          status?: string | null
          tce_daily?: number | null
          updated_at?: string | null
          vessel_id?: string | null
          voyage_number: string
        }
        Update: {
          actual_costs?: number | null
          actual_revenue?: number | null
          ai_analyzed?: boolean | null
          ai_recommendations?: Json | null
          arrival_date?: string | null
          arrival_port?: string
          budget_costs?: number | null
          budget_revenue?: number | null
          cargo_quantity?: number | null
          cargo_type?: string | null
          created_at?: string | null
          departure_date?: string
          departure_port?: string
          id?: string
          margin_percent?: number | null
          net_result?: number | null
          organization_id?: string | null
          status?: string | null
          tce_daily?: number | null
          updated_at?: string | null
          vessel_id?: string | null
          voyage_number?: string
        }
        Relationships: [
          {
            foreignKeyName: "voyage_accounting_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "voyage_accounting_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      voyage_costs: {
        Row: {
          actual_amount: number | null
          approval_status: string | null
          budgeted_amount: number | null
          cost_category: string
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          invoice_url: string | null
          variance: number | null
          voyage_id: string | null
        }
        Insert: {
          actual_amount?: number | null
          approval_status?: string | null
          budgeted_amount?: number | null
          cost_category: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          variance?: number | null
          voyage_id?: string | null
        }
        Update: {
          actual_amount?: number | null
          approval_status?: string | null
          budgeted_amount?: number | null
          cost_category?: string
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          invoice_url?: string | null
          variance?: number | null
          voyage_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "voyage_costs_voyage_id_fkey"
            columns: ["voyage_id"]
            isOneToOne: false
            referencedRelation: "voyage_accounting"
            referencedColumns: ["id"]
          },
        ]
      }
      voyage_routes: {
        Row: {
          alternatives_count: number
          created_at: string
          destination: Json
          hazards_count: number
          id: string
          name: string | null
          notes: string | null
          origin: Json
          recommended_route_id: string
          route_data: Json
          vessel_id: string | null
        }
        Insert: {
          alternatives_count?: number
          created_at?: string
          destination: Json
          hazards_count?: number
          id?: string
          name?: string | null
          notes?: string | null
          origin: Json
          recommended_route_id: string
          route_data: Json
          vessel_id?: string | null
        }
        Update: {
          alternatives_count?: number
          created_at?: string
          destination?: Json
          hazards_count?: number
          id?: string
          name?: string | null
          notes?: string | null
          origin?: Json
          recommended_route_id?: string
          route_data?: Json
          vessel_id?: string | null
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
      weather_cache: {
        Row: {
          api_source: string
          cache_key: string
          created_at: string | null
          data: Json
          expires_at: string
          id: string
          latitude: number
          longitude: number
          updated_at: string | null
        }
        Insert: {
          api_source: string
          cache_key: string
          created_at?: string | null
          data: Json
          expires_at: string
          id?: string
          latitude: number
          longitude: number
          updated_at?: string | null
        }
        Update: {
          api_source?: string
          cache_key?: string
          created_at?: string | null
          data?: Json
          expires_at?: string
          id?: string
          latitude?: number
          longitude?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      weather_conditions: {
        Row: {
          conditions: string | null
          created_at: string | null
          forecast: Json | null
          humidity: number | null
          id: string
          latitude: number | null
          location_name: string | null
          longitude: number | null
          organization_id: string | null
          pressure: number | null
          recorded_at: string | null
          source: string | null
          temperature: number | null
          vessel_id: string | null
          visibility: number | null
          wave_height: number | null
          wind_direction: number | null
          wind_speed: number | null
        }
        Insert: {
          conditions?: string | null
          created_at?: string | null
          forecast?: Json | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          organization_id?: string | null
          pressure?: number | null
          recorded_at?: string | null
          source?: string | null
          temperature?: number | null
          vessel_id?: string | null
          visibility?: number | null
          wave_height?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Update: {
          conditions?: string | null
          created_at?: string | null
          forecast?: Json | null
          humidity?: number | null
          id?: string
          latitude?: number | null
          location_name?: string | null
          longitude?: number | null
          organization_id?: string | null
          pressure?: number | null
          recorded_at?: string | null
          source?: string | null
          temperature?: number | null
          vessel_id?: string | null
          visibility?: number | null
          wave_height?: number | null
          wind_direction?: number | null
          wind_speed?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "weather_conditions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "weather_conditions_vessel_id_fkey"
            columns: ["vessel_id"]
            isOneToOne: false
            referencedRelation: "vessels"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_configurations: {
        Row: {
          created_at: string
          created_by: string | null
          event_types: string[]
          headers: Json | null
          id: string
          is_active: boolean | null
          last_status: number | null
          last_triggered_at: string | null
          method: string
          name: string
          retry_count: number | null
          secret_key: string | null
          updated_at: string
          url: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          event_types: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_status?: number | null
          last_triggered_at?: string | null
          method?: string
          name: string
          retry_count?: number | null
          secret_key?: string | null
          updated_at?: string
          url: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          event_types?: string[]
          headers?: Json | null
          id?: string
          is_active?: boolean | null
          last_status?: number | null
          last_triggered_at?: string | null
          method?: string
          name?: string
          retry_count?: number | null
          secret_key?: string | null
          updated_at?: string
          url?: string
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
          max_retries: number | null
          organization_id: string | null
          payload: Json
          processed_at: string | null
          retry_count: number | null
          source_ip: string | null
          status: string | null
          triggered_at: string | null
        }
        Insert: {
          created_at?: string | null
          error_message?: string | null
          event_name: string
          event_type: string
          headers?: Json | null
          id?: string
          integration_id?: string | null
          max_retries?: number | null
          organization_id?: string | null
          payload: Json
          processed_at?: string | null
          retry_count?: number | null
          source_ip?: string | null
          status?: string | null
          triggered_at?: string | null
        }
        Update: {
          created_at?: string | null
          error_message?: string | null
          event_name?: string
          event_type?: string
          headers?: Json | null
          id?: string
          integration_id?: string | null
          max_retries?: number | null
          organization_id?: string | null
          payload?: Json
          processed_at?: string | null
          retry_count?: number | null
          source_ip?: string | null
          status?: string | null
          triggered_at?: string | null
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
      webhook_integrations: {
        Row: {
          config: Json | null
          created_at: string | null
          events: string[] | null
          headers: Json | null
          id: string
          integration_name: string
          is_active: boolean | null
          organization_id: string | null
          secret_key: string | null
          updated_at: string | null
          webhook_url: string
        }
        Insert: {
          config?: Json | null
          created_at?: string | null
          events?: string[] | null
          headers?: Json | null
          id?: string
          integration_name: string
          is_active?: boolean | null
          organization_id?: string | null
          secret_key?: string | null
          updated_at?: string | null
          webhook_url: string
        }
        Update: {
          config?: Json | null
          created_at?: string | null
          events?: string[] | null
          headers?: Json | null
          id?: string
          integration_name?: string
          is_active?: boolean | null
          organization_id?: string | null
          secret_key?: string | null
          updated_at?: string | null
          webhook_url?: string
        }
        Relationships: [
          {
            foreignKeyName: "webhook_integrations_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_logs: {
        Row: {
          created_at: string
          duration_ms: number | null
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          response_body: string | null
          response_status: number | null
          success: boolean | null
          webhook_id: string | null
        }
        Insert: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          webhook_id?: string | null
        }
        Update: {
          created_at?: string
          duration_ms?: number | null
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          response_body?: string | null
          response_status?: number | null
          success?: boolean | null
          webhook_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "webhook_logs_webhook_id_fkey"
            columns: ["webhook_id"]
            isOneToOne: false
            referencedRelation: "webhook_configurations"
            referencedColumns: ["id"]
          },
        ]
      }
      wellness_plans: {
        Row: {
          created_at: string | null
          created_by: string | null
          crew_member_id: string | null
          follow_up_schedule: Json | null
          id: string
          identified_risks: Json | null
          mental_health_resources: Json | null
          organization_id: string | null
          psychological_assessment: string | null
          recommended_breaks: Json | null
          relaxation_exercises: Json | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          follow_up_schedule?: Json | null
          id?: string
          identified_risks?: Json | null
          mental_health_resources?: Json | null
          organization_id?: string | null
          psychological_assessment?: string | null
          recommended_breaks?: Json | null
          relaxation_exercises?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          crew_member_id?: string | null
          follow_up_schedule?: Json | null
          id?: string
          identified_risks?: Json | null
          mental_health_resources?: Json | null
          organization_id?: string | null
          psychological_assessment?: string | null
          recommended_breaks?: Json | null
          relaxation_exercises?: Json | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "wellness_plans_crew_member_id_fkey"
            columns: ["crew_member_id"]
            isOneToOne: false
            referencedRelation: "crew_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "wellness_plans_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
      whistleblower_reports: {
        Row: {
          ai_classification: Json | null
          assigned_investigator_id: string | null
          category: string
          created_at: string
          description: string
          id: string
          investigation_notes: string | null
          is_anonymous: boolean | null
          report_code: string
          report_status: string
          reporter_contact: string | null
          resolution: string | null
          resolution_date: string | null
          severity: string
          updated_at: string
        }
        Insert: {
          ai_classification?: Json | null
          assigned_investigator_id?: string | null
          category: string
          created_at?: string
          description: string
          id?: string
          investigation_notes?: string | null
          is_anonymous?: boolean | null
          report_code: string
          report_status?: string
          reporter_contact?: string | null
          resolution?: string | null
          resolution_date?: string | null
          severity?: string
          updated_at?: string
        }
        Update: {
          ai_classification?: Json | null
          assigned_investigator_id?: string | null
          category?: string
          created_at?: string
          description?: string
          id?: string
          investigation_notes?: string | null
          is_anonymous?: boolean | null
          report_code?: string
          report_status?: string
          reporter_contact?: string | null
          resolution?: string | null
          resolution_date?: string | null
          severity?: string
          updated_at?: string
        }
        Relationships: []
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
      workflow_steps: {
        Row: {
          assigned_to: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          metadata: Json | null
          position: number
          priority: string | null
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          workflow_id: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          position?: number
          priority?: string | null
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          workflow_id: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          metadata?: Json | null
          position?: number
          priority?: string | null
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          workflow_id?: string
        }
        Relationships: []
      }
      workflow_suggestions: {
        Row: {
          action_data: Json | null
          applied_at: string | null
          applied_by: string | null
          confidence_score: number | null
          created_at: string
          description: string | null
          dismissed_at: string | null
          dismissed_by: string | null
          id: string
          metadata: Json | null
          organization_id: string | null
          priority: string | null
          source: string | null
          status: string | null
          suggestion_type: string
          title: string
          workflow_id: string | null
        }
        Insert: {
          action_data?: Json | null
          applied_at?: string | null
          applied_by?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          source?: string | null
          status?: string | null
          suggestion_type: string
          title: string
          workflow_id?: string | null
        }
        Update: {
          action_data?: Json | null
          applied_at?: string | null
          applied_by?: string | null
          confidence_score?: number | null
          created_at?: string
          description?: string | null
          dismissed_at?: string | null
          dismissed_by?: string | null
          id?: string
          metadata?: Json | null
          organization_id?: string | null
          priority?: string | null
          source?: string | null
          status?: string | null
          suggestion_type?: string
          title?: string
          workflow_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workflow_suggestions_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
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
      ai_usage_daily_stats: {
        Row: {
          avg_response_time_ms: number | null
          failed_requests: number | null
          module_id: string | null
          module_name: string | null
          organization_id: string | null
          successful_requests: number | null
          total_messages: number | null
          total_requests: number | null
          total_tokens_input: number | null
          total_tokens_output: number | null
          usage_date: string | null
          voice_requests: number | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_usage_logs_organization_id_fkey"
            columns: ["organization_id"]
            isOneToOne: false
            referencedRelation: "organizations"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Functions: {
      approve_autonomous_task: {
        Args: { p_approved: boolean; p_task_id: string }
        Returns: boolean
      }
      auto_mark_overdue_tasks: { Args: never; Returns: undefined }
      calculate_checklist_compliance_score: {
        Args: { checklist_items: Json }
        Returns: number
      }
      calculate_crew_overall_performance: {
        Args: { crew_uuid: string }
        Returns: number
      }
      calculate_ia_adoption_score: {
        Args: { org_uuid: string }
        Returns: number
      }
      calculate_next_execution: { Args: { task_id: string }; Returns: string }
      calculate_peotram_compliance_score: {
        Args: { audit_uuid: string }
        Returns: number
      }
      calculate_preovid_audit_score: {
        Args: { p_audit_id: string }
        Returns: number
      }
      calculate_satellite_passes: {
        Args: {
          p_hours_ahead?: number
          p_location_lat: number
          p_location_lon: number
          p_satellite_id: string
        }
        Returns: Json[]
      }
      calculate_starfix_risk_rating: {
        Args: { p_period_days?: number; p_vessel_id: string }
        Returns: string
      }
      can_access_employee_data: {
        Args: { target_employee_id: string; user_uuid?: string }
        Returns: boolean
      }
      can_manage_tenant: {
        Args: { tenant_uuid: string; user_uuid?: string }
        Returns: boolean
      }
      check_log_rate_limit: { Args: never; Returns: boolean }
      check_organization_limits: {
        Args: { limit_type: string; org_id: string }
        Returns: boolean
      }
      check_satellite_coverage: {
        Args: { p_critical_area: Json; p_satellite_id: string }
        Returns: boolean
      }
      check_tenant_limits: {
        Args: { limit_type: string; tenant_uuid: string }
        Returns: boolean
      }
      check_terrastar_signal_quality: {
        Args: { p_vessel_id: string }
        Returns: Json
      }
      check_user_permission: {
        Args: {
          p_organization_id: string
          p_required_role?: string
          p_user_id: string
        }
        Returns: boolean
      }
      cleanup_expired_cache: { Args: never; Returns: number }
      cleanup_old_logs: { Args: never; Returns: undefined }
      create_autonomous_task: {
        Args: {
          p_autonomy_level?: number
          p_decision_logic?: Json
          p_description?: string
          p_equipment_id?: string
          p_mission_id?: string
          p_task_name: string
          p_task_type: string
        }
        Returns: string
      }
      create_sample_peotram_audit: { Args: never; Returns: string }
      create_session_token:
        | {
            Args: { p_device_info?: Json; p_expires_in_hours?: number }
            Returns: {
              expires_at: string
              token: string
              token_id: string
            }[]
          }
        | { Args: { p_user_id: string }; Returns: string }
      create_tide_alert: {
        Args: {
          p_alert_type: string
          p_message: string
          p_port_id: string
          p_port_name: string
          p_severity: string
          p_threshold_exceeded?: number
          p_tide_height?: number
          p_tide_time?: string
          p_title: string
        }
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
        Args: { p_vessel_id: string }
        Returns: Json
      }
      generate_next_checklist_date: {
        Args: { frequency: string; last_date?: string }
        Returns: string
      }
      get_active_sessions: {
        Args: never
        Returns: {
          created_at: string
          expires_at: string
          session_id: string
          user_id: string
        }[]
      }
      get_current_organization_id: { Args: never; Returns: string }
      get_current_tenant_id: { Args: never; Returns: string }
      get_drill_statistics: {
        Args: { p_organization_id: string }
        Returns: Json
      }
      get_overdue_tasks: {
        Args: never
        Returns: {
          days_overdue: number
          organization_id: string
          task_id: string
          task_name: string
        }[]
      }
      get_pending_tasks: {
        Args: { p_limit?: number }
        Returns: {
          next_execution_at: string
          organization_id: string
          task_config: Json
          task_id: string
          task_name: string
          task_type: string
          vessel_id: string
        }[]
      }
      get_reservation_stats:
        | { Args: { p_end_date: string; p_start_date: string }; Returns: Json }
        | {
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
      get_training_stats: { Args: { p_organization_id: string }; Returns: Json }
      get_user_organization:
        | { Args: never; Returns: string }
        | { Args: { _user_id: string }; Returns: string }
      get_user_organization_role: {
        Args: { org_id: string; user_uuid?: string }
        Returns: string
      }
      get_user_organizations: {
        Args: { p_user_id: string }
        Returns: {
          joined_at: string
          organization_id: string
          organization_name: string
          role: string
          status: string
        }[]
      }
      get_user_profile: {
        Args: { user_uuid: string }
        Returns: {
          avatar_url: string
          full_name: string
          id: string
          role: string
        }[]
      }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      get_user_tenant_role: {
        Args: { tenant_uuid: string; user_uuid?: string }
        Returns: string
      }
      get_weather_cache: {
        Args: { p_api_source?: string; p_lat: number; p_lng: number }
        Returns: Json
      }
      has_feature_permission: {
        Args: {
          feature_name: string
          required_level?: string
          target_vessel_id?: string
        }
        Returns: boolean
      }
      has_finance_access: { Args: { _user_id: string }; Returns: boolean }
      has_permission: {
        Args: {
          permission_name: string
          permission_type?: string
          user_uuid?: string
        }
        Returns: boolean
      }
      has_role:
        | { Args: { _role: string; _user_id: string }; Returns: boolean }
        | {
            Args: {
              _role: Database["public"]["Enums"]["user_role"]
              _user_id: string
            }
            Returns: boolean
          }
      increment_api_rate_limit: {
        Args: { p_api_key_id: string; p_window_type: string }
        Returns: boolean
      }
      is_admin:
        | { Args: never; Returns: boolean }
        | { Args: { _user_id: string }; Returns: boolean }
      is_admin_or_hr: { Args: { _user_id: string }; Returns: boolean }
      is_hr: { Args: { _user_id: string }; Returns: boolean }
      is_manager_or_above: { Args: never; Returns: boolean }
      is_org_admin: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      is_org_member: {
        Args: { _org_id: string; _user_id: string }
        Returns: boolean
      }
      jobs_trend_by_month: {
        Args: never
        Returns: {
          count: number
          month: string
        }[]
      }
      log_api_request: {
        Args: {
          p_api_name: string
          p_endpoint: string
          p_error_message?: string
          p_method?: string
          p_request_params?: Json
          p_response_time_ms?: number
          p_status_code?: number
          p_success?: boolean
        }
        Returns: string
      }
      log_security_event: {
        Args: {
          p_action: string
          p_details?: Json
          p_event_type: string
          p_resource_id?: string
          p_resource_type?: string
          p_severity?: string
        }
        Returns: string
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
      mark_task_executed: {
        Args: {
          p_error?: string
          p_result?: Json
          p_success: boolean
          p_task_id: string
        }
        Returns: undefined
      }
      match_mmi_job_history: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          action: string
          created_at: string
          job_id: string
          outcome: string
          similarity: number
        }[]
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
      match_os_resolvidas: {
        Args: {
          match_count?: number
          match_threshold?: number
          query_embedding: string
        }
        Returns: {
          acao_tomada: string
          componente_nome: string
          descricao: string
          id: string
          resultado: string
          similarity: number
          titulo: string
        }[]
      }
      revoke_session_token:
        | { Args: { p_token: string }; Returns: undefined }
        | { Args: { p_reason?: string; p_token_id: string }; Returns: boolean }
      set_weather_cache: {
        Args: {
          p_api_source: string
          p_data: Json
          p_lat: number
          p_lng: number
          p_ttl_minutes?: number
        }
        Returns: undefined
      }
      update_satellite_position: {
        Args: {
          p_altitude_km: number
          p_latitude: number
          p_longitude: number
          p_satellite_id: string
          p_velocity_kmh?: number
        }
        Returns: string
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
      validate_webhook_signature: {
        Args: { payload: string; secret: string; signature: string }
        Returns: boolean
      }
    }
    Enums: {
      approval_status:
        | "draft"
        | "pending_review"
        | "pending_approval"
        | "approved"
        | "rejected"
        | "superseded"
        | "archived"
      document_category:
        | "ism_procedure"
        | "mlc_agreement"
        | "psc_checklist"
        | "audit_report"
        | "safety_manual"
        | "crew_certificate"
        | "vessel_certificate"
        | "emergency_procedure"
        | "training_record"
        | "maintenance_procedure"
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
      approval_status: [
        "draft",
        "pending_review",
        "pending_approval",
        "approved",
        "rejected",
        "superseded",
        "archived",
      ],
      document_category: [
        "ism_procedure",
        "mlc_agreement",
        "psc_checklist",
        "audit_report",
        "safety_manual",
        "crew_certificate",
        "vessel_certificate",
        "emergency_procedure",
        "training_record",
        "maintenance_procedure",
      ],
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
} as const
