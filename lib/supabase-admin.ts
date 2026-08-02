import "server-only";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

console.log(process.env.SUPABASE_SERVICE_ROLE_KEY ? "Service Role Loaded" : "Service Role Missing");




// Fail fast: Ensure the app crashes immediately during initialization
// if required environment variables are missing, instead of failing with mysterious errors later.
if (!supabaseUrl) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL environment variable");
}

if (!supabaseServiceRoleKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY environment variable");
}

export const supabaseAdmin = createClient(
    supabaseUrl,
    supabaseServiceRoleKey
);
