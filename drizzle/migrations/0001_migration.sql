REVOKE ALL ON public.students, public.lessons, public.assessments, public.transactions FROM anon;
REVOKE ALL ON FUNCTION public.set_updated_at() FROM PUBLIC, anon;