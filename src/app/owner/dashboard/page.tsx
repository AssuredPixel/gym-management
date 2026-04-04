"use client";

import React, { useState, useEffect } from "react";
import { 
  Users, 
  CheckCircle, 
  DollarSign, 
  Calendar, 
  ArrowRight, 
  AlertTriangle,
  Clock,
  ExternalLink,
  Loader2,
  Bell,
  MessageSquare,
  Send,
  Trash2
} from "lucide-react";
import Link from "next/link";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface DashboardStats {
  totalMembers: number;
  activeMembers: number;
  revenueThisMonth: number;
  classesThisWeek: number;
  classesTodayCount: number;
  classesToday: Array<{
    _id: string;
    title: string;
    coach: string;
    dateTime: string;
    capacity: number;
    bookedCount: number;
  }>;
  expiringMembers: Array<{
    id: string;
    name: string;
    endDate: string;
  }>;
  recentActivity: Array<{
    _id: string;
    type: string;
    description: string;
    createdAt: string;
  }>;
}

interface FeedPost {
  _id: string;
  content: string;
  authorId: {
    _id: string;
    name: string;
    role: string;
  };
  createdAt: string;
}

const KPICard = ({ 
  title, 
  value, 
  subtext, 
  icon: Icon, 
  trend 
}: { 
  title: string; 
  value: string | number; 
  subtext?: string; 
  icon: React.ElementType; 
  trend?: string;
}) => (
  <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100 flex flex-col justify-between hover:shadow-md transition-shadow grow">
    <div className="flex justify-between items-start">
      <div>
        <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider">{title}</p>
        <h3 className="text-3xl font-black text-[#1A1A2E] mt-2">{value}</h3>
      </div>
      <div className="bg-orange-100 p-3 rounded-xl text-primary transform scale-110 shrink-0 ml-4">
        <Icon size={24} />
      </div>
    </div>
    {trend && (
      <div className="mt-4 flex items-center gap-2">
        <span className="text-sm font-bold text-green-600">{trend}</span>
        <span className="text-xs text-gray-400 font-medium">this month</span>
      </div>
    )}
    {!trend && subtext && (
      <div className="mt-4">
        <span className="text-xs font-bold text-gray-400 uppercase tracking-tighter">{subtext}</span>
      </div>
    )}
  </div>
);

export default function DashboardPage() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [remindingId, setRemindingId] = useState<string | null>(null);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  useEffect(() => {
    async function fetchData() {
      try {
        const statsRes = await fetch("/api/dashboard/stats");
        const statsData = await statsRes.json();
        setStats(statsData);

        const feedRes = await fetch("/api/instructor/feed");
        if (feedRes.ok) {
          setFeed(await feedRes.json());
        }
      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
      } finally {
        setIsLoading(false);
        setLoadingFeed(false);
      }
    }
    fetchData();
  }, []);

  const handleRemind = async (memberId: string) => {
    setRemindingId(memberId);
    try {
      const res = await fetch(`/api/members/${memberId}/remind`, { method: "POST" });
      if (res.ok) {
        toast.success("Reminder sent successfully!");
      }
    } catch (error) {
      console.error("Failed to send reminder:", error);
    } finally {
      setRemindingId(null);
    }
  };

  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPost.trim()) return;

    try {
      setIsPosting(true);
      const res = await fetch("/api/instructor/feed", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newPost.trim() }),
      });

      if (res.ok) {
        const post = await res.json();
        setFeed([post, ...feed]);
        setNewPost("");
        toast.success("Post shared with staff");
      }
    } catch (err) {
      toast.error("Failed to post message");
    } finally {
      setIsPosting(false);
    }
  };

  const handleDeletePost = async (id: string) => {
    if (!confirm("Delete this post?")) return;
    try {
      const res = await fetch(`/api/instructor/feed?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        setFeed(feed.filter(p => p._id !== id));
        toast.success("Post removed");
      }
    } catch (err) {
      toast.error("Failed to delete post");
    }
  };

  const getTimeAgo = (dateStr: string) => {
    const date = new Date(dateStr);
    const now = new Date();
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); 

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!stats) return null;

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <KPICard 
          title="Total Members" 
          value={stats.totalMembers} 
          trend="+5" 
          icon={Users} 
        />
        <KPICard 
          title="Active Members" 
          value={stats.activeMembers} 
          icon={CheckCircle} 
          subtext="High attendance"
        />
        <KPICard 
          title="Monthly Revenue" 
          value={`$${((stats?.revenueThisMonth || 0) / 100).toLocaleString()}`} 
          icon={DollarSign} 
          subtext="Target: $5,000"
        />
        <KPICard 
          title="Classes This Week" 
          value={stats.classesThisWeek} 
          icon={Calendar} 
          subtext={`${stats.classesTodayCount} today`}
        />
      </div>

      {/* Main Content Sections */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity (Left 2/3) */}
        <div className="lg:col-span-2 bg-white rounded-2xl shadow-sm border border-gray-100 p-8 h-full">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-xl font-black text-[#1A1A2E]">Recent Activity</h3>
            <Link href="/owner/dashboard/activity" className="text-sm font-bold text-primary hover:underline flex items-center gap-1 group">
              View all <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
          
          <div className="space-y-6">
            { (stats?.recentActivity?.length || 0) > 0 ? (
              stats.recentActivity.map((log, i) => (
                <div key={log._id} className={`flex items-start gap-4 pb-6 ${i !== (stats?.recentActivity?.length || 0) - 1 ? 'border-b border-gray-50' : ''}`}>
                  <div className={`p-2 rounded-lg shrink-0 ${
                    log.type === 'member_added' ? 'bg-green-50 text-green-600' : 
                    log.type === 'payment_received' ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'
                  }`}>
                    <Clock size={16} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold text-text-primary mb-0.5 truncate">{log.description}</p>
                    <p className="text-xs text-gray-400 font-medium">
                      {new Date(log.createdAt).toLocaleDateString("en-US", { month: "long", day: "numeric" })} at{" "}
                      {new Date(log.createdAt).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" })}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-center py-10 font-medium italic">No recent activity found.</p>
            )}
          </div>
        </div>

        {/* Right Column (Expiring + Staff Feed) */}
        <div className="flex flex-col gap-8">
            {/* Expiring Soon */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 flex flex-col shrink-0">
                <div className="bg-amber-50 p-6 rounded-t-2xl border-b border-amber-100 flex items-center gap-3">
                    <div className="bg-amber-200 text-amber-700 p-2 rounded-lg">
                    <AlertTriangle size={20} />
                    </div>
                    <div>
                    <h4 className="text-sm font-black text-amber-800 uppercase tracking-tighter">Membership Expiring</h4>
                    <p className="text-xs text-amber-600 font-bold">Action required for {stats?.expiringMembers?.length || 0} members</p>
                    </div>
                </div>
                
                <div className="p-6 space-y-4">
                    {(stats?.expiringMembers || []).map((member) => (
                    <div key={member.id} className="flex justify-between items-center group">
                        <div className="min-w-0 pr-4">
                        <p className="text-sm font-bold text-text-primary truncate">{member.name}</p>
                        <p className="text-xs text-orange-500 font-black tracking-wide">
                            Ends {new Date(member.endDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                        </p>
                        </div>
                        <button 
                        onClick={() => handleRemind(member.id)}
                        className="bg-white border border-gray-200 text-[10px] font-black uppercase text-primary px-3 py-1.5 rounded-full hover:bg-primary hover:text-white hover:border-primary transition-all flex items-center gap-1 shrink-0 group-hover:scale-105 active:scale-95"
                        >
                        {remindingId === member.id ? <Loader2 size={12} className="animate-spin" /> : <Bell size={12} />}
                        Remind
                        </button>
                    </div>
                    ))}
                    {(stats?.expiringMembers?.length || 0) === 0 && (
                        <p className="text-gray-400 text-center py-10 text-xs font-bold uppercase tracking-widest opacity-30">All memberships secure</p>
                    )}
                </div>
            </div>

            {/* Staff Feed */}
            <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col flex-1 max-h-[500px]">
                <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                    <MessageSquare size={20} className="text-primary" />
                    Staff Feed
                </h3>
                
                <form onSubmit={handlePost} className="mb-6 relative">
                    <input 
                        type="text"
                        placeholder="Share a message..."
                        value={newPost}
                        onChange={(e) => setNewPost(e.target.value)}
                        className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all shadow-inner"
                    />
                    <button 
                        type="submit"
                        disabled={isPosting || !newPost.trim()}
                        className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                    >
                        {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                </form>

                <div className="flex-1 overflow-y-auto space-y-4 pr-1 -mr-1">
                    {loadingFeed ? (
                        <div className="flex flex-col items-center justify-center py-8 gap-3">
                            <Loader2 size={24} className="animate-spin text-primary" />
                        </div>
                    ) : feed.length === 0 ? (
                        <p className="text-center py-8 text-xs text-gray-400 font-bold uppercase tracking-widest opacity-50">No staff messages</p>
                    ) : (
                        feed.map((post) => (
                            <div key={post._id} className="group flex gap-4 p-4 rounded-xl bg-gray-50/50 border border-gray-100 hover:bg-white hover:shadow-sm transition-all relative">
                                <div className="h-8 w-8 bg-primary/20 text-primary font-bold rounded-full flex items-center justify-center shrink-0 text-xs">
                                    {post.authorId.name.charAt(0).toUpperCase()}
                                </div>
                                <div className="flex-1 min-w-0 pr-4">
                                    <div className="flex items-center gap-2">
                                        <p className="text-xs font-bold text-gray-900 truncate">{post.authorId.name}</p>
                                        <span className="text-[10px] bg-gray-100 text-gray-500 px-1.5 py-0.5 rounded uppercase font-bold tracking-tighter">
                                            {post.authorId.role}
                                        </span>
                                    </div>
                                    <p className="text-xs text-gray-600 leading-relaxed mt-1.5 break-words font-medium italic">
                                        "{post.content}"
                                    </p>
                                    <p className="text-[10px] text-gray-400 mt-2 font-medium">
                                        {getTimeAgo(post.createdAt)}
                                    </p>
                                </div>
                                
                                {(session?.user?.id === post.authorId._id || (session?.user as any)?.role === 'owner') && (
                                    <button 
                                        onClick={() => handleDeletePost(post._id)}
                                        className="absolute top-4 right-4 p-1.5 text-gray-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        <Trash2 size={12} />
                                    </button>
                                )}
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
      </div>

      {/* Today's Classes */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8 overflow-hidden">
        <div className="flex justify-between items-center mb-8">
            <div>
                <h3 className="text-xl font-black text-[#1A1A2E]">Today's Classes</h3>
                <p className="text-xs text-gray-400 font-bold uppercase tracking-widest mt-1">
                  {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
                </p>
            </div>
            <Link href="/owner/dashboard/classes" className="bg-gray-100 text-[#1A1A2E] text-xs font-black uppercase px-4 py-2 rounded-full hover:bg-gray-200 transition-colors flex items-center gap-2">
                All Classes <ExternalLink size={14} />
            </Link>
        </div>

        <div className="flex gap-6 overflow-x-auto pb-4 no-scrollbar">
            { (stats?.classesToday?.length || 0) > 0 ? (
                (stats?.classesToday || []).map((cls) => (
                    <div key={cls._id} className="min-w-[240px] flex-shrink-0 border border-gray-100 rounded-xl p-5 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer group">
                        <span className="text-primary text-xs font-black tracking-widest">
                          {new Date(cls.dateTime).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false })}
                        </span>
                        <h4 className="text-lg font-black text-[#1A1A2E] mt-1 mb-2 group-hover:text-primary transition-colors">{cls.title}</h4>
                        <div className="flex justify-between items-center pt-3 border-t border-gray-50">
                            <span className="text-xs text-gray-500 font-medium">{cls.coach}</span>
                            <span className="text-[10px] font-black bg-gray-100 text-gray-500 px-2 py-1 rounded-md">{cls.bookedCount}/{cls.capacity} spots</span>
                        </div>
                    </div>
                ))
            ) : (
                <div className="flex flex-col items-center justify-center w-full py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-100">
                    <Calendar className="text-gray-200 mb-2" size={32} />
                    <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">No classes scheduled today</p>
                </div>
            )}
        </div>
      </div>
    </div>
  );
}
