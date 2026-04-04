"use client";

import Link from "next/link";
import { Search } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-screen bg-[#1A1A2E] flex flex-col items-center justify-center p-6 text-center">
      <div className="flex flex-col items-center max-w-md w-full animate-in fade-in slide-in-from-bottom-4 duration-500">
        
        <div className="h-32 w-32 bg-white/5 rounded-[40px] flex items-center justify-center mb-8 rotate-12">
          <Search size={48} className="text-[#E8541A] -rotate-12" />
        </div>
        
        <h1 className="text-6xl font-black text-white tracking-tight mb-2">404</h1>
        <h2 className="text-2xl font-black text-white/90 tracking-tight mb-6">WOD Not Found</h2>
        
        <p className="text-sm font-bold text-white/50 mb-10 text-center">
          It looks like this route was dropped heavier than a barbell. Check the URL and try again.
        </p>

        <Link
          href="/"
          className="bg-[#E8541A] text-white text-xs font-black uppercase tracking-widest px-10 py-5 rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-1 transition-all"
        >
          Return to Box
        </Link>
      </div>
    </div>
  );
}
