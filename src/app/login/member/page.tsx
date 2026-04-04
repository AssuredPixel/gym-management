"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Loader2, ArrowRight, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { Suspense } from "react";
import { BoxOSLogo } from "@/components/ui/logo";

function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const formData = new FormData(e.currentTarget);
    const email = formData.get("email") as string;
    const password = formData.get("password") as string;

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push("/portal");
      }
    } catch {
      setError("An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm mx-auto">
      <div className="mb-10">
        <Link href="/" className="inline-flex items-center text-sm font-medium text-text-secondary hover:text-primary mb-8 transition-colors">
          <ArrowLeft size={16} className="mr-2" /> Back to Home
        </Link>
        <div className="flex flex-col gap-4">
            <BoxOSLogo />
            <div className="inline-flex w-fit px-3 py-1 bg-primary/10 rounded-full text-primary font-black text-[10px] uppercase tracking-widest leading-none">
            Member Portal
            </div>
        </div>
        <h1 className="mt-8 text-3xl font-black text-text-primary tracking-tight">
          Hey there, Athlete
        </h1>
        <p className="mt-3 text-text-secondary font-medium">
          Check your WODs, log your PRs, and book classes.
        </p>
      </div>

      {error && (
        <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm text-red-600 font-bold border border-red-100 animate-in fade-in slide-in-from-top-1">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="space-y-2">
          <label className="text-xs font-black text-text-primary uppercase tracking-widest ml-1 opacity-60">Email Address</label>
          <input
            name="email"
            type="email"
            required
            className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white font-medium"
            placeholder="athlete@gym.com"
          />
        </div>

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-black text-text-primary uppercase tracking-widest ml-1 opacity-60">Password</label>
            <Link href="/auth/forgot-password" className="text-sm font-bold text-primary hover:underline">
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <input
              name="password"
              type={showPassword ? "text" : "password"}
              required
              className="w-full h-12 rounded-xl border border-gray-200 bg-gray-50/50 px-4 py-3 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white font-medium pr-12"
              placeholder="••••••••"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-3 text-gray-400 hover:text-gray-600 transition-colors"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={isLoading}
          className="group relative flex h-14 w-full items-center justify-center gap-2 overflow-hidden rounded-xl bg-primary px-6 font-black text-white transition-all hover:bg-opacity-90 hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50"
        >
          {isLoading ? (
            <Loader2 className="h-5 w-5 animate-spin" />
          ) : (
            <>
              Sign In to Portal
              <ArrowRight size={18} className="transition-transform group-hover:translate-x-1" />
            </>
          )}
        </button>
      </form>
    </div>
  );
}

export default function MemberLoginPage() {
  return (
    <div className="flex min-h-screen bg-white overflow-hidden">
      {/* Left Column - Form */}
      <div className="flex flex-1 flex-col justify-center px-6 py-12 lg:px-24">
        <Suspense fallback={
          <div className="flex flex-col items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
            <p className="mt-4 text-xs font-black text-text-secondary tracking-widest uppercase">Syncing your progress...</p>
          </div>
        }>
          <LoginForm />
        </Suspense>

      </div>

      {/* Right Column - Image & Brand (Visible on large screens) */}
      <div className="relative hidden w-0 flex-1 lg:block">
        <div className="absolute inset-0 bg-[#0D1117]/20 z-10"></div>
        <img
          className="absolute inset-0 h-full w-full object-cover"
          src="/member_login_side.png"
          alt="Athlete Portal"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#16213E]/90 via-[#16213E]/20 to-transparent z-20"></div>
        <div className="absolute bottom-16 left-16 right-16 z-30 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <blockquote className="space-y-4">
                <p className="text-3xl font-black tracking-tight text-white leading-tight">
                    "Being able to book classes and track my scores in one place has made my training so much more consistent."
                </p>
                <footer className="flex items-center gap-4 pt-4">
                    <div className="h-12 w-12 rounded-full border-2 border-primary bg-primary/20 backdrop-blur-sm overflow-hidden flex items-center justify-center font-black text-white">JD</div>
                    <div>
                        <div className="text-lg font-black text-white leading-none">John Doe</div>
                        <div className="text-primary font-black mt-1.5 leading-none uppercase tracking-widest text-[10px]">Athlete, BoxOS Gym</div>
                    </div>
                </footer>
            </blockquote>
        </div>
      </div>
    </div>
  );
}
