"use client";

import React, { useState, useEffect } from "react";
import { X, Search, DollarSign, Calendar, FileText, Loader2 } from "lucide-react";
import axios from "axios";
import { toast } from "react-hot-toast";

interface Member {
  _id: string;
  name: string;
}

interface RecordPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export default function RecordPaymentModal({ isOpen, onClose, onSuccess }: RecordPaymentModalProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [search, setSearch] = useState("");
  const [selectedMember, setSelectedMember] = useState<string>("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("Monthly Membership");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingMembers, setIsFetchingMembers] = useState(false);

  useEffect(() => {
    if (isOpen) {
      fetchMembers();
    }
  }, [isOpen]);

  const fetchMembers = async () => {
    setIsFetchingMembers(true);
    try {
      const res = await axios.get("/api/members?limit=100");
      setMembers(res.data.members || []);
    } catch (error) {
      console.error("Failed to fetch members:", error);
      toast.error("Failed to load members list");
    } finally {
      setIsFetchingMembers(false);
    }
  };

  const filteredMembers = members.filter(m => 
    m.name.toLowerCase().includes(search.toLowerCase())
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedMember || !amount) {
      toast.error("Please fill in all required fields");
      return;
    }

    setIsLoading(true);
    try {
      await axios.post("/api/payments/record-cash", {
        memberId: selectedMember,
        amount: parseFloat(amount) * 100, // Convert to cents
        description,
        date
      });
      toast.success("Cash payment recorded successfully");
      onSuccess();
      onClose();
    } catch (error) {
      console.error("Failed to record payment:", error);
      toast.error("Failed to record payment");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-2xl w-full max-w-[500px] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <h2 className="text-xl font-black text-gray-900">Record Cash Payment</h2>
          <button onClick={onClose} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Member Search */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Member *</label>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Search member name..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            
            <div className="mt-2 max-h-[150px] overflow-y-auto border border-gray-100 rounded-xl bg-gray-50/30">
              {isFetchingMembers ? (
                <div className="p-4 flex items-center justify-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                  <Loader2 size={14} className="animate-spin mr-2" />
                  Loading members...
                </div>
              ) : filteredMembers.length > 0 ? (
                filteredMembers.map((m) => (
                  <label
                    key={m._id}
                    className={`flex items-center px-4 py-3 cursor-pointer hover:bg-orange-50 transition-colors ${
                      selectedMember === m._id ? "bg-orange-50/50" : ""
                    }`}
                  >
                    <input
                      type="radio"
                      className="hidden"
                      name="member"
                      value={m._id}
                      onChange={() => setSelectedMember(m._id)}
                    />
                    <div className={`w-4 h-4 rounded-full border-2 mr-3 flex items-center justify-center ${
                      selectedMember === m._id ? "border-primary bg-primary" : "border-gray-300"
                    }`}>
                      {selectedMember === m._id && <div className="w-1.5 h-1.5 bg-white rounded-full" />}
                    </div>
                    <span className="text-sm font-bold text-gray-700">{m.name}</span>
                  </label>
                ))
              ) : (
                <div className="p-4 text-center text-xs text-gray-400 font-bold uppercase tracking-widest">
                  No members found
                </div>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {/* Amount */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Amount ($) *</label>
              <div className="relative">
                <DollarSign size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="number"
                  step="0.01"
                  required
                  placeholder="0.00"
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                />
              </div>
            </div>

            {/* Date */}
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Date *</label>
              <div className="relative">
                <Calendar size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input
                  type="date"
                  required
                  className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700 uppercase tracking-wider">Description</label>
            <div className="relative">
              <FileText size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Brief description..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-primary focus:border-primary transition-all outline-none"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className="w-full bg-primary text-white font-black uppercase tracking-widest py-4 rounded-xl shadow-lg shadow-primary/20 hover:shadow-primary/40 active:scale-95 transition-all flex items-center justify-center gap-2"
          >
            {isLoading ? <Loader2 size={24} className="animate-spin" /> : "Record Payment"}
          </button>
        </form>
      </div>
    </div>
  );
}
