"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { Plus, History, TrendingUp, Filter, Search } from "lucide-react";
import OwnerLayout from "@/components/layout/OwnerLayout";
import KPICards from "@/components/payments/KPICards";
import RevenueChart from "@/components/payments/RevenueChart";
import PaymentsTable from "@/components/payments/PaymentsTable";
import RecordPaymentModal from "@/components/payments/RecordPaymentModal";

export default function PaymentsDashboardPage() {
  const [stats, setStats] = useState<any>(null);
  const [payments, setPayments] = useState<any[]>([]);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isStatsLoading, setIsStatsLoading] = useState(true);
  const [isPaymentsLoading, setIsPaymentsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const handler = setTimeout(() => {
      fetchPayments(page, searchQuery, statusFilter);
    }, 300); // 300ms debounce

    return () => clearTimeout(handler);
  }, [page, searchQuery, statusFilter]);

  const fetchStats = async () => {
    setIsStatsLoading(true);
    try {
      const res = await axios.get("/api/payments/stats");
      setStats(res.data);
    } catch (error) {
      console.error("Failed to fetch payment stats:", error);
    } finally {
      setIsStatsLoading(false);
    }
  };

  const fetchPayments = async (p: number, search = "", status = "all") => {
    setIsPaymentsLoading(true);
    try {
      const res = await axios.get(`/api/payments?page=${p}&limit=10&search=${search}&status=${status}`);
      setPayments(res.data.payments);
      setTotalPages(res.data.totalPages);
    } catch (error) {
      console.error("Failed to fetch payments:", error);
    } finally {
      setIsPaymentsLoading(false);
    }
  };

  const handleRefresh = () => {
    fetchStats();
    fetchPayments(1, searchQuery, statusFilter);
    setPage(1);
  };

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Header */}
      <div className="flex justify-between items-center bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
        <div className="flex items-center gap-4">
          <div className="bg-orange-500 p-4 rounded-2xl text-white shadow-lg shadow-orange-500/20">
            <Plus size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-black text-gray-900 tracking-tight">Payments</h1>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manage box revenue & transations</p>
          </div>
        </div>
        <button 
          onClick={() => setIsModalOpen(true)}
          className="bg-primary text-white font-black uppercase tracking-widest px-8 py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all flex items-center gap-2"
        >
          <Plus size={20} />
          Record Payment
        </button>
      </div>

      {/* KPI Cards */}
      {stats && <KPICards stats={stats} />}

      {/* Revenue Chart Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          {stats && <RevenueChart data={stats.revenueByMonth} />}
        </div>
        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between">
          <div>
              <h3 className="text-xl font-black text-gray-900">Payment Status</h3>
              <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Quick insights</p>
              <div className="mt-8 space-y-6">
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-green-500" />
                          <span className="text-sm font-bold text-gray-500">Successful</span>
                      </div>
                      <span className="text-sm font-black text-gray-900">92%</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-amber-500" />
                          <span className="text-sm font-bold text-gray-500">Pending</span>
                      </div>
                      <span className="text-sm font-black text-gray-900">5%</span>
                  </div>
                  <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-red-500" />
                          <span className="text-sm font-bold text-gray-500">Failed</span>
                      </div>
                      <span className="text-sm font-black text-gray-900">3%</span>
                  </div>
              </div>
          </div>
          <div className="pt-8 border-t border-gray-50 text-center">
              <p className="text-[10px] font-black text-gray-300 uppercase tracking-widest">Powered by Stripe & Paystack</p>
          </div>
        </div>
      </div>

      {/* Payments Table */}
      <div className="space-y-4">
          <div className="flex justify-between items-center">
             <div className="flex items-center gap-2">
                 <History className="text-gray-400" size={20} />
                 <h3 className="text-lg font-black text-gray-900">Recent Transactions</h3>
             </div>
             <div className="flex items-center gap-4">
                  <div className="relative">
                      <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="text" 
                        placeholder="Search by name or invoice..." 
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-lg focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none min-w-[240px]"
                      />
                  </div>
                  <div className="flex items-center gap-2">
                    <Filter size={14} className="text-gray-400" />
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-gray-500 outline-none focus:ring-2 focus:ring-primary focus:border-primary transition-all cursor-pointer"
                    >
                      <option value="all">All Status</option>
                      <option value="paid">Paid</option>
                      <option value="pending">Pending</option>
                      <option value="failed">Failed</option>
                    </select>
                  </div>
             </div>
          </div>
          <PaymentsTable 
            payments={payments} 
            page={page} 
            totalPages={totalPages} 
            onPageChange={setPage}
            isLoading={isPaymentsLoading}
          />
      </div>

      {/* Record Payment Modal */}
      <RecordPaymentModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSuccess={handleRefresh}
      />
    </div>
  );
}
