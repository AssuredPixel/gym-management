"use client";

import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CheckCircle2, Eye, EyeOff, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BoxOSLogo } from "@/components/ui/logo";

const registerSchema = z.object({
  gymName: z.string().min(2, "Gym name must be at least 2 characters"),
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  confirmPassword: z.string(),
  gymSize: z.string().min(1, "Please select your gym size"),
  terms: z.boolean().refine((val) => val === true, "You must accept the terms"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Passwords do not match",
  path: ["confirmPassword"],
});

type RegisterFormValues = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      terms: false,
    }
  });

  const onSubmit = async (data: RegisterFormValues) => {
    setIsLoading(true);
    setServerError(null);
    try {
      const response = await fetch("/api/auth/register-gym", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          gymName: data.gymName,
          ownerName: data.fullName,
          email: data.email,
          password: data.password,
          gymSize: data.gymSize === "under-30" ? "small" : data.gymSize === "30-100" ? "medium" : "large",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Registration failed");
      }

      router.push("/login/owner?registered=true");
    } catch (err) {
      setServerError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen flex-row bg-white">
      {/* Left Panel - Dark Navy Sidebar (40%) */}
      <div className="hidden lg:flex w-[40%] bg-[#1A1A2E] flex-col justify-between p-16 relative overflow-hidden">
        {/* Subtle decorative elements */}
        <div className="absolute top-[-10%] right-[-10%] w-64 h-64 bg-primary/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-[-10%] left-[-10%] w-96 h-96 bg-primary/5 rounded-full blur-3xl"></div>

        <div className="relative z-10">
          <BoxOSLogo variant="white" className="mb-16" />
          
          <h1 className="text-white text-5xl font-black leading-tight tracking-tighter mb-8">
            Get your box <br />
            <span className="text-primary">online</span> in <br />
            2 minutes.
          </h1>

          <div className="space-y-6 mt-12">
            {[
              "Automated membership billing",
              "Class scheduling & WOD tracking",
              "Powerful athlete performance analytics",
            ].map((text, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="bg-primary/20 p-2 rounded-lg group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="text-primary" size={24} />
                </div>
                <span className="text-white/80 font-medium text-lg">{text}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="relative z-10 border-t border-white/10 pt-8 mt-12">
          <p className="text-white/40 text-sm font-medium tracking-wide italic">
             "BoxOS has transformed our gym's operations. Highly recommended for any serious affiliate owner."
          </p>
          <p className="text-primary text-sm font-bold mt-2">— Mark Robson, Lead Coach</p>
        </div>
      </div>

      {/* Right Panel - White Form (60%) */}
      <div className="w-full lg:w-[60%] flex flex-col justify-center items-center px-6 py-12 lg:px-24 bg-white overflow-y-auto">
        <div className="w-full max-w-lg">
          <div className="lg:hidden mb-10">
            <BoxOSLogo />
          </div>

          <div className="mb-10 text-center lg:text-left">
            <h2 className="text-3xl font-black text-[#1A1A2E] tracking-tight mb-2">Create your Gym</h2>
            <p className="text-gray-500 font-medium">Join 500+ gyms growing with BoxOS.</p>
          </div>

          {serverError && (
            <div className="mb-6 p-4 bg-red-50 border border-red-100 rounded-2xl text-red-600 text-sm font-semibold animate-in fade-in slide-in-from-top-2">
              {serverError}
            </div>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1A1A2E] ml-1 uppercase tracking-wider opacity-60">Gym Name</label>
                <input
                  {...register("gymName")}
                  className={`w-full h-14 rounded-2xl border ${errors.gymName ? 'border-red-400 bg-red-50/10' : 'border-gray-200 bg-gray-50/50'} px-5 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white text-lg font-medium`}
                  placeholder="The Box HQ"
                />
                {errors.gymName && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.gymName.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1A1A2E] ml-1 uppercase tracking-wider opacity-60">Your Full Name</label>
                <input
                  {...register("fullName")}
                  className={`w-full h-14 rounded-2xl border ${errors.fullName ? 'border-red-400 bg-red-50/10' : 'border-gray-200 bg-gray-50/50'} px-5 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white text-lg font-medium`}
                  placeholder="John Doe"
                />
                {errors.fullName && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.fullName.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1A1A2E] ml-1 uppercase tracking-wider opacity-60">Email Address</label>
              <input
                {...register("email")}
                type="email"
                className={`w-full h-14 rounded-2xl border ${errors.email ? 'border-red-400 bg-red-50/10' : 'border-gray-200 bg-gray-50/50'} px-5 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white text-lg font-medium`}
                placeholder="admin@thebox.com"
              />
              {errors.email && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.email.message}</p>}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1A1A2E] ml-1 uppercase tracking-wider opacity-60">Password</label>
                <div className="relative">
                  <input
                    {...register("password")}
                    type={showPassword ? "text" : "password"}
                    className={`w-full h-14 rounded-2xl border ${errors.password ? 'border-red-400 bg-red-50/10' : 'border-gray-200 bg-gray-50/50'} px-5 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white text-lg font-medium pr-12`}
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.password.message}</p>}
              </div>

              <div className="space-y-1.5">
                <label className="text-sm font-bold text-[#1A1A2E] ml-1 uppercase tracking-wider opacity-60">Confirm Password</label>
                <input
                  {...register("confirmPassword")}
                  type="password"
                  className={`w-full h-14 rounded-2xl border ${errors.confirmPassword ? 'border-red-400 bg-red-50/10' : 'border-gray-200 bg-gray-50/50'} px-5 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white text-lg font-medium`}
                  placeholder="••••••••"
                />
                {errors.confirmPassword && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.confirmPassword.message}</p>}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-sm font-bold text-[#1A1A2E] ml-1 uppercase tracking-wider opacity-60">Gym Size</label>
              <select
                {...register("gymSize")}
                className={`w-full h-14 rounded-2xl border ${errors.gymSize ? 'border-red-400 bg-red-50/10' : 'border-gray-200 bg-gray-50/50'} px-5 outline-none transition-all focus:border-primary focus:ring-4 focus:ring-primary/5 focus:bg-white text-lg font-medium appearance-none`}
              >
                <option value="">Select Gym Size</option>
                <option value="under-30">Under 30 members</option>
                <option value="30-100">30-100 members</option>
                <option value="100+">100+ members</option>
              </select>
              {errors.gymSize && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.gymSize.message}</p>}
            </div>

            <div className="py-2">
              <label className="flex items-center gap-3 cursor-pointer group">
                <div className="relative">
                  <input
                    type="checkbox"
                    {...register("terms")}
                    className="sr-only peer"
                  />
                  <div className={`w-6 h-6 rounded-md border-2 border-gray-200 peer-checked:bg-primary peer-checked:border-primary transition-all flex items-center justify-center`}>
                    <CheckCircle2 size={16} className="text-white opacity-0 peer-checked:opacity-100 transition-opacity" />
                  </div>
                </div>
                <span className="text-sm font-medium text-gray-500">I agree to the <Link href="#" className="underline text-primary hover:text-primary/80">Terms of Service</Link> and <Link href="#" className="underline text-primary hover:text-primary/80">Privacy Policy</Link></span>
              </label>
              {errors.terms && <p className="text-red-500 text-xs font-bold mt-1 ml-1">{errors.terms.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="group relative h-16 w-full overflow-hidden rounded-2xl bg-primary px-8 font-black text-white hover:bg-opacity-90 transition-all hover:shadow-lg hover:shadow-primary/25 active:scale-[0.98] disabled:opacity-50"
            >
              <div className="relative z-10 flex items-center justify-center gap-3 text-lg">
                {isLoading ? (
                  <Loader2 className="h-6 w-6 animate-spin" />
                ) : (
                  <>
                    Create Account & Start Free Trial
                    <ArrowRight className="transition-transform group-hover:translate-x-1" size={20} />
                  </>
                )}
              </div>
            </button>

            <div className="text-center mt-6">
              <p className="text-sm font-bold text-gray-400">No credit card required.</p>
              <p className="text-sm font-medium text-gray-500 mt-6">
                Already have an account?{" "}
                <Link href="/login/member" className="text-primary font-black hover:underline underline-offset-4">Sign in</Link>
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
