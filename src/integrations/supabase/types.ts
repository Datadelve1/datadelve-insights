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
      activity_logs: {
        Row: {
          created_at: string
          description: string
          id: string
          logged_at: string
          session_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          logged_at?: string
          session_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          logged_at?: string
          session_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "activity_logs_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "time_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notes: {
        Row: {
          admin_id: string
          created_at: string
          id: string
          note: string
          user_id: string
        }
        Insert: {
          admin_id: string
          created_at?: string
          id?: string
          note?: string
          user_id: string
        }
        Update: {
          admin_id?: string
          created_at?: string
          id?: string
          note?: string
          user_id?: string
        }
        Relationships: []
      }
      ambassador_applications: {
        Row: {
          attended_sessions: boolean
          commitment_agreed: boolean
          completed_assignments: boolean
          created_at: string
          cv_url: string
          email: string
          full_name: string
          id: string
          linkedin_url: string
          phone: string
          skills_strengths: string
          submitted_reflections: boolean
          video_url: string
          whatsapp_engagement: string
          why_ambassador: string
          willing_20hrs: boolean
        }
        Insert: {
          attended_sessions?: boolean
          commitment_agreed?: boolean
          completed_assignments?: boolean
          created_at?: string
          cv_url: string
          email: string
          full_name: string
          id?: string
          linkedin_url: string
          phone: string
          skills_strengths: string
          submitted_reflections?: boolean
          video_url: string
          whatsapp_engagement: string
          why_ambassador: string
          willing_20hrs?: boolean
        }
        Update: {
          attended_sessions?: boolean
          commitment_agreed?: boolean
          completed_assignments?: boolean
          created_at?: string
          cv_url?: string
          email?: string
          full_name?: string
          id?: string
          linkedin_url?: string
          phone?: string
          skills_strengths?: string
          submitted_reflections?: boolean
          video_url?: string
          whatsapp_engagement?: string
          why_ambassador?: string
          willing_20hrs?: boolean
        }
        Relationships: []
      }
      ambassador_signups: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          notes: string | null
          phone: string
          referrer_id: string | null
          status: string
          updated_at: string
          why_refer: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id?: string
          notes?: string | null
          phone: string
          referrer_id?: string | null
          status?: string
          updated_at?: string
          why_refer: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          notes?: string | null
          phone?: string
          referrer_id?: string | null
          status?: string
          updated_at?: string
          why_refer?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_signups_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "referrers"
            referencedColumns: ["id"]
          },
        ]
      }
      assignment_submissions: {
        Row: {
          answers: Json
          assignment_id: string
          created_at: string
          evaluation: Json | null
          id: string
          score: number
          total: number
          user_id: string
        }
        Insert: {
          answers?: Json
          assignment_id: string
          created_at?: string
          evaluation?: Json | null
          id?: string
          score?: number
          total?: number
          user_id: string
        }
        Update: {
          answers?: Json
          assignment_id?: string
          created_at?: string
          evaluation?: Json | null
          id?: string
          score?: number
          total?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      assignments: {
        Row: {
          cohort: string
          created_at: string
          description: string | null
          id: string
          key_concepts: Json
          model_answers: Json
          questions: Json
          title: string
          week_number: number
        }
        Insert: {
          cohort?: string
          created_at?: string
          description?: string | null
          id?: string
          key_concepts?: Json
          model_answers?: Json
          questions?: Json
          title: string
          week_number: number
        }
        Update: {
          cohort?: string
          created_at?: string
          description?: string | null
          id?: string
          key_concepts?: Json
          model_answers?: Json
          questions?: Json
          title?: string
          week_number?: number
        }
        Relationships: []
      }
      certificate_payments: {
        Row: {
          amount: number
          created_at: string
          eligible: boolean
          id: string
          paid_at: string | null
          payment_reference: string | null
          payment_status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount?: number
          created_at?: string
          eligible?: boolean
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          created_at?: string
          eligible?: boolean
          id?: string
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      class_recordings: {
        Row: {
          cohort: string
          created_at: string
          description: string | null
          id: string
          session_day: string
          title: string
          video_url: string
          week_number: number
        }
        Insert: {
          cohort?: string
          created_at?: string
          description?: string | null
          id?: string
          session_day?: string
          title: string
          video_url: string
          week_number: number
        }
        Update: {
          cohort?: string
          created_at?: string
          description?: string | null
          id?: string
          session_day?: string
          title?: string
          video_url?: string
          week_number?: number
        }
        Relationships: []
      }
      cohort2_enrollments: {
        Row: {
          amount_paid: number
          certificate_requested: boolean
          class_schedule: string
          cohort: string
          commitment_accepted: boolean
          confirmed_by_admin: boolean
          created_at: string
          email: string
          full_name: string
          id: string
          must_change_password: boolean
          paid_at: string | null
          payment_reference: string | null
          payment_status: string
          referral_code: string | null
          track: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_paid?: number
          certificate_requested?: boolean
          class_schedule?: string
          cohort?: string
          commitment_accepted?: boolean
          confirmed_by_admin?: boolean
          created_at?: string
          email: string
          full_name: string
          id?: string
          must_change_password?: boolean
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string
          referral_code?: string | null
          track?: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_paid?: number
          certificate_requested?: boolean
          class_schedule?: string
          cohort?: string
          commitment_accepted?: boolean
          confirmed_by_admin?: boolean
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          must_change_password?: boolean
          paid_at?: string | null
          payment_reference?: string | null
          payment_status?: string
          referral_code?: string | null
          track?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      email_send_log: {
        Row: {
          created_at: string
          error_message: string | null
          id: string
          message_id: string | null
          metadata: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email: string
          status: string
          template_name: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          id?: string
          message_id?: string | null
          metadata?: Json | null
          recipient_email?: string
          status?: string
          template_name?: string
        }
        Relationships: []
      }
      email_send_state: {
        Row: {
          auth_email_ttl_minutes: number
          batch_size: number
          id: number
          retry_after_until: string | null
          send_delay_ms: number
          transactional_email_ttl_minutes: number
          updated_at: string
        }
        Insert: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Update: {
          auth_email_ttl_minutes?: number
          batch_size?: number
          id?: number
          retry_after_until?: string | null
          send_delay_ms?: number
          transactional_email_ttl_minutes?: number
          updated_at?: string
        }
        Relationships: []
      }
      email_unsubscribe_tokens: {
        Row: {
          created_at: string
          email: string
          id: string
          token: string
          used_at: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          token: string
          used_at?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          token?: string
          used_at?: string | null
        }
        Relationships: []
      }
      google_review_confirmations: {
        Row: {
          confirmed_at: string
          id: string
          session_day: string
          user_id: string
          week_number: number
        }
        Insert: {
          confirmed_at?: string
          id?: string
          session_day?: string
          user_id: string
          week_number: number
        }
        Update: {
          confirmed_at?: string
          id?: string
          session_day?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      idle_periods: {
        Row: {
          admin_approved: boolean | null
          approved_by: string | null
          created_at: string
          description: string | null
          ended_at: string | null
          flagged: boolean
          id: string
          idle_type: string
          reason: string
          session_id: string
          started_at: string
          user_id: string
        }
        Insert: {
          admin_approved?: boolean | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          flagged?: boolean
          id?: string
          idle_type?: string
          reason?: string
          session_id: string
          started_at?: string
          user_id: string
        }
        Update: {
          admin_approved?: boolean | null
          approved_by?: string | null
          created_at?: string
          description?: string | null
          ended_at?: string | null
          flagged?: boolean
          id?: string
          idle_type?: string
          reason?: string
          session_id?: string
          started_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "idle_periods_session_id_fkey"
            columns: ["session_id"]
            isOneToOne: false
            referencedRelation: "time_sessions"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          id: string
          student_status: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name: string
          id: string
          student_status?: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          student_status?: string
        }
        Relationships: []
      }
      referrers: {
        Row: {
          code: string
          created_at: string
          email: string | null
          full_name: string
          id: string
          is_active: boolean
          notes: string | null
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          email?: string | null
          full_name: string
          id?: string
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          is_active?: boolean
          notes?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      review_questions: {
        Row: {
          cohort: string
          created_at: string
          id: string
          is_active: boolean
          question_number: number
          question_text: string
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cohort?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question_number: number
          question_text?: string
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cohort?: string
          created_at?: string
          id?: string
          is_active?: boolean
          question_number?: number
          question_text?: string
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: []
      }
      sql_datasets: {
        Row: {
          cohort: string
          created_at: string
          description: string | null
          id: string
          name: string
          sample_queries: Json
          schema_sql: string
          seed_sql: string
        }
        Insert: {
          cohort?: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          sample_queries?: Json
          schema_sql: string
          seed_sql: string
        }
        Update: {
          cohort?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          sample_queries?: Json
          schema_sql?: string
          seed_sql?: string
        }
        Relationships: []
      }
      staff_profiles: {
        Row: {
          created_at: string
          email: string
          full_name: string
          has_onboarded: boolean
          id: string
          must_change_password: boolean
          salary: number
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          full_name?: string
          has_onboarded?: boolean
          id?: string
          must_change_password?: boolean
          salary?: number
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          full_name?: string
          has_onboarded?: boolean
          id?: string
          must_change_password?: boolean
          salary?: number
          user_id?: string
        }
        Relationships: []
      }
      student_attendance: {
        Row: {
          created_at: string
          id: string
          marked_by: string | null
          session_day: string
          status: string
          updated_at: string
          user_id: string
          week_number: number
        }
        Insert: {
          created_at?: string
          id?: string
          marked_by?: string | null
          session_day?: string
          status?: string
          updated_at?: string
          user_id: string
          week_number: number
        }
        Update: {
          created_at?: string
          id?: string
          marked_by?: string | null
          session_day?: string
          status?: string
          updated_at?: string
          user_id?: string
          week_number?: number
        }
        Relationships: []
      }
      student_video_submissions: {
        Row: {
          consent_given: boolean
          created_at: string
          description: string | null
          id: string
          session_date: string
          storage_path: string
          student_name: string
          title: string | null
          user_id: string
          video_url: string
          week_number: number
        }
        Insert: {
          consent_given?: boolean
          created_at?: string
          description?: string | null
          id?: string
          session_date: string
          storage_path: string
          student_name: string
          title?: string | null
          user_id: string
          video_url: string
          week_number: number
        }
        Update: {
          consent_given?: boolean
          created_at?: string
          description?: string | null
          id?: string
          session_date?: string
          storage_path?: string
          student_name?: string
          title?: string | null
          user_id?: string
          video_url?: string
          week_number?: number
        }
        Relationships: []
      }
      suppressed_emails: {
        Row: {
          created_at: string
          email: string
          id: string
          metadata: Json | null
          reason: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          reason: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          reason?: string
        }
        Relationships: []
      }
      time_sessions: {
        Row: {
          created_at: string
          ended_at: string | null
          id: string
          started_at: string
          status: string
          user_id: string
        }
        Insert: {
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          user_id: string
        }
        Update: {
          created_at?: string
          ended_at?: string | null
          id?: string
          started_at?: string
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      training_commitments: {
        Row: {
          agree_weekly_assignments: boolean
          ambassador_interest: string
          available_fridays: boolean
          commitment_agreed: boolean
          country: string
          created_at: string
          current_status: string
          email: string
          engage_posts: boolean
          full_name: string
          id: string
          submit_reflections: boolean
          user_id: string | null
        }
        Insert: {
          agree_weekly_assignments?: boolean
          ambassador_interest: string
          available_fridays?: boolean
          commitment_agreed?: boolean
          country: string
          created_at?: string
          current_status: string
          email: string
          engage_posts?: boolean
          full_name: string
          id?: string
          submit_reflections?: boolean
          user_id?: string | null
        }
        Update: {
          agree_weekly_assignments?: boolean
          ambassador_interest?: string
          available_fridays?: boolean
          commitment_agreed?: boolean
          country?: string
          created_at?: string
          current_status?: string
          email?: string
          engage_posts?: boolean
          full_name?: string
          id?: string
          submit_reflections?: boolean
          user_id?: string | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      video_access_logs: {
        Row: {
          accessed_by: string
          action_type: string
          created_at: string
          id: string
          video_id: string
        }
        Insert: {
          accessed_by: string
          action_type?: string
          created_at?: string
          id?: string
          video_id: string
        }
        Update: {
          accessed_by?: string
          action_type?: string
          created_at?: string
          id?: string
          video_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "video_access_logs_video_id_fkey"
            columns: ["video_id"]
            isOneToOne: false
            referencedRelation: "student_video_submissions"
            referencedColumns: ["id"]
          },
        ]
      }
      webinar_registrations: {
        Row: {
          created_at: string
          email: string
          id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
        }
        Relationships: []
      }
      weekly_reviews: {
        Row: {
          approved_by: string | null
          class_date: string | null
          class_name: string | null
          comments: string
          created_at: string
          email: string
          full_name: string
          id: string
          is_approved: boolean
          question_answers: Json | null
          session_day: string
          topic_covered: string | null
          tutor_name: string | null
          tutor_rating: string | null
          user_id: string | null
          video_url: string | null
          week_number: number
          written_reflection: string | null
        }
        Insert: {
          approved_by?: string | null
          class_date?: string | null
          class_name?: string | null
          comments?: string
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_approved?: boolean
          question_answers?: Json | null
          session_day?: string
          topic_covered?: string | null
          tutor_name?: string | null
          tutor_rating?: string | null
          user_id?: string | null
          video_url?: string | null
          week_number: number
          written_reflection?: string | null
        }
        Update: {
          approved_by?: string | null
          class_date?: string | null
          class_name?: string | null
          comments?: string
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_approved?: boolean
          question_answers?: Json | null
          session_day?: string
          topic_covered?: string | null
          tutor_name?: string | null
          tutor_rating?: string | null
          user_id?: string | null
          video_url?: string | null
          week_number?: number
          written_reflection?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_referrer_tracking: { Args: { _code: string }; Returns: Json }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_primary_admin: { Args: { _user_id: string }; Returns: boolean }
      move_to_dlq: {
        Args: {
          dlq_name: string
          message_id: number
          payload: Json
          source_queue: string
        }
        Returns: number
      }
      read_email_batch: {
        Args: { batch_size: number; queue_name: string; vt: number }
        Returns: {
          message: Json
          msg_id: number
          read_ct: number
        }[]
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
