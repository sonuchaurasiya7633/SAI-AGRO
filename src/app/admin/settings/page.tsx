'use client';

import React, { useState, useEffect } from 'react';
import { Settings, Lock, CheckCircle2, Save, KeyRound, Loader2, AlertCircle } from 'lucide-react';

export default function AdminSettingsPage() {
  const [setting, setSetting] = useState<any>({
    companyName: 'SAI AGRO INDUSTRIES',
    tagline: 'Pioneering Sustainable Agriculture & High-Yield Bio Solutions',
    phonePrimary: '+91 98765 43210',
    phoneSecondary: '+91 91234 56789',
    whatsappNumber: '919876543210',
    emailPrimary: 'info@saiagroindustries.com',
    registeredAddress: 'Bela Industrial Area, Phase II, Agro Complex, India',
    factoryAddress: 'Plot No. 12-16, Eco Biotech Zone, Sai Agro Park',
    gstin: '10AAACS9988F1Z9',
    stats: {
      farmersHelped: '50,000+',
      productsDelivered: '1,50,000+',
      statesPresence: '18+ States',
      yieldImprovement: '25-35%',
    },
  });

  const [loading, setLoading] = useState(true);
  const [savingSettings, setSavingSettings] = useState(false);
  const [settingsSuccess, setSettingsSuccess] = useState(false);

  // Password Change State
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch('/api/settings');
        const data = await res.json();
        if (data.success && data.setting) {
          setSetting(data.setting);
        }
      } catch (err) {
        console.error('Failed to load settings:', err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSaveSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSettings(true);
    setSettingsSuccess(false);

    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(setting),
      });
      if (res.ok) {
        setSettingsSuccess(true);
        setTimeout(() => setSettingsSuccess(false), 4000);
      }
    } catch (err) {
      console.error('Failed to update settings:', err);
    } finally {
      setSavingSettings(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    setPasswordSuccess(false);

    if (newPassword !== confirmPassword) {
      setPasswordError('New password and confirm password do not match');
      return;
    }

    if (newPassword.length < 6) {
      setPasswordError('New password must be at least 6 characters long');
      return;
    }

    setChangingPassword(true);
    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setPasswordSuccess(true);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmPassword('');
        setTimeout(() => setPasswordSuccess(false), 5000);
      } else {
        setPasswordError(data.error || 'Failed to update password');
      }
    } catch {
      setPasswordError('An error occurred. Please try again.');
    } finally {
      setChangingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="py-20 text-center">
        <div className="w-10 h-10 border-4 border-lime-400 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p className="text-slate-400 text-xs">Loading company settings...</p>
      </div>
    );
  }

  return (
    <div className="space-y-10 max-w-4xl">
      
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-white">Company Profile & Security Settings</h1>
        <p className="text-xs text-slate-400">Manage public contact details, registered addresses, stats, and admin login password.</p>
      </div>

      {/* 1. Company Information Form */}
      <div className="rounded-3xl glass-panel p-8 border border-emerald-500/20 space-y-6">
        <div className="flex items-center justify-between border-b border-emerald-950 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Settings className="w-5 h-5 text-lime-400" /> General Company Information
          </h3>
          {settingsSuccess && (
            <span className="text-xs font-bold text-lime-400 flex items-center gap-1">
              <CheckCircle2 className="w-4 h-4" /> Changes Saved!
            </span>
          )}
        </div>

        <form onSubmit={handleSaveSettings} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Company Name</label>
              <input
                type="text"
                value={setting.companyName}
                onChange={(e) => setSetting({ ...setting, companyName: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">GSTIN Number</label>
              <input
                type="text"
                value={setting.gstin || ''}
                onChange={(e) => setSetting({ ...setting, gstin: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Company Tagline / Bio</label>
            <input
              type="text"
              value={setting.tagline || ''}
              onChange={(e) => setSetting({ ...setting, tagline: e.target.value })}
              className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Primary Phone</label>
              <input
                type="text"
                value={setting.phonePrimary || ''}
                onChange={(e) => setSetting({ ...setting, phonePrimary: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Secondary Phone</label>
              <input
                type="text"
                value={setting.phoneSecondary || ''}
                onChange={(e) => setSetting({ ...setting, phoneSecondary: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">WhatsApp Number (e.g. 919876543210)</label>
              <input
                type="text"
                value={setting.whatsappNumber || ''}
                onChange={(e) => setSetting({ ...setting, whatsappNumber: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Primary Email</label>
              <input
                type="email"
                value={setting.emailPrimary || ''}
                onChange={(e) => setSetting({ ...setting, emailPrimary: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
              />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">Registered Address</label>
              <input
                type="text"
                value={setting.registeredAddress || ''}
                onChange={(e) => setSetting({ ...setting, registeredAddress: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs"
              />
            </div>
          </div>

          {/* Stats Bar Configuration */}
          <div className="p-4 rounded-2xl bg-[#040e07] border border-emerald-900 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-lime-400">
              Hero Stats Counters
            </h4>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Farmers Helped</label>
                <input
                  type="text"
                  value={setting.stats?.farmersHelped || '50,000+'}
                  onChange={(e) => setSetting({ ...setting, stats: { ...setting.stats, farmersHelped: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#07170c] border border-emerald-900 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Products Delivered</label>
                <input
                  type="text"
                  value={setting.stats?.productsDelivered || '1,50,000+'}
                  onChange={(e) => setSetting({ ...setting, stats: { ...setting.stats, productsDelivered: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#07170c] border border-emerald-900 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">States Presence</label>
                <input
                  type="text"
                  value={setting.stats?.statesPresence || '18+ States'}
                  onChange={(e) => setSetting({ ...setting, stats: { ...setting.stats, statesPresence: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#07170c] border border-emerald-900 text-white text-xs"
                />
              </div>
              <div>
                <label className="block text-[11px] text-slate-400 mb-1">Yield Boost %</label>
                <input
                  type="text"
                  value={setting.stats?.yieldImprovement || '25-35%'}
                  onChange={(e) => setSetting({ ...setting, stats: { ...setting.stats, yieldImprovement: e.target.value } })}
                  className="w-full px-2.5 py-1.5 rounded-lg bg-[#07170c] border border-emerald-900 text-white text-xs"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={savingSettings}
            className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-emerald-500 to-lime-400 text-slate-950 font-bold text-xs shadow-lg flex items-center gap-2"
          >
            {savingSettings ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            <span>Save Company Information</span>
          </button>
        </form>
      </div>

      {/* 2. Admin Security & Password Change */}
      <div className="rounded-3xl glass-panel p-8 border border-emerald-500/20 space-y-6">
        <div className="border-b border-emerald-950 pb-4">
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Lock className="w-5 h-5 text-lime-400" /> Admin Account Security & Password
          </h3>
          <p className="text-xs text-slate-400 mt-1">Change your administrator password securely.</p>
        </div>

        {passwordError && (
          <div className="p-3 rounded-xl bg-red-950/80 border border-red-800 text-red-300 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>{passwordError}</span>
          </div>
        )}

        {passwordSuccess && (
          <div className="p-3 rounded-xl bg-emerald-950/80 border border-emerald-800 text-lime-400 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
            <span>Password successfully updated!</span>
          </div>
        )}

        <form onSubmit={handleChangePassword} className="space-y-4 max-w-md">
          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Current Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">New Password (Min. 6 chars) *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-300 mb-1">Confirm New Password *</label>
            <input
              type="password"
              required
              placeholder="••••••••"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3.5 py-2 rounded-xl bg-[#040e07] border border-emerald-900 text-white text-xs focus:border-lime-400 focus:outline-none"
            />
          </div>

          <button
            type="submit"
            disabled={changingPassword}
            className="px-6 py-2.5 rounded-xl bg-emerald-950 hover:bg-emerald-900 border border-emerald-700 text-lime-300 font-bold text-xs shadow-lg flex items-center gap-2 transition"
          >
            {changingPassword ? <Loader2 className="w-4 h-4 animate-spin" /> : <KeyRound className="w-4 h-4" />}
            <span>Update Admin Password</span>
          </button>
        </form>
      </div>

    </div>
  );
}
