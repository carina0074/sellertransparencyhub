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
      fee_changes: {
        Row: {
          announcement_date: string | null
          category: string
          change_amount: number
          created_at: string
          effective_date: string
          fee_type: string
          id: string
          impact_level: string
          marketplace: string
          new_value: number
          old_value: number
          record_id: string | null
          source_title: string
          source_url: string
          summary: string | null
          title: string
          value_type: string
        }
        Insert: {
          announcement_date?: string | null
          category: string
          change_amount: number
          created_at?: string
          effective_date: string
          fee_type: string
          id?: string
          impact_level: string
          marketplace: string
          new_value: number
          old_value: number
          record_id?: string | null
          source_title: string
          source_url: string
          summary?: string | null
          title: string
          value_type: string
        }
        Update: {
          announcement_date?: string | null
          category?: string
          change_amount?: number
          created_at?: string
          effective_date?: string
          fee_type?: string
          id?: string
          impact_level?: string
          marketplace?: string
          new_value?: number
          old_value?: number
          record_id?: string | null
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
      fee_records: {
        Row: {
          category: string
          created_at: string
          effective_date: string
          fee_name: string
          fee_type: string
          id: string
          last_verified: string
          marketplace: string
          notes: string | null
          source_title: string
          source_url: string
          value: number
          value_type: string
        }
        Insert: {
          category: string
          created_at?: string
          effective_date: string
          fee_name: string
          fee_type: string
          id?: string
          last_verified: string
          marketplace: string
          notes?: string | null
          source_title: string
          source_url: string
          value: number
          value_type: string
        }
        Update: {
          category?: string
          created_at?: string
          effective_date?: string
          fee_name?: string
          fee_type?: string
          id?: string
          last_verified?: string
          marketplace?: string
          notes?: string | null
          source_title?: string
          source_url?: string
          value?: number
          value_type?: string
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
      policy_changes: {
        Row: {
          affected_sellers: string | null
          announcement_date: string | null
          body_markdown: string | null
          created_at: string
          effective_date: string
          id: string
          impact_level: string
          last_verified: string
          marketplace: string
          policy_area: string
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
          effective_date: string
          id?: string
          impact_level: string
          last_verified: string
          marketplace: string
          policy_area: string
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
          effective_date?: string
          id?: string
          impact_level?: string
          last_verified?: string
          marketplace?: string
          policy_area?: string
          source_title?: string
          source_url?: string
          summary?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
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
