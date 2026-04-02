"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Settings, 
  Bell, 
  Plus,
  ChevronDown,
  LogOut
} from "lucide-react";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions/auth";

interface NavLinkProps {
  href: string;
  icon: React.ElementType;
  label: string;
  active: boolean;
}

const NavLink = ({ href, icon: Icon, label, active }: NavLinkProps) => (
  <Link
    href={href}
    className={`flex items-center gap-3 px-6 py-4 transition-all hover:text-white ${
      active 
        ? "bg-primary/10 text-primary border-l-[3px] border-primary" 
        : "text-gray-400 border-l-[3px] border-transparent"
    }`}
  >
    <Icon size={20} />
    <span className="font-medium text-base">{label}</span>
  </Link>
);

export default function OwnerLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();

  const navLinks = [
    { href: "/owner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/owner/dashboard/members", icon: Users, label: "Members" },
    { href: "/owner/dashboard/classes", icon: Calendar, label: "Classes" },
    { href: "/owner/dashboard/payments", icon: CreditCard, label: "Payments" },
    { href: "/owner/dashboard/settings", icon: Settings, label: "Settings" },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[240px] bg-dark flex flex-col z-20">
        <div className="p-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">BoxOS</span>
            <span className="text-xs text-white/60 mt-0.5 whitespace-nowrap">My CrossFit Box</span>
          </div>
        </div>

        <nav className="mt-4 flex-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              active={pathname === link.href || pathname.startsWith(link.href + "/")}
            />
          ))}
        </nav>

        <div className="mt-auto border-t border-white/5 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold transition-all">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || "Coach"}
              </p>
              <p className="text-xs text-white/50 lowercase tracking-wider">Gym Owner</p>
            </div>
            <button className="text-white/40 hover:text-white transition-colors">
              <Settings size={18} />
            </button>
          </div>
          
          <button 
            onClick={() => logout()}
            className="flex w-full items-center gap-3 rounded-lg px-2 py-2 text-sm font-bold text-white/40 transition-all hover:bg-red-500/10 hover:text-red-500 active:scale-95"
          >
            <LogOut size={18} />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <main className="flex-1 ml-[240px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-8">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Good morning, {session?.user?.name?.split(" ")[0] || "Coach"} 👋
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button className="relative text-gray-400 hover:text-gray-600 transition-colors">
              <Bell size={20} />
              <div className="absolute top-0 right-0 h-2 w-2 rounded-full bg-primary border-2 border-white" />
            </button>
            <button className="flex items-center gap-2 rounded-md bg-primary px-4 py-2 text-sm font-semibold text-white transition-all hover:bg-primary/90 shadow-sm active:scale-95">
              <Plus size={18} />
              <span>Quick Add</span>
              <ChevronDown size={14} className="ml-0.5 opacity-50" />
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-64px)] p-8">
          {children}
        </div>
      </main>
    </div>
  );
}
