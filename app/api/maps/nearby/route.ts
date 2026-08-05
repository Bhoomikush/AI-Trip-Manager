import { NextRequest, NextResponse } from "next/server";

const OVERPASS_ENDPOINTS = [
    "https://overpass-api.de/api/interpreter",
    "https://lz4.overpass-api.de/api/interpreter",
    "https://z.overpass-api.de/api/interpreter",
    "https://overpass.kumi.systems/api/interpreter",
];

const CATEGORY_QUERIES: Record<string, string> = {
    restaurant: `node["amenity"="restaurant"](around:3000,lat,lon);way["amenity"="restaurant"](around:3000,lat,lon);`,
    cafe: `node["amenity"="cafe"](around:2000,lat,lon);way["amenity"="cafe"](around:2000,lat,lon);`,
    hotel: `node["tourism"="hotel"](around:3000,lat,lon);way["tourism"="hotel"](around:3000,lat,lon);`,
    attraction: `node["tourism"="attraction"](around:5000,lat,lon);way["tourism"="attraction"](around:5000,lat,lon);`,
    hospital: `node["amenity"="hospital"](around:5000,lat,lon);way["amenity"="hospital"](around:5000,lat,lon);`,
    fuel: `node["amenity"="fuel"](around:4000,lat,lon);way["amenity"="fuel"](around:4000,lat,lon);`,
    atm: `node["amenity"="atm"](around:2000,lat,lon);`,
};

async function fetchWithTimeout(url: string, options: RequestInit, timeoutMs = 8000) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeoutMs);
    try {
        const response = await fetch(url, {
            ...options,
            signal: controller.signal,
        });
        clearTimeout(id);
        return response;
    } catch (err) {
        clearTimeout(id);
        throw err;
    }
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export async function GET(request: NextRequest) {
    const timestamp = new Date().toISOString();
    const { searchParams } = new URL(request.url);
    const latStr = searchParams.get("lat");
    const lonStr = searchParams.get("lon");
    const category = searchParams.get("category");

    // Task 2: Logging helpers
    const logError = (msg: string, endpointUsed: string, status: number, respBody: string, errObj?: any) => {
        console.error(`[Nearby API] ERROR - ${timestamp}
• Request URL: ${request.url}
• Category: ${category}
• Latitude: ${latStr}
• Longitude: ${lonStr}
• Endpoint: ${endpointUsed}
• Status Code: ${status}
• Response Body: ${respBody}
• Error Message: ${msg}
• Stack: ${errObj?.stack || "N/A"}`);
    };

    if (!latStr || !lonStr || !category) {
        const msg = "Missing required query parameters: lat, lon, category";
        logError(msg, "N/A", 400, "N/A");
        return NextResponse.json(
            { success: false, error: msg, details: "Please provide valid coordinates and category.", status: 400 },
            { status: 400 }
        );
    }

    const lat = parseFloat(latStr);
    const lon = parseFloat(lonStr);

    if (isNaN(lat) || isNaN(lon)) {
        const msg = "Invalid coordinates provided";
        logError(msg, "N/A", 400, "N/A");
        return NextResponse.json(
            { success: false, error: msg, details: `Latitude: ${latStr}, Longitude: ${lonStr}`, status: 400 },
            { status: 400 }
        );
    }

    const queryTemplate = CATEGORY_QUERIES[category];
    if (!queryTemplate) {
        const msg = `Invalid or unsupported category: ${category}`;
        logError(msg, "N/A", 400, "N/A");
        return NextResponse.json(
            { success: false, error: msg, details: `Allowed categories are: ${Object.keys(CATEGORY_QUERIES).join(", ")}`, status: 400 },
            { status: 400 }
        );
    }

    const queryBody = queryTemplate
        .replaceAll("lat", lat.toString())
        .replaceAll("lon", lon.toString());
    const overpassQuery = `[out:json][timeout:25];(${queryBody});out center;`;

    let attempt = 1;
    for (const endpoint of OVERPASS_ENDPOINTS) {
        const startTime = Date.now();
        const requestUrl = `${endpoint}?data=${encodeURIComponent(overpassQuery)}`;

        console.log(`[Nearby API] [Attempt ${attempt}] Requesting mirror: ${endpoint}`);

        try {
            // Task 5: Request with 8 seconds timeout & User-Agent header (required by OSM to avoid blocks)
            const response = await fetchWithTimeout(
                requestUrl,
                {
                    method: "GET",
                    headers: {
                        "User-Agent": "TripzyTravelPlanner/1.0",
                        "Accept": "application/json",
                    },
                },
                8000
            );

            const timeTaken = Date.now() - startTime;
            console.log(`[Nearby API] [Attempt ${attempt}] HTTP Status: ${response.status} (Time: ${timeTaken}ms)`);

            if (response.ok) {
                const data = await response.json();

                // Task 6: Validate Returned Data
                if (data && Array.isArray(data.elements)) {
                    const validatedElements = data.elements.filter((el: any) => {
                        const latVal = el.lat || (el.center && el.center.lat);
                        const lonVal = el.lon || (el.center && el.center.lon);
                        return latVal !== undefined && lonVal !== undefined && !isNaN(parseFloat(latVal)) && !isNaN(parseFloat(lonVal));
                    });

                    if (validatedElements.length === 0) {
                        console.log(`[Nearby API] [Attempt ${attempt}] Query succeeded but returned no elements.`);
                        return NextResponse.json({
                            success: true,
                            places: [],
                            elements: [],
                            message: "No nearby places found."
                        });
                    }

                    console.log(`[Nearby API] [Attempt ${attempt}] Query succeeded. Returning ${validatedElements.length} validated elements.`);
                    return NextResponse.json({
                        success: true,
                        elements: validatedElements
                    });
                } else {
                    const msg = "Invalid JSON structure received from Overpass";
                    logError(msg, endpoint, response.status, JSON.stringify(data));
                }
            } else {
                const text = await response.text();
                logError(`Overpass endpoint returned status ${response.status}`, endpoint, response.status, text);
            }
        } catch (e: any) {
            const timeTaken = Date.now() - startTime;
            const isTimeout = e.name === "AbortError";
            const errMsg = isTimeout ? `Request timed out after ${timeTaken}ms` : (e.message || String(e));
            logError(errMsg, endpoint, isTimeout ? 504 : 500, "N/A", e);
        }

        // Task 5: Exponential backoff
        if (attempt < OVERPASS_ENDPOINTS.length) {
            const backoffTime = attempt * 200;
            console.log(`[Nearby API] Backing off for ${backoffTime}ms before Attempt ${attempt + 1}...`);
            await delay(backoffTime);
        }
        attempt++;
    }

    // Task 3: Return Structured JSON Error
    console.error("[Nearby API] All Overpass API endpoints failed.");
    return NextResponse.json(
        {
            success: false,
            error: "Overpass request failed",
            details: "All tried Overpass API mirrors returned errors or timed out.",
            status: 502,
        },
        { status: 502 }
    );
}
