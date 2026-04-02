import React, { useState, useEffect, useRef } from "react";
import { Eye, Pencil, MoreHorizontal, UserMinus, UserCheck } from "lucide-react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import MemberModal from "./MemberModal";

export interface Member {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive?: boolean;
  plan: string;
  status: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface MembersTableProps {
  members: Member[];
  isLoading: boolean;
  onRefresh: () => void;
  statusFilter: string;
}

// Helper to calculate a deterministic background color based on name
const getAvatarColor = (name: string) => {
  const colors = [
    "bg-red-500", "bg-orange-500", "bg-amber-500", "bg-green-500", 
    "bg-emerald-500", "bg-teal-500", "bg-cyan-500", "bg-blue-500", 
    "bg-indigo-500", "bg-violet-500", "bg-purple-500", "bg-fuchsia-500", 
    "bg-pink-500", "bg-rose-500"
  ];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
};

const getTimeAgo = (dateStr: string) => {
  const date = new Date(dateStr);
  const now = new Date();
  const diffTime = Math.abs(now.getTime() - date.getTime());
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays < 30) return `${diffDays} days ago`;
  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) return `${diffMonths} months ago`;
  return `${Math.floor(diffMonths / 12)} years ago`;
};

export default function MembersTable({ members, isLoading, onRefresh, statusFilter }: MembersTableProps) {
  const router = useRouter();
  const [selectedForEdit, setSelectedForEdit] = useState<Member | null>(null);
  const [dropdownOpenId, setDropdownOpenId] = useState<string | null>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpenId(null);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleDeactivate = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}/deactivate`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to deactivate");
      toast.success("Member deactivated");
      onRefresh();
    } catch (err) {
      toast.error("Failed to deactivate member");
    } finally {
      setDropdownOpenId(null);
    }
  };

  const handleActivate = async (id: string) => {
    try {
      const res = await fetch(`/api/members/${id}/activate`, { method: "PUT" });
      if (!res.ok) throw new Error("Failed to reactivate");
      toast.success("Member reactivated — membership extended 30 days");
      onRefresh();
    } catch (err) {
      toast.error("Failed to reactivate member");
    } finally {
      setDropdownOpenId(null);
    }
  };

  if (isLoading) {
    return (
      <div className="bg-white rounded-lg shadow min-h-[400px] flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (members.length === 0) {
    const emptyMessages: Record<string, string> = {
      all: "No members yet. Add your first member.",
      active: "No active members yet.",
      expiring: "No expiring memberships yet.",
      expired: "No expired memberships yet.",
    };
    const message = emptyMessages[statusFilter] ?? "No members found.";
    const showAddButton = statusFilter === "all";

    return (
      <div className="bg-white rounded-lg shadow min-h-[400px] flex flex-col items-center justify-center p-8">
        <div className="bg-primary/10 h-20 w-20 rounded-full flex items-center justify-center mb-4">
          <svg className="w-10 h-10 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </div>
        <p className="text-gray-500 text-sm text-center">{message}</p>
        {showAddButton && (
          <button className="mt-6 bg-[#E8541A] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#E8541A]/90 transition">
            Add your first member
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-lg shadow overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-[#F5F5F5] border-b border-[#E5E7EB]">
              <th className="px-6 py-3 text-xs font-semibold text-[#666666] uppercase tracking-wide">Member</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#666666] uppercase tracking-wide">Email</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#666666] uppercase tracking-wide">Plan</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#666666] uppercase tracking-wide">Status</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#666666] uppercase tracking-wide">Joined</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#666666] uppercase tracking-wide">Expires</th>
              <th className="px-6 py-3 text-xs font-semibold text-[#666666] uppercase tracking-wide text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {members.map((member, index) => {
              const isExpired = new Date(member.endDate) < new Date();
              
              return (
                <tr 
                  key={member._id} 
                  className={`h-[56px] border-b border-[#E5E7EB] hover:bg-gray-50 transition-colors ${
                    index % 2 !== 0 ? "bg-[#F9F9F9]" : "bg-white"
                  }`}
                >
                  <td className="px-6 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-3">
                      <div className={`h-8 w-8 rounded-full flex items-center justify-center text-white text-xs font-bold ${getAvatarColor(member.name)}`}>
                        {getInitials(member.name)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[#1A1A2E] font-bold text-sm tracking-tight">{member.name}</span>
                        <span className="text-xs text-[#666666]">joined {getTimeAgo(member.createdAt)}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-[#666666]">
                    {member.email}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      member.plan === "monthly" ? "bg-blue-100 text-blue-700" :
                      member.plan === "quarterly" ? "bg-purple-100 text-purple-700" :
                      "bg-teal-100 text-teal-700"
                    }`}>
                      {member.plan}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap">
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      member.status === "active" ? "bg-green-100 text-[#1A7A4A]" :
                      member.status === "expiring" ? "bg-amber-100 text-amber-700" :
                      "bg-red-100 text-red-700"
                    }`}>
                      {member.status}
                    </span>
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-sm text-[#666666]">
                    {new Date(member.createdAt).toLocaleDateString()}
                  </td>
                  <td className={`px-6 py-3 whitespace-nowrap text-sm ${isExpired ? "text-red-600 font-medium" : "text-[#666666]"}`}>
                    {new Date(member.endDate).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-3 whitespace-nowrap text-right">
                    <div className="flex items-center justify-end gap-2 text-gray-400">
                      <button 
                        onClick={() => router.push(`/owner/dashboard/members/${member._id}`)}
                        className="hover:text-primary transition-colors p-1" 
                        title="View details"
                      >
                        <Eye size={18} />
                      </button>
                      <button 
                        onClick={() => setSelectedForEdit(member)}
                        className="hover:text-blue-500 transition-colors p-1" 
                        title="Edit member"
                      >
                        <Pencil size={18} />
                      </button>
                      
                      <div className="relative">
                        <button 
                          onClick={(e) => {
                            e.stopPropagation();
                            setDropdownOpenId(dropdownOpenId === member._id ? null : member._id);
                          }}
                          className="hover:text-gray-700 transition-colors p-1" 
                          title="More options"
                        >
                          <MoreHorizontal size={18} />
                        </button>
                        
                        {dropdownOpenId === member._id && (
                          <div 
                            ref={dropdownRef} 
                            className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10 border border-gray-100"
                          >
                            {member.status === "expired" || !member.isActive ? (
                              <button
                                onClick={() => handleActivate(member._id)}
                                className="w-full text-left px-4 py-2 text-sm text-green-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <UserCheck size={16} />
                                Reactivate
                              </button>
                            ) : (
                              <button
                                onClick={() => handleDeactivate(member._id)}
                                className="w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-50 flex items-center gap-2"
                              >
                                <UserMinus size={16} />
                                Deactivate
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Render Modals securely within the same tree */}
      {selectedForEdit && (
        <MemberModal 
          mode="edit" 
          member={selectedForEdit} 
          onClose={() => setSelectedForEdit(null)} 
          onSave={onRefresh} 
        />
      )}
      
    </div>
  );
}
