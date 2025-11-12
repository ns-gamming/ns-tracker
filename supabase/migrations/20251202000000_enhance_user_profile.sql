
-- Ensure name column exists in users table
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS name TEXT;

-- Add display preferences for dashboard customization
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS dashboard_preferences JSONB DEFAULT '{
  "chartComplexity": "simple",
  "showAnimations": true,
  "chartTypes": {
    "incomeExpense": "area",
    "categoryBreakdown": "pie",
    "trends": "line",
    "performance": "composed"
  },
  "colorScheme": "default",
  "showGrid": true,
  "showLegend": true,
  "animationSpeed": "normal"
}'::jsonb;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_users_name ON public.users(name);
CREATE INDEX IF NOT EXISTS idx_users_dashboard_prefs ON public.users USING gin(dashboard_preferences);

-- Drop existing policy if it exists, then create new one
DROP POLICY IF EXISTS "Users can update own preferences" ON public.users;

-- Update RLS policies to ensure users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON public.users FOR UPDATE
TO authenticated
USING (auth.uid() = id)
WITH CHECK (auth.uid() = id);
