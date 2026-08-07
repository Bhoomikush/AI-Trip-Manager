-- Enable Realtime for the required tables
alter publication supabase_realtime add table public.trip_members;
alter publication supabase_realtime add table public.trip_invitations;
alter publication supabase_realtime add table public.expenses;
alter publication supabase_realtime add table public.expense_shares;
alter publication supabase_realtime add table public.trip_itineraries;
