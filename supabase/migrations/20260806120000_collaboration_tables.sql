-- ==========================================
-- Create trip_members Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.trip_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    role TEXT NOT NULL CHECK (role IN ('owner', 'editor', 'viewer')),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_trip_profile UNIQUE (trip_id, profile_id)
);

-- ==========================================
-- Ensure Columns and Constraints exist on trip_members (e.g. for existing databases)
-- ==========================================

-- 1. Ensure user_id column exists
ALTER TABLE public.trip_members ADD COLUMN IF NOT EXISTS user_id TEXT REFERENCES public.profiles(clerk_user_id) ON DELETE CASCADE;

-- 2. Populate user_id for any existing members using their profile's clerk_user_id
UPDATE public.trip_members tm
SET user_id = p.clerk_user_id
FROM public.profiles p
WHERE tm.profile_id = p.id AND tm.user_id IS NULL;

-- 3. Set user_id to NOT NULL
ALTER TABLE public.trip_members ALTER COLUMN user_id SET NOT NULL;

-- 4. Ensure created_at column exists
ALTER TABLE public.trip_members ADD COLUMN IF NOT EXISTS created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now());

-- 5. Populate created_at for existing rows
UPDATE public.trip_members SET created_at = joined_at WHERE created_at IS NULL;

-- 6. Set created_at to NOT NULL
ALTER TABLE public.trip_members ALTER COLUMN created_at SET NOT NULL;

-- 7. Ensure unique_trip_user constraint exists
ALTER TABLE public.trip_members DROP CONSTRAINT IF EXISTS unique_trip_user;
ALTER TABLE public.trip_members ADD CONSTRAINT unique_trip_user UNIQUE (trip_id, user_id);

-- ==========================================
-- Create trip_invitations Table
-- ==========================================

CREATE TABLE IF NOT EXISTS public.trip_invitations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES public.trips(id) ON DELETE CASCADE,
    email TEXT NOT NULL,
    invited_by TEXT NOT NULL REFERENCES public.profiles(clerk_user_id) ON DELETE CASCADE,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'declined', 'expired')),
    expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- ==========================================
-- Helper Security Definer Functions
-- ==========================================

-- Check if a user is a member of a trip (bypasses RLS to avoid policy recursion)
CREATE OR REPLACE FUNCTION public.is_trip_member(target_trip_id UUID, target_user_id TEXT)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.trip_members
        WHERE trip_id = target_trip_id AND user_id = target_user_id
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Get a user's role on a trip
CREATE OR REPLACE FUNCTION public.get_trip_member_role(val_trip_id UUID, val_user_id TEXT)
RETURNS TEXT AS $$
DECLARE
    member_role TEXT;
BEGIN
    -- Check trip owner first
    SELECT 'owner' INTO member_role
    FROM public.trips t
    JOIN public.profiles p ON p.id = t.profile_id
    WHERE t.id = val_trip_id AND p.clerk_user_id = val_user_id;

    IF member_role IS NOT NULL THEN
        RETURN member_role;
    END IF;

    -- Check trip_members table
    SELECT role INTO member_role
    FROM public.trip_members
    WHERE trip_id = val_trip_id AND user_id = val_user_id;

    RETURN member_role;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==========================================
-- Trigger to Sync profile_id and user_id
-- ==========================================

CREATE OR REPLACE FUNCTION public.sync_trip_member_user_id()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.user_id IS NULL AND NEW.profile_id IS NOT NULL THEN
        SELECT clerk_user_id INTO NEW.user_id
        FROM public.profiles
        WHERE id = NEW.profile_id;
    ELSIF NEW.profile_id IS NULL AND NEW.user_id IS NOT NULL THEN
        SELECT id INTO NEW.profile_id
        FROM public.profiles
        WHERE clerk_user_id = NEW.user_id;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Ensure trigger exists
DROP TRIGGER IF EXISTS sync_trip_member_user_id_trigger ON public.trip_members;
CREATE TRIGGER sync_trip_member_user_id_trigger
BEFORE INSERT OR UPDATE ON public.trip_members
FOR EACH ROW
EXECUTE FUNCTION public.sync_trip_member_user_id();

-- ==========================================
-- Indexes for Fast Lookups
-- ==========================================

CREATE INDEX IF NOT EXISTS idx_trip_members_trip_id ON public.trip_members(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_profile_id ON public.trip_members(profile_id);
CREATE INDEX IF NOT EXISTS idx_trip_members_user_id ON public.trip_members(user_id);

CREATE INDEX IF NOT EXISTS idx_trip_invitations_trip_id ON public.trip_invitations(trip_id);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_email ON public.trip_invitations(email);
CREATE INDEX IF NOT EXISTS idx_trip_invitations_invited_by ON public.trip_invitations(invited_by);

-- ==========================================
-- Enable Row Level Security (RLS)
-- ==========================================

ALTER TABLE public.trip_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_invitations ENABLE ROW LEVEL SECURITY;

-- ==========================================
-- RLS Policies: trip_members
-- ==========================================

DROP POLICY IF EXISTS "Allow members to view trip members" ON public.trip_members;
CREATE POLICY "Allow members to view trip members" ON public.trip_members
    FOR SELECT
    USING (
        public.is_trip_member(trip_id, auth.uid()::text)
        OR
        EXISTS (
            SELECT 1 FROM public.trips t
            JOIN public.profiles p ON p.id = t.profile_id
            WHERE t.id = trip_members.trip_id
            AND p.clerk_user_id = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Allow owners to manage trip members" ON public.trip_members;
CREATE POLICY "Allow owners to manage trip members" ON public.trip_members
    FOR ALL
    USING (
        public.get_trip_member_role(trip_id, auth.uid()::text) = 'owner'
    );

-- ==========================================
-- RLS Policies: trip_invitations
-- ==========================================

DROP POLICY IF EXISTS "Allow members to view invitations" ON public.trip_invitations;
CREATE POLICY "Allow members to view invitations" ON public.trip_invitations
    FOR SELECT
    USING (
        public.is_trip_member(trip_id, auth.uid()::text)
        OR
        EXISTS (
            SELECT 1 FROM public.trips t
            JOIN public.profiles p ON p.id = t.profile_id
            WHERE t.id = trip_invitations.trip_id
            AND p.clerk_user_id = auth.uid()::text
        )
    );

DROP POLICY IF EXISTS "Allow invitee to view own invitations" ON public.trip_invitations;
CREATE POLICY "Allow invitee to view own invitations" ON public.trip_invitations
    FOR SELECT
    USING (
        email = (SELECT email FROM public.profiles WHERE clerk_user_id = auth.uid()::text)
    );

DROP POLICY IF EXISTS "Allow owners and editors to manage invitations" ON public.trip_invitations;
CREATE POLICY "Allow owners and editors to manage invitations" ON public.trip_invitations
    FOR ALL
    USING (
        public.get_trip_member_role(trip_id, auth.uid()::text) IN ('owner', 'editor')
    );

DROP POLICY IF EXISTS "Allow invitee to update own invitation status" ON public.trip_invitations;
CREATE POLICY "Allow invitee to update own invitation status" ON public.trip_invitations
    FOR UPDATE
    USING (
        email = (SELECT email FROM public.profiles WHERE clerk_user_id = auth.uid()::text)
    )
    WITH CHECK (
        email = (SELECT email FROM public.profiles WHERE clerk_user_id = auth.uid()::text)
        AND status IN ('accepted', 'declined')
    );
