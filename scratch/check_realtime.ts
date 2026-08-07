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
    console.log("Checking tables in supabase_realtime publication...");
    const { data: pubTables, error: pubError } = await supabase.rpc("check_realtime_pub");
    if (pubError) {
        console.log("RPC call check_realtime_pub failed, falling back to direct SQL execution if possible or inspecting via query.");
        // Let's try running a direct query using postgres functions or check what tables are exposed
        // If we don't have a direct RPC, we can create one or we can query postgres schema if we have permission.
        // Let's execute a query via a custom function if one exists, or check using normal select.
    }
    
    // Let's try running a raw SQL query or check if we can query pg_publication_tables.
    // Note: Standard Supabase REST API does not allow arbitrary SELECT from pg_catalog tables, but let's see if we can do it:
    const { data, error } = await supabase.from("pg_publication_tables").select("*");
    console.log("pg_publication_tables query result:", { data, error });
}

main().catch(console.error);
