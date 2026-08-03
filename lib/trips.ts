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

export interface UpdateExpenseInput {
    id: string;
    title: string;
    amount: number;
    category: string;
    expenseDate: string;
}

const ALLOWED_CATEGORIES = [
    "Food",
    "Travel",
    "Accommodation",
    "Shopping",
    "Entertainment",
    "Transport",
    "Other",
];

export async function updateExpense(input: UpdateExpenseInput) {
    // 1. Verify Authentication
    const user = await currentUser();
    if (!user) throw new Error("You must be logged in to edit an expense.");

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Could not find your user profile.");
    }

    // 3. Fetch Expense
    const { data: expense, error: expenseError } = await supabaseAdmin
        .from("expenses")
        .select("*")
        .eq("id", input.id)
        .single();

    if (expenseError || !expense) {
        throw new Error("Expense not found.");
    }

    // 4. Fetch Trip details (to check trip owner)
    const { data: trip, error: tripError } = await supabaseAdmin
        .from("trips")
        .select("profile_id")
        .eq("id", expense.trip_id)
        .single();

    if (tripError || !trip) {
        throw new Error("Associated trip not found.");
    }

    // 5. Authorization: Only expense payer OR trip owner can edit
    const isPayer = expense.paid_by === profile.id;
    const isTripOwner = trip.profile_id === profile.id;

    if (!isPayer && !isTripOwner) {
        throw new Error("Access denied: Only the expense payer or the trip owner can edit this expense.");
    }

    // 6. Validation
    if (!input.title || !input.title.trim()) {
        throw new Error("Title is required.");
    }

    if (typeof input.amount !== "number" || input.amount <= 0) {
        throw new Error("Amount must be a positive number.");
    }

    if (!ALLOWED_CATEGORIES.includes(input.category)) {
        throw new Error(`Invalid category. Allowed values are: ${ALLOWED_CATEGORIES.join(", ")}`);
    }

    if (!input.expenseDate) {
        throw new Error("Expense date is required.");
    }

    // 7. Update
    const { data: updatedExpense, error: updateError } = await supabaseAdmin
        .from("expenses")
        .update({
            title: input.title.trim(),
            amount: input.amount,
            category: input.category,
            expense_date: input.expenseDate,
        })
        .eq("id", input.id)
        .select()
        .single();

    if (updateError || !updatedExpense) {
        console.error("Failed to update expense:", updateError);
        throw new Error(`Failed to update expense: ${updateError?.message || "Unknown error"}`);
    }

    // 8. Revalidate Cache
    revalidatePath(`/dashboard/trips/${expense.trip_id}`);

    return updatedExpense;
}

export async function deleteExpense(expenseId: string) {
    // 1. Verify Authentication
    const user = await currentUser();
    if (!user) throw new Error("You must be logged in to delete an expense.");

    // 2. Get user profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Could not find your user profile.");
    }

    // 3. Fetch Expense
    const { data: expense, error: expenseError } = await supabaseAdmin
        .from("expenses")
        .select("*")
        .eq("id", expenseId)
        .single();

    if (expenseError || !expense) {
        throw new Error("Expense not found or already deleted.");
    }

    // 4. Fetch Trip details (to check trip owner)
    const { data: trip, error: tripError } = await supabaseAdmin
        .from("trips")
        .select("profile_id")
        .eq("id", expense.trip_id)
        .single();

    if (tripError || !trip) {
        throw new Error("Associated trip not found.");
    }

    // 5. Authorization: Only expense payer OR trip owner can delete
    const isPayer = expense.paid_by === profile.id;
    const isTripOwner = trip.profile_id === profile.id;

    if (!isPayer && !isTripOwner) {
        throw new Error("Access denied: Only the expense payer or the trip owner can delete this expense.");
    }

    // 6. Delete
    const { error: deleteError } = await supabaseAdmin
        .from("expenses")
        .delete()
        .eq("id", expenseId);

    if (deleteError) {
        console.error("Failed to delete expense:", deleteError);
        throw new Error(`Failed to delete expense: ${deleteError.message}`);
    }

    // 7. Revalidate Cache
    revalidatePath(`/dashboard/trips/${expense.trip_id}`);
}

async function checkTripMembership(profileId: string, tripId: string): Promise<boolean> {
    const { data: trip, error: tripError } = await supabaseAdmin
        .from("trips")
        .select("profile_id")
        .eq("id", tripId)
        .single();

    if (tripError || !trip) return false;
    if (trip.profile_id === profileId) return true;

    const { data: membership, error: membershipError } = await supabaseAdmin
        .from("trip_members")
        .select("id")
        .eq("trip_id", tripId)
        .eq("profile_id", profileId)
        .single();

    if (membershipError || !membership) return false;
    return true;
}

export async function getExpenseSummary(tripId: string, totalMembers: number) {
    // 1. Authenticate user
    const user = await currentUser();
    if (!user) throw new Error("You must be logged in to access trip expenses.");

    // 2. Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Could not find your user profile.");
    }

    // 3. Verify membership
    const isMember = await checkTripMembership(profile.id, tripId);
    if (!isMember) {
        throw new Error("Access denied: You are not a member of this trip.");
    }

    // 4. Query expenses sum & entries count
    const { data: expensesData, error: expensesError } = await supabaseAdmin
        .from("expenses")
        .select("amount")
        .eq("trip_id", tripId);

    if (expensesError) {
        console.error("Failed to query expenses:", expensesError);
        throw new Error("Failed to query expenses.");
    }

    const totalEntries = expensesData.length;
    const totalExpenses = expensesData.reduce((sum, exp) => sum + exp.amount, 0);

    const averagePerMember = totalMembers > 0 ? totalExpenses / totalMembers : 0;

    return {
        totalExpenses,
        totalMembers,
        totalEntries,
        averagePerMember,
    };
}

export async function getExpenseCategorySummary(tripId: string) {
    // 1. Authenticate user
    const user = await currentUser();
    if (!user) throw new Error("You must be logged in to access trip expenses.");

    // 2. Get profile
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (profileError || !profile) {
        throw new Error("Could not find your user profile.");
    }

    // 3. Verify membership
    const isMember = await checkTripMembership(profile.id, tripId);
    if (!isMember) {
        throw new Error("Access denied: You are not a member of this trip.");
    }

    // 4. Query sums grouped by category
    const { data: categoriesData, error: categoriesError } = await supabaseAdmin
        .from("expenses")
        .select("category, amount")
        .eq("trip_id", tripId);

    if (categoriesError) {
        console.error("Failed to query category sums:", categoriesError);
        throw new Error("Failed to query category summary.");
    }

    // Process sums locally
    const sumsMap: Record<string, number> = {};
    categoriesData.forEach((exp) => {
        sumsMap[exp.category] = (sumsMap[exp.category] || 0) + exp.amount;
    });

    const result = Object.entries(sumsMap)
        .map(([category, totalAmount]) => ({
            category,
            totalAmount,
        }))
        .sort((a, b) => b.totalAmount - a.totalAmount);

    return result;
}

export interface MemberBalance {
    profileId: string;
    name: string;
    email: string;
    avatarUrl?: string | null;
    totalPaid: number;
    totalOwed: number;
    netBalance: number;
}

export async function getTripBalances(tripId: string): Promise<MemberBalance[]> {
    // 1. Verify Authentication
    const user = await currentUser();
    if (!user) throw new Error("You must be logged in to fetch balances.");

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
    const isMember = await checkTripMembership(profile.id, tripId);
    if (!isMember) {
        throw new Error("Access denied: You are not a member of this trip.");
    }

    // 4. Retrieve all trip members (including virtual owner check)
    // We reuse the existing getTripMembers logic to ensure consistency.
    const membersList = await getTripMembers(tripId);

    // 5. Retrieve all expenses for this trip
    const { data: expenses, error: expensesError } = await supabaseAdmin
        .from("expenses")
        .select("id, amount, paid_by")
        .eq("trip_id", tripId);

    if (expensesError) {
        console.error("Failed to fetch trip expenses:", expensesError);
        throw new Error("Failed to load expenses for balance calculation.");
    }

    // 6. Retrieve all expense shares for this trip's expenses
    const expenseIds = expenses.map((exp) => exp.id);
    let dbShares: any[] = [];
    
    if (expenseIds.length > 0) {
        const { data: sharesData, error: sharesError } = await supabaseAdmin
            .from("expense_shares")
            .select("amount, profile_id, expense_id, is_settled")
            .in("expense_id", expenseIds);

        if (sharesError) {
            console.error("Failed to fetch expense shares:", sharesError);
            throw new Error("Failed to load expense shares for balance calculation.");
        }
        dbShares = sharesData || [];
    }

    // Reconstruct list of shares, falling back to dynamic equal split virtual shares for legacy expenses
    const shares = expenses.flatMap((exp) => {
        const expenseShares = dbShares.filter((s) => s.expense_id === exp.id);
        if (expenseShares.length > 0) {
            return expenseShares;
        }
        // Fallback: split equally among all members
        const totalMembers = membersList.length;
        const shareAmount = totalMembers > 0 ? Math.round((exp.amount / totalMembers) * 100) / 100 : 0;
        return membersList.map((m) => ({
            expense_id: exp.id,
            profile_id: m.profile_id,
            amount: shareAmount,
            is_settled: false,
        }));
    });

    // 7. Calculate Total Paid, Total Owed, and Net Balance for each member
    const balances: MemberBalance[] = membersList.map((member) => {
        const profileId = member.profile_id;
        const memberProfile = member.profiles || { name: "Unknown Member", email: "" };

        // Definition: Total Paid is the sum of all expenses where the member is the payer,
        // minus any settled shares of OTHER members for those expenses (since those debts have been paid off/resolved).
        const memberExpenses = expenses.filter((exp) => exp.paid_by === profileId);
        const totalPaidRaw = memberExpenses.reduce((sum, exp) => {
            const settledOtherShares = shares.filter(
                (s) => s.expense_id === exp.id && s.profile_id !== profileId && s.is_settled
            );
            const totalSettled = settledOtherShares.reduce((sSum, s) => sSum + Number(s.amount), 0);
            return sum + Number(exp.amount) - totalSettled;
        }, 0);
        const totalPaid = Math.round(totalPaidRaw * 100) / 100;

        // Definition: Total Owed is the sum of all UNSETTLED expense_shares assigned to that member
        const memberShares = shares.filter((share) => share.profile_id === profileId && !share.is_settled);
        const totalOwedRaw = memberShares.reduce((sum, share) => sum + Number(share.amount), 0);
        const totalOwed = Math.round(totalOwedRaw * 100) / 100;

        // Definition: Net Balance is Total Paid - Total Owed
        const netBalance = Math.round((totalPaid - totalOwed) * 100) / 100;

        return {
            profileId,
            name: memberProfile.name,
            email: memberProfile.email,
            avatarUrl: memberProfile.avatar_url,
            totalPaid,
            totalOwed,
            netBalance,
        };
    });

    return balances;
}

export interface SettlementParty {
    id: string;
    name: string;
    avatarUrl?: string | null;
}

export interface SettlementTransaction {
    from: SettlementParty;
    to: SettlementParty;
    amount: number;
}

/**
 * Greedy Cash Flow Minimization Algorithm
 * ---------------------------------------
 * Calculates the minimum number of transactions needed to settle all balances.
 * 
 * Flow:
 * 1. Retrieve all member balances using getTripBalances(tripId).
 * 2. Maintain a list of temporary balances for simulation.
 * 3. In every iteration, find the largest debtor (most negative balance) and largest creditor (most positive balance).
 * 4. Create a transaction transferring the minimum of (debtor's absolute balance, creditor's balance).
 * 5. Update simulated balances and repeat until all balances are resolved (within a rounding tolerance of 0.01).
 */
export async function getSettlementPlan(tripId: string): Promise<SettlementTransaction[]> {
    // getTripBalances internally performs Clerk authentication and trip membership verification checks.
    const balances = await getTripBalances(tripId);

    // Create a mutable copy of balances to simulate transactions
    const simulationBalances = balances.map((b) => ({
        id: b.profileId,
        name: b.name,
        avatarUrl: b.avatarUrl,
        balance: b.netBalance,
    }));

    const transactions: SettlementTransaction[] = [];

    // Loop until all balances are settled
    while (true) {
        let debtorIdx = -1;
        let minVal = 0.01; // Threshold for ignoring negligible debtor balances

        let creditorIdx = -1;
        let maxVal = -0.01; // Threshold for ignoring negligible creditor balances

        // Find the absolute maximum debtor and creditor in this iteration
        for (let i = 0; i < simulationBalances.length; i++) {
            const bal = simulationBalances[i].balance;
            if (bal < minVal) {
                minVal = bal;
                debtorIdx = i;
            }
            if (bal > maxVal) {
                maxVal = bal;
                creditorIdx = i;
            }
        }

        // If no non-zero balances are left to settle, exit simulation
        if (debtorIdx === -1 || creditorIdx === -1 || Math.abs(minVal) < 0.01 || Math.abs(maxVal) < 0.01) {
            break;
        }

        const debtor = simulationBalances[debtorIdx];
        const creditor = simulationBalances[creditorIdx];

        // Settle the maximum possible amount between the two parties
        const amountToSettle = Math.min(-debtor.balance, creditor.balance);
        const roundedAmount = Math.round(amountToSettle * 100) / 100;

        if (roundedAmount > 0) {
            transactions.push({
                from: {
                    id: debtor.id,
                    name: debtor.name,
                    avatarUrl: debtor.avatarUrl,
                },
                to: {
                    id: creditor.id,
                    name: creditor.name,
                    avatarUrl: creditor.avatarUrl,
                },
                amount: roundedAmount,
            });
        }

        // Apply transaction changes to simulation balances
        debtor.balance = Math.round((debtor.balance + roundedAmount) * 100) / 100;
        creditor.balance = Math.round((creditor.balance - roundedAmount) * 100) / 100;
    }

    return transactions;
}

export async function settleUpTransaction(tripId: string, debtorId: string, creditorId: string) {
    // 1. Verify Authentication
    const user = await currentUser();
    if (!user) throw new Error("You must be logged in to settle payments.");

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
    const isMember = await checkTripMembership(profile.id, tripId);
    if (!isMember) {
        throw new Error("Access denied: You are not a member of this trip.");
    }

    // 4. Fetch all expenses for this trip paid by the creditor
    const { data: expenses, error: expensesError } = await supabaseAdmin
        .from("expenses")
        .select("id")
        .eq("trip_id", tripId)
        .eq("paid_by", creditorId);

    if (expensesError) {
        console.error("Failed to fetch creditor expenses:", expensesError);
        throw new Error("Failed to fetch expenses for settlement.");
    }

    const expenseIds = expenses.map((exp) => exp.id);
    if (expenseIds.length === 0) {
        throw new Error("No pending expenses found for this settlement.");
    }

    // 5. Update expense_shares belonging to the debtor for these expenses
    const { error: updateError } = await supabaseAdmin
        .from("expense_shares")
        .update({ is_settled: true })
        .eq("profile_id", debtorId)
        .in("expense_id", expenseIds)
        .eq("is_settled", false);

    if (updateError) {
        console.error("Failed to update expense shares:", updateError);
        throw new Error(`Failed to settle transactions: ${updateError.message}`);
    }

    // 6. Revalidate Cache
    revalidatePath(`/dashboard/trips/${tripId}`);
}





