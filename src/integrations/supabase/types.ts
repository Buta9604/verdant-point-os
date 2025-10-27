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
      analytics_summary: {
        Row: {
          avg_basket_size: number | null
          created_at: string | null
          date: string
          gross_profit: number | null
          id: string
          new_customers: number | null
          top_employee_id: string | null
          top_product_id: string | null
          total_cost: number | null
          total_revenue: number | null
          total_sales: number | null
          transaction_count: number | null
          unique_customers: number | null
        }
        Insert: {
          avg_basket_size?: number | null
          created_at?: string | null
          date: string
          gross_profit?: number | null
          id?: string
          new_customers?: number | null
          top_employee_id?: string | null
          top_product_id?: string | null
          total_cost?: number | null
          total_revenue?: number | null
          total_sales?: number | null
          transaction_count?: number | null
          unique_customers?: number | null
        }
        Update: {
          avg_basket_size?: number | null
          created_at?: string | null
          date?: string
          gross_profit?: number | null
          id?: string
          new_customers?: number | null
          top_employee_id?: string | null
          top_product_id?: string | null
          total_cost?: number | null
          total_revenue?: number | null
          total_sales?: number | null
          transaction_count?: number | null
          unique_customers?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "analytics_summary_top_employee_id_fkey"
            columns: ["top_employee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "analytics_summary_top_product_id_fkey"
            columns: ["top_product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      background_jobs: {
        Row: {
          completed_at: string | null
          created_at: string | null
          data: Json | null
          error: string | null
          id: string
          name: string
          result: Json | null
          started_at: string | null
          status: Database["public"]["Enums"]["job_status"] | null
          type: Database["public"]["Enums"]["job_type"]
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          error?: string | null
          id?: string
          name: string
          result?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          type: Database["public"]["Enums"]["job_type"]
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          data?: Json | null
          error?: string | null
          id?: string
          name?: string
          result?: Json | null
          started_at?: string | null
          status?: Database["public"]["Enums"]["job_status"] | null
          type?: Database["public"]["Enums"]["job_type"]
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string | null
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          tax_rate: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          tax_rate: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          tax_rate?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      compliance_logs: {
        Row: {
          action: string
          after_state: Json | null
          before_state: Json | null
          created_at: string | null
          entity_id: string | null
          entity_type: string | null
          event_type: Database["public"]["Enums"]["compliance_event_type"]
          id: string
          ip_address: string | null
          metrc_batch_id: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type: Database["public"]["Enums"]["compliance_event_type"]
          id?: string
          ip_address?: string | null
          metrc_batch_id?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          after_state?: Json | null
          before_state?: Json | null
          created_at?: string | null
          entity_id?: string | null
          entity_type?: string | null
          event_type?: Database["public"]["Enums"]["compliance_event_type"]
          id?: string
          ip_address?: string | null
          metrc_batch_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "compliance_logs_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      customers: {
        Row: {
          created_at: string | null
          date_of_birth: string
          email: string | null
          first_name: string
          id: string
          is_active: boolean | null
          last_name: string
          loyalty_points: number | null
          medical_card_expiry: string | null
          medical_card_number: string | null
          medical_card_state: string | null
          notes: string | null
          phone: string | null
          preferred_contact:
            | Database["public"]["Enums"]["preferred_contact"]
            | null
          total_spent: number | null
          updated_at: string | null
          visit_count: number | null
        }
        Insert: {
          created_at?: string | null
          date_of_birth: string
          email?: string | null
          first_name: string
          id?: string
          is_active?: boolean | null
          last_name: string
          loyalty_points?: number | null
          medical_card_expiry?: string | null
          medical_card_number?: string | null
          medical_card_state?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact?:
            | Database["public"]["Enums"]["preferred_contact"]
            | null
          total_spent?: number | null
          updated_at?: string | null
          visit_count?: number | null
        }
        Update: {
          created_at?: string | null
          date_of_birth?: string
          email?: string | null
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_name?: string
          loyalty_points?: number | null
          medical_card_expiry?: string | null
          medical_card_number?: string | null
          medical_card_state?: string | null
          notes?: string | null
          phone?: string | null
          preferred_contact?:
            | Database["public"]["Enums"]["preferred_contact"]
            | null
          total_spent?: number | null
          updated_at?: string | null
          visit_count?: number | null
        }
        Relationships: []
      }
      inventory: {
        Row: {
          expiry_date: string | null
          id: string
          last_restock_date: string | null
          location: string | null
          product_id: string
          quantity: number | null
          reorder_level: number | null
          reorder_quantity: number | null
          updated_at: string | null
        }
        Insert: {
          expiry_date?: string | null
          id?: string
          last_restock_date?: string | null
          location?: string | null
          product_id: string
          quantity?: number | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          updated_at?: string | null
        }
        Update: {
          expiry_date?: string | null
          id?: string
          last_restock_date?: string | null
          location?: string | null
          product_id?: string
          quantity?: number | null
          reorder_level?: number | null
          reorder_quantity?: number | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: true
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_url: string | null
          created_at: string | null
          id: string
          is_read: boolean | null
          message: string
          metadata: Json | null
          priority: Database["public"]["Enums"]["notification_priority"] | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Insert: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          title: string
          type: Database["public"]["Enums"]["notification_type"]
          user_id: string
        }
        Update: {
          action_url?: string | null
          created_at?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          metadata?: Json | null
          priority?: Database["public"]["Enums"]["notification_priority"] | null
          title?: string
          type?: Database["public"]["Enums"]["notification_type"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "notifications_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          batch_id: string | null
          category_id: string
          cbd_percentage: number | null
          cost: number | null
          created_at: string | null
          description: string | null
          id: string
          image_url: string | null
          is_active: boolean | null
          metrc_id: string | null
          name: string
          price: number
          sku: string
          strain_type: Database["public"]["Enums"]["strain_type"] | null
          supplier_id: string | null
          thc_percentage: number | null
          updated_at: string | null
          weight_grams: number | null
        }
        Insert: {
          batch_id?: string | null
          category_id: string
          cbd_percentage?: number | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metrc_id?: string | null
          name: string
          price: number
          sku: string
          strain_type?: Database["public"]["Enums"]["strain_type"] | null
          supplier_id?: string | null
          thc_percentage?: number | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Update: {
          batch_id?: string | null
          category_id?: string
          cbd_percentage?: number | null
          cost?: number | null
          created_at?: string | null
          description?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean | null
          metrc_id?: string | null
          name?: string
          price?: number
          sku?: string
          strain_type?: Database["public"]["Enums"]["strain_type"] | null
          supplier_id?: string | null
          thc_percentage?: number | null
          updated_at?: string | null
          weight_grams?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_supplier_id_fkey"
            columns: ["supplier_id"]
            isOneToOne: false
            referencedRelation: "suppliers"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string | null
          email: string
          first_name: string
          id: string
          is_active: boolean | null
          last_login: string | null
          last_name: string
          phone: string | null
          pin_hash: string | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email: string
          first_name: string
          id: string
          is_active?: boolean | null
          last_login?: string | null
          last_name: string
          phone?: string | null
          pin_hash?: string | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email?: string
          first_name?: string
          id?: string
          is_active?: boolean | null
          last_login?: string | null
          last_name?: string
          phone?: string | null
          pin_hash?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      settings: {
        Row: {
          category: Database["public"]["Enums"]["setting_category"] | null
          description: string | null
          id: string
          is_encrypted: boolean | null
          key: string
          updated_at: string | null
          updated_by: string | null
          value: string
        }
        Insert: {
          category?: Database["public"]["Enums"]["setting_category"] | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key: string
          updated_at?: string | null
          updated_by?: string | null
          value: string
        }
        Update: {
          category?: Database["public"]["Enums"]["setting_category"] | null
          description?: string | null
          id?: string
          is_encrypted?: boolean | null
          key?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: string
        }
        Relationships: [
          {
            foreignKeyName: "settings_updated_by_fkey"
            columns: ["updated_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      shifts: {
        Row: {
          clock_in: string
          clock_out: string | null
          created_at: string | null
          id: string
          notes: string | null
          register_id: string | null
          total_hours: number | null
          total_sales: number | null
          transaction_count: number | null
          user_id: string
        }
        Insert: {
          clock_in: string
          clock_out?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          register_id?: string | null
          total_hours?: number | null
          total_sales?: number | null
          transaction_count?: number | null
          user_id: string
        }
        Update: {
          clock_in?: string
          clock_out?: string | null
          created_at?: string | null
          id?: string
          notes?: string | null
          register_id?: string | null
          total_hours?: number | null
          total_sales?: number | null
          transaction_count?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "shifts_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      suppliers: {
        Row: {
          address: string | null
          contact_name: string | null
          created_at: string | null
          email: string | null
          id: string
          is_active: boolean | null
          license_number: string | null
          name: string
          notes: string | null
          phone: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          contact_name?: string | null
          created_at?: string | null
          email?: string | null
          id?: string
          is_active?: boolean | null
          license_number?: string | null
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string | null
        }
        Relationships: []
      }
      transaction_items: {
        Row: {
          created_at: string | null
          discount: number | null
          id: string
          product_id: string
          quantity: number
          total: number
          transaction_id: string
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          discount?: number | null
          id?: string
          product_id: string
          quantity: number
          total: number
          transaction_id: string
          unit_price: number
        }
        Update: {
          created_at?: string | null
          discount?: number | null
          id?: string
          product_id?: string
          quantity?: number
          total?: number
          transaction_id?: string
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "transaction_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transaction_items_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          created_at: string | null
          customer_id: string | null
          discount_amount: number | null
          id: string
          notes: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status: Database["public"]["Enums"]["payment_status"] | null
          register_id: string | null
          subtotal: number
          tax_amount: number
          total: number
          transaction_number: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          register_id?: string | null
          subtotal: number
          tax_amount: number
          total: number
          transaction_number: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          customer_id?: string | null
          discount_amount?: number | null
          id?: string
          notes?: string | null
          payment_method?: Database["public"]["Enums"]["payment_method"]
          payment_status?: Database["public"]["Enums"]["payment_status"] | null
          register_id?: string | null
          subtotal?: number
          tax_amount?: number
          total?: number
          transaction_number?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "transactions_customer_id_fkey"
            columns: ["customer_id"]
            isOneToOne: false
            referencedRelation: "customers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_manager_or_admin: { Args: { _user_id: string }; Returns: boolean }
    }
    Enums: {
      app_role: "ADMIN" | "MANAGER" | "BUDTENDER" | "INVENTORY_CLERK"
      compliance_event_type:
        | "SALE"
        | "RETURN"
        | "TRANSFER"
        | "DISPOSAL"
        | "INVENTORY_ADJUSTMENT"
        | "METRC_SYNC"
      job_status: "PENDING" | "PROCESSING" | "COMPLETED" | "FAILED"
      job_type:
        | "ANALYTICS"
        | "COMPLIANCE_SYNC"
        | "BACKUP"
        | "REPORT"
        | "EMAIL"
        | "CLEANUP"
      notification_priority: "LOW" | "NORMAL" | "HIGH" | "CRITICAL"
      notification_type:
        | "LOW_STOCK"
        | "COMPLIANCE"
        | "SYSTEM"
        | "SHIFT"
        | "SALES"
      payment_method: "CASH" | "DEBIT" | "CREDIT"
      payment_status: "COMPLETED" | "REFUNDED" | "VOID"
      preferred_contact: "EMAIL" | "PHONE" | "NONE"
      setting_category:
        | "TAX"
        | "STORE"
        | "NOTIFICATION"
        | "INTEGRATION"
        | "SYSTEM"
      strain_type: "INDICA" | "SATIVA" | "HYBRID" | "CBD" | "NA"
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
      app_role: ["ADMIN", "MANAGER", "BUDTENDER", "INVENTORY_CLERK"],
      compliance_event_type: [
        "SALE",
        "RETURN",
        "TRANSFER",
        "DISPOSAL",
        "INVENTORY_ADJUSTMENT",
        "METRC_SYNC",
      ],
      job_status: ["PENDING", "PROCESSING", "COMPLETED", "FAILED"],
      job_type: [
        "ANALYTICS",
        "COMPLIANCE_SYNC",
        "BACKUP",
        "REPORT",
        "EMAIL",
        "CLEANUP",
      ],
      notification_priority: ["LOW", "NORMAL", "HIGH", "CRITICAL"],
      notification_type: [
        "LOW_STOCK",
        "COMPLIANCE",
        "SYSTEM",
        "SHIFT",
        "SALES",
      ],
      payment_method: ["CASH", "DEBIT", "CREDIT"],
      payment_status: ["COMPLETED", "REFUNDED", "VOID"],
      preferred_contact: ["EMAIL", "PHONE", "NONE"],
      setting_category: [
        "TAX",
        "STORE",
        "NOTIFICATION",
        "INTEGRATION",
        "SYSTEM",
      ],
      strain_type: ["INDICA", "SATIVA", "HYBRID", "CBD", "NA"],
    },
  },
} as const
