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
