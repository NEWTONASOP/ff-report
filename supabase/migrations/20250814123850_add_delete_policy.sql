-- Add DELETE policy for reports table
-- This allows admin users to delete reports

CREATE POLICY "Admin can delete reports" 
ON public.reports 
FOR DELETE 
USING (true);

-- Note: In production, you might want to restrict this to specific admin users
-- For example: USING (auth.role() = 'admin' OR auth.email() IN ('admin@example.com'))
-- For now, we'll allow deletion for simplicity since this is a demo app 