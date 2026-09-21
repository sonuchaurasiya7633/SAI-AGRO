'use client';

import React, { useState, useEffect } from 'react';
import { BookOpen, Plus, Edit, Trash2, X, CheckCircle2, Upload, Loader2, Search } from 'lucide-react';

interface BlogItem {
  _id: string;
  title: string;
  slug: string;
  category: string;
  author: string;
  readTime: string;
  coverImage: string;
  summary: string;
  content: string;
  tags: string[];
  isPublished: boolean;
  createdAt: string;
}

export default function AdminBlogsPage() {
  const [blogs, setBlogs] = useState<BlogItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBlog, setEditingBlog] = useState<BlogItem | null>(null);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Crop Nutrition',
    author: 'Sai Agro Agronomy Team',
    readTime: '5 min read',
    coverImage: '',
    summary: '',
    content: '',
    tagsStr: 'Bio-Fertilizers, Soil Health, Crop Yield',
    isPublished: true,
  });

  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchBlogs();
  }, []);

  async function fetchBlogs() {
    setLoading(true);
    try {
      const res = await fetch('/api/blogs?publishedOnly=false');
      const data = await res.json();
      if (data.success) {
        setBlogs(data.blogs || []);
      }
    } catch (err) {
      console.error('Failed to load blogs:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleOpenAdd = () => {
    setEditingBlog(null);
    setFormData({
      title: '',
      category: 'Crop Nutrition',
      author: 'Sai Agro Agronomy Team',
      readTime: '5 min read',
      coverImage: '',
      summary: '',
      content: '<h2>Scientific Overview</h2><p>Write your detailed agricultural guidance here...</p>',
      tagsStr: 'Bio-Fertilizers, Soil Health, Yield Boost',
      isPublished: true,
    });
    setIsModalOpen(true);
  };

  const handleOpenEdit = (b: BlogItem) => {
    setEditingBlog(b);
    setFormData({
      title: b.title,
      category: b.category,
      author: b.author,
      readTime: b.readTime,
      coverImage: b.coverImage || '',
      summary: b.summary,
      content: b.content,
      tagsStr: b.tags?.join(', ') || '',
      isPublished: b.isPublished,
    });
    setIsModalOpen(true);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'sai_agro_blogs');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setFormData((prev) => ({ ...prev, coverImage: data.url }));
      }
    } catch (err) {
      console.error('Upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    const payload = {
      ...formData,
      tags: formData.tagsStr.split(',').map((t) => t.trim()).filter(Boolean),
    };

    try {
      let res;
      if (editingBlog) {
        res = await fetch(`/api/blogs/${editingBlog._id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      } else {
        res = await fetch('/api/blogs', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload),
        });
      }

      if (res.ok) {
        setIsModalOpen(false);
        fetchBlogs();
      }
    } catch (err) {
      console.error('Error saving blog:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this article?')) return;
    try {
      await fetch(`/api/blogs/${id}`, { method: 'DELETE' });
      fetchBlogs();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Knowledge Hub & Agronomy Blogs</h1>
          <p className="text-xs text-slate-400">Publish farming articles, pest advisories, and organic cultivation tutorials.</p>
        </div>

        <button
          onClick={handleOpenAdd}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Publish New Article
        </button>
      </div>

      {/* Blogs List */}
      <div className="glass-panel rounded-3xl border border-emerald-500/20 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs">Loading articles...</p>
          </div>
        ) : blogs.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No articles found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#040e07] border-b border-emerald-950 text-slate-400">
                  <th className="py-3 px-4">Cover</th>
                  <th className="py-3 px-4">Title</th>
                  <th className="py-3 px-4">Category</th>
                  <th className="py-3 px-4">Author</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {blogs.map((b) => (
                  <tr key={b._id} className="hover:bg-emerald-950/30 transition">
                    <td className="py-3 px-4">
                      <div className="w-14 h-10 rounded-lg bg-[#040e07] border border-emerald-900 overflow-hidden">
                        {b.coverImage ? (
                          <img src={b.coverImage} alt={b.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center text-slate-600">
                            <BookOpen className="w-4 h-4" />
                          </div>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-bold text-white text-sm max-w-sm line-clamp-1">{b.title}</div>
                      <div className="text-slate-400 text-[11px] line-clamp-1">{b.summary}</div>
                    </td>
                    <td className="py-3 px-4">
                      <span className="px-2.5 py-0.5 rounded-full bg-emerald-950 border border-emerald-800 text-lime-300 text-[10px] font-semibold">
                        {b.category}
                      </span>
                    </td>
                    <td className="py-3 px-4 text-slate-300">
                      {b.author}
                    </td>
                    <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                      {new Date(b.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleOpenEdit(b)}
                          className="p-1.5 rounded-lg bg-emerald-950 text-lime-400 hover:bg-emerald-900 transition"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleDelete(b._id)}
                          className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="relative w-full max-w-2xl my-8 rounded-3xl glass-panel p-6 sm:p-8 border border-emerald-500/40 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-emerald-950 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-xl font-bold text-white">
                {editingBlog ? 'Edit Farming Article' : 'Write New Farming Article'}
              </h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Article Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 5 Tips to Rejuvenate Depleted Soil Microbiome"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:outline-none"
                  >
                    <option value="Crop Nutrition">Crop Nutrition</option>
                    <option value="Modern Farming">Modern Farming</option>
                    <option value="Bio-Pest Control">Bio-Pest Control</option>
                    <option value="Soil Health">Soil Health</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Author</label>
                  <input
                    type="text"
                    value={formData.author}
                    onChange={(e) => setFormData({ ...formData, author: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Read Time</label>
                  <input
                    type="text"
                    value={formData.readTime}
                    onChange={(e) => setFormData({ ...formData, readTime: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Summary / Lead Paragraph *</label>
                <textarea
                  rows={2}
                  required
                  value={formData.summary}
                  onChange={(e) => setFormData({ ...formData, summary: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs resize-none"
                />
              </div>

              {/* Cover Image Upload */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-300">Cover Image (Cloudinary)</label>
                <div className="flex items-center gap-3">
                  <label className="px-3.5 py-1.5 rounded-xl bg-emerald-950 border border-emerald-700 text-lime-300 text-xs font-bold cursor-pointer flex items-center gap-2">
                    <Upload className="w-4 h-4" />
                    <span>{uploading ? 'Uploading...' : 'Choose Cover Photo'}</span>
                    <input type="file" onChange={handleImageUpload} disabled={uploading} className="hidden" />
                  </label>
                  {formData.coverImage && (
                    <span className="text-[11px] text-lime-400 font-mono truncate max-w-xs">
                      {formData.coverImage}
                    </span>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Full Article Content (HTML / Text) *</label>
                <textarea
                  rows={8}
                  required
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs font-mono resize-y"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Tags (Comma separated)</label>
                <input
                  type="text"
                  value={formData.tagsStr}
                  onChange={(e) => setFormData({ ...formData, tagsStr: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs shadow-xl flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>{editingBlog ? 'Save Changes' : 'Publish Article'}</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
