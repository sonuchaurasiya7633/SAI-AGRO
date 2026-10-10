'use client';

import React from 'react';
import Link from 'next/link';
import { Home, ArrowLeft } from 'lucide-react';

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#07130b] flex items-center justify-center px-4 py-16 text-center">
      <div className="max-w-md w-full space-y-6">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-emerald-950 border border-emerald-800 text-lime-400 text-4xl font-black shadow-xl">
          404
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-white tracking-tight">
          Page Not Found
        </h1>
        <p className="text-sm text-slate-300">
          The page you are looking for does not exist or has been moved.
        </p>
        <div className="flex items-center justify-center gap-4 pt-2">
          <Link
            href="/"
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-lime-500 hover:from-emerald-500 hover:to-lime-400 text-slate-950 font-black text-xs shadow-lg flex items-center gap-2 transition"
          >
            <Home className="w-4 h-4" /> Go to Homepage
          </Link>
        </div>
      </div>
    </div>
  );
}
