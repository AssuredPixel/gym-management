"use client";

import React, { useEffect } from "react";
import { useForm, SubmitHandler } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import axios from "axios";
import { X, AlertCircle, Loader2 } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

const WODSchema = z.object({
  title: z.string().min(1, "WOD Name is required"),
  date: z.string().min(1, "Date is required"),
  time: z.string().min(1, "Time is required"),
  durationMinutes: z.number().min(1).max(240),
  capacity: z.number().min(1).max(100),
  coach: z.string().min(1, "Coach is required"),
  classType: z.enum(["wod", "strength", "competition"]),
  description: z.string().optional(),
  publishImmediately: z.boolean(),
});

type WODFormValues = z.infer<typeof WODSchema>;

interface WODModalProps {
  mode: "create" | "edit";
  wodClass?: any;
  defaultDateTime?: Date | null;
  onClose: () => void;
  onSave: () => void;
  isOpen: boolean;
}

export default function WODModal({ 
  mode, 
  wodClass, 
  defaultDateTime, 
  onClose, 
  onSave,
  isOpen 
}: WODModalProps) {
  const { data: session } = useSession();
  
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<WODFormValues>({
    resolver: zodResolver(WODSchema),
    defaultValues: {
      durationMinutes: 60,
      capacity: 20,
      classType: "wod",
      publishImmediately: true,
      coach: session?.user?.name || "Coach",
    },
  });

  const selectedType = watch("classType");
  const publishImmediately = watch("publishImmediately");

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
      if (mode === "edit" && wodClass) {
        const dt = new Date(wodClass.dateTime);
        reset({
          title: wodClass.title,
          date: dt.toISOString().split("T")[0],
          time: dt.toTimeString().slice(0, 5),
          durationMinutes: wodClass.durationMinutes,
          capacity: wodClass.capacity,
          coach: wodClass.coach,
          classType: (wodClass.classType === "competition" ? "competition" : wodClass.classType) as any,
          description: wodClass.description || "",
          publishImmediately: wodClass.status === "scheduled",
        });
      } else if (defaultDateTime) {
        reset({
          title: "",
          date: defaultDateTime.toISOString().split("T")[0],
          time: defaultDateTime.toTimeString().slice(0, 5),
          durationMinutes: 60,
          capacity: 20,
          coach: session?.user?.name || "Coach",
          classType: "wod",
          description: "",
          publishImmediately: true,
        });
      } else {
        reset({
          title: "",
          date: "",
          time: "",
          durationMinutes: 60,
          capacity: 20,
          coach: session?.user?.name || "Coach",
          classType: "wod",
          description: "",
          publishImmediately: true,
        });
      }
    } else {
      document.body.style.overflow = "unset";
    }

    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isOpen, mode, wodClass, defaultDateTime, reset, session]);

  if (!isOpen) return null;

  const onSubmit: SubmitHandler<WODFormValues> = async (values) => {
    try {
      const dateTime = new Date(`${values.date}T${values.time}`);
      const payload = {
        ...values,
        dateTime,
        status: values.publishImmediately ? "scheduled" : "cancelled",
      };

      if (mode === "edit") {
        await axios.put(`/api/classes/${wodClass._id}`, payload);
        toast.success("WOD Updated Successfully");
      } else {
        await axios.post("/api/classes", payload);
        toast.success("WOD Created Successfully");
      }
      onSave();
      onClose();
    } catch (error: any) {
      toast.error(error.response?.data?.error || "Failed to save WOD");
    }
  };

  const formattedHeaderDate = () => {
    const dateVal = watch("date");
    if (!dateVal) return "Select a date";
    return new Date(dateVal).toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-[#1A1A2E]/60 backdrop-blur-sm animate-in fade-in duration-300">
      <div className="bg-white w-full max-w-[600px] max-h-[90vh] rounded-[24px] shadow-2xl flex flex-col overflow-hidden border border-gray-100 animate-in zoom-in-95 duration-200">
        {/* Header (Fixed) */}
        <div className="p-8 pb-4 flex justify-between items-start shrink-0">
          <div>
            <h2 className="text-2xl font-black text-[#1A1A2E] tracking-tight">
              {mode === "create" ? "Create New WOD" : "Edit WOD Session"}
            </h2>
            <p className="text-sm font-bold text-gray-400 mt-1">
              {formattedHeaderDate()}
            </p>
          </div>
          <button 
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400 hover:text-[#1A1A2E]"
          >
            <X size={24} />
          </button>
        </div>

        {/* Form Body (Scrollable) */}
        <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col flex-1 overflow-hidden">
          <div className="flex-1 overflow-y-auto p-8 pt-4 space-y-6 custom-scrollbar">
            {/* Row 1: WOD Name */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">WOD Name</label>
              <input 
                {...register("title")}
                placeholder="e.g. Fran, Helen, Open WOD..."
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all outline-none"
              />
              {errors.title && <p className="text-[10px] font-bold text-red-500 px-1">{errors.title.message}</p>}
            </div>

            {/* Row 2: Date & Time */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Date</label>
                <input 
                  type="date"
                  {...register("date")}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all outline-none"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Time</label>
                <input 
                  type="time"
                  {...register("time")}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all outline-none"
                />
              </div>
            </div>

            {/* Row 3: Duration & Capacity */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Duration (Min)</label>
                <div className="relative">
                  <input 
                    type="number"
                    {...register("durationMinutes", { valueAsNumber: true })}
                    className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all outline-none"
                  />
                  <span className="absolute right-4 top-1/2 -translate-y-1/2 text-[10px] font-black text-gray-400 uppercase">Min</span>
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Max Capacity</label>
                <input 
                  type="number"
                  {...register("capacity", { valueAsNumber: true })}
                  className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all outline-none"
                />
              </div>
            </div>

            {/* Edit Warning */}
            {mode === "edit" && (wodClass?.bookedCount > 0) && (
              <div className="bg-amber-50 border border-amber-200 p-4 rounded-xl flex items-center gap-3">
                <AlertCircle className="text-amber-500 shrink-0" size={20} />
                <p className="text-[11px] font-bold text-amber-900 leading-tight">
                  This class has {wodClass.bookedCount} bookings — changing the time will automatically notify all members.
                </p>
              </div>
            )}

            {/* Row 4: Coach */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Coach</label>
              <select 
                {...register("coach")}
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all outline-none cursor-pointer"
              >
                <option value={session?.user?.name || "Coach"}>{session?.user?.name || "Coach"} (You)</option>
              </select>
            </div>

            {/* Row 5: Class Type (Pills) */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Class Type</label>
              <div className="flex gap-2 p-1 bg-gray-50 rounded-xl border border-gray-100">
                {[
                  { id: "wod", label: "Regular WOD" },
                  { id: "strength", label: "Strength" },
                  { id: "competition", label: "Competition Prep" }
                ].map((type) => (
                  <button
                    key={type.id}
                    type="button"
                    onClick={() => setValue("classType", type.id as any)}
                    className={`flex-1 py-3 px-2 rounded-lg text-[10px] font-black uppercase tracking-wider transition-all border ${
                      selectedType === type.id 
                        ? "bg-[#E8541A] text-white border-[#E8541A] shadow-md shadow-orange-500/20" 
                        : "bg-white text-gray-500 border-gray-200 hover:border-[#E8541A] hover:text-[#E8541A]"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Row 6: Description */}
            <div className="space-y-2">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest px-1">Description/Notes</label>
              <textarea 
                {...register("description")}
                rows={3}
                placeholder="Scaling options, equipment needed..."
                className="w-full bg-gray-50 border border-gray-200 p-4 rounded-xl text-sm font-bold focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all outline-none resize-none"
              />
            </div>
          </div>

          {/* Footer (Fixed) */}
          <div className="p-8 pt-4 border-t border-gray-100 flex justify-between items-center bg-white shrink-0">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div 
                onClick={() => setValue("publishImmediately", !publishImmediately)}
                className={`w-10 h-5 rounded-full transition-all relative ${publishImmediately ? "bg-[#E8541A]" : "bg-gray-200"}`}
              >
                <div className={`absolute top-1 w-3 h-3 bg-white rounded-full transition-all ${publishImmediately ? "left-6" : "left-1"}`} />
              </div>
              <span className="text-[10px] font-black text-[#1A1A2E] uppercase tracking-widest">Publish Immediately</span>
            </label>

            <div className="flex items-center gap-3">
              <button 
                type="button"
                onClick={onClose}
                className="px-6 py-3 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-[#1A1A2E] transition-colors"
              >
                Cancel
              </button>
              <button 
                type="submit"
                disabled={isSubmitting}
                className="bg-[#E8541A] text-white text-[10px] font-black uppercase tracking-widest px-8 py-3.5 rounded-xl shadow-lg shadow-orange-500/20 hover:shadow-orange-500/40 active:scale-95 transition-all disabled:opacity-50 disabled:pointer-events-none flex items-center gap-2"
              >
                {isSubmitting && <Loader2 size={14} className="animate-spin" />}
                {mode === "create" ? "Save WOD" : "Update WOD"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
