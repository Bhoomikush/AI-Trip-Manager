import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTrips } from "@/components/dashboard/recent-trips";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { RecentActivity } from "@/components/dashboard/recent-activity";

export default function DashboardPage() {
    return (
        <div className="space-y-8">
            <div>
                <h2 className="text-3xl font-bold text-foreground">
                    Welcome back, Bhoomi 👋
                </h2>

                <p className="mt-2 text-muted-foreground">
                    Here's an overview of your travel activity.
                </p>
            </div>

            <OverviewCards />

            <AIInsights />

            <div className="grid gap-6 lg:grid-cols-2">
                <RecentTrips />
                <RecentActivity />
            </div>

            <QuickActions />
        </div>
    );
}