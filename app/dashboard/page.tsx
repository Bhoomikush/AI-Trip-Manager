import { OverviewCards } from "@/components/dashboard/overview-cards";
import { RecentTrips } from "@/components/dashboard/recent-trips";
import { QuickActions } from "@/components/dashboard/quick-actions";
import { AIInsights } from "@/components/dashboard/ai-insights";
import { RecentActivity } from "@/components/dashboard/recent-activity";
import { WelcomeHero } from "@/components/dashboard/welcome-hero";
import { syncUser } from "@/lib/sync-user";
import { getTrips, getDashboardStats, getDashboardActivities } from "@/lib/trips";

export default async function DashboardPage() {
    const profile = await syncUser();
    const trips = await getTrips();
    const stats = await getDashboardStats(trips);
    const activities = await getDashboardActivities();

    return (
        <div className="space-y-8">
            <WelcomeHero 
                userName={profile?.name || "Traveler"} 
                latestTrip={trips.length > 0 ? trips[0] : null} 
            />

            <OverviewCards stats={stats || undefined} />

            <AIInsights />

            <div className="grid gap-6 lg:grid-cols-2">
                <RecentTrips trips={trips} />
                <RecentActivity activities={activities} />
            </div>

            <QuickActions trips={trips} />
        </div>
    );
}