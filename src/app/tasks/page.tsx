'use client';

import React from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { TaskBoard } from '@/components/TaskBoard';

export default function MyTasksPage() {
  return (
    <DashboardLayout userName="Ankit">
      <div className="max-w-7xl mx-auto space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7199D6] to-indigo-600 mb-2">
              My Assigned Tasks
            </h1>
            <p className="text-gray-500 font-medium">View all tasks assigned directly to you.</p>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
          {/* For the demo, we show tasks from Project 1. In a real app we'd filter by assignee_id */}
          <TaskBoard projectId={1} />
        </div>
      </div>
    </DashboardLayout>
  );
}
