-- Grant PostgreSQL-level table permissions
-- Required in addition to RLS policies

GRANT SELECT ON TABLE public.shop_items    TO anon;
GRANT ALL    ON TABLE public.shop_items    TO authenticated;

GRANT SELECT ON TABLE public.projects      TO anon;
GRANT ALL    ON TABLE public.projects      TO authenticated;

GRANT INSERT ON TABLE public.contact_submissions TO anon;
GRANT ALL    ON TABLE public.contact_submissions TO authenticated;
