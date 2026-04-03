"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { X, User, Trash2, Loader2, Calendar } from "lucide-react";
import toast from "react-hot-toast";

interface Booking {
  _id: string;
  userId: {
    _id: string;
    name: string;
    email: string;
  };
  status: "booked" | "cancelled" | "attended" | "no-show";
  createdAt: string;
}

interface BookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  wodClass: any;
  onRefresh: () => void;
}

export default function BookingsDrawer({ isOpen, onClose, wodClass, onRefresh }: BookingsDrawerProps) {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBookings = useCallback(async () => {
    if (!wodClass?._id) return;
    setIsLoading(true);
    try {
      const res = await axios.get(`/api/classes/${wodClass._id}/bookings`);
      setBookings(res.data);
    } catch (error) {
      console.error("Failed to fetch bookings:", error);
      toast.error("Failed to load participants");
    } finally {
      setIsLoading(false);
    }
  }, [wodClass?._id]);

  useEffect(() => {
    if (isOpen) {
      fetchBookings();
    }
  }, [isOpen, fetchBookings]);

  const handleCancelBooking = async (bookingId: string) => {
    if (!confirm("Are you sure you want to cancel this member's booking? This will free up a spot.")) return;
    try {
      await axios.put(`/api/bookings/${bookingId}`, { status: "cancelled" });
      toast.success("Booking cancelled");
      fetchBookings();
      onRefresh();
    } catch (error) {
      toast.error("Failed to cancel booking");
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
    const diffInHours = Math.floor(diffInMinutes / 60);
    if (diffInHours < 24) return `${diffInHours}h ago`;
    return date.toLocaleDateString();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] overflow-hidden">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/40 backdrop-blur-sm animate-in fade-in duration-300"
        onClick={onClose}
      />
      
      {/* Drawer */}
      <div className="absolute top-0 right-0 h-full w-full max-w-[380px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-start mb-6">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors text-gray-400">
              <X size={20} />
            </button>
            <div className="bg-[#E8541A] px-3 py-1 rounded-full">
              <span className="text-[10px] font-black text-white uppercase tracking-widest">
                Admin View
              </span>
            </div>
          </div>
          
          <h3 className="text-xl font-black text-[#1A1A2E] tracking-tight">
            {wodClass?.title || "Class Bookings"}
          </h3>
          <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-2">
            <Calendar size={12} className="text-[#E8541A]" />
            {wodClass ? new Date(wodClass.dateTime).toLocaleString('en-US', { 
              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            }) : ""}
          </p>
          
          <div className="mt-6 flex items-center justify-between bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <div className="flex flex-col">
              <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Attendance</span>
              <span className="text-lg font-black text-[#1A1A2E]">
                {wodClass?.bookedCount} / {wodClass?.capacity}
              </span>
            </div>
            <div className="h-2 w-24 bg-gray-100 rounded-full overflow-hidden">
              <div 
                className="h-full bg-[#E8541A]" 
                style={{ width: `${(wodClass?.bookedCount / wodClass?.capacity) * 100}%` }}
              />
            </div>
          </div>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 opacity-50">
              <Loader2 className="animate-spin text-[#E8541A]" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Participants...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="bg-gray-50 p-6 rounded-full border border-dashed border-gray-200 mb-4">
                <User size={32} className="text-gray-300" />
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-3">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">
                Class Participants
              </h4>
              {bookings.map((booking) => (
                <div 
                  key={booking._id}
                  className={`group flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                    booking.status === 'cancelled' 
                      ? 'bg-red-50/50 border-red-100 opacity-60' 
                      : 'bg-white border-gray-100 hover:border-[#E8541A]/30 hover:shadow-lg hover:shadow-[#E8541A]/5'
                  }`}
                >
                  <div className={`h-10 w-10 flex items-center justify-center rounded-xl font-black text-sm uppercase ${
                    booking.status === 'cancelled' ? 'bg-red-100 text-red-400' : 'bg-gray-100 text-gray-400 group-hover:bg-[#E8541A]/10 group-hover:text-[#E8541A]'
                  }`}>
                    {booking.userId?.name?.charAt(0) || "U"}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-black text-[#1A1A2E] truncate">{booking.userId?.name || "Member"}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-[10px] font-bold text-gray-400">
                        {getTimeAgo(booking.createdAt)}
                      </span>
                      <span className={`px-1.5 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                        booking.status === 'booked' ? 'bg-blue-50 text-blue-500' :
                        booking.status === 'cancelled' ? 'bg-red-100 text-red-500' :
                        'bg-green-50 text-green-500'
                      }`}>
                        {booking.status}
                      </span>
                    </div>
                  </div>

                  {booking.status === 'booked' && (
                    <button 
                      onClick={() => handleCancelBooking(booking._id)}
                      className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
