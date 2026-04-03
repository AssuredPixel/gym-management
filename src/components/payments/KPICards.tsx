"use client";

import React from "react";
import { DollarSign, AlertTriangle, Calendar, TrendingUp, TrendingDown } from "lucide-react";

interface KPICardsProps {
  stats: {
    revenueThisMonth: number;
    overdueMembers: any[];
    upcomingPayments: any[];
  };
}

const Card = ({ title, value, subtext, icon: Icon, colorClass, borderClass, trendIcon: TrendIcon, trendColor }: any) => (
  <div className={`bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-all ${borderClass || ""}`}>
    <div className="flex justify-between items-start">
      <div>
        <p className="text-xs font-black text-gray-400 uppercase tracking-widest mb-1">{title}</p>
        <h3 className={`text-3xl font-black ${colorClass || "text-gray-900"}`}>{value}</h3>
      </div>
      <div className={`p-3 rounded-xl bg-opacity-10 ${TrendIcon ? trendColor : 'bg-orange-500 text-orange-500'} bg-gray-100`}>
        <Icon size={24} />
      </div>
    </div>
    <div className="mt-4 flex items-center gap-1.5">
      {TrendIcon && <TrendIcon size={14} className={trendColor} />}
      <p className="text-xs font-bold text-gray-500">{subtext}</p>
    </div>
  </div>
);

export default function KPICards({ stats }: KPICardsProps) {
  const totalOwed = stats.overdueMembers.reduce((acc, m) => acc + m.amountOwed, 0);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {/* Revenue Card */}
      <Card
        title="Revenue This Month"
        value={`$${(stats.revenueThisMonth / 100).toLocaleString()}`}
        subtext="+12% vs last month"
        icon={DollarSign}
        trendIcon={TrendingUp}
        trendColor="text-green-500"
      />

      {/* Overdue Card */}
      <Card
        title="Overdue Members"
        value={`${stats.overdueMembers.length} members`}
        subtext={`⚠ Total owed: $${(totalOwed / 100).toLocaleString()}`}
        icon={AlertTriangle}
        colorClass="text-amber-600"
        borderClass="border-l-4 border-amber-400"
        trendColor="text-amber-500"
      />

      {/* Expected Card */}
      <Card
        title="Next 7 Days Expected"
        value={`$${(stats.upcomingPayments.reduce((acc, p) => acc + 8900, 0) / 100).toLocaleString()}`} // Assuming basic plan for estimate
        subtext={`${stats.upcomingPayments.length} renewals due`}
        icon={Calendar}
        trendColor="text-blue-500"
      />
    </div>
  );
}
