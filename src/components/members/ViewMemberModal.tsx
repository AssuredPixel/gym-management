import React, { useEffect, useState } from "react";
import { X, Calendar, CreditCard, Activity } from "lucide-react";

interface ViewMemberModalProps {
  memberId: string;
  onClose: () => void;
}

export default function ViewMemberModal({ memberId, onClose }: ViewMemberModalProps) {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSelectedMember = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`/api/members/${memberId}`);
        if (!res.ok) throw new Error("Failed to fetch details");
        const json = await res.json();
        setData(json);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSelectedMember();
  }, [memberId]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-[800px] max-h-[90vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
          <h2 className="text-xl font-bold text-[#1A1A2E]">
            Member Details
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors p-1"
          >
            <X size={20} />
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {isLoading ? (
            <div className="flex justify-center items-center py-20">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : error ? (
            <div className="text-red-500 text-center py-10">{error}</div>
          ) : data ? (
            <div className="space-y-8">
              {/* Profile Card */}
              <div className="flex flex-col sm:flex-row gap-6 bg-gray-50 rounded-lg p-6 border border-gray-100">
                <div className="h-20 w-20 bg-primary/10 rounded-full flex items-center justify-center text-primary text-2xl font-bold shrink-0">
                  {data.member.name.substring(0, 2).toUpperCase()}
                </div>
                <div className="flex flex-col gap-2 flex-1">
                  <h3 className="text-2xl font-bold text-gray-900">{data.member.name}</h3>
                  <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                    <span>{data.member.email}</span>
                    {data.member.phone && <span>• {data.member.phone}</span>}
                  </div>
                  <div className="flex items-center gap-3 mt-2">
                    <span className={`inline-flex items-center justify-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                      data.member.membership?.status === "active" ? "bg-green-100 text-green-700" :
                      data.member.membership?.status === "expiring" ? "bg-amber-100 text-amber-700" : "bg-red-100 text-red-700"
                    }`}>
                      {data.member.membership?.status || "Unknown"}
                    </span>
                    <span className="text-sm font-medium text-primary bg-primary/10 px-2.5 py-0.5 rounded-full capitalize">
                      {data.member.membership?.plan || "No Plan"}
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                {/* Recent Payments */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <CreditCard size={18} className="text-gray-500" />
                    <h4 className="font-medium text-gray-900">Recent Payments</h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {data.recentPayments?.length === 0 ? (
                      <p className="text-sm text-gray-500 p-4 text-center">No payment history.</p>
                    ) : (
                      data.recentPayments.map((payment: any) => (
                        <div key={payment._id} className="p-4 flex items-center justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">${payment.amount.toFixed(2)}</span>
                            <span className="text-xs text-gray-500">{new Date(payment.createdAt).toLocaleDateString()}</span>
                          </div>
                          <span className={`text-xs font-medium capitalize px-2 py-1 rounded-full ${
                            payment.status === 'completed' ? 'bg-green-50 text-green-700' : 'bg-gray-100 text-gray-700'
                          }`}>
                            {payment.status}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>

                {/* Recent Classes */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                  <div className="bg-gray-50 px-4 py-3 border-b border-gray-200 flex items-center gap-2">
                    <Activity size={18} className="text-gray-500" />
                    <h4 className="font-medium text-gray-900">Recent Classes</h4>
                  </div>
                  <div className="divide-y divide-gray-100">
                    {data.recentClasses?.length === 0 ? (
                      <p className="text-sm text-gray-500 p-4 text-center">No classes attended yet.</p>
                    ) : (
                      data.recentClasses.map((wod: any) => (
                        <div key={wod._id} className="p-4 flex items-baseline justify-between">
                          <div className="flex flex-col">
                            <span className="text-sm font-medium text-gray-900">{wod.name}</span>
                            <span className="text-xs text-gray-500 flex items-center gap-1 mt-1">
                              <Calendar size={12} />
                              {new Date(wod.dateTime).toLocaleString([], { dateStyle: 'short', timeStyle: 'short' })}
                            </span>
                          </div>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                            {wod.instructor}
                          </span>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
