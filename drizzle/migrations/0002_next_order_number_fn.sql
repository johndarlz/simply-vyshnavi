CREATE OR REPLACE FUNCTION public.next_order_number()
RETURNS text LANGUAGE sql VOLATILE SECURITY DEFINER SET search_path = public AS $$
  SELECT 'VC' || to_char(now() AT TIME ZONE 'Asia/Kolkata', 'YYYYMMDD')
    || lpad(nextval('public.order_number_seq')::text, 4, '0');
$$;
REVOKE ALL ON FUNCTION public.next_order_number() FROM public, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.next_order_number() TO service_role;