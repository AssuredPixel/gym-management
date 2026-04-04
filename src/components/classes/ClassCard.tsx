"use client";

import React from "react";
import { Clock, User, Users, Edit3, Eye, AlertCircle } from "lucide-react";

interface ClassCardProps {
  cls: any;
  onEdit: (cls: any) => void;
  onViewBookings: (cls: any) => void;
}

export default function ClassCard({ cls, onEdit, onViewBookings }: ClassCardProps) {
  const isFull = cls.bookedCount >= cls.capacity;
  const isHighCapacity = !isFull && (cls.bookedCount / cls.capacity) >= 0.75;
  const isCancelled = cls.status === 'cancelled';
  
  const formattedTime = new Date(cls.dateTime).toLocaleTimeString("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });

  const getTypeStyles = (type: string) => {
    const styles: Record<string, string> = {
      wod: "bg-orange-50 text-orange-600 border-orange-100",
      strength: "bg-blue-50 text-blue-600 border-blue-100",
      competition: "bg-purple-50 text-purple-600 border-purple-100",
      open: "bg-green-50 text-green-600 border-green-100",
    };
    return styles[type] || styles.wod;
  };

  return (
    <div className={`group relative bg-white rounded-2xl border border-gray-100 p-5 transition-all hover:shadow-xl hover:shadow-gray-200/40 hover:-translate-y-1 ${isCancelled ? 'opacity-60 bg-gray-50' : ''}`}>
      <div className="flex justify-between items-start mb-4">
        <div className="flex flex-col">
          <div className="flex items-center gap-2 mb-1">
            <span className={`text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full border ${getTypeStyles(cls.classType)}`}>
              {cls.classType}
            </span>
            {isCancelled && (
              <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full bg-red-50 text-red-500 border border-red-100">
                Cancelled
              </span>
            )}
          </div>
          <h4 className={`text-lg font-black text-[#1A1A2E] leading-tight group-hover:text-[#E8541A] transition-colors ${isCancelled ? 'line-through' : ''}`}>
            {cls.title}
          </h4>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => onEdit(cls)}
            className="p-2 text-gray-400 hover:text-primary hover:bg-orange-50 rounded-xl transition-all"
            title="Edit Class"
          >
            <Edit3 size={18} />
          </button>
          <button 
            onClick={() => onViewBookings(cls)}
            className="p-2 text-gray-400 hover:text-[#1A3F7A] hover:bg-blue-50 rounded-xl transition-all"
            title="View Participants"
          >
            <Eye size={18} />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div className="flex items-center gap-2 text-gray-500">
          <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100 text-gray-400">
            <Clock size={14} />
          </div>
          <span className="text-xs font-bold">{formattedTime}</span>
        </div>
        <div className="flex items-center gap-2 text-gray-500">
          <div className="bg-gray-50 p-1.5 rounded-lg border border-gray-100 text-gray-400">
            <User size={14} />
          </div>
          <span className="text-xs font-bold truncate">{cls.coach}</span>
        </div>
      </div>

      <div className="space-y-2">
        <div className="flex justify-between items-end">
          <div className="flex items-center gap-1.5">
            <Users size={12} className="text-gray-400" />
            <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className={`text-xs font-black ${isFull ? 'text-red-500' : isHighCapacity ? 'text-amber-500' : 'text-[#1A1A2E]'}`}>
              {cls.bookedCount} / {cls.capacity}
            </span>
            {isHighCapacity && <AlertCircle size={10} className="text-amber-500 animate-pulse" />}
          </div>
        </div>
        <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden border border-gray-50">
          <div 
            className={`h-full transition-all duration-500 rounded-full ${
              isFull ? 'bg-red-500' : isHighCapacity ? 'bg-amber-500' : 'bg-[#E8541A]'
            }`}
            style={{ width: `${Math.min((cls.bookedCount / cls.capacity) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}
