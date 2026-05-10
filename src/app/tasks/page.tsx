'use client';

import React, { useState, useEffect } from 'react';
import toast from 'react-hot-toast';
import { DashboardLayout } from '@/components/DashboardLayout';
import { Loader } from '@/components/Loader';
import { TaskBoard } from '@/components/TaskBoard';
import { Button } from '@/components/Button';
import { Plus } from 'lucide-react';
import { CreateTaskModal, TaskFormData } from '@/components/CreateTaskModal';
import api from '@/lib/api';
import { getStoredUserRole, getStoredUserName, UserRole } from '@/lib/auth';

export default function MyTasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const displayName = getStoredUserName() || 'User';

  useEffect(() => {
    setUserRole(getStoredUserRole());
  }, []);

  const handleCreateOrEditTask = async (data: TaskFormData) => {
    try {
      if (editingTask) {
        await api.put(`/tasks/${editingTask.id}`, data);
        toast.success('Task updated successfully!');
      } else {
        await api.post('/tasks/', data);
        toast.success('Task created successfully!');
      }
      setRefreshTrigger(prev => prev + 1);
      setEditingTask(null);
      setIsModalOpen(false);
    } catch (error: any) {
      console.error("Failed to save task", error);
      toast.error(error.response?.data?.detail || "Failed to save task");
      throw error; 
    }
  };

  const openCreateModal = () => {
    setEditingTask(null);
    setIsModalOpen(true);
  };

  const openEditModal = (task: any) => {
    // Format dates to yyyy-mm-dd for date input fields
    const formatDate = (dateString: string | null | undefined) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

    // Normalize status - handle different enum formats
    const normalizeStatus = (status: string) => {
      const statusMap: Record<string, string> = {
        'TODO': 'Todo',
        'IN_PROGRESS': 'In-Progress',
        'COMPLETED': 'Completed',
        'OVERDUE': 'Overdue',
        'ON_HOLD': 'On-Hold',
      };
      return statusMap[status.toUpperCase()] || status;
    };

    setEditingTask({
      ...task,
      project_id: task.project_id ? String(task.project_id) : '',
      assignee_id: task.assignee_id ? String(task.assignee_id) : '',
      status: normalizeStatus(task.status),
      start_date: formatDate(task.start_date),
      estimation_date: formatDate(task.estimation_date),
      closed_date: formatDate(task.closed_date),
    });
    setIsModalOpen(true);
  };

  return (
    <DashboardLayout userName={displayName}>
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Member Info Banner */}
        {userRole === 'Member' && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-start gap-3">
            <div className="w-5 h-5 bg-blue-500 rounded-full flex-shrink-0 mt-0.5"></div>
            <div>
              <h3 className="font-semibold text-blue-900">Member Access</h3>
              <p className="text-sm text-blue-800">You can only update the status of your assigned tasks. Only admins can create new tasks.</p>
            </div>
          </div>
        )}

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
          <div>
            <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-[#7199D6] to-indigo-600 mb-2">
              My Assigned Tasks
            </h1>
            <p className="text-gray-500 font-medium">View all tasks assigned directly to you.</p>
          </div>
          <div className="mt-4 sm:mt-0 flex gap-3 w-full sm:w-auto">
            {userRole === 'Admin' && (
              <Button 
                variant="primary" 
                onClick={openCreateModal}
                className="flex-1 sm:flex-none bg-gradient-to-r from-[#7199D6] to-indigo-600 hover:from-blue-600 hover:to-indigo-700 shadow-md border-none"
              >
                <Plus className="w-5 h-5 mr-1" />
                New Task
              </Button>
            )}
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
          {/* Omitting projectId to fetch all tasks assigned to the user */}
          <TaskBoard refreshTrigger={refreshTrigger} onEditTask={openEditModal} />
        </div>
      </div>

      <CreateTaskModal 
        isOpen={isModalOpen} 
        onClose={() => {
          setIsModalOpen(false);
          setEditingTask(null);
        }} 
        onSubmit={handleCreateOrEditTask}
        initialData={editingTask}
      />
    </DashboardLayout>
  );
}
