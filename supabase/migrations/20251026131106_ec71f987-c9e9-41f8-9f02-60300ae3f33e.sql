-- Add family_member_id to transactions to attribute income/expense per family member
ALTER TABLE public.transactions
ADD COLUMN IF NOT EXISTS family_member_id uuid NULL;

-- Add foreign key constraint to family_members table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1
    FROM information_schema.table_constraints tc
    WHERE tc.constraint_name = 'transactions_family_member_id_fkey'
  ) THEN
    ALTER TABLE public.transactions
    ADD CONSTRAINT transactions_family_member_id_fkey
    FOREIGN KEY (family_member_id)
    REFERENCES public.family_members (id)
    ON DELETE SET NULL;
  END IF;
END $$;

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_transactions_user_family ON public.transactions (user_id, family_member_id);
CREATE INDEX IF NOT EXISTS idx_transactions_timestamp ON public.transactions (timestamp);
CREATE INDEX IF NOT EXISTS idx_transactions_type ON public.transactions (type);
