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
      challenge_invite_acceptances: {
        Row: {
          accepted_at: string
          id: string
          invite_id: string
          invitee_id: string
        }
        Insert: {
          accepted_at?: string
          id?: string
          invite_id: string
          invitee_id: string
        }
        Update: {
          accepted_at?: string
          id?: string
          invite_id?: string
          invitee_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_invite_acceptances_invite_id_fkey"
            columns: ["invite_id"]
            isOneToOne: false
            referencedRelation: "challenge_invites"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_invites: {
        Row: {
          challenge_id: string
          created_at: string
          id: string
          inviter_id: string
          token: string
        }
        Insert: {
          challenge_id: string
          created_at?: string
          id?: string
          inviter_id: string
          token: string
        }
        Update: {
          challenge_id?: string
          created_at?: string
          id?: string
          inviter_id?: string
          token?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_invites_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_participants: {
        Row: {
          challenge_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          challenge_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          challenge_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_participants_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_step_completions: {
        Row: {
          challenge_id: string
          completed_at: string
          id: string
          step_id: string
          user_id: string
          value: number | null
        }
        Insert: {
          challenge_id: string
          completed_at?: string
          id?: string
          step_id: string
          user_id: string
          value?: number | null
        }
        Update: {
          challenge_id?: string
          completed_at?: string
          id?: string
          step_id?: string
          user_id?: string
          value?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_step_completions_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_step_completions_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "challenge_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_steps: {
        Row: {
          challenge_id: string
          created_at: string
          description: string | null
          id: string
          ordinal: number
          target_value: number | null
          title: string
          unit: string | null
        }
        Insert: {
          challenge_id: string
          created_at?: string
          description?: string | null
          id?: string
          ordinal: number
          target_value?: number | null
          title: string
          unit?: string | null
        }
        Update: {
          challenge_id?: string
          created_at?: string
          description?: string | null
          id?: string
          ordinal?: number
          target_value?: number | null
          title?: string
          unit?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "challenge_steps_challenge_id_fkey"
            columns: ["challenge_id"]
            isOneToOne: false
            referencedRelation: "challenges"
            referencedColumns: ["id"]
          },
        ]
      }
      challenges: {
        Row: {
          accent_color: string
          created_at: string
          description: string | null
          ends_on: string
          id: string
          published: boolean
          slug: string
          starts_on: string
          tagline: string | null
          target_label: string | null
          target_value: number | null
          theme: string
          title: string
          unit: string | null
          updated_at: string
        }
        Insert: {
          accent_color?: string
          created_at?: string
          description?: string | null
          ends_on: string
          id?: string
          published?: boolean
          slug: string
          starts_on: string
          tagline?: string | null
          target_label?: string | null
          target_value?: number | null
          theme?: string
          title: string
          unit?: string | null
          updated_at?: string
        }
        Update: {
          accent_color?: string
          created_at?: string
          description?: string | null
          ends_on?: string
          id?: string
          published?: boolean
          slug?: string
          starts_on?: string
          tagline?: string | null
          target_label?: string | null
          target_value?: number | null
          theme?: string
          title?: string
          unit?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      cta_clicks: {
        Row: {
          created_at: string
          cta: string
          href: string | null
          id: string
          path: string | null
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          created_at?: string
          cta: string
          href?: string | null
          id?: string
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          created_at?: string
          cta?: string
          href?: string | null
          id?: string
          path?: string | null
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
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
      event_checkins: {
        Row: {
          checked_in_at: string
          checked_in_by: string
          event_id: string
          id: string
          user_id: string | null
          walkup_name: string | null
        }
        Insert: {
          checked_in_at?: string
          checked_in_by: string
          event_id: string
          id?: string
          user_id?: string | null
          walkup_name?: string | null
        }
        Update: {
          checked_in_at?: string
          checked_in_by?: string
          event_id?: string
          id?: string
          user_id?: string | null
          walkup_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "event_checkins_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          capacity: number | null
          created_at: string
          description: string | null
          distance_mi: number | null
          event_date: string
          host_name: string | null
          host_user_id: string | null
          id: string
          location_address: string | null
          location_name: string
          pace_label: string | null
          published: boolean
          slug: string
          start_time: string
          title: string
          updated_at: string
        }
        Insert: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          distance_mi?: number | null
          event_date: string
          host_name?: string | null
          host_user_id?: string | null
          id?: string
          location_address?: string | null
          location_name: string
          pace_label?: string | null
          published?: boolean
          slug: string
          start_time: string
          title: string
          updated_at?: string
        }
        Update: {
          capacity?: number | null
          created_at?: string
          description?: string | null
          distance_mi?: number | null
          event_date?: string
          host_name?: string | null
          host_user_id?: string | null
          id?: string
          location_address?: string | null
          location_name?: string
          pace_label?: string | null
          published?: boolean
          slug?: string
          start_time?: string
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      member_props: {
        Row: {
          created_at: string
          id: string
          kind: Database["public"]["Enums"]["prop_kind"]
          recipient_id: string
          sender_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          kind: Database["public"]["Enums"]["prop_kind"]
          recipient_id: string
          sender_id: string
        }
        Update: {
          created_at?: string
          id?: string
          kind?: Database["public"]["Enums"]["prop_kind"]
          recipient_id?: string
          sender_id?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          athlete_alignment: string | null
          avatar_url: string | null
          best_10k_seconds: number | null
          best_5k_seconds: number | null
          best_half_seconds: number | null
          best_marathon_seconds: number | null
          city: string | null
          created_at: string
          display_name: string | null
          email_reminders_enabled: boolean
          first_name: string | null
          goals: string[]
          id: string
          is_public: boolean
          last_name: string | null
          neighborhood: string | null
          onboarded_at: string | null
          pace_max_per_mi: number | null
          pace_min_per_mi: number | null
          preferred_times: string[]
          updated_at: string
        }
        Insert: {
          athlete_alignment?: string | null
          avatar_url?: string | null
          best_10k_seconds?: number | null
          best_5k_seconds?: number | null
          best_half_seconds?: number | null
          best_marathon_seconds?: number | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          email_reminders_enabled?: boolean
          first_name?: string | null
          goals?: string[]
          id: string
          is_public?: boolean
          last_name?: string | null
          neighborhood?: string | null
          onboarded_at?: string | null
          pace_max_per_mi?: number | null
          pace_min_per_mi?: number | null
          preferred_times?: string[]
          updated_at?: string
        }
        Update: {
          athlete_alignment?: string | null
          avatar_url?: string | null
          best_10k_seconds?: number | null
          best_5k_seconds?: number | null
          best_half_seconds?: number | null
          best_marathon_seconds?: number | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          email_reminders_enabled?: boolean
          first_name?: string | null
          goals?: string[]
          id?: string
          is_public?: boolean
          last_name?: string | null
          neighborhood?: string | null
          onboarded_at?: string | null
          pace_max_per_mi?: number | null
          pace_min_per_mi?: number | null
          preferred_times?: string[]
          updated_at?: string
        }
        Relationships: []
      }
      rsvps: {
        Row: {
          created_at: string
          email: string
          id: string
          name: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          name: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      run_recaps: {
        Row: {
          attendee_count: number
          created_at: string
          distance_mi: number | null
          event_id: string
          hero_caption: string | null
          published: boolean
          updated_at: string
          vibe_word: string | null
        }
        Insert: {
          attendee_count?: number
          created_at?: string
          distance_mi?: number | null
          event_id: string
          hero_caption?: string | null
          published?: boolean
          updated_at?: string
          vibe_word?: string | null
        }
        Update: {
          attendee_count?: number
          created_at?: string
          distance_mi?: number | null
          event_id?: string
          hero_caption?: string | null
          published?: boolean
          updated_at?: string
          vibe_word?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "run_recaps_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: true
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
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
      welcome_signups: {
        Row: {
          created_at: string
          email: string
          event_id: string | null
          id: string
          inviter_freeform: string | null
          inviter_user_id: string | null
          name: string
          source: string
        }
        Insert: {
          created_at?: string
          email: string
          event_id?: string | null
          id?: string
          inviter_freeform?: string | null
          inviter_user_id?: string | null
          name: string
          source?: string
        }
        Update: {
          created_at?: string
          email?: string
          event_id?: string | null
          id?: string
          inviter_freeform?: string | null
          inviter_user_id?: string | null
          name?: string
          source?: string
        }
        Relationships: [
          {
            foreignKeyName: "welcome_signups_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "welcome_signups_inviter_user_id_fkey"
            columns: ["inviter_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      accept_invite: {
        Args: { _token: string; _user_id: string }
        Returns: {
          challenge_slug: string
        }[]
      }
      delete_email: {
        Args: { message_id: number; queue_name: string }
        Returns: boolean
      }
      emails_opted_out_of_reminders: {
        Args: { _emails: string[] }
        Returns: {
          email: string
        }[]
      }
      enqueue_email: {
        Args: { payload: Json; queue_name: string }
        Returns: number
      }
      get_invite_preview: {
        Args: { _token: string }
        Returns: {
          challenge_accent: string
          challenge_id: string
          challenge_slug: string
          challenge_tagline: string
          challenge_theme: string
          challenge_title: string
          invite_id: string
          inviter_avatar_url: string
          inviter_display_name: string
          participant_count: number
          step_count: number
        }[]
      }
      get_recent_activity: {
        Args: { _limit?: number }
        Returns: {
          accent_color: string
          athlete_alignment: string
          avatar_url: string
          display_name: string
          first_name: string
          kind: string
          occurred_at: string
          slug: string
          title: string
          user_id: string
        }[]
      }
      has_event_host: {
        Args: { _event_id: string; _user_id: string }
        Returns: boolean
      }
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
      prop_kind: "clap" | "fire" | "muscle"
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
      prop_kind: ["clap", "fire", "muscle"],
    },
  },
} as const
