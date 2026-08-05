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
            <div className="h-24 bg-card border border-border rounded-xl p-6 space-y-2">
                <div className="h-4 w-48 bg-muted rounded" />
                <div className="h-3 w-full bg-muted rounded" />
            </div>

            {/* Grid for Recent Trips & Activity */}
            <div className="grid gap-6 lg:grid-cols-2">
                {/* Recent Trips */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="h-5 w-32 bg-muted rounded-lg" />
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted/10 border border-border/50 rounded-lg p-4 flex gap-4">
                                <div className="h-8 w-8 bg-muted rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 w-32 bg-muted rounded" />
                                    <div className="h-2 w-20 bg-muted rounded" />
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-card border border-border rounded-xl p-6 space-y-4">
                    <div className="h-5 w-32 bg-muted rounded-lg" />
                    <div className="space-y-3">
                        {[...Array(3)].map((_, i) => (
                            <div key={i} className="h-16 bg-muted/10 border border-border/50 rounded-lg p-4 flex gap-4">
                                <div className="h-8 w-8 bg-muted rounded-full" />
                                <div className="space-y-2 flex-1">
                                    <div className="h-3 w-32 bg-muted rounded" />
                                    <div className="h-2 w-20 bg-muted rounded" />
                                </div>
                            </div>
                        ))}
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
