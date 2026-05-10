'use client';

import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './Button';
import { X } from 'lucide-react';
import api from '@/lib/api';

const taskSchema = z.object({
  title: z.string().min(1, 'Task title is required'),
  description: z.string().optional(),
  start_date: z.string().optional().nullable(),
  estimation_date: z.string().optional().nullable(),
  closed_date: z.string().optional().nullable(),
  status: z.enum(['Todo', 'In-Progress', 'Completed', 'Overdue', 'On-Hold']),
  assignee_id: z.string().optional(),
  project_id: z.string().min(1, 'Project is required'),
});

export type TaskFormData = z.infer<typeof taskSchema>;

interface CreateTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: TaskFormData) => Promise<void>;
  initialData?: TaskFormData & { projectName?: string };
  userRole?: string | null; // ← new
}

export function CreateTaskModal({ isOpen, onClose, onSubmit, initialData, userRole }: CreateTaskModalProps) {
  const [users, setUsers] = useState<{id: string, name: string}[]>([]);
  const [projects, setProjects] = useState<{id: string, title: string}[]>([]);

  const isMember = userRole === 'Member';

  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<TaskFormData>({
    resolver: zodResolver(taskSchema),
    defaultValues: {
      status: 'Todo',
      title: '',
      description: '',
      project_id: '',
      assignee_id: '',
      start_date: '',
      estimation_date: '',
      closed_date: ''
    }
  });

  useEffect(() => {
    if (!isOpen) return;

    const fetchAndReset = async () => {
      try {
        const [usersRes, projectsRes] = await Promise.all([
          api.get('/users/'),
          api.get('/projects/'),
        ]);
        setUsers(usersRes.data);
        setProjects(projectsRes.data);
      } catch (err) {
        console.error(err);
      } finally {
        reset(initialData || {
          status: 'Todo',
          title: '',
          description: '',
          project_id: '',
          assignee_id: '',
          start_date: '',
          estimation_date: '',
          closed_date: ''
        });
      }
    };

    fetchAndReset();
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: TaskFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  // Shared read-only styles for Member view
  const readOnlyInputClass = "w-full px-3 py-2 border border-gray-200 rounded-lg bg-gray-50 text-gray-500 cursor-not-allowed";
  const editableInputClass = (hasError?: boolean) =>
    `w-full px-3 py-2 border rounded-lg outline-none transition-colors ${
      hasError ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100'
    }`;

  // Helper: find label by id for read-only display
  const getProjectName = (id: string) => {
    if (initialData?.projectName) return initialData.projectName;
    return projects.find(p => p.id === id)?.title || id || '—';
  };
  const getUserName = (id: string) => users.find(u => u.id === id)?.name || 'Unassigned';
  const formatDate = (val: string | null | undefined) => val || '—';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Task' : 'Create New Task'}</h2>
            {isMember && (
              <p className="text-xs text-amber-600 font-medium mt-0.5">You can only update the status of this task.</p>
            )}
          </div>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

            {/* Task Title */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Task Title *</label>
              {isMember ? (
                <input readOnly value={initialData?.title || ''} className={readOnlyInputClass} />
              ) : (
                <>
                  <input
                    {...register('title')}
                    className={editableInputClass(!!errors.title)}
                    placeholder="E.g., Design Landing Page"
                  />
                  {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
                </>
              )}
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              {isMember ? (
                <textarea readOnly value={initialData?.description || ''} rows={2} className={`${readOnlyInputClass} resize-none`} />
              ) : (
                <textarea
                  {...register('description')}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100 resize-none"
                  placeholder="Add more details..."
                />
              )}
            </div>

            {/* Project */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Project *</label>
              {isMember ? (
                <input readOnly value={getProjectName(initialData?.project_id || '')} className={readOnlyInputClass} />
              ) : (
                <>
                  <select
                    {...register('project_id')}
                    className={`${editableInputClass(!!errors.project_id)} bg-white`}
                  >
                    <option value="">Select a project</option>
                    {projects.map(p => (
                      <option key={p.id} value={p.id}>{p.title}</option>
                    ))}
                  </select>
                  {errors.project_id && <p className="text-red-500 text-xs mt-1">{errors.project_id.message}</p>}
                </>
              )}
            </div>

            {/* Assign To */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Assign To</label>
              {isMember ? (
                <input readOnly value={getUserName(initialData?.assignee_id || '')} className={readOnlyInputClass} />
              ) : (
                <select
                  {...register('assignee_id')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100 bg-white"
                >
                  <option value="">Unassigned</option>
                  {users.map(u => (
                    <option key={u.id} value={u.id}>{u.name}</option>
                  ))}
                </select>
              )}
            </div>

            {/* Status — always editable */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Status {isMember && <span className="text-amber-500 text-xs font-normal">(editable)</span>}
              </label>
              <select
                {...register('status')}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="Todo">Todo</option>
                <option value="In-Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="Overdue">Overdue</option>
                <option value="On-Hold">On Hold</option>
              </select>
            </div>

            {/* Start Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              {isMember ? (
                <input readOnly value={formatDate(initialData?.start_date)} className={readOnlyInputClass} />
              ) : (
                <input
                  type="date"
                  {...register('start_date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100"
                />
              )}
            </div>

            {/* Estimation Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimation Date</label>
              {isMember ? (
                <input readOnly value={formatDate(initialData?.estimation_date)} className={readOnlyInputClass} />
              ) : (
                <input
                  type="date"
                  {...register('estimation_date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100"
                />
              )}
            </div>

            {/* Closed Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closed Date</label>
              {isMember ? (
                <input readOnly value={formatDate(initialData?.closed_date)} className={readOnlyInputClass} />
              ) : (
                <input
                  type="date"
                  {...register('closed_date')}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100"
                />
              )}
            </div>

          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-5">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-[#7199D6] hover:bg-blue-600 text-white border-none">
              {initialData ? 'Save Changes' : 'Create Task'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}