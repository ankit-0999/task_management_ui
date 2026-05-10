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

const STATUS_FILTERS = [
  { label: 'All', value: 'all' },
  { label: 'Todo', value: 'Todo' },
  { label: 'In Progress', value: 'In-Progress' },
  { label: 'Completed', value: 'Completed' },
  { label: 'Overdue', value: 'Overdue' },
  { label: 'On Hold', value: 'On-Hold' },
];

const STATUS_STYLES: Record<string, string> = {
  all: 'bg-gray-100 text-gray-700 border-gray-300',
  Todo: 'bg-blue-50 text-blue-700 border-blue-300',
  'In-Progress': 'bg-yellow-50 text-yellow-700 border-yellow-300',
  Completed: 'bg-green-50 text-green-700 border-green-300',
  Overdue: 'bg-red-50 text-red-700 border-red-300',
  'On-Hold': 'bg-purple-50 text-purple-700 border-purple-300',
};

const STATUS_ACTIVE_STYLES: Record<string, string> = {
  all: 'bg-gray-700 text-white border-gray-700',
  Todo: 'bg-blue-600 text-white border-blue-600',
  'In-Progress': 'bg-yellow-500 text-white border-yellow-500',
  Completed: 'bg-green-600 text-white border-green-600',
  Overdue: 'bg-red-600 text-white border-red-600',
  'On-Hold': 'bg-purple-600 text-white border-purple-600',
};

export default function MyTasksPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<any>(null);
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [userRole, setUserRole] = useState<UserRole | null>(null);
  const [activeFilter, setActiveFilter] = useState('all');
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
    const formatDate = (dateString: string | null | undefined) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toISOString().split('T')[0];
    };

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

        {/* Header */}
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

        {/* Status Filter Bar */}
        <div className="bg-white px-6 py-4 rounded-2xl shadow-sm border border-gray-100">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold text-gray-500 mr-2">Filter by Status:</span>
            {STATUS_FILTERS.map((filter) => {
              const isActive = activeFilter === filter.value;
              return (
                <button
                  key={filter.value}
                  onClick={() => setActiveFilter(filter.value)}
                  className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150
                    ${isActive
                      ? STATUS_ACTIVE_STYLES[filter.value]
                      : `${STATUS_STYLES[filter.value]} hover:opacity-80`
                    }`}
                >
                  {filter.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Task Board */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 min-h-[500px]">
          <TaskBoard
            refreshTrigger={refreshTrigger}
            onEditTask={openEditModal}
            statusFilter={activeFilter === 'all' ? undefined : activeFilter}
          />
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
        userRole={userRole}  // ← add this
      />
    </DashboardLayout>
  );
}