"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import Link from "next/link";
import { 
  Calendar as CalendarIcon, 
  Clock, 
  MapPin, 
  Award,
  ChevronRight,
  TrendingUp,
  Loader2,
  AlertCircle
} from "lucide-react";
import { BarChart, Bar, ResponsiveContainer, Cell } from "recharts";
import MemberLayout from "@/components/layout/MemberLayout";
import toast from "react-hot-toast";

interface PortalData {
  membership: any;
  nextBookedClass: any;
  upcomingBookings: any[];
  thisMonthAttendance: number;
  weeklyAttendance: any[];
  recentPayment: any;
  tomorrowWOD: any;
}

export default function MemberPortalPage() {
  const { data: session } = useSession();
  const [data, setData] = useState<PortalData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchDashboardData = async () => {
    try {
      const res = await axios.get("/api/portal/overview");
      setData(res.data);
    } catch (error) {
      console.error("Failed to load dashboard data");
      toast.error("Failed to load your dashboard");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCancelBooking = async (classId: string) => {
    if (!confirm("Are you sure you want to cancel this booking?")) return;
    try {
      toast.loading("Cancelling...", { id: "cancel" });
      await axios.delete(`/api/portal/classes/${classId}/book`);
      toast.success("Booking cancelled successfully", { id: "cancel" });
      fetchDashboardData();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to cancel booking", { id: "cancel" });
    }
  };

  const formatDate = () => {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  const getMembershipColor = (status: string) => {
    if (status === 'active') return "bg-green-100 text-[#1A7A4A]";
    if (status === 'expiring') return "bg-amber-100 text-amber-600";
    return "bg-red-100 text-red-600";
  };

  if (isLoading || !data) {
    return (
      <MemberLayout>
        <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[#E8541A]" size={48} />
          <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading Your Dashboard...</p>
        </div>
      </MemberLayout>
    );
  }

  const { membership, nextBookedClass, upcomingBookings, thisMonthAttendance, weeklyAttendance, tomorrowWOD } = data;
  const firstName = session?.user?.name ? session.user.name.split(" ")[0] : "Athlete";

  return (
    <MemberLayout>
      <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-10">
        
        {/* Banner for Tomorrow's WOD if Low Capacity */}
        {tomorrowWOD && (
          <div className="w-full bg-[#E8541A] text-white rounded-2xl p-6 shadow-xl shadow-orange-500/20 flex flex-col md:flex-row items-center justify-between gap-6 relative overflow-hidden">
            <div className="absolute right-0 top-0 opacity-10 pointer-events-none transform translate-x-4 -translate-y-8">
              <CalendarIcon size={160} />
            </div>
            <div className="flex items-center gap-5 relative z-10">
              <div className="bg-white/20 p-4 rounded-[20px] backdrop-blur-sm">
                <AlertCircle size={32} className="text-white" />
              </div>
              <div>
                <h3 className="text-xl font-black tracking-tight leading-tight">
                  Don't miss tomorrow's WOD!
                </h3>
                <p className="text-sm font-bold text-white/80 mt-1">
                  Only <span className="text-white bg-black/20 px-2 py-0.5 rounded-lg mx-1">{tomorrowWOD.capacity - tomorrowWOD.bookedCount} spots left</span> for {tomorrowWOD.title} at {new Date(tomorrowWOD.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}.
                </p>
              </div>
            </div>
            <Link 
              href="/portal/classes"
              className="relative z-10 whitespace-nowrap bg-white text-[#E8541A] text-xs font-black uppercase tracking-widest px-8 py-4 rounded-[20px] hover:bg-gray-50 active:scale-95 transition-all shadow-md w-full md:w-auto text-center"
            >
              Book Now →
            </Link>
          </div>
        )}

        {/* Header Greeting */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 p-4 md:p-0">
          <div>
            <h1 className="text-4xl font-black text-[#1A1A2E] tracking-tight">
              Welcome back, {firstName}! 💪
            </h1>
            <p className="text-sm font-bold text-gray-400 mt-2 tracking-wide">
              BoxOS Fitness Member
            </p>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Today</p>
            <p className="text-base font-bold text-[#1A1A2E]">{formatDate()}</p>
          </div>
        </div>

        {/* KPI Row */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card A: Membership */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#E8541A]/5 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 bg-gray-50 rounded-[20px] flex items-center justify-center text-[#E8541A] group-hover:bg-[#E8541A]/10 transition-colors">
                  <Award size={24} />
                </div>
                {membership ? (
                  <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full ${getMembershipColor(membership.status)}`}>
                    {membership.status}
                  </span>
                ) : (
                  <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-gray-100 text-gray-400">
                    No Plan Active
                  </span>
                )}
              </div>

              <div className="mt-6">
                <h3 className="text-xl font-black text-[#1A1A2E]">Your Membership</h3>
                {membership ? (
                  <>
                    <p className="text-xs font-bold text-gray-400 mt-1 capitalize">{membership.plan} Plan</p>
                    <p className="text-[#E8541A] text-sm font-black mt-2">Expires {new Date(membership.endDate).toLocaleDateString()}</p>
                  </>
                ) : (
                  <p className="text-xs font-bold text-gray-400 mt-1">Please subscribe to book classes.</p>
                )}
              </div>
            </div>

            {membership && (
              <div className="mt-8">
                <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-gray-400 mb-2">
                  <span>Progress</span>
                  <span className="text-[#1A1A2E]">{membership.daysRemaining} days left</span>
                </div>
                <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#E8541A] transition-all duration-1000"
                    style={{ width: `${Math.min(100, Math.max(0, (membership.daysRemaining / 365) * 100))}%` }}
                  />
                </div>
                {membership.daysRemaining < 14 && (
                  <div className="mt-4 flex justify-end">
                    <button className="text-[10px] font-black text-[#E8541A] uppercase hover:underline">
                      Renew Early
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Card B: Next Class */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#E8541A]/5 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 bg-gray-50 rounded-[20px] flex items-center justify-center text-[#E8541A] group-hover:bg-[#E8541A]/10 transition-colors">
                  <Clock size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-[#E8541A]/10 text-[#E8541A]">
                  Up Next
                </span>
              </div>

              <div className="mt-6">
                {nextBookedClass ? (
                  <>
                    <h3 className="text-2xl font-black text-[#1A1A2E] leading-tight break-words">{nextBookedClass.title}</h3>
                    <div className="mt-3 space-y-2">
                      <p className="text-sm font-bold text-[#E8541A] flex items-center gap-2">
                        <CalendarIcon size={14} />
                        {new Date(nextBookedClass.dateTime).toLocaleString([], { weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                      </p>
                      <p className="text-xs font-bold text-gray-500">Coach: {nextBookedClass.coach}</p>
                      <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{nextBookedClass.bookedCount} / {nextBookedClass.capacity} Spots Filled</p>
                    </div>
                  </>
                ) : (
                  <>
                    <h3 className="text-xl font-black text-[#1A1A2E]">No class booked</h3>
                    <p className="text-sm font-bold text-gray-400 mt-2">Get back in the gym!</p>
                  </>
                )}
              </div>
            </div>

            <div className="mt-8 flex gap-3">
              {nextBookedClass ? (
                <>
                  <button 
                    onClick={() => handleCancelBooking(nextBookedClass._id)}
                    className="flex-1 bg-gray-50 hover:bg-red-50 text-gray-500 hover:text-red-500 text-[10px] font-black uppercase tracking-widest py-3 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <Link 
                    href="/portal/classes"
                    className="flex-1 bg-[#E8541A] hover:bg-orange-600 text-white text-[10px] font-black uppercase tracking-widest py-3 rounded-xl shadow-lg shadow-orange-500/20 text-center transition-colors flex items-center justify-center justify-center"
                  >
                    Schedule
                  </Link>
                </>
              ) : (
                <Link 
                  href="/portal/classes"
                  className="w-full bg-[#E8541A] hover:bg-orange-600 text-white text-xs font-black uppercase tracking-widest py-4 rounded-[20px] shadow-lg shadow-orange-500/20 text-center transition-all hover:-translate-y-1"
                >
                  Book a WOD
                </Link>
              )}
            </div>
          </div>

          {/* Card C: This Month Attendance */}
          <div className="bg-white rounded-[32px] p-8 border border-gray-100 shadow-sm hover:shadow-xl hover:shadow-[#E8541A]/5 transition-all flex flex-col justify-between group">
            <div>
              <div className="flex justify-between items-start">
                <div className="h-12 w-12 bg-gray-50 rounded-[20px] flex items-center justify-center text-[#E8541A] group-hover:bg-[#E8541A]/10 transition-colors">
                  <TrendingUp size={24} />
                </div>
                <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full bg-blue-50 text-blue-500">
                  This Month
                </span>
              </div>

              <div className="mt-6">
                <div className="flex items-end gap-2">
                  <h3 className="text-4xl font-black text-[#1A1A2E]">{thisMonthAttendance}</h3>
                  <span className="text-sm font-bold text-gray-400 mb-1">Classes</span>
                </div>
                <p className="text-[10px] font-black text-[#E8541A] uppercase tracking-widest mt-2">{thisMonthAttendance >= 12 ? 'Personal Best! 💪' : 'Keep pushing! 🔥'}</p>
              </div>
            </div>

            <div className="mt-6 h-24">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyAttendance} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                  <Bar dataKey="count" radius={[4, 4, 4, 4]}>
                    {weeklyAttendance?.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === weeklyAttendance.length - 1 ? "#E8541A" : "#f3f4f6"} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
              <div className="flex justify-between text-[8px] font-black text-gray-300 uppercase tracking-widest mt-2 px-1">
                <span>3 Wks Ago</span>
                <span>This Wk</span>
              </div>
            </div>
          </div>

        </div>

        {/* Upcoming Bookings Row */}
        <div>
          <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight mb-6 px-2">Your Upcoming Classes</h2>
          
          {upcomingBookings && upcomingBookings.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {upcomingBookings.map((cls) => (
                <div key={cls._id} className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm flex flex-col justify-between">
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex flex-col">
                      <span className="text-[10px] font-black text-[#E8541A] uppercase tracking-widest">
                        {new Date(cls.dateTime).toLocaleDateString([], { weekday: 'short', month: 'short', day: 'numeric' })}
                      </span>
                      <span className="text-sm font-black text-[#1A1A2E]">
                        {new Date(cls.dateTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                    <div className="h-8 w-8 bg-gray-50 rounded-full flex items-center justify-center">
                      <CalendarIcon size={14} className="text-gray-400" />
                    </div>
                  </div>
                  
                  <h4 className="text-lg font-black text-[#1A1A2E] truncate">{cls.title}</h4>
                  <p className="text-xs font-bold text-gray-500 mt-1">Coach: {cls.coach}</p>
                  
                  <button 
                    onClick={() => handleCancelBooking(cls._id)}
                    className="mt-6 w-full py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest border border-gray-100 rounded-xl hover:bg-red-50 hover:text-red-500 hover:border-red-100 transition-colors"
                  >
                    Cancel Booking
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="bg-white rounded-[32px] p-12 border border-dashed border-gray-200 flex flex-col items-center justify-center text-center opacity-60">
              <CalendarIcon size={48} className="text-gray-200 mb-4" />
              <h3 className="text-xl font-black text-[#1A1A2E]">No upcoming classes</h3>
              <p className="text-sm font-bold text-gray-400 mt-2 max-w-sm">You haven't scheduled any WODs yet. Head over to the schedule to claim your spot.</p>
            </div>
          )}
        </div>

      </div>
    </MemberLayout>
  );
}
