import fs from "fs";
import path from "path";

// Load env vars
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
} catch (e) {}

async function debugDirect() {
    const receiptImageUrl = "https://templates.invoicehome.com/receipt-template-us-classic-white-750px.png";
    console.log("Downloading image...");
    const res = await fetch(receiptImageUrl);
    const contentType = res.headers.get("content-type") || "image/png";
    const arrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    console.log(`Calling Gemini API directly with ${buffer.length} bytes, type ${contentType}...`);
    const apiKey = process.env.GEMINI_API_KEY;
    
    // We will test several models
    const modelsToTry = ["gemini-3.5-flash", "gemini-3.6-flash", "gemini-3.1-flash-lite", "gemini-flash-latest"];
    
    for (const model of modelsToTry) {
        console.log(`\n--- Trying model: ${model} ---`);
        const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;
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
The category field MUST be exactly one of these: Food, Travel, Accommodation, Shopping, Entertainment, Transport, Other.`;

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt },
                        {
                            inlineData: {
                                mimeType: contentType,
                                data: buffer.toString("base64"),
                            },
                        },
                    ],
                },
            ],
            generationConfig: {
                responseMimeType: "application/json",
            },
        };

        try {
            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(requestBody),
            });
            const json = await response.json();
            if (response.ok) {
                console.log(`Model ${model} SUCCESS:`, JSON.stringify(json.candidates?.[0]?.content?.parts?.[0]?.text, null, 2));
            } else {
                console.log(`Model ${model} FAILED:`, JSON.stringify(json, null, 2));
            }
        } catch (e: any) {
            console.error(`Model ${model} threw error:`, e.message);
        }
    }
}

debugDirect().catch(console.error);
