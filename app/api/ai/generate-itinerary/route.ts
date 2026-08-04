import { NextRequest, NextResponse } from "next/server";
import { ItineraryGenerationResponse } from "@/types/ai";

/**
 * API route to securely generate a structured trip itinerary using Gemini.
 * Path: /api/ai/generate-itinerary
 */
export async function POST(req: NextRequest): Promise<NextResponse<ItineraryGenerationResponse>> {
    try {
        const body = await req.json();
        const { destination, start_date, end_date, budget, travelStyle, interests, dayNumber, date } = body;

        // 1. Validation
        if (!destination || !destination.trim()) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Destination is required.",
                },
                { status: 400 }
            );
        }

        if (!start_date || !end_date) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Start Date and End Date are required.",
                },
                { status: 400 }
            );
        }

        const startDate = new Date(start_date);
        const endDate = new Date(end_date);
        if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Start Date and End Date must be valid dates.",
                },
                { status: 400 }
            );
        }

        if (endDate < startDate) {
            return NextResponse.json(
                {
                    success: false,
                    error: "End Date cannot be before Start Date.",
                },
                { status: 400 }
            );
        }

        const apiKey = process.env.GEMINI_API_KEY;
        if (!apiKey) {
            return NextResponse.json(
                {
                    success: false,
                    error: "Gemini API key is not configured on the server.",
                },
                { status: 500 }
            );
        }

        // 2. Formulate Prompt based on full trip or single day
        let prompt = "";
        const isSingleDay = dayNumber !== undefined && date !== undefined;

        if (isSingleDay) {
            prompt = `You are an expert travel planner. Generate a highly detailed, personalized travel itinerary specifically for Day ${dayNumber} (${date}) of a trip to "${destination.trim()}".
Trip Details:
- Budget Level: ${budget || "Medium"}
- Travel Style: ${travelStyle || "Balanced"}
- Traveler Interests: ${interests && interests.length > 0 ? interests.join(", ") : "General Sightseeing"}

Generate a structured JSON response matching the following structure:
{
  "day": ${dayNumber},
  "date": "${date}",
  "activities": [
    {
      "time": "HH:MM",
      "title": "string",
      "description": "string",
      "duration": "string",
      "estimatedCost": number
    }
  ]
}

Ensure activities are realistic, logically ordered from morning to evening, and respect the traveler's interests, travel style, and budget level.
Return ONLY the raw JSON string. Do not wrap in markdown \`\`\`json or add explanations.`;
        } else {
            prompt = `You are an expert travel planner. Generate a highly detailed, personalized day-wise travel itinerary for a trip to "${destination.trim()}".
Trip Details:
- Start Date: ${start_date}
- End Date: ${end_date}
- Budget Level: ${budget || "Medium"}
- Travel Style: ${travelStyle || "Balanced"}
- Traveler Interests: ${interests && interests.length > 0 ? interests.join(", ") : "General Sightseeing"}

Generate a structured JSON response matching the following structure:
{
  "tripTitle": "string",
  "summary": "string",
  "days": [
    {
      "day": number,
      "date": "YYYY-MM-DD",
      "activities": [
        {
          "time": "HH:MM",
          "title": "string",
          "description": "string",
          "duration": "string",
          "estimatedCost": number
        }
      ]
    }
  ]
}

Ensure activities are realistic, logically ordered from morning to evening, and respect the traveler's interests, travel style (Relaxed, Balanced, Packed), and budget level.
Return ONLY the raw JSON string. Do not wrap in markdown \`\`\`json or add explanations.`;
        }

        const requestBody = {
            contents: [
                {
                    parts: [
                        { text: prompt }
                    ]
                }
            ],
            generationConfig: {
                responseMimeType: "application/json"
            }
        };

        // 3. Call Gemini API
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-flash-latest:generateContent?key=${apiKey}`;
        const response = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Gemini API returned error: ${response.status}`, errorText);
            return NextResponse.json(
                {
                    success: false,
                    error: "Gemini API encountered an error. Please try again.",
                },
                { status: 500 }
            );
        }

        const responseData = await response.json();
        const textResponse = responseData.candidates?.[0]?.content?.parts?.[0]?.text;

        if (!textResponse) {
            console.error("Empty response from Gemini API:", JSON.stringify(responseData));
            return NextResponse.json(
                {
                    success: false,
                    error: "No itinerary content generated.",
                },
                { status: 500 }
            );
        }

        // 4. Parse response
        let parsedResult;
        try {
            parsedResult = JSON.parse(textResponse.trim());
        } catch (e) {
            console.error("Failed to parse JSON response:", textResponse);
            return NextResponse.json(
                {
                    success: false,
                    error: "Unable to parse generated itinerary JSON.",
                },
                { status: 500 }
            );
        }

        if (isSingleDay) {
            return NextResponse.json({
                success: true,
                dayData: parsedResult
            });
        }

        return NextResponse.json({
            success: true,
            itinerary: parsedResult
        });

    } catch (e: any) {
        console.error("Error in generate-itinerary route:", e);
        return NextResponse.json(
            {
                success: false,
                error: e.message || "An unexpected error occurred.",
            },
            { status: 500 }
            );
    }
}
export const dynamic = 'force-dynamic';
