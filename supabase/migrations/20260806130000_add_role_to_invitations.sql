-- Add role column to trip_invitations table
ALTER TABLE public.trip_invitations
ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'viewer' CHECK (role IN ('editor', 'viewer'));
