"use client";

import React from "react";
import { User, Mail, Phone, Trash2, Edit2, Shield, MoreVertical, Loader2 } from "lucide-react";

export interface Instructor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
  createdAt: string;
}

interface InstructorsTableProps {
  instructors: Instructor[];
  isLoading: boolean;
  onEdit: (instructor: Instructor) => void;
  onDelete: (id: string) => void;
}

export default function InstructorsTable({ instructors, isLoading, onEdit, onDelete }: InstructorsTableProps) {
  if (isLoading) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center gap-4">
        <Loader2 size={40} className="animate-spin text-primary" />
        <p className="text-gray-500 font-medium text-sm animate-pulse">Loading staff members...</p>
      </div>
    );
  }

  if (instructors.length === 0) {
    return (
      <div className="w-full bg-white rounded-xl border border-gray-100 shadow-sm p-12 flex flex-col items-center justify-center gap-4 text-center">
        <div className="h-16 w-16 bg-gray-50 rounded-full flex items-center justify-center">
          <User size={32} className="text-gray-300" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-gray-900">No instructors found</h3>
          <p className="text-gray-500 text-sm mt-1">Start by adding your first coach or staff member.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full overflow-hidden bg-white rounded-xl border border-gray-100 shadow-sm">
      <table className="w-full text-left border-collapse">
        <thead className="bg-gray-50/50">
          <tr>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Instructor</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Contact Info</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Status</th>
            <th className="px-6 py-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Joined</th>
            <th className="px-6 py-4 text-right"></th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-50">
          {instructors.map((instructor) => (
            <tr key={instructor._id} className="hover:bg-gray-50/50 transition-colors group">
              <td className="px-6 py-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {instructor.name.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-gray-900">{instructor.name}</p>
                    <div className="flex items-center gap-1 text-[10px] bg-blue-50 text-blue-600 px-1.5 py-0.5 rounded font-bold uppercase mt-1">
                      <Shield size={10} />
                      Instructor
                    </div>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Mail size={12} className="text-gray-400" />
                    <span>{instructor.email}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-500">
                    <Phone size={12} className="text-gray-400" />
                    <span>{instructor.phone || "No phone"}</span>
                  </div>
                </div>
              </td>
              <td className="px-6 py-4">
                <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                  instructor.isActive 
                    ? "bg-green-100 text-green-700" 
                    : "bg-gray-100 text-gray-600"
                }`}>
                  <div className={`h-1.5 w-1.5 rounded-full ${instructor.isActive ? 'bg-green-500' : 'bg-gray-400'}`} />
                  {instructor.isActive ? "Active" : "Inactive"}
                </div>
              </td>
              <td className="px-6 py-4 text-xs text-gray-400 font-medium">
                {new Date(instructor.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
              </td>
              <td className="px-6 py-4 text-right">
                <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button 
                    onClick={() => onEdit(instructor)}
                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 text-gray-400 hover:text-primary transition-all"
                  >
                    <Edit2 size={16} />
                  </button>
                  <button 
                    onClick={() => onDelete(instructor._id)}
                    className="p-2 hover:bg-white rounded-lg border border-transparent hover:border-gray-100 text-gray-400 hover:text-red-500 transition-all"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
