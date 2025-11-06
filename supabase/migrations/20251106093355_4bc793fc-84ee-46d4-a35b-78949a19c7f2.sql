-- Create bills table for payment reminders
CREATE TABLE IF NOT EXISTS public.bills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  bill_name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  currency TEXT DEFAULT 'INR',
  due_date DATE NOT NULL,
  category TEXT NOT NULL,
  frequency TEXT NOT NULL CHECK (frequency IN ('one-time', 'weekly', 'monthly', 'quarterly', 'yearly')),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'paid', 'overdue', 'cancelled')),
  reminder_days_before INTEGER DEFAULT 3,
  auto_pay BOOLEAN DEFAULT false,
  notes TEXT,
  merchant TEXT,
  payment_method TEXT,
  last_paid_date DATE,
  next_due_date DATE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.bills ENABLE ROW LEVEL SECURITY;

-- RLS Policies for bills
CREATE POLICY "Users can manage own bills"
  ON public.bills
  FOR ALL
  USING (auth.uid() = user_id);

-- Add index for faster queries
CREATE INDEX idx_bills_user_due_date ON public.bills(user_id, due_date);
CREATE INDEX idx_bills_status ON public.bills(status);

-- Create trigger for updated_at
CREATE TRIGGER update_bills_updated_at
  BEFORE UPDATE ON public.bills
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Add IP hash column to user_activity_logs if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'user_activity_logs' AND column_name = 'ip_hash'
  ) THEN
    ALTER TABLE public.user_activity_logs ADD COLUMN ip_hash TEXT;
  END IF;
END $$;

-- Add IP hash column to page_analytics if not exists
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'page_analytics' AND column_name = 'ip_hash'
  ) THEN
    ALTER TABLE public.page_analytics ADD COLUMN ip_hash TEXT;
  END IF;
END $$;