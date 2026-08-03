import { CreateExpenseForm } from "@/components/dashboard/create-expense-form";

export const metadata = {
    title: "Add Expense | Tripzy",
    description: "Record a new trip expense",
};

interface PageProps {
    params: Promise<{ tripId: string }>;
}

export default async function NewExpensePage({ params }: PageProps) {
    const { tripId } = await params;

    return (
        <div className="space-y-8 py-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Add Expense
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Record a new payment or cost incurred during your trip.
                </p>
            </div>

            <CreateExpenseForm tripId={tripId} />
        </div>
    );
}
