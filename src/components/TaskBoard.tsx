'use client';

import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { TaskCard, Task } from './TaskCard';
import { Loader, LoaderSkeleton } from './Loader';
import { ConfirmModal } from './ConfirmModal';
import api from '@/lib/api';

interface TaskBoardProps {
  projectId?: string | number;
  refreshTrigger?: number;
  onEditTask?: (task: Task) => void;
  statusFilter?: string; // ← new
}

export function TaskBoard({ projectId, refreshTrigger = 0, onEditTask, statusFilter }: TaskBoardProps) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [taskToDelete, setTaskToDelete] = useState<string | number | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true);
        setError(null);
        const url = projectId ? `/tasks?project_id=${projectId}` : `/tasks/`;
        const response = await api.get(url);
        setTasks(response.data);
      } catch (err: any) {
        setError(err.response?.data?.detail || 'Failed to fetch tasks.');
      } finally {
        setLoading(false);
      }
    };

    fetchTasks();
  }, [projectId, refreshTrigger]);

  const handleDeleteClick = (taskId: number | string) => {
    setTaskToDelete(taskId);
  };

  const confirmDelete = async () => {
    if (!taskToDelete) return;
    setIsDeleting(true);
    try {
      await api.delete(`/tasks/${taskToDelete}`);
      setTasks(prev => prev.filter(t => t.id !== taskToDelete));
      toast.success('Task deleted successfully');
      setTaskToDelete(null);
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Failed to delete task');
    } finally {
      setIsDeleting(false);
    }
  };

  // ← Filter tasks client-side based on selected status
  const filteredTasks = statusFilter
    ? tasks.filter(task => task.status === statusFilter)
    : tasks;

  if (loading) {
    return (
      <div className="space-y-4">
        <Loader size="md" text="Loading tasks..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 border border-red-200 rounded-lg text-center">
        {error}
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
        </svg>
        <p className="text-gray-500 font-medium">No tasks found.</p>
        <p className="text-gray-400 text-sm mt-1">Create one to get started.</p>
      </div>
    );
  }

  // ← Separate empty state when a filter is active but no tasks match
  if (filteredTasks.length === 0) {
    return (
      <div className="p-12 flex flex-col items-center justify-center bg-gray-50 border-2 border-dashed border-gray-200 rounded-xl">
        <svg className="w-12 h-12 text-gray-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z" />
        </svg>
        <p className="text-gray-500 font-medium">No <span className="font-semibold">{statusFilter}</span> tasks found.</p>
        <p className="text-gray-400 text-sm mt-1">Try selecting a different status filter.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid gap-5 grid-cols-1 md:grid-cols-2 xl:grid-cols-3">
        {filteredTasks.map((task) => (
          <TaskCard
            key={task.id}
            task={task}
            onDelete={() => task.id && handleDeleteClick(task.id)}
            onEdit={onEditTask ? () => onEditTask(task) : undefined}
          />
        ))}
      </div>

      <ConfirmModal
        isOpen={!!taskToDelete}
        onClose={() => setTaskToDelete(null)}
        onConfirm={confirmDelete}
        title="Delete Task"
        message="Are you sure you want to delete this task? This action cannot be undone."
        confirmText="Delete"
        cancelText="Cancel"
        isLoading={isDeleting}
      />
    </>
  );
}