/**
 * Minimal Supabase schema types for content persistence.
 * Keep in sync with supabase/migrations/.
 */
export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      languages: {
        Row: {
          id: string;
          code: string;
          name: string;
        };
        Insert: {
          id?: string;
          code: string;
          name: string;
        };
        Update: {
          id?: string;
          code?: string;
          name?: string;
        };
        Relationships: [];
      };
      sources: {
        Row: {
          id: string;
          slug: string;
          name: string;
          homepage_url: string;
          feed_url: string | null;
          logo_media_id: string | null;
          default_language_id: string | null;
          country_id: string | null;
          trust_tier: string;
          status: string;
          attribution_name: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          slug: string;
          name: string;
          homepage_url: string;
          feed_url?: string | null;
          logo_media_id?: string | null;
          default_language_id?: string | null;
          country_id?: string | null;
          trust_tier?: string;
          status?: string;
          attribution_name: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          slug?: string;
          name?: string;
          homepage_url?: string;
          feed_url?: string | null;
          logo_media_id?: string | null;
          default_language_id?: string | null;
          country_id?: string | null;
          trust_tier?: string;
          status?: string;
          attribution_name?: string;
          created_at?: string;
          updated_at?: string;
        };
        Relationships: [];
      };
      articles: {
        Row: {
          id: string;
          source_id: string;
          slug: string;
          canonical_url: string;
          url_fingerprint: string;
          title: string;
          excerpt: string;
          body_excerpt: string | null;
          content_format: string;
          language_id: string;
          primary_country_id: string | null;
          published_at: string;
          ingested_at: string;
          updated_at: string;
          status: string;
          paywall_original: boolean;
          hero_media_id: string | null;
          byline: string | null;
          category_slug: string;
        };
        Insert: {
          id?: string;
          source_id: string;
          slug: string;
          canonical_url: string;
          url_fingerprint: string;
          title: string;
          excerpt: string;
          body_excerpt?: string | null;
          content_format: string;
          language_id: string;
          primary_country_id?: string | null;
          published_at: string;
          ingested_at: string;
          updated_at: string;
          status?: string;
          paywall_original?: boolean;
          hero_media_id?: string | null;
          byline?: string | null;
          category_slug?: string;
        };
        Update: {
          id?: string;
          source_id?: string;
          slug?: string;
          canonical_url?: string;
          url_fingerprint?: string;
          title?: string;
          excerpt?: string;
          body_excerpt?: string | null;
          content_format?: string;
          language_id?: string;
          primary_country_id?: string | null;
          published_at?: string;
          ingested_at?: string;
          updated_at?: string;
          status?: string;
          paywall_original?: boolean;
          hero_media_id?: string | null;
          byline?: string | null;
          category_slug?: string;
        };
        Relationships: [];
      };
      media: {
        Row: {
          id: string;
          kind: string;
          url: string;
          storage_key: string | null;
          mime_type: string | null;
          width: number | null;
          height: number | null;
          duration_ms: number | null;
          alt_text: string | null;
          credit: string | null;
          license: string | null;
          article_id: string | null;
        };
        Insert: {
          id?: string;
          kind: string;
          url: string;
          storage_key?: string | null;
          mime_type?: string | null;
          width?: number | null;
          height?: number | null;
          duration_ms?: number | null;
          alt_text?: string | null;
          credit?: string | null;
          license?: string | null;
          article_id?: string | null;
        };
        Update: {
          id?: string;
          kind?: string;
          url?: string;
          storage_key?: string | null;
          mime_type?: string | null;
          width?: number | null;
          height?: number | null;
          duration_ms?: number | null;
          alt_text?: string | null;
          credit?: string | null;
          license?: string | null;
          article_id?: string | null;
        };
        Relationships: [];
      };
      article_references: {
        Row: {
          id: string;
          article_id: string;
          url: string;
          title: string | null;
          publisher_name: string | null;
          kind: string;
          accessed_at: string | null;
        };
        Insert: {
          id?: string;
          article_id: string;
          url: string;
          title?: string | null;
          publisher_name?: string | null;
          kind: string;
          accessed_at?: string | null;
        };
        Update: {
          id?: string;
          article_id?: string;
          url?: string;
          title?: string | null;
          publisher_name?: string | null;
          kind?: string;
          accessed_at?: string | null;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
};
