import fs from "fs";
import path from "path";

// Load .env.local environment variables manually for execution
try {
    const envPath = path.resolve(process.cwd(), ".env.local");
    if (fs.existsSync(envPath)) {
        const envConfig = fs.readFileSync(envPath, "utf-8");
        for (const line of envConfig.split("\n")) {
            const trimmed = line.trim();
            if (trimmed && !trimmed.startsWith("#") && trimmed.includes("=")) {
                const parts = trimmed.split("=");
                const key = parts[0].trim();
                const val = parts.slice(1).join("=").trim().replace(/^['"]|['"]$/g, "");
                process.env[key] = val;
            }
        }
    }
} catch (e) {
    console.error("Failed to load .env.local:", e);
}

import { uploadReceipt, deleteReceipt, getReceiptPublicUrl } from "../lib/storage";
import { supabaseAdmin } from "../lib/supabase-admin";

// Simulating a dummy file (1x1 transparent PNG)
const dummyPngBase64 = "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==";
const dummyBuffer = Buffer.from(dummyPngBase64, "base64");

async function runTests() {
    console.log("Starting Storage Helper Tests...");

    // Ensure receipts bucket exists
    console.log("Ensuring bucket 'receipts' exists...");
    try {
        const { error: bucketError } = await supabaseAdmin.storage.createBucket("receipts", {
            public: true,
        });
        if (bucketError) {
            console.log("Bucket status info:", bucketError.message);
        } else {
            console.log("Bucket 'receipts' ensured.");
        }
    } catch (e: any) {
        console.log("Bucket check/creation skipped or failed:", e.message);
    }

    const tripId = "00000000-0000-0000-0000-000000000000";
    const expenseId = "11111111-1111-1111-1111-111111111111";

    // Test 1: Upload validation (invalid file type)
    console.log("\nTest 1: Validating file type restrictions...");
    try {
        await uploadReceipt(tripId, expenseId, dummyBuffer, "test.txt", "text/plain");
        console.error("❌ Test 1 Failed: Allowed text/plain upload.");
    } catch (error: any) {
        console.log("✅ Test 1 Passed:", error.message);
    }

    // Test 2: Upload validation (file size limit)
    console.log("\nTest 2: Validating file size limit...");
    try {
        const hugeBuffer = Buffer.alloc(11 * 1024 * 1024); // 11 MB
        await uploadReceipt(tripId, expenseId, hugeBuffer, "huge.png", "image/png");
        console.error("❌ Test 2 Failed: Allowed 11MB file upload.");
    } catch (error: any) {
        console.log("✅ Test 2 Passed:", error.message);
    }

    // Test 3: Successful upload
    console.log("\nTest 3: Uploading valid receipt image...");
    let uploadResult;
    try {
        uploadResult = await uploadReceipt(tripId, expenseId, dummyBuffer, "receipt.png", "image/png");
        console.log("✅ Test 3 Passed!");
        console.log("Path:", uploadResult.path);
        console.log("Public URL:", uploadResult.publicUrl);
    } catch (error: any) {
        console.error("❌ Test 3 Failed:", error.message);
        return;
    }

    // Test 4: Get Public URL
    console.log("\nTest 4: Retrieving public URL...");
    try {
        const publicUrl = getReceiptPublicUrl(uploadResult.path);
        console.log("✅ Test 4 Passed!");
        console.log("Public URL:", publicUrl);
    } catch (error: any) {
        console.error("❌ Test 4 Failed:", error.message);
    }

    // Test 5: Delete receipt
    console.log("\nTest 5: Deleting uploaded receipt...");
    try {
        await deleteReceipt(uploadResult.path);
        console.log("✅ Test 5 Passed!");
    } catch (error: any) {
        console.error("❌ Test 5 Failed:", error.message);
    }
}

runTests().catch(console.error);
