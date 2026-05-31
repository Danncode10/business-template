export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      analytics_events: {
        Row: {
          app_id: string
          created_at: string
          event_type: string
          id: string
          ip_hash: string | null
          organization_id: string
          page_path: string | null
          properties: Json
          referrer: string | null
          session_id: string | null
          user_agent: string | null
        }
        Insert: {
          app_id?: string
          created_at?: string
          event_type: string
          id?: string
          ip_hash?: string | null
          organization_id: string
          page_path?: string | null
          properties?: Json
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Update: {
          app_id?: string
          created_at?: string
          event_type?: string
          id?: string
          ip_hash?: string | null
          organization_id?: string
          page_path?: string | null
          properties?: Json
          referrer?: string | null
          session_id?: string | null
          user_agent?: string | null
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_email: string | null
          actor_id: string | null
          app_id: string
          created_at: string
          diff: Json | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          organization_id: string
          resource_id: string | null
          resource_type: string
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_email?: string | null
          actor_id?: string | null
          app_id?: string
          created_at?: string
          diff?: Json | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          organization_id: string
          resource_id?: string | null
          resource_type: string
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_email?: string | null
          actor_id?: string | null
          app_id?: string
          created_at?: string
          diff?: Json | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          organization_id?: string
          resource_id?: string | null
          resource_type?: string
          user_agent?: string | null
        }
        Relationships: []
      }
      bookings: {
        Row: {
          app_id: string
          confirmed_date: string | null
          confirmed_time: string | null
          created_at: string
          customer_email: string
          customer_name: string
          customer_phone: string | null
          id: string
          lead_id: string | null
          notes: string | null
          organization_id: string
          package: string | null
          payment_status: string
          preferred_date: string | null
          preferred_time: string | null
          price_paid: number | null
          price_quoted: number | null
          service_id: string | null
          service_name: string
          source: string
          status: string
          updated_at: string
          vehicle_make: string | null
          vehicle_model: string | null
          vehicle_type: string | null
          vehicle_year: string | null
        }
        Insert: {
          app_id?: string
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string
          customer_email: string
          customer_name: string
          customer_phone?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          organization_id: string
          package?: string | null
          payment_status?: string
          preferred_date?: string | null
          preferred_time?: string | null
          price_paid?: number | null
          price_quoted?: number | null
          service_id?: string | null
          service_name: string
          source?: string
          status?: string
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
          vehicle_year?: string | null
        }
        Update: {
          app_id?: string
          confirmed_date?: string | null
          confirmed_time?: string | null
          created_at?: string
          customer_email?: string
          customer_name?: string
          customer_phone?: string | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          organization_id?: string
          package?: string | null
          payment_status?: string
          preferred_date?: string | null
          preferred_time?: string | null
          price_paid?: number | null
          price_quoted?: number | null
          service_id?: string | null
          service_name?: string
          source?: string
          status?: string
          updated_at?: string
          vehicle_make?: string | null
          vehicle_model?: string | null
          vehicle_type?: string | null
          vehicle_year?: string | null
        }
        Relationships: []
      }
      gallery_items: {
        Row: {
          app_id: string
          before_image_url: string | null
          caption: string | null
          created_at: string
          display_order: number
          id: string
          image_url: string
          is_published: boolean
          organization_id: string
          service_tag: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          app_id?: string
          before_image_url?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url: string
          is_published?: boolean
          organization_id: string
          service_tag?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          app_id?: string
          before_image_url?: string | null
          caption?: string | null
          created_at?: string
          display_order?: number
          id?: string
          image_url?: string
          is_published?: boolean
          organization_id?: string
          service_tag?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      leads: {
        Row: {
          app_id: string
          created_at: string
          email: string
          id: string
          message: string | null
          name: string
          notes: string | null
          organization_id: string
          phone: string | null
          service_interest: string | null
          source: string
          status: string
          updated_at: string
        }
        Insert: {
          app_id?: string
          created_at?: string
          email: string
          id?: string
          message?: string | null
          name: string
          notes?: string | null
          organization_id: string
          phone?: string | null
          service_interest?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Update: {
          app_id?: string
          created_at?: string
          email?: string
          id?: string
          message?: string | null
          name?: string
          notes?: string | null
          organization_id?: string
          phone?: string | null
          service_interest?: string | null
          source?: string
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          app_id: string
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          metadata: Json
          organization_id: string
          title: string
          type: string
        }
        Insert: {
          app_id?: string
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          metadata?: Json
          organization_id: string
          title: string
          type: string
        }
        Update: {
          app_id?: string
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          metadata?: Json
          organization_id?: string
          title?: string
          type?: string
        }
        Relationships: []
      }
      organizations: {
        Row: {
          app_id: string
          created_at: string | null
          id: string
          logo_url: string | null
          name: string
          slug: string
          updated_at: string | null
          website: string | null
        }
        Insert: {
          app_id?: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name: string
          slug: string
          updated_at?: string | null
          website?: string | null
        }
        Update: {
          app_id?: string
          created_at?: string | null
          id?: string
          logo_url?: string | null
          name?: string
          slug?: string
          updated_at?: string | null
          website?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          age: number | null
          app_id: string
          birthday: string | null
          created_at: string
          email: string | null
          full_name: string | null
          gender: string | null
          id: string
          organization_id: string | null
          role: Database["public"]["Enums"]["user_role"] | null
        }
        Insert: {
          age?: number | null
          app_id?: string
          birthday?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Update: {
          age?: number | null
          app_id?: string
          birthday?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          gender?: string | null
          id?: string
          organization_id?: string | null
          role?: Database["public"]["Enums"]["user_role"] | null
        }
        Relationships: []
      }
      services: {
        Row: {
          app_id: string
          badge: string | null
          category: string | null
          created_at: string
          description: string | null
          display_order: number | null
          duration_minutes: number | null
          features: Json
          icon: string | null
          id: string
          image_url: string | null
          is_featured: boolean | null
          is_published: boolean | null
          name: string
          organization_id: string
          price_from: number | null
          price_label: string | null
          price_to: number | null
          pricing_tiers: Json
          short_desc: string | null
          slug: string
          updated_at: string
        }
        Insert: {
          app_id?: string
          badge?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          features?: Json
          icon?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          name: string
          organization_id: string
          price_from?: number | null
          price_label?: string | null
          price_to?: number | null
          pricing_tiers?: Json
          short_desc?: string | null
          slug: string
          updated_at?: string
        }
        Update: {
          app_id?: string
          badge?: string | null
          category?: string | null
          created_at?: string
          description?: string | null
          display_order?: number | null
          duration_minutes?: number | null
          features?: Json
          icon?: string | null
          id?: string
          image_url?: string | null
          is_featured?: boolean | null
          is_published?: boolean | null
          name?: string
          organization_id?: string
          price_from?: number | null
          price_label?: string | null
          price_to?: number | null
          pricing_tiers?: Json
          short_desc?: string | null
          slug?: string
          updated_at?: string
        }
        Relationships: []
      }
    }
    Views: { [_ in never]: never }
    Functions: { [_ in never]: never }
    Enums: {
      user_role: "admin" | "user"
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Row"]

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Insert"]

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T]["Update"]

export type Enums<T extends keyof DefaultSchema["Enums"]> = DefaultSchema["Enums"][T]

export const Constants = {
  public: {
    Enums: {
      user_role: ["admin", "user"],
    },
  },
} as const
