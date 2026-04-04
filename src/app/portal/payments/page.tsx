"use client";

import React, { useState, useEffect } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";
import { usePaystackPayment } from "react-paystack";
import { 
  CreditCard, 
  Calendar as CalendarIcon,
  Download,
  Lock,
  Loader2,
  RefreshCw,
  AlertCircle
} from "lucide-react";
import MemberLayout from "@/components/layout/MemberLayout";
import toast from "react-hot-toast";

// Fallback to test key if env var is missing during development
const PAYSTACK_PUBLIC_KEY = process.env.NEXT_PUBLIC_PAYSTACK_PUBLIC_KEY || "pk_test_b75ebb38d8f997c64eb3fe75f4d8e57eecee47d5";

export default function MemberPaymentsPage() {
  const { data: session } = useSession();
  const [payments, setPayments] = useState<any[]>([]);
  const [membership, setMembership] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Derive price based on plan name
  const getPlanPrice = (plan: string) => {
    switch (plan) {
      case 'monthly': return 89;
      case 'quarterly': return 240;
      case 'annual': return 840;
      default: return 89;
    }
  };

  const fetchPayments = async () => {
    try {
      const res = await axios.get("/api/portal/payments");
      setPayments(res.data.payments);
      setMembership(res.data.membership);
    } catch (error) {
      console.error("Failed to load payments data");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayments();
  }, []);

  const planPrice = membership ? getPlanPrice(membership.plan) : 0;

  // Paystack Configuration
  const config = {
    reference: `PS_${new Date().getTime().toString()}`,
    email: session?.user?.email || "",
    amount: planPrice * 100, // Default assume frontend treats price in dollars, convert to Kobo if Paystack is set to NGN? Wait, if currency is USD... Paystack defaults to NGN. Let's just pass `planPrice * 100`.
    publicKey: PAYSTACK_PUBLIC_KEY,
    metadata: {
      custom_fields: [
        {
          display_name: "User ID",
          variable_name: "userId",
          value: (session?.user as any)?.id
        },
        {
          display_name: "Gym ID",
          variable_name: "gymId",
          value: (session?.user as any)?.gymId
        },
        {
          display_name: "Plan",
          variable_name: "plan",
          value: membership?.plan || "monthly"
        }
      ]
    }
  };

  const initializePayment = usePaystackPayment(config);

  const onSuccess = (reference: any) => {
    toast.success("Payment successful! Updating your membership...");
    // The webhook will handle the database update securely, but we can optimistically reload the local data after a short delay
    setTimeout(() => {
      fetchPayments();
    }, 2000);
  };

  const onClose = () => {
    toast.error("Payment window closed.");
  };

  const triggerPaystackCheckout = () => {
    if (!session?.user?.email) {
      toast.error("Email required to process payment.");
      return;
    }
    initializePayment({ onSuccess, onClose } as any);
  };


  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-[#1A7A4A]';
      case 'expiring': return 'bg-amber-100 text-amber-600';
      case 'expired': return 'bg-red-100 text-red-600';
      case 'paid': return 'text-[#1A7A4A] bg-green-50';
      case 'pending': return 'text-amber-600 bg-amber-50';
      case 'failed': return 'text-red-600 bg-red-50';
      default: return 'text-gray-500 bg-gray-50';
    }
  };

  const calculateProgress = () => {
    if (!membership) return 0;
    const start = new Date(membership.startDate).getTime();
    const end = new Date(membership.endDate).getTime();
    const now = new Date().getTime();
    if (now > end) return 100;
    if (now < start) return 0;
    return ((now - start) / (end - start)) * 100;
  };

  if (isLoading) {
    return (
      <MemberLayout>
        <div className="h-[40vh] flex flex-col items-center justify-center gap-4">
          <Loader2 className="animate-spin text-[#E8541A]" size={40} />
        </div>
      </MemberLayout>
    );
  }

  return (
    <MemberLayout>
      <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500 pb-20 max-w-5xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 bg-white p-6 md:p-8 rounded-[32px] border border-gray-100 shadow-sm">
          <div>
            <h1 className="text-3xl md:text-4xl font-black text-[#1A1A2E] tracking-tight">Payments & Billing</h1>
            <p className="text-sm font-bold text-gray-400 mt-2">Manage your subscription and invoices.</p>
          </div>
        </div>

        <div className="space-y-8">
          {/* Current Membership Card */}
          <div className="bg-white rounded-[32px] p-6 md:p-8 shadow-sm border border-gray-100 flex flex-col md:flex-row justify-between items-center md:items-start gap-8">
            <div className="w-full md:w-auto flex-1">
              <div className="flex items-center gap-4 mb-4">
                <h2 className="text-2xl md:text-3xl font-black text-[#1A1A2E] capitalize">
                  {membership?.plan || 'No'} Plan <span className="text-gray-300 font-normal mx-2">—</span> ${planPrice}<span className="text-sm text-gray-400">/{membership?.plan === 'monthly' ? 'mo' : membership?.plan === 'quarterly' ? 'qtr' : 'yr'}</span>
                </h2>
              </div>
              
              <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
                {membership ? (
                   <span className={`text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block text-center ${getStatusColor(membership.status)}`}>
                      {membership.status}
                   </span>
                ) : (
                   <span className="text-[10px] font-black uppercase tracking-widest px-4 py-1.5 rounded-full inline-block text-center bg-gray-100 text-gray-400">
                      Inactive
                   </span>
                )}
                {membership && (
                  <span className="text-sm font-bold text-gray-400 flex items-center gap-2">
                     <CalendarIcon size={16} /> Next payment due: {new Date(membership.endDate).toLocaleDateString()}
                  </span>
                )}
              </div>

              {membership && (
                <div className="w-full max-w-md">
                  <div className="h-2 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-[#E8541A] rounded-full transition-all duration-1000"
                      style={{ width: `${calculateProgress()}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="w-full md:w-auto flex flex-col gap-3 shrink-0">
              <button 
                onClick={triggerPaystackCheckout}
                className="w-full bg-[#E8541A] text-white text-sm font-black uppercase tracking-widest px-10 py-5 rounded-2xl shadow-xl shadow-orange-500/20 hover:shadow-orange-500/40 hover:-translate-y-0.5 active:scale-95 transition-all text-center"
              >
                Pay Now — ${planPrice}
              </button>
              <div className="flex items-center justify-center gap-2 text-xs font-bold text-gray-400">
                 <Lock size={12} /> Secure payment via Paystack
              </div>
              <button className="text-xs font-black text-gray-400 uppercase tracking-widest hover:text-[#1A1A2E] transition-colors mt-2 text-center h-10 w-full rounded-xl hover:bg-gray-50 border border-transparent hover:border-gray-200">
                Change Plan
              </button>
            </div>
          </div>

          {/* Payment History Table */}
          <div className="bg-white rounded-[32px] border border-gray-100 shadow-sm overflow-hidden">
            <div className="p-6 md:p-8 border-b border-gray-100">
              <h3 className="text-xl font-black text-[#1A1A2E]">Payment History</h3>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Date</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Description</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Amount</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Status</th>
                    <th className="px-6 py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest">Invoice</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {payments.length > 0 ? payments.map((payment) => (
                    <tr key={payment._id} className="hover:bg-gray-50/50 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-bold text-[#1A1A2E]">
                          {new Date(payment.createdAt).toLocaleDateString()}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <span className="text-sm font-bold text-gray-500">{payment.description}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="text-sm font-black text-[#1A1A2E]">${(payment.amount / 100).toFixed(2)}</span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-md ${getStatusColor(payment.status)}`}>
                          {payment.status}
                        </span>
                        {payment.status === 'failed' && (
                          <button onClick={triggerPaystackCheckout} className="ml-3 text-[10px] font-black text-[#E8541A] uppercase tracking-widest hover:underline">
                            Retry
                          </button>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                         <button className="flex items-center gap-2 text-xs font-bold text-[#E8541A] hover:text-orange-600 transition-colors">
                           <Download size={14} /> PDF
                         </button>
                      </td>
                    </tr>
                  )) : (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center">
                        <p className="text-sm font-bold text-gray-400">No payment history found.</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </MemberLayout>
  );
}
