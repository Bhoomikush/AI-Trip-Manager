"use server";

import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase-admin";
import { revalidatePath } from "next/cache";

// Define the structure of the data our form will submit
export interface CreateTripInput {
    title: string;
    destination: string;
    description?: string;
    start_date: string;
    end_date: string;
    budget?: number;
    currency?: string;
}

export async function createTrip(input: CreateTripInput) {
    // 1. Verify the user is authenticated with Clerk
    const user = await currentUser();
    if (!user) {
        throw new Error("You must be logged in to create a trip.");
    }

    // 2. Fetch the corresponding user profile ID from Supabase
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Could not find your user profile in the database.");
    }

    // 3. Insert the new trip into the database
    const { data: trip, error: tripError } = await supabaseAdmin
        .from("trips")
        .insert({
            profile_id: profile.id,
            title: input.title,
            destination: input.destination,
            description: input.description || null,
            start_date: input.start_date,
            end_date: input.end_date,
            budget: input.budget || null,
            currency: input.currency || "INR",
            status: "planning", // Defaults new trips to planning
        })
        .select()
        .single();

    if (tripError) {
        console.error("Failed to insert trip:", tripError);
        throw new Error(`Failed to save trip: ${tripError.message}`);
    }

    // 4. Force Next.js to reload the dashboard page cache with the new data
    revalidatePath("/dashboard");

    return trip;
}

export async function getTrips() {
    const user = await currentUser();
    if (!user) {
        return [];
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        return [];
    }

    const { data: trips, error: tripsError } = await supabaseAdmin
        .from("trips")
        .select("*")
        .eq("profile_id", profile.id)
        .order("created_at", { ascending: false });

    if (tripsError) {
        console.error("Error fetching trips:", tripsError);
        return [];
    }

    return trips;
}

