"use client";

import React, { useState, useEffect } from "react";
import InstructorLayout from "@/components/layout/InstructorLayout";
import { Calendar, Users, Activity, Clock, Loader2, Send, Trash2, MessageSquare } from "lucide-react";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";

interface Stats {
  todayClasses: number;
  totalStudents: number;
  sessionHours: string;
  activeRatio: string;
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

export default function InstructorDashboard() {
  const { data: session } = useSession();
  const [stats, setStats] = useState<Stats | null>(null);
  const [feed, setFeed] = useState<FeedPost[]>([]);
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingFeed, setLoadingFeed] = useState(true);
  const [newPost, setNewPost] = useState("");
  const [isPosting, setIsPosting] = useState(false);

  const fetchData = async () => {
    try {
      setLoadingStats(true);
      const statsRes = await fetch("/api/instructor/stats");
      if (statsRes.ok) {
        setStats(await statsRes.json());
      }

      setLoadingFeed(true);
      const feedRes = await fetch("/api/instructor/feed");
      if (feedRes.ok) {
        setFeed(await feedRes.json());
      }
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toast.error("Failed to load dashboard data");
    } finally {
      setLoadingStats(false);
      setLoadingFeed(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

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
    const diff = Math.floor((now.getTime() - date.getTime()) / 1000 / 60); // minutes

    if (diff < 1) return "Just now";
    if (diff < 60) return `${diff}m ago`;
    if (diff < 1440) return `${Math.floor(diff / 60)}h ago`;
    return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
  };

  return (
    <InstructorLayout>
      <div className="flex flex-col gap-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex items-center justify-between">
            <div className="space-y-1">
                <h1 className="text-3xl font-extrabold text-gray-900 tracking-tight">Coach Dashboard</h1>
                <p className="text-sm text-gray-500 font-medium tracking-tight">Management portal for your classes and athletes</p>
            </div>
            <button 
                onClick={fetchData}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors text-gray-400"
                title="Refresh dashboard"
            >
                <Clock size={20} />
            </button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <StatCard 
            icon={<Calendar size={20} />} 
            label="Today's Classes" 
            value={stats?.todayClasses ?? 0} 
            loading={loadingStats} 
            color="bg-primary/10 text-primary"
          />
          <StatCard 
            icon={<Users size={20} />} 
            label="Total Students" 
            value={stats?.totalStudents ?? 0} 
            loading={loadingStats} 
            color="bg-blue-50 text-blue-500"
          />
          <StatCard 
            icon={<Activity size={20} />} 
            label="Active Ratio" 
            value={stats?.activeRatio ?? "0%"} 
            loading={loadingStats} 
            color="bg-green-50 text-green-500"
          />
          <StatCard 
            icon={<Clock size={20} />} 
            label="Session Hours" 
            value={`${stats?.sessionHours ?? "0"}h`} 
            loading={loadingStats} 
            color="bg-purple-50 text-purple-500"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Upcoming Classes Section (Placeholder for now) */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-8 min-h-[400px] flex flex-col items-center justify-center text-center">
                    <div className="h-20 w-20 bg-gray-50 rounded-full flex items-center justify-center mb-6">
                        <Calendar size={40} className="text-gray-300" />
                    </div>
                    <h3 className="text-lg font-bold text-gray-900">Your Upcoming Classes</h3>
                    <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">This section will list your scheduled classes and allowed check-ins once developed.</p>
                </div>
            </div>

            {/* Staff Feed Section */}
            <div className="flex flex-col gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 flex flex-col h-full max-h-[600px]">
                    <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
                        <MessageSquare size={20} className="text-primary" />
                        Staff Feed
                    </h3>
                    
                    {/* Post Input */}
                    <form onSubmit={handlePost} className="mb-6 relative">
                        <input 
                            type="text"
                            placeholder="Share an update with staff..."
                            value={newPost}
                            onChange={(e) => setNewPost(e.target.value)}
                            className="w-full bg-gray-50 border border-gray-100 rounded-xl px-4 py-3 text-sm pr-12 focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary transition-all"
                        />
                        <button 
                            type="submit"
                            disabled={isPosting || !newPost.trim()}
                            className="absolute right-2 top-1/2 -translate-y-1/2 p-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {isPosting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                        </button>
                    </form>

                    {/* Feed Content */}
                    <div className="flex-1 overflow-y-auto space-y-4 pr-2 -mr-2">
                        {loadingFeed ? (
                             <div className="flex flex-col items-center justify-center h-40 gap-3">
                                <Loader2 size={24} className="animate-spin text-primary" />
                                <p className="text-xs text-gray-400">Loading feed...</p>
                            </div>
                        ) : feed.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-sm text-gray-400">No messages yet. Be the first to post!</p>
                            </div>
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
                                        <p className="text-xs text-gray-600 leading-relaxed mt-1.5 break-words font-medium">
                                            {post.content}
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
      </div>
    </InstructorLayout>
  );
}

function StatCard({ icon, label, value, loading, color }: { 
  icon: React.ReactNode; 
  label: string; 
  value: string | number; 
  loading: boolean;
  color: string;
}) {
  return (
    <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm transition-all hover:shadow-md grow">
      <div className="flex items-center gap-4">
        <div className={`h-10 w-10 ${color} rounded-xl flex items-center justify-center shrink-0`}>
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-xs font-bold text-gray-400 uppercase tracking-widest truncate">{label}</p>
          {loading ? (
            <div className="h-6 w-16 bg-gray-100 animate-pulse rounded mt-1" />
          ) : (
            <p className="text-xl font-black text-gray-900 truncate">{value}</p>
          )}
        </div>
      </div>
    </div>
  );
}
