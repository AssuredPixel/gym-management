"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  List,
  Clock,
  Loader2,
  CheckCircle2
} from "lucide-react";
import MemberLayout from "@/components/layout/MemberLayout";
import toast from "react-hot-toast";

interface ClassItem {
  _id: string;
  title: string;
  coach: string;
  dateTime: string;
  durationMinutes: number;
  capacity: number;
  bookedCount: number;
  classType: string;
  description?: string;
  isBookedByMe: boolean;
}

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export default function MemberClassesPage() {
  const { data: session } = useSession();
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [classes, setClasses] = useState<ClassItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [actionLoading, setActionLoading] = useState<string | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const weekStartStr = currentWeekStart.toISOString();
      const res = await axios.get(`/api/portal/classes?weekStart=${weekStartStr}`);
      setClasses(res.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
      toast.error("Failed to load schedule");
    } finally {
      setIsLoading(false);
    }
  }, [currentWeekStart]);

  useEffect(() => {
    fetchClasses();
  }, [fetchClasses]);

  const handlePrevWeek = () => {
    const prev = new Date(currentWeekStart);
    prev.setDate(prev.getDate() - 7);
    setCurrentWeekStart(prev);
  };

  const handleNextWeek = () => {
    const next = new Date(currentWeekStart);
    next.setDate(next.getDate() + 7);
    setCurrentWeekStart(next);
  };

  const formatWeekRange = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    return `${currentWeekStart.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', { ...options, year: '2-digit' })}`;
  };

  const handleBookClass = async (classId: string) => {
    try {
      setActionLoading(classId);
      const res = await axios.post(`/api/portal/classes/${classId}/book`);
      if (res.data.success) {
        // Optimistic update
        setClasses(classes.map(c => 
          c._id === classId 
            ? { ...c, isBookedByMe: true, bookedCount: c.bookedCount + 1 } 
            : c
        ));
        toast.success("Spot reserved successfully!");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to book class");
    } finally {
      setActionLoading(null);
    }
  };

  const handleCancelBooking = async (classId: string) => {
    if (!confirm("Cancel this booking?")) return;
    try {
      setActionLoading(classId);
      const res = await axios.delete(`/api/portal/classes/${classId}/book`);
      if (res.data.success) {
        // Optimistic update
        setClasses(classes.map(c => 
          c._id === classId 
            ? { ...c, isBookedByMe: false, bookedCount: c.bookedCount - 1 } 
            : c
        ));
        toast.success("Booking cancelled");
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to cancel booking");
    } finally {
      setActionLoading(null);
    }
  };

  const getClassTypeColor = (type: string) => {
    switch (type) {
      case 'wod': return "border-[#E8541A]";
      case 'strength': return "border-blue-500";
      case 'competition': return "border-purple-500";
      case 'open': return "border-green-500";
      default: return "border-[#E8541A]";
    }
  };

  const getCapacityColor = (booked: number, capacity: number) => {
    const ratio = booked / capacity;
    if (ratio >= 1) return "text-red-500";
    if (ratio >= 0.75) return "text-amber-500";
    return "text-green-500";
  };
  
  const getCapacityBgColor = (booked: number, capacity: number) => {
    const ratio = booked / capacity;
    if (ratio >= 1) return "bg-red-500";
    if (ratio >= 0.75) return "bg-amber-500";
    return "bg-green-500";
  };

  return (
    <MemberLayout>
      <div className="space-y-8 animate-in fade-in duration-500 pb-20">
        {/* Header */}
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-end gap-6 bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1A1A2E] tracking-tight">Book a WOD</h1>
            <p className="text-sm font-bold text-gray-400 mt-2">Browse upcoming classes and reserve your spot.</p>
          </div>
          
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            {/* Week Nav */}
            <div className="flex items-center justify-between w-full sm:w-auto bg-gray-50 px-4 py-2 rounded-2xl border border-gray-100">
              <button onClick={handlePrevWeek} className="p-2 hover:text-[#E8541A] transition-colors bg-white rounded-xl shadow-sm hover:scale-105 active:scale-95">
                <ChevronLeft size={16} />
              </button>
              <span className="text-sm font-black text-[#1A1A2E] min-w-[160px] text-center tracking-tight">
                {formatWeekRange()}
              </span>
              <button onClick={handleNextWeek} className="p-2 hover:text-[#E8541A] transition-colors bg-white rounded-xl shadow-sm hover:scale-105 active:scale-95">
                <ChevronRight size={16} />
              </button>
            </div>

            {/* View Toggle */}
            <div className="flex items-center gap-1 bg-gray-50 p-1 rounded-2xl border border-gray-100 w-full sm:w-auto">
              <button 
                onClick={() => setViewMode("list")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === "list" ? "bg-white text-[#1A1A2E] shadow-sm" : "text-gray-400 hover:text-[#1A1A2E]"
                }`}
              >
                <List size={14} /> List View
              </button>
              <button 
                onClick={() => setViewMode("calendar")}
                className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${
                  viewMode === "calendar" ? "bg-white text-[#1A1A2E] shadow-sm" : "text-gray-400 hover:text-[#1A1A2E]"
                }`}
              >
                <CalendarIcon size={14} /> Calendar
              </button>
            </div>
          </div>
        </div>

        {/* Schedule List */}
        {isLoading ? (
          <div className="h-[40vh] flex flex-col items-center justify-center gap-4 bg-white/50 rounded-[32px] border border-gray-100 border-dashed backdrop-blur-sm">
            <Loader2 className="animate-spin text-[#E8541A]" size={40} />
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Schedule...</p>
          </div>
        ) : classes.length === 0 ? (
          <div className="h-[40vh] flex flex-col items-center justify-center gap-4 bg-white/50 rounded-[32px] border border-gray-100 border-dashed backdrop-blur-sm">
            <CalendarIcon className="text-gray-200" size={48} />
            <p className="text-sm font-bold text-gray-400">No classes scheduled for this week.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {classes.map((cls) => {
              const dt = new Date(cls.dateTime);
              const isFull = cls.bookedCount >= cls.capacity;
              const isPast = dt < new Date();
              
              return (
                <div 
                  key={cls._id} 
                  className={`bg-white rounded-xl shadow-sm p-4 md:p-6 border-l-4 ${getClassTypeColor(cls.classType)} flex flex-col md:flex-row items-start md:items-center gap-4 md:gap-6 hover:shadow-md transition-shadow relative overflow-hidden ${isPast ? 'opacity-60 grayscale-[50%]' : ''}`}
                >
                  {/* Left: Date */}
                  <div className="w-16 flex flex-col items-center shrink-0">
                    <span className="text-[10px] text-[#E8541A] font-black uppercase tracking-widest">
                      {dt.toLocaleDateString('en-US', { weekday: 'short' })}
                    </span>
                    <span className="text-3xl font-black text-[#1A1A2E] leading-none mt-1">
                      {dt.getDate()}
                    </span>
                  </div>

                  <div className="hidden md:block h-12 w-px bg-gray-200 mx-2 shrink-0"></div>

                  {/* Center: Details */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-lg md:text-xl font-black text-[#1A1A2E] truncate">{cls.title}</h3>
                      {cls.classType !== 'wod' && (
                        <span className="text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded bg-gray-100 text-gray-500">
                          {cls.classType}
                        </span>
                      )}
                    </div>
                    <p className="text-xs font-bold text-[#666666] mt-1">Coach {cls.coach}</p>
                    {cls.description && (
                      <p className="text-xs text-[#666666] line-clamp-1 mt-1.5 opacity-80">{cls.description}</p>
                    )}
                  </div>

                  {/* Center-right: Time */}
                  <div className="flex flex-col md:items-end shrink-0 w-full md:w-auto mt-2 md:mt-0 px-2 md:px-0">
                    <div className="bg-gray-50 px-3 py-1.5 rounded-lg flex items-center gap-2 border border-gray-100">
                      <Clock size={14} className="text-gray-400" />
                      <span className="text-sm font-black text-[#1A1A2E]">
                        {dt.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })}
                      </span>
                    </div>
                    <span className="text-[10px] font-bold text-[#666666] mt-1.5 text-right uppercase tracking-widest">
                      {cls.durationMinutes} Min
                    </span>
                  </div>

                  <div className="w-full md:hidden h-px bg-gray-100 my-2"></div>

                  {/* Right: Capacity & Action */}
                  <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center w-full md:w-[140px] shrink-0 gap-3 md:gap-2">
                    
                    <div className="flex flex-col w-full md:w-auto md:items-end">
                      <span className={`text-sm font-black tracking-tight ${getCapacityColor(cls.bookedCount, cls.capacity)}`}>
                        {cls.bookedCount} / {cls.capacity} <span className="text-[10px] uppercase text-gray-400 ml-1">Spots</span>
                      </span>
                      <div className="w-full md:w-24 h-1.5 bg-gray-100 rounded-full mt-1.5 overflow-hidden">
                        <div 
                          className={`h-full ${getCapacityBgColor(cls.bookedCount, cls.capacity)}`}
                          style={{ width: `${Math.min(100, (cls.bookedCount / cls.capacity) * 100)}%` }}
                        />
                      </div>
                    </div>

                    <div className="flex flex-col items-end w-auto md:w-full md:mt-1">
                      {isPast ? (
                         <span className="text-xs font-black text-gray-400 uppercase tracking-widest px-4 py-2 border border-gray-200 rounded-xl bg-gray-50">Ended</span>
                      ) : cls.isBookedByMe ? (
                        <div className="flex flex-col md:items-end items-center">
                          <button 
                            disabled={true}
                            className="bg-green-50 text-[#1A7A4A] border border-green-200 text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-xl flex items-center gap-2 w-full justify-center md:w-auto md:justify-end"
                          >
                            <CheckCircle2 size={16} /> Booked
                          </button>
                          <button 
                            onClick={() => handleCancelBooking(cls._id)}
                            disabled={actionLoading === cls._id}
                            className="text-[10px] font-black text-gray-400 hover:text-red-500 uppercase tracking-widest mt-2 hover:underline transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      ) : isFull ? (
                        <button 
                          disabled={true}
                          className="bg-gray-100 text-gray-400 text-xs font-black uppercase tracking-widest px-4 py-2.5 rounded-xl border border-gray-200 cursor-not-allowed w-full md:w-auto md:min-w-[120px] text-center"
                        >
                          Full
                        </button>
                      ) : (
                        <button 
                          onClick={() => handleBookClass(cls._id)}
                          disabled={actionLoading === cls._id}
                          className="bg-[#E8541A] text-white text-xs font-black uppercase tracking-widest px-6 py-2.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 transition-all w-full md:w-auto md:min-w-[120px] flex items-center justify-center gap-2"
                        >
                          {actionLoading === cls._id && <Loader2 size={14} className="animate-spin" />}
                          Book Spot
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </MemberLayout>
  );
}
