import { CreateTripForm } from "@/components/dashboard/create-trip-form";

export const metadata = {
    title: "Create Trip | Tripzy",
    description: "Plan a new adventure",
};

export default function NewTripPage() {
    return (
        <div className="space-y-8 py-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Plan a New Trip
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Fill out the details below to start planning your next group adventure.
                </p>
            </div>

            <CreateTripForm />
        </div>
    );
}
