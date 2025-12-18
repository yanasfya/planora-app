import { NextRequest, NextResponse } from 'next/server';
import clientPromise from '@/lib/mongodb';
import { ObjectId } from 'mongodb';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const client = await clientPromise;
    const db = client.db('planora');

    const body = await request.json();
    const { days } = body;

    console.log('[Update Itinerary] Updating itinerary:', params.id);

    // Update itinerary
    const result = await db.collection('itineraries').findOneAndUpdate(
      { _id: new ObjectId(params.id) },
      {
        $set: {
          days,
          updatedAt: new Date()
        }
      },
      { returnDocument: 'after' }
    );

    if (!result) {
      return NextResponse.json(
        { error: 'Itinerary not found' },
        { status: 404 }
      );
    }

    console.log('[Update Itinerary] Successfully updated');

    return NextResponse.json({
      success: true,
      itinerary: result
    });

  } catch (error) {
    console.error('[Update Itinerary] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update itinerary' },
      { status: 500 }
    );
  }
}
