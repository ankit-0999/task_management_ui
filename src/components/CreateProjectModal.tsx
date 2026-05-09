'use client';

import React from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from './Button';
import { X } from 'lucide-react';

const projectSchema = z.object({
  title: z.string().min(1, 'Project title is required'),
  description: z.string().optional(),
  status: z.enum(['Todo', 'In-Progress', 'Completed', 'On-Hold']).optional(),
  start_date: z.string().optional().nullable(),
  estimation_date: z.string().optional().nullable(),
  closed_date: z.string().optional().nullable(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;

interface CreateProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: ProjectFormData) => Promise<void>;
  initialData?: ProjectFormData;
}

export function CreateProjectModal({ isOpen, onClose, onSubmit, initialData }: CreateProjectModalProps) {
  const { register, handleSubmit, formState: { errors, isSubmitting }, reset } = useForm<ProjectFormData>({
    resolver: zodResolver(projectSchema),
    defaultValues: initialData || { title: '', description: '' },
  });

  React.useEffect(() => {
    if (isOpen) {
      reset(initialData || { 
        title: '', 
        description: '', 
        status: 'Todo',
        start_date: '',
        estimation_date: '',
        closed_date: ''
      });
    }
  }, [isOpen, initialData, reset]);

  if (!isOpen) return null;

  const handleFormSubmit = async (data: ProjectFormData) => {
    await onSubmit(data);
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-2xl overflow-hidden relative animate-in fade-in zoom-in-95 duration-200">
        <div className="flex justify-between items-center p-5 border-b border-gray-100">
          <h2 className="text-xl font-bold text-gray-900">{initialData ? 'Edit Project' : 'Create New Project'}</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 transition-colors bg-gray-50 hover:bg-gray-100 p-2 rounded-full">
            <X className="w-5 h-5" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Project Title *</label>
              <input 
                {...register('title')} 
                className={`w-full px-3 py-2 border rounded-lg outline-none transition-colors ${errors.title ? 'border-red-500 focus:ring-red-500' : 'border-gray-300 focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100'}`} 
                placeholder="E.g., Q3 Marketing"
              />
              {errors.title && <p className="text-red-500 text-xs mt-1">{errors.title.message}</p>}
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea 
                {...register('description')} 
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100 resize-none" 
                placeholder="What is the goal of this project?"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
              <select 
                {...register('status')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100 bg-white"
              >
                <option value="Todo">Todo</option>
                <option value="In-Progress">In Progress</option>
                <option value="Completed">Completed</option>
                <option value="On-Hold">On Hold</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
              <input 
                type="date"
                {...register('start_date')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estimation Date</label>
              <input 
                type="date"
                {...register('estimation_date')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100" 
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Closed Date</label>
              <input 
                type="date"
                {...register('closed_date')} 
                className="w-full px-3 py-2 border border-gray-300 rounded-lg outline-none transition-colors focus:border-[#7199D6] focus:ring-2 focus:ring-blue-100" 
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end gap-3 border-t border-gray-100 mt-5">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" isLoading={isSubmitting} className="bg-[#7199D6] hover:bg-blue-600 text-white border-none">{initialData ? 'Save Changes' : 'Create Project'}</Button>
          </div>
        </form>
      </div>
    </div>
  );
}
