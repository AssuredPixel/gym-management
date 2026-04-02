"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Toaster } from "react-hot-toast";
import MembersTable, { Member } from "@/components/members/MembersTable";
import MemberPagination from "@/components/members/MemberPagination";
import MemberModal from "@/components/members/MemberModal";
import { Search, Plus } from "lucide-react";

// Custom useDebounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export default function MembersPage() {
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [members, setMembers] = useState<Member[]>([]);
  const [counts, setCounts] = useState<{ all: number; active: number; expiring: number; expired: number }>({
    all: 0, active: 0, expiring: 0, expired: 0
  });
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);

  // Filters State
  const [searchQuery, setSearchQuery] = useState("");
  const debouncedSearch = useDebounce(searchQuery, 300);
  const [status, setStatus] = useState("all");
  const [page, setPage] = useState(1);
  const limit = 8;

  const fetchMembers = useCallback(async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/members?page=${page}&limit=${limit}&status=${status}&search=${debouncedSearch}`);
      if (!res.ok) throw new Error("Failed to fetch members");
      
      const data = await res.json();
      setMembers(data.members || []);
      setCounts(data.counts || { all: 0, active: 0, expiring: 0, expired: 0 });
      setTotal(data.total || 0);
      setTotalPages(data.totalPages || 1);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [page, limit, status, debouncedSearch]);

  useEffect(() => {
    fetchMembers();
  }, [fetchMembers]);

  // Reset page when filters change
  useEffect(() => {
    setPage(1);
  }, [status, debouncedSearch]);

  const tabs = [
    { id: "all", label: "All", count: counts.all },
    { id: "active", label: "Active", count: counts.active },
    { id: "expiring", label: "Expiring", count: counts.expiring },
    { id: "expired", label: "Expired", count: counts.expired },
  ];

  return (
    <div className="flex flex-col gap-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Members</h1>
          <p className="text-sm text-gray-500 mt-1">Manage your gym members and their subscriptions</p>
        </div>
        <button 
          className="flex items-center gap-2 bg-[#E8541A] text-white px-4 py-2 rounded-md font-medium text-sm hover:bg-[#E8541A]/90 transition shadow-sm"
          onClick={() => setIsAddModalOpen(true)}
        >
          <Plus size={18} />
          <span>Add Member</span>
        </button>
      </div>

      {/* Search and Filter Row */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
        
        {/* Search Input */}
        <div className="relative w-full sm:w-[300px]">
          <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-gray-400">
            <Search size={18} />
          </div>
          <input
            type="text"
            className="bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-lg focus:ring-[#E8541A] focus:border-[#E8541A] block w-full pl-10 p-2.5 outline-none transition"
            placeholder="Search members..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>

        {/* Filter Tabs */}
        <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0 scrollbar-hide">
          {tabs.map((tab) => {
            const isActive = status === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setStatus(tab.id)}
                className={`whitespace-nowrap px-4 py-1.5 rounded-full text-sm font-medium transition-colors ${
                  isActive 
                    ? "bg-[#E8541A] text-white" 
                    : "border border-[#E8541A] text-[#E8541A] hover:bg-[#E8541A]/5"
                }`}
              >
                {tab.label} ({tab.count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Table section */}
      <MembersTable members={members} isLoading={isLoading} onRefresh={fetchMembers} statusFilter={status} />

      {/* Pagination */}
      {!isLoading && members.length > 0 && (
        <MemberPagination
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      )}

      {/* Add Member Modal */}
      {isAddModalOpen && (
        <MemberModal 
          mode="add" 
          onClose={() => setIsAddModalOpen(false)} 
          onSave={fetchMembers} 
        />
      )}

      <Toaster position="bottom-right" />
    </div>
  );
}
