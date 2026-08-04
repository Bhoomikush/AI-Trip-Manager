import fs from "fs";
import path from "path";

// Load .env.local environment variables manually for script context
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

const TEST_RECEIPTS = [
    {
        name: "Sample Bill Receipt",
        url: "https://templates.invoicehome.com/receipt-template-us-classic-white-750px.png"
    }
];

async function runE2ETests() {
    console.log("Starting End-to-End Gemini OCR API Route Verification...");
    
    // We will discover which Next.js dev server port is active
    let port = 3000;
    try {
        await fetch("http://localhost:3000/");
    } catch (e) {
        port = 3001;
    }
    
    console.log(`Using active port: ${port}`);
    const apiEndpoint = `http://localhost:${port}/api/ai/scan-receipt`;

    for (const testCase of TEST_RECEIPTS) {
        console.log(`\nTesting: ${testCase.name}`);
        console.log(`URL: ${testCase.url}`);

        try {
            const response = await fetch(apiEndpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({ receiptUrl: testCase.url })
            });

            console.log(`Response Status: ${response.status}`);
            const json = await response.json();
            console.log("Response Body:", JSON.stringify(json, null, 2));
        } catch (error: any) {
            console.error("Fetch request failed:", error.message);
        }
    }
}

runE2ETests().catch(console.error);
