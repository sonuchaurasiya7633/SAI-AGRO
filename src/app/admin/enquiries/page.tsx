'use client';

import React, { useState, useEffect } from 'react';
import { 
  MessageSquare, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Trash2, 
  CheckCircle2, 
  RefreshCw, 
  ExternalLink,
  MessageCircle
} from 'lucide-react';

interface EnquiryItem {
  _id: string;
  fullName: string;
  phone: string;
  email?: string;
  state: string;
  district?: string;
  inquiryType: string;
  productName?: string;
  quantity?: string;
  message: string;
  status: string;
  notes?: string;
  createdAt: string;
}

export default function AdminEnquiriesPage() {
  const [enquiries, setEnquiries] = useState<EnquiryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchEnquiries();
  }, [statusFilter, typeFilter]);

  async function fetchEnquiries() {
    setLoading(true);
    try {
      let url = `/api/enquiries?limit=100`;
      if (statusFilter !== 'all') url += `&status=${encodeURIComponent(statusFilter)}`;
      if (typeFilter !== 'all') url += `&type=${encodeURIComponent(typeFilter)}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setEnquiries(data.enquiries || []);
      }
    } catch (err) {
      console.error('Failed to load enquiries:', err);
    } finally {
      setLoading(false);
    }
  }

  const handleUpdateStatus = async (id: string, newStatus: string) => {
    try {
      await fetch(`/api/enquiries/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      fetchEnquiries();
    } catch (err) {
      console.error('Failed to update status:', err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this enquiry?')) return;
    try {
      await fetch(`/api/enquiries/${id}`, { method: 'DELETE' });
      fetchEnquiries();
    } catch (err) {
      console.error('Failed to delete enquiry:', err);
    }
  };

  const filteredEnquiries = enquiries.filter((e) => {
    if (!search.trim()) return true;
    return (
      e.fullName.toLowerCase().includes(search.toLowerCase()) ||
      e.phone.includes(search) ||
      e.state?.toLowerCase().includes(search.toLowerCase()) ||
      e.productName?.toLowerCase().includes(search.toLowerCase())
    );
  });

  return (
    <div className="space-y-6">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white">Leads & Quotation Enquiries</h1>
          <p className="text-xs text-slate-400">Track and respond to incoming farmer quotes, bulk orders, and dealership inquiries.</p>
        </div>

        <button
          onClick={fetchEnquiries}
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
            placeholder="Search by customer name, phone, state..."
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
            <option value="New">New</option>
            <option value="In Review">In Review</option>
            <option value="Contacted">Contacted</option>
            <option value="Converted">Converted</option>
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div>
          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:outline-none"
          >
            <option value="all">Type: All</option>
            <option value="Product Quote">Product Quote</option>
            <option value="Farmer Advisory">Farmer Advisory</option>
            <option value="Dealership">Dealership</option>
            <option value="Bulk Order">Bulk Order</option>
            <option value="General">General</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="glass-panel rounded-3xl border border-emerald-500/20 overflow-hidden">
        {loading ? (
          <div className="py-20 text-center">
            <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
            <p className="text-slate-400 text-xs">Loading enquiries...</p>
          </div>
        ) : filteredEnquiries.length === 0 ? (
          <div className="py-16 text-center text-slate-400 text-xs">
            No inquiries found matching criteria.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="bg-[#040e07] border-b border-emerald-950 text-slate-400">
                  <th className="py-3 px-4">Customer Info</th>
                  <th className="py-3 px-4">Inquiry Type</th>
                  <th className="py-3 px-4">Product / Quantity</th>
                  <th className="py-3 px-4">Message / Requirements</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-emerald-950/60">
                {filteredEnquiries.map((enq) => {
                  const whatsappChatUrl = `https://wa.me/${enq.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    `Hello ${enq.fullName}, thank you for contacting Sai Agro Industries regarding ${enq.productName || 'our agricultural bio-formulations'}.`
                  )}`;

                  return (
                    <tr key={enq._id} className="hover:bg-emerald-950/30 transition">
                      <td className="py-3 px-4">
                        <div className="font-bold text-white text-sm">{enq.fullName}</div>
                        <div className="text-emerald-400 font-medium flex items-center gap-1 mt-0.5">
                          <Phone className="w-3 h-3" />
                          <a href={`tel:${enq.phone}`} className="hover:underline">{enq.phone}</a>
                        </div>
                        {enq.email && (
                          <div className="text-[11px] text-slate-400 flex items-center gap-1">
                            <Mail className="w-3 h-3" /> {enq.email}
                          </div>
                        )}
                        <div className="text-[10px] text-slate-500 flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-lime-400" /> {enq.district ? `${enq.district}, ` : ''}{enq.state}
                        </div>
                      </td>

                      <td className="py-3 px-4">
                        <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-950 text-lime-300 border border-emerald-800">
                          {enq.inquiryType}
                        </span>
                      </td>

                      <td className="py-3 px-4">
                        <div className="font-semibold text-white">{enq.productName || 'General Inquiry'}</div>
                        {enq.quantity && (
                          <div className="text-[11px] text-lime-400 font-medium">Qty: {enq.quantity}</div>
                        )}
                      </td>

                      <td className="py-3 px-4 max-w-xs text-slate-300">
                        <p className="line-clamp-3">{enq.message}</p>
                      </td>

                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap text-[11px]">
                        {new Date(enq.createdAt).toLocaleDateString()}
                      </td>

                      <td className="py-3 px-4">
                        <select
                          value={enq.status}
                          onChange={(e) => handleUpdateStatus(enq._id, e.target.value)}
                          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold border focus:outline-none ${
                            enq.status === 'New'
                              ? 'bg-lime-400 text-slate-950 border-lime-400'
                              : enq.status === 'Contacted'
                              ? 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              : 'bg-[#040e07] text-slate-300 border-emerald-900'
                          }`}
                        >
                          <option value="New">New</option>
                          <option value="In Review">In Review</option>
                          <option value="Contacted">Contacted</option>
                          <option value="Converted">Converted</option>
                          <option value="Closed">Closed</option>
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
                            onClick={() => handleDelete(enq._id)}
                            className="p-1.5 rounded-lg bg-red-950 text-red-400 hover:bg-red-900 transition"
                            title="Delete Lead"
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
