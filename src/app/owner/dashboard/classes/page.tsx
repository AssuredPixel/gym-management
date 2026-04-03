"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Loader2,
  RefreshCw
} from "lucide-react";
import CalendarGrid from "@/components/classes/CalendarGrid";
import WODModal from "@/components/classes/WODModal";
import BookingsDrawer from "@/components/classes/BookingsDrawer";

// Helper to get the Monday of the current week
const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export default function WODSchedulePage() {
  const [currentWeekStart, setCurrentWeekStart] = useState<Date>(getMonday(new Date()));
  const [classes, setClasses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedClass, setSelectedClass] = useState<any>(null);
  const [selectedDrawerClass, setSelectedDrawerClass] = useState<any>(null);
  const [prefilledDate, setPrefilledDate] = useState<Date | null>(null);

  const fetchClasses = useCallback(async () => {
    setIsLoading(true);
    try {
      const weekStartStr = currentWeekStart.toISOString();
      const res = await axios.get(`/api/classes?weekStart=${weekStartStr}`);
      setClasses(res.data);
    } catch (error) {
      console.error("Failed to fetch classes:", error);
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

  const handleToday = () => {
    setCurrentWeekStart(getMonday(new Date()));
  };

  const handleOpenCreateModal = (date?: Date) => {
    setSelectedClass(null);
    setPrefilledDate(date || null);
    setIsModalOpen(true);
  };

  const handleOpenEditModal = (cls: any) => {
    setSelectedClass(cls);
    setPrefilledDate(null);
    setIsModalOpen(true);
  };

  const handleOpenDrawer = (cls: any) => {
    setSelectedDrawerClass(cls);
    setIsDrawerOpen(true);
  };

  const formatWeekRange = () => {
    const end = new Date(currentWeekStart);
    end.setDate(end.getDate() + 6);
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
    const startStr = currentWeekStart.toLocaleDateString('en-US', options);
    const endStr = end.toLocaleDateString('en-US', { ...options, year: 'numeric' });
    
    return `${startStr} – ${endStr}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      {/* Header & Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-[#E8541A] p-2.5 rounded-xl text-white shadow-lg shadow-orange-500/20">
            <CalendarIcon size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black text-[#1A1A2E] tracking-tight">WOD Schedule</h1>
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-0.5">Manage weekly programming</p>
          </div>
        </div>

        {/* Center: Week Nav */}
        <div className="flex items-center gap-6 bg-gray-50 px-4 py-2 rounded-xl border border-gray-100">
          <button 
            onClick={handlePrevWeek}
            className="p-1 hover:text-primary transition-colors hover:bg-white rounded-md"
          >
            <ChevronLeft size={20} />
          </button>
          <span className="text-sm font-black text-[#1A1A2E] min-w-[140px] text-center">
            {formatWeekRange()}
          </span>
          <button 
            onClick={handleNextWeek}
            className="p-1 hover:text-primary transition-colors hover:bg-white rounded-md"
          >
            <ChevronRight size={20} />
          </button>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button 
            onClick={handleToday}
            className="flex-1 md:flex-none px-4 py-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-[#1A1A2E] hover:bg-gray-100 rounded-lg transition-all"
          >
            Today
          </button>
          <button 
            onClick={() => handleOpenCreateModal()}
            className="flex-1 md:flex-none bg-[#E8541A] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            <Plus size={16} />
            Create WOD
          </button>
        </div>
      </div>

      {/* Calendar Grid */}
      {isLoading ? (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm h-[600px] flex flex-col items-center justify-center gap-3">
          <Loader2 className="animate-spin text-primary" size={32} />
          <p className="text-xs font-black text-gray-300 uppercase tracking-widest">Fetching Schedule...</p>
        </div>
      ) : (
        <CalendarGrid 
          weekStart={currentWeekStart} 
          classes={classes} 
          onEditClass={handleOpenEditModal}
          onViewBookings={handleOpenDrawer}
          onCreateAtSlot={handleOpenCreateModal}
        />
      )}

      {/* Modals */}
      <WODModal 
        isOpen={isModalOpen}
        mode={selectedClass ? "edit" : "create"}
        wodClass={selectedClass}
        defaultDateTime={prefilledDate}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchClasses}
      />

      {/* Drawers */}
      <BookingsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        wodClass={selectedDrawerClass}
        onRefresh={fetchClasses}
      />
    </div>
  );
}
