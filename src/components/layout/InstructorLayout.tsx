"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  Users, 
  Calendar, 
  Settings, 
  Bell, 
  LogOut,
  GraduationCap
} from "lucide-react";
import { useSession } from "next-auth/react";
import { logout } from "@/lib/actions/auth";
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

export default function InstructorLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { data: session } = useSession();
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  const navLinks = [
    { href: "/instructor/dashboard", icon: LayoutDashboard, label: "Dashboard" },
    { href: "/instructor/dashboard/classes", icon: Calendar, label: "My Classes" },
    { href: "/instructor/dashboard/students", icon: Users, label: "Students" },
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
    // Poll every 60 seconds
    const interval = setInterval(fetchUnreadCount, 60000);
    return () => clearInterval(interval);
  }, []);

  // Refresh count when modal closes (in case user read notifications)
  useEffect(() => {
    if (!isNotificationsOpen) {
      fetchUnreadCount();
    }
  }, [isNotificationsOpen]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 h-full w-[240px] bg-dark flex flex-col z-20">
        <div className="p-6">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-primary">BoxOS</span>
            <span className="text-xs text-white/60 mt-0.5 whitespace-nowrap">Coach Portal</span>
          </div>
        </div>

        <nav className="mt-4 flex-1">
          {navLinks.map((link) => (
            <NavLink
              key={link.href}
              {...link}
              active={link.href === "/instructor/dashboard" ? pathname === link.href : pathname.startsWith(link.href)}
            />
          ))}
        </nav>

        <div className="mt-auto border-t border-white/5 p-4 space-y-4">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 flex items-center justify-center rounded-full bg-primary/20 text-primary font-bold">
              {session?.user?.name ? session.user.name.charAt(0).toUpperCase() : "C"}
            </div>
            <div className="flex-1 overflow-hidden">
              <p className="text-sm font-medium text-white truncate">
                {session?.user?.name || "Coach"}
              </p>
              <p className="text-xs text-white/50 lowercase tracking-wider">Instructor</p>
            </div>
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

      {/* Main Area */}
      <main className="flex-1 ml-[240px]">
        {/* Top Bar */}
        <header className="sticky top-0 z-10 flex h-16 w-full items-center justify-between border-b border-gray-200 bg-white px-8">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-bold text-text-primary tracking-tight">
              Welcome back, Coach {session?.user?.name?.split(" ")[0]} 👋
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

        {/* Content */}
        <div className="min-h-[calc(100vh-64px)] p-8">
          {children}
        </div>
      </main>

      <NotificationsModal 
        isOpen={isNotificationsOpen} 
        onClose={() => setIsNotificationsOpen(false)} 
      />
    </div>
  );
}
