"use server";

import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "./supabase-admin";
import { revalidatePath } from "next/cache";

const ALLOWED_CATEGORIES = [
    "Food",
    "Travel",
    "Accommodation",
    "Shopping",
    "Entertainment",
    "Transport",
    "Other",
];

export interface CreateExpenseInput {
    tripId: string;
    title: string;
    amount: number;
    currency: string;
    category: string;
    expenseDate: string;
}

// Helper to check if a user profile is a member of the trip (owner or in trip_members)
async function verifyTripMembership(profileId: string, tripId: string): Promise<boolean> {
    // 1. Check if user is the trip owner
    const { data: trip, error: tripError } = await supabaseAdmin
        .from("trips")
        .select("profile_id")
        .eq("id", tripId)
        .single();

    if (tripError || !trip) return false;
    if (trip.profile_id === profileId) return true;

    // 2. Check if user is in trip_members
    const { data: membership, error: membershipError } = await supabaseAdmin
        .from("trip_members")
        .select("id")
        .eq("trip_id", tripId)
        .eq("profile_id", profileId)
        .single();

    if (membershipError || !membership) return false;
    return true;
}

export async function createExpense(input: CreateExpenseInput) {
    // 1. Verify Authentication
    const user = await currentUser();
    if (!user) throw new Error("You must be logged in to create an expense.");

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Could not find your user profile.");
    }

    // 3. Verify Trip Membership
    const isMember = await verifyTripMembership(profile.id, input.tripId);
    if (!isMember) {
        throw new Error("Access denied: You are not a member of this trip.");
    }

    // 4. Validation
    if (!input.title || !input.title.trim()) {
        throw new Error("Title is required.");
    }

    if (typeof input.amount !== "number" || input.amount <= 0) {
        throw new Error("Amount must be a positive number.");
    }

    if (!input.currency || input.currency.trim().length !== 3) {
        throw new Error("Currency must be a 3-character ISO code.");
    }

    if (!ALLOWED_CATEGORIES.includes(input.category)) {
        throw new Error(`Invalid category. Allowed values are: ${ALLOWED_CATEGORIES.join(", ")}`);
    }

    if (!input.expenseDate) {
        throw new Error("Expense date is required.");
    }

    // 5. Insert
    const { data: expense, error: insertError } = await supabaseAdmin
        .from("expenses")
        .insert({
            trip_id: input.tripId,
            paid_by: profile.id,
            title: input.title.trim(),
            amount: input.amount,
            currency: input.currency.toUpperCase(),
            category: input.category,
            expense_date: input.expenseDate,
        })
        .select()
        .single();

    if (insertError || !expense) {
        console.error("Failed to insert expense:", insertError);
        throw new Error(`Failed to save expense: ${insertError?.message || "Unknown error"}`);
    }

    // Create split shares equally among members
    await createExpenseShares(expense.id);

    // 6. Revalidate Cache
    revalidatePath(`/dashboard/trips/${input.tripId}`);

    return expense;
}

export async function getTripExpenses(tripId: string) {
    // 1. Verify Authentication
    const user = await currentUser();
    if (!user) return [];

    // 2. Get user profile
    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (!profile) return [];

    // 3. Verify Membership
    const isMember = await verifyTripMembership(profile.id, tripId);
    if (!isMember) return [];

    // 4. Fetch Expenses
    const { data: expenses, error: expensesError } = await supabaseAdmin
        .from("expenses")
        .select(`
            *,
            paid_by_profile:paid_by (
                id,
                name,
                email,
                avatar_url
            )
        `)
        .eq("trip_id", tripId)
        .order("expense_date", { ascending: false })
        .order("created_at", { ascending: false });

    if (expensesError) {
        console.error("Failed to fetch expenses:", expensesError);
        return [];
    }

    return expenses || [];
}

export async function getExpenseById(expenseId: string) {
    // 1. Verify Authentication
    const user = await currentUser();
    if (!user) return null;

    // 2. Get user profile
    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (!profile) return null;

    // 3. Fetch Expense
    const { data: expense, error: expenseError } = await supabaseAdmin
        .from("expenses")
        .select("*")
        .eq("id", expenseId)
        .single();

    if (expenseError || !expense) return null;

    // 4. Verify user belongs to the associated trip
    const isMember = await verifyTripMembership(profile.id, expense.trip_id);
    if (!isMember) return null;

    return expense;
}

export async function createExpenseShares(expenseId: string) {
    // 1. Fetch Expense
    const { data: expense, error: expenseError } = await supabaseAdmin
        .from("expenses")
        .select("trip_id, amount")
        .eq("id", expenseId)
        .single();

    if (expenseError || !expense) {
        throw new Error("Expense not found.");
    }

    // 2. Fetch Trip Members
    const { data: members, error: membersError } = await supabaseAdmin
        .from("trip_members")
        .select("profile_id")
        .eq("trip_id", expense.trip_id);

    if (membersError || !members || members.length === 0) {
        throw new Error("No trip members found to split expense.");
    }

    // 3. Calculate Split
    const totalMembers = members.length;
    const amount = expense.amount;
    const shareAmount = Math.round((amount / totalMembers) * 100) / 100;

    // 4. Create shares array
    const shares = members.map((member) => ({
        expense_id: expenseId,
        profile_id: member.profile_id,
        amount: shareAmount,
        is_settled: false,
    }));

    // 5. Insert shares
    const { error: insertSharesError } = await supabaseAdmin
        .from("expense_shares")
        .insert(shares);

    if (insertSharesError) {
        console.error("Failed to insert expense shares:", insertSharesError);
        throw new Error(`Failed to create expense shares: ${insertSharesError.message}`);
    }
}

export async function getExpenseShares(expenseId: string) {
    const { data: shares, error: sharesError } = await supabaseAdmin
        .from("expense_shares")
        .select(`
            *,
            profiles:profile_id (
                id,
                name,
                email,
                avatar_url
            )
        `)
        .eq("expense_id", expenseId);

    if (sharesError) {
        console.error("Failed to fetch expense shares:", sharesError);
        return [];
    }

    return shares || [];
}
