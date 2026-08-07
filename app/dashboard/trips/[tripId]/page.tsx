import { notFound } from "next/navigation";
import Link from "next/link";
import { getTripById, getTripMembers, getTripInvitations, getExpenseSummary, getExpenseCategorySummary, getTripBalances, getSettlementPlan } from "@/lib/trips";
import { getTripExpenses } from "@/lib/expenses";
import { DeleteTripButton } from "@/components/dashboard/delete-trip-button";
import { currentUser } from "@clerk/nextjs/server";
import { supabaseAdmin } from "@/lib/supabase-admin";
import { TripMembersSection } from "@/components/dashboard/trip-members-section";
import { ExpenseListSection } from "@/components/dashboard/expense-list-section";
import { ExpenseSummaryDashboard } from "@/components/dashboard/expense-summary-dashboard";
import { TripBalancesSection } from "@/components/dashboard/trip-balances-section";
import { SettlementPlanSection } from "@/components/dashboard/settlement-plan-section";
import { AIItinerarySection } from "@/components/dashboard/ai-itinerary-section";
import { TripMap } from "@/components/dashboard/trip-map";
import { RealtimeSync } from "@/components/dashboard/realtime-sync";
import {
    ArrowLeft,
    Calendar,
    MapPin,
    Wallet,
    Users,
    Receipt,
    Sparkles,
    Edit2,
    Clock,
    FileText,
    Plus,
} from "lucide-react";

interface PageProps {
    params: Promise<{ tripId: string }>;
}

const statusStyles: Record<string, { bg: string; text: string; label: string }> = {
    planning: {
        bg: "bg-amber-500/10 text-amber-500 border-amber-500/20",
        text: "text-amber-500",
        label: "Planning",
    },
    upcoming: {
        bg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
        text: "text-emerald-500",
        label: "Upcoming",
    },
    completed: {
        bg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        text: "text-slate-500",
        label: "Completed",
    },
};

function formatBudget(budget: number | null | undefined, currency: string | undefined) {
    if (budget === null || budget === undefined) return "No Budget Set";
    try {
        return new Intl.NumberFormat("en-IN", {
            style: "currency",
            currency: currency || "INR",
            maximumFractionDigits: 0,
        }).format(budget);
    } catch {
        return `${currency || "INR"} ${budget}`;
    }
}

function formatDate(dateStr: string) {
    try {
        return new Date(dateStr).toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export default async function TripDetailPage({ params }: PageProps) {
    const { tripId } = await params;
    const trip = await getTripById(tripId);

    if (!trip) {
        notFound();
    }

    const user = await currentUser();
    if (!user) notFound();

    const { data: profile } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .eq("clerk_user_id", user.id)
        .single();

    if (!profile) notFound();

    const isOwner = trip.profile_id === profile.id;
    const members = await getTripMembers(trip.id);
    const invitations = await getTripInvitations(trip.id);
    const expenses = await getTripExpenses(trip.id);
    const summary = await getExpenseSummary(trip.id, members.length);
    const categorySummary = await getExpenseCategorySummary(trip.id);
    const balances = await getTripBalances(trip.id);
    const settlementPlan = await getSettlementPlan(trip.id);

    const statusInfo = statusStyles[trip.status] || {
        bg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
        text: "text-slate-500",
        label: trip.status,
    };

    return (
        <div className="space-y-8 py-6 max-w-5xl mx-auto">
            {/* Back Button */}
            <div>
                <Link
                    href="/dashboard"
                    className="inline-flex items-center gap-2 text-sm font-medium text-muted-foreground hover:text-foreground transition"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Dashboard
                </Link>
            </div>

            {/* Header section */}
            <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-3">
                    <div className="flex items-center gap-3 flex-wrap">
                        <h1 className="text-3xl font-bold text-foreground">
                            {trip.title}
                        </h1>
                        <span
                            className={`rounded-full px-3 py-1 text-xs font-semibold border ${statusInfo.bg}`}
                        >
                            {statusInfo.label}
                        </span>
                        <RealtimeSync tripId={trip.id} />
                    </div>

                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-6 gap-y-2 text-sm text-muted-foreground">
                        <span className="flex items-center gap-2">
                            <MapPin className="h-4 w-4 text-primary" />
                            {trip.destination}
                        </span>
                        <span className="flex items-center gap-2">
                            <Calendar className="h-4 w-4 text-primary" />
                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                        </span>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <Link
                        href={`/dashboard/trips/${trip.id}/expenses/new`}
                        className="flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground hover:bg-primary/95 rounded-lg transition text-sm font-medium"
                    >
                        <Plus className="h-4 w-4" />
                        Add Expense
                    </Link>
                    <Link
                        href={`/dashboard/trips/${trip.id}/edit`}
                        className="flex items-center gap-2 px-4 py-2 border border-border rounded-lg bg-card text-foreground hover:bg-muted/40 hover:border-primary/30 transition text-sm font-medium"
                    >
                        <Edit2 className="h-4 w-4" />
                        Edit Details
                    </Link>
                    <DeleteTripButton tripId={trip.id} tripTitle={trip.title} />
                </div>
            </div>

            {/* Expense Summary Dashboard */}
            <ExpenseSummaryDashboard
                summary={summary}
                categorySummary={categorySummary}
                currency={trip.currency}
            />

            {/* Trip Balances Section */}
            <TripBalancesSection balances={balances} currency={trip.currency} />

            {/* Settlement Plan Section */}
            <SettlementPlanSection tripId={trip.id} plan={settlementPlan} currency={trip.currency} />

            {/* Main content grid */}
            <div className="grid gap-8 md:grid-cols-3">
                {/* Left Columns (Details & Description) */}
                <div className="md:col-span-2 space-y-6">
                    {/* Description card */}
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <FileText className="h-5 w-5 text-primary/70" />
                            Trip Description
                        </h2>
                        <p className="text-muted-foreground whitespace-pre-wrap leading-relaxed">
                            {trip.description || "No description provided for this trip yet."}
                        </p>
                    </div>

                    {/* Interactive Map */}
                    <div id="interactive-map" className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-xl font-semibold text-foreground flex items-center gap-2">
                            <MapPin className="h-5 w-5 text-primary/70" />
                            Interactive Map
                        </h2>
                        <TripMap destination={trip.destination} tripTitle={trip.title} tripId={trip.id} />
                    </div>

                    {/* AI Itinerary Planner section */}
                    <div id="ai-itinerary-planner">
                        <AIItinerarySection trip={trip} />
                    </div>

                    {/* Quick Tools Placeholder Dashboard */}
                    <div className="grid gap-4 sm:grid-cols-2">
                        <a
                            href="#trip-members"
                            className="flex items-center gap-4 bg-card border border-border p-5 rounded-xl hover:border-primary/40 hover:bg-muted/10 transition text-left cursor-pointer"
                        >
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Users className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Members</h3>
                                <p className="text-xs text-muted-foreground">Manage group & invites</p>
                            </div>
                        </a>

                        <Link
                            href={`/dashboard/trips/${trip.id}/expenses/new`}
                            className="flex items-center gap-4 bg-card border border-border p-5 rounded-xl hover:border-primary/40 hover:bg-muted/10 transition text-left cursor-pointer"
                        >
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Wallet className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Expenses</h3>
                                <p className="text-xs text-muted-foreground">Track splits & budget</p>
                            </div>
                        </Link>

                        <a
                            href="#ai-itinerary-planner"
                            className="flex items-center gap-4 bg-card border border-border p-5 rounded-xl hover:border-primary/40 hover:bg-muted/10 transition text-left cursor-pointer"
                        >
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Sparkles className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">AI Itinerary</h3>
                                <p className="text-xs text-muted-foreground">Generate day-wise plans</p>
                            </div>
                        </a>

                        <a
                            href="#expenses-section"
                            className="flex items-center gap-4 bg-card border border-border p-5 rounded-xl hover:border-primary/40 hover:bg-muted/10 transition text-left cursor-pointer"
                        >
                            <div className="p-3 bg-primary/10 rounded-lg">
                                <Receipt className="h-6 w-6 text-primary" />
                            </div>
                            <div>
                                <h3 className="font-semibold text-foreground">Receipts</h3>
                                <p className="text-xs text-muted-foreground">Store & scan trip bills</p>
                            </div>
                        </a>
                    </div>
                </div>

                {/* Right Column (Budget & Metadata) */}
                <div className="space-y-6">
                    {/* Budget Overview */}
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Budget Summary
                        </h2>
                        <div className="space-y-1">
                            <span className="text-3xl font-bold text-foreground">
                                {formatBudget(trip.budget, trip.currency)}
                            </span>
                            <p className="text-xs text-muted-foreground">
                                Allocated budget for all expenses and bookings.
                            </p>
                        </div>
                    </div>

                    {/* Metadata Card */}
                    <div className="bg-card border border-border p-6 rounded-xl shadow-sm space-y-4 text-sm">
                        <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                            Trip Timeline
                        </h2>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground flex items-center gap-1.5">
                                    <Clock className="h-4 w-4 text-primary/70" />
                                    Created
                                </span>
                                <span className="font-medium text-foreground">
                                    {formatDate(trip.created_at)}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Members Section */}
                    <div id="trip-members">
                        <TripMembersSection tripId={trip.id} isOwner={isOwner} initialMembers={members} initialInvitations={invitations} />
                    </div>

                    {/* Expenses Section */}
                    <div id="expenses-section">
                        <ExpenseListSection tripId={trip.id} expenses={expenses} totalMembers={members.length} />
                    </div>
                </div>
            </div>
        </div>
    );
}
