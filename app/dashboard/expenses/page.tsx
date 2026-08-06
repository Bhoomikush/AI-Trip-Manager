import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { ExpenseSummaryDashboard } from "@/components/dashboard/expense-summary-dashboard";
import { getTrips } from "@/lib/trips";

export default async function ExpensesPage() {
    const user = await currentUser();
    if (!user) return null;

    const trips = await getTrips();
    const tripIds = trips.map((t) => t.id);

    if (tripIds.length === 0) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
                <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight mb-2">Expenses</h2>
                <p className="text-sm text-muted-foreground">No expenses recorded yet. Plan a trip and add some expenses!</p>
            </div>
        );
    }

    // Fetch all expenses with category
    const { data: expenses } = await supabaseAdmin
        .from("expenses")
        .select("amount, category")
        .in("trip_id", tripIds);

    const totalExpenses = (expenses || []).reduce((sum, exp) => sum + Number(exp.amount), 0);
    const totalEntries = expenses?.length || 0;

    // Get total members across all trips
    const { data: members } = await supabaseAdmin
        .from("trip_members")
        .select("profile_id")
        .in("trip_id", tripIds);
    
    const uniqueMembers = new Set((members || []).map((m) => m.profile_id));
    const totalMembers = uniqueMembers.size || 1;

    const averagePerMember = totalMembers > 0 ? totalExpenses / totalMembers : 0;

    const summary = {
        totalExpenses,
        totalMembers,
        totalEntries,
        averagePerMember,
    };

    // Calculate category summary
    const categoryTotals: Record<string, number> = {};
    (expenses || []).forEach((exp) => {
        const cat = exp.category || "Other";
        categoryTotals[cat] = (categoryTotals[cat] || 0) + Number(exp.amount);
    });

    const categorySummary = Object.entries(categoryTotals).map(([category, totalAmount]) => ({
        category,
        totalAmount,
    })).sort((a, b) => b.totalAmount - a.totalAmount);

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">Expenses</h2>
                <p className="text-sm text-muted-foreground">Detailed overview of expenses across all your trips.</p>
            </div>
            <ExpenseSummaryDashboard summary={summary} categorySummary={categorySummary} currency="INR" />
        </div>
    );
}
