"use client";

import React, { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { ChevronRight, Pencil, CreditCard, ToggleLeft, ToggleRight } from "lucide-react";
import { Toaster } from "react-hot-toast";
import MemberModal from "@/components/members/MemberModal";
import { Member } from "@/components/members/MembersTable";

// ─── Helpers ──────────────────────────────────────────────────────────────────

const getInitials = (name: string) => {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  return name.slice(0, 2).toUpperCase();
};

const formatDate = (d: string | Date | null | undefined) => {
  if (!d) return "—";
  return new Date(d).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
};

type TabId = "overview" | "payments" | "classes";

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatBox({ label, value, valueClass }: { label: string; value: string; valueClass?: string }) {
  return (
    <div className="flex flex-col items-center bg-gray-50 rounded-lg p-4 min-w-[110px]">
      <span className="text-xs text-[#666666] uppercase tracking-wide font-medium mb-1">{label}</span>
      <span className={`text-xl font-bold text-[#1A1A2E] ${valueClass ?? ""}`}>{value}</span>
    </div>
  );
}

function EmptyState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-gray-400">
      <svg className="w-12 h-12 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
      </svg>
      <p className="text-sm">{message}</p>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");
  const [activeTab, setActiveTab] = useState<TabId>("overview");
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [note, setNote] = useState("");

  const fetchMember = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/members/${id}`);
      if (!res.ok) throw new Error("Member not found");
      const json = await res.json();
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { fetchMember(); }, [id]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-[#E8541A]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <p className="text-red-500 font-medium mb-4">{error || "Member not found"}</p>
        <button onClick={() => router.back()} className="text-sm text-[#E8541A] underline">← Go back</button>
      </div>
    );
  }

  const { member, recentPayments, recentClasses } = data;
  const membership = member.membership;

  // Build a Member-shaped object for the edit modal
  const memberForEdit: Member = {
    _id: member._id,
    name: member.name,
    email: member.email,
    phone: member.phone,
    plan: membership?.plan ?? "monthly",
    status: membership?.status ?? "active",
    startDate: membership?.startDate ?? "",
    endDate: membership?.endDate ?? "",
    createdAt: member.createdAt,
  };

  const totalPaid = (recentPayments ?? [])
    .filter((p: any) => p.status === "completed")
    .reduce((sum: number, p: any) => sum + p.amount, 0);

  const statusColor =
    membership?.status === "active" ? "bg-green-100 text-green-700" :
    membership?.status === "expiring" ? "bg-amber-100 text-amber-700" :
    "bg-red-100 text-red-700";

  const tabs: { id: TabId; label: string }[] = [
    { id: "overview", label: "Overview" },
    { id: "payments", label: "Payment History" },
    { id: "classes", label: "Class History" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Toaster position="bottom-right" />

      {/* Breadcrumb */}
      <nav className="flex items-center gap-1 text-sm text-gray-400">
        <Link href="/owner/dashboard/members" className="hover:text-[#E8541A] transition-colors">Members</Link>
        <ChevronRight size={14} />
        <span className="text-gray-600 font-medium">{member.name}</span>
      </nav>

      {/* Profile Card */}
      <div className="bg-white rounded-lg shadow p-6">
        <div className="flex flex-col sm:flex-row items-start gap-6">

          {/* Avatar + name */}
          <div className="flex items-center gap-5 flex-1">
            <div className="h-20 w-20 rounded-full bg-[#E8541A] flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {getInitials(member.name)}
            </div>
            <div className="flex flex-col gap-2">
              <h1 className="text-2xl font-bold text-[#1A1A2E]">{member.name}</h1>
              <p className="text-sm text-gray-500">Member since {formatDate(member.createdAt)}</p>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-700 capitalize">
                  {membership?.plan ?? "No plan"}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-600">
                  My CrossFit Box
                </span>
              </div>
            </div>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-3">
            <StatBox
              label="Membership"
              value={membership?.status ?? "—"}
              valueClass={`capitalize text-base px-3 py-0.5 rounded-full ${statusColor}`}
            />
            <StatBox label="Expires" value={formatDate(membership?.endDate)} />
            <StatBox label="Total Paid" value={`$${totalPaid.toLocaleString()}`} />
            <StatBox label="Classes" value={String(recentClasses?.length ?? 0)} />
          </div>
        </div>

        {/* Action buttons — top-right */}
        <div className="flex items-center justify-end gap-3 mt-5 pt-4 border-t border-gray-100">
          <button
            onClick={() => setIsEditOpen(true)}
            className="flex items-center gap-2 border border-gray-300 text-gray-600 px-4 py-2 rounded-md text-sm font-medium hover:bg-gray-50 transition-colors"
          >
            <Pencil size={16} />
            Edit Member
          </button>
          <button className="flex items-center gap-2 bg-[#E8541A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#E8541A]/90 transition-colors shadow-sm">
            <CreditCard size={16} />
            Record Payment
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200">
        <nav className="flex gap-6">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`pb-3 text-sm font-medium border-b-2 transition-colors ${
                activeTab === tab.id
                  ? "border-[#E8541A] text-[#E8541A]"
                  : "border-transparent text-[#666666] hover:text-[#1A1A2E]"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </nav>
      </div>

      {/* ── Overview Tab ── */}
      {activeTab === "overview" && (
        <div className="flex flex-col gap-6">
          <div className="grid md:grid-cols-2 gap-6">
            {/* Membership Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-[#1A1A2E] mb-4">Membership Info</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Plan</dt>
                  <dd className="font-medium text-gray-900 capitalize">{membership?.plan ?? "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Start Date</dt>
                  <dd className="font-medium text-gray-900">{formatDate(membership?.startDate)}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">End Date</dt>
                  <dd className="font-medium text-gray-900">{formatDate(membership?.endDate)}</dd>
                </div>
                <div className="flex justify-between items-center">
                  <dt className="text-gray-500">Auto-Renew</dt>
                  <dd>
                    {membership?.autoRenew ? (
                      <ToggleRight size={24} className="text-[#E8541A]" />
                    ) : (
                      <ToggleLeft size={24} className="text-gray-400" />
                    )}
                  </dd>
                </div>
              </dl>
            </div>

            {/* Contact Info */}
            <div className="bg-white rounded-lg shadow p-6">
              <h3 className="font-semibold text-[#1A1A2E] mb-4">Contact Info</h3>
              <dl className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <dt className="text-gray-500">Email</dt>
                  <dd className="font-medium text-gray-900">{member.email}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Phone</dt>
                  <dd className="font-medium text-gray-900">{member.phone || "—"}</dd>
                </div>
                <div className="flex justify-between">
                  <dt className="text-gray-500">Emergency Contact</dt>
                  <dd className="font-medium text-gray-900">—</dd>
                </div>
              </dl>
            </div>
          </div>

          {/* Quick Note */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="font-semibold text-[#1A1A2E] mb-3">Quick Note</h3>
            <textarea
              rows={4}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Add a note about this member..."
              className="w-full border border-[#E5E7EB] rounded-[4px] px-3 py-2 text-sm outline-none focus:ring-2 focus:ring-[#E8541A]/20 focus:border-[#E8541A] transition-all resize-none"
            />
            <div className="flex justify-end mt-3">
              <button className="bg-[#E8541A] text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-[#E8541A]/90 transition shadow-sm">
                Save Note
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Payment History Tab ── */}
      {activeTab === "payments" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {!recentPayments?.length ? (
            <EmptyState message="No payment history found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F5F5F5] border-b border-[#E5E7EB]">
                    {["Date", "Description", "Amount", "Method", "Status", "Receipt"].map((col) => (
                      <th key={col} className="px-6 py-3 text-xs font-semibold text-[#666666] uppercase tracking-wide">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentPayments.map((p: any, i: number) => (
                    <tr key={p._id} className={i % 2 !== 0 ? "bg-[#F9F9F9]" : "bg-white"}>
                      <td className="px-6 py-3 text-sm text-gray-600">{formatDate(p.createdAt)}</td>
                      <td className="px-6 py-3 text-sm text-gray-900 font-medium">Membership Payment</td>
                      <td className="px-6 py-3 text-sm font-semibold text-gray-900">${p.amount?.toFixed(2)}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">—</td>
                      <td className="px-6 py-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${
                          p.status === "completed" ? "bg-green-100 text-green-700" :
                          p.status === "pending"   ? "bg-amber-100 text-amber-700" :
                          "bg-red-100 text-red-700"
                        }`}>
                          {p.status === "completed" ? "Paid" : p.status}
                        </span>
                      </td>
                      <td className="px-6 py-3 text-sm text-[#E8541A] hover:underline cursor-pointer">View</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* ── Class History Tab ── */}
      {activeTab === "classes" && (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {!recentClasses?.length ? (
            <EmptyState message="No class history found." />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-[#F5F5F5] border-b border-[#E5E7EB]">
                    {["Date", "WOD Name", "Coach", "Status"].map((col) => (
                      <th key={col} className="px-6 py-3 text-xs font-semibold text-[#666666] uppercase tracking-wide">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {recentClasses.map((cls: any, i: number) => (
                    <tr key={cls._id} className={i % 2 !== 0 ? "bg-[#F9F9F9]" : "bg-white"}>
                      <td className="px-6 py-3 text-sm text-gray-600">
                        {new Date(cls.dateTime).toLocaleString([], { dateStyle: "short", timeStyle: "short" })}
                      </td>
                      <td className="px-6 py-3 text-sm font-medium text-gray-900">{cls.name}</td>
                      <td className="px-6 py-3 text-sm text-gray-600">{cls.instructor}</td>
                      <td className="px-6 py-3">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-700">
                          Attended
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Edit Modal */}
      {isEditOpen && (
        <MemberModal
          mode="edit"
          member={memberForEdit}
          onClose={() => setIsEditOpen(false)}
          onSave={() => { fetchMember(); setIsEditOpen(false); }}
        />
      )}
    </div>
  );
}
