export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      projects: {
        Row: {
          id:                string;
          slug:              string;
          title:             string;
          description:       string | null;
          short_description: string | null;
          content:           Json | null;
          thumbnail:         string | null;
          images:            string[] | null;
          tags:              string[] | null;
          category:          string | null;
          status:            "draft" | "published";
          featured:          boolean;
          sort_order:        number;
          metadata:          Json;
          cover_image:       string | null;
          slider_items:      Json;
          content_blocks:    Json;
          project_year:      number | null;
          project_type:      string | null;
          project_status:    string | null;
          location:          string | null;
          client:            string | null;
          site_area:         string | null;
          created_at:        string;
          updated_at:        string;
        };
        Insert: Omit<Database["public"]["Tables"]["projects"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["projects"]["Insert"]>;
      };
      shop_items: {
        Row: {
          id:               string;
          slug:             string;
          title:            string;
          item_number:      number | null;
          category:         string | null;
          availability:     "available" | "sold" | "expected";
          description:      string | null;
          long_description: string | null;
          photo_url:        string | null;
          sketch_url:       string | null;
          images:           string[] | null;
          status:           "draft" | "published";
          sort_order:       number;
          created_at:       string;
          updated_at:       string;
        };
        Insert: Omit<Database["public"]["Tables"]["shop_items"]["Row"], "id" | "created_at" | "updated_at">;
        Update: Partial<Database["public"]["Tables"]["shop_items"]["Insert"]>;
      };
      contact_submissions: {
        Row: {
          id:         string;
          name:       string;
          email:      string;
          phone:      string | null;
          subject:    string | null;
          message:    string;
          status:     "new" | "read" | "replied" | "archived";
          ip_address: string | null;
          user_agent: string | null;
          source_page: string | null;
          created_at: string;
        };
        Insert: Omit<Database["public"]["Tables"]["contact_submissions"]["Row"], "id" | "created_at">;
        Update: Partial<Pick<Database["public"]["Tables"]["contact_submissions"]["Row"], "status">>;
      };
    };
    Views:     Record<string, never>;
    Functions: Record<string, never>;
    Enums:     Record<string, never>;
  };
}

export type Project       = Database["public"]["Tables"]["projects"]["Row"];
export type ShopItem      = Database["public"]["Tables"]["shop_items"]["Row"];
export type ContactSubmission = Database["public"]["Tables"]["contact_submissions"]["Row"];
