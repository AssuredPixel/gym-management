"use client";

import React, { useState, useEffect } from "react";
import { X, Save, User, Mail, Phone, Lock, Loader2, ShieldCheck, UserPlus } from "lucide-react";
import toast from "react-hot-toast";

interface Instructor {
  _id: string;
  name: string;
  email: string;
  phone?: string;
  isActive: boolean;
}

interface InstructorModalProps {
  mode: 'add' | 'edit';
  instructor?: Instructor | null;
  onClose: () => void;
  onSave: () => void;
}

export default function InstructorModal({ mode, instructor, onClose, onSave }: InstructorModalProps) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    password: "",
    isActive: true
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (mode === 'edit' && instructor) {
      setFormData({
        name: instructor.name,
        email: instructor.email,
        phone: instructor.phone || "",
        password: "", 
        isActive: instructor.isActive
      });
    }
  }, [mode, instructor]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);

    try {
      const url = "/api/instructors";
      const method = mode === 'add' ? "POST" : "PUT";
      
      // Don't send empty password if editing
      const submitData = { ...formData };
      if (mode === 'edit' && !submitData.password) {
        delete (submitData as any).password;
      }
      
      const body = mode === 'add' 
        ? submitData 
        : { ...submitData, id: instructor?._id };

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (res.ok) {
        toast.success(mode === 'add' ? "Invite sent successfully!" : "Instructor updated successfully!");
        onSave();
        onClose();
      } else {
        const data = await res.json();
        const errorMessage = data.error || "Something went wrong";
        setError(errorMessage);
        toast.error(errorMessage);
      }
    } catch (err) {
      const errorMessage = "Failed to save instructor";
      setError(errorMessage);
      toast.error(errorMessage);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200 border border-gray-100">
        {/* Header */}
        <div className="flex items-center justify-between px-8 py-6 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary/10 text-primary rounded-lg flex items-center justify-center">
              {mode === 'add' ? <UserPlus size={20} /> : <ShieldCheck size={20} />}
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">
                {mode === 'add' ? "Add Instructor" : "Edit Instructor"}
              </h2>
              <p className="text-xs text-gray-500 mt-0.5">Define roles and access for your staff</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 rounded-full hover:bg-gray-200 transition-colors text-gray-400 hover:text-gray-600"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="px-8 py-8 space-y-6">
            {error && (
              <div className="p-3 bg-red-50 text-red-500 text-xs font-bold rounded-lg border border-red-100 animate-in shake-in">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Full Name</label>
                <div className="relative">
                  <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="Coach name"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Email Address</label>
                <div className="relative">
                  <Mail size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="email"
                    required
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                    placeholder="coach@example.com"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">Phone</label>
                  <div className="relative">
                    <Phone size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      placeholder="+234..."
                    />
                  </div>
                </div>

                {mode === 'edit' && (
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-gray-400 uppercase tracking-wider">New Password</label>
                    <div className="relative">
                      <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="password"
                        value={formData.password}
                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                        placeholder="••••••••"
                      />
                    </div>
                  </div>
                )}
              </div>

              {mode === 'add' && (
                <div className="p-4 bg-primary/5 border border-primary/10 rounded-xl">
                  <div className="flex gap-3">
                    <div className="shrink-0 text-primary">
                      <Mail size={18} />
                    </div>
                    <p className="text-xs text-gray-600 leading-relaxed font-medium">
                      An onboarding email will be sent to the instructor to set up their secure password and portal access.
                    </p>
                  </div>
                </div>
              )}

              {mode === 'edit' && (
                <div className="flex items-center gap-2 p-4 bg-gray-50 rounded-xl border border-gray-100">
                  <label className="inline-flex items-center cursor-pointer">
                    <input 
                      type="checkbox" 
                      checked={formData.isActive}
                      onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                      className="sr-only peer"
                    />
                    <div className="relative w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-green-500"></div>
                    <span className="ms-3 text-sm font-bold text-gray-700">Account Active</span>
                  </label>
                </div>
              )}
            </div>
          </div>

          <div className="px-8 py-6 border-t border-gray-100 bg-gray-50/50 flex justify-end gap-3">
            <button 
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 text-sm font-bold text-gray-500 hover:bg-gray-100 rounded-xl transition-all"
            >
              Cancel
            </button>
            <button 
              type="submit"
              disabled={saving}
              className="flex items-center gap-2 px-8 py-2.5 bg-primary text-white rounded-xl text-sm font-bold hover:bg-primary/90 shadow-lg shadow-primary/20 transition-all disabled:opacity-50"
            >
              {saving ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
              <span>{mode === 'add' ? "Send Invite" : "Save Changes"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
