export interface TripActivity {
    time: string;
    title: string;
    description: string;
    duration: string;
    estimatedCost: number;
}

export interface TripDay {
    day: number;
    date: string;
    activities: TripActivity[];
}

export interface TripItinerary {
    tripTitle: string;
    summary: string;
    days: TripDay[];
}

export interface ItineraryGenerationRequest {
    tripId: string;
    destination: string;
    start_date: string;
    end_date: string;
    budget: "Low" | "Medium" | "High";
    travelStyle: "Relaxed" | "Balanced" | "Packed";
    interests: string[];
}

export interface ItineraryGenerationResponse {
    success: boolean;
    itinerary?: TripItinerary;
    dayData?: TripDay;
    error?: string;
}
