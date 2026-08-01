import { ArrowRight } from "lucide-react";

const RECENT_TRIPS = [
    {
        id: 1,
        name: "Goa Friends Trip",
        members: 3,
        budget: "₹15,000",
        status: "Upcoming",
        daysLeft: "3 Days Left",
    },
    {
        id: 2,
        name: "Manali Adventure",
        members: 5,
        budget: "₹20,000",
        status: "Planning",
        daysLeft: "Planning Stage",
    },
    {
        id: 3,
        name: "Kerala Vacation",
        members: 4,
        budget: "₹32,000",
        status: "Completed",
        daysLeft: "Completed",
    },
];

export function RecentTrips() {
    return (
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
            {/* Section Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-semibold text-foreground">
                        Recent Trips
                    </h2>
                    <p className="text-sm text-muted-foreground">
                        Continue planning your latest adventures.
                    </p>
                </div>
            </div>

            {/* Trip List */}
            <div className="space-y-4">
                {RECENT_TRIPS.map((trip) => (
                    <div
                        key={trip.id}
                        className="flex items-center justify-between rounded-lg border border-border p-4 transition-all hover:border-primary/30 hover:bg-muted/40"
                    >
                        {/* Left */}
                        <div>
                            <h3 className="font-medium text-foreground">
                                {trip.name}
                            </h3>

                            <p className="mt-1 text-sm text-muted-foreground">
                                {trip.members} Members • {trip.daysLeft}
                            </p>

                            <p className="mt-1 text-sm font-medium text-primary">
                                Budget {trip.budget}
                            </p>
                        </div>

                        {/* Right */}
                        <div className="flex items-center gap-4">
                            <span
                                className={`rounded-full px-3 py-1 text-xs font-medium ${trip.status === "Upcoming"
                                    ? "bg-green-100 text-green-700"
                                    : trip.status === "Planning"
                                        ? "bg-yellow-100 text-yellow-700"
                                        : "bg-gray-100 text-gray-700"
                                    }`}
                            >
                                {trip.status}
                            </span>

                            <button className="flex items-center gap-1 text-sm font-medium text-primary transition hover:gap-2">
                                Open
                                <ArrowRight className="h-4 w-4" />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}