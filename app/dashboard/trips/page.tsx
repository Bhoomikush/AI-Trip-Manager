import { RecentTrips } from "@/components/dashboard/recent-trips";
import { getTrips } from "@/lib/trips";

export default async function TripsPage() {
    const trips = await getTrips();

    return (
        <div className="space-y-8">
            <RecentTrips trips={trips} />
        </div>
    );
}
