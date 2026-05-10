'use client';

import React from 'react';
import { X, Calendar, FileText, User, Tag } from 'lucide-react';
import { Button } from './Button';

interface Task {
  id?: number | string;
  title: string;
  description?: string;
  assigneeName?: string;
  dueDate: string | null;
  start_date?: string | null;
  estimation_date?: string | null;
  closed_date?: string | null;
  status: 'Todo' | 'In-Progress' | 'Completed' | 'Overdue' | 'On-Hold';
}

interface TaskViewModalProps {
  isOpen: boolean;
  task: Task | null;
  onClose: () => void;
  onEdit: (task: Task) => void;
}

export function TaskViewModal({ isOpen, task, onClose, onEdit }: TaskViewModalProps) {
  if (!isOpen || !task) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'In-Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Overdue':
        return 'bg-red-50 text-red-700 border-red-200';
      case 'On-Hold':
        return 'bg-orange-50 text-orange-700 border-orange-200';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-2xl shadow-xl max-w-md w-full mx-4 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="sticky top-0 flex items-center justify-between p-6 border-b border-gray-200 bg-white/95 backdrop-blur-sm">
          <h2 className="text-xl font-bold text-gray-950">Task Details</h2>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-lg hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 space-y-6">
          {/* Title */}
          <div>
            <h3 className="text-2xl font-bold text-gray-950 mb-3">{task.title}</h3>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(task.status)}`}>
              {task.status}
            </div>
          </div>

          {/* Description */}
          {task.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Description</label>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{task.description}</p>
            </div>
          )}

          {/* Assignee */}
          {task.assigneeName && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <User className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Assigned To</label>
              </div>
              <div className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <div className="w-8 h-8 rounded-full bg-[#7199D6] text-white flex items-center justify-center text-sm font-bold">
                  {task.assigneeName.substring(0, 2).toUpperCase()}
                </div>
                <span className="text-sm font-medium text-gray-700">{task.assigneeName}</span>
              </div>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-3">
            {task.dueDate && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-red-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Due Date</span>
                </div>
                <p className="text-sm text-red-600 font-medium">
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {task.start_date && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Start Date</span>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  {new Date(task.start_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {task.closed_date && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Closed Date</span>
                </div>
                <p className="text-sm text-green-700 font-medium">
                  {new Date(task.closed_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}
          </div>

          {/* Action Button */}
          <Button 
            className="w-full"
            onClick={() => {
              onEdit(task);
              onClose();
            }}
          >
            Edit Task
          </Button>
        </div>
      </div>
    </div>
  );
}
