export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.18";
  };
  public: {
    Tables: {
      assessments: {
        Row: {
          arm_cm: number | null;
          assessment_date: string;
          bmr_kcal: number | null;
          body_fat_pct: number | null;
          chest_cm: number | null;
          created_at: string;
          height_cm: number | null;
          hip_cm: number | null;
          id: string;
          muscle_pct: number | null;
          notes: string | null;
          owner_id: string;
          student_id: string | null;
          thigh_cm: number | null;
          updated_at: string;
          visceral_fat: number | null;
          waist_cm: number | null;
          weight_kg: number | null;
        };
        Insert: {
          arm_cm?: number | null;
          assessment_date?: string;
          bmr_kcal?: number | null;
          body_fat_pct?: number | null;
          chest_cm?: number | null;
          created_at?: string;
          height_cm?: number | null;
          hip_cm?: number | null;
          id?: string;
          muscle_pct?: number | null;
          notes?: string | null;
          owner_id?: string;
          student_id?: string | null;
          thigh_cm?: number | null;
          updated_at?: string;
          visceral_fat?: number | null;
          waist_cm?: number | null;
          weight_kg?: number | null;
        };
        Update: {
          arm_cm?: number | null;
          assessment_date?: string;
          bmr_kcal?: number | null;
          body_fat_pct?: number | null;
          chest_cm?: number | null;
          created_at?: string;
          height_cm?: number | null;
          hip_cm?: number | null;
          id?: string;
          muscle_pct?: number | null;
          notes?: string | null;
          owner_id?: string;
          student_id?: string | null;
          thigh_cm?: number | null;
          updated_at?: string;
          visceral_fat?: number | null;
          waist_cm?: number | null;
          weight_kg?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "assessments_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      lessons: {
        Row: {
          created_at: string;
          end_time: string | null;
          id: string;
          lesson_date: string;
          muscle_groups: string[];
          notes: string | null;
          owner_id: string;
          performance: string | null;
          start_time: string | null;
          status: string;
          student_id: string | null;
          updated_at: string;
          value: number | null;
        };
        Insert: {
          created_at?: string;
          end_time?: string | null;
          id?: string;
          lesson_date?: string;
          muscle_groups?: string[];
          notes?: string | null;
          owner_id?: string;
          performance?: string | null;
          start_time?: string | null;
          status?: string;
          student_id?: string | null;
          updated_at?: string;
          value?: number | null;
        };
        Update: {
          created_at?: string;
          end_time?: string | null;
          id?: string;
          lesson_date?: string;
          muscle_groups?: string[];
          notes?: string | null;
          owner_id?: string;
          performance?: string | null;
          start_time?: string | null;
          status?: string;
          student_id?: string | null;
          updated_at?: string;
          value?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: "lessons_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
      students: {
        Row: {
          absence_rule: string;
          active: boolean;
          billing: string;
          birth_date: string | null;
          cpf: string | null;
          created_at: string;
          email: string | null;
          height_cm: number | null;
          id: string;
          lesson_value: number | null;
          name: string;
          notes: string | null;
          owner_id: string;
          package_value: number | null;
          payment_timing: string;
          phone: string | null;
          sex: string | null;
          updated_at: string;
        };
        Insert: {
          absence_rule?: string;
          active?: boolean;
          billing?: string;
          birth_date?: string | null;
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          height_cm?: number | null;
          id?: string;
          lesson_value?: number | null;
          name: string;
          notes?: string | null;
          owner_id?: string;
          package_value?: number | null;
          payment_timing?: string;
          phone?: string | null;
          sex?: string | null;
          updated_at?: string;
        };
        Update: {
          absence_rule?: string;
          active?: boolean;
          billing?: string;
          birth_date?: string | null;
          cpf?: string | null;
          created_at?: string;
          email?: string | null;
          height_cm?: number | null;
          id?: string;
          lesson_value?: number | null;
          name?: string;
          notes?: string | null;
          owner_id?: string;
          package_value?: number | null;
          payment_timing?: string;
          phone?: string | null;
          sex?: string | null;
          updated_at?: string;
        };
        Relationships: [];
      };
      transactions: {
        Row: {
          amount: number;
          category: string | null;
          competence: string | null;
          created_at: string;
          description: string | null;
          id: string;
          kind: string;
          method: string | null;
          notes: string | null;
          owner_id: string;
          student_id: string | null;
          tx_date: string;
          updated_at: string;
        };
        Insert: {
          amount: number;
          category?: string | null;
          competence?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          kind?: string;
          method?: string | null;
          notes?: string | null;
          owner_id?: string;
          student_id?: string | null;
          tx_date?: string;
          updated_at?: string;
        };
        Update: {
          amount?: number;
          category?: string | null;
          competence?: string | null;
          created_at?: string;
          description?: string | null;
          id?: string;
          kind?: string;
          method?: string | null;
          notes?: string | null;
          owner_id?: string;
          student_id?: string | null;
          tx_date?: string;
          updated_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: "transactions_student_id_fkey";
            columns: ["student_id"];
            isOneToOne: false;
            referencedRelation: "students";
            referencedColumns: ["id"];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      owns_student: { Args: { _student_id: string }; Returns: boolean };
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">;

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] & DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    keyof DefaultSchema["Tables"] | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    keyof DefaultSchema["Enums"] | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    keyof DefaultSchema["CompositeTypes"] | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {},
  },
} as const;
