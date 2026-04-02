import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { X, Lock } from "lucide-react";
import toast from "react-hot-toast";
import { Member } from "./MembersTable";

const memberSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().optional(),
  plan: z.enum(["monthly", "quarterly", "annual"]),
  startDate: z.string().min(1, "Start date is required"),
  notes: z.string().optional(),
});

type MemberFormValues = z.infer<typeof memberSchema>;

interface MemberModalProps {
  mode: "add" | "edit";
  member?: Member | null;
  onClose: () => void;
  onSave: () => void;
}

export default function MemberModal({
  mode,
  member,
  onClose,
  onSave,
}: MemberModalProps) {
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    reset,
    formState: { errors },
  } = useForm<MemberFormValues>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      plan: "monthly",
      startDate: new Date().toISOString().split("T")[0],
      notes: "",
    },
  });

  // Load existing member data if in edit mode
  useEffect(() => {
    if (mode === "edit" && member) {
      const parts = (member.name || "").split(" ");
      const firstName = parts[0] || "";
      const lastName = parts.slice(1).join(" ") || "";
      
      reset({
        firstName,
        lastName,
        email: member.email,
        phone: member.phone || "",
        plan: member.plan as "monthly" | "quarterly" | "annual",
        startDate: member.startDate ? new Date(member.startDate).toISOString().split("T")[0] : "",
        notes: "", // Notes are not stored on member model directly but sent via email currently
      });
    }
  }, [mode, member, reset]);

  const planValue = watch("plan");
  const startDateValue = watch("startDate");

  // Calculate End Date for display purposes
  const getCalculatedEndDate = () => {
    if (!startDateValue) return "";
    const start = new Date(startDateValue);
    if (isNaN(start.getTime())) return "";
    
    if (planValue === "monthly") start.setDate(start.getDate() + 30);
    else if (planValue === "quarterly") start.setDate(start.getDate() + 90);
    else if (planValue === "annual") start.setDate(start.getDate() + 365);
    
    return start.toLocaleDateString();
  };

  const onSubmit = async (data: MemberFormValues) => {
    setIsLoading(true);
    try {
      if (mode === "add") {
        const response = await fetch("/api/members", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(data),
        });
        
        if (!response.ok) {
          const resError = await response.json();
          throw new Error(resError.error || "Failed to create member");
        }
        
        toast.success("Member created successfully!");
      } else if (mode === "edit" && member?._id) {
        // API handles specific fields
        const start = new Date(data.startDate);
        const endDate = new Date(start);
        if (data.plan === "monthly") endDate.setDate(endDate.getDate() + 30);
        else if (data.plan === "quarterly") endDate.setDate(endDate.getDate() + 90);
        else if (data.plan === "annual") endDate.setDate(endDate.getDate() + 365);

        const putData = {
          name: `${data.firstName} ${data.lastName}`.trim(),
          email: data.email,
          phone: data.phone,
          plan: data.plan,
          endDate: endDate.toISOString(),
        };

        const response = await fetch(`/api/members/${member._id}`, {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(putData),
        });

        if (!response.ok) {
           const resError = await response.json();
           throw new Error(resError.error || "Failed to edit member");
        }
        
        toast.success("Member updated successfully!");
      }
      onSave(); // this triggers data refresh
      onClose();
    } catch (error: any) {
      toast.error(error.message || "An unexpected error occurred");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[600px] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A2E]">
            {mode === "add" ? "Add New Member" : "Edit Member"}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit(onSubmit)} className="p-6">
          <div className="space-y-4">
            {/* Row 1 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">
                  First Name
                </label>
                <input
                  {...register("firstName")}
                  className={`border border-[#E5E7EB] rounded-[4px] px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all ${
                    errors.firstName ? "border-red-500" : ""
                  }`}
                  placeholder="John"
                />
                {errors.firstName && (
                  <p className="text-red-500 text-xs mt-1">{errors.firstName.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">
                  Last Name
                </label>
                <input
                  {...register("lastName")}
                  className={`border border-[#E5E7EB] rounded-[4px] px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all ${
                    errors.lastName ? "border-red-500" : ""
                  }`}
                  placeholder="Doe"
                />
                {errors.lastName && (
                  <p className="text-red-500 text-xs mt-1">{errors.lastName.message}</p>
                )}
              </div>
            </div>

            {/* Row 2 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">
                  Email Address
                </label>
                <input
                  {...register("email")}
                  className={`border border-[#E5E7EB] rounded-[4px] px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all ${
                    errors.email ? "border-red-500" : ""
                  }`}
                  placeholder="john@example.com"
                />
                {errors.email && (
                  <p className="text-red-500 text-xs mt-1">{errors.email.message}</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">
                  Phone Number
                </label>
                <input
                  {...register("phone")}
                  className={`border border-[#E5E7EB] rounded-[4px] px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all ${
                    errors.phone ? "border-red-500" : ""
                  }`}
                  placeholder="+1 (555) 000-0000"
                />
                {errors.phone && (
                  <p className="text-red-500 text-xs mt-1">{errors.phone.message}</p>
                )}
              </div>
            </div>

            {/* Row 3 */}
            <div>
              <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">
                Membership Plan
              </label>
              <select
                {...register("plan")}
                className={`border border-[#E5E7EB] rounded-[4px] px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all ${
                  errors.plan ? "border-red-500" : ""
                }`}
              >
                <option value="monthly">Monthly — $89/mo</option>
                <option value="quarterly">Quarterly — $240/3mo</option>
                <option value="annual">Annual — $840/yr</option>
              </select>
              {errors.plan && (
                <p className="text-red-500 text-xs mt-1">{errors.plan.message}</p>
              )}
            </div>

            {/* Row 4 */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">
                  Start Date
                </label>
                <input
                  type="date"
                  {...register("startDate")}
                  className={`border border-[#E5E7EB] rounded-[4px] px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all ${
                    errors.startDate ? "border-red-500" : ""
                  }`}
                />
                {errors.startDate && (
                  <p className="text-red-500 text-xs mt-1">{errors.startDate.message}</p>
                )}
              </div>
              <div className="relative">
                <label className="block text-sm font-semibold text-gray-500 mb-1">
                  End Date (Calculated)
                </label>
                <div className="relative w-full">
                  <input
                    readOnly
                    disabled
                    value={getCalculatedEndDate()}
                    className="border border-[#E5E7EB] rounded-[4px] px-3 py-2 w-full bg-gray-50 text-gray-500 outline-none pr-10 cursor-not-allowed"
                  />
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                    <Lock size={16} />
                  </div>
                </div>
              </div>
            </div>

            {/* Row 5 */}
            {mode === "add" && (
              <div>
                <label className="block text-sm font-semibold text-[#1A1A2E] mb-1">
                  Notes (Optional)
                </label>
                <textarea
                  {...register("notes")}
                  rows={3}
                  className="border border-[#E5E7EB] rounded-[4px] px-3 py-2 w-full outline-none focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all resize-none"
                  placeholder="Any special requirements or notes..."
                />
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="border-t border-gray-100 pt-4 mt-6 flex items-center justify-between">
            <button
              type="button"
              onClick={onClose}
              disabled={isLoading}
              className="px-5 py-2 border border-gray-300 text-gray-600 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="bg-[#E8541A] text-white px-5 py-2 rounded-md font-medium text-sm hover:bg-[#E8541A]/90 transition shadow-sm flex items-center justify-center min-w-[140px]"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              ) : mode === "add" ? (
                "Add Member"
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
