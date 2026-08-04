"use server";

import { uploadReceipt, deleteReceipt } from "./storage";

/**
 * Server Action wrapper to handle receipt uploads from client components
 * without exposing service role credentials.
 */
export async function uploadReceiptAction(formData: FormData) {
    const tripId = formData.get("tripId") as string;
    const expenseId = formData.get("expenseId") as string;
    const file = formData.get("file") as File;

    if (!tripId) {
        throw new Error("Trip ID is required.");
    }
    if (!expenseId) {
        throw new Error("Expense ID is required.");
    }
    if (!file || file.size === 0) {
        throw new Error("No file was uploaded.");
    }

    try {
        const result = await uploadReceipt(tripId, expenseId, file, file.name, file.type);
        return result;
    } catch (error: any) {
        console.error("Error in uploadReceiptAction:", error);
        throw new Error(error.message || "Failed to upload receipt.");
    }
}

/**
 * Server Action wrapper to delete a receipt from client components.
 */
export async function deleteReceiptAction(path: string) {
    if (!path) return;
    try {
        await deleteReceipt(path);
    } catch (error: any) {
        console.error("Error in deleteReceiptAction:", error);
        throw new Error(error.message || "Failed to delete receipt.");
    }
}
