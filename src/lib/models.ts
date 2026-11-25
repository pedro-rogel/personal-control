export interface Student {
  id: string;
  owner_id: string;
  name: string;
  birth_date: string | null;
  cpf: string | null;
  sex: string | null;
  phone: string | null;
  email: string | null;
  height_cm: number | null;
  lesson_value: number | null;
  package_value: number | null;
  billing: string;
  absence_rule: string;
  payment_timing: string;
  notes: string | null;
  active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Lesson {
  id: string;
  owner_id: string;
  student_id: string | null;
  lesson_date: string;
  start_time: string | null;
  end_time: string | null;
  status: string;
  performance: string | null;
  muscle_groups: string[];
  value: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Assessment {
  id: string;
  owner_id: string;
  student_id: string | null;
  assessment_date: string;
  height_cm: number | null;
  weight_kg: number | null;
  body_fat_pct: number | null;
  muscle_pct: number | null;
  bmr_kcal: number | null;
  visceral_fat: number | null;
  waist_cm: number | null;
  hip_cm: number | null;
  chest_cm: number | null;
  arm_cm: number | null;
  thigh_cm: number | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export interface Transaction {
  id: string;
  owner_id: string;
  kind: string;
  student_id: string | null;
  tx_date: string;
  competence: string | null;
  amount: number;
  method: string | null;
  category: string | null;
  description: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
}

export type TableName = "students" | "lessons" | "assessments" | "transactions";
export type RowByTable = {
  students: Student;
  lessons: Lesson;
  assessments: Assessment;
  transactions: Transaction;
};
export type Tables<T extends TableName> = RowByTable[T];

type InsertFields<T> = Partial<Omit<T, "id" | "owner_id" | "created_at" | "updated_at">> & {
  id?: string;
};
export type TablesInsert<T extends TableName> = T extends "students"
  ? InsertFields<Student> & Pick<Student, "name">
  : T extends "transactions"
    ? InsertFields<Transaction> & Pick<Transaction, "amount">
    : InsertFields<RowByTable[T]>;
