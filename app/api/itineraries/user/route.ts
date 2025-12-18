import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth";
import ItineraryModel from "@lib/itineraryModel";
import { dbConnect } from "@lib/db";

// GET all itineraries for logged-in user
export async function GET(_request: NextRequest) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();

    // Fetch all itineraries (drafts and saved)
    // Filter out expired drafts
    const itineraries = await ItineraryModel.find({
      userId: session.user.id,
      $or: [
        { status: "saved" },
        { status: "draft", expiresAt: { $gt: new Date() } },
        { status: { $exists: false } }, // Handle legacy itineraries without status
      ],
    })
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json(itineraries);
  } catch (error) {
    console.error("[User Itineraries] Error:", error);
    return NextResponse.json({ error: "Failed to fetch itineraries" }, { status: 500 });
  }
}
