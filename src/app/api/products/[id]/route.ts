import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Product from '@/models/Product';
import { authenticateRequest } from '@/lib/auth';
import { revalidatePath } from 'next/cache';
import mongoose from 'mongoose';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

const noCacheHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
  'Pragma': 'no-cache',
  'Expires': '0',
};

// GET /api/products/[id] (by ID or Slug)
export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findById(id);
    }
    if (!product) {
      const decoded = decodeURIComponent(id).trim();
      const safeRegex = decoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      product = await Product.findOne({
        $or: [
          { slug: id },
          { slug: decoded },
          { slug: { $regex: new RegExp(`^${safeRegex}$`, 'i') } },
          { name: { $regex: new RegExp(`^${safeRegex}$`, 'i') } },
        ],
      });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: noCacheHeaders });
    }

    // Also fetch related products in same category
    const relatedProducts = await Product.find({
      category: product.category,
      _id: { $ne: product._id },
    }).limit(4);

    return NextResponse.json(
      { success: true, product, relatedProducts },
      { headers: noCacheHeaders }
    );
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

// PUT /api/products/[id] (Admin Protected)
export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noCacheHeaders });
    }

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findByIdAndUpdate(id, body, { new: true });
    } else {
      product = await Product.findOneAndUpdate({ slug: id }, body, { new: true });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: noCacheHeaders });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products');
      revalidatePath(`/products/${id}`);
      if (product.slug) revalidatePath(`/products/${product.slug}`);
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, product }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

// DELETE /api/products/[id] (Admin Protected)
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noCacheHeaders });
    }

    await connectToDatabase();
    const { id } = params;

    let product = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      product = await Product.findByIdAndDelete(id);
    } else {
      product = await Product.findOneAndDelete({ slug: id });
    }

    if (!product) {
      return NextResponse.json({ error: 'Product not found' }, { status: 404, headers: noCacheHeaders });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/products');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, message: 'Product deleted successfully' }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}
