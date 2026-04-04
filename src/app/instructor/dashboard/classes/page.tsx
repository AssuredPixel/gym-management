"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { 
  ChevronLeft, 
  ChevronRight, 
  Plus, 
  Calendar as CalendarIcon,
  Loader2,
  Trophy
} from "lucide-react";
import InstructorLayout from "@/components/layout/InstructorLayout";
import ClassList from "@/components/classes/ClassList";
import WODModal from "@/components/classes/WODModal";
import BookingsDrawer from "@/components/classes/BookingsDrawer";

const getMonday = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = date.getDate() - day + (day === 0 ? -6 : 1);
  const monday = new Date(date.setDate(diff));
  monday.setHours(0, 0, 0, 0);
  return monday;
};

export default function InstructorClassesPage() {
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
      // Using the base /api/classes which is now role-aware
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
    return `${currentWeekStart.toLocaleDateString('en-US', options)} – ${end.toLocaleDateString('en-US', { ...options, year: 'numeric' })}`;
  };

  return (
    <InstructorLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header & Navigation */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
                <Trophy size={120} className="text-primary -rotate-12" />
            </div>
            
            <div className="flex items-center gap-5 relative">
                <div className="bg-primary p-4 rounded-[20px] text-white shadow-xl shadow-orange-500/30">
                    <CalendarIcon size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tight">Focus Schedule</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage your weekly coaching rotation</p>
                </div>
            </div>

            <div className="flex flex-col md:flex-row items-center gap-6 w-full md:w-auto relative">
                {/* Week Nav */}
                <div className="flex items-center gap-6 bg-gray-50/80 backdrop-blur-sm px-5 py-3 rounded-2xl border border-gray-100 w-full md:w-auto justify-between">
                    <button onClick={handlePrevWeek} className="p-2 hover:text-primary transition-colors bg-white rounded-xl shadow-sm hover:scale-110 active:scale-95">
                        <ChevronLeft size={20} />
                    </button>
                    <span className="text-sm font-black text-[#1A1A2E] min-w-[150px] text-center tracking-tight">
                        {formatWeekRange()}
                    </span>
                    <button onClick={handleNextWeek} className="p-2 hover:text-primary transition-colors bg-white rounded-xl shadow-sm hover:scale-110 active:scale-95">
                        <ChevronRight size={20} />
                    </button>
                </div>

                <div className="flex items-center gap-3 w-full md:w-auto">
                    <button onClick={handleToday} className="flex-1 md:flex-none px-5 py-3 text-xs font-black uppercase tracking-widest text-gray-400 hover:text-[#1A1A2E] transition-all">
                        Today
                    </button>
                    <button 
                        onClick={() => handleOpenCreateModal()}
                        className="flex-1 md:flex-none bg-primary text-white text-[10px] font-black uppercase tracking-widest px-8 py-4 rounded-[20px] shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 transition-all flex items-center justify-center gap-2"
                    >
                        <Plus size={16} />
                        New WOD
                    </button>
                </div>
            </div>
        </div>

        {/* Schedule View */}
        {isLoading ? (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm h-[600px] flex flex-col items-center justify-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Compiling Coach Schedule...</p>
            </div>
        ) : (
            <ClassList 
                weekStart={currentWeekStart} 
                classes={classes} 
                onEditClass={handleOpenEditModal}
                onViewBookings={handleOpenDrawer}
                onCreateAtSlot={handleOpenCreateModal}
            />
        )}
      </div>

      {/* Modals & Drawers */}
      <WODModal 
        isOpen={isModalOpen}
        mode={selectedClass ? "edit" : "create"}
        wodClass={selectedClass}
        defaultDateTime={prefilledDate}
        onClose={() => setIsModalOpen(false)}
        onSave={fetchClasses}
      />

      <BookingsDrawer 
        isOpen={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        wodClass={selectedDrawerClass}
        onRefresh={fetchClasses}
      />
    </InstructorLayout>
  );
}
