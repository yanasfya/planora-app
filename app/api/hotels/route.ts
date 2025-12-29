import { NextResponse } from "next/server";
import { detectCurrencyFromDestination, convertPrice, CURRENCIES } from "@/lib/currency";

const RAPIDAPI_KEY = process.env.BOOKING_API_KEY || process.env.RAPIDAPI_KEY;

export interface Hotel {
  id: string;
  name: string;
  price: number;
  priceUSD: number;
  currency: string;
  rating: number;
  image: string;
  amenities: string[];
  location: string;
  bookingUrl: string;
}

interface HotelsResponse {
  hotels: Hotel[];
  city: string;
  budget: string;
  currency: {
    code: string;
    symbol: string;
    autoDetected: boolean;
  };
}

interface CacheEntry<T> {
  data: T;
  timestamp: number;
}

interface CityPricing {
  low: number;
  medium: number;
  high: number;
  currency: string;
  areas: string[];
  hotelTypes: {
    budget: string[];
    moderate: string[];
    luxury: string[];
  };
}

const cache = new Map<string, CacheEntry<any>>();
const CACHE_DURATION = 30 * 60 * 1000;

const CITY_PRICING: Record<string, CityPricing> = {
  bangkok: {
    low: 25,
    medium: 60,
    high: 180,
    currency: "USD",
    areas: ["Sukhumvit", "Silom", "Riverside", "Old City", "Siam"],
    hotelTypes: {
      budget: ["Hostel", "Guesthouse", "Budget Hotel"],
      moderate: ["Boutique Hotel", "Business Hotel", "City Hotel"],
      luxury: ["Resort", "Grand Hotel", "Luxury Hotel"],
    },
  },
  paris: {
    low: 80,
    medium: 180,
    high: 450,
    currency: "USD",
    areas: ["Marais", "Latin Quarter", "Champs-Élysées", "Montmartre", "Saint-Germain"],
    hotelTypes: {
      budget: ["Budget Hotel", "Pension", "Inn"],
      moderate: ["Boutique Hotel", "Hôtel de Charme", "City Hotel"],
      luxury: ["Palace Hotel", "Grand Hotel", "Luxury Suites"],
    },
  },
  tokyo: {
    low: 65,
    medium: 140,
    high: 380,
    currency: "USD",
    areas: ["Shinjuku", "Shibuya", "Ginza", "Asakusa", "Roppongi"],
    hotelTypes: {
      budget: ["Capsule Hotel", "Business Hotel", "Ryokan"],
      moderate: ["City Hotel", "Boutique Hotel", "Modern Hotel"],
      luxury: ["Imperial Hotel", "Luxury Tower", "Grand Hotel"],
    },
  },
  "new york": {
    low: 120,
    medium: 250,
    high: 550,
    currency: "USD",
    areas: ["Manhattan", "Brooklyn", "Times Square", "SoHo", "Upper East Side"],
    hotelTypes: {
      budget: ["Budget Hotel", "Inn", "Hostel"],
      moderate: ["Boutique Hotel", "City Hotel", "Business Hotel"],
      luxury: ["Luxury Hotel", "Grand Hotel", "5-Star Resort"],
    },
  },
  london: {
    low: 90,
    medium: 200,
    high: 480,
    currency: "USD",
    areas: ["Westminster", "Covent Garden", "Shoreditch", "Kensington", "Camden"],
    hotelTypes: {
      budget: ["Budget Hotel", "B&B", "Inn"],
      moderate: ["Boutique Hotel", "Town House", "City Hotel"],
      luxury: ["Grand Hotel", "Luxury Hotel", "Palace Hotel"],
    },
  },
  barcelona: {
    low: 70,
    medium: 150,
    high: 380,
    currency: "USD",
    areas: ["Gothic Quarter", "Eixample", "Gracia", "Barceloneta", "El Born"],
    hotelTypes: {
      budget: ["Hostal", "Pension", "Budget Hotel"],
      moderate: ["Boutique Hotel", "Casa", "Design Hotel"],
      luxury: ["Grand Hotel", "Luxury Hotel", "Palace"],
    },
  },
  bali: {
    low: 35,
    medium: 85,
    high: 250,
    currency: "USD",
    areas: ["Seminyak", "Ubud", "Canggu", "Nusa Dua", "Sanur"],
    hotelTypes: {
      budget: ["Guesthouse", "Homestay", "Budget Villa"],
      moderate: ["Boutique Resort", "Villa", "Beach Hotel"],
      luxury: ["Luxury Villa", "5-Star Resort", "Private Estate"],
    },
  },
  dubai: {
    low: 95,
    medium: 220,
    high: 600,
    currency: "USD",
    areas: ["Downtown", "Marina", "Palm Jumeirah", "JBR", "Business Bay"],
    hotelTypes: {
      budget: ["Hotel Apartment", "Budget Hotel", "Inn"],
      moderate: ["City Hotel", "Beach Resort", "Business Hotel"],
      luxury: ["Luxury Resort", "7-Star Hotel", "Palace Hotel"],
    },
  },
  rome: {
    low: 75,
    medium: 160,
    high: 400,
    currency: "USD",
    areas: ["Trastevere", "Centro Storico", "Vatican", "Monti", "Trevi"],
    hotelTypes: {
      budget: ["Pensione", "Budget Hotel", "B&B"],
      moderate: ["Boutique Hotel", "Palazzo", "Design Hotel"],
      luxury: ["Grand Hotel", "Luxury Hotel", "Historic Palace"],
    },
  },
  singapore: {
    low: 85,
    medium: 170,
    high: 420,
    currency: "USD",
    areas: ["Marina Bay", "Orchard", "Chinatown", "Sentosa", "Clarke Quay"],
    hotelTypes: {
      budget: ["Budget Hotel", "Capsule Hotel", "Hostel"],
      moderate: ["City Hotel", "Boutique Hotel", "Business Hotel"],
      luxury: ["Luxury Hotel", "Integrated Resort", "5-Star Hotel"],
    },
  },
  sydney: {
    low: 95,
    medium: 190,
    high: 450,
    currency: "USD",
    areas: ["CBD", "Darling Harbour", "Bondi", "The Rocks", "Surry Hills"],
    hotelTypes: {
      budget: ["Budget Hotel", "Hostel", "Motel"],
      moderate: ["Boutique Hotel", "Harbor Hotel", "City Hotel"],
      luxury: ["Luxury Hotel", "5-Star Resort", "Waterfront Hotel"],
    },
  },
};

function extractCityName(destination: string): string {
  const parts = destination.split(",");
  return parts[0].trim();
}

function getCityPricing(city: string): CityPricing {
  const normalized = city.toLowerCase();

  if (CITY_PRICING[normalized]) {
    return CITY_PRICING[normalized];
  }

  return {
    low: 60,
    medium: 130,
    high: 300,
    currency: "USD",
    areas: ["Downtown", "City Center", "Historic District", "Waterfront", "Old Town"],
    hotelTypes: {
      budget: ["Budget Hotel", "Hostel", "Inn"],
      moderate: ["Boutique Hotel", "City Hotel", "Business Hotel"],
      luxury: ["Luxury Hotel", "Grand Hotel", "Resort"],
    },
  };
}

function generateBookingUrl(
  hotelName: string,
  city: string,
  budget: "low" | "medium" | "high",
  pricing: CityPricing,
  checkInDate?: string,
  checkOutDate?: string,
  hotelIndex: number = 0,
  guests: number = 2
): string {
  let checkIn = checkInDate;
  let checkOut = checkOutDate;

  if (!checkIn || !checkOut) {
    const defaultCheckIn = new Date();
    defaultCheckIn.setDate(defaultCheckIn.getDate() + 30);
    const defaultCheckOut = new Date(defaultCheckIn);
    defaultCheckOut.setDate(defaultCheckOut.getDate() + 2);

    checkIn = defaultCheckIn.toISOString().split("T")[0];
    checkOut = defaultCheckOut.toISOString().split("T")[0];
  }

  const basePrice = pricing[budget];
  const priceVariations = [
    { min: 0.85, max: 1.15 },
    { min: 0.80, max: 1.20 },
    { min: 0.75, max: 1.25 },
  ];

  const variation = priceVariations[hotelIndex] || priceVariations[0];
  const minPrice = Math.floor(basePrice * variation.min);
  const maxPrice = Math.ceil(basePrice * variation.max);

  // Calculate rooms needed (1 room per 2 guests, minimum 1)
  const numRooms = Math.max(1, Math.ceil(guests / 2));

  const params = new URLSearchParams({
    ss: `${hotelName}`,
    checkin: checkIn,
    checkout: checkOut,
    group_adults: guests.toString(),
    group_children: "0",
    no_rooms: numRooms.toString(),
    nflt: `price=USD-${minPrice}-${maxPrice}-1;class=3;class=4`,
  });

  return `https://www.booking.com/searchresults.html?${params.toString()}`;
}

function getUnsplashImage(index: number): string {
  const photoIds = [
    "1566073771259-6a8506099945",
    "1542314831-068cd1dbfeeb",
    "1551882547-ff40c63fe5fa",
  ];

  const photoId = photoIds[index % photoIds.length];
  return `https://images.unsplash.com/photo-${photoId}?w=400&h=300&fit=crop&q=80`;
}

function generateRealisticHotelName(
  city: string,
  area: string,
  budget: "low" | "medium" | "high",
  index: number
): string {
  const budgetChains = [
    `${city} Express Hotel`,
    `Budget Inn ${area}`,
    `${city} Hostel ${area}`,
  ];

  const mediumChains = [
    `Novotel ${city} ${area}`,
    `${city} Grand Hotel`,
    `Mercure ${area}`,
  ];

  const luxuryChains = [
    `The ${area} Palace`,
    `${city} Luxury Suites`,
    `Grand Hotel ${city}`,
  ];

  if (budget === "low") {
    return budgetChains[index % budgetChains.length];
  } else if (budget === "medium") {
    return mediumChains[index % mediumChains.length];
  } else {
    return luxuryChains[index % luxuryChains.length];
  }
}

function generateAmenities(budget: "low" | "medium" | "high"): string[] {
  const baseAmenities = ["Free WiFi"];

  if (budget === "low") {
    return [...baseAmenities, "24-Hour Reception", "Luggage Storage"];
  } else if (budget === "medium") {
    return [...baseAmenities, "Breakfast Included", "Gym", "Airport Shuttle"];
  } else {
    return [...baseAmenities, "Spa & Wellness", "Pool", "Fine Dining", "Concierge"];
  }
}

function getRating(budget: "low" | "medium" | "high"): number {
  if (budget === "low") return 3;
  if (budget === "medium") return 4;
  return 5;
}

async function fetchRealHotels(
  city: string,
  budget: "low" | "medium" | "high",
  checkInDate?: string,
  checkOutDate?: string,
  guests: number = 2
): Promise<Hotel[] | null> {
  if (!RAPIDAPI_KEY) {
    console.log("[Hotels API] No RapidAPI key configured, using fallback");
    return null;
  }

  try {
    console.log(`[Hotels API] Fetching real hotels for ${city}, budget: ${budget}`);
    const searchUrl = `https://booking-com.p.rapidapi.com/v1/hotels/locations?name=${encodeURIComponent(city)}&locale=en-gb`;

    const searchResponse = await fetch(searchUrl, {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
      },
    });

    if (!searchResponse.ok) {
      console.log(`[Hotels API] Location search failed: ${searchResponse.status}`);
      return null;
    }

    const locations = await searchResponse.json();

    if (!locations || locations.length === 0) {
      console.log("[Hotels API] No locations found");
      return null;
    }

    const destination = locations.find((loc: any) => loc.dest_type === "city") || locations[0];
    console.log(`[Hotels API] Found destination: ${destination.name}, dest_id: ${destination.dest_id}`);
    const destId = destination.dest_id;
    const destType = destination.dest_type;

    let checkIn = checkInDate;
    let checkOut = checkOutDate;

    if (!checkIn || !checkOut) {
      const defaultCheckIn = new Date();
      defaultCheckIn.setDate(defaultCheckIn.getDate() + 30);
      const defaultCheckOut = new Date(defaultCheckIn);
      defaultCheckOut.setDate(defaultCheckOut.getDate() + 2);

      checkIn = defaultCheckIn.toISOString().split("T")[0];
      checkOut = defaultCheckOut.toISOString().split("T")[0];
    }

    const pricing = getCityPricing(city);

    // Calculate rooms needed (1 room per 2 guests, minimum 1)
    const numRooms = Math.max(1, Math.ceil(guests / 2));

    const hotelsUrl = new URL("https://booking-com.p.rapidapi.com/v1/hotels/search");
    hotelsUrl.searchParams.set("dest_id", destId);
    hotelsUrl.searchParams.set("dest_type", destType);
    hotelsUrl.searchParams.set("checkin_date", checkIn);
    hotelsUrl.searchParams.set("checkout_date", checkOut);
    hotelsUrl.searchParams.set("adults_number", guests.toString());
    hotelsUrl.searchParams.set("room_number", numRooms.toString());
    hotelsUrl.searchParams.set("units", "metric");
    hotelsUrl.searchParams.set("locale", "en-gb");
    hotelsUrl.searchParams.set("currency", "USD");
    hotelsUrl.searchParams.set("order_by", "popularity");
    hotelsUrl.searchParams.set("filter_by_currency", "USD");
    hotelsUrl.searchParams.set("page_number", "0");

    if (budget === "low") {
      hotelsUrl.searchParams.set("categories_filter_ids", "class::1,class::2");
    } else if (budget === "medium") {
      hotelsUrl.searchParams.set("categories_filter_ids", "class::3,class::4");
    } else {
      hotelsUrl.searchParams.set("categories_filter_ids", "class::4,class::5");
    }

    console.log(`[Hotels API] Searching hotels with dates: ${checkIn} to ${checkOut}`);
    const hotelsResponse = await fetch(hotelsUrl.toString(), {
      headers: {
        "X-RapidAPI-Key": RAPIDAPI_KEY,
        "X-RapidAPI-Host": "booking-com.p.rapidapi.com",
      },
    });

    if (!hotelsResponse.ok) {
      const errorText = await hotelsResponse.text();
      console.log(`[Hotels API] Hotels search failed: ${hotelsResponse.status}`, errorText.substring(0, 200));
      return null;
    }

    const hotelsData = await hotelsResponse.json();

    if (!hotelsData.result || hotelsData.result.length === 0) {
      console.log("[Hotels API] No hotel results found");
      return null;
    }

    console.log(`[Hotels API] Found ${hotelsData.result.length} hotels`);

    let numNights = 1;
    if (checkInDate && checkOutDate) {
      const checkInD = new Date(checkInDate);
      const checkOutD = new Date(checkOutDate);
      numNights = Math.max(1, Math.ceil((checkOutD.getTime() - checkInD.getTime()) / (1000 * 60 * 60 * 24)));
    }

    const hotels: Hotel[] = hotelsData.result.slice(0, 3).map((hotel: any, index: number) => {
      const rawTotalPrice = hotel.min_total_price || hotel.price_breakdown?.gross_price || hotel.composite_price_breakdown?.gross_amount?.value;
      const apiCurrency = hotel.currency_code || hotel.currencycode || "USD";

      let pricePerNightUSD: number;
      if (rawTotalPrice) {
        const currencyRate = CURRENCIES[apiCurrency as keyof typeof CURRENCIES]?.rate || 1;
        const totalUSD = rawTotalPrice / currencyRate;
        pricePerNightUSD = totalUSD / numNights;
      } else {
        pricePerNightUSD = pricing[budget];
      }

      if (pricePerNightUSD < 10 || pricePerNightUSD > 3000) {
        pricePerNightUSD = pricing[budget];
      }

      // Build direct hotel URL - Booking.com API returns url field with the direct link
      // Format: https://www.booking.com/hotel/xx/hotel-name.html?checkin=...&checkout=...
      let bookingUrl: string;

      if (hotel.url) {
        // Use API-provided URL and append dates if available
        bookingUrl = hotel.url;
        // Add check-in/check-out dates to the URL if not already present
        if (checkIn && checkOut && !bookingUrl.includes('checkin=')) {
          const separator = bookingUrl.includes('?') ? '&' : '?';
          bookingUrl += `${separator}checkin=${checkIn}&checkout=${checkOut}&group_adults=${guests}&group_children=0&no_rooms=${numRooms}`;
        }
      } else {
        // Fallback: construct URL using hotel_id with proper format
        // Booking.com URLs need country code and slug, but we can use the search with hotel name
        const hotelName = hotel.hotel_name || hotel.hotel_name_trans || 'hotel';
        const params = new URLSearchParams({
          ss: hotelName,
          checkin: checkIn || '',
          checkout: checkOut || '',
          group_adults: guests.toString(),
          group_children: '0',
          no_rooms: numRooms.toString(),
          dest_id: destId,
          dest_type: destType,
        });
        bookingUrl = `https://www.booking.com/searchresults.html?${params.toString()}`;
      }

      // Log URL info for debugging
      console.log(`[Hotels API] Hotel: ${hotel.hotel_name}, URL field: ${hotel.url ? 'EXISTS' : 'MISSING'}, Final URL: ${bookingUrl.substring(0, 80)}...`);

      const image = hotel.max_photo_url || hotel.main_photo_url || hotel.max_1440_photo_url || getUnsplashImage(index);

      const amenities: string[] = [];
      if (hotel.badges) {
        hotel.badges.forEach((badge: any) => {
          if (badge.text) amenities.push(badge.text);
        });
      }
      if (amenities.length === 0) {
        amenities.push("Free WiFi", "Air Conditioning", "24-Hour Reception");
      }

      return {
        id: hotel.hotel_id?.toString() || `real-${index}`,
        name: hotel.hotel_name || hotel.hotel_name_trans || "Hotel",
        price: Math.round(pricePerNightUSD),
        priceUSD: Math.round(pricePerNightUSD),
        currency: "USD",
        rating: hotel.review_score ? Math.round(hotel.review_score / 2) : getRating(budget),
        image,
        amenities: amenities.slice(0, 3),
        location: hotel.address || hotel.city || `${city}`,
        bookingUrl,
      };
    });

    return hotels;

  } catch (error) {
    console.error("[Hotels API] Error fetching real hotels:", error);
    return null;
  }
}

function generateSmartHotels(
  city: string,
  budget: "low" | "medium" | "high",
  checkInDate?: string,
  checkOutDate?: string,
  guests: number = 2
): Hotel[] {
  const pricing = getCityPricing(city);
  const basePrice = pricing[budget];
  const rating = getRating(budget);
  const amenities = generateAmenities(budget);

  const hotels: Hotel[] = [];
  const priceVariations = [0.9, 1.0, 1.15];

  for (let i = 0; i < 3; i++) {
    const area = pricing.areas[i % pricing.areas.length];
    const price = Math.round(basePrice * priceVariations[i]);
    const hotelName = generateRealisticHotelName(city, area, budget, i);

    hotels.push({
      id: `${city}-${budget}-${i}`,
      name: hotelName,
      price,
      priceUSD: price,
      currency: pricing.currency,
      rating,
      image: getUnsplashImage(i),
      amenities: amenities.slice(0, 3),
      location: `${area}, ${city}`,
      bookingUrl: generateBookingUrl(hotelName, city, budget, pricing, checkInDate, checkOutDate, i, guests),
    });
  }

  return hotels;
}

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const destination = searchParams.get("destination");
    const budget = searchParams.get("budget") as "low" | "medium" | "high";
    const datesParam = searchParams.get("dates");
    const currencyParam = searchParams.get("currency");
    const guestsParam = searchParams.get("guests");

    // Parse guests (default to 2 if not provided or invalid)
    const guests = Math.max(1, parseInt(guestsParam || "2", 10) || 2);

    let checkInDate: string | undefined;
    let checkOutDate: string | undefined;

    if (datesParam) {
      const dates = datesParam.split(",");
      checkInDate = dates[0]?.trim();
      checkOutDate = dates[1]?.trim();
    }

    const detectedCurrency = currencyParam || detectCurrencyFromDestination(destination || "");
    const autoDetected = !currencyParam;

    if (!destination) {
      return NextResponse.json(
        { error: "Destination parameter is required" },
        { status: 400 }
      );
    }

    if (!budget || !["low", "medium", "high"].includes(budget)) {
      return NextResponse.json(
        { error: "Valid budget parameter (low/medium/high) is required" },
        { status: 400 }
      );
    }

    const city = extractCityName(destination);

    const cacheKey = `${city.toLowerCase()}-${budget}-${checkInDate || "default"}-${checkOutDate || "default"}-${detectedCurrency}-${guests}`;
    const cached = cache.get(cacheKey);

    if (cached && Date.now() - cached.timestamp < CACHE_DURATION) {
      const response = {
        hotels: cached.data.hotels,
        city: cached.data.city,
        budget: cached.data.budget,
        currency: cached.data.currency,
        source: cached.data.source,
      };

      return NextResponse.json(response, {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900",
          "X-Cache-Status": "HIT",
          "X-Data-Source": cached.data.source || "SMART_RECOMMENDATIONS",
        },
      });
    }

    let hotelsUSD = await fetchRealHotels(city, budget, checkInDate, checkOutDate, guests);
    let dataSource = "BOOKING_COM_API";

    if (!hotelsUSD || hotelsUSD.length === 0) {
      hotelsUSD = generateSmartHotels(city, budget, checkInDate, checkOutDate, guests);
      dataSource = "SMART_RECOMMENDATIONS";
    }

    const hotels = hotelsUSD.map((hotel) => ({
      ...hotel,
      priceUSD: hotel.price,
      price: convertPrice(hotel.price, detectedCurrency),
      currency: detectedCurrency,
    }));

    const currencyInfo = {
      code: detectedCurrency,
      symbol: CURRENCIES[detectedCurrency as keyof typeof CURRENCIES]?.symbol || "$",
      autoDetected,
    };

    const responseData = {
      hotels,
      city,
      budget,
      currency: currencyInfo,
      source: dataSource,
    };

    cache.set(cacheKey, {
      data: responseData,
      timestamp: Date.now(),
    });

    const response = {
      hotels,
      city,
      budget,
      currency: currencyInfo,
      source: dataSource as "BOOKING_COM_API" | "SMART_RECOMMENDATIONS",
    };

    return NextResponse.json(response, {
      headers: {
        "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=900",
        "X-Cache-Status": "MISS",
        "X-Data-Source": dataSource,
      },
    });
  } catch (error) {
    console.error("[Hotels API] Error:", error);
    const errorMessage = error instanceof Error ? error.message : "Unknown error";

    return NextResponse.json(
      { error: `Hotels service error: ${errorMessage}` },
      { status: 500 }
    );
  }
}
