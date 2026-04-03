"use client";

import React, { useMemo } from "react";
import { Plus, AlertCircle, Eye } from "lucide-react";

interface WODClass {
  _id: string;
  title: string;
  coach: string;
  dateTime: string | Date;
  capacity: number;
  bookedCount: number;
  classType: "wod" | "strength" | "competition" | "open";
  status: "scheduled" | "cancelled";
}

interface CalendarGridProps {
  weekStart: Date;
  classes: WODClass[];
  onEditClass: (cls: WODClass) => void;
  onViewBookings: (cls: WODClass) => void;
  onCreateAtSlot: (date: Date) => void;
}

const HOURS = [5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22];
const DAYS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

export default function CalendarGrid({ weekStart, classes, onEditClass, onViewBookings, onCreateAtSlot }: CalendarGridProps) {
  
  // ─── Helper: Grouping Logic ────────────────────────────────────────────────
  const groupedClasses = useMemo(() => {
    const map: Record<string, WODClass[]> = {};
    
    classes.forEach((cls) => {
      const date = new Date(cls.dateTime);
      const dayIndex = (date.getDay() + 6) % 7; // Convert to Mon=0, Sun=6
      const hour = date.getHours();
      const key = `${dayIndex}-${hour}`;
      
      if (!map[key]) map[key] = [];
      map[key].push(cls);
    });
    
    return map;
  }, [classes]);

  // ─── Date Formatting ───────────────────────────────────────────────────────
  const getDayDetails = (dayIndex: number) => {
    const date = new Date(weekStart);
    date.setDate(date.getDate() + dayIndex);
    const dayOfMonth = date.getDate();
    const isToday = new Date().toDateString() === date.toDateString();
    
    return { dayOfMonth, isToday, date };
  };

  const formatHour = (hour: number) => {
    const period = hour >= 12 ? "PM" : "AM";
    const h = hour % 12 || 12;
    return `${h}${period}`;
  };

  const getTypeStyles = (type: string, isCancelled: boolean) => {
    if (isCancelled) return "bg-gray-100 text-gray-400 border-gray-200";
    
    const styles = {
      wod: "bg-[#E8541A] text-white",
      strength: "bg-[#1A3F7A] text-white",
      competition: "bg-[#4B2D8A] text-white",
      open: "bg-[#1A6B3C] text-white",
    };
    return (styles as any)[type] || styles.wod;
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
      {/* Header Row */}
      <div className="grid grid-cols-8 bg-gray-50 border-b border-gray-100">
        <div className="p-4 border-r border-gray-100 bg-white" /> {/* Empty time cell */}
        {DAYS.map((day, i) => {
          const { dayOfMonth, isToday } = getDayDetails(i);
          return (
            <div 
              key={day} 
              className={`p-4 flex flex-col items-center justify-center border-r border-gray-100 last:border-none transition-all ${
                isToday ? "bg-[#E8541A] text-white shadow-[0_-4px_0_0_inset_#E8541A]" : ""
              }`}
            >
              <span className={`text-[10px] font-black uppercase tracking-widest ${isToday ? "text-white/80" : "text-gray-400"}`}>
                {day}
              </span>
              <span className="text-xl font-black mt-0.5">{dayOfMonth}</span>
            </div>
          );
        })}
      </div>

      {/* Grid Content */}
      <div className="flex flex-col">
        {HOURS.map((hour) => (
          <div key={hour} className="grid grid-cols-8 border-b border-gray-50 last:border-none group">
            {/* Time Marker */}
            <div className="p-4 border-r border-gray-100 text-right bg-gray-50/50 min-h-[100px] flex items-start justify-end">
              <span className="text-xs font-black text-gray-400 uppercase tracking-tighter opacity-70">
                {formatHour(hour)}
              </span>
            </div>

            {/* Day Slots */}
            {DAYS.map((_, dayIdx) => {
              const { date } = getDayDetails(dayIdx);
              const slotKey = `${dayIdx}-${hour}`;
              const slotClasses = groupedClasses[slotKey] || [];
              
              return (
                <div 
                  key={slotKey}
                  className="relative group/slot min-h-[100px] border-r border-gray-100 last:border-none transition-all hover:bg-gray-50/30 p-1 flex flex-col gap-1"
                >
                  {/* Slot Hover Action */}
                  <button 
                    onClick={() => {
                      const d = new Date(date);
                      d.setHours(hour, 0, 0, 0);
                      onCreateAtSlot(d);
                    }}
                    className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/slot:opacity-100 transition-opacity bg-primary/5 z-10"
                  >
                    <Plus className="text-primary/40" size={20} />
                  </button>

                  {/* Class Cards */}
                  {slotClasses.map((cls) => {
                    const isFull = cls.bookedCount >= cls.capacity;
                    const isHighCapacity = !isFull && (cls.bookedCount / cls.capacity) >= 0.75;
                    const isCancelled = cls.status === 'cancelled';

                    return (
                      <div
                        key={cls._id}
                        className={`relative z-20 flex flex-col p-2.5 rounded-xl cursor-pointer hover:scale-[1.02] active:scale-95 transition-all shadow-sm ${getTypeStyles(cls.classType, isCancelled)}`}
                      >
                        <div className="flex justify-between items-start gap-1">
                          <h4 
                            onClick={() => onEditClass(cls)}
                            className={`text-[11px] font-black uppercase leading-tight truncate flex-1 ${isCancelled ? 'line-through' : ''}`}
                          >
                            {cls.title}
                          </h4>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button 
                              onClick={(e) => {
                                e.stopPropagation();
                                onViewBookings(cls);
                              }}
                              className="p-1 hover:bg-black/10 rounded transition-colors"
                            >
                              <Eye size={12} />
                            </button>
                            {isFull && (
                              <span className="bg-black/10 text-[8px] font-black uppercase px-1 rounded">FULL</span>
                            )}
                            {isHighCapacity && <AlertCircle size={10} className="text-amber-300" />}
                          </div>
                        </div>
                        <p 
                          onClick={() => onEditClass(cls)}
                          className="text-[10px] font-bold opacity-70 mt-1 truncate"
                        >
                          {cls.coach}
                        </p>
                        
                        <div className="mt-2 pt-2 border-t border-white/10 flex justify-between items-center bg-transparent">
                          <button 
                            onClick={() => onViewBookings(cls)}
                            className="text-[9px] font-black uppercase tracking-widest opacity-80 hover:opacity-100 transition-opacity"
                          >
                            {cls.bookedCount}/{cls.capacity} Booked
                          </button>
                        </div>

                        {isCancelled && (
                          <div className="absolute inset-0 bg-white/40 flex items-center justify-center rounded-xl backdrop-blur-[1px]">
                            <span className="text-[10px] font-black text-red-500 uppercase tracking-widest bg-white px-2 py-0.5 rounded-full shadow-sm border border-red-50">Cancelled</span>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}
