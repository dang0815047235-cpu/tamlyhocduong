CREATE OR REPLACE FUNCTION public.list_approved_counselors()
RETURNS TABLE (id uuid, display_name text)
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT p.id, p.display_name
  FROM public.profiles p
  JOIN public.teacher_requests tr ON tr.user_id = p.id
  WHERE tr.status = 'approved'
    AND public.has_role(p.id, 'teacher'::public.app_role)
  ORDER BY p.display_name, p.id;
$$;
REVOKE ALL ON FUNCTION public.list_approved_counselors() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.list_approved_counselors() FROM anon;
GRANT EXECUTE ON FUNCTION public.list_approved_counselors() TO authenticated;