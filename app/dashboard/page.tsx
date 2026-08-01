import { OverviewCards } from "@/components/dashboard/overview-cards";

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
        </div>
    );
}