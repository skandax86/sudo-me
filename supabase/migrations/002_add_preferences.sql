-- Migration: Add user preferences and generated plan columns
-- Run this in Supabase SQL Editor

-- Add columns to profiles table for onboarding
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS onboarding_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS preferences JSONB DEFAULT '{}',
ADD COLUMN IF NOT EXISTS generated_plan JSONB DEFAULT NULL;

-- Add indexes for performance
CREATE INDEX IF NOT EXISTS idx_profiles_onboarding ON public.profiles(onboarding_complete);

-- Comment for clarity
COMMENT ON COLUMN public.profiles.preferences IS 'User onboarding preferences: motivation, goals, tracking areas, intensity, etc.';
COMMENT ON COLUMN public.profiles.generated_plan IS 'AI-generated personalized plan based on user preferences';
COMMENT ON COLUMN public.profiles.onboarding_complete IS 'Whether user has completed the onboarding flow';




