-- Create reports table
CREATE TABLE public.reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  ign TEXT NOT NULL,
  uid TEXT NOT NULL,
  hack_type TEXT NOT NULL,
  description TEXT NOT NULL,
  proof_urls TEXT[] DEFAULT '{}',
  upvotes INTEGER DEFAULT 0,
  downvotes INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create votes table to track user votes
CREATE TABLE public.votes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
  user_fingerprint TEXT NOT NULL,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('upvote', 'downvote')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(report_id, user_fingerprint)
);

-- Create storage bucket for proof files
INSERT INTO storage.buckets (id, name, public) VALUES ('proof-files', 'proof-files', true);

-- Enable Row Level Security
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.votes ENABLE ROW LEVEL SECURITY;

-- Create policies for reports (public read, anyone can insert)
CREATE POLICY "Reports are viewable by everyone" 
ON public.reports 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create reports" 
ON public.reports 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Anyone can update report votes" 
ON public.reports 
FOR UPDATE 
USING (true);

-- Create policies for votes
CREATE POLICY "Votes are viewable by everyone" 
ON public.votes 
FOR SELECT 
USING (true);

CREATE POLICY "Anyone can create votes" 
ON public.votes 
FOR INSERT 
WITH CHECK (true);

CREATE POLICY "Users can update their own votes" 
ON public.votes 
FOR UPDATE 
USING (true);

-- Create policies for storage
CREATE POLICY "Proof files are publicly accessible" 
ON storage.objects 
FOR SELECT 
USING (bucket_id = 'proof-files');

CREATE POLICY "Anyone can upload proof files" 
ON storage.objects 
FOR INSERT 
WITH CHECK (bucket_id = 'proof-files');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_reports_updated_at
BEFORE UPDATE ON public.reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Create indexes for better performance
CREATE INDEX idx_reports_ign ON public.reports(ign);
CREATE INDEX idx_reports_uid ON public.reports(uid);
CREATE INDEX idx_reports_hack_type ON public.reports(hack_type);
CREATE INDEX idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX idx_votes_report_id ON public.votes(report_id);