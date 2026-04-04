"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Toaster, toast } from "react-hot-toast";
import { Search, Plus, Users, ShieldCheck, Info } from "lucide-react";
import InstructorsTable, { Instructor } from "@/components/instructors/InstructorsTable";
import InstructorModal from "@/components/instructors/InstructorModal";

export default function InstructorsPage() {
  const [instructors, setInstructors] = useState<Instructor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedInstructor, setSelectedInstructor] = useState<Instructor | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

  const fetchInstructors = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch("/api/instructors");
      if (res.ok) {
        const data = await res.json();
        setInstructors(data);
      }
    } catch (err) {
      console.error("Failed to fetch instructors:", err);
      toast.error("Failed to load instructors");
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchInstructors();
  }, [fetchInstructors]);

  const handleAdd = () => {
    setModalMode('add');
    setSelectedInstructor(null);
    setIsModalOpen(true);
  };

  const handleEdit = (instructor: Instructor) => {
    setModalMode('edit');
    setSelectedInstructor(instructor);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to remove this instructor?")) return;
    try {
      const res = await fetch(`/api/instructors?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        toast.success("Instructor removed");
        fetchInstructors();
      }
    } catch (err) {
      toast.error("Failed to delete instructor");
    }
  };

  const filteredInstructors = instructors.filter(i => 
    i.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    i.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">

      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Staff Management</h1>
            <div className="bg-primary/10 text-primary px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider">
              Admin
            </div>
          </div>
          <p className="text-sm text-gray-500 font-medium">Manage your coaches, instructors and administration staff</p>
        </div>
        
        <button 
          onClick={handleAdd}
          className="flex items-center justify-center gap-2 bg-primary text-white px-6 py-3 rounded-xl font-bold text-sm hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 hover:scale-[1.02] active:scale-95"
        >
          <Plus size={18} />
          <span>Add Instructor</span>
        </button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-blue-50 text-blue-500 rounded-xl flex items-center justify-center">
            <Users size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Total Staff</p>
            <p className="text-2xl font-black text-gray-900">{instructors.length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4">
          <div className="h-12 w-12 bg-green-50 text-green-500 rounded-xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Active Now</p>
            <p className="text-2xl font-black text-gray-900">{instructors.filter(i => i.isActive).length}</p>
          </div>
        </div>
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm flex items-center gap-4 bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
          <div className="h-12 w-12 bg-primary/10 text-primary rounded-xl flex items-center justify-center">
            <Info size={24} />
          </div>
          <div className="flex-1">
            <p className="text-xs font-bold text-primary uppercase tracking-wider">Quick Note</p>
            <p className="text-xs text-gray-500 font-medium leading-relaxed mt-1">Instructors can manage classes and member attendance.</p>
          </div>
        </div>
      </div>

      {/* Filters Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="relative w-full sm:w-[400px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-4 pointer-events-none text-gray-300">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="bg-white border border-gray-100 text-gray-900 text-sm rounded-xl focus:ring-2 focus:ring-primary/10 focus:border-primary block w-full pl-12 p-3.5 outline-none transition-all shadow-sm"
            placeholder="Search by name or email..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
      </div>

      {/* Table Section */}
      <InstructorsTable 
        instructors={filteredInstructors} 
        isLoading={isLoading} 
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {/* Modal */}
      {isModalOpen && (
        <InstructorModal 
          mode={modalMode}
          instructor={selectedInstructor}
          onClose={() => setIsModalOpen(false)}
          onSave={fetchInstructors}
        />
      )}
    </div>
  );
}
