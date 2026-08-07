import fs from "fs";
import path from "path";
import { createClient } from "@supabase/supabase-js";

try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, "utf-8");
        for (const line of envConfig.split("\n")) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
                const parts = trimmed.split("=");
                const key = parts[0].trim();
                const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
                process.env[key] = val;
            }
        }
    }
} catch (e) {}

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

const supabase = createClient(supabaseUrl!, supabaseServiceRoleKey!);

async function main() {
    console.log("Attempting to insert a mock invitation with a 'role' column...");
    const { data, error } = await supabase.from("trip_invitations").insert({
        trip_id: '0ac30aed-5220-40cd-85c4-865f77eb3b07', // valid trip UUID from earlier output
        email: 'test@example.com',
        invited_by: 'user_3HOf3uYEM3jOJUey0NJGD1iKTeQ', // valid clerk_user_id from earlier output
        role: 'editor',
        expires_at: new Date(Date.now() + 86400000).toISOString()
    }).select();

    console.log("Insert result:", { data, error });
}

main().catch(console.error);
