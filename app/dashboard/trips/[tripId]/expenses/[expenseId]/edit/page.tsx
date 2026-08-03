import { notFound } from "next/navigation";
import { getExpenseById } from "@/lib/expenses";
import { EditExpenseForm } from "@/components/dashboard/edit-expense-form";

export const metadata = {
    title: "Edit Expense | Tripzy",
    description: "Modify an existing trip expense",
};

interface PageProps {
    params: Promise<{ tripId: string; expenseId: string }>;
}

export default async function EditExpensePage({ params }: PageProps) {
    const { tripId, expenseId } = await params;
    const expense = await getExpenseById(expenseId);

    if (!expense) {
        notFound();
    }

    return (
        <div className="space-y-8 py-6">
            <div>
                <h1 className="text-3xl font-bold text-foreground">
                    Edit Expense
                </h1>
                <p className="mt-2 text-sm text-muted-foreground">
                    Update the details of your recorded expense below.
                </p>
            </div>

            <EditExpenseForm tripId={tripId} expense={expense} />
        </div>
    );
}
