import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { authenticateRequest } from '@/lib/auth';

export async function GET() {
  try {
    await connectToDatabase();
    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create({
        companyName: 'SAI AGRO INDUSTRIES',
        tagline: 'Pioneering Sustainable Agriculture & High-Yield Bio Solutions',
        phonePrimary: '+91 98765 43210',
        phoneSecondary: '+91 91234 56789',
        whatsappNumber: '919876543210',
        emailPrimary: 'info@saiagroindustries.com',
        registeredAddress: 'Bela Industrial Area, Phase II, Agro Complex, India',
        factoryAddress: 'Plot No. 12-16, Eco Biotech Zone, Sai Agro Park',
        gstin: '10AAACS9988F1Z9',
        heroVideoUrl: 'https://res.cloudinary.com/dqpbo1uho/video/upload/v1790006013/cfxq9ax4finlluesengh.mp4',
        heroVideoUrl2: 'https://res.cloudinary.com/dqpbo1uho/video/upload/v1790006093/okb0skw8akivryv3drin.mp4',
      });
    }

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();
    const body = await req.json();

    let setting = await Setting.findOne();
    if (!setting) {
      setting = await Setting.create(body);
    } else {
      Object.assign(setting, body);
      await setting.save();
    }

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}
