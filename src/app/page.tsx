'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Loader } from '@/components/Loader';
import { FolderKanban, CheckSquare, CheckCircle2, TrendingUp, AlertCircle, Sparkles, ArrowUpRight, Clock3 } from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip } from 'recharts';
import api from '@/lib/api';
import { getStoredUserName } from '@/lib/auth';

interface DashboardStats {
  total_tasks?: number;
  todo_tasks?: number;
  in_progress_tasks?: number;
  completed_tasks?: number;
  overdue_tasks?: number;
  total_projects?: number;
  active_projects?: number;
  completed_projects?: number;
  team_members?: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    total_tasks: 0,
    completed_tasks: 0,
    in_progress_tasks: 0,
    todo_tasks: 0,
    overdue_tasks: 0,
    total_projects: 0,
    active_projects: 0,
    completed_projects: 0,
    team_members: 0,
  });
  const [loading, setLoading] = useState(true);
  const [userRole, setUserRole] = useState<'Admin' | 'Member' | null>(null);
  const [userName, setUserName] = useState('User');

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        const storedName = getStoredUserName();
        if (storedName) {
          setUserName(storedName);
        }

        // Get current user info from token or local storage
        const token = localStorage.getItem('token');
        if (!token) {
          console.error('No token found');
          return;
        }

        // Decode token to get user role (assuming standard JWT structure)
        const tokenParts = token.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          // Get name if available
          if (payload.name) {
            setUserName(payload.name);
            localStorage.setItem('user_name', payload.name);
          }
        }

        // Try to fetch from member endpoint first, fall back to admin if it fails
        let dashboardRes;
        try {
          dashboardRes = await api.get('/dashboard/member');
          setUserRole('Member');
        } catch {
          try {
            dashboardRes = await api.get('/dashboard/admin');
            setUserRole('Admin');
          } catch (err) {
            console.error('Failed to fetch dashboard data', err);
            setLoading(false);
            return;
          }
        }

        const data = dashboardRes.data;
        setStats(data.stats || {
          total_tasks: 0,
          todo_tasks: 0,
          in_progress_tasks: 0,
          completed_tasks: 0,
          overdue_tasks: 0,
          total_projects: 0,
          active_projects: 0,
          completed_projects: 0,
        });
      } catch (err) {
        console.error('Failed to fetch dashboard data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  const getCompletionPercentage = () => {
    const total = stats.total_tasks || 0;
    const completed = stats.completed_tasks || 0;
    if (total === 0) return 0;
    return Math.round((completed / total) * 100);
  };

  if (loading) {
    return (
      <DashboardLayout userName={userName}>
        <div className="flex items-center justify-center h-[60vh]">
          <Loader size="lg" text="Loading dashboard..." />
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName={userName}>
      <div className="relative max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
        <div className="pointer-events-none absolute -top-10 right-8 h-36 w-36 rounded-full bg-[#7199D6]/10 blur-3xl" />
        <div className="pointer-events-none absolute top-36 left-0 h-44 w-44 rounded-full bg-indigo-400/10 blur-3xl" />

        {/* Header Section */}
        <div className="relative overflow-hidden rounded-[28px] border border-white/70 bg-white/80 backdrop-blur-xl p-6 shadow-[0_12px_40px_rgba(15,23,42,0.06)]">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(113,153,214,0.12),transparent_32%),radial-gradient(circle_at_bottom_left,rgba(129,140,248,0.10),transparent_26%)]" />
          <div className="relative flex flex-col gap-5 lg:flex-row lg:items-end lg:justify-between">
            <div className="max-w-2xl space-y-3">
              <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50/80 px-3 py-1 text-xs font-semibold text-[#4f76b0]">
                <Sparkles className="h-3.5 w-3.5" />
                {userRole === 'Member' ? 'Member workspace' : 'Admin workspace'}
              </div>
              <div>
                <h1 className="text-3xl sm:text-4xl font-black tracking-tight text-gray-950">
                  {userRole === 'Member' ? 'Your task control center' : 'Project operations dashboard'}
                </h1>
                <p className="mt-3 max-w-xl text-sm sm:text-base leading-7 text-gray-600">
                  {userRole === 'Member'
                    ? 'Keep track of assigned work, see what is moving, and stay focused on completion.'
                    : 'Review project health, task distribution, and team throughput from one clear view.'
                  }
                </p>
              </div>
            </div>

          </div>
        </div>

        {/* Top Stats Grid - Role Specific */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="group bg-white/85 backdrop-blur-sm p-6 rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white/70 flex items-center gap-4 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(113,153,214,0.14)] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white shadow-lg shadow-blue-200/60">
              <FolderKanban className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h3 className="text-3xl font-black text-gray-950 leading-none">{stats.total_projects}</h3>
                <span className="rounded-full bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-600">+ overview</span>
              </div>
            </div>
          </div>
          
          <div className="group bg-white/85 backdrop-blur-sm p-6 rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white/70 flex items-center gap-4 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(129,140,248,0.14)] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white shadow-lg shadow-indigo-200/60">
              <CheckSquare className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h3 className="text-3xl font-black text-gray-950 leading-none">{stats.total_tasks}</h3>
                <span className="rounded-full bg-indigo-50 px-2.5 py-1 text-xs font-semibold text-indigo-600">all work</span>
              </div>
            </div>
          </div>

          <div className="group bg-white/85 backdrop-blur-sm p-6 rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white/70 flex items-center gap-4 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(34,197,94,0.14)] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-emerald-500 to-green-600 flex items-center justify-center text-white shadow-lg shadow-emerald-200/60">
              <CheckCircle2 className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h3 className="text-3xl font-black text-gray-950 leading-none">{stats.completed_tasks}</h3>
                <span className="rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-600">done</span>
              </div>
            </div>
          </div>

          <div className="group bg-white/85 backdrop-blur-sm p-6 rounded-[24px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white/70 flex items-center gap-4 hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(248,113,113,0.14)] transition-all">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-rose-500 to-red-500 flex items-center justify-center text-white shadow-lg shadow-red-200/60">
              <AlertCircle className="w-7 h-7" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
              <div className="mt-1 flex items-end justify-between gap-3">
                <h3 className="text-3xl font-black text-gray-950 leading-none">{stats.overdue_tasks}</h3>
                <span className="rounded-full bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-600">watch</span>
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Progress Overview - 2 cols (40%) */}
          <div className="lg:col-span-2 bg-white/85 backdrop-blur-sm p-6 rounded-[28px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white/70">
            <div className="flex items-center justify-between gap-4 mb-6">
              <div className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-[#7199D6]" />
                <h2 className="text-xl font-bold text-gray-950">Task Progress</h2>
              </div>
              <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-semibold text-gray-600">
                Live summary
              </span>
            </div>
            
            <div className="flex flex-col items-center justify-center gap-5 py-8">
              <div className="w-full h-64 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Completed', value: getCompletionPercentage() },
                        { name: 'Remaining', value: 100 - getCompletionPercentage() }
                      ]}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      startAngle={180}
                      endAngle={0}
                      dataKey="value"
                      label={false}
                    >
                      <Cell fill="#3b82f6" />
                      <Cell fill="#2336cc" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
              
              {/* Center Text Overlay */}
              <div className="flex flex-col items-center -mt-32 relative z-10 mb-12">
                <span className="block text-5xl font-black text-gray-950">{getCompletionPercentage()}%</span>
                <p className="mt-1 text-sm font-medium text-gray-500">Completed</p>
              </div>

              <p className="max-w-sm text-center text-sm text-gray-500">
                {stats.total_tasks === 0
                  ? 'Add tasks to see progress and status trends appear here.'
                  : 'A quick glance at overall delivery health and completion pace.'
                }
              </p>
            </div>
          </div>

          {/* Status Distribution - 3 cols (60%) */}
          <div className="lg:col-span-3 bg-white/85 backdrop-blur-sm p-6 rounded-[28px] shadow-[0_10px_30px_rgba(15,23,42,0.06)] border border-white/70">
            <div className="flex items-center justify-between gap-4 mb-6">
              <h2 className="text-xl font-bold text-gray-950">Task Status Distribution</h2>
              <div className="inline-flex items-center gap-2 rounded-full border border-gray-200 bg-white px-3 py-1 text-xs font-semibold text-gray-600 shadow-sm">
                <Clock3 className="h-3.5 w-3.5" />
                All Tasks
              </div>
            </div>
            
            <div className="w-full h-80 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={[
                    { name: 'Todo', value: stats.todo_tasks || 0, fill: '#3b82f6' },
                    { name: 'In Progress', value: stats.in_progress_tasks || 0, fill: '#f59e0b' },
                    { name: 'Completed', value: stats.completed_tasks || 0, fill: '#10b981' },
                    { name: 'Overdue', value: stats.overdue_tasks || 0, fill: '#ef4444' }
                  ]}
                  margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                >
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    tick={{ fill: '#6b7280', fontSize: 12, fontWeight: 500 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    tick={{ fill: '#6b7280', fontSize: 12 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <Tooltip 
                    contentStyle={{
                      backgroundColor: '#fff',
                      border: '1px solid #e5e7eb',
                      borderRadius: '12px',
                      boxShadow: '0 4px 12px rgba(15, 23, 42, 0.1)',
                      padding: '12px'
                    }}
                    labelStyle={{ color: '#1f2937', fontWeight: 600 }}
                    cursor={{ fill: 'rgba(113, 153, 214, 0.1)' }}
                  />
                  <Bar 
                    dataKey="value" 
                    radius={[12, 12, 0, 0]}
                    isAnimationActive={true}
                  >
                    {[
                      { name: 'Todo', fill: '#3b82f6' },
                      { name: 'In Progress', fill: '#f59e0b' },
                      { name: 'Completed', fill: '#10b981' },
                      { name: 'Overdue', fill: '#ef4444' }
                    ].map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.fill} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>

            {/* Legend */}
            <div className="grid grid-cols-4 gap-4 mt-6 pt-6 border-t border-gray-200/70">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-blue-500"></div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Todo</p>
                  <p className="text-lg font-bold text-gray-950">{stats.todo_tasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-amber-400"></div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">In Progress</p>
                  <p className="text-lg font-bold text-gray-950">{stats.in_progress_tasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-green-500"></div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Completed</p>
                  <p className="text-lg font-bold text-gray-950">{stats.completed_tasks}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded bg-red-500"></div>
                <div>
                  <p className="text-xs font-medium text-gray-500 uppercase">Overdue</p>
                  <p className="text-lg font-bold text-gray-950">{stats.overdue_tasks}</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-[28px] border border-white/70 bg-white/80 backdrop-blur-xl px-6 py-5 shadow-[0_10px_30px_rgba(15,23,42,0.06)]">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="text-lg font-bold text-gray-950">Boost your productivity</h3>
              <p className="text-sm text-gray-600">Create tasks, set priorities, and keep your team moving with a cleaner workflow.</p>
            </div>
            <div className="flex items-center gap-3">
              <div className="hidden sm:flex items-center gap-2 rounded-2xl bg-blue-50 px-4 py-3 text-sm font-medium text-[#4f76b0]">
                <ArrowUpRight className="h-4 w-4" />
                Stay on top of priorities
              </div>
              <button className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-[#7199D6] to-indigo-600 px-5 py-3 text-sm font-semibold text-white shadow-lg shadow-blue-200/50 transition-transform hover:-translate-y-0.5">
                <CheckSquare className="h-4 w-4" />
                New Task
              </button>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
