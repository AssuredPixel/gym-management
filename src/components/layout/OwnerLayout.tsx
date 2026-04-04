"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  CreditCard, 
  Settings, 
  Bell, 
  LogOut,
  Briefcase,
  Menu,
  X
} from "lucide-react";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions/auth";
import SettingsModal from "./SettingsModal";
import NotificationsModal from "./NotificationsModal";

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
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const navLinks = [
    { href: "/owner/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/owner/dashboard/members", icon: Users, label: "Members" },
    { href: "/owner/dashboard/classes", icon: Calendar, label: "Classes" },
    { href: "/owner/dashboard/payments", icon: CreditCard, label: "Payments" },
    { href: "/owner/dashboard/instructors", icon: Briefcase, label: "Instructors" },
  ];

  const fetchUnreadCount = async () => {
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const notifications = await res.json();
        const unread = notifications.filter((n: any) => !n.isRead).length;
        setUnreadCount(unread);
      }
    } catch (err) {
      console.error("Failed to fetch unread count:", err);
    }
  };

  useEffect(() => {
    fetchUnreadCount();
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!isNotificationsOpen) {
      fetchUnreadCount();
    }
  }, [isNotificationsOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile Overlay */}
      {isMobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden"
          onClick={() => setIsMobileMenuOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside className={`fixed left-0 top-0 h-full w-[240px] bg-dark flex flex-col z-30 transition-transform duration-300 ${isMobileMenuOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}`}>
        <div className="p-6 flex justify-between items-center">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">BoxOS</span>
            <span className="text-xs text-white/60 mt-0.5 whitespace-nowrap">My CrossFit Box</span>
          </div>
          <button className="md:hidden text-gray-400 hover:text-white" onClick={() => setIsMobileMenuOpen(false)}>
            <X size={24} />
          </button>
        </div>

        <nav className="mt-4 flex-1">
          {navLinks.map((link) => (
            <div key={link.href} onClick={() => setIsMobileMenuOpen(false)}>
              <NavLink
                {...link}
                active={link.href === "/owner/dashboard" ? pathname === link.href : pathname.startsWith(link.href)}
              />
            </div>
          ))}
        </nav>

        <div className="mt-auto border-t border-white/5 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold transition-all shrink-0">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || "Owner"}
              </p>
              <p className="text-xs text-white/50 lowercase tracking-wider">Gym Owner</p>
            </div>
            <Link 
              href="/owner/dashboard/settings"
              className="text-white/40 hover:text-white transition-colors p-2 rounded-lg hover:bg-white/5"
            >
              <Settings size={18} />
            </Link>
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
      <main className="flex-1 md:ml-[240px] w-full min-w-0 transition-all">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-4 md:px-8">
          <div className="flex items-center gap-3 md:gap-4">
            <button 
              className="md:hidden text-gray-400 hover:text-gray-600"
              onClick={() => setIsMobileMenuOpen(true)}
            >
              <Menu size={24} />
            </button>
            <h2 className="text-base md:text-lg font-bold text-text-primary tracking-tight truncate">
              Good morning, {session?.user?.name?.split(" ")[0] || "Coach"} 👋
            </h2>
          </div>

          <div className="flex items-center gap-6">
            <button 
              onClick={() => setIsNotificationsOpen(true)}
              className="relative text-gray-400 hover:text-gray-600 transition-colors"
            >
              <Bell size={20} />
              {unreadCount > 0 && (
                <div className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-black text-white flex items-center justify-center border-2 border-white">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* Page Content */}
        <div className="min-h-[calc(100vh-64px)] p-8">
          {children}
        </div>
      </main>

      {/* Modals */}
      <SettingsModal 
        isOpen={isSettingsOpen} 
        onClose={() => setIsSettingsOpen(false)} 
      />
      <NotificationsModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </div>
  );
}
