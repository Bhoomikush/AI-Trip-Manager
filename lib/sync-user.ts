import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase-admin";

export async function syncUser() {
    console.log("[syncUser] Entering syncUser() function...");
    console.log("[syncUser] Supabase URL configured:", !!process.env.NEXT_PUBLIC_SUPABASE_URL);
    console.log("[syncUser] Supabase Key configured:", !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

    const user = await currentUser();
    console.log("[syncUser] Clerk currentUser result:", user ? `ID: ${user.id}` : "null (No user authenticated)");

    if (!user) return null;

    const payload = {
        clerk_user_id: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: user.primaryEmailAddress?.emailAddress ?? "",
        avatar_url: user.imageUrl,
    };
    console.log("[syncUser] Sending payload to Supabase profiles:", payload);

    const { data, error } = await supabaseAdmin
        .from("profiles")
        .upsert(
            payload,
            {
                onConflict: "clerk_user_id",
            }
        )
        .select()
        .single();

    console.log("[syncUser] Supabase result data:", data);
    console.log("[syncUser] Supabase result error:", error);

    if (error) {
        console.error("[syncUser] Throwing error due to Supabase failure:", error);
        throw error;
    }

    console.log("[syncUser] Sync completed successfully for:", data?.name);
    return data;
}