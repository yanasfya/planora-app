import { NextRequest, NextResponse } from "next/server";
import { dbConnect } from "@lib/db";
import ItineraryModel from "@lib/itineraryModel";
import { auth } from "@/lib/auth";

type Params = { params: { id: string } };

export async function GET(_req: Request, { params }: Params) {
  try {
    await dbConnect();
    const doc = await ItineraryModel.findById(params.id);

    if (!doc) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    return NextResponse.json(doc);
  } catch (error) {
    console.error('[GET Itinerary] Error:', error);
    return NextResponse.json({ error: "Failed to fetch itinerary" }, { status: 500 });
  }
}

// PATCH - Update itinerary (edit activities, change privacy)
export async function PATCH(
  request: NextRequest,
  { params }: Params
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const updates = await request.json();

    const itinerary = await ItineraryModel.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      { $set: updates },
      { new: true }
    );

    if (!itinerary) {
      return NextResponse.json({ error: "Itinerary not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json(itinerary);
  } catch (error) {
    return NextResponse.json({ error: "Failed to update itinerary" }, { status: 500 });
  }
}

// DELETE itinerary
export async function DELETE(
  _request: NextRequest,
  { params }: Params
) {
  try {
    const session = await auth();
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await dbConnect();
    const result = await ItineraryModel.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!result) {
      return NextResponse.json({ error: "Itinerary not found or unauthorized" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Failed to delete itinerary" }, { status: 500 });
  }
}
