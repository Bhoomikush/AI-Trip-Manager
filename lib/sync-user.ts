import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase-admin";

export async function syncUser() {
    const user = await currentUser();

    if (!user) return null;

    const payload = {
        clerk_user_id: user.id,
        name: `${user.firstName ?? ""} ${user.lastName ?? ""}`.trim(),
        email: user.primaryEmailAddress?.emailAddress ?? "",
        avatar_url: user.imageUrl,
    };

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

    if (error) {
        throw error;
    }

    return data;
}