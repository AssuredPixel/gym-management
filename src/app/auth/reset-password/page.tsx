"use client";

import { useState, Suspense } from "react";
import { Lock, Eye, EyeOff, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { BoxOSLogo } from "@/components/ui/logo";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    if (password !== confirmPassword) {
      setError("Passwords do not match");
      setLoading(false);
      return;
    }

    try {
      const res = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      if (res.ok) {
        setSuccess(true);
        setTimeout(() => {
          router.push("/login/staff");
        }, 3000);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to update password");
      }
    } catch (err) {
      setError("An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };

  if (!token) {
    return (
      <div className="text-center space-y-6">
        <div className="mx-auto h-16 w-16 bg-red-50 text-red-500 rounded-full flex items-center justify-center">
          <AlertCircle size={32} />
        </div>
        <div className="space-y-2">
          <h2 className="text-xl font-bold text-gray-900">Invalid Link</h2>
          <p className="text-sm text-gray-500 font-medium">
            This password reset link is invalid or has expired.
          </p>
        </div>
        <Link 
          href="/auth/forgot-password"
          className="inline-block px-6 py-2 bg-primary text-white font-bold rounded-xl text-sm"
        >
          Request New Link
        </Link>
      </div>
    );
  }

  return (
    <div className="w-full max-w-md bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 border border-gray-100 animate-in fade-in zoom-in-95 duration-500">
      <div className="mb-8 text-center">
        <BoxOSLogo className="mx-auto" />
        <h1 className="mt-8 text-2xl font-black text-text-primary">Set New Password</h1>
        <p className="mt-2 text-sm text-text-secondary font-medium tracking-tight">
          Create a secure password for your account.
        </p>
      </div>

      {success ? (
        <div className="text-center py-8 space-y-4">
          <div className="mx-auto h-16 w-16 bg-green-50 text-green-500 rounded-full flex items-center justify-center">
            <CheckCircle2 size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold text-gray-900">Success!</h3>
            <p className="text-sm text-gray-500 font-medium tracking-tight leading-relaxed">
              Your password has been updated. Redirecting you to login...
            </p>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          {error && (
            <div className="p-4 bg-red-50 border border-red-100 rounded-xl text-red-500 text-xs font-bold animate-in shake-in">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-xs font-black text-text-primary uppercase tracking-widest ml-1 opacity-60">New Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 rounded-xl border border-gray-200 bg-gray-50/50 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white font-medium"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-xs font-black text-text-primary uppercase tracking-widest ml-1 opacity-60">Confirm Password</label>
              <div className="relative">
                <Lock size={18} className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full h-12 pl-12 pr-12 rounded-xl border border-gray-200 bg-gray-50/50 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white font-medium"
                  placeholder="••••••••"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="flex h-14 w-full items-center justify-center gap-2 rounded-xl bg-primary px-6 font-black text-white transition-all hover:bg-opacity-90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50"
          >
            {loading ? <Loader2 className="animate-spin" /> : "Update Password"}
          </button>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 bg-gray-50 overflow-hidden">
      <Suspense fallback={
        <div className="flex flex-col items-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p className="mt-4 text-xs font-black text-text-secondary tracking-widest uppercase">Validating secure token...</p>
        </div>
      }>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
