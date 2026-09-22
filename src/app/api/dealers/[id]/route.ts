import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Dealer from '@/models/Dealer';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const dealer = await Dealer.findByIdAndUpdate(id, body, { new: true });
    if (!dealer) {
      return NextResponse.json({ error: 'Dealer application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, dealer });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const { id } = params;

    const dealer = await Dealer.findByIdAndDelete(id);
    if (!dealer) {
      return NextResponse.json({ error: 'Dealer application not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Dealer application deleted' });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
