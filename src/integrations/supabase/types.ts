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
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      email_subscribers: {
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
      evidence_captures: {
        Row: {
          error: string | null
          id: string
          internal_note: string | null
          processed_at: string | null
          record_id: string
          record_type: string
          requested_at: string
          snapshot_id: string | null
          snapshot_ok: boolean | null
          status: string
          url: string
          wayback_ok: boolean | null
          wayback_url: string | null
        }
        Insert: {
          error?: string | null
          id?: string
          internal_note?: string | null
          processed_at?: string | null
          record_id: string
          record_type: string
          requested_at?: string
          snapshot_id?: string | null
          snapshot_ok?: boolean | null
          status?: string
          url: string
          wayback_ok?: boolean | null
          wayback_url?: string | null
        }
        Update: {
          error?: string | null
          id?: string
          internal_note?: string | null
          processed_at?: string | null
          record_id?: string
          record_type?: string
          requested_at?: string
          snapshot_id?: string | null
          snapshot_ok?: boolean | null
          status?: string
          url?: string
          wayback_ok?: boolean | null
          wayback_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "evidence_captures_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "source_snapshots"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_changes: {
        Row: {
          announcement_date: string | null
          category: string
          change_amount: number | null
          change_details: Json | null
          created_at: string
          effective_date: string | null
          effective_date_precision: string
          effective_period: string | null
          evidence_details: Json | null
          fee_type: string
          id: string
          impact_level: string | null
          marketplace: string
          new_value: number | null
          old_value: number | null
          record_id: string | null
          region: string | null
          source_title: string
          source_url: string
          summary: string | null
          title: string
          value_type: string
        }
        Insert: {
          announcement_date?: string | null
          category: string
          change_amount?: number | null
          change_details?: Json | null
          created_at?: string
          effective_date?: string | null
          effective_date_precision?: string
          effective_period?: string | null
          evidence_details?: Json | null
          fee_type: string
          id?: string
          impact_level?: string | null
          marketplace: string
          new_value?: number | null
          old_value?: number | null
          record_id?: string | null
          region?: string | null
          source_title: string
          source_url: string
          summary?: string | null
          title: string
          value_type: string
        }
        Update: {
          announcement_date?: string | null
          category?: string
          change_amount?: number | null
          change_details?: Json | null
          created_at?: string
          effective_date?: string | null
          effective_date_precision?: string
          effective_period?: string | null
          evidence_details?: Json | null
          fee_type?: string
          id?: string
          impact_level?: string | null
          marketplace?: string
          new_value?: number | null
          old_value?: number | null
          record_id?: string | null
          region?: string | null
          source_title?: string
          source_url?: string
          summary?: string | null
          title?: string
          value_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_changes_record_id_fkey"
            columns: ["record_id"]
            isOneToOne: false
            referencedRelation: "fee_records"
            referencedColumns: ["id"]
          },
        ]
      }
      fee_record_edit_history: {
        Row: {
          changed_at: string
          field_changed: string
          id: string
          new_value: Json | null
          old_value: Json | null
          record_id: string
          source_url: string | null
        }
        Insert: {
          changed_at?: string
          field_changed: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          record_id: string
          source_url?: string | null
        }
        Update: {
          changed_at?: string
          field_changed?: string
          id?: string
          new_value?: Json | null
          old_value?: Json | null
          record_id?: string
          source_url?: string | null
        }
        Relationships: []
      }
      fee_records: {
        Row: {
          category: string
          created_at: string
          effective_date: string | null
          fee_name: string
          fee_type: string
          first_effective_date: string | null
          first_effective_event_id: string | null
          id: string
          last_verified: string
          marketplace: string
          notes: string | null
          pricing_details: Json | null
          public_corroborating_source_url: string | null
          region: string | null
          source_title: string
          source_url: string
          updated_at: string | null
          value: number
          value_type: string
          verification_status: string
        }
        Insert: {
          category: string
          created_at?: string
          effective_date?: string | null
          fee_name: string
          fee_type: string
          first_effective_date?: string | null
          first_effective_event_id?: string | null
          id?: string
          last_verified: string
          marketplace: string
          notes?: string | null
          pricing_details?: Json | null
          public_corroborating_source_url?: string | null
          region?: string | null
          source_title: string
          source_url: string
          updated_at?: string | null
          value: number
          value_type: string
          verification_status?: string
        }
        Update: {
          category?: string
          created_at?: string
          effective_date?: string | null
          fee_name?: string
          fee_type?: string
          first_effective_date?: string | null
          first_effective_event_id?: string | null
          id?: string
          last_verified?: string
          marketplace?: string
          notes?: string | null
          pricing_details?: Json | null
          public_corroborating_source_url?: string | null
          region?: string | null
          source_title?: string
          source_url?: string
          updated_at?: string | null
          value?: number
          value_type?: string
          verification_status?: string
        }
        Relationships: [
          {
            foreignKeyName: "fee_records_first_effective_event_id_fkey"
            columns: ["first_effective_event_id"]
            isOneToOne: false
            referencedRelation: "fee_changes"
            referencedColumns: ["id"]
          },
        ]
      }
      feedback_submissions: {
        Row: {
          answer: string | null
          created_at: string
          follow_up: string | null
          follow_up_email: string | null
          follow_up_opt_in: boolean
          free_text_feedback: string | null
          id: string
          information_access_response: string | null
          marketplaces: string[]
          record_id: string | null
          record_type: string | null
          resource_path: string
          resource_type: string
          use_cases: string[]
          usefulness_response: string
          user_type: string | null
        }
        Insert: {
          answer?: string | null
          created_at?: string
          follow_up?: string | null
          follow_up_email?: string | null
          follow_up_opt_in?: boolean
          free_text_feedback?: string | null
          id?: string
          information_access_response?: string | null
          marketplaces?: string[]
          record_id?: string | null
          record_type?: string | null
          resource_path: string
          resource_type: string
          use_cases?: string[]
          usefulness_response: string
          user_type?: string | null
        }
        Update: {
          answer?: string | null
          created_at?: string
          follow_up?: string | null
          follow_up_email?: string | null
          follow_up_opt_in?: boolean
          free_text_feedback?: string | null
          id?: string
          information_access_response?: string | null
          marketplaces?: string[]
          record_id?: string | null
          record_type?: string | null
          resource_path?: string
          resource_type?: string
          use_cases?: string[]
          usefulness_response?: string
          user_type?: string | null
        }
        Relationships: []
      }
      impact_level_change_log: {
        Row: {
          collection: string
          id: string
          logged_at: string
          new_value: string | null
          old_value: string | null
          reason: string
          record_id: string
        }
        Insert: {
          collection: string
          id?: string
          logged_at?: string
          new_value?: string | null
          old_value?: string | null
          reason: string
          record_id: string
        }
        Update: {
          collection?: string
          id?: string
          logged_at?: string
          new_value?: string | null
          old_value?: string | null
          reason?: string
          record_id?: string
        }
        Relationships: []
      }
      impact_reports: {
        Row: {
          affected_categories: string[]
          body_markdown: string
          created_at: string
          estimated_seller_impact: string
          id: string
          marketplace: string
          methodology: string
          publish_date: string
          sample_size: number | null
          slug: string
          summary: string
          title: string
        }
        Insert: {
          affected_categories?: string[]
          body_markdown: string
          created_at?: string
          estimated_seller_impact: string
          id?: string
          marketplace: string
          methodology: string
          publish_date: string
          sample_size?: number | null
          slug: string
          summary: string
          title: string
        }
        Update: {
          affected_categories?: string[]
          body_markdown?: string
          created_at?: string
          estimated_seller_impact?: string
          id?: string
          marketplace?: string
          methodology?: string
          publish_date?: string
          sample_size?: number | null
          slug?: string
          summary?: string
          title?: string
        }
        Relationships: []
      }
      monitored_sources: {
        Row: {
          active: boolean
          archive_url: string | null
          consecutive_failures: number
          created_at: string
          frequency: string
          id: string
          label: string
          last_checked_at: string | null
          last_hash: string | null
          last_manual_check: string | null
          manual_reason: string | null
          marketplace: string
          source_type: string
          url: string
        }
        Insert: {
          active?: boolean
          archive_url?: string | null
          consecutive_failures?: number
          created_at?: string
          frequency: string
          id?: string
          label: string
          last_checked_at?: string | null
          last_hash?: string | null
          last_manual_check?: string | null
          manual_reason?: string | null
          marketplace: string
          source_type: string
          url: string
        }
        Update: {
          active?: boolean
          archive_url?: string | null
          consecutive_failures?: number
          created_at?: string
          frequency?: string
          id?: string
          label?: string
          last_checked_at?: string | null
          last_hash?: string | null
          last_manual_check?: string | null
          manual_reason?: string | null
          marketplace?: string
          source_type?: string
          url?: string
        }
        Relationships: []
      }
      newsletter_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string
        }
        Relationships: []
      }
      policy_changes: {
        Row: {
          affected_sellers: string | null
          announcement_date: string | null
          body_markdown: string | null
          created_at: string
          effective_date: string | null
          effective_date_precision: string
          effective_period: string | null
          evidence_details: Json | null
          id: string
          impact_level: string | null
          last_verified: string
          marketplace: string
          policy_area: string
          region: string | null
          source_title: string
          source_url: string
          summary: string
          title: string
          updated_at: string
        }
        Insert: {
          affected_sellers?: string | null
          announcement_date?: string | null
          body_markdown?: string | null
          created_at?: string
          effective_date?: string | null
          effective_date_precision?: string
          effective_period?: string | null
          evidence_details?: Json | null
          id?: string
          impact_level?: string | null
          last_verified: string
          marketplace: string
          policy_area: string
          region?: string | null
          source_title: string
          source_url: string
          summary: string
          title: string
          updated_at?: string
        }
        Update: {
          affected_sellers?: string | null
          announcement_date?: string | null
          body_markdown?: string | null
          created_at?: string
          effective_date?: string | null
          effective_date_precision?: string
          effective_period?: string | null
          evidence_details?: Json | null
          id?: string
          impact_level?: string | null
          last_verified?: string
          marketplace?: string
          policy_area?: string
          region?: string | null
          source_title?: string
          source_url?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      source_alert_reviews: {
        Row: {
          alert_id: string
          id: string
          outcome: string
          record_id: string | null
          record_type: string | null
          reviewed_at: string
          reviewer_email: string | null
          reviewer_id: string
        }
        Insert: {
          alert_id: string
          id?: string
          outcome: string
          record_id?: string | null
          record_type?: string | null
          reviewed_at?: string
          reviewer_email?: string | null
          reviewer_id: string
        }
        Update: {
          alert_id?: string
          id?: string
          outcome?: string
          record_id?: string | null
          record_type?: string | null
          reviewed_at?: string
          reviewer_email?: string | null
          reviewer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_alert_reviews_alert_id_fkey"
            columns: ["alert_id"]
            isOneToOne: false
            referencedRelation: "source_alerts"
            referencedColumns: ["id"]
          },
        ]
      }
      source_alerts: {
        Row: {
          created_at: string
          diff: string | null
          email_status: string
          id: string
          kind: string
          previous_snapshot_id: string | null
          snapshot_id: string | null
          source_id: string
          status: string
        }
        Insert: {
          created_at?: string
          diff?: string | null
          email_status?: string
          id?: string
          kind: string
          previous_snapshot_id?: string | null
          snapshot_id?: string | null
          source_id: string
          status?: string
        }
        Update: {
          created_at?: string
          diff?: string | null
          email_status?: string
          id?: string
          kind?: string
          previous_snapshot_id?: string | null
          snapshot_id?: string | null
          source_id?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_alerts_previous_snapshot_id_fkey"
            columns: ["previous_snapshot_id"]
            isOneToOne: false
            referencedRelation: "source_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_alerts_snapshot_id_fkey"
            columns: ["snapshot_id"]
            isOneToOne: false
            referencedRelation: "source_snapshots"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "source_alerts_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "monitored_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      source_snapshots: {
        Row: {
          content_hash: string | null
          content_text: string | null
          error: string | null
          fetched_at: string
          http_status: number | null
          id: string
          source_id: string | null
          trigger_kind: string
          url: string
        }
        Insert: {
          content_hash?: string | null
          content_text?: string | null
          error?: string | null
          fetched_at?: string
          http_status?: number | null
          id?: string
          source_id?: string | null
          trigger_kind: string
          url: string
        }
        Update: {
          content_hash?: string | null
          content_text?: string | null
          error?: string | null
          fetched_at?: string
          http_status?: number | null
          id?: string
          source_id?: string | null
          trigger_kind?: string
          url?: string
        }
        Relationships: [
          {
            foreignKeyName: "source_snapshots_source_id_fkey"
            columns: ["source_id"]
            isOneToOne: false
            referencedRelation: "monitored_sources"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_feedback_follow_up: {
        Args: { _follow_up: string; _id: string }
        Returns: boolean
      }
      is_valid_email: { Args: { email: string }; Returns: boolean }
      public_archive_links: {
        Args: never
        Returns: {
          archive_url: string
          url: string
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
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
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
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
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
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
