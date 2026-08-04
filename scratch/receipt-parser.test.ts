import { parseReceiptImage, validateAndNormalizeResponse } from "../lib/ai/receipt-parser";

const dummyBuffer = Buffer.alloc(100);

async function runTests() {
    console.log("Running Updated Receipt Parser Unit Tests...\n");
    const originalFetch = globalThis.fetch;
    let testPasses = 0;
    let testFailures = 0;

    const assert = (condition: boolean, message: string) => {
        if (condition) {
            console.log(`✅ Passed: ${message}`);
            testPasses++;
        } else {
            console.error(`❌ Failed: ${message}`);
            testFailures++;
        }
    };

    // Mock API Key
    process.env.GEMINI_API_KEY = "test_key";

    // Test 1: Successful parsing
    try {
        globalThis.fetch = async () => {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    candidates: [
                        {
                            content: {
                                parts: [
                                    {
                                        text: JSON.stringify({
                                            merchant: "Starbucks Cafe",
                                            amount: 15.50,
                                            currency: "USD",
                                            date: "2026-08-04",
                                            category: "Food",
                                            confidence: 0.95
                                        })
                                    }
                                ]
                            }
                        }
                    ]
                })
            } as any;
        };

        const result = await parseReceiptImage(dummyBuffer, "image/png");
        assert(result.merchant === "Starbucks Cafe", "merchant matches");
        assert(result.amount === 15.5, "amount matches");
        assert(result.currency === "USD", "currency matches");
        assert(result.date === "2026-08-04", "date matches");
        assert(result.category === "Food", "category matches");
        assert(result.confidence === 0.95, "confidence matches");
    } catch (e: any) {
        assert(false, `Test 1 threw error: ${e.message}`);
    }

    // Test 2: Invalid JSON
    try {
        globalThis.fetch = async () => {
            return {
                ok: true,
                status: 200,
                json: async () => ({
                    candidates: [
                        {
                            content: {
                                parts: [
                                    { text: "not-json-at-all" }
                                ]
                            }
                        }
                    ]
                })
            } as any;
        };

        await parseReceiptImage(dummyBuffer, "image/png");
        assert(false, "Test 2: should have failed with invalid JSON error");
    } catch (e: any) {
        assert(e.message.includes("Gemini returned invalid JSON content"), "Test 2: correctly handles invalid JSON");
    }

    // Test 3: Missing/invalid amount throws "Unable to read receipt"
    try {
        const payload = {
            merchant: "Starbucks",
            amount: -5.00, // Invalid amount
            currency: "USD",
            date: "2026-08-04",
            category: "Food",
            confidence: 0.95
        };
        validateAndNormalizeResponse(payload);
        assert(false, "Test 3: should have failed with negative amount");
    } catch (e: any) {
        assert(e.message === "Unable to read receipt", "Test 3: correctly throws 'Unable to read receipt' for invalid amount");
    }

    // Test 4: Unsupported category maps to Other
    try {
        const payload = {
            merchant: "Starbucks",
            amount: 12.00,
            currency: "USD",
            date: "2026-08-04",
            category: "UnknownCategoryString",
            confidence: 0.95
        };
        const result = validateAndNormalizeResponse(payload);
        assert(result.category === "Other", "Test 4: unsupported category mapped to Other");
    } catch (e: any) {
        assert(false, `Test 4 threw error: ${e.message}`);
    }

    // Test 5: API failure handles status gracefully
    try {
        globalThis.fetch = async () => {
            return {
                ok: false,
                status: 500,
                text: async () => "Internal Server Error"
            } as any;
        };

        await parseReceiptImage(dummyBuffer, "image/png");
        assert(false, "Test 5: should have failed with API error");
    } catch (e: any) {
        assert(e.message.includes("Gemini API error"), "Test 5: correctly handles API status error");
    }

    // Restore fetch
    globalThis.fetch = originalFetch;

    console.log(`\nTests finished. Passed: ${testPasses}, Failed: ${testFailures}`);
    if (testFailures > 0) {
        process.exit(1);
    }
}

runTests().catch(e => {
    console.error("Test runner crashed:", e);
    process.exit(1);
});
