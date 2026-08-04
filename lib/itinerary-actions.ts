"use server";

import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase-admin";
import { TripItinerary, TripDay, TripActivity } from "@/types/ai";

/**
 * Helper to fetch the current user's profile ID from profiles table using Clerk userID.
 */
async function getCurrentUserProfileId(): Promise<string> {
    const user = await currentUser();
    if (!user) {
        throw new Error("Unauthorized: User is not authenticated.");
    }

    const { data: profile, error } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (error || !profile) {
        throw new Error("Unauthorized: Profile not found.");
    }

    return profile.id;
}

/**
 * Helper to verify if the user is a member of the trip.
 */
async function verifyTripMember(tripId: string, profileId: string): Promise<void> {
    const { data: member, error } = await supabaseAdmin
        .from("trip_members")
        .select("id")
        .eq("trip_id", tripId)
        .eq("profile_id", profileId)
        .single();

    if (error || !member) {
        throw new Error("Unauthorized: You are not a member of this trip.");
    }
}

/**
 * Helper to verify if the user is the owner of the trip.
 */
async function verifyTripOwner(tripId: string, profileId: string): Promise<void> {
    const { data: trip, error } = await supabaseAdmin
        .from("trips")
        .select("profile_id")
        .eq("id", tripId)
        .single();

    if (error || !trip) {
        throw new Error("Trip not found.");
    }

    if (trip.profile_id !== profileId) {
        throw new Error("Unauthorized: Only the trip owner can manage the itinerary.");
    }
}

/**
 * Fetches the saved itinerary for a given trip.
 * Only trip members are allowed.
 */
export async function getSavedItineraryAction(tripId: string): Promise<TripItinerary | null> {
    try {
        const profileId = await getCurrentUserProfileId();
        await verifyTripMember(tripId, profileId);

        // Fetch itinerary header
        const { data: itineraryHeader, error: headerErr } = await supabaseAdmin
            .from("trip_itineraries")
            .select("id, summary")
            .eq("trip_id", tripId)
            .single();

        if (headerErr || !itineraryHeader) {
            return null;
        }

        // Fetch itinerary days
        const { data: daysData, error: daysErr } = await supabaseAdmin
            .from("trip_itinerary_days")
            .select("day_number, date, activities")
            .eq("itinerary_id", itineraryHeader.id)
            .order("day_number", { ascending: true });

        if (daysErr || !daysData) {
            return null;
        }

        // Map database records to TripItinerary interface
        const days: TripDay[] = daysData.map((d) => ({
            day: d.day_number,
            date: d.date,
            activities: (d.activities as any) || [],
        }));

        // Fetch trip details for title
        const { data: tripData } = await supabaseAdmin
            .from("trips")
            .select("title")
            .eq("id", tripId)
            .single();

        return {
            tripTitle: tripData?.title || "Trip Itinerary",
            summary: itineraryHeader.summary || "",
            days,
        };
    } catch (err) {
        console.error("Error in getSavedItineraryAction:", err);
        return null;
    }
}

/**
 * Saves or updates the itinerary for a given trip.
 * Only the trip owner can save.
 */
export async function saveItineraryAction(tripId: string, itinerary: TripItinerary): Promise<{ success: boolean; error?: string }> {
    try {
        const profileId = await getCurrentUserProfileId();
        await verifyTripOwner(tripId, profileId);

        // 1. Check if itinerary header already exists
        const { data: existingHeader } = await supabaseAdmin
            .from("trip_itineraries")
            .select("id")
            .eq("trip_id", tripId)
            .single();

        let itineraryId = existingHeader?.id;

        if (itineraryId) {
            // Update summary
            const { error: headerUpdateErr } = await supabaseAdmin
                .from("trip_itineraries")
                .update({
                    summary: itinerary.summary,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", itineraryId);

            if (headerUpdateErr) throw headerUpdateErr;

            // Delete existing day activities before replacing them
            const { error: deleteDaysErr } = await supabaseAdmin
                .from("trip_itinerary_days")
                .delete()
                .eq("itinerary_id", itineraryId);

            if (deleteDaysErr) throw deleteDaysErr;
        } else {
            // Create new itinerary header
            const { data: newHeader, error: headerInsertErr } = await supabaseAdmin
                .from("trip_itineraries")
                .insert({
                    trip_id: tripId,
                    summary: itinerary.summary,
                })
                .select("id")
                .single();

            if (headerInsertErr || !newHeader) throw headerInsertErr || new Error("Failed to insert itinerary header.");
            itineraryId = newHeader.id;
        }

        // 2. Insert new days & activities
        const daysToInsert = itinerary.days.map((d) => ({
            itinerary_id: itineraryId,
            day_number: d.day,
            date: d.date,
            activities: JSON.stringify(d.activities),
            estimated_cost: d.activities.reduce((acc, act) => acc + (act.estimatedCost || 0), 0),
        }));

        const { error: daysInsertErr } = await supabaseAdmin
            .from("trip_itinerary_days")
            .insert(daysToInsert);

        if (daysInsertErr) throw daysInsertErr;

        return { success: true };
    } catch (err: any) {
        console.error("Error in saveItineraryAction:", err);
        return { success: false, error: err.message || "Failed to save itinerary." };
    }
}

/**
 * Deletes the itinerary for a given trip.
 * Only the trip owner can delete.
 */
export async function deleteItineraryAction(tripId: string): Promise<{ success: boolean; error?: string }> {
    try {
        const profileId = await getCurrentUserProfileId();
        await verifyTripOwner(tripId, profileId);

        const { error } = await supabaseAdmin
            .from("trip_itineraries")
            .delete()
            .eq("trip_id", tripId);

        if (error) throw error;

        return { success: true };
    } catch (err: any) {
        console.error("Error in deleteItineraryAction:", err);
        return { success: false, error: err.message || "Failed to delete itinerary." };
    }
}
export async function verifyItineraryOwnerAction(tripId: string): Promise<boolean> {
    try {
        const profileId = await getCurrentUserProfileId();
        const { data: trip } = await supabaseAdmin
            .from("trips")
            .select("profile_id")
            .eq("id", tripId)
            .single();

        return trip?.profile_id === profileId;
    } catch {
        return false;
    }
}
