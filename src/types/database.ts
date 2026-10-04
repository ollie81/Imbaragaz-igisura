/**
 * Supabase database types.
 *
 * Mirrors the SQL in supabase/migrations. After changing the schema, regenerate:
 *   npm run db:types   (requires the Supabase CLI to be linked to the project)
 */
export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "13.0.5";
  };
  public: {
    Tables: {
      admins: {
        Row: {
          user_id: string;
          full_name: string;
          role: string;
          is_active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          user_id: string;
          full_name: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          user_id?: string;
          full_name?: string;
          role?: string;
          is_active?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_contacts: {
        Row: {
          id: string;
          type: string;
          value: string;
          label: string | null;
          is_primary: boolean;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          type: string;
          value: string;
          label?: string | null;
          is_primary?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          type?: string;
          value?: string;
          label?: string | null;
          is_primary?: boolean;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_hours: {
        Row: {
          id: string;
          day_of_week: number;
          opens_at: string | null;
          closes_at: string | null;
          is_closed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          day_of_week: number;
          opens_at?: string | null;
          closes_at?: string | null;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          day_of_week?: number;
          opens_at?: string | null;
          closes_at?: string | null;
          is_closed?: boolean;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_settings: {
        Row: {
          id: number;
          business_name: string;
          country_code: string;
          city: string | null;
          address: string | null;
          latitude: number | null;
          longitude: number | null;
          google_maps_url: string | null;
          timezone: string;
          default_currency: string;
          founded_year: number | null;
          experience_years: number | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: number;
          business_name: string;
          country_code?: string;
          city?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          google_maps_url?: string | null;
          timezone?: string;
          default_currency?: string;
          founded_year?: number | null;
          experience_years?: number | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: number;
          business_name?: string;
          country_code?: string;
          city?: string | null;
          address?: string | null;
          latitude?: number | null;
          longitude?: number | null;
          google_maps_url?: string | null;
          timezone?: string;
          default_currency?: string;
          founded_year?: number | null;
          experience_years?: number | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      business_settings_translations: {
        Row: {
          locale: string;
          tagline: string | null;
          about: string | null;
          location_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          locale: string;
          tagline?: string | null;
          about?: string | null;
          location_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          locale?: string;
          tagline?: string | null;
          about?: string | null;
          location_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "business_settings_translations_locale_fkey";
            columns: ["locale"];
            isOneToOne: true;
            referencedRelation: "locales";
            referencedColumns: ["code"];
          },
        ];
      };
      locales: {
        Row: {
          code: string;
          name: string;
          native_name: string;
          is_enabled: boolean;
          sort_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          code: string;
          name: string;
          native_name: string;
          is_enabled?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          code?: string;
          name?: string;
          native_name?: string;
          is_enabled?: boolean;
          sort_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      product_categories: {
        Row: {
          id: string;
          slug: string;
          parent_id: string | null;
          is_active: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          parent_id?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          parent_id?: string | null;
          is_active?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_categories_parent_id_fkey";
            columns: ["parent_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
      product_category_translations: {
        Row: {
          category_id: string;
          locale: string;
          name: string;
          description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          category_id: string;
          locale: string;
          name: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          category_id?: string;
          locale?: string;
          name?: string;
          description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_category_translations_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_category_translations_locale_fkey";
            columns: ["locale"];
            isOneToOne: false;
            referencedRelation: "locales";
            referencedColumns: ["code"];
          },
        ];
      };
      product_image_translations: {
        Row: {
          image_id: string;
          locale: string;
          alt_text: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          image_id: string;
          locale: string;
          alt_text: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          image_id?: string;
          locale?: string;
          alt_text?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_image_translations_image_id_fkey";
            columns: ["image_id"];
            isOneToOne: false;
            referencedRelation: "product_images";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_image_translations_locale_fkey";
            columns: ["locale"];
            isOneToOne: false;
            referencedRelation: "locales";
            referencedColumns: ["code"];
          },
        ];
      };
      product_images: {
        Row: {
          id: string;
          product_id: string;
          variant_id: string | null;
          storage_path: string;
          width: number | null;
          height: number | null;
          is_primary: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          variant_id?: string | null;
          storage_path: string;
          width?: number | null;
          height?: number | null;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          variant_id?: string | null;
          storage_path?: string;
          width?: number | null;
          height?: number | null;
          is_primary?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_images_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
          {
            foreignKeyName: "product_images_variant_id_fkey";
            columns: ["variant_id"];
            isOneToOne: false;
            referencedRelation: "product_variants";
            referencedColumns: ["id"];
          },
        ];
      };
      product_translations: {
        Row: {
          product_id: string;
          locale: string;
          name: string;
          short_description: string | null;
          description: string | null;
          origin: string | null;
          traditional_use: string | null;
          usage_instructions: string | null;
          warnings: string | null;
          seo_title: string | null;
          seo_description: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          product_id: string;
          locale: string;
          name: string;
          short_description?: string | null;
          description?: string | null;
          origin?: string | null;
          traditional_use?: string | null;
          usage_instructions?: string | null;
          warnings?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          product_id?: string;
          locale?: string;
          name?: string;
          short_description?: string | null;
          description?: string | null;
          origin?: string | null;
          traditional_use?: string | null;
          usage_instructions?: string | null;
          warnings?: string | null;
          seo_title?: string | null;
          seo_description?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_translations_locale_fkey";
            columns: ["locale"];
            isOneToOne: false;
            referencedRelation: "locales";
            referencedColumns: ["code"];
          },
          {
            foreignKeyName: "product_translations_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      product_variants: {
        Row: {
          id: string;
          product_id: string;
          sku: string | null;
          label: string | null;
          size_value: number | null;
          size_unit: string | null;
          price: number | null;
          currency: string;
          is_available: boolean;
          is_default: boolean;
          display_order: number;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          product_id: string;
          sku?: string | null;
          label?: string | null;
          size_value?: number | null;
          size_unit?: string | null;
          price?: number | null;
          currency?: string;
          is_available?: boolean;
          is_default?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          product_id?: string;
          sku?: string | null;
          label?: string | null;
          size_value?: number | null;
          size_unit?: string | null;
          price?: number | null;
          currency?: string;
          is_available?: boolean;
          is_default?: boolean;
          display_order?: number;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey";
            columns: ["product_id"];
            isOneToOne: false;
            referencedRelation: "products";
            referencedColumns: ["id"];
          },
        ];
      };
      products: {
        Row: {
          id: string;
          slug: string;
          category_id: string | null;
          status: string;
          availability: string;
          is_featured: boolean;
          display_order: number;
          published_at: string | null;
          metadata: Json;
          created_by: string | null;
          updated_by: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          category_id?: string | null;
          status?: string;
          availability?: string;
          is_featured?: boolean;
          display_order?: number;
          published_at?: string | null;
          metadata?: Json;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          category_id?: string | null;
          status?: string;
          availability?: string;
          is_featured?: boolean;
          display_order?: number;
          published_at?: string | null;
          metadata?: Json;
          created_by?: string | null;
          updated_by?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "products_category_id_fkey";
            columns: ["category_id"];
            isOneToOne: false;
            referencedRelation: "product_categories";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: { [_ in never]: never };
    Functions: { [_ in never]: never };
    Enums: { [_ in never]: never };
    CompositeTypes: { [_ in never]: never };
  };
};

type PublicSchema = Database["public"];

export type Tables<T extends keyof PublicSchema["Tables"]> = PublicSchema["Tables"][T]["Row"];
export type TablesInsert<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Insert"];
export type TablesUpdate<T extends keyof PublicSchema["Tables"]> =
  PublicSchema["Tables"][T]["Update"];
