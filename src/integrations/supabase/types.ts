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
    PostgrestVersion: "14.4"
  }
  public: {
    Tables: {
      audit_log: {
        Row: {
          action: string
          created_at: string
          id: string
          ip_address: string | null
          metadata: Json | null
          resource: string | null
          result: string | null
          target_id: string | null
          target_type: string | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource?: string | null
          result?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          resource?: string | null
          result?: string | null
          target_id?: string | null
          target_type?: string | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      billing_records: {
        Row: {
          amount: number
          contract_id: string | null
          created_at: string
          created_by: string | null
          due_date: string | null
          id: string
          notes: string | null
          paid_date: string | null
          payment_status: string
          record_type: string
          reference_month: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount: number
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_status?: string
          record_type: string
          reference_month?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount?: number
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          due_date?: string | null
          id?: string
          notes?: string | null
          paid_date?: string | null
          payment_status?: string
          record_type?: string
          reference_month?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "billing_records_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
        ]
      }
      boletos: {
        Row: {
          ano: number
          created_at: string
          id: string
          link_boleto: string | null
          mes: number
          status: string
          user_id: string
          valor: number
        }
        Insert: {
          ano: number
          created_at?: string
          id?: string
          link_boleto?: string | null
          mes: number
          status?: string
          user_id: string
          valor?: number
        }
        Update: {
          ano?: number
          created_at?: string
          id?: string
          link_boleto?: string | null
          mes?: number
          status?: string
          user_id?: string
          valor?: number
        }
        Relationships: []
      }
      broker_rotation_state: {
        Row: {
          last_index: number
          last_user_id: string | null
          rule_id: string
          updated_at: string
        }
        Insert: {
          last_index?: number
          last_user_id?: string | null
          rule_id: string
          updated_at?: string
        }
        Update: {
          last_index?: number
          last_user_id?: string | null
          rule_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "broker_rotation_state_rule_id_fkey"
            columns: ["rule_id"]
            isOneToOne: true
            referencedRelation: "lead_distribution_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      brokers: {
        Row: {
          bank_info: string | null
          commission_pct: number | null
          created_at: string
          creci: string | null
          id: string
          profile_id: string
          region: string | null
          status: string
          updated_at: string
        }
        Insert: {
          bank_info?: string | null
          commission_pct?: number | null
          created_at?: string
          creci?: string | null
          id?: string
          profile_id: string
          region?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          bank_info?: string | null
          commission_pct?: number | null
          created_at?: string
          creci?: string | null
          id?: string
          profile_id?: string
          region?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brokers_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          birth_date: string | null
          city: string | null
          cpf_cnpj: string | null
          created_at: string
          id: string
          notes: string | null
          profile_id: string
          rg_ie: string | null
          state: string | null
          updated_at: string
          zip_code: string | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          profile_id: string
          rg_ie?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          city?: string | null
          cpf_cnpj?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          profile_id?: string
          rg_ie?: string | null
          state?: string | null
          updated_at?: string
          zip_code?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      commissions: {
        Row: {
          amount: number
          broker_id: string
          contract_id: string | null
          created_at: string
          due_date: string | null
          id: string
          paid_at: string | null
          property_id: string | null
          proposal_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          broker_id: string
          contract_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          property_id?: string | null
          proposal_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          broker_id?: string
          contract_id?: string | null
          created_at?: string
          due_date?: string | null
          id?: string
          paid_at?: string | null
          property_id?: string | null
          proposal_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "commissions_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "commissions_proposal_id_fkey"
            columns: ["proposal_id"]
            isOneToOne: false
            referencedRelation: "proposals"
            referencedColumns: ["id"]
          },
        ]
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          replied_by: string | null
          status: string
          subject: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          replied_by?: string | null
          status?: string
          subject?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          replied_by?: string | null
          status?: string
          subject?: string | null
        }
        Relationships: []
      }
      contracts: {
        Row: {
          contract_number: string | null
          contract_type: string
          created_at: string
          created_by: string | null
          end_date: string | null
          id: string
          monthly_value: number | null
          notes: string | null
          property_id: string | null
          start_date: string | null
          status: string
          total_value: number | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          contract_number?: string | null
          contract_type: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          monthly_value?: number | null
          notes?: string | null
          property_id?: string | null
          start_date?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          contract_number?: string | null
          contract_type?: string
          created_at?: string
          created_by?: string | null
          end_date?: string | null
          id?: string
          monthly_value?: number | null
          notes?: string | null
          property_id?: string | null
          start_date?: string | null
          status?: string
          total_value?: number | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "contracts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      customer_documents: {
        Row: {
          created_at: string
          description: string | null
          document_type: string
          file_url: string | null
          id: string
          is_confidential: boolean
          title: string
          uploaded_by: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          document_type: string
          file_url?: string | null
          id?: string
          is_confidential?: boolean
          title: string
          uploaded_by?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          document_type?: string
          file_url?: string | null
          id?: string
          is_confidential?: boolean
          title?: string
          uploaded_by?: string | null
          user_id?: string
        }
        Relationships: []
      }
      document_requests: {
        Row: {
          created_at: string
          id: string
          justificativa: string | null
          periodo: string | null
          status: string
          tipo_documento: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          justificativa?: string | null
          periodo?: string | null
          status?: string
          tipo_documento: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          justificativa?: string | null
          periodo?: string | null
          status?: string
          tipo_documento?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      documents_unified: {
        Row: {
          contract_id: string | null
          created_at: string
          file_url: string | null
          id: string
          profile_id: string | null
          property_id: string | null
          status: string
          title: string
          type: string
          updated_at: string
          uploaded_by: string | null
          visibility: string
        }
        Insert: {
          contract_id?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          profile_id?: string | null
          property_id?: string | null
          status?: string
          title: string
          type?: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Update: {
          contract_id?: string | null
          created_at?: string
          file_url?: string | null
          id?: string
          profile_id?: string | null
          property_id?: string | null
          status?: string
          title?: string
          type?: string
          updated_at?: string
          uploaded_by?: string | null
          visibility?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_unified_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_unified_profile_id_fkey"
            columns: ["profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_unified_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_accounts: {
        Row: {
          account_number: string | null
          agency: string | null
          bank_name: string | null
          created_at: string
          created_by: string | null
          id: string
          initial_balance: number
          is_active: boolean
          name: string
          notes: string | null
          type: string
          updated_at: string
        }
        Insert: {
          account_number?: string | null
          agency?: string | null
          bank_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name: string
          notes?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          account_number?: string | null
          agency?: string | null
          bank_name?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          initial_balance?: number
          is_active?: boolean
          name?: string
          notes?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      finance_categories: {
        Row: {
          color: string | null
          created_at: string
          icon: string | null
          id: string
          is_active: boolean
          kind: string
          name: string
          parent_id: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          kind: string
          name: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          icon?: string | null
          id?: string
          is_active?: boolean
          kind?: string
          name?: string
          parent_id?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      finance_recurring: {
        Row: {
          created_at: string
          created_by: string | null
          day_of_month: number | null
          frequency: string
          id: string
          is_active: boolean
          name: string
          next_run_at: string
          template: Json
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          frequency: string
          id?: string
          is_active?: boolean
          name: string
          next_run_at: string
          template: Json
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          day_of_month?: number | null
          frequency?: string
          id?: string
          is_active?: boolean
          name?: string
          next_run_at?: string
          template?: Json
          updated_at?: string
        }
        Relationships: []
      }
      finance_transactions: {
        Row: {
          account_id: string | null
          amount: number
          attachment_url: string | null
          category_id: string | null
          confirmed_by: string | null
          created_at: string
          created_by: string | null
          description: string
          due_date: string | null
          id: string
          kind: string
          notes: string | null
          paid_date: string | null
          payment_method: string | null
          reference_id: string | null
          reference_type: string | null
          status: string
          updated_at: string
        }
        Insert: {
          account_id?: string | null
          amount: number
          attachment_url?: string | null
          category_id?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          description: string
          due_date?: string | null
          id?: string
          kind: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          account_id?: string | null
          amount?: number
          attachment_url?: string | null
          category_id?: string | null
          confirmed_by?: string | null
          created_at?: string
          created_by?: string | null
          description?: string
          due_date?: string | null
          id?: string
          kind?: string
          notes?: string | null
          paid_date?: string | null
          payment_method?: string | null
          reference_id?: string | null
          reference_type?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "finance_transactions_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "finance_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "finance_transactions_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "finance_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      inspections: {
        Row: {
          created_at: string
          data_preferencial: string | null
          id: string
          observacoes: string | null
          status: string
          tipo: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          data_preferencial?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          data_preferencial?: string | null
          id?: string
          observacoes?: string | null
          status?: string
          tipo?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      job_applications: {
        Row: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          area_of_interest: string
          created_at: string
          experience: string | null
          id: string
          resume_url: string | null
          reviewed_by: string | null
          status: string
          updated_at: string
        }
        Insert: {
          applicant_email: string
          applicant_name: string
          applicant_phone: string
          area_of_interest: string
          created_at?: string
          experience?: string | null
          id?: string
          resume_url?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          applicant_email?: string
          applicant_name?: string
          applicant_phone?: string
          area_of_interest?: string
          created_at?: string
          experience?: string | null
          id?: string
          resume_url?: string | null
          reviewed_by?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      lead_automation_queue: {
        Row: {
          attempts: number
          created_at: string
          event_type: string
          from_stage: string | null
          id: string
          last_error: string | null
          lead_id: string
          payload: Json
          processed_at: string | null
          to_stage: string | null
        }
        Insert: {
          attempts?: number
          created_at?: string
          event_type: string
          from_stage?: string | null
          id?: string
          last_error?: string | null
          lead_id: string
          payload?: Json
          processed_at?: string | null
          to_stage?: string | null
        }
        Update: {
          attempts?: number
          created_at?: string
          event_type?: string
          from_stage?: string | null
          id?: string
          last_error?: string | null
          lead_id?: string
          payload?: Json
          processed_at?: string | null
          to_stage?: string | null
        }
        Relationships: []
      }
      lead_automation_rules: {
        Row: {
          action_config: Json
          action_type: string
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          is_active: boolean
          name: string
          trigger_event: string
          trigger_from_stage: string | null
          trigger_to_stage: string | null
          updated_at: string
        }
        Insert: {
          action_config?: Json
          action_type: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          trigger_event: string
          trigger_from_stage?: string | null
          trigger_to_stage?: string | null
          updated_at?: string
        }
        Update: {
          action_config?: Json
          action_type?: string
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          trigger_event?: string
          trigger_from_stage?: string | null
          trigger_to_stage?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      lead_distribution_logs: {
        Row: {
          action: string
          assigned_user_id: string | null
          created_at: string
          id: string
          lead_id: string
          metadata: Json
          previous_user_id: string | null
          reason: string | null
          rule_id: string | null
        }
        Insert: {
          action: string
          assigned_user_id?: string | null
          created_at?: string
          id?: string
          lead_id: string
          metadata?: Json
          previous_user_id?: string | null
          reason?: string | null
          rule_id?: string | null
        }
        Update: {
          action?: string
          assigned_user_id?: string | null
          created_at?: string
          id?: string
          lead_id?: string
          metadata?: Json
          previous_user_id?: string | null
          reason?: string | null
          rule_id?: string | null
        }
        Relationships: []
      }
      lead_distribution_rules: {
        Row: {
          create_task: boolean
          created_at: string
          created_by: string | null
          description: string | null
          eligible_user_ids: string[]
          id: string
          is_active: boolean
          match_neighborhoods: string[] | null
          match_property_types: string[] | null
          match_purposes: string[] | null
          match_sources: string[] | null
          max_price: number | null
          min_price: number | null
          mode: string
          name: string
          notify_assignee: boolean
          priority: number
          updated_at: string
        }
        Insert: {
          create_task?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          eligible_user_ids?: string[]
          id?: string
          is_active?: boolean
          match_neighborhoods?: string[] | null
          match_property_types?: string[] | null
          match_purposes?: string[] | null
          match_sources?: string[] | null
          max_price?: number | null
          min_price?: number | null
          mode?: string
          name: string
          notify_assignee?: boolean
          priority?: number
          updated_at?: string
        }
        Update: {
          create_task?: boolean
          created_at?: string
          created_by?: string | null
          description?: string | null
          eligible_user_ids?: string[]
          id?: string
          is_active?: boolean
          match_neighborhoods?: string[] | null
          match_property_types?: string[] | null
          match_purposes?: string[] | null
          match_sources?: string[] | null
          max_price?: number | null
          min_price?: number | null
          mode?: string
          name?: string
          notify_assignee?: boolean
          priority?: number
          updated_at?: string
        }
        Relationships: []
      }
      lead_interactions: {
        Row: {
          content: string | null
          created_at: string
          id: string
          interaction_type: string
          lead_id: string
          user_id: string
        }
        Insert: {
          content?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          lead_id: string
          user_id: string
        }
        Update: {
          content?: string | null
          created_at?: string
          id?: string
          interaction_type?: string
          lead_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "lead_interactions_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
        ]
      }
      lead_lost_reasons: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
        }
        Relationships: []
      }
      lead_sla_config: {
        Row: {
          created_at: string
          first_response_minutes: number
          id: string
          is_active: boolean
          match_purposes: string[] | null
          match_sources: string[] | null
          name: string
          no_interaction_hours: number
          on_breach_actions: string[]
          updated_at: string
          warning_minutes: number
        }
        Insert: {
          created_at?: string
          first_response_minutes?: number
          id?: string
          is_active?: boolean
          match_purposes?: string[] | null
          match_sources?: string[] | null
          name: string
          no_interaction_hours?: number
          on_breach_actions?: string[]
          updated_at?: string
          warning_minutes?: number
        }
        Update: {
          created_at?: string
          first_response_minutes?: number
          id?: string
          is_active?: boolean
          match_purposes?: string[] | null
          match_sources?: string[] | null
          name?: string
          no_interaction_hours?: number
          on_breach_actions?: string[]
          updated_at?: string
          warning_minutes?: number
        }
        Relationships: []
      }
      lead_sla_events: {
        Row: {
          created_at: string
          event_type: string
          id: string
          lead_id: string
          metadata: Json
          sla_config_id: string | null
        }
        Insert: {
          created_at?: string
          event_type: string
          id?: string
          lead_id: string
          metadata?: Json
          sla_config_id?: string | null
        }
        Update: {
          created_at?: string
          event_type?: string
          id?: string
          lead_id?: string
          metadata?: Json
          sla_config_id?: string | null
        }
        Relationships: []
      }
      listing_submissions: {
        Row: {
          address: string | null
          area: number | null
          asking_price: number | null
          bathrooms: number | null
          bedrooms: number | null
          created_at: string
          description: string | null
          evaluated_by: string | null
          id: string
          neighborhood: string | null
          owner_email: string
          owner_name: string
          owner_phone: string
          parking_spots: number | null
          property_type: string | null
          purpose: string | null
          status: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          area?: number | null
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          evaluated_by?: string | null
          id?: string
          neighborhood?: string | null
          owner_email: string
          owner_name: string
          owner_phone: string
          parking_spots?: number | null
          property_type?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          area?: number | null
          asking_price?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          created_at?: string
          description?: string | null
          evaluated_by?: string | null
          id?: string
          neighborhood?: string | null
          owner_email?: string
          owner_name?: string
          owner_phone?: string
          parking_spots?: number | null
          property_type?: string | null
          purpose?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: []
      }
      maintenance_requests: {
        Row: {
          created_at: string
          descricao: string
          id: string
          status: string
          tipo: string
          updated_at: string
          urgencia: string
          user_id: string
        }
        Insert: {
          created_at?: string
          descricao: string
          id?: string
          status?: string
          tipo: string
          updated_at?: string
          urgencia?: string
          user_id: string
        }
        Update: {
          created_at?: string
          descricao?: string
          id?: string
          status?: string
          tipo?: string
          updated_at?: string
          urgencia?: string
          user_id?: string
        }
        Relationships: []
      }
      neighborhoods: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          normalized: string
          region: string | null
          slug: string
          source: string | null
          updated_at: string
          verified: boolean
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          normalized: string
          region?: string | null
          slug: string
          source?: string | null
          updated_at?: string
          verified?: boolean
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          normalized?: string
          region?: string | null
          slug?: string
          source?: string | null
          updated_at?: string
          verified?: boolean
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title: string
          type?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      ombudsman_tickets: {
        Row: {
          created_at: string
          id: string
          internal_notes: string | null
          message: string
          reporter_email: string
          reporter_name: string
          reporter_phone: string | null
          resolved_by: string | null
          status: string
          ticket_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          internal_notes?: string | null
          message: string
          reporter_email: string
          reporter_name: string
          reporter_phone?: string | null
          resolved_by?: string | null
          status?: string
          ticket_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          internal_notes?: string | null
          message?: string
          reporter_email?: string
          reporter_name?: string
          reporter_phone?: string | null
          resolved_by?: string | null
          status?: string
          ticket_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          action: string
          code: string
          created_at: string
          description: string | null
          module: string
        }
        Insert: {
          action: string
          code: string
          created_at?: string
          description?: string | null
          module: string
        }
        Update: {
          action?: string
          code?: string
          created_at?: string
          description?: string | null
          module?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          full_name: string | null
          id: string
          is_active: boolean
          mfa_required: boolean
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          mfa_required?: boolean
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          full_name?: string | null
          id?: string
          is_active?: boolean
          mfa_required?: boolean
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      properties: {
        Row: {
          address: string | null
          archived_at: string | null
          archived_by: string | null
          archived_reason: string | null
          area: number
          assigned_broker_id: string | null
          bathrooms: number
          bedrooms: number
          city: string
          code: string
          condominium_fee: number | null
          created_at: string
          created_by: string | null
          description: string | null
          description_heading_style: string
          features: string[] | null
          id: string
          images: string[] | null
          internal_notes: string | null
          iptu: number | null
          is_featured: boolean
          is_new: boolean
          is_super_featured: boolean
          neighborhood: string | null
          owner_client_id: string | null
          parking_spots: number
          price: number
          purpose: string
          rent_price: number | null
          responsible_agent: string | null
          state: string
          status: string
          suites: number
          title: string
          type: string
          updated_at: string
        }
        Insert: {
          address?: string | null
          archived_at?: string | null
          archived_by?: string | null
          archived_reason?: string | null
          area?: number
          assigned_broker_id?: string | null
          bathrooms?: number
          bedrooms?: number
          city?: string
          code: string
          condominium_fee?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_heading_style?: string
          features?: string[] | null
          id?: string
          images?: string[] | null
          internal_notes?: string | null
          iptu?: number | null
          is_featured?: boolean
          is_new?: boolean
          is_super_featured?: boolean
          neighborhood?: string | null
          owner_client_id?: string | null
          parking_spots?: number
          price?: number
          purpose: string
          rent_price?: number | null
          responsible_agent?: string | null
          state?: string
          status?: string
          suites?: number
          title: string
          type: string
          updated_at?: string
        }
        Update: {
          address?: string | null
          archived_at?: string | null
          archived_by?: string | null
          archived_reason?: string | null
          area?: number
          assigned_broker_id?: string | null
          bathrooms?: number
          bedrooms?: number
          city?: string
          code?: string
          condominium_fee?: number | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          description_heading_style?: string
          features?: string[] | null
          id?: string
          images?: string[] | null
          internal_notes?: string | null
          iptu?: number | null
          is_featured?: boolean
          is_new?: boolean
          is_super_featured?: boolean
          neighborhood?: string | null
          owner_client_id?: string | null
          parking_spots?: number
          price?: number
          purpose?: string
          rent_price?: number | null
          responsible_agent?: string | null
          state?: string
          status?: string
          suites?: number
          title?: string
          type?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_assigned_broker_id_fkey"
            columns: ["assigned_broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "properties_owner_client_id_fkey"
            columns: ["owner_client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      property_leads: {
        Row: {
          assigned_to: string | null
          channel: string | null
          client_id: string | null
          created_at: string
          distributed_at: string | null
          distribution_rule_id: string | null
          email: string
          first_response_at: string | null
          funnel_stage: string
          id: string
          interest_bedrooms: number | null
          interest_max_price: number | null
          interest_min_price: number | null
          interest_neighborhood_id: string | null
          interest_property_type: string | null
          interest_purpose: string | null
          internal_notes: string | null
          last_interaction_at: string | null
          lost_at: string | null
          lost_notes: string | null
          lost_reason_id: string | null
          message: string | null
          name: string
          next_followup_at: string | null
          phone: string | null
          priority: string
          property_id: string | null
          redistribution_count: number
          sla_status: string
          source: string | null
          status: string
          tags: string[] | null
          temperature: string
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          assigned_to?: string | null
          channel?: string | null
          client_id?: string | null
          created_at?: string
          distributed_at?: string | null
          distribution_rule_id?: string | null
          email: string
          first_response_at?: string | null
          funnel_stage?: string
          id?: string
          interest_bedrooms?: number | null
          interest_max_price?: number | null
          interest_min_price?: number | null
          interest_neighborhood_id?: string | null
          interest_property_type?: string | null
          interest_purpose?: string | null
          internal_notes?: string | null
          last_interaction_at?: string | null
          lost_at?: string | null
          lost_notes?: string | null
          lost_reason_id?: string | null
          message?: string | null
          name: string
          next_followup_at?: string | null
          phone?: string | null
          priority?: string
          property_id?: string | null
          redistribution_count?: number
          sla_status?: string
          source?: string | null
          status?: string
          tags?: string[] | null
          temperature?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          assigned_to?: string | null
          channel?: string | null
          client_id?: string | null
          created_at?: string
          distributed_at?: string | null
          distribution_rule_id?: string | null
          email?: string
          first_response_at?: string | null
          funnel_stage?: string
          id?: string
          interest_bedrooms?: number | null
          interest_max_price?: number | null
          interest_min_price?: number | null
          interest_neighborhood_id?: string | null
          interest_property_type?: string | null
          interest_purpose?: string | null
          internal_notes?: string | null
          last_interaction_at?: string | null
          lost_at?: string | null
          lost_notes?: string | null
          lost_reason_id?: string | null
          message?: string | null
          name?: string
          next_followup_at?: string | null
          phone?: string | null
          priority?: string
          property_id?: string | null
          redistribution_count?: number
          sla_status?: string
          source?: string | null
          status?: string
          tags?: string[] | null
          temperature?: string
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_leads_interest_neighborhood_id_fkey"
            columns: ["interest_neighborhood_id"]
            isOneToOne: false
            referencedRelation: "neighborhoods"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_leads_lost_reason_id_fkey"
            columns: ["lost_reason_id"]
            isOneToOne: false
            referencedRelation: "lead_lost_reasons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_leads_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      proposals: {
        Row: {
          amount: number
          broker_id: string | null
          client_id: string | null
          created_at: string
          id: string
          notes: string | null
          property_id: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount?: number
          broker_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          broker_id?: string | null
          client_id?: string | null
          created_at?: string
          id?: string
          notes?: string | null
          property_id?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "proposals_broker_id_fkey"
            columns: ["broker_id"]
            isOneToOne: false
            referencedRelation: "brokers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "proposals_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rental_inquiries: {
        Row: {
          assunto: string
          created_at: string
          id: string
          mensagem: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assunto: string
          created_at?: string
          id?: string
          mensagem: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assunto?: string
          created_at?: string
          id?: string
          mensagem?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_code: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_code: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_code?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_code_fkey"
            columns: ["permission_code"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["code"]
          },
        ]
      }
      support_requests: {
        Row: {
          assigned_to: string | null
          category: string
          created_at: string
          id: string
          internal_notes: string | null
          message: string
          priority: string
          resolved_at: string | null
          status: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_to?: string | null
          category: string
          created_at?: string
          id?: string
          internal_notes?: string | null
          message: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_to?: string | null
          category?: string
          created_at?: string
          id?: string
          internal_notes?: string | null
          message?: string
          priority?: string
          resolved_at?: string | null
          status?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      tasks: {
        Row: {
          assigned_to: string | null
          client_profile_id: string | null
          completed_at: string | null
          contract_id: string | null
          created_at: string
          created_by: string | null
          description: string | null
          due_at: string | null
          id: string
          lead_id: string | null
          priority: string
          property_id: string | null
          status: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          client_profile_id?: string | null
          completed_at?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          priority?: string
          property_id?: string | null
          status?: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          client_profile_id?: string | null
          completed_at?: string | null
          contract_id?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          due_at?: string | null
          id?: string
          lead_id?: string | null
          priority?: string
          property_id?: string | null
          status?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "tasks_client_profile_id_fkey"
            columns: ["client_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_contract_id_fkey"
            columns: ["contract_id"]
            isOneToOne: false
            referencedRelation: "contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "tasks_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          granted_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          granted_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      visits: {
        Row: {
          agent_id: string
          client_id: string | null
          created_at: string
          created_by: string | null
          duration_minutes: number | null
          id: string
          lead_id: string | null
          notes: string | null
          property_id: string | null
          scheduled_at: string
          status: string
          updated_at: string
        }
        Insert: {
          agent_id: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          property_id?: string | null
          scheduled_at: string
          status?: string
          updated_at?: string
        }
        Update: {
          agent_id?: string
          client_id?: string | null
          created_at?: string
          created_by?: string | null
          duration_minutes?: number | null
          id?: string
          lead_id?: string | null
          notes?: string | null
          property_id?: string | null
          scheduled_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "visits_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "property_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "visits_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      apply_distribution_rules: { Args: { _lead_id: string }; Returns: string }
      get_my_permissions: { Args: never; Returns: string[] }
      get_my_roles: {
        Args: never
        Returns: Database["public"]["Enums"]["app_role"][]
      }
      has_any_role: {
        Args: {
          _roles: Database["public"]["Enums"]["app_role"][]
          _user_id: string
        }
        Returns: boolean
      }
      has_permission: {
        Args: { _code: string; _user_id: string }
        Returns: boolean
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      is_admin: { Args: { _user_id: string }; Returns: boolean }
      is_broker_partner: { Args: { _user_id: string }; Returns: boolean }
      log_audit: {
        Args: {
          _action: string
          _metadata?: Json
          _target_id: string
          _target_type: string
        }
        Returns: undefined
      }
      redistribute_lead: {
        Args: { _lead_id: string; _reason?: string }
        Returns: string
      }
    }
    Enums: {
      app_role:
        | "cliente"
        | "corretor"
        | "locacao"
        | "vendas"
        | "financeiro"
        | "administrativo"
        | "superadmin"
        | "corretor_parceiro"
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
      app_role: [
        "cliente",
        "corretor",
        "locacao",
        "vendas",
        "financeiro",
        "administrativo",
        "superadmin",
        "corretor_parceiro",
      ],
    },
  },
} as const
