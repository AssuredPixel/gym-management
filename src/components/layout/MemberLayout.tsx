"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions/auth";

interface NavLinkProps {
  href: string;
  label: string;
  active: boolean;
}

const NavLink = ({ href, label, active }: NavLinkProps) => (
  <Link
    href={href}
    className={`px-1 py-4 text-sm font-medium transition-colors border-b-2 ${
      active 
        ? "text-primary border-primary" 
        : "text-text-secondary border-transparent hover:text-text-primary hover:border-gray-300"
    }`}
  >
    {label}
  </Link>
);

export default function MemberLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { href: "/portal", label: "My Membership" },
    { href: "/portal/classes", label: "Book a Class" },
    { href: "/portal/payments", label: "Payments" },
    { href: "/portal/profile", label: "My Profile" },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top Navbar */}
      <header className="sticky top-0 z-20 w-full bg-white shadow-sm">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-6">
          <div className="flex items-center gap-12">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-primary">BoxOS</span>
            </div>
            <nav className="hidden md:flex items-center gap-8">
              {navLinks.map((link) => (
                <NavLink
                  key={link.href}
                  {...link}
                  active={pathname === link.href || pathname.startsWith(link.href + "/")}
                />
              ))}
            </nav>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-9 w-9 flex items-center justify-center rounded-full bg-primary/10 text-primary font-bold">
                {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "M"}
              </div>
              <span className="text-sm font-semibold text-text-primary hidden sm:block">
                {session?.user?.name || "Member"}
              </span>
            </div>
            
            {/* Divider */}
            <div className="h-6 w-px bg-gray-200 hidden sm:block"></div>

            <button 
              onClick={() => logout()}
              className="text-xs font-bold text-gray-500 hover:text-red-500 transition-colors uppercase tracking-widest hidden sm:block"
            >
              Sign out
            </button>
          </div>
        </div>
      </header>

      {/* Content Area */}
      <main className="flex-1 py-8">
        <div className="mx-auto max-w-7xl px-6">
          {children}
        </div>
      </main>
    </div>
  );
}
