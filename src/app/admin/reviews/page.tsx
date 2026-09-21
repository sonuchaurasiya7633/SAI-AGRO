'use client';

import React, { useState, useEffect } from 'react';
import { Star, Plus, Trash2, X, CheckCircle2, Loader2, User } from 'lucide-react';

interface ReviewItem {
  _id: string;
  farmerName: string;
  village: string;
  district: string;
  state: string;
  cropGrown: string;
  productUsed: string;
  yieldIncreasePercent: string;
  rating: number;
  reviewText: string;
  isVerified: boolean;
}

export default function AdminReviewsPage() {
  const [reviews, setReviews] = useState<ReviewItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const [formData, setFormData] = useState({
    farmerName: '',
    village: '',
    district: '',
    state: '',
    cropGrown: 'Paddy / Basmati',
    productUsed: 'Sai Bio-Phos & Sai Grow-Max',
    yieldIncreasePercent: '+30%',
    rating: 5,
    reviewText: '',
  });

  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchReviews();
  }, []);

  async function fetchReviews() {
    setLoading(true);
    try {
      const res = await fetch('/api/reviews');
      const data = await res.json();
      if (data.success) {
        setReviews(data.reviews || []);
      }
    } catch (err) {
      console.error('Failed to load reviews:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...formData, isVerified: true }),
      });
      if (res.ok) {
        setIsModalOpen(false);
        setFormData({
          farmerName: '',
          village: '',
          district: '',
          state: '',
          cropGrown: 'Paddy / Basmati',
          productUsed: 'Sai Bio-Phos & Sai Grow-Max',
          yieldIncreasePercent: '+30%',
          rating: 5,
          reviewText: '',
        });
        fetchReviews();
      }
    } catch (err) {
      console.error('Save failed:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return;
    try {
      await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
      fetchReviews();
    } catch (err) {
      console.error('Delete failed:', err);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Farmer Stories & Testimonials</h1>
          <p className="text-xs text-slate-400">Manage verified farmer yield reports and crop feedback displayed on the portal.</p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs flex items-center gap-1.5 shadow-lg"
        >
          <Plus className="w-4 h-4" /> Add Testimonial
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {reviews.map((rev) => (
          <div
            key={rev._id}
            className="glass-card rounded-3xl p-6 border border-emerald-500/20 flex flex-col justify-between"
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  {[...Array(rev.rating || 5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950 text-lime-400 border border-emerald-800">
                  {rev.yieldIncreasePercent}
                </span>
              </div>

              <p className="text-xs text-slate-300 italic line-clamp-3">
                &ldquo;{rev.reviewText}&rdquo;
              </p>

              <div className="text-[11px] text-slate-400 space-y-0.5 pt-1">
                <div>Crop: <strong className="text-white">{rev.cropGrown}</strong></div>
                <div>Used: <strong className="text-lime-300">{rev.productUsed}</strong></div>
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-emerald-950 flex items-center justify-between">
              <div>
                <h5 className="font-bold text-white text-xs">{rev.farmerName}</h5>
                <p className="text-[10px] text-slate-400">{rev.district}, {rev.state}</p>
              </div>
              <button
                onClick={() => handleDelete(rev._id)}
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
              <h3 className="text-lg font-bold text-white">Add Farmer Testimonial</h3>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Farmer Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Ramesh Patel"
                    value={formData.farmerName}
                    onChange={(e) => setFormData({ ...formData, farmerName: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Village / Town</label>
                  <input
                    type="text"
                    placeholder="e.g. Baramati"
                    value={formData.village}
                    onChange={(e) => setFormData({ ...formData, village: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">District *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Pune"
                    value={formData.district}
                    onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">State *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Maharashtra"
                    value={formData.state}
                    onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Crop Grown *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sugarcane & Tomato"
                    value={formData.cropGrown}
                    onChange={(e) => setFormData({ ...formData, cropGrown: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">Yield Increase %</label>
                  <input
                    type="text"
                    placeholder="e.g. +34%"
                    value={formData.yieldIncreasePercent}
                    onChange={(e) => setFormData({ ...formData, yieldIncreasePercent: e.target.value })}
                    className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Product Used *</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Sai Grow-Max + Sai Humic-King"
                  value={formData.productUsed}
                  onChange={(e) => setFormData({ ...formData, productUsed: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1">Farmer Review / Quote *</label>
                <textarea
                  rows={3}
                  required
                  placeholder="Farmer's personal experience and harvest results..."
                  value={formData.reviewText}
                  onChange={(e) => setFormData({ ...formData, reviewText: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs resize-none"
                />
              </div>

              <button
                type="submit"
                disabled={saving}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs shadow-lg flex items-center justify-center gap-2"
              >
                {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Save Testimonial</span>
              </button>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
