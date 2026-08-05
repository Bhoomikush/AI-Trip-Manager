"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap, Polyline } from "react-leaflet";
import L from "leaflet";
import { MapPin, Loader2, AlertTriangle, ExternalLink, Calendar } from "lucide-react";
import { getSavedItineraryAction } from "@/lib/itinerary-actions";
import { TripItinerary } from "@/types/ai";



interface TripMapInnerProps {
    destination: string;
    tripTitle: string;
    tripId: string;
    className?: string;
}

interface Place {
    id: string;
    name: string;
    lat: number;
    lon: number;
    category: string;
    address: string;
}

interface GeocodedActivity {
    id: string;
    title: string;
    description: string;
    time: string;
    estimatedCost: number;
    dayNumber: number;
    lat: number;
    lon: number;
    sequenceNumber: number;
}

const CATEGORIES = [
    { id: "restaurant", label: "Restaurants", icon: "🍔", query: `node["amenity"="restaurant"](around:3000,lat,lon);way["amenity"="restaurant"](around:3000,lat,lon);` },
    { id: "cafe", label: "Cafes", icon: "☕", query: `node["amenity"="cafe"](around:2000,lat,lon);way["amenity"="cafe"](around:2000,lat,lon);` },
    { id: "hotel", label: "Hotels", icon: "🏨", query: `node["tourism"="hotel"](around:3000,lat,lon);way["tourism"="hotel"](around:3000,lat,lon);` },
    { id: "attraction", label: "Attractions", icon: "🎡", query: `node["tourism"="attraction"](around:5000,lat,lon);way["tourism"="attraction"](around:5000,lat,lon);` },
    { id: "hospital", label: "Hospitals", icon: "🏥", query: `node["amenity"="hospital"](around:5000,lat,lon);way["amenity"="hospital"](around:5000,lat,lon);` },
    { id: "fuel", label: "Petrol", icon: "⛽", query: `node["amenity"="fuel"](around:4000,lat,lon);way["amenity"="fuel"](around:4000,lat,lon);` },
    { id: "atm", label: "ATMs", icon: "🏪", query: `node["amenity"="atm"](around:2000,lat,lon);` },
];

function getCategoryColor(category: string): string {
    switch (category) {
        case "destination":
            return "bg-blue-500 border-blue-600 shadow-blue-500/20"; // Destination = Blue
        case "itinerary":
            return "bg-emerald-500 border-emerald-600 shadow-emerald-500/20"; // Itinerary = Green
        default:
            return "bg-orange-500 border-orange-600 shadow-orange-500/20"; // Nearby Explorer = Orange
    }
}

function getCategoryEmoji(category: string): string {
    switch (category) {
        case "destination":
            return "📍";
        case "hotel":
            return "🏨";
        case "restaurant":
            return "🍔";
        case "cafe":
            return "☕";
        case "attraction":
            return "🎡";
        case "hospital":
            return "🏥";
        case "fuel":
            return "⛽";
        case "atm":
            return "💵";
        default:
            return "📍";
    }
}

const UNICODE_CIRCLES = ["①", "②", "③", "④", "⑤", "⑥", "⑦", "⑧", "⑨", "⑩", "⑪", "⑫", "⑬", "⑭", "⑮", "⑯", "⑰", "⑱", "⑲", "⑳"];

function getItineraryMarkerContent(num: number): string {
    const idx = num - 1;
    if (idx >= 0 && idx < UNICODE_CIRCLES.length) {
        return UNICODE_CIRCLES[idx];
    }
    return num.toString();
}

function createCustomIcon(category: string, stepNumber?: number) {
    const colorClass = getCategoryColor(category);
    let content = getCategoryEmoji(category);
    
    if (category === "itinerary" && stepNumber !== undefined) {
        const circle = getItineraryMarkerContent(stepNumber);
        content = `<span class="text-sm font-bold text-white">${circle}</span>`;
    }

    return L.divIcon({
        html: `<div class="flex items-center justify-center w-8 h-8 rounded-full border-2 border-white shadow-lg text-white font-bold text-sm ${colorClass}">${content}</div>`,
        className: "custom-div-icon",
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
    });
}

function getPlaceAddress(tags: any, fallbackLabel: string): string {
    if (!tags) return fallbackLabel;
    const street = tags["addr:street"] || "";
    const housenumber = tags["addr:housenumber"] || "";
    const city = tags["addr:city"] || "";
    const suburb = tags["addr:suburb"] || "";
    
    const parts = [housenumber, street, suburb, city].filter(Boolean);
    return parts.length > 0 ? parts.join(", ") : fallbackLabel;
}

// Helper to pan/recenter/zoom fit map
function FitBounds({ coords }: { coords: [number, number][] }) {
    const map = useMap();
    useEffect(() => {
        if (coords && coords.length > 0) {
            const bounds = L.latLngBounds(coords);
            map.fitBounds(bounds, { padding: [50, 50], maxZoom: 14 });
        }
    }, [coords, map]);
    return null;
}

export default function TripMapInner({ destination, tripTitle, tripId, className = "" }: TripMapInnerProps) {
    const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);

    // Explorer States
    const [activeCategory, setActiveCategory] = useState<string | null>(null);
    const [places, setPlaces] = useState<Place[]>([]);
    const [placesLoading, setPlacesLoading] = useState(false);
    const [placesError, setPlacesError] = useState<string | null>(null);
    
    // In-memory cache for Overpass places
    const [placesCache, setPlacesCache] = useState<Record<string, Place[]>>({});

    // Itinerary States
    const [savedItinerary, setSavedItinerary] = useState<TripItinerary | null>(null);
    const [showItinerary, setShowItinerary] = useState(false);
    const [geocodedActivities, setGeocodedActivities] = useState<GeocodedActivity[]>([]);
    const [itineraryLoading, setItineraryLoading] = useState(false);

    // Initial Geocoding for Trip Destination
    useEffect(() => {
        if (!destination) return;

        async function geocode() {
            setLoading(true);
            setError(false);
            try {
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                        destination
                    )}&format=json&limit=1`,
                    {
                        headers: {
                            "User-Agent": "TripzyTravelPlanner/1.0",
                        },
                    }
                );
                
                if (!response.ok) {
                    throw new Error("Nominatim geocoding request failed");
                }

                const data = await response.json();
                if (data && data.length > 0) {
                    const lat = parseFloat(data[0].lat);
                    const lon = parseFloat(data[0].lon);
                    setCoordinates([lat, lon]);
                } else {
                    setError(true);
                }
            } catch (err) {
                console.error("Geocoding error:", err);
                setError(true);
            } finally {
                setLoading(false);
            }
        }

        geocode();
    }, [destination]);

    // Fetch Saved Itinerary Header & Days
    useEffect(() => {
        if (!tripId) return;

        async function fetchItinerary() {
            const data = await getSavedItineraryAction(tripId);
            if (data) {
                setSavedItinerary(data);
            }
        }

        fetchItinerary();
    }, [tripId]);

    // Perform sequential geocoding on itinerary toggle
    const handleItineraryToggle = async () => {
        if (!coordinates || !savedItinerary) return;

        const nextShowState = !showItinerary;
        setShowItinerary(nextShowState);

        if (!nextShowState) {
            setGeocodedActivities([]);
            return;
        }

        // If already geocoded, no need to re-run geocoding sequence
        if (geocodedActivities.length > 0) return;

        setItineraryLoading(true);

        // Flatten all activities with sequence index
        const allActivities: { activity: any; dayNum: number }[] = [];
        savedItinerary.days.forEach((day) => {
            day.activities.forEach((act) => {
                allActivities.push({ activity: act, dayNum: day.day });
            });
        });

        const resolvedStops: GeocodedActivity[] = [];
        let seq = 1;

        for (const item of allActivities) {
            const act = item.activity;
            const queryName = act.title;
            const cacheKey = `tripzy-geocode-${encodeURIComponent(queryName)}`;
            
            // Check LocalStorage cache first
            const cachedVal = localStorage.getItem(cacheKey);
            if (cachedVal) {
                try {
                    const coords = JSON.parse(cachedVal);
                    resolvedStops.push({
                        id: `itinerary-${seq}-${Date.now()}`,
                        title: act.title,
                        description: act.description,
                        time: act.time,
                        estimatedCost: act.estimatedCost || 0,
                        dayNumber: item.dayNum,
                        lat: coords.lat,
                        lon: coords.lon,
                        sequenceNumber: seq++,
                    });
                    continue; // Load next item instantly
                } catch {
                    localStorage.removeItem(cacheKey);
                }
            }

            // Wait 250ms before calls to respect Nominatim API guidelines
            await new Promise((resolve) => setTimeout(resolve, 250));

            try {
                // Query search name concatenated with destination
                const searchQ = `${queryName}, ${destination}`;
                const response = await fetch(
                    `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                        searchQ
                    )}&format=json&limit=1`,
                    {
                        headers: {
                            "User-Agent": "TripzyTravelPlanner/1.0",
                        },
                    }
                );

                let data = [];
                if (response.ok) {
                    data = await response.json();
                }

                // Fallback to searching only queryName if search with destination yields nothing
                if (data.length === 0) {
                    const fallbackResponse = await fetch(
                        `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(
                            queryName
                        )}&format=json&limit=1`,
                        {
                            headers: {
                                "User-Agent": "TripzyTravelPlanner/1.0",
                            },
                        }
                    );
                    if (fallbackResponse.ok) {
                        data = await fallbackResponse.json();
                    }
                }

                if (data && data.length > 0) {
                    const coordsObj = {
                        lat: parseFloat(data[0].lat),
                        lon: parseFloat(data[0].lon),
                    };
                    
                    // Write to localStorage cache
                    localStorage.setItem(cacheKey, JSON.stringify(coordsObj));

                    resolvedStops.push({
                        id: `itinerary-${seq}-${Date.now()}`,
                        title: act.title,
                        description: act.description,
                        time: act.time,
                        estimatedCost: act.estimatedCost || 0,
                        dayNumber: item.dayNum,
                        lat: coordsObj.lat,
                        lon: coordsObj.lon,
                        sequenceNumber: seq++,
                    });
                } else {
                    console.warn(`Could not geocode itinerary activity: ${queryName}`);
                }
            } catch (err) {
                console.error("Geocoding activity error:", err);
            }
        }

        setGeocodedActivities(resolvedStops);
        setItineraryLoading(false);
    };

    // Handle Category Click & Fetch
    const handleCategoryClick = async (categoryId: string) => {
        // Clear previous explorer errors
        setPlacesError(null);

        // 4. Check if destination coordinates are available before querying
        if (!coordinates) {
            console.error("[Overpass] Destination coordinates are not available.");
            setPlacesError("Map coordinates are not loaded yet. Please wait.");
            return;
        }

        // 3. Check if latitude and longitude are valid numbers
        const [lat, lon] = coordinates;
        if (isNaN(lat) || isNaN(lon)) {
            console.error("[Overpass] Invalid coordinates:", coordinates);
            setPlacesError("Invalid destination coordinates.");
            return;
        }

        // If clicking already active category, toggle it off
        if (activeCategory === categoryId) {
            setActiveCategory(null);
            setPlaces([]);
            return;
        }

        setActiveCategory(categoryId);



        // Check Cache first
        if (placesCache[categoryId]) {
            setPlaces(placesCache[categoryId]);
            return;
        }

        setPlacesLoading(true);
        setPlaces([]);

        try {
            const categoryObj = CATEGORIES.find((c) => c.id === categoryId);
            if (!categoryObj) return;

            // 7. Generate Overpass QL query template
            const queryBody = categoryObj.query
                .replaceAll("lat", lat.toString())
                .replaceAll("lon", lon.toString());
            // Query the internal API route proxy instead of hitting public Overpass directly
            console.log(`[Nearby API Client] Requesting internal proxy category: ${categoryId} (lat: ${lat}, lon: ${lon})`);
            const response = await fetch(
                `/api/maps/nearby?lat=${lat}&lon=${lon}&category=${categoryId}`
            );

            console.log(`[Nearby API Client] HTTP Status Code: ${response.status}`);

            if (!response.ok) {
                const errData = await response.json().catch(() => ({}));
                console.error(`[Nearby API Client]
Status: ${response.status}
Error: ${errData.error || "Unknown Error"}
Details: ${errData.details || "No details provided"}`);
                setPlacesError("We couldn't load nearby places right now. Please try again in a few moments.");
                setPlaces([]);
                return;
            }

            const result = await response.json();
            const elements = result.elements || [];

            // Handle empty results gracefully
            if (elements.length === 0) {
                console.log("[Nearby API Client] No nearby places found for query.");
                setPlaces([]);
                return;
            }

            const parsedPlaces: Place[] = elements
                .filter((el: any) => {
                    return (el.lat && el.lon) || (el.center && el.center.lat && el.center.lon);
                })
                .map((el: any) => {
                    const latVal = el.lat || el.center.lat;
                    const lonVal = el.lon || el.center.lon;
                    const tags = el.tags || {};
                    return {
                        id: el.id.toString(),
                        name: tags.name || tags.brand || `${categoryObj.label} (${el.id})`,
                        lat: latVal,
                        lon: lonVal,
                        category: categoryId,
                        address: getPlaceAddress(tags, categoryObj.label),
                    };
                });

            // Update Cache & State
            setPlacesCache((prev) => ({ ...prev, [categoryId]: parsedPlaces }));
            setPlaces(parsedPlaces);
        } catch (err: any) {
            console.error("Overpass places fetch error:", err);
            setPlacesError(err.message || "An unexpected error occurred while searching nearby places.");
        } finally {
            setPlacesLoading(false);
        }
    };

    if (loading) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[350px] bg-card border border-border rounded-xl p-6 ${className}`}>
                <div className="flex flex-col items-center gap-3">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <p className="text-sm text-muted-foreground">Loading map and locating destination...</p>
                </div>
            </div>
        );
    }

    if (error || !coordinates) {
        return (
            <div className={`flex flex-col items-center justify-center min-h-[350px] bg-card border border-border rounded-xl p-6 text-center space-y-3 ${className}`}>
                <div className="p-3 bg-amber-500/10 rounded-full text-amber-500">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-semibold text-foreground">Location Not Found</h3>
                <p className="text-sm text-muted-foreground max-w-md">
                    We couldn't locate "{destination}" on the map. Please check the spelling of your destination.
                </p>
            </div>
        );
    }

    // Collect all coordinates currently displayed on the map to fit view bounds
    const activeMapPoints: [number, number][] = [coordinates];
    if (showItinerary && geocodedActivities.length > 0) {
        geocodedActivities.forEach((act) => activeMapPoints.push([act.lat, act.lon]));
    }
    if (activeCategory && places.length > 0) {
        places.forEach((p) => activeMapPoints.push([p.lat, p.lon]));
    }

    return (
        <div className={`flex flex-col gap-4 w-full ${className}`}>
            {/* Header controls toolbar */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-border pb-3">
                {/* Category Buttons Row */}
                <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-none snap-x snap-mandatory max-w-full md:max-w-[70%]">
                    {CATEGORIES.map((cat) => {
                        const isActive = activeCategory === cat.id;
                        return (
                            <button
                                key={cat.id}
                                onClick={() => handleCategoryClick(cat.id)}
                                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-medium transition cursor-pointer shrink-0 snap-start
                                    ${
                                        isActive
                                            ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                            : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                                    }`}
                            >
                                <span>{cat.icon}</span>
                                <span>{cat.label}</span>
                            </button>
                        );
                    })}
                </div>

                {/* Itinerary Toggle Button */}
                {savedItinerary && (
                    <button
                        onClick={handleItineraryToggle}
                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg border text-xs font-semibold transition cursor-pointer shrink-0 self-start md:self-auto
                            ${
                                showItinerary
                                    ? "bg-emerald-600 text-white border-emerald-600 shadow-sm"
                                    : "bg-card hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                            }`}
                    >
                        <Calendar className="h-3.5 w-3.5" />
                        <span>{showItinerary ? "Hide Itinerary" : "Show Itinerary"}</span>
                    </button>
                )}
            </div>

            {/* Map Container */}
            <div className="relative w-full h-[380px] rounded-xl overflow-hidden border border-border shadow-sm">
                {/* Loader Overlay (Places or Itinerary Geocoding) */}
                {(placesLoading || itineraryLoading) && (
                    <div className="absolute inset-0 bg-background/50 backdrop-blur-[1px] flex items-center justify-center z-[1000] transition-all">
                        <div className="flex items-center gap-2 bg-card border border-border px-4 py-2.5 rounded-xl shadow-md">
                            <Loader2 className="h-4 w-4 animate-spin text-primary" />
                            <span className="text-xs font-medium text-foreground">
                                {itineraryLoading ? "Geocoding itinerary stops..." : "Searching nearby spots..."}
                            </span>
                        </div>
                    </div>
                )}

                {/* Error Banner */}
                {placesError && (
                    <div className="absolute top-4 left-4 right-4 z-[1000]">
                        <div className="bg-destructive/10 border border-destructive/20 text-destructive px-3 py-2 rounded-lg shadow-md text-xs font-medium flex items-center gap-2 bg-card">
                            <AlertTriangle className="h-4 w-4 shrink-0 text-destructive" />
                            <span>{placesError}</span>
                        </div>
                    </div>
                )}

                {/* Empty Places Notice */}
                {!placesLoading && !placesError && activeCategory && places.length === 0 && (
                    <div className="absolute top-4 right-4 z-[1000] pointer-events-none">
                        <div className="bg-card border border-border px-3 py-1.5 rounded-lg shadow-md text-[10px] font-medium text-muted-foreground">
                            ⚠️ No {CATEGORIES.find((c) => c.id === activeCategory)?.label.toLowerCase()} found nearby
                        </div>
                    </div>
                )}

                <MapContainer
                    center={coordinates}
                    zoom={12}
                    scrollWheelZoom={false}
                    className="w-full h-full z-10"
                >
                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />
                    
                    {/* Auto bounds fitment component */}
                    <FitBounds coords={activeMapPoints} />
                    
                    {/* Destination Marker (Blue) */}
                    <Marker position={coordinates} icon={createCustomIcon("destination")}>
                        <Popup>
                            <div className="p-1 min-w-[150px] text-zinc-900">
                                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 block mb-0.5">Trip Destination</span>
                                <h4 className="font-bold text-sm leading-tight mb-1 text-zinc-900">{tripTitle}</h4>
                                <p className="text-xs text-zinc-600 flex items-center gap-1">
                                    <MapPin className="h-3 w-3 text-blue-500 shrink-0" />
                                    {destination}
                                </p>
                            </div>
                        </Popup>
                    </Marker>

                    {/* Nearby Places Explorer Markers (Orange) */}
                    {!placesLoading &&
                        places.map((place) => (
                            <Marker
                                key={place.id}
                                position={[place.lat, place.lon]}
                                icon={createCustomIcon(place.category)}
                            >
                                <Popup>
                                    <div className="p-1.5 min-w-[180px] max-w-[220px] text-zinc-900">
                                        <span className="text-[9px] font-bold uppercase tracking-wider text-zinc-500 block mb-1">
                                            {CATEGORIES.find((c) => c.id === place.category)?.label}
                                        </span>
                                        <h4 className="font-semibold text-xs leading-snug mb-1 text-zinc-950 break-words">
                                            {place.name}
                                        </h4>
                                        <p className="text-[10px] text-zinc-500 leading-normal mb-2.5 break-words">
                                            {place.address}
                                        </p>
                                        <a
                                            href={`https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lon}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="inline-flex items-center justify-center gap-1 w-full px-2 py-1 bg-zinc-100 hover:bg-zinc-200 border border-zinc-200 rounded text-[10px] font-medium text-zinc-700 transition"
                                        >
                                            <ExternalLink className="h-3 w-3" />
                                            Open in Google Maps
                                        </a>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}

                    {/* AI Itinerary Route & Markers (Green) */}
                    {showItinerary && !itineraryLoading && geocodedActivities.length > 0 && (
                        <>
                            {/* Route connecting line */}
                            <Polyline
                                positions={geocodedActivities.map((act) => [act.lat, act.lon])}
                                color="#10b981"
                                weight={3}
                                dashArray="6, 8"
                            />

                            {/* Sequence Markers */}
                            {geocodedActivities.map((act) => (
                                <Marker
                                    key={act.id}
                                    position={[act.lat, act.lon]}
                                    icon={createCustomIcon("itinerary", act.sequenceNumber)}
                                >
                                    <Popup>
                                        <div className="p-1.5 min-w-[180px] max-w-[220px] text-zinc-900">
                                            <div className="flex items-center justify-between gap-2 mb-1">
                                                <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">
                                                    Day {act.dayNumber}
                                                </span>
                                                <span className="text-[10px] text-zinc-500 font-medium">
                                                    {act.time}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-xs leading-snug mb-1 text-zinc-950 break-words">
                                                {act.sequenceNumber}. {act.title}
                                            </h4>
                                            <p className="text-[10px] text-zinc-650 leading-relaxed mb-2.5 break-words">
                                                {act.description}
                                            </p>
                                            <div className="flex justify-between items-center border-t border-zinc-100 pt-2 text-[10px] text-zinc-550">
                                                <span>Est. Cost:</span>
                                                <span className="font-bold text-zinc-800">
                                                    {act.estimatedCost > 0 ? `₹${act.estimatedCost}` : "Free"}
                                                </span>
                                            </div>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                        </>
                    )}
                </MapContainer>
            </div>
        </div>
    );
}
