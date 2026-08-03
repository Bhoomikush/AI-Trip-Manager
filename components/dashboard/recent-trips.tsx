import { ArrowRight, Calendar, MapPin, Wallet, Plus } from "lucide-react";
import Link from "next/link";

interface Trip {
    id: string;
    title: string;
    destination: string;
    description?: string | null;
    start_date: string;
    end_date: string;
    budget?: number | null;
    currency?: string;
    status: string;
}

interface RecentTripsProps {
    trips: Trip[];
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
    if (budget === null || budget === undefined) return "No Budget";
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
            month: "short",
            day: "numeric",
            year: "numeric",
        });
    } catch {
        return dateStr;
    }
}

export function RecentTrips({ trips }: RecentTripsProps) {
    const hasTrips = trips && trips.length > 0;

    return (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm flex flex-col h-full">
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        My Trips
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Continue planning your latest adventures.
                    </p>
                </div>
                {hasTrips && (
                    <Link
                        href="/dashboard/trips/new"
                        className="flex items-center gap-1 text-sm font-medium text-primary hover:underline"
                    >
                        Plan new trip
                        <ArrowRight className="h-4 w-4" />
                    </Link>
                )}
            </div>

            {/* Trip List / Empty State */}
            {!hasTrips ? (
                <div className="flex flex-col items-center justify-center text-center py-12 px-4 border border-dashed border-border rounded-lg bg-muted/20 flex-1">
                    <div className="rounded-full bg-primary/15 p-4 mb-4">
                        <Calendar className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="font-semibold text-lg text-foreground mb-1">
                        No trips planned yet
                    </h3>
                    <p className="text-sm text-muted-foreground max-w-sm mb-6">
                        Start your next group adventure by creating a new trip timeline and budget plan.
                    </p>
                    <Link
                        href="/dashboard/trips/new"
                        className="inline-flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground transition hover:bg-primary/95"
                    >
                        <Plus className="h-4 w-4" />
                        Create Trip
                    </Link>
                </div>
            ) : (
                <div className="space-y-4 max-h-[480px] overflow-y-auto pr-1">
                    {trips.map((trip) => {
                        const statusInfo = statusStyles[trip.status] || {
                            bg: "bg-slate-500/10 text-slate-500 border-slate-500/20",
                            text: "text-slate-500",
                            label: trip.status,
                        };

                        return (
                            <div
                                key={trip.id}
                                className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-lg border border-border p-4 transition-all hover:border-primary/30 hover:bg-muted/40"
                            >
                                <div className="space-y-2">
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <h3 className="font-semibold text-foreground text-base">
                                            {trip.title}
                                        </h3>
                                        <span
                                            className={`rounded-full px-2 py-0.5 text-xs font-semibold border ${statusInfo.bg}`}
                                        >
                                            {statusInfo.label}
                                        </span>
                                    </div>

                                    <div className="flex flex-col sm:flex-row sm:items-center gap-x-4 gap-y-1 text-sm text-muted-foreground">
                                        <span className="flex items-center gap-1">
                                            <MapPin className="h-3.5 w-3.5 text-primary/70" />
                                            {trip.destination}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Calendar className="h-3.5 w-3.5 text-primary/70" />
                                            {formatDate(trip.start_date)} - {formatDate(trip.end_date)}
                                        </span>
                                    </div>

                                    <div className="text-sm font-medium text-foreground flex items-center gap-1">
                                        <Wallet className="h-3.5 w-3.5 text-primary/70" />
                                        Budget: <span className="text-primary">{formatBudget(trip.budget, trip.currency)}</span>
                                    </div>
                                </div>

                                <div className="flex items-center justify-end sm:justify-start">
                                    <Link
                                        href={`/dashboard/trips/${trip.id}`}
                                        className="flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-2"
                                    >
                                        Open
                                        <ArrowRight className="h-4 w-4" />
                                    </Link>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </section>
    );
}