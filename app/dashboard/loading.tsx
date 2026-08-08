import React from "react";

export default function DashboardLoading() {
    return (
        <div className="space-y-8 animate-pulse p-1">
            {/* Header Skeleton */}
            <div className="space-y-2">
                <div className="h-9 w-64 bg-muted rounded-lg" />
                <div className="h-4 w-96 bg-muted rounded" />
            </div>

            {/* Overview Cards Skeleton */}
            <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
                {[...Array(4)].map((_, i) => (
                    <div key={i} className="h-28 bg-card border border-border rounded-xl p-6 space-y-3">
                        <div className="h-4 w-24 bg-muted rounded" />
                        <div className="h-7 w-16 bg-muted rounded" />
                    </div>
                ))}
            </div>

            {/* AI Insights Skeleton */}
            <div className="rounded-xl border border-primary/20 bg-gradient-to-r from-primary/5 via-card to-card p-6 shadow-sm overflow-hidden relative">
                <div className="absolute -right-4 -top-4 h-24 w-24 rounded-full bg-primary/10 blur-2xl" />
                <div className="space-y-3 relative z-10">
                    <div className="flex items-center gap-2">
                        <div className="h-5 w-5 bg-primary/20 rounded-full" />
                        <div className="h-4 w-32 bg-muted rounded-md" />
                    </div>
                    <div className="h-3 w-3/4 bg-muted rounded" />
                    <div className="h-3 w-1/2 bg-muted rounded" />
                </div>
            </div>

            {/* Grid for Recent Trips & Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Trips Skeleton */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full">
                    <div className="mb-6 space-y-2">
                        <div className="h-7 w-40 bg-muted rounded-lg" />
                        <div className="h-3 w-64 bg-muted rounded" />
                    </div>
                    <div className="grid gap-6 sm:grid-cols-2">
                        {[...Array(2)].map((_, i) => (
                            <div key={i} className="flex flex-col rounded-xl border border-border overflow-hidden">
                                <div className="h-32 w-full bg-muted/50" />
                                <div className="p-5 flex-1 flex flex-col justify-between space-y-4">
                                    <div className="space-y-3">
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 bg-muted rounded-full shrink-0" />
                                            <div className="h-3 w-32 bg-muted rounded" />
                                        </div>
                                        <div className="flex items-center gap-2">
                                            <div className="h-4 w-4 bg-muted rounded-full shrink-0" />
                                            <div className="h-3 w-40 bg-muted rounded" />
                                        </div>
                                        <div className="flex items-center justify-between pt-3 border-t border-border/60">
                                            <div className="h-4 w-16 bg-muted rounded" />
                                            <div className="h-4 w-16 bg-muted rounded" />
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between pt-2 border-t border-border/40">
                                        <div className="h-8 w-20 bg-muted rounded-lg" />
                                        <div className="h-8 w-8 bg-muted rounded-lg" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity Skeleton */}
                <div className="bg-card border border-border rounded-2xl p-6 shadow-sm h-full flex flex-col">
                    <div className="mb-6 space-y-2">
                        <div className="h-7 w-40 bg-muted rounded-lg" />
                        <div className="h-3 w-64 bg-muted rounded" />
                    </div>
                    <div className="relative pl-4 before:absolute before:bottom-2 before:left-[19px] before:top-2 before:w-[1px] before:bg-border/60 flex-1">
                        <ul className="space-y-6">
                            {[...Array(4)].map((_, i) => (
                                <li key={i} className="relative flex items-start gap-4 p-1">
                                    <div className="relative flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-muted" />
                                    <div className="flex-1 space-y-2 pt-1">
                                        <div className="h-3 w-full bg-muted rounded" />
                                        <div className="h-2 w-24 bg-muted rounded" />
                                    </div>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                <div className="h-5 w-32 bg-muted rounded-lg" />
                <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-4">
                    {[...Array(4)].map((_, i) => (
                        <div key={i} className="h-12 bg-muted/10 border border-border/50 rounded-lg" />
                    ))}
                </div>
            </div>
        </div>
    );
}
