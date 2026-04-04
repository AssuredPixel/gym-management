"use client";

import React, { useMemo } from "react";
import ClassCard from "./ClassCard";
import { Calendar, Plus, ExternalLink } from "lucide-react";

interface ClassListProps {
  classes: any[];
  onEditClass: (cls: any) => void;
  onViewBookings: (cls: any) => void;
  onCreateAtSlot: (date: Date) => void;
  weekStart: Date;
}

export default function ClassList({ classes, onEditClass, onViewBookings, onCreateAtSlot, weekStart }: ClassListProps) {
  
  // Group classes by their ISO date (YYYY-MM-DD)
  const groupedClasses = useMemo(() => {
    const map: Record<string, any[]> = {};
    
    // Sort classes chronologically first
    const sorted = [...classes].sort((a, b) => 
      new Date(a.dateTime).getTime() - new Date(b.dateTime).getTime()
    );

    sorted.forEach((cls) => {
      const dateKey = new Date(cls.dateTime).toISOString().split("T")[0];
      if (!map[dateKey]) map[dateKey] = [];
      map[dateKey].push(cls);
    });
    
    return map;
  }, [classes]);

  // Generate an array of 7 dates for the current week
  const weekDays = useMemo(() => {
    const days = [];
    const current = new Date(weekStart);
    for (let i = 0; i < 7; i++) {
      days.push(new Date(current));
      current.setDate(current.getDate() + 1);
    }
    return days;
  }, [weekStart]);

  const formatDateLabel = (date: Date) => {
    const isToday = new Date().toDateString() === date.toDateString();
    const dayName = date.toLocaleDateString("en-US", { weekday: "long" });
    const dayAndMonth = date.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    
    return { dayName, dayAndMonth, isToday };
  };

  return (
    <div className="flex flex-col gap-10 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20">
      {weekDays.map((date) => {
        const dateKey = date.toISOString().split("T")[0];
        const dayClasses = groupedClasses[dateKey] || [];
        const { dayName, dayAndMonth, isToday } = formatDateLabel(date);
        
        return (
          <div key={dateKey} className="relative">
            {/* Day Header */}
            <div className="flex items-center gap-4 mb-6 sticky top-0 z-10 bg-gray-50/80 backdrop-blur-md py-4 -mx-4 px-4 rounded-xl">
              <div className={`h-10 w-10 rounded-xl flex items-center justify-center font-black ${
                isToday ? "bg-[#E8541A] text-white shadow-lg shadow-orange-500/20" : "bg-white text-[#1A1A2E] border border-gray-100 shadow-sm"
              }`}>
                {date.getDate()}
              </div>
              <div className="flex flex-col">
                <h3 className={`text-sm font-black uppercase tracking-widest ${isToday ? "text-[#E8541A]" : "text-[#1A1A2E]"}`}>
                  {dayName} {isToday && "• TODAY"}
                </h3>
                <span className="text-xs font-bold text-gray-400">{dayAndMonth}</span>
              </div>
              <div className="flex-1 border-b border-gray-100 ml-4 h-px opacity-50" />
              <button 
                onClick={() => onCreateAtSlot(date)}
                className="group flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-[#E8541A] transition-colors"
              >
                <Plus size={14} className="group-hover:rotate-90 transition-transform" />
                Add Class
              </button>
            </div>

            {/* Classes Grid */}
            {dayClasses.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {dayClasses.map((cls) => (
                  <ClassCard 
                    key={cls._id} 
                    cls={cls} 
                    onEdit={onEditClass} 
                    onViewBookings={onViewBookings} 
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-12 bg-white rounded-3xl border-2 border-dashed border-gray-100 opacity-60">
                <Calendar size={32} className="text-gray-200 mb-3" />
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">
                  No classes scheduled
                </p>
                <button 
                  onClick={() => onCreateAtSlot(date)}
                  className="mt-3 text-[10px] font-black text-[#E8541A] uppercase tracking-widest hover:underline"
                >
                  Create one now
                </button>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
