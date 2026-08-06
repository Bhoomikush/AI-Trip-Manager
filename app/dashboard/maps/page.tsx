import { getTrips } from "@/lib/trips";
import { MapPin } from "lucide-react";
import { TripMapSelection } from "./trip-map-selection";

export default async function MapsPage() {
    const trips = await getTrips();

    if (trips.length === 0) {
        return (
            <div className="rounded-2xl border border-border bg-card p-6 shadow-sm flex flex-col items-center justify-center text-center py-16">
                <div className="rounded-full bg-primary/10 p-4 mb-4 text-primary">
                    <MapPin className="h-6 w-6" />
                </div>
                <h3 className="font-bold text-base text-foreground mb-1">
                    No maps available
                </h3>
                <p className="text-xs text-muted-foreground max-w-xs">
                    Maps will be available once you plan a trip and set a destination.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <div>
                <h2 className="text-3xl font-heading font-extrabold text-foreground tracking-tight">Maps</h2>
                <p className="text-sm text-muted-foreground">Visualize destinations and itineraries on the map.</p>
            </div>
            
            <TripMapSelection trips={trips.map(t => ({ id: t.id, title: t.title, destination: t.destination }))} />
        </div>
    );
}
