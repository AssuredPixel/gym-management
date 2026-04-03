"use client";

import React from "react";
import { CreditCard, Banknote, Download, User as UserIcon, Loader2, ChevronLeft, ChevronRight } from "lucide-react";

interface Payment {
  _id: string;
  userId: { _id: string; name: string };
  amount: number;
  method: string;
  status: string;
  description: string;
  invoiceNumber: string;
  createdAt: string;
}

interface PaymentsTableProps {
  payments: Payment[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading: boolean;
}

const StatusBadge = ({ status }: { status: string }) => {
  const styles = {
    paid: "bg-green-50 text-green-600 border-green-100",
    pending: "bg-amber-50 text-amber-600 border-amber-100",
    failed: "bg-red-50 text-red-600 border-red-100",
  };
  const current = (styles as any)[status] || styles.pending;

  return (
    <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border ${current}`}>
      {status}
    </span>
  );
};

const MethodIcon = ({ method }: { method: string }) => {
  if (method === "cash") return <Banknote size={16} className="text-gray-400" />;
  return <CreditCard size={16} className="text-gray-400" />;
};

export default function PaymentsTable({ payments, page, totalPages, onPageChange, isLoading }: PaymentsTableProps) {
  return (
    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden flex flex-col">
      {/* Table Header */}
      <div className="px-8 py-6 border-b border-gray-100 flex justify-between items-center">
        <div>
          <h3 className="text-xl font-black text-gray-900">Recent Payments</h3>
          <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Transaction History</p>
        </div>
        <button className="text-sm font-bold text-primary hover:underline">View All</button>
      </div>

      <div className="overflow-x-auto min-h-[400px]">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center p-20 gap-4">
            <Loader2 className="animate-spin text-primary" size={32} />
            <p className="text-xs font-black text-gray-400 uppercase tracking-widest">Loading transactions...</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/50">
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Member</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Method</th>
                <th className="px-4 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                <th className="px-8 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest text-right">Receipt</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {payments.map((p) => (
                <tr key={p._id} className="hover:bg-gray-50/30 transition-colors group">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center text-gray-400">
                        <UserIcon size={14} />
                      </div>
                      <span className="text-sm font-bold text-gray-700">{p.userId?.name || 'Unknown'}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4 text-sm font-medium text-gray-500">
                    {new Date(p.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                  </td>
                  <td className="px-4 py-4">
                    <span className="text-sm font-black text-gray-900">${(p.amount / 100).toFixed(2)}</span>
                  </td>
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-2">
                      <MethodIcon method={p.method} />
                      <span className="text-xs font-bold text-gray-500 capitalize">{p.method}</span>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <StatusBadge status={p.status} />
                  </td>
                  <td className="px-8 py-4 text-right">
                    <a 
                      href={`/api/payments/${p._id}/receipt`}
                      className="inline-flex items-center gap-1.5 text-xs font-black text-primary hover:text-orange-600 transition-colors uppercase tracking-widest"
                      download
                    >
                      <Download size={14} />
                      PDF
                    </a>
                  </td>
                </tr>
              ))}
              {payments.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-8 py-20 text-center text-xs font-black text-gray-300 uppercase tracking-[0.2em] italic">
                    No transactions found
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Pagination */}
      <div className="px-8 py-4 border-t border-gray-100 flex items-center justify-between bg-gray-50/30">
        <p className="text-xs font-bold text-gray-500">
          Page {page} of {totalPages}
        </p>
        <div className="flex gap-2">
          <button 
            disabled={page === 1 || isLoading}
            onClick={() => onPageChange(page - 1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
          >
            <ChevronLeft size={16} className="text-gray-600" />
          </button>
          <button 
            disabled={page === totalPages || isLoading}
            onClick={() => onPageChange(page + 1)}
            className="p-2 rounded-lg border border-gray-200 hover:bg-white disabled:opacity-30 disabled:cursor-not-allowed transition-all active:scale-90"
          >
            <ChevronRight size={16} className="text-gray-600" />
          </button>
        </div>
      </div>
    </div>
  );
}
