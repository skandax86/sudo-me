-- Add onboarding-related columns to profiles table
-- These columns are needed for the onboarding flow to work correctly

-- Add onboarding_complete flag
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE;

-- Add preferences (stores user's onboarding selections)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}';

-- Add generated_plan (stores the AI-generated or fallback plan)
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS generated_plan JSONB DEFAULT NULL;

-- Add comment for documentation
COMMENT ON COLUMN public.profiles.onboarding_complete IS 'Whether the user has completed the onboarding flow';
COMMENT ON COLUMN public.profiles.preferences IS 'User preferences collected during onboarding (focus areas, goals, schedule, etc.)';
COMMENT ON COLUMN public.profiles.generated_plan IS 'The transformation plan generated for the user (daily habits, routines, milestones)';

