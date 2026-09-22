import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Setting from '@/models/Setting';
import { authenticateRequest } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET(req?: NextRequest) {
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
        emailSupport: 'support@saiagroindustries.com',
        registeredAddress: 'Bela Industrial Area, Phase II, Agro Complex, India',
        factoryAddress: 'Plot No. 12-16, Eco Biotech Zone, Sai Agro Park',
        gstin: '10AAACS9988F1Z9',
        stats: {
          farmersHelped: '50,000+',
          productsDelivered: '1,50,000+',
          statesPresence: '18+ States',
          yieldImprovement: '25-35%',
        },
        socialLinks: {
          facebook: 'https://facebook.com',
          youtube: 'https://youtube.com',
          instagram: 'https://instagram.com',
          linkedin: 'https://linkedin.com',
          whatsapp: 'https://wa.me/919876543210',
        },
        heroVideoUrl: 'https://res.cloudinary.com/dqpbo1uho/video/upload/v1790006013/cfxq9ax4finlluesengh.mp4',
        heroVideoUrl2: 'https://res.cloudinary.com/dqpbo1uho/video/upload/v1790006093/okb0skw8akivryv3drin.mp4',
      });
    }

    return NextResponse.json({ success: true, setting });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}

async function handleUpdateSettings(req: NextRequest) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized. Please login again.' }, { status: 401 });
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

    return NextResponse.json({ success: true, setting, message: 'Settings updated successfully' });
  } catch (error: any) {
    console.error('Settings update error:', error);
    return NextResponse.json({ success: false, error: error.message || 'Failed to update settings' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  return handleUpdateSettings(req);
}

export async function POST(req: NextRequest) {
  return handleUpdateSettings(req);
}

export async function PATCH(req: NextRequest) {
  return handleUpdateSettings(req);
}
