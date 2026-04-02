import Image from "next/image";
import Link from "next/link";
import { ArrowRight, CheckCircle2, Zap, Users, Shield, Calendar } from "lucide-react";

export default function Home() {
  return (
    <div className="flex min-h-screen flex-col bg-dark selection:bg-primary selection:text-white">
      {/* Header/Navbar */}
      <header className="fixed top-0 z-50 w-full border-b border-white/5 bg-dark/80 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6 lg:px-8">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold tracking-tight text-primary">BoxOS</span>
          </div>
          <nav className="hidden md:flex md:gap-x-10">
            <Link href="#features" className="text-sm font-semibold leading-6 text-white/70 hover:text-white transition-colors">
              Features
            </Link>
            <Link href="#pricing" className="text-sm font-semibold leading-6 text-white/70 hover:text-white transition-colors">
              Pricing
            </Link>
          </nav>
          <div className="flex items-center gap-4">
            <Link 
              href="/login/member" 
              className="text-sm font-semibold leading-6 text-white hover:text-primary transition-colors"
            >
              Log In
            </Link>
            <Link
              href="/register"
              className="rounded-full bg-primary px-5 py-2.5 text-sm font-semibold text-white shadow-lg shadow-primary/20 hover:bg-primary/90 transition-all active:scale-95"
            >
              Start Free Trial
            </Link>
          </div>
        </div>
      </header>

      <main className="flex-grow">
        {/* Hero Section */}
        <section className="relative isolate overflow-hidden pt-14">
          <div className="absolute inset-0 -z-10 bg-[url('/gym_hero_bg.png')] bg-cover bg-center brightness-[0.3]"></div>
          <div className="absolute inset-0 -z-10 bg-gradient-to-b from-dark/50 via-dark/80 to-dark"></div>
          
          <div className="mx-auto max-w-7xl px-6 pb-24 pt-32 sm:pb-32 lg:flex lg:px-8 lg:pt-40">
            <div className="mx-auto max-w-2xl flex-shrink-0 lg:mx-0 lg:max-w-xl lg:pt-8">
              <div className="mt-24 sm:mt-32 lg:mt-16">
                <a href="#" className="inline-flex space-x-6">
                  <span className="rounded-full bg-primary/10 px-3 py-1 text-sm font-semibold leading-6 text-primary ring-1 ring-inset ring-primary/20">
                    What's new
                  </span>
                  <span className="inline-flex items-center space-x-2 text-sm font-medium leading-6 text-white/60">
                    <span>Just shipped v2.0</span>
                    <ArrowRight className="h-4 w-4" aria-hidden="true" />
                  </span>
                </a>
              </div>
              <h1 className="mt-10 text-4xl font-bold tracking-tight text-white sm:text-6xl">
                The Operating System for Your <span className="text-primary italic">Gym.</span>
              </h1>
              <p className="mt-6 text-lg leading-8 text-white/60">
                Manage members, classes, payments, and performance tracking all in one powerful platform. Built by gym owners, for gym owners.
              </p>
              <div className="mt-10 flex items-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-full bg-primary px-8 py-4 text-lg font-semibold text-white shadow-xl shadow-primary/20 hover:bg-primary/90 transition-all hover:-translate-y-1"
                >
                  Get Started for Free
                </Link>
                <Link href="#features" className="text-sm font-semibold leading-6 text-white hover:text-primary transition-colors flex items-center gap-2">
                  View Features <span aria-hidden="true">→</span>
                </Link>
              </div>
            </div>
            
            <div className="mx-auto mt-16 flex max-w-2xl sm:mt-24 lg:ml-10 lg:mr-0 lg:mt-0 lg:max-w-none lg:flex-none xl:ml-32">
              <div className="max-w-3xl flex-none sm:max-w-5xl lg:max-w-none">
                <div className="rounded-xl bg-white/5 p-2 ring-1 ring-inset ring-white/10 lg:-m-4 lg:rounded-2xl lg:p-4 backdrop-blur-sm">
                  <div className="rounded-md border border-white/10 bg-dark/50 shadow-2xl">
                     <div className="flex border-b border-white/5 bg-white/5 px-4 py-2">
                        <div className="flex gap-1.5">
                          <div className="h-2 w-2 rounded-full bg-red-500/50"></div>
                          <div className="h-2 w-2 rounded-full bg-yellow-500/50"></div>
                          <div className="h-2 w-2 rounded-full bg-green-500/50"></div>
                        </div>
                     </div>
                     <div className="aspect-[16/10] bg-dark p-4 sm:w-[57rem] lg:w-[45rem]">
                        <div className="h-full w-full rounded border border-white/5 bg-white/[0.02] p-6">
                           <div className="flex items-center justify-between mb-8">
                              <div className="h-4 w-32 rounded bg-white/10"></div>
                              <div className="h-8 w-8 rounded-full bg-primary/20"></div>
                           </div>
                           <div className="grid grid-cols-3 gap-4">
                              <div className="h-32 rounded bg-white/5 border border-white/5"></div>
                              <div className="h-32 rounded bg-white/5 border border-white/5"></div>
                              <div className="h-32 rounded bg-white/5 border border-white/5"></div>
                           </div>
                           <div className="mt-8 h-48 rounded bg-white/5 border border-white/5"></div>
                        </div>
                     </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="py-24 sm:py-32 bg-dark">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">Everything you need</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Powerful tools to grow your community
              </p>
              <p className="mt-6 text-lg leading-8 text-white/60">
                Stop juggling multiple spreadsheets and apps. BoxOS brings everything into a single, intuitive dashboard.
              </p>
            </div>
            <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
              <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
                {[
                  {
                    name: "Automated Payments",
                    description: "Set up recurring billing, manage memberships, and track revenue with zero friction.",
                    icon: Zap,
                  },
                  {
                    name: "Member Management",
                    description: "Comprehensive athlete profiles, attendance tracking, and performance history.",
                    icon: Users,
                  },
                  {
                    name: "Class Scheduling",
                    description: "Dynamic calendar for WODs, specialty classes, and personal training sessions.",
                    icon: Calendar,
                  },
                  {
                    name: "Security First",
                    description: "Enterprise-grade security to protect your gym's data and your members' privacy.",
                    icon: Shield,
                  },
                  {
                    name: "Seamless Branding",
                    description: "Customizable portal that feels like your gym, not just another software.",
                    icon: CheckCircle2,
                  },
                  {
                    name: "Real-time Analytics",
                    description: "Track churn, growth, and member engagement with beautiful, actionable reports.",
                    icon: CheckCircle2,
                  },
                ].map((feature) => (
                  <div key={feature.name} className="flex flex-col bg-white/[0.02] p-8 rounded-2xl border border-white/5 hover:border-primary/20 transition-colors group">
                    <dt className="flex items-center gap-x-3 text-lg font-semibold leading-7 text-white">
                      <feature.icon className="h-6 w-6 text-primary group-hover:scale-110 transition-transform" aria-hidden="true" />
                      {feature.name}
                    </dt>
                    <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-white/50">
                      <p className="flex-auto">{feature.description}</p>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <section id="pricing" className="py-24 sm:py-32 bg-dark relative isolate">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="mx-auto max-w-2xl lg:text-center">
              <h2 className="text-base font-semibold leading-7 text-primary">Pricing</h2>
              <p className="mt-2 text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Choose the right plan for your box
              </p>
            </div>
            <div className="mx-auto mt-16 grid max-w-lg grid-cols-1 gap-y-6 sm:mt-20 lg:max-w-none lg:grid-cols-3 lg:gap-x-8">
              {[
                {
                  name: "Essential",
                  id: "tier-essential",
                  priceMonthly: "$49",
                  description: "Everything you need to get started with your new gym.",
                  features: ["Up to 50 members", "Unlimited classes", "Automated billing", "Basic reporting"],
                  mostPopular: false,
                },
                {
                  name: "Professional",
                  id: "tier-professional",
                  priceMonthly: "$99",
                  description: "Full-stack management for growing CrossFit boxes.",
                  features: ["Unlimited members", "Advanced analytics", "Custom branding", "API access", "Priority support"],
                  mostPopular: true,
                },
                {
                  name: "Enterprise",
                  id: "tier-enterprise",
                  priceMonthly: "$199",
                  description: "For multi-location gyms and large facilities.",
                  features: ["Multiple locations", "White-label solution", "Dedicated account manager", "Custom integrations"],
                  mostPopular: false,
                },
              ].map((tier) => (
                <div
                  key={tier.id}
                  className={`flex flex-col justify-between rounded-3xl p-8 xl:p-10 ${
                    tier.mostPopular 
                      ? "bg-white/[0.05] ring-2 ring-primary relative" 
                      : "ring-1 ring-white/10"
                  }`}
                >
                  {tier.mostPopular && (
                    <span className="absolute top-0 right-8 -translate-y-1/2 rounded-full bg-primary px-3 py-1 text-xs font-bold text-white">
                      MOST POPULAR
                    </span>
                  )}
                  <div>
                    <h3 className="text-lg font-semibold leading-8 text-white">{tier.name}</h3>
                    <p className="mt-4 text-sm leading-6 text-white/60">{tier.description}</p>
                    <p className="mt-6 flex items-baseline gap-x-1">
                      <span className="text-4xl font-bold tracking-tight text-white">{tier.priceMonthly}</span>
                      <span className="text-sm font-semibold leading-6 text-white/40">/month</span>
                    </p>
                    <ul role="list" className="mt-8 space-y-3 text-sm leading-6 text-white/70">
                      {tier.features.map((feature) => (
                        <li key={feature} className="flex gap-x-3">
                          <CheckCircle2 className="h-6 w-5 flex-none text-primary" aria-hidden="true" />
                          {feature}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <Link
                    href="/register"
                    className={`mt-8 block rounded-xl py-2.5 px-3 text-center text-sm font-semibold leading-6 transition-all ${
                      tier.mostPopular 
                        ? "bg-primary text-white shadow-lg shadow-primary/25 hover:bg-primary/90" 
                        : "bg-white/10 text-white hover:bg-white/20"
                    }`}
                  >
                    Start your free trial
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="relative isolate py-24 sm:py-32">
          <div className="mx-auto max-w-7xl px-6 lg:px-8">
            <div className="relative isolate overflow-hidden bg-primary px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
              <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
                Ready to take your gym to the next level?
              </h2>
              <p className="mx-auto mt-6 max-w-xl text-center text-lg leading-8 text-white/80">
                Join hundreds of gym owners who trust BoxOS to run their daily operations.
              </p>
              <div className="mt-10 flex justify-center gap-x-6">
                <Link
                  href="/register"
                  className="rounded-full bg-white px-8 py-3.5 text-sm font-semibold text-primary shadow-sm hover:bg-gray-100 transition-colors"
                >
                  Start your 14-day free trial
                </Link>
                <Link href="#" className="text-sm font-semibold leading-6 text-white flex items-center gap-2">
                  Talk to a coach <span aria-hidden="true">→</span>
                </Link>
              </div>
              <svg
                viewBox="0 0 1024 1024"
                className="absolute left-1/2 top-1/2 -z-10 h-[64rem] w-[64rem] -translate-x-1/2 [mask-image:radial-gradient(closest-side,white,transparent)]"
                aria-hidden="true"
              >
                <circle cx={512} cy={512} r={512} fill="url(#827591b1-ce8c-4110-b064-7cb85a0b1217)" fillOpacity="0.7" />
                <defs>
                  <radialGradient id="827591b1-ce8c-4110-b064-7cb85a0b1217">
                    <stop stopColor="white" />
                    <stop offset={1} stopColor="white" />
                  </radialGradient>
                </defs>
              </svg>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-dark border-t border-white/5">
        <div className="mx-auto max-w-7xl px-6 py-12 md:flex md:items-center md:justify-between lg:px-8">
          <div className="flex justify-center space-x-6 md:order-2">
            <Link href="#" className="text-white/40 hover:text-white transition-colors">Documentation</Link>
            <Link href="#" className="text-white/40 hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-white/40 hover:text-white transition-colors">Terms of Service</Link>
          </div>
          <div className="mt-8 md:order-1 md:mt-0">
            <p className="text-center text-xs leading-5 text-white/40">
              &copy; {new Date().getFullYear()} BoxOS Inc. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
