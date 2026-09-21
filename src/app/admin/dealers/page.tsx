'use client';

import React, { useState, useEffect } from 'react';
import { 
  Building2, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  MessageCircle 
} from 'lucide-react';

interface DealerItem {
  _id: string;
  businessName: string;
  applicantName: string;
  phone: string;
  email: string;
  state: string;
  district: string;
  city: string;
  pincode: string;
  gstNumber?: string;
  experienceYears: string;
  annualTurnover?: string;
  preferredProducts: string[];
  status: string;
  createdAt: string;
}

export default function AdminDealersPage() {
  const [dealers, setDealers] = useState<DealerItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchDealers();
  }, [statusFilter]);

  async function fetchDealers() {
    setLoading(true);
    try {
      let url = `/api/dealers`;
      if (statusFilter !== 'all') url += `?status=${encodeURIComponent(statusFilter)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setDealers(data.dealers || []);
      }
    } catch (err) {
      console.error('Failed to load dealers:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/dealers/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchDealers();
    } catch (err) {
      console.error('Failed to update dealer status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this dealer application?')) return;
    try {
      await fetch(`/api/dealers/${id}`, { method: 'DELETE' });
      fetchDealers();
    } catch (err) {
      console.error('Failed to delete dealer:', err);
    }
  };

  const filteredDealers = dealers.filter((d) => {
    if (!search.trim()) return true;
    return (
      d.businessName.toLowerCase().includes(search.toLowerCase()) ||
      d.applicantName.toLowerCase().includes(search.toLowerCase()) ||
      d.phone.includes(search) ||
      d.state.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Distributor & Dealership Applications</h1>
          <p className="text-xs text-slate-400">Review prospective agro-dealers, commercial credentials, and approve distribution rights.</p>
        </div>

        <button
          onClick={fetchDealers}
          className="p-2.5 rounded-xl bg-[#07170c] border border-emerald-900 text-slate-300 hover:text-white transition self-start sm:self-auto"
        >
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {/* Filter Row */}
      <div className="rounded-2xl glass-panel p-4 border border-emerald-500/20 flex flex-wrap items-center gap-4">
        <div className="flex-grow min-w-[200px]">
          <input
            type="text"
            placeholder="Search by business name, proprietor, phone, state..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
          />
        </div>

        <div>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:outline-none"
          >
            <option value="all">Status: All</option>
            <option value="Pending">Pending</option>
            <option value="Under Review">Under Review</option>
            <option value="Approved">Approved</option>
            <option value="Rejected">Rejected</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-emerald-500/20 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs">Loading dealer applications...</p>
          </div>
        ) : filteredDealers.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No dealer applications found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#040e07] border-b border-emerald-950 text-slate-400">
                  <th className="py-3 px-4">Business / Proprietor</th>
                  <th className="py-3 px-4">Location</th>
                  <th className="py-3 px-4">Commercial Info</th>
                  <th className="py-3 px-4">Preferred Categories</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {filteredDealers.map((d) => {
                  const whatsappChatUrl = `https://wa.me/${d.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${d.applicantName}, regarding your distributorship application for ${d.businessName} with Sai Agro Industries.`
                  )}`;

                  return (
                    <tr key={d._id} className="hover:bg-emerald-950/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{d.businessName}</div>
                        <div className="text-slate-300 font-medium">Prop: {d.applicantName}</div>
                        <div className="text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${d.phone}`} className="hover:underline">{d.phone}</a>
                        </div>
                        <div className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Mail className="w-3 h-3" /> {d.email}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{d.city || d.district}, {d.state}</div>
                        <div className="text-[10px] text-slate-400">PIN: {d.pincode}</div>
                      </td>

                      <td className="py-3 px-4 space-y-0.5">
                        {d.gstNumber && (
                          <div className="text-slate-300">GST: <span className="font-mono text-lime-300">{d.gstNumber}</span></div>
                        )}
                        <div className="text-slate-400">Exp: {d.experienceYears}</div>
                        {d.annualTurnover && (
                          <div className="text-slate-400">Turnover: {d.annualTurnover}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs">
                        <div className="flex flex-wrap gap-1">
                          {d.preferredProducts?.map((p, i) => (
                            <span key={i} className="px-2 py-0.5 rounded bg-emerald-950 text-[10px] text-lime-300 border border-emerald-900">
                              {p}
                            </span>
                          ))}
                        </div>
                      </td>

                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(d.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={d.status}
                          onChange={(e) => handleUpdateStatus(d._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${
                            d.status === 'Approved'
                              ? 'bg-lime-400 text-slate-950 border-lime-400'
                              : d.status === 'Under Review'
                              ? 'bg-amber-400 text-slate-950 border-amber-400'
                              : 'bg-[#040e07] text-slate-300 border-emerald-900'
                          }`}
                        >
                          <option value="Pending">Pending</option>
                          <option value="Under Review">Under Review</option>
                          <option value="Approved">Approved</option>
                          <option value="Rejected">Rejected</option>
                        </select>
                      </td>

                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={whatsappChatUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-1.5 rounded-lg bg-[#25D366]/20 hover:bg-[#25D366] text-[#25D366] hover:text-slate-950 transition"
                            title="Chat on WhatsApp"
                          >
                            <MessageCircle className="w-4 h-4" />
                          </a>

                          <button
                            onClick={() => handleDelete(d._id)}
                            className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 transition"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

    </div>
  );
}
