import { NextRequest, NextResponse } from "next/server";
import { parseReceiptImage, ReceiptScanResponse } from "@/lib/ai/receipt-parser";

/**
 * API route to securely scan and extract structured details from receipt images
 * using Gemini Vision.
 * Path: /api/ai/scan-receipt
 */
export async function POST(req: NextRequest): Promise<NextResponse<ReceiptScanResponse>> {
    try {
        const body = await req.json();
        const { receiptUrl } = body;

        if (!receiptUrl) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Unable to read receipt",
                }
            );
        }

        console.log(`[scan-receipt API] Processing receipt from URL: ${receiptUrl}`);

        // Fetch image bytes
        let imgResponse;
        try {
            imgResponse = await fetch(receiptUrl);
        } catch (e: any) {
            console.error(`[scan-receipt API] Failed to fetch image from URL: ${receiptUrl}`, e);
            return NextResponse.json({
                success: false,
                error: "Unable to read receipt",
            });
        }

        if (!imgResponse.ok) {
            console.error(`[scan-receipt API] Image fetch returned status ${imgResponse.status}`);
            return NextResponse.json({
                success: false,
                error: "Unable to read receipt",
            });
        }

        const mimeType = imgResponse.headers.get("content-type") || "image/jpeg";
        const arrayBuffer = await imgResponse.arrayBuffer();
        const buffer = Buffer.from(arrayBuffer);

        console.log(`[scan-receipt API] Processing image (${buffer.length} bytes, type ${mimeType})`);

        // Call parser helper
        const data = await parseReceiptImage(buffer, mimeType);

        console.log("[scan-receipt API] Extracted structured receipt data successfully.");

        return NextResponse.json({
            success: true,
            data,
        });

    } catch (error: any) {
        console.error("[scan-receipt API] Processing error:", error);
        
        return NextResponse.json({
            success: false,
            error: "Unable to read receipt",
        });
    }
}
export const dynamic = 'force-dynamic';
