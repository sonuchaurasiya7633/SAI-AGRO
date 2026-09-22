import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Media from '@/models/Media';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get('type');
    const category = searchParams.get('category');
    const featured = searchParams.get('featured');

    const query: any = {};
    if (type && type !== 'all') query.type = type;
    if (category && category !== 'all') query.category = category;
    if (featured === 'true') query.featured = true;

    const media = await Media.find(query).sort({ order: 1, createdAt: -1 });
    return NextResponse.json({ success: true, media });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await req.json();
    if (!body.title || !body.url) {
      return NextResponse.json({ error: 'Title and URL are required' }, { status: 400 });
    }

    await connectToDatabase();
    const media = await Media.create(body);

    return NextResponse.json({ success: true, media }, { status: 201 });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
