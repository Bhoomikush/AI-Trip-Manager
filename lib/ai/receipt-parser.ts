import "server-only";

export interface ReceiptScanRequest {
    receiptUrl: string;
}

export interface ReceiptScanResponse {
    success: boolean;
    data?: {
        merchant: string | null;
        amount: number;
        currency: string;
        date: string;
        category: string;
        confidence: number;
    };
    error?: string;
}

export interface ParsedReceipt {
    merchant: string | null;
    amount: number;
    currency: string;
    date: string;
    category: string;
    confidence: number;
}

const ALLOWED_CATEGORIES = [
    "Food",
    "Travel",
    "Accommodation",
    "Shopping",
    "Entertainment",
    "Transport",
    "Other",
];

/**
 * Parses a receipt image using the Gemini 2.5 Flash API.
 * 
 * @param fileData Buffer or Blob containing the receipt image data
 * @param mimeType The MIME/content type of the image (e.g. image/jpeg, image/png)
 * @returns Verified and validated ParsedReceipt object
 */
export async function parseReceiptImage(
    fileData: Buffer | Blob,
    mimeType: string
): Promise<ParsedReceipt> {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
        throw new Error("Missing GEMINI_API_KEY environment variable.");
    }

    console.log(`[ReceiptParser] Starting receipt parsing for mimeType: ${mimeType}`);

    // 1. Convert file data to Base64
    let base64Data = "";
    if (fileData instanceof Blob) {
        const arrayBuffer = await fileData.arrayBuffer();
        base64Data = Buffer.from(arrayBuffer).toString("base64");
    } else if (Buffer.isBuffer(fileData)) {
        base64Data = fileData.toString("base64");
    } else {
        throw new Error("Invalid file data type. Must be a Buffer or Blob.");
    }

    // 2. Prepare the request body for Gemini API with requested keys
    const prompt = `You are a receipt parsing assistant. Extract details from the provided receipt image.
Return ONLY a valid JSON object matching the following structure:
{
  "merchant": "string or null",
  "amount": number,
  "currency": "3-letter ISO currency code, e.g. INR, USD, EUR",
  "date": "ISO date string in YYYY-MM-DD format",
  "category": "Food | Travel | Accommodation | Shopping | Entertainment | Transport | Other",
  "confidence": number between 0.0 and 1.0 representing your confidence in the extraction
}

The category field MUST be exactly one of these:
- Food
- Travel
- Accommodation
- Shopping
- Entertainment
- Transport
- Other

If the category does not fit any of the others or is not clear, you MUST return "Other".
Do not output any markdown formatting like \`\`\`json or explanations. Return only the raw JSON string.`;

    const requestBody = {
        contents: [
            {
                parts: [
                    { text: prompt },
                    {
                        inlineData: {
                            mimeType,
                            data: base64Data,
                        },
                    },
                ],
            },
        ],
        generationConfig: {
            responseMimeType: "application/json",
        },
    };

    // 3. Invoke the Gemini API
    const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
    
    let response;
    try {
        response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(requestBody),
        });
    } catch (e: any) {
        console.error("[ReceiptParser] Network error while calling Gemini API:", e);
        throw new Error(`Gemini API connection failed: ${e.message}`);
    }

    if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ReceiptParser] Gemini API returned error status ${response.status}: ${errorText}`);
        throw new Error(`Gemini API error (Status ${response.status}): ${errorText || "Unknown error"}`);
    }

    const responseData = await response.json();
    const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!textResponse) {
        console.error("[ReceiptParser] Empty response from Gemini API structure:", JSON.stringify(responseData));
        throw new Error("No readable response content returned from Gemini API.");
    }

    // 4. Parse the JSON response
    let parsed: any;
    try {
        parsed = JSON.parse(textResponse.trim());
    } catch (e) {
        console.error("[ReceiptParser] Failed to parse JSON from response text:", textResponse);
        throw new Error("Gemini returned invalid JSON content.");
    }

    // 5. Validate the extracted fields
    return validateAndNormalizeResponse(parsed);
}

/**
 * Validates and normalizes Gemini's output to meet strict system constraints.
 */
export function validateAndNormalizeResponse(parsed: any): ParsedReceipt {
    if (!parsed || typeof parsed !== "object") {
        throw new Error("Unable to read receipt");
    }

    // A. Validate Amount
    const amount = Number(parsed.amount);
    if (isNaN(amount) || amount <= 0) {
        throw new Error("Unable to read receipt");
    }

    // B. Validate Date
    let date = parsed.date;
    if (!date) {
        // Fallback to today if not provided
        date = new Date().toISOString().split("T")[0];
    } else {
        const parsedTime = Date.parse(date);
        if (isNaN(parsedTime)) {
            throw new Error("Unable to read receipt");
        }
        // Normalize date to YYYY-MM-DD
        date = new Date(parsedTime).toISOString().split("T")[0];
    }

    // C. Validate Category
    let category = parsed.category;
    if (!category || !ALLOWED_CATEGORIES.includes(category)) {
        category = "Other";
    }

    // D. Validate Confidence
    let confidence = Number(parsed.confidence);
    if (isNaN(confidence) || confidence < 0 || confidence > 1) {
        confidence = 0.5; // fallback default
    }

    // E. Normalize Currency
    let currency = String(parsed.currency || "INR").trim().toUpperCase();
    if (currency.length !== 3) {
        currency = "INR";
    }

    return {
        merchant: parsed.merchant ? String(parsed.merchant).trim() : null,
        amount,
        currency,
        date,
        category,
        confidence,
    };
}
