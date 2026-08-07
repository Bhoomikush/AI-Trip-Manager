-- Create trip_itineraries table
CREATE TABLE IF NOT EXISTS trip_itineraries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    trip_id UUID NOT NULL REFERENCES trips(id) ON DELETE CASCADE UNIQUE,
    summary TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Create trip_itinerary_days table
CREATE TABLE IF NOT EXISTS trip_itinerary_days (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    itinerary_id UUID NOT NULL REFERENCES trip_itineraries(id) ON DELETE CASCADE,
    day_number INTEGER NOT NULL,
    date DATE NOT NULL,
    activities JSONB NOT NULL,
    estimated_cost NUMERIC(10,2) NOT NULL DEFAULT 0.00,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
    CONSTRAINT unique_itinerary_day UNIQUE (itinerary_id, day_number)
);

-- Enable Row Level Security
ALTER TABLE trip_itineraries ENABLE ROW LEVEL SECURITY;
ALTER TABLE trip_itinerary_days ENABLE ROW LEVEL SECURITY;

-- Select policy for trip_itineraries
DROP POLICY IF EXISTS "Allow members to view itineraries" ON trip_itineraries;
CREATE POLICY "Allow members to view itineraries" ON trip_itineraries
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_members tm
            JOIN profiles p ON p.id = tm.profile_id
            WHERE tm.trip_id = trip_itineraries.trip_id
            AND p.clerk_user_id = auth.uid()::text
        )
    );

-- Manage policy (ALL) for trip_itineraries (only trip owner)
DROP POLICY IF EXISTS "Allow owners to manage itineraries" ON trip_itineraries;
CREATE POLICY "Allow owners to manage itineraries" ON trip_itineraries
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trips t
            JOIN profiles p ON p.id = t.profile_id
            WHERE t.id = trip_itineraries.trip_id
            AND p.clerk_user_id = auth.uid()::text
        )
    );

-- Select policy for trip_itinerary_days
DROP POLICY IF EXISTS "Allow members to view itinerary days" ON trip_itinerary_days;
CREATE POLICY "Allow members to view itinerary days" ON trip_itinerary_days
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM trip_itineraries ti
            JOIN trip_members tm ON tm.trip_id = ti.trip_id
            JOIN profiles p ON p.id = tm.profile_id
            WHERE ti.id = trip_itinerary_days.itinerary_id
            AND p.clerk_user_id = auth.uid()::text
        )
    );

-- Manage policy (ALL) for trip_itinerary_days (only trip owner)
DROP POLICY IF EXISTS "Allow owners to manage itinerary days" ON trip_itinerary_days;
CREATE POLICY "Allow owners to manage itinerary days" ON trip_itinerary_days
    FOR ALL
    USING (
        EXISTS (
            SELECT 1 FROM trip_itineraries ti
            JOIN trips t ON t.id = ti.trip_id
            JOIN profiles p ON p.id = t.profile_id
            WHERE ti.id = trip_itinerary_days.itinerary_id
            AND p.clerk_user_id = auth.uid()::text
        )
    );
