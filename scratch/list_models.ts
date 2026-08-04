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

async function listModels() {
    const apiKey = process.env.GEMINI_API_KEY;
    const url = `https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`;
    
    console.log("Listing available models from Gemini API...");
    try {
        const res = await fetch(url);
        const data = await res.json();
        if (data.models) {
            console.log("Supported Models:");
            for (const m of data.models) {
                console.log(`- ${m.name} (Methods: ${m.supportedGenerationMethods.join(", ")})`);
            }
        } else {
            console.log("No models returned:", JSON.stringify(data, null, 2));
        }
    } catch (e: any) {
        console.error("Failed to list models:", e.message);
    }
}

listModels().catch(console.error);
