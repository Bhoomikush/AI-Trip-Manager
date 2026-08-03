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

    // Insert owner into trip_members
    await supabaseAdmin
        .from("trip_members")
        .insert({
            trip_id: trip.id,
            profile_id: profile.id,
            role: "owner",
        });

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

export async function getTripById(tripId: string) {
    const user = await currentUser();
    if (!user) {
        return null;
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        return null;
    }

    const { data: trip, error: tripError } = await supabaseAdmin
        .from("trips")
        .select("*")
        .eq("id", tripId)
        .eq("profile_id", profile.id)
        .single();

    if (tripError || !trip) {
        return null;
    }

    return trip;
}

export interface UpdateTripInput {
    id: string;
    title: string;
    destination: string;
    description?: string;
    start_date: string;
    end_date: string;
    budget?: number;
    currency?: string;
    status: string;
}

export async function updateTrip(input: UpdateTripInput) {
    const user = await currentUser();
    if (!user) {
        throw new Error("You must be logged in to update a trip.");
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Could not find your user profile.");
    }

    const { data: trip, error: tripError } = await supabaseAdmin
        .from("trips")
        .update({
            title: input.title,
            destination: input.destination,
            description: input.description || null,
            start_date: input.start_date,
            end_date: input.end_date,
            budget: input.budget || null,
            currency: input.currency || "INR",
            status: input.status,
        })
        .eq("id", input.id)
        .eq("profile_id", profile.id)
        .select()
        .single();

    if (tripError || !trip) {
        console.error("Failed to update trip:", tripError);
        throw new Error(`Failed to update trip: ${tripError?.message || "Not found or access denied."}`);
    }

    revalidatePath("/dashboard");
    revalidatePath(`/dashboard/trips/${input.id}`);

    return trip;
}

export async function deleteTrip(tripId: string) {
    const user = await currentUser();
    if (!user) {
        throw new Error("You must be logged in to delete a trip.");
    }

    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Could not find your user profile.");
    }

    const { error: deleteError } = await supabaseAdmin
        .from("trips")
        .delete()
        .eq("id", tripId)
        .eq("profile_id", profile.id);

    if (deleteError) {
        console.error("Failed to delete trip:", deleteError);
        throw new Error(`Failed to delete trip: ${deleteError.message}`);
    }

    revalidatePath("/dashboard");
}

export async function getTripMembers(tripId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Not authenticated");

    const { data: currentProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (!currentProfile) throw new Error("User profile not found");

    const { data: trip, error: tripErr } = await supabaseAdmin
        .from("trips")
        .select("profile_id, title")
        .eq("id", tripId)
        .single();

    if (tripErr || !trip) throw new Error("Trip not found");

    const { data: membership } = await supabaseAdmin
        .from("trip_members")
        .select("id")
        .eq("trip_id", tripId)
        .eq("profile_id", currentProfile.id)
        .single();

    if (trip.profile_id !== currentProfile.id && !membership) {
        throw new Error("You do not have access to this trip's members.");
    }

    const { data: members, error: membersErr } = await supabaseAdmin
        .from("trip_members")
        .select(`
            id,
            role,
            joined_at,
            profile_id,
            profiles:profile_id (
                id,
                name,
                email,
                avatar_url
            )
        `)
        .eq("trip_id", tripId);

    if (membersErr) {
        console.error("Failed to fetch members:", membersErr);
        return [];
    }

    const typedMembers = (members || []) as any[];

    const hasOwner = typedMembers.some((m) => m.role === "owner" || m.profile_id === trip.profile_id);
    if (!hasOwner) {
        const { data: ownerProfile } = await supabaseAdmin
            .from("profiles")
            .select("id, name, email, avatar_url")
            .eq("id", trip.profile_id)
            .single();

        if (ownerProfile) {
            typedMembers.unshift({
                id: `owner-${ownerProfile.id}`,
                role: "owner",
                joined_at: new Date().toISOString(),
                profile_id: ownerProfile.id,
                profiles: ownerProfile
            });
        }
    }

    return typedMembers;
}

export async function addMember(tripId: string, email: string) {
    const user = await currentUser();
    if (!user) throw new Error("Not authenticated");

    const { data: currentProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (!currentProfile) throw new Error("User profile not found");

    const { data: trip } = await supabaseAdmin
        .from("trips")
        .select("profile_id")
        .eq("id", tripId)
        .single();

    if (!trip) throw new Error("Trip not found");

    if (trip.profile_id !== currentProfile.id) {
        throw new Error("Only the trip owner can invite members.");
    }

    const { data: targetProfile, error: targetError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("email", email.trim().toLowerCase())
        .single();

    if (targetError || !targetProfile) {
        throw new Error("No user found with this email address.");
    }

    if (targetProfile.id === trip.profile_id) {
        throw new Error("User is already the owner of this trip.");
    }

    const { data: existing } = await supabaseAdmin
        .from("trip_members")
        .select("id")
        .eq("trip_id", tripId)
        .eq("profile_id", targetProfile.id)
        .single();

    if (existing) {
        throw new Error("This user is already a member of the trip.");
    }

    const { error: insertError } = await supabaseAdmin
        .from("trip_members")
        .insert({
            trip_id: tripId,
            profile_id: targetProfile.id,
            role: "member",
        });

    if (insertError) {
        throw new Error(`Failed to add member: ${insertError.message}`);
    }

    revalidatePath(`/dashboard/trips/${tripId}`);
}

export async function removeMember(tripId: string, memberId: string) {
    const user = await currentUser();
    if (!user) throw new Error("Not authenticated");

    const { data: currentProfile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (!currentProfile) throw new Error("User profile not found");

    const { data: trip } = await supabaseAdmin
        .from("trips")
        .select("profile_id")
        .eq("id", tripId)
        .single();

    if (!trip) throw new Error("Trip not found");

    if (trip.profile_id !== currentProfile.id) {
        throw new Error("Only the trip owner can remove members.");
    }

    // Check if it is the owner row (we could get memberId which starts with "owner-" if it's the virtual owner row)
    if (memberId.startsWith("owner-")) {
        throw new Error("Cannot remove the owner of the trip.");
    }

    const { data: memberRecord } = await supabaseAdmin
        .from("trip_members")
        .select("role, profile_id")
        .eq("id", memberId)
        .single();

    if (!memberRecord) {
        throw new Error("Member record not found.");
    }

    if (memberRecord.role === "owner" || memberRecord.profile_id === trip.profile_id) {
        throw new Error("Cannot remove the owner of the trip.");
    }

    const { error: deleteError } = await supabaseAdmin
        .from("trip_members")
        .delete()
        .eq("id", memberId);

    if (deleteError) {
        throw new Error(`Failed to remove member: ${deleteError.message}`);
    }

    revalidatePath(`/dashboard/trips/${tripId}`);
}





