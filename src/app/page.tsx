'use client';

import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { FolderKanban, CheckSquare, Clock, CheckCircle2, TrendingUp, AlertCircle } from 'lucide-react';
import api from '@/lib/api';

export default function Dashboard() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    totalTasks: 0,
    completedTasks: 0,
    inProgressTasks: 0,
    todoTasks: 0,
    overdueTasks: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        const [projectsRes, tasksRes] = await Promise.all([
          api.get('/projects/'),
          api.get('/tasks/') // Fetch all tasks
        ]);

        const projects = projectsRes.data;
        const tasks = tasksRes.data;

        let completed = 0;
        let inProgress = 0;
        let todo = 0;
        let overdue = 0;

        tasks.forEach((task: any) => {
          if (task.status === 'Completed') completed++;
          else if (task.status === 'In-Progress') inProgress++;
          else if (task.status === 'Overdue') overdue++;
          else todo++;
        });

        setStats({
          totalProjects: projects.length,
          totalTasks: tasks.length,
          completedTasks: completed,
          inProgressTasks: inProgress,
          todoTasks: todo,
          overdueTasks: overdue,
        });
      } catch (err) {
        console.error('Failed to fetch analytics', err);
      } finally {
        setLoading(false);
      }
    };
    fetchAnalytics();
  }, []);

  const getCompletionPercentage = () => {
    if (stats.totalTasks === 0) return 0;
    return Math.round((stats.completedTasks / stats.totalTasks) * 100);
  };

  if (loading) {
    return (
      <DashboardLayout userName="Admin">
        <div className="flex items-center justify-center h-[60vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#7199D6]"></div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout userName="Admin">
      <div className="max-w-7xl mx-auto space-y-6 animate-in fade-in zoom-in-95 duration-500">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7199D6] to-indigo-600 mb-2">
            Overview Dashboard
          </h1>
          <p className="text-gray-500 font-medium">Analytics and necessary data about your projects and tasks.</p>
        </div>

        {/* Top Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-blue-50 flex items-center justify-center">
              <FolderKanban className="w-7 h-7 text-[#7199D6]" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Projects</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalProjects}</h3>
            </div>
          </div>
          
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-indigo-50 flex items-center justify-center">
              <CheckSquare className="w-7 h-7 text-indigo-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Total Tasks</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.totalTasks}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-green-50 flex items-center justify-center">
              <CheckCircle2 className="w-7 h-7 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Completed</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.completedTasks}</h3>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center gap-4 hover:shadow-md transition-shadow">
            <div className="w-14 h-14 rounded-full bg-red-50 flex items-center justify-center">
              <AlertCircle className="w-7 h-7 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Overdue Tasks</p>
              <h3 className="text-2xl font-bold text-gray-900">{stats.overdueTasks}</h3>
            </div>
          </div>
        </div>

        {/* Detailed Analytics Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Progress Overview */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-[#7199D6]" />
              <h2 className="text-xl font-bold text-gray-900">Task Progress</h2>
            </div>
            
            <div className="flex items-center justify-center py-6">
              <div className="relative w-48 h-48 flex items-center justify-center rounded-full border-8 border-gray-50">
                <div className="absolute inset-0 rounded-full border-8 border-[#7199D6] opacity-20"></div>
                {/* A simplified CSS circle representation since we can't use complex charts here easily */}
                <div 
                  className="absolute inset-0 rounded-full border-8 border-[#7199D6]" 
                  style={{ clipPath: `polygon(0 0, 100% 0, 100% ${getCompletionPercentage()}%, 0 ${getCompletionPercentage()}%)` }}
                ></div>
                <div className="text-center z-10">
                  <span className="text-4xl font-extrabold text-gray-900">{getCompletionPercentage()}%</span>
                  <p className="text-sm text-gray-500 font-medium">Completed</p>
                </div>
              </div>
            </div>
          </div>

          {/* Status Distribution */}
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Task Status Distribution</h2>
            
            <div className="space-y-5">
              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-blue-500"></div> Todo
                  </span>
                  <span className="text-sm font-bold text-gray-900">{stats.todoTasks}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-blue-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.totalTasks ? (stats.todoTasks / stats.totalTasks) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-orange-400"></div> In Progress
                  </span>
                  <span className="text-sm font-bold text-gray-900">{stats.inProgressTasks}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-orange-400 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.totalTasks ? (stats.inProgressTasks / stats.totalTasks) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-green-500"></div> Completed
                  </span>
                  <span className="text-sm font-bold text-gray-900">{stats.completedTasks}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-green-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.totalTasks ? (stats.completedTasks / stats.totalTasks) * 100 : 0}%` }}></div>
                </div>
              </div>

              <div>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium text-gray-700 flex items-center gap-2">
                    <div className="w-2.5 h-2.5 rounded-full bg-red-500"></div> Overdue
                  </span>
                  <span className="text-sm font-bold text-gray-900">{stats.overdueTasks}</span>
                </div>
                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div className="bg-red-500 h-2 rounded-full transition-all duration-1000" style={{ width: `${stats.totalTasks ? (stats.overdueTasks / stats.totalTasks) * 100 : 0}%` }}></div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </DashboardLayout>
  );
}
