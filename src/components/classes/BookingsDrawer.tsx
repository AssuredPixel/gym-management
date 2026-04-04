"use client";

import React, { useState, useEffect, useCallback } from "react";
import axios from "axios";
import { X, User, Trash2, Loader2, Calendar, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import toast from "react-hot-toast";
import { useSession } from "next-auth/react";

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
  const { data: session } = useSession();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const userRole = (session?.user as any)?.role;

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

  const updateStatus = async (bookingId: string, status: string) => {
    try {
      toast.loading(`Updating status...`, { id: 'booking-status' });
      await axios.put(`/api/bookings/${bookingId}`, { status });
      setBookings(prev => prev.map(b => b._id === bookingId ? { ...b, status: status as any } : b));
      toast.success(`Status updated to ${status}`, { id: 'booking-status' });
      onRefresh();
    } catch (error) {
      toast.error("Failed to update status", { id: 'booking-status' });
    }
  };

  const handleUnavailableRequest = async () => {
    const reason = prompt("Please provide a reason for your unavailability (e.g., Illness, Emergency):");
    if (!reason || !reason.trim()) return;

    try {
      toast.loading("Notifying owner...", { id: 'unavailable' });
      await axios.post("/api/instructor/unavailable", { 
        classId: wodClass._id, 
        reason: reason.trim() 
      });
      toast.success("Owner has been notified and an alert was sent", { id: 'unavailable' });
      onClose();
    } catch (error) {
      toast.error("Failed to send notification", { id: 'unavailable' });
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diffInMinutes = Math.floor((now.getTime() - date.getTime()) / 60000);
    if (diffInMinutes < 1) return "Just now";
    if (diffInMinutes < 60) return `${diffInMinutes}m ago`;
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
      <div className="absolute top-0 right-0 h-full w-full max-w-[420px] bg-white shadow-2xl flex flex-col animate-in slide-in-from-right duration-300 border-l border-gray-100">
        {/* Header */}
        <div className="p-8 border-b border-gray-100 bg-gray-50/50">
          <div className="flex justify-between items-start mb-6">
            <button onClick={onClose} className="p-2 -ml-2 hover:bg-white rounded-full transition-colors text-gray-400">
              <X size={20} />
            </button>
            <div className="bg-primary/10 px-3 py-1 rounded-full border border-primary/20">
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">
                {userRole === 'instructor' ? 'Coach View' : 'Admin View'}
              </span>
            </div>
          </div>
          
          <h3 className="text-xl font-black text-[#1A1A2E] tracking-tight truncate">
            {wodClass?.title || "Class Bookings"}
          </h3>
          <p className="text-xs font-bold text-gray-400 mt-1 flex items-center gap-2">
            <Calendar size={12} className="text-primary" />
            {wodClass ? new Date(wodClass.dateTime).toLocaleString('en-US', { 
              weekday: 'short', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' 
            }) : ""}
          </p>
        </div>

        {/* List Content */}
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar bg-gray-50/30">
          {isLoading ? (
            <div className="h-full flex flex-col items-center justify-center gap-3 opacity-50">
              <Loader2 className="animate-spin text-primary" />
              <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Loading Participants...</p>
            </div>
          ) : bookings.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center opacity-40">
              <div className="bg-white p-6 rounded-3xl border border-dashed border-gray-200 mb-4 shadow-sm">
                <User size={32} className="text-gray-300" />
              </div>
              <p className="text-sm font-black text-gray-400 uppercase tracking-widest">No bookings yet</p>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-2 mb-4">
                Class Participants
              </h4>
              {bookings.map((booking) => (
                <div 
                  key={booking._id}
                  className={`group flex flex-col gap-4 p-4 rounded-2xl border transition-all ${
                    booking.status === 'cancelled' 
                      ? 'bg-red-50/30 border-red-100 opacity-60' 
                      : 'bg-white border-gray-100 shadow-sm hover:border-primary/30'
                  }`}
                >
                  <div className="flex items-center gap-4">
                    <div className="h-10 w-10 flex items-center justify-center rounded-xl font-black text-sm uppercase bg-gray-100 text-gray-400 group-hover:bg-primary/10 group-hover:text-primary transition-colors">
                      {booking.userId?.name?.charAt(0) || "U"}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-black text-[#1A1A2E] truncate">{booking.userId?.name || "Member"}</p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-widest ${
                          booking.status === 'booked' ? 'bg-blue-50 text-blue-500' :
                          booking.status === 'attended' ? 'bg-green-50 text-green-500' :
                          booking.status === 'no-show' ? 'bg-gray-100 text-gray-400' :
                          'bg-red-100 text-red-500'
                        }`}>
                          {booking.status}
                        </span>
                        <span className="text-[10px] font-bold text-gray-400">
                          {getTimeAgo(booking.createdAt)}
                        </span>
                      </div>
                    </div>

                    {booking.status === 'booked' && (
                      <button 
                        onClick={() => updateStatus(booking._id, "cancelled")}
                        className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-xl transition-all"
                        title="Cancel Booking"
                      >
                        <Trash2 size={16} />
                      </button>
                    )}
                  </div>

                  {/* Attendance Controls */}
                  {booking.status !== 'cancelled' && (
                    <div className="flex gap-2 pt-1 border-t border-gray-50 mt-1">
                      <button 
                        disabled={booking.status === 'attended'}
                        onClick={() => updateStatus(booking._id, 'attended')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          booking.status === 'attended' 
                            ? "bg-green-500 text-white shadow-lg shadow-green-500/20" 
                            : "bg-gray-50 text-gray-400 hover:bg-green-50 hover:text-green-600"
                        }`}
                      >
                        <CheckCircle size={14} /> Attended
                      </button>
                      <button 
                        disabled={booking.status === 'no-show'}
                        onClick={() => updateStatus(booking._id, 'no-show')}
                        className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${
                          booking.status === 'no-show' 
                            ? "bg-gray-400 text-white" 
                            : "bg-gray-50 text-gray-400 hover:bg-gray-100 hover:text-gray-600"
                        }`}
                      >
                        <XCircle size={14} /> No-Show
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer Actions */}
        {userRole === 'instructor' && (
          <div className="p-6 border-t border-gray-100 bg-white">
            <button 
              onClick={handleUnavailableRequest}
              className="w-full flex items-center justify-center gap-2 py-4 px-6 border-2 border-red-100 bg-red-50 text-red-500 text-xs font-black uppercase tracking-widest rounded-2xl hover:bg-red-100 transition-all active:scale-95 group"
            >
              <AlertTriangle size={16} className="group-hover:animate-bounce" />
              Notify Owner: I'm Unavailable
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
