-- Fix RLS policy for trip_invitations to support Supabase Realtime with Clerk
-- Using auth.uid() fails in Realtime because Clerk user IDs (e.g. 'user_...') are not valid UUIDs.
-- This causes the Postgres UUID cast inside auth.uid() to throw an exception, dropping INSERT events.
-- We replace auth.uid()::text with nullif(current_setting('request.jwt.claim.sub', true), '') which safely extracts the Clerk ID as text.

DROP POLICY IF EXISTS "Allow members to view invitations" ON public.trip_invitations;
CREATE POLICY "Allow members to view invitations" ON public.trip_invitations
    FOR SELECT
    USING (
        public.is_trip_member(trip_id, nullif(current_setting('request.jwt.claim.sub', true), ''))
        OR
        EXISTS (
            SELECT 1 FROM public.trips t
            JOIN public.profiles p ON p.id = t.profile_id
            WHERE t.id = trip_invitations.trip_id
            AND p.clerk_user_id = nullif(current_setting('request.jwt.claim.sub', true), '')
        )
    );

DROP POLICY IF EXISTS "Allow invitee to view own invitations" ON public.trip_invitations;
CREATE POLICY "Allow invitee to view own invitations" ON public.trip_invitations
    FOR SELECT
    USING (
        email = (SELECT email FROM public.profiles WHERE clerk_user_id = nullif(current_setting('request.jwt.claim.sub', true), ''))
    );

DROP POLICY IF EXISTS "Allow owners and editors to manage invitations" ON public.trip_invitations;
CREATE POLICY "Allow owners and editors to manage invitations" ON public.trip_invitations
    FOR ALL
    USING (
        public.get_trip_member_role(trip_id, nullif(current_setting('request.jwt.claim.sub', true), '')) IN ('owner', 'editor')
    );

DROP POLICY IF EXISTS "Allow invitee to update own invitation status" ON public.trip_invitations;
CREATE POLICY "Allow invitee to update own invitation status" ON public.trip_invitations
    FOR UPDATE
    USING (
        email = (SELECT email FROM public.profiles WHERE clerk_user_id = nullif(current_setting('request.jwt.claim.sub', true), ''))
    )
    WITH CHECK (
        email = (SELECT email FROM public.profiles WHERE clerk_user_id = nullif(current_setting('request.jwt.claim.sub', true), ''))
        AND status IN ('accepted', 'declined')
    );
