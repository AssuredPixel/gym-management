"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2,
  Bell
} from "lucide-react";
import Link from "next/link";

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  revenueThisMonth: number;
  classesThisWeek: number;
  classesTodayCount: number;
  classesToday: Array<{
    _id: string;
    title: string;
    coach: string;
    dateTime: string;
    capacity: number;
    bookedCount: number;
  }>;
  expiringMembers: Array<{
    id: string;
    name: string;
    endDate: string;
  }>;
  recentActivity: Array<{
    _id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

const KPICard = ({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subtext?: string; 
  icon: React.ElementType; 
  trend?: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-[#1A1A2E] mt-2">{value}</h3>
      </div>
      <div className="bg-orange-100 p-3 rounded-xl text-primary transform scale-110">
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-bold text-green-600">{trend}</span>
        <span className="text-xs text-gray-400 font-medium">this month</span>
      </div>
    )}
    {!trend && subtext && (
      <div className="mt-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{subtext}</span>
      </div>
    )}
  </div>
);

export default function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [remindingId, setRemindingId] = useState<string | null>(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch("/api/dashboard/stats");
        const data = await res.json();
        setStats(data);
      } catch (error) {
        console.error("Failed to fetch dashboard stats:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStats();
  }, []);

  const handleRemind = async (memberId: string) => {
    setRemindingId(memberId);
    try {
      const res = await fetch(`/api/members/${memberId}/remind`, { method: "POST" });
      if (res.ok) {
        alert("Reminder sent successfully!");
      }
    } catch (error) {
      console.error("Failed to send reminder:", error);
    } finally {
      setRemindingId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Members" 
          value={stats.totalMembers} 
          trend="+5" 
          icon={Users} 
        />
        <KPICard 
          title="Active Members" 
          value={stats.activeMembers} 
          icon={CheckCircle} 
          subtext="High attendance"
        />
        <KPICard 
          title="Monthly Revenue" 
          value={`$${((stats?.revenueThisMonth || 0) / 100).toLocaleString()}`} 
          icon={DollarSign} 
          subtext="Target: $5,000"
        />
        <KPICard 
          title="Classes This Week" 
          value={stats.classesThisWeek} 
          icon={Calendar} 
          subtext={`${stats.classesTodayCount} today`}
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity (Left 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-[#1A1A2E]">Recent Activity</h3>
            <Link href="/owner/dashboard/activity" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 group">
              View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-6">
            { (stats?.recentActivity?.length || 0) > 0 ? (
              stats.recentActivity.map((log, i) => (
                <div key={log._id} className={`flex items-start gap-4 pb-6 ${i !== (stats?.recentActivity?.length || 0) - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className={`p-2 rounded-lg ${
                    log.type === 'member_added' ? 'bg-green-50 text-green-600' : 
                    log.type === 'payment_received' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    <Clock size={16} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-bold text-text-primary mb-0.5">{log.description}</p>
                    <p className="text-xs text-gray-400 font-medium">
                      {new Date(log.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })} at{" "}
                      {new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-10 font-medium italic">No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Expiring Soon (Right 1/3) */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col">
          <div className="bg-amber-50 p-6 rounded-t-2xl border-b border-amber-100 flex items-center gap-3">
            <div className="bg-amber-200 text-amber-700 p-2 rounded-lg">
              <AlertTriangle size={20} />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-800 uppercase tracking-tighter">Membership Expiring</h4>
              <p className="text-xs text-amber-600 font-bold">Action required for {stats?.expiringMembers?.length || 0} members</p>
            </div>
          </div>
          
          <div className="p-6 flex-1 space-y-4">
            {(stats?.expiringMembers || []).map((member) => (
              <div key={member.id} className="flex justify-between items-center group">
                <div>
                  <p className="text-sm font-bold text-text-primary">{member.name}</p>
                  <p className="text-xs text-orange-500 font-black tracking-wide">
                    Ends {new Date(member.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                  </p>
                </div>
                <button 
                  onClick={() => handleRemind(member.id)}
                  className="bg-white border border-gray-200 text-[10px] font-black uppercase text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-1 group-hover:scale-105 active:scale-95"
                >
                  {remindingId === member.id ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
                  Remind
                </button>
              </div>
            ))}
            {(stats?.expiringMembers?.length || 0) === 0 && (
                <p className="text-gray-400 text-center py-10 text-xs font-bold uppercase tracking-widest opacity-30">All memberships secure</p>
            )}
          </div>
        </div>
      </div>

      {/* Today's Classes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-xl font-black text-[#1A1A2E]">Today's Classes</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
            </div>
            <Link href="/owner/dashboard/classes" className="bg-gray-100 text-[#1A1A2E] text-xs font-black uppercase px-4 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2">
                All Classes <ExternalLink size={14} />
            </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            { (stats?.classesToday?.length || 0) > 0 ? (
                (stats?.classesToday || []).map((cls) => (
                    <div key={cls._id} className="min-w-[240px] flex-shrink-0 border border-gray-100 rounded-xl p-5 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                        <span className="text-primary text-xs font-black tracking-widest">
                          {new Date(cls.dateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                        </span>
                        <h4 className="text-lg font-black text-[#1A1A2E] mt-1 mb-2 group-hover:text-primary transition-colors">{cls.title}</h4>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">{cls.coach}</span>
                            <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{cls.bookedCount}/{cls.capacity} spots</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center w-full py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <Calendar className="text-gray-200 mb-2" size={32} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No classes scheduled today</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
