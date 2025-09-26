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
          priority?: string
          related_module?: string | null
          status?: string
          title?: string
          updated_at?: string
          user_id?: string
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
            foreignKeyName: "crew_members_vessel_id_fkey"
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
          passport_number?: string | null
          phone?: string | null
          position?: string
          status?: string | null
          updated_at?: string | null
          user_id?: string | null
          vessel_assignment?: string | null
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
          priority?: string
          read?: boolean
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
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
          product_name?: string
          product_url?: string
          store_name?: string | null
          target_price?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: []
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
      reservations: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string
          id: string
          location: string | null
          reservation_type: string
          start_date: string
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date: string
          id?: string
          location?: string | null
          reservation_type: string
          start_date: string
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string
          id?: string
          location?: string | null
          reservation_type?: string
          start_date?: string
          status?: string | null
          title?: string
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
          created_at: string | null
          current_location: string | null
          eta: string | null
          flag_state: string
          id: string
          imo_number: string | null
          name: string
          next_port: string | null
          status: string | null
          updated_at: string | null
          vessel_type: string
        }
        Insert: {
          created_at?: string | null
          current_location?: string | null
          eta?: string | null
          flag_state: string
          id?: string
          imo_number?: string | null
          name: string
          next_port?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_type: string
        }
        Update: {
          created_at?: string | null
          current_location?: string | null
          eta?: string | null
          flag_state?: string
          id?: string
          imo_number?: string | null
          name?: string
          next_port?: string | null
          status?: string | null
          updated_at?: string | null
          vessel_type?: string
        }
        Relationships: []
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
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      can_access_employee_data: {
        Args: { target_employee_id: string; user_uuid?: string }
        Returns: boolean
      }
      get_user_role: {
        Args: { user_uuid?: string }
        Returns: Database["public"]["Enums"]["user_role"]
      }
      has_permission: {
        Args: {
          permission_name: string
          permission_type?: string
          user_uuid?: string
        }
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
} as const
