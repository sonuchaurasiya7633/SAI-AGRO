'use client';

import React, { useState, useEffect } from 'react';
import { Video, Image as ImageIcon, Plus, Trash2, X, CheckCircle2, Play, Upload, Loader2 } from 'lucide-react';

interface MediaItem {
  _id: string;
  title: string;
  type: 'video' | 'image';
  url: string;
  thumbnailUrl?: string;
  category: string;
  description?: string;
  featured: boolean;
}

export default function AdminMediaPage() {
  const [media, setMedia] = useState<MediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [title, setTitle] = useState('');
  const [type, setType] = useState<'video' | 'image'>('video');
  const [url, setUrl] = useState('');
  const [category, setCategory] = useState('Factory Tour');
  const [description, setDescription] = useState('');
  const [featured, setFeatured] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchMedia();
  }, []);

  async function fetchMedia() {
    setLoading(true);
    try {
      const res = await fetch('/api/media');
      const data = await res.json();
      if (data.success) {
        setMedia(data.media || []);
      }
    } catch (err) {
      console.error('Failed to load media:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file);
      fd.append('folder', 'sai_agro_media');

      const res = await fetch('/api/upload', {
        method: 'POST',
        body: fd,
      });

      const data = await res.json();
      if (res.ok && data.url) {
        setUrl(data.url);
        setType(file.type.startsWith('video/') ? 'video' : 'image');
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
    try {
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title, type, url, category, description, featured }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setTitle('');
        setUrl('');
        setDescription('');
        fetchMedia();
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this media item?')) return;
    try {
      await fetch(`/api/media/${id}`, { method: 'DELETE' });
      fetchMedia();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Media & Video Showcase Manager</h1>
          <p className="text-xs text-slate-400">Manage factory tour videos, farmer field demonstrations, and facility photos.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Video / Image
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {media.map((item) => (
          <div
            key={item._id}
            className="glass-card rounded-3xl overflow-hidden border border-emerald-500/20 flex flex-col justify-between"
          >
            <div className="relative aspect-video bg-black overflow-hidden">
              {item.type === 'video' ? (
                <video src={item.url} muted playsInline className="w-full h-full object-cover" />
              ) : (
                <img src={item.url} alt={item.title} className="w-full h-full object-cover" />
              )}
              <div className="absolute top-3 left-3">
                <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950/90 text-lime-300 border border-emerald-800">
                  {item.category}
                </span>
              </div>
            </div>

            <div className="p-5 flex-grow space-y-2">
              <h4 className="font-bold text-white text-sm line-clamp-1">{item.title}</h4>
              {item.description && (
                <p className="text-xs text-slate-400 line-clamp-2">{item.description}</p>
              )}
            </div>

            <div className="p-4 pt-0 border-t border-emerald-950/60 flex items-center justify-between">
              <span className="text-[11px] text-emerald-400 font-mono truncate max-w-[200px]">
                {item.url}
              </span>
              <button
                onClick={() => handleDelete(item._id)}
                className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 transition"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative w-full max-w-lg rounded-3xl glass-panel p-6 border border-emerald-500/40 shadow-2xl space-y-4">
            <button
              onClick={() => setIsModalOpen(false)}
              className="absolute top-5 right-5 p-2 rounded-full bg-emerald-950 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <h3 className="text-lg font-bold text-white">Add Media Item</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Title *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Factory Tour - Automated Packing Line"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Type</label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value as any)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:outline-none"
                  >
                    <option value="video">Video (MP4 / Cloudinary)</option>
                    <option value="image">Image (JPG / PNG)</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Category</label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:outline-none"
                  >
                    <option value="Factory Tour">Factory Tour</option>
                    <option value="Field Trial">Field Trial</option>
                    <option value="Product Demonstration">Product Demonstration</option>
                    <option value="Farmer Experience">Farmer Experience</option>
                    <option value="Corporate">Corporate</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Media URL * (Cloudinary Stream or Direct Link)</label>
                <input
                  type="url"
                  required
                  placeholder="https://res.cloudinary.com/.../video.mp4"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
                />
              </div>

              {/* Upload Direct */}
              <div className="p-3 rounded-xl bg-[#040e07] border border-emerald-900 flex items-center justify-between">
                <span className="text-xs text-slate-400">Or upload directly:</span>
                <label className="px-3 py-1.5 rounded-lg bg-emerald-950 border border-emerald-700 text-lime-300 text-xs font-bold cursor-pointer">
                  {uploading ? 'Uploading...' : 'Choose File'}
                  <input type="file" onChange={handleFileUpload} disabled={uploading} className="hidden" />
                </label>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Brief description of the media..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Media Item</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
