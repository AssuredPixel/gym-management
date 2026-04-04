"use client";

import { useEffect } from "react";
import Link from "next/link";
import { AlertTriangle, RefreshCcw } from "lucide-react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service in production
    console.error("Global Application Error Caught:", error);
  }, [error]);

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-center">
      <div className="bg-white p-8 md:p-12 rounded-[32px] shadow-xl shadow-red-500/10 border border-gray-100 max-w-lg w-full flex flex-col items-center">
        <div className="h-20 w-20 bg-red-50 rounded-full flex items-center justify-center mb-6">
          <AlertTriangle size={36} className="text-red-500" />
        </div>
        
        <h2 className="text-3xl font-black text-[#1A1A2E] tracking-tight mb-3">Something went wrong!</h2>
        
        <p className="text-sm font-bold text-gray-500 mb-8 max-w-sm">
          A critical error occurred while rendering this page. We've logged it and are looking into it.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 w-full justify-center">
          <button
            onClick={() => reset()}
            className="bg-[#1A1A2E] text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center gap-2"
          >
            <RefreshCcw size={16} /> Try Again
          </button>
          <Link
            href="/"
            className="bg-gray-100 text-[#1A1A2E] text-xs font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-gray-200 transition-all block text-center"
          >
            Go Home
          </Link>
        </div>
      </div>
    </div>
  );
}
