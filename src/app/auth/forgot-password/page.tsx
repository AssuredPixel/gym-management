"use client";

import { useState } from "react";
import { Mail, ArrowLeft, Loader2, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { BoxOSLogo } from "@/components/ui/logo";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      if (res.ok) {
        setSuccess(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send reset link");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50">
      <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100">
        <div className="mb-8 text-center">
          <BoxOSLogo className="mx-auto" />
          <h1 className="mt-8 text-2xl font-black text-text-primary">Forgot Password?</h1>
          <p className="mt-2 text-sm text-text-secondary font-medium tracking-tight">
            Enter your email and we'll send you a link to reset your password.
          </p>
        </div>

        {success ? (
          <div className="text-center py-8 space-y-4">
            <div className="mx-auto h-16 w-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center animate-in zoom-in-95">
              <CheckCircle2 size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-bold text-gray-900">Email Sent!</h3>
              <p className="text-sm text-gray-500 font-medium leading-relaxed">
                Check your inbox and follow the instructions to reset your password.
              </p>
            </div>
            <Link 
              href="/"
              className="inline-block mt-4 text-sm font-bold text-primary hover:underline underline-offset-4"
            >
              Back to Login
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold animate-in shake-in">
                {error}
              </div>
            )}

            <div className="space-y-2">
              <label className="text-xs font-black text-text-primary uppercase tracking-widest ml-1 opacity-60">Email Address</label>
              <div className="relative">
                <Mail size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full h-12 pl-12 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white font-medium"
                  placeholder="coach@gym.com"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 font-black text-white transition-all hover:bg-opacity-90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50 shadow-md"
            >
              {loading ? <Loader2 className="animate-spin" /> : "Send Reset Link"}
            </button>

            <Link 
              href="/"
              className="flex items-center justify-center gap-2 text-sm font-bold text-text-secondary hover:text-primary transition-colors mt-4"
            >
              <ArrowLeft size={16} />
              Return to Login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
