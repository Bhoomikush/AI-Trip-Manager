import { notFound } from "next/navigation";
import { getTripById } from "@/lib/trips";
import { CreateTripForm } from "@/components/dashboard/create-trip-form";

interface PageProps {
    params: Promise<{ tripId: string }>;
}

export const metadata = {
    title: "Edit Trip | Tripzy",
    description: "Update trip details and preferences",
};

export default async function EditTripPage({ params }: PageProps) {
    const { tripId } = await params;
    const trip = await getTripById(tripId);

    if (!trip) {
        notFound();
    }

    return (
        <div className="space-y-8 py-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Edit Trip Details
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Update the details for your trip to {trip.destination}.
                </p>
            </div>

            <CreateTripForm mode="edit" initialData={trip} />
        </div>
    );
}
