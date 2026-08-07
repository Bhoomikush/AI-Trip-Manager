-- ===========================================
-- Add receipt_url column to expenses table
-- ===========================================

ALTER TABLE public.expenses
ADD COLUMN IF NOT EXISTS receipt_url TEXT;

-- ===========================================
-- Create receipts bucket
-- ===========================================

INSERT INTO storage.buckets (id, name, public)
VALUES ('receipts', 'receipts', true)
-- We use insert and conflict check
ON CONFLICT (id) DO NOTHING;

-- ===========================================
-- Storage Policies
-- ===========================================

-- Allow trip members to upload receipts
DROP POLICY IF EXISTS "Allow trip members to upload receipts" ON storage.objects;
CREATE POLICY "Allow trip members to upload receipts"
ON storage.objects
FOR INSERT
TO authenticated
WITH CHECK (
    bucket_id = 'receipts'
    AND (
        EXISTS (
            SELECT 1
            FROM public.trips t
            JOIN public.profiles p
                ON p.id = t.profile_id
            WHERE t.id = split_part(name, '/', 1)::uuid
              AND p.clerk_user_id = auth.uid()::text
        )
        OR
        EXISTS (
            SELECT 1
            FROM public.trip_members tm
            JOIN public.profiles p
                ON p.id = tm.profile_id
            WHERE tm.trip_id = split_part(name, '/', 1)::uuid
              AND p.clerk_user_id = auth.uid()::text
        )
    )
);

-- Allow trip members to view receipts
DROP POLICY IF EXISTS "Allow trip members to view receipts" ON storage.objects;
CREATE POLICY "Allow trip members to view receipts"
ON storage.objects
FOR SELECT
TO authenticated
USING (
    bucket_id = 'receipts'
    AND (
        EXISTS (
            SELECT 1
            FROM public.trips t
            JOIN public.profiles p
                ON p.id = t.profile_id
            WHERE t.id = split_part(name, '/', 1)::uuid
              AND p.clerk_user_id = auth.uid()::text
        )
        OR
        EXISTS (
            SELECT 1
            FROM public.trip_members tm
            JOIN public.profiles p
                ON p.id = tm.profile_id
            WHERE tm.trip_id = split_part(name, '/', 1)::uuid
              AND p.clerk_user_id = auth.uid()::text
        )
    )
);

-- Allow trip members to delete receipts
DROP POLICY IF EXISTS "Allow trip members to delete receipts" ON storage.objects;
CREATE POLICY "Allow trip members to delete receipts"
ON storage.objects
FOR DELETE
TO authenticated
USING (
    bucket_id = 'receipts'
    AND (
        EXISTS (
            SELECT 1
            FROM public.trips t
            JOIN public.profiles p
                ON p.id = t.profile_id
            WHERE t.id = split_part(name, '/', 1)::uuid
              AND p.clerk_user_id = auth.uid()::text
        )
        OR
        EXISTS (
            SELECT 1
            FROM public.trip_members tm
            JOIN public.profiles p
                ON p.id = tm.profile_id
            WHERE tm.trip_id = split_part(name, '/', 1)::uuid
              AND p.clerk_user_id = auth.uid()::text
        )
    )
);
