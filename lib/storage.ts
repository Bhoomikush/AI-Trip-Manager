import { supabaseAdmin } from "./supabase-admin";

/**
 * Reusable server-side helper for Supabase Storage receipt operations.
 * Keeping all storage operations server-side using supabaseAdmin ensures
 * that service-role credentials are never exposed to the client.
 */

interface UploadReceiptResponse {
    path: string;
    publicUrl: string;
}

/**
 * Uploads a receipt image to the "receipts" bucket.
 * Structure: receipts/{tripId}/{expenseId}/{timestamp}.jpg (or png/webp)
 *
 * @param tripId The ID of the associated trip
 * @param expenseId The ID of the associated expense
 * @param file The file to upload (Blob or Buffer)
 * @param filename The original file name to extract extension
 * @param mimeType The content/MIME type of the file
 */
export async function uploadReceipt(
    tripId: string,
    expenseId: string,
    file: Blob | Buffer,
    filename: string,
    mimeType?: string
): Promise<UploadReceiptResponse> {
    // 1. Get size and content type
    let size = 0;
    let contentType = mimeType || "";

    if (file instanceof Blob) {
        size = file.size;
        contentType = contentType || file.type;
    } else if (Buffer.isBuffer(file)) {
        size = file.length;
    } else {
        throw new Error("Invalid file type. Must be a Blob, File, or Buffer.");
    }

    // 2. Validate MIME type and file extension
    const allowedMimeTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    const allowedExtensions = ["jpg", "jpeg", "png", "webp"];

    const ext = filename.split(".").pop()?.toLowerCase() || "";

    if (
        (contentType && !allowedMimeTypes.includes(contentType.toLowerCase())) ||
        !allowedExtensions.includes(ext)
    ) {
        throw new Error("Invalid file type. Only JPG, JPEG, PNG, and WEBP images are allowed.");
    }

    // Normalize extension (e.g. jpeg -> jpg)
    let finalExt = ext;
    if (finalExt === "jpeg") {
        finalExt = "jpg";
    }

    // 3. Validate size (Max 10 MB)
    const MAX_SIZE = 10 * 1024 * 1024; // 10 MB in bytes
    if (size > MAX_SIZE) {
        throw new Error("File size exceeds the 10 MB limit.");
    }

    // 4. Generate file path: receipts/{tripId}/{expenseId}/{timestamp}.jpg
    const timestamp = Date.now();
    const filePath = `${tripId}/${expenseId}/${timestamp}.${finalExt}`;

    // Convert file to Buffer or ArrayBuffer if it's a Blob
    let uploadData: Buffer | ArrayBuffer;
    if (file instanceof Blob) {
        uploadData = await file.arrayBuffer();
    } else {
        uploadData = file;
    }

    // 5. Upload to Supabase Storage
    const { data, error } = await supabaseAdmin.storage
        .from("receipts")
        .upload(filePath, uploadData, {
            contentType: contentType || `image/${finalExt}`,
            cacheControl: "3600",
            upsert: true,
        });

    if (error) {
        console.error("Supabase storage upload error:", error);
        throw new Error(`Failed to upload receipt: ${error.message}`);
    }

    // 6. Get public URL
    const publicUrl = getReceiptPublicUrl(data.path);

    return {
        path: data.path,
        publicUrl,
    };
}

/**
 * Deletes a receipt image from the "receipts" bucket.
 *
 * @param path The relative storage path or the full public URL of the receipt
 */
export async function deleteReceipt(path: string): Promise<void> {
    if (!path) return;

    // Extract relative path if a full public URL is passed
    let relativePath = path;
    const publicUrlPrefix = "/storage/v1/object/public/receipts/";
    
    if (path.includes(publicUrlPrefix)) {
        relativePath = path.split(publicUrlPrefix).pop() || path;
    } else if (path.startsWith("http")) {
        const bucketMatch = "/receipts/";
        if (path.includes(bucketMatch)) {
            relativePath = path.split(bucketMatch).pop() || path;
        }
    }

    const { error } = await supabaseAdmin.storage
        .from("receipts")
        .remove([relativePath]);

    if (error) {
        console.error("Supabase storage delete error:", error);
        throw new Error(`Failed to delete receipt: ${error.message}`);
    }
}

/**
 * Retrieves the public URL of the uploaded receipt.
 *
 * @param path The relative path inside the receipts bucket
 */
export function getReceiptPublicUrl(path: string): string {
    if (!path) return "";
    
    // If it's already a full URL, return it
    if (path.startsWith("http://") || path.startsWith("https://")) {
        return path;
    }

    const { data } = supabaseAdmin.storage.from("receipts").getPublicUrl(path);
    return data.publicUrl;
}
