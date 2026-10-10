import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Blog from '@/models/Blog';
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

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase();
    const { id } = params;

    let blog = null;
    if (mongoose.Types.ObjectId.isValid(id)) {
      blog = await Blog.findById(id);
    }
    if (!blog) {
      const decoded = decodeURIComponent(id).trim();
      const safeRegex = decoded.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      blog = await Blog.findOne({
        $or: [
          { slug: id },
          { slug: decoded },
          { slug: { $regex: new RegExp(`^${safeRegex}$`, 'i') } },
          { title: { $regex: new RegExp(`^${safeRegex}$`, 'i') } },
        ],
      });
    }

    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404, headers: noCacheHeaders });
    }

    // Increment views
    try {
      blog.views = (blog.views || 0) + 1;
      await blog.save();
    } catch {}

    const relatedBlogs = await Blog.find({
      category: blog.category,
      _id: { $ne: blog._id },
      isPublished: true,
    }).limit(3);

    return NextResponse.json({ success: true, blog, relatedBlogs }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noCacheHeaders });
    }

    await connectToDatabase();
    const { id } = params;
    const body = await req.json();

    const blog = await Blog.findByIdAndUpdate(id, body, { new: true });
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404, headers: noCacheHeaders });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/blog');
      revalidatePath(`/blog/${id}`);
      if (blog.slug) revalidatePath(`/blog/${blog.slug}`);
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, blog }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await authenticateRequest(req);
    if (!session) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401, headers: noCacheHeaders });
    }

    await connectToDatabase();
    const { id } = params;

    const blog = await Blog.findByIdAndDelete(id);
    if (!blog) {
      return NextResponse.json({ error: 'Blog not found' }, { status: 404, headers: noCacheHeaders });
    }

    try {
      revalidatePath('/', 'layout');
      revalidatePath('/blog');
    } catch (e) {
      console.warn('Revalidation notice:', e);
    }

    return NextResponse.json({ success: true, message: 'Blog deleted' }, { headers: noCacheHeaders });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500, headers: noCacheHeaders });
  }
}
