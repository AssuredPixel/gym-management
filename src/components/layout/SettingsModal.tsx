"use client";

import React, { useState, useEffect } from "react";
import { X, Save, Clock, MapPin, Phone, Building2, Loader2, Plus, Calendar } from "lucide-react";

interface BusinessHour {
  day: string;
  open: string;
  close: string;
  isClosed: boolean;
}

interface GymData {
  _id: string;
  name: string;
  ownerName: string;
  email: string;
  phone?: string;
  address?: string;
  businessHours?: BusinessHour[];
}

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function SettingsModal({ isOpen, onClose }: SettingsModalProps) {
  const [gymData, setGymData] = useState<GymData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState<'general' | 'hours'>('general');

  useEffect(() => {
    if (isOpen) {
      fetchGymSettings();
    }
  }, [isOpen]);

  const fetchGymSettings = async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/gym/settings");
      if (res.ok) {
        const data = await res.json();
        setGymData(data);
      }
    } catch (err) {
      console.error("Failed to fetch settings:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!gymData) return;
    try {
      setSaving(true);
      const res = await fetch("/api/gym/settings", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(gymData),
      });
      if (res.ok) {
        onClose();
        // Trigger a reload or toast notification
        window.location.reload(); 
      }
    } catch (err) {
      console.error("Failed to save settings:", err);
    } finally {
      setSaving(false);
    }
  };

  const updateHours = (index: number, field: keyof BusinessHour, value: string | boolean) => {
    if (!gymData?.businessHours) return;
    const newHours = [...gymData.businessHours];
    newHours[index] = { ...newHours[index], [field]: value };
    setGymData({ ...gymData, businessHours: newHours });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div>
            <h2 className="text-xl font-bold text-gray-900">Gym Settings</h2>
            <p className="text-sm text-gray-500 mt-1">Manage your box information and hours</p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex px-8 border-b border-gray-100 bg-white">
          <button 
            onClick={() => setActiveTab('general')}
            className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'general' 
                ? "border-primary text-primary" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            General Details
          </button>
          <button 
            onClick={() => setActiveTab('hours')}
            className={`px-6 py-4 text-sm font-semibold transition-all border-b-2 ${
              activeTab === 'hours' 
                ? "border-primary text-primary" 
                : "border-transparent text-gray-400 hover:text-gray-600"
            }`}
          >
            Opening Hours
          </button>
        </div>

        {/* Content */}
        <div className="px-8 py-8 h-[400px] overflow-y-auto">
          {loading ? (
            <div className="flex flex-col items-center justify-center h-full gap-3">
              <Loader2 size={32} className="animate-spin text-primary" />
              <p className="text-sm text-gray-500">Loading settings...</p>
            </div>
          ) : (
            <>
              {activeTab === 'general' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Gym Name</label>
                      <div className="relative">
                        <Building2 size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text"
                          value={gymData?.name || ""}
                          onChange={(e) => setGymData(prev => prev ? { ...prev, name: e.target.value } : null)}
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900"
                        />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Owner Name</label>
                      <input 
                        type="text"
                        value={gymData?.ownerName || ""}
                        onChange={(e) => setGymData(prev => prev ? { ...prev, ownerName: e.target.value } : null)}
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                      <input 
                        type="email"
                        value={gymData?.email || ""}
                        disabled
                        className="w-full px-4 py-2 bg-gray-100 border border-gray-200 rounded-lg text-sm text-gray-500 cursor-not-allowed"
                      />
                    </div>
                    <div className="space-y-2">
                      <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone Number</label>
                      <div className="relative">
                        <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                          type="text"
                          value={gymData?.phone || ""}
                          onChange={(e) => setGymData(prev => prev ? { ...prev, phone: e.target.value } : null)}
                          placeholder="+234 000 000 0000"
                          className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Address</label>
                    <div className="relative">
                      <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                      <textarea 
                        value={gymData?.address || ""}
                        onChange={(e) => setGymData(prev => prev ? { ...prev, address: e.target.value } : null)}
                        rows={3}
                        placeholder="Full street address, city, state"
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all outline-none text-gray-900"
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'hours' && (
                <div className="space-y-4">
                  {gymData?.businessHours?.map((hour, idx) => (
                    <div key={hour.day} className="flex items-center gap-4 p-4 border border-gray-100 rounded-xl bg-gray-50/50">
                      <div className="w-28">
                        <span className="text-sm font-bold text-gray-700">{hour.day}</span>
                      </div>
                      
                      <div className="flex-1 flex items-center gap-2">
                        <input 
                          type="time"
                          value={hour.open}
                          disabled={hour.isClosed}
                          onChange={(e) => updateHours(idx, 'open', e.target.value)}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:border-primary outline-none disabled:opacity-50"
                        />
                        <span className="text-gray-400">-</span>
                        <input 
                          type="time"
                          value={hour.close}
                          disabled={hour.isClosed}
                          onChange={(e) => updateHours(idx, 'close', e.target.value)}
                          className="px-3 py-1.5 bg-white border border-gray-200 rounded-md text-xs focus:border-primary outline-none disabled:opacity-50"
                        />
                      </div>

                      <div className="flex items-center gap-2">
                        <label className="inline-flex items-center cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={hour.isClosed}
                            onChange={(e) => updateHours(idx, 'isClosed', e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="relative w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-red-500"></div>
                          <span className="ms-2 text-xs font-semibold text-gray-500 peer-checked:text-red-500">Closed</span>
                        </label>
                      </div>
                    </div>
                  ))}
                  
                  {!gymData?.businessHours?.length && (
                    <div className="flex flex-col items-center justify-center p-8 border-2 border-dashed border-gray-200 rounded-2xl gap-3">
                      <Clock size={40} className="text-gray-300" />
                      <p className="text-sm text-gray-500">No hours set up yet.</p>
                      <button 
                        onClick={() => {
                          const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];
                          const defaultHours = days.map(day => ({ day, open: '06:00', close: '21:00', isClosed: false }));
                          setGymData(prev => prev ? { ...prev, businessHours: defaultHours } : null);
                        }}
                        className="px-4 py-2 bg-primary text-white rounded-lg text-xs font-bold hover:bg-primary/90 transition-all"
                      >
                        Set Default Hours
                      </button>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>

        {/* Footer */}
        <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
          <button 
            onClick={onClose}
            className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
          >
            Cancel
          </button>
          <button 
            onClick={handleSave}
            disabled={saving || loading}
            className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
          >
            {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
            <span>Save Changes</span>
          </button>
        </div>
      </div>
    </div>
  );
}
