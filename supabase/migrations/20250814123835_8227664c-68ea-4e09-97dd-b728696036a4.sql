-- Fix the function search path security issue by dropping dependent objects first
DROP TRIGGER IF EXISTS update_reports_updated_at ON public.reports;
DROP FUNCTION IF EXISTS public.update_updated_at_column();

-- Recreate the function with proper search path
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER
SECURITY DEFINER
SET search_path = public
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recreate the trigger
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();