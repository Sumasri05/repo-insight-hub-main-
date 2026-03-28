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
      analysis_history: {
        Row: {
          analyzed_at: string
          id: string
          repository_id: string | null
          repository_name: string
          repository_owner: string
          risk_level: string
          score: number
          user_id: string
        }
        Insert: {
          analyzed_at?: string
          id?: string
          repository_id?: string | null
          repository_name: string
          repository_owner: string
          risk_level?: string
          score?: number
          user_id: string
        }
        Update: {
          analyzed_at?: string
          id?: string
          repository_id?: string | null
          repository_name?: string
          repository_owner?: string
          risk_level?: string
          score?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "analysis_history_repository_id_fkey"
            columns: ["repository_id"]
            isOneToOne: false
            referencedRelation: "repositories"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string | null
          github_username: string | null
          id: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          github_username?: string | null
          id: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string | null
          github_username?: string | null
          id?: string
          username?: string | null
        }
        Relationships: []
      }
      repositories: {
        Row: {
          activity_score: number
          avg_file_size: number
          cached_at: string | null
          code_complexity_score: number
          commit_frequency: string
          community_health_score: number
          contributors: number
          created_at: string
          dependency_count: number
          dependency_files: Json
          dependency_health_score: number
          dependency_risk_level: string
          description: string
          detected_technologies: Json
          documentation_score: number
          explanation: Json
          file_count: number
          file_tree: Json
          forks: number
          has_ci_cd: boolean
          has_contributing: boolean
          has_docs_folder: boolean
          has_license: boolean
          has_tests: boolean
          id: string
          issues: number
          language: string | null
          large_files_count: number
          last_commit_date: string | null
          maintainability_score: number
          max_directory_depth: number
          owner: string
          readme_length: number
          readme_sections: Json
          recommendations: Json
          repo_name: string
          repo_url: string
          risk_level: string
          risk_reasons: Json
          risk_score: number
          score: number
          score_explanations: Json
          stars: number
          structure_score: number
          summary: string
          watchers: number
        }
        Insert: {
          activity_score?: number
          avg_file_size?: number
          cached_at?: string | null
          code_complexity_score?: number
          commit_frequency?: string
          community_health_score?: number
          contributors?: number
          created_at?: string
          dependency_count?: number
          dependency_files?: Json
          dependency_health_score?: number
          dependency_risk_level?: string
          description?: string
          detected_technologies?: Json
          documentation_score?: number
          explanation?: Json
          file_count?: number
          file_tree?: Json
          forks?: number
          has_ci_cd?: boolean
          has_contributing?: boolean
          has_docs_folder?: boolean
          has_license?: boolean
          has_tests?: boolean
          id?: string
          issues?: number
          language?: string | null
          large_files_count?: number
          last_commit_date?: string | null
          maintainability_score?: number
          max_directory_depth?: number
          owner: string
          readme_length?: number
          readme_sections?: Json
          recommendations?: Json
          repo_name: string
          repo_url: string
          risk_level?: string
          risk_reasons?: Json
          risk_score?: number
          score?: number
          score_explanations?: Json
          stars?: number
          structure_score?: number
          summary?: string
          watchers?: number
        }
        Update: {
          activity_score?: number
          avg_file_size?: number
          cached_at?: string | null
          code_complexity_score?: number
          commit_frequency?: string
          community_health_score?: number
          contributors?: number
          created_at?: string
          dependency_count?: number
          dependency_files?: Json
          dependency_health_score?: number
          dependency_risk_level?: string
          description?: string
          detected_technologies?: Json
          documentation_score?: number
          explanation?: Json
          file_count?: number
          file_tree?: Json
          forks?: number
          has_ci_cd?: boolean
          has_contributing?: boolean
          has_docs_folder?: boolean
          has_license?: boolean
          has_tests?: boolean
          id?: string
          issues?: number
          language?: string | null
          large_files_count?: number
          last_commit_date?: string | null
          maintainability_score?: number
          max_directory_depth?: number
          owner?: string
          readme_length?: number
          readme_sections?: Json
          recommendations?: Json
          repo_name?: string
          repo_url?: string
          risk_level?: string
          risk_reasons?: Json
          risk_score?: number
          score?: number
          score_explanations?: Json
          stars?: number
          structure_score?: number
          summary?: string
          watchers?: number
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
