"use client";

import React, { useState } from "react";
import { useSession } from "next-auth/react";
import OwnerLayout from "@/components/layout/OwnerLayout";
import { 
  Building2, 
  User, 
  Bell, 
  AlertOctagon,
  Save,
  Loader2
} from "lucide-react";
import toast from "react-hot-toast";
import { logout } from "@/lib/actions/auth";

export default function SettingsPage() {
  const { data: session } = useSession();
  const [isLoading, setIsLoading] = useState(false);

  const [gymName, setGymName] = useState("My CrossFit Box");
  const [gymSize, setGymSize] = useState("medium");

  const [ownerName, setOwnerName] = useState(session?.user?.name || "");
  const [ownerEmail, setOwnerEmail] = useState(session?.user?.email || "");

  const [notifications, setNotifications] = useState(true);

  const handleSaveGym = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Mimic API delay
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    toast.success("Gym Profile updated successfully");
  };

  const handleSaveOwner = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    await new Promise(r => setTimeout(r, 1000));
    setIsLoading(false);
    toast.success("Owner Profile updated successfully");
  };

  const handleToggleNotifications = async () => {
    setNotifications(!notifications);
    toast.success(`Notifications ${!notifications ? 'enabled' : 'disabled'}`);
  };

  const handleDeleteGym = async () => {
    if (confirm("Are you absolutely sure? This will delete all members, classes, and payments. This action cannot be undone.")) {
      toast.success("Account initiated for deletion...");
      await new Promise(r => setTimeout(r, 1000));
      logout();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in duration-500 pb-20">
      
      {/* Header */}
      <div>
        <h1 className="text-3xl font-black text-[#1A1A2E] tracking-tight">Settings</h1>
        <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">Manage your BoxOS configurations</p>
      </div>

      <div className="space-y-6">
        
        {/* Gym Profile */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <Building2 className="text-[#E8541A]" size={24} />
            <h2 className="text-xl font-black text-[#1A1A2E]">Gym Profile</h2>
          </div>
          <form onSubmit={handleSaveGym} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="gymName" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Gym Name</label>
                <input 
                  id="gymName"
                  type="text" 
                  value={gymName}
                  onChange={(e) => setGymName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-[#1A1A2E] text-sm font-bold rounded-xl focus:ring-[#E8541A] focus:border-[#E8541A] p-3 outline-none transition"
                  aria-label="Gym Name"
                />
              </div>
              <div>
                <label htmlFor="gymSize" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Facility Size</label>
                <select 
                  id="gymSize"
                  value={gymSize}
                  onChange={(e) => setGymSize(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-[#1A1A2E] text-sm font-bold rounded-xl focus:ring-[#E8541A] focus:border-[#E8541A] p-3 outline-none transition"
                  aria-label="Facility Size"
                >
                  <option value="small">Small (0-50 members)</option>
                  <option value="medium">Medium (51-150 members)</option>
                  <option value="large">Large (150+ members)</option>
                </select>
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#1A1A2E] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center min-w-[140px]"
                aria-label="Save Gym Profile"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} className="mr-2" /> Save</>}
              </button>
            </div>
          </form>
        </div>

        {/* Owner Profile */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <User className="text-[#E8541A]" size={24} />
            <h2 className="text-xl font-black text-[#1A1A2E]">Owner Profile</h2>
          </div>
          <form onSubmit={handleSaveOwner} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="ownerName" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Full Name</label>
                <input 
                  id="ownerName"
                  type="text" 
                  value={ownerName}
                  onChange={(e) => setOwnerName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-[#1A1A2E] text-sm font-bold rounded-xl focus:ring-[#E8541A] focus:border-[#E8541A] p-3 outline-none transition"
                  aria-label="Owner Name"
                />
              </div>
              <div>
                <label htmlFor="ownerEmail" className="block text-xs font-black uppercase tracking-widest text-gray-500 mb-2">Email Address</label>
                <input 
                  id="ownerEmail"
                  type="email" 
                  value={ownerEmail}
                  onChange={(e) => setOwnerEmail(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 text-[#1A1A2E] text-sm font-bold rounded-xl focus:ring-[#E8541A] focus:border-[#E8541A] p-3 outline-none transition"
                  aria-label="Owner Email"
                />
              </div>
            </div>
            <div className="flex justify-end pt-4">
              <button 
                type="submit" 
                disabled={isLoading}
                className="bg-[#1A1A2E] text-white text-xs font-black uppercase tracking-widest px-6 py-3 rounded-xl hover:bg-gray-800 transition-all flex items-center justify-center min-w-[140px]"
                aria-label="Save Owner Profile"
              >
                {isLoading ? <Loader2 size={16} className="animate-spin" /> : <><Save size={16} className="mr-2" /> Save</>}
              </button>
            </div>
          </form>
        </div>

        {/* Notification Preferences */}
        <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-gray-100 pb-4">
            <Bell className="text-[#E8541A]" size={24} />
            <h2 className="text-xl font-black text-[#1A1A2E]">Notification Preferences</h2>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-bold text-[#1A1A2E]">Expiring Member Reminders</p>
              <p className="text-xs text-gray-500 mt-1">Receive daily emails summarizing members expiring within 7 days.</p>
            </div>
            <button 
              onClick={handleToggleNotifications}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${notifications ? 'bg-[#1A7A4A]' : 'bg-gray-200'}`}
              aria-label="Toggle notifications"
            >
              <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${notifications ? 'translate-x-6' : 'translate-x-1'}`} />
            </button>
          </div>
        </div>

        {/* Danger Zone */}
        <div className="bg-red-50 rounded-3xl p-8 border border-red-100 shadow-sm">
          <div className="flex items-center gap-3 mb-6 border-b border-red-200 pb-4">
            <AlertOctagon className="text-red-600" size={24} />
            <h2 className="text-xl font-black text-red-600">Danger Zone</h2>
          </div>
          <p className="text-sm font-bold text-red-800 mb-6">
            Permanently delete your gym account and erase all underlying data including members, classes, and payments. This is irreversible.
          </p>
          <button 
            onClick={handleDeleteGym}
            className="bg-red-600 text-white text-xs font-black uppercase tracking-widest px-8 py-4 rounded-xl hover:bg-red-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-red-600/20"
            aria-label="Delete Gym Account"
          >
            <AlertOctagon size={16} /> Delete Gym Account
          </button>
        </div>

      </div>
    </div>
  );
}
