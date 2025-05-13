export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      currency_rates: {
        Row: {
          auto_rate: number | null
          base_currency: Database["public"]["Enums"]["currency_code"]
          id: string
          last_updated: string | null
          manual_rate: number | null
          quote_currency: Database["public"]["Enums"]["currency_code"]
          source: string | null
          source_timestamp: string | null
          updated_by: string | null
          use_manual_rate: boolean | null
        }
        Insert: {
          auto_rate?: number | null
          base_currency: Database["public"]["Enums"]["currency_code"]
          id?: string
          last_updated?: string | null
          manual_rate?: number | null
          quote_currency: Database["public"]["Enums"]["currency_code"]
          source?: string | null
          source_timestamp?: string | null
          updated_by?: string | null
          use_manual_rate?: boolean | null
        }
        Update: {
          auto_rate?: number | null
          base_currency?: Database["public"]["Enums"]["currency_code"]
          id?: string
          last_updated?: string | null
          manual_rate?: number | null
          quote_currency?: Database["public"]["Enums"]["currency_code"]
          source?: string | null
          source_timestamp?: string | null
          updated_by?: string | null
          use_manual_rate?: boolean | null
        }
        Relationships: []
      }
      deals: {
        Row: {
          buyer_id: string
          created_at: string
          deal_metadata: Json | null
          id: string
          order_id: string
          seller_id: string
          status: string
          telegram_chat_id: string | null
          updated_at: string
        }
        Insert: {
          buyer_id: string
          created_at?: string
          deal_metadata?: Json | null
          id?: string
          order_id: string
          seller_id: string
          status?: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Update: {
          buyer_id?: string
          created_at?: string
          deal_metadata?: Json | null
          id?: string
          order_id?: string
          seller_id?: string
          status?: string
          telegram_chat_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "deals_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      exchange_rates: {
        Row: {
          cbr: number | null
          id: number
          investing: number | null
          profinance: number | null
          timestamp: string
          updated_at: string
          xe: number | null
        }
        Insert: {
          cbr?: number | null
          id?: number
          investing?: number | null
          profinance?: number | null
          timestamp?: string
          updated_at?: string
          xe?: number | null
        }
        Update: {
          cbr?: number | null
          id?: number
          investing?: number | null
          profinance?: number | null
          timestamp?: string
          updated_at?: string
          xe?: number | null
        }
        Relationships: []
      }
      messages: {
        Row: {
          content: string
          created_at: string
          deal_id: string
          id: string
          is_read: boolean
          sender_id: string
        }
        Insert: {
          content: string
          created_at?: string
          deal_id: string
          id?: string
          is_read?: boolean
          sender_id: string
        }
        Update: {
          content?: string
          created_at?: string
          deal_id?: string
          id?: string
          is_read?: boolean
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_deal_id_fkey"
            columns: ["deal_id"]
            isOneToOne: false
            referencedRelation: "deals"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          amount: number
          amount_currency: string | null
          created_at: string
          expires_at: string
          geography: Json | null
          id: string
          notes: string | null
          purpose: string | null
          rate: string
          rate_details: Json | null
          status: string | null
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          amount_currency?: string | null
          created_at?: string
          expires_at: string
          geography?: Json | null
          id?: string
          notes?: string | null
          purpose?: string | null
          rate: string
          rate_details?: Json | null
          status?: string | null
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          amount_currency?: string | null
          created_at?: string
          expires_at?: string
          geography?: Json | null
          id?: string
          notes?: string | null
          purpose?: string | null
          rate?: string
          rate_details?: Json | null
          status?: string | null
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          created_at: string
          id: string
          key: string
          updated_at: string
          value: Json
        }
        Insert: {
          created_at?: string
          id?: string
          key: string
          updated_at?: string
          value: Json
        }
        Update: {
          created_at?: string
          id?: string
          key?: string
          updated_at?: string
          value?: Json
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string
          full_name: string | null
          id: string
          telegram_id: string | null
          two_factor_enabled: boolean | null
          two_factor_secret: string | null
          updated_at: string
        }
        Insert: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id: string
          telegram_id?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
          updated_at?: string
        }
        Update: {
          company?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          telegram_id?: string | null
          two_factor_enabled?: boolean | null
          two_factor_secret?: string | null
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
          role?: Database["public"]["Enums"]["app_role"]
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
      archive_expired_orders_now: {
        Args: Record<PropertyKey, never>
        Returns: {
          archived_id: string
        }[]
      }
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
      }
      setup_archive_cron_job: {
        Args: { function_url: string; anon_key: string }
        Returns: undefined
      }
      setup_archiving_extensions: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_cbr_rates: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      app_role: "user" | "manager" | "admin"
      currency_code:
        | "USD"
        | "EUR"
        | "RUB"
        | "GBP"
        | "CNY"
        | "JPY"
        | "CHF"
        | "CAD"
        | "AUD"
        | "HKD"
        | "SGD"
        | "AED"
        | "TRY"
        | "INR"
        | "BTC"
        | "ETH"
        | "USDT"
        | "USDC"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: ["user", "manager", "admin"],
      currency_code: [
        "USD",
        "EUR",
        "RUB",
        "GBP",
        "CNY",
        "JPY",
        "CHF",
        "CAD",
        "AUD",
        "HKD",
        "SGD",
        "AED",
        "TRY",
        "INR",
        "BTC",
        "ETH",
        "USDT",
        "USDC",
      ],
    },
  },
} as const
