"use client";

import React, { useState, useEffect } from "react";
import { X, Bell, Check, Trash2, Info, AlertTriangle, AlertCircle, CheckCircle2, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import toast from "react-hot-toast";

interface Notification {
  _id: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'alert' | 'success';
  isRead: boolean;
  link?: string;
  createdAt: string;
}

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen) {
      fetchNotifications();
    }
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data);
      }
    } catch (err) {
      console.error("Failed to fetch notifications:", err);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications(prev => 
          prev.map(n => n._id === id ? { ...n, isRead: true } : n)
        );
      }
    } catch (err) {
      console.error("Failed to mark as read:", err);
    }
  };

  const markAllRead = async () => {
    try {
      const res = await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ readAll: true }),
      });
      if (res.ok) {
        setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
        toast.success("All notifications marked as read");
      }
    } catch (err) {
      console.error("Failed to mark all as read:", err);
    }
  };

  const deleteNotification = async (id: string) => {
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (res.ok) {
        setNotifications(prev => prev.filter(n => n._id !== id));
        toast.success("Notification deleted");
      }
    } catch (err) {
      console.error("Failed to delete notification:", err);
    }
  };

  const clearAll = async () => {
    if (!confirm("Are you sure you want to clear all notifications?")) return;
    try {
      const res = await fetch("/api/notifications", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ clearAll: true }),
      });
      if (res.ok) {
        setNotifications([]);
        toast.success("All notifications cleared");
      }
    } catch (err) {
      console.error("Failed to clear all:", err);
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'success': return <CheckCircle2 className="text-green-500" size={18} />;
      case 'warning': return <AlertTriangle className="text-yellow-500" size={18} />;
      case 'alert': return <AlertCircle className="text-red-500" size={18} />;
      default: return <Info className="text-blue-500" size={18} />;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg">
              <Bell size={20} />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900">Notifications</h2>
              <p className="text-xs text-gray-500 mt-0.5">Stay updated with your gym's activity</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Action Bar */}
        {notifications.length > 0 && (
          <div className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-50">
            <button 
              onClick={markAllRead}
              className="text-xs font-bold text-primary hover:text-primary/80 transition-colors flex items-center gap-1.5"
            >
              <Check size={14} /> Mark all as read
            </button>
            <button 
              onClick={clearAll}
              className="text-xs font-bold text-red-500 hover:text-red-600 transition-colors flex items-center gap-1.5"
            >
              <Trash2 size={14} /> Clear all
            </button>
          </div>
        )}

        {/* Content */}
        <div className="h-[450px] overflow-y-auto px-2 py-4">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-gray-500 font-medium">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full gap-4 px-12 text-center">
              <div className="h-16 w-16 bg-gray-100 rounded-full flex items-center justify-center">
                <Bell size={32} className="text-gray-300" />
              </div>
              <div className="space-y-1">
                <p className="text-base font-bold text-gray-900">All caught up!</p>
                <p className="text-sm text-gray-400 leading-relaxed">No new notifications at the moment. We'll let you know when something important happens.</p>
              </div>
            </div>
          ) : (
            <div className="space-y-2">
              {notifications.map((n) => (
                <div 
                  key={n._id}
                  className={`relative group mx-4 p-4 rounded-xl border transition-all ${
                    n.isRead 
                      ? "bg-white border-gray-100" 
                      : "bg-primary/[0.03] border-primary/10 shadow-sm"
                  }`}
                >
                  {!n.isRead && (
                    <div className="absolute top-4 right-4 h-2 w-2 bg-primary rounded-full shadow-[0_0_8px_rgba(239,68,68,0.4)]" />
                  )}
                  
                  <div className="flex gap-4">
                    <div className={`shrink-0 w-10 h-10 rounded-full flex items-center justify-center ${
                      n.type === 'success' ? 'bg-green-50' : 
                      n.type === 'warning' ? 'bg-yellow-50' : 
                      n.type === 'alert' ? 'bg-red-50' : 'bg-blue-50'
                    }`}>
                      {getIcon(n.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 pr-6">
                      <div className="flex items-center justify-between gap-2 mb-1">
                        <h4 className={`text-sm font-bold truncate ${n.isRead ? 'text-gray-700' : 'text-gray-900'}`}>{n.title}</h4>
                        <span className="shrink-0 text-[10px] font-medium text-gray-400">
                          {new Date(n.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                        </span>
                      </div>
                      <p className={`text-xs leading-relaxed line-clamp-2 ${n.isRead ? 'text-gray-400' : 'text-gray-500'}`}>
                        {n.message}
                      </p>
                      
                      <div className="mt-3 flex items-center gap-4 opacity-0 group-hover:opacity-100 transition-opacity">
                        {!n.isRead && (
                          <button 
                            onClick={() => markAsRead(n._id)}
                            className="text-[11px] font-bold text-primary hover:underline underline-offset-4"
                          >
                            Mark as read
                          </button>
                        )}
                        <button 
                          onClick={() => deleteNotification(n._id)}
                          className="text-[11px] font-bold text-red-400 hover:text-red-500 hover:underline underline-offset-4"
                        >
                          Delete
                        </button>
                        {n.link && (
                          <Link 
                            href={n.link}
                            onClick={onClose}
                            className="text-[11px] font-bold text-gray-600 hover:text-black flex items-center gap-1 ml-auto"
                          >
                            View details <ArrowRight size={12} />
                          </Link>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-5 border-t border-gray-100 bg-gray-50/50 flex justify-center">
          <p className="text-[11px] text-gray-400 font-medium">Viewing your last 50 notifications</p>
        </div>
      </div>
    </div>
  );
}
