"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { 
  Users, 
  Search, 
  Mail, 
  Calendar, 
  Loader2, 
  ChevronRight,
  Filter,
  CheckCircle2,
  Clock
} from "lucide-react";
import InstructorLayout from "@/components/layout/InstructorLayout";

interface Student {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  attendanceCount: number;
  lastAttended?: string;
  createdAt: string;
}

export default function InstructorStudentsPage() {
  const [students, setStudents] = useState<Student[]>([]);
  const [filteredStudents, setFilteredStudents] = useState<Student[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    async function fetchStudents() {
      try {
        const res = await axios.get("/api/instructor/students");
        setStudents(res.data);
        setFilteredStudents(res.data);
      } catch (error) {
        console.error("Failed to fetch students:", error);
      } finally {
        setIsLoading(false);
      }
    }
    fetchStudents();
  }, []);

  useEffect(() => {
    const filtered = students.filter(s => 
      s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.email.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredStudents(filtered);
  }, [searchQuery, students]);

  return (
    <InstructorLayout>
      <div className="space-y-8 animate-in fade-in duration-500">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 bg-white p-8 rounded-[32px] border border-gray-100 shadow-sm">
            <div className="flex items-center gap-5">
                <div className="bg-blue-500 p-4 rounded-[20px] text-white shadow-xl shadow-blue-500/20">
                    <Users size={28} />
                </div>
                <div>
                    <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tight">Athlete Directory</h1>
                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-1">Manage your personal roster of students</p>
                </div>
            </div>

            <div className="relative w-full md:w-80">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                <input 
                    type="text"
                    placeholder="Search by name or email..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-100 p-4 pl-12 rounded-2xl text-sm font-bold focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 transition-all outline-none"
                />
            </div>
        </div>

        {/* Filters/Stats Bar (Optional but nice) */}
        <div className="flex flex-wrap gap-4 px-4">
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm">
                <span className="text-[10px] font-black text-gray-400 uppercase">Total Athletes:</span>
                <span className="text-sm font-black text-[#1A1A2E]">{students.length}</span>
            </div>
            <div className="flex items-center gap-2 bg-white px-5 py-3 rounded-2xl border border-gray-100 shadow-sm ml-auto">
                <Filter size={14} className="text-gray-400" />
                <span className="text-[10px] font-black text-gray-400 uppercase">A-Z Order</span>
            </div>
        </div>

        {/* Students List */}
        {isLoading ? (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm h-[400px] flex flex-col items-center justify-center gap-4 text-center p-12">
                <Loader2 className="animate-spin text-blue-500" size={40} />
                <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Accessing Athlete Database...</p>
            </div>
        ) : filteredStudents.length === 0 ? (
            <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm h-[400px] flex flex-col items-center justify-center gap-4 text-center p-12 opacity-50">
                <div className="bg-gray-50 p-8 rounded-full">
                    <Search size={48} className="text-gray-200" />
                </div>
                <h3 className="text-xl font-black text-[#1A1A2E]">No athletes found</h3>
                <p className="text-sm font-bold text-gray-400 max-w-xs">{searchQuery ? `No matches for "${searchQuery}"` : "Assign some classes to see your students here."}</p>
            </div>
        ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredStudents.map((student) => (
                    <div 
                        key={student._id}
                        className="group bg-white rounded-[32px] border border-gray-100 p-8 shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all hover:-translate-y-1"
                    >
                        <div className="flex justify-between items-start mb-6">
                            <div className="h-14 w-14 rounded-[20px] bg-gray-50 flex items-center justify-center text-xl font-black text-gray-300 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors">
                                {student.name.charAt(0).toUpperCase()}
                            </div>
                            <div className="flex flex-col items-end">
                                <span className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Attendances</span>
                                <span className="text-lg font-black text-[#1A1A2E]">{student.attendanceCount}</span>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <div>
                                <h3 className="text-xl font-black text-[#1A1A2E] group-hover:text-blue-600 transition-colors truncate">{student.name}</h3>
                                <p className="text-sm font-bold text-gray-400 flex items-center gap-2 mt-1">
                                    <Mail size={14} className="text-gray-300" />
                                    {student.email}
                                </p>
                            </div>

                            <div className="flex flex-col gap-2 p-4 bg-gray-50 rounded-2xl border border-gray-100 mt-6 group-hover:bg-white transition-colors">
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Last Seen</span>
                                    <span className="text-[10px] font-black text-blue-500 uppercase flex items-center gap-1">
                                        <Clock size={10} />
                                        {student.lastAttended ? new Date(student.lastAttended).toLocaleDateString() : 'N/A'}
                                    </span>
                                </div>
                                <div className="flex items-center justify-between">
                                    <span className="text-[10px] font-black text-gray-400 uppercase tracking-tighter">Athlete Status</span>
                                    <span className="text-[10px] font-black text-green-500 uppercase flex items-center gap-1">
                                        <CheckCircle2 size={10} />
                                        Active
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="mt-8 flex items-center justify-between">
                            <button className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:underline flex items-center gap-2">
                                Activity History <ChevronRight size={14} />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        )}
      </div>
    </InstructorLayout>
  );
}
