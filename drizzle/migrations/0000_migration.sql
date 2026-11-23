-- Shared updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS trigger LANGUAGE plpgsql SET search_path = public AS $$
BEGIN NEW.updated_at = now(); RETURN NEW; END; $$;

-- STUDENTS
CREATE TABLE public.students (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  name text NOT NULL,
  birth_date date,
  cpf text,
  sex text,
  phone text,
  email text,
  height_cm numeric,
  lesson_value numeric,
  package_value numeric,
  billing text NOT NULL DEFAULT 'mensal',
  absence_rule text NOT NULL DEFAULT 'repor',
  payment_timing text NOT NULL DEFAULT 'antecipado',
  notes text,
  active boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT students_billing_chk CHECK (billing IN ('aula','mensal')),
  CONSTRAINT students_absence_chk CHECK (absence_rule IN ('cobrar','nao_cobrar','repor')),
  CONSTRAINT students_timing_chk CHECK (payment_timing IN ('antecipado','fim_mes','por_aula')),
  CONSTRAINT students_name_len CHECK (char_length(name) BETWEEN 1 AND 200)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.students TO authenticated;
GRANT ALL ON public.students TO service_role;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads students" ON public.students FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner inserts students" ON public.students FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner updates students" ON public.students FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid());
CREATE POLICY "Owner deletes students" ON public.students FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX students_owner_idx ON public.students(owner_id);
CREATE TRIGGER students_updated BEFORE UPDATE ON public.students FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- Helper: does a student belong to the caller?
CREATE OR REPLACE FUNCTION public.owns_student(_student_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT _student_id IS NULL OR EXISTS (SELECT 1 FROM public.students WHERE id = _student_id AND owner_id = auth.uid())
$$;
REVOKE ALL ON FUNCTION public.owns_student(uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.owns_student(uuid) TO authenticated;

-- LESSONS (aulas e frequência)
CREATE TABLE public.lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  lesson_date date NOT NULL DEFAULT CURRENT_DATE,
  start_time time,
  end_time time,
  status text NOT NULL DEFAULT 'realizada',
  performance text,
  muscle_groups text[] NOT NULL DEFAULT '{}',
  value numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT lessons_status_chk CHECK (status IN ('realizada','falta','cancelada','reposta','agendada')),
  CONSTRAINT lessons_perf_chk CHECK (performance IS NULL OR performance IN ('Bom','Médio','Ruim'))
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.lessons TO authenticated;
GRANT ALL ON public.lessons TO service_role;
ALTER TABLE public.lessons ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads lessons" ON public.lessons FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner inserts lessons" ON public.lessons FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.owns_student(student_id));
CREATE POLICY "Owner updates lessons" ON public.lessons FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND public.owns_student(student_id));
CREATE POLICY "Owner deletes lessons" ON public.lessons FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX lessons_owner_date_idx ON public.lessons(owner_id, lesson_date DESC);
CREATE INDEX lessons_student_idx ON public.lessons(student_id);
CREATE TRIGGER lessons_updated BEFORE UPDATE ON public.lessons FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- ASSESSMENTS (avaliações físicas)
CREATE TABLE public.assessments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  assessment_date date NOT NULL DEFAULT CURRENT_DATE,
  height_cm numeric,
  weight_kg numeric,
  body_fat_pct numeric,
  muscle_pct numeric,
  bmr_kcal numeric,
  visceral_fat numeric,
  waist_cm numeric,
  hip_cm numeric,
  chest_cm numeric,
  arm_cm numeric,
  thigh_cm numeric,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.assessments TO authenticated;
GRANT ALL ON public.assessments TO service_role;
ALTER TABLE public.assessments ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads assessments" ON public.assessments FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner inserts assessments" ON public.assessments FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.owns_student(student_id));
CREATE POLICY "Owner updates assessments" ON public.assessments FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND public.owns_student(student_id));
CREATE POLICY "Owner deletes assessments" ON public.assessments FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX assessments_owner_date_idx ON public.assessments(owner_id, assessment_date DESC);
CREATE INDEX assessments_student_idx ON public.assessments(student_id);
CREATE TRIGGER assessments_updated BEFORE UPDATE ON public.assessments FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- TRANSACTIONS (receitas e despesas)
CREATE TABLE public.transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id uuid NOT NULL DEFAULT auth.uid(),
  kind text NOT NULL DEFAULT 'receita',
  student_id uuid REFERENCES public.students(id) ON DELETE SET NULL,
  tx_date date NOT NULL DEFAULT CURRENT_DATE,
  competence text,
  amount numeric NOT NULL,
  method text,
  category text,
  description text,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT transactions_kind_chk CHECK (kind IN ('receita','despesa')),
  CONSTRAINT transactions_amount_chk CHECK (amount > 0)
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.transactions TO authenticated;
GRANT ALL ON public.transactions TO service_role;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Owner reads transactions" ON public.transactions FOR SELECT TO authenticated USING (owner_id = auth.uid());
CREATE POLICY "Owner inserts transactions" ON public.transactions FOR INSERT TO authenticated WITH CHECK (owner_id = auth.uid() AND public.owns_student(student_id));
CREATE POLICY "Owner updates transactions" ON public.transactions FOR UPDATE TO authenticated USING (owner_id = auth.uid()) WITH CHECK (owner_id = auth.uid() AND public.owns_student(student_id));
CREATE POLICY "Owner deletes transactions" ON public.transactions FOR DELETE TO authenticated USING (owner_id = auth.uid());
CREATE INDEX transactions_owner_date_idx ON public.transactions(owner_id, tx_date DESC);
CREATE INDEX transactions_student_idx ON public.transactions(student_id);
CREATE TRIGGER transactions_updated BEFORE UPDATE ON public.transactions FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();