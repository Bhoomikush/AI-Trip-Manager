CREATE TABLE IF NOT EXISTS expense_shares (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    expense_id UUID NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
    amount NUMERIC(10,2) NOT NULL CHECK (amount > 0),
    is_settled BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_member_expense UNIQUE (expense_id, profile_id)
);

-- Enable Row Level Security
ALTER TABLE expense_shares ENABLE ROW LEVEL SECURITY;

-- Select policy
DROP POLICY IF EXISTS "Allow members to view expense shares" ON expense_shares;
CREATE POLICY "Allow members to view expense shares" ON expense_shares
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM expenses e
            JOIN trip_members tm ON tm.trip_id = e.trip_id
            JOIN profiles p ON p.id = tm.profile_id
            WHERE e.id = expense_shares.expense_id
            AND p.clerk_user_id = auth.uid()::text
        )
    );
