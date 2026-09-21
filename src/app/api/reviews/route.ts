import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Review from '@/models/Review';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    const reviews = await Review.find().sort({ createdAt: -1 });
    return NextResponse.json({ success: true, reviews });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    const body = await req.json();

    if (!body.farmerName || !body.district || !body.state || !body.cropGrown || !body.reviewText) {
      return NextResponse.json({ error: 'Farmer name, location, crop, and review text are required' }, { status: 400 });
    }

    await connectToDatabase();
    const review = await Review.create({
      ...body,
      isVerified: !!session || body.isVerified,
    });

    return NextResponse.json({ success: true, review }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
