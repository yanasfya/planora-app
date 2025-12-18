import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import ItineraryModel from "@lib/itineraryModel";
import { dbConnect } from "@lib/db";

// POST - Claim a guest itinerary after sign-in
export async function POST(request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { itineraryId } = await request.json();

    if (!itineraryId) {
      return NextResponse.json({ error: "Itinerary ID is required" }, { status: 400 });
    }

    await dbConnect();

    // Only claim unclaimed itineraries (userId is null)
    const itinerary = await ItineraryModel.findOneAndUpdate(
      { _id: itineraryId, userId: null },
      { $set: { userId: session.user.id } },
      { new: true }
    );

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found or already claimed" }, { status: 404 });
    }

    return NextResponse.json({ success: true, itinerary });
  } catch (error) {
    console.error("[Claim Itinerary] Error:", error);
    return NextResponse.json({ error: "Failed to claim itinerary" }, { status: 500 });
  }
}
