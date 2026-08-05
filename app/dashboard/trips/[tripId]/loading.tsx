import React from "react";

export default function TripDetailLoading() {
    return (
        <div className="space-y-8 py-6 max-w-5xl mx-auto animate-pulse p-1">
            {/* Back Button Skeleton */}
            <div className="h-4 w-32 bg-muted rounded" />

            {/* Header Skeleton */}
            <div className="flex flex-col md:flex-row justify-between gap-6 pb-6 border-b border-border">
                <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-3">
                        <div className="h-8 w-64 bg-muted rounded-lg" />
                        <div className="h-6 w-20 bg-muted rounded-full" />
                    </div>
                    <div className="flex gap-4">
                        <div className="h-4 w-40 bg-muted rounded" />
                        <div className="h-4 w-48 bg-muted rounded" />
                    </div>
                </div>
                <div className="flex gap-3 shrink-0">
                    <div className="h-10 w-28 bg-muted rounded-lg" />
                    <div className="h-10 w-28 bg-muted rounded-lg" />
                    <div className="h-10 w-28 bg-muted rounded-lg" />
                </div>
            </div>

            {/* Expense Summary Dashboard Skeleton (Analytics & Expenses) */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-card border border-border rounded-xl p-6 space-y-3">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-7 w-16 bg-muted rounded" />
                    </div>
                ))}
            </div>

            {/* Trip Balances Skeleton */}
            <div className="bg-card border border-border p-6 rounded-xl space-y-4">
                <div className="h-5 w-32 bg-muted rounded-lg" />
                <div className="grid gap-4 grid-cols-1 sm:grid-cols-2">
                    {[...Array(2)].map((_, i) => (
                        <div key={i} className="h-16 bg-muted/10 border border-border/50 rounded-lg" />
                    ))}
                </div>
            </div>

            {/* Main Content Grid */}
            <div className="grid gap-8 md:grid-cols-3">
                {/* Left Columns (Details, Map & Description) */}
                <div className="md:col-span-2 space-y-6">
                    {/* Description card skeleton */}
                    <div className="bg-card border border-border p-6 rounded-xl space-y-3">
                        <div className="h-5 w-36 bg-muted rounded-lg" />
                        <div className="h-3 w-full bg-muted rounded" />
                        <div className="h-3 w-5/6 bg-muted rounded" />
                    </div>

                    {/* Interactive Map skeleton */}
                    <div className="bg-card border border-border p-6 rounded-xl space-y-4">
                        <div className="h-5 w-32 bg-muted rounded-lg" />
                        <div className="h-[380px] bg-muted/10 border border-border/50 rounded-lg" />
                    </div>

                    {/* AI Itinerary Planner section skeleton */}
                    <div className="bg-card border border-border p-6 rounded-xl space-y-4">
                        <div className="h-5 w-40 bg-muted rounded-lg" />
                        <div className="space-y-3">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-14 bg-muted/10 border border-border/50 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column (Budget & Metadata) */}
                <div className="space-y-6">
                    {/* Budget Overview skeleton */}
                    <div className="bg-card border border-border p-6 rounded-xl space-y-3">
                        <div className="h-4 w-28 bg-muted rounded" />
                        <div className="h-8 w-36 bg-muted rounded" />
                    </div>

                    {/* Metadata Card skeleton */}
                    <div className="bg-card border border-border p-6 rounded-xl space-y-2">
                        <div className="h-4 w-28 bg-muted rounded" />
                        <div className="h-4 w-full bg-muted rounded" />
                    </div>

                    {/* Members Section skeleton */}
                    <div className="bg-card border border-border p-6 rounded-xl space-y-3">
                        <div className="h-5 w-24 bg-muted rounded-lg" />
                        <div className="space-y-2">
                            {[...Array(3)].map((_, i) => (
                                <div key={i} className="h-10 bg-muted/10 border border-border/50 rounded-lg" />
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
