import React from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MemberPaginationProps {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

export default function MemberPagination({
  total,
  page,
  limit,
  totalPages,
  onPageChange,
}: MemberPaginationProps) {
  if (total === 0) return null;

  const start = (page - 1) * limit + 1;
  const end = Math.min(page * limit, total);
  
  // Calculate which page numbers to show
  // For simplicity, showing a few around the current page
  const getPageNumbers = () => {
    const pages = [];
    let startPage = Math.max(1, page - 2);
    let endPage = Math.min(totalPages, page + 2);
    
    if (page <= 3) {
      endPage = Math.min(totalPages, 5);
    }
    
    if (page >= totalPages - 2) {
      startPage = Math.max(1, totalPages - 4);
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    return pages;
  };

  const pages = getPageNumbers();

  return (
    <div className="flex items-center justify-between py-4">
      <div className="text-sm text-gray-500">
        Showing <span className="font-medium text-gray-900">{start}</span>–
        <span className="font-medium text-gray-900">{end}</span> of{" "}
        <span className="font-medium text-gray-900">{total}</span> members
      </div>

      <div className="flex items-center gap-1">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="p-1 rounded text-gray-400 hover:text-[#E8541A] disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
        >
          <ChevronLeft size={20} />
        </button>
        
        <div className="flex gap-1">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`w-8 h-8 flex items-center justify-center rounded text-sm font-medium transition-colors ${
                p === page
                  ? "bg-[#E8541A] text-white"
                  : "text-gray-600 hover:bg-[#E8541A]/10 hover:text-[#E8541A]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages}
          className="p-1 rounded text-gray-400 hover:text-[#E8541A] disabled:opacity-50 disabled:hover:text-gray-400 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
    </div>
  );
}
