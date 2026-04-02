"use client";

import React, { useState } from "react";
import { X, DollarSign, CreditCard, Loader2, CheckCircle2 } from "lucide-react";
import toast from "react-hot-toast";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  userId: string;
  userName: string;
  onSuccess: () => void;
  userRole: "owner" | "member";
}

export default function PaymentModal({
  isOpen,
  onClose,
  userId,
  userName,
  onSuccess,
  userRole,
}: PaymentModalProps) {
  const [method, setMethod] = useState<"cash" | "paystack">(
    userRole === "owner" ? "cash" : "paystack"
  );
  const [planType, setPlanType] = useState("monthly");
  const [amount, setAmount] = useState("8900"); // Default for monthly
  const [description, setDescription] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  if (!isOpen) return null;

  const handlePlanChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    setPlanType(val);
    if (val === "monthly") setAmount("8900");
    else if (val === "quarterly") setAmount("24000");
    else if (val === "annual") setAmount("84000");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      if (method === "cash") {
        const res = await fetch("/api/payments/cash", {
          method: "POST",
          body: JSON.stringify({ userId, amount, planType, description }),
        });
        if (!res.ok) throw new Error("Failed to record cash payment");
        
        toast.success("Cash payment recorded successfully");
        setIsSuccess(true);
        setTimeout(() => {
          onSuccess();
          onClose();
        }, 2000);
      } else {
        // Paystack Initialization
        const res = await fetch("/api/payments/paystack/initialize", {
          method: "POST",
          body: JSON.stringify({ userId, planType }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || "Failed to initialize Paystack");

        // Redirect user to Paystack
        window.location.href = data.authorization_url;
      }
    } catch (err: any) {
      toast.error(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-md overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
        <div className="p-6 border-b border-gray-50 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="text-xl font-black text-[#1A1A2E]">
              {userRole === "owner" ? "Record Payment" : "Renew Membership"}
            </h2>
            <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-0.5">
              For {userName}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white rounded-full transition-colors"
          >
            <X size={20} className="text-gray-400" />
          </button>
        </div>

        {isSuccess ? (
          <div className="p-12 flex flex-col items-center justify-center text-center">
            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-6 animate-bounce">
              <CheckCircle2 size={40} />
            </div>
            <h3 className="text-2xl font-black text-[#1A1A2E] mb-2">Payment Recorded!</h3>
            <p className="text-gray-500 font-medium">The membership has been updated.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="p-8 space-y-6">
            {/* Method Selection */}
            <div className="grid grid-cols-2 gap-4">
              <button
                type="button"
                onClick={() => setMethod("paystack")}
                className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                  method === "paystack"
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-gray-100 hover:border-gray-200 text-gray-400"
                }`}
              >
                <CreditCard size={24} />
                <span className="text-xs font-black uppercase tracking-widest">Paystack</span>
              </button>
              {userRole === "owner" && (
                <button
                  type="button"
                  onClick={() => setMethod("cash")}
                  className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all ${
                    method === "cash"
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-gray-100 hover:border-gray-200 text-gray-400"
                  }`}
                >
                  <DollarSign size={24} />
                  <span className="text-xs font-black uppercase tracking-widest">Cash</span>
                </button>
              )}
            </div>

            {/* Plan and Amount */}
            <div className="space-y-4">
              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Select Plan
                </label>
                <select
                  value={planType}
                  onChange={handlePlanChange}
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A2E] focus:ring-2 focus:ring-primary/20 transition-all cursor-pointer"
                >
                  <option value="monthly">Monthly (NGN 8,900)</option>
                  <option value="quarterly">Quarterly (NGN 24,000)</option>
                  <option value="annual">Annual (NGN 84,000)</option>
                </select>
              </div>

              <div>
                <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                  Amount (NGN)
                </label>
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  disabled={method === "paystack"} // Fixed amounts for Paystack plans
                  className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A2E] disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>

              {method === "cash" && (
                <div>
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-1.5 block">
                    Notes
                  </label>
                  <textarea
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full bg-gray-50 border-none rounded-xl px-4 py-3 text-sm font-bold text-[#1A1A2E] h-20 resize-none"
                    placeholder="E.g. Paid in cash at front desk"
                  />
                </div>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-[#1A1A2E] text-white py-4 rounded-2xl font-black uppercase tracking-[2px] hover:bg-[#2A2A3E] transition-all flex items-center justify-center gap-2 shadow-xl shadow-gray-200 active:scale-95 disabled:opacity-50"
            >
              {isLoading ? (
                <Loader2 className="animate-spin" size={20} />
              ) : (
                method === "cash" ? "Confirm Payment" : "Proceed to Pay"
              )}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
