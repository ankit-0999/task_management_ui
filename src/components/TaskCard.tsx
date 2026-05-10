import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

type Status = 'Todo' | 'In-Progress' | 'Completed' | 'Overdue' | 'On-Hold';

export interface Task {
  id?: number | string;
  title: string;
  description?: string;
  assigneeName?: string;
  dueDate: string | null;
  start_date?: string | null;
  estimation_date?: string | null;
  closed_date?: string | null;
  status: Status;
}

interface TaskCardProps {
  task: Task;
  onEdit?: () => void;
  onDelete?: () => void;
}

export function TaskCard({ task, onEdit, onDelete }: TaskCardProps) {
  const statusBackgroundStyles: Record<Status, string> = {
    'Todo': 'bg-gray-50 border-gray-200',
    'In-Progress': 'bg-yellow-50 border-yellow-200',
    'Completed': 'bg-green-50 border-green-200',
    'Overdue': 'bg-red-50 border-red-200',
    'On-Hold': 'bg-orange-50 border-orange-200',
  };

  const statusBadgeStyles: Record<Status, string> = {
    'Todo': 'bg-gray-100 text-gray-800 border-gray-200',
    'In-Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'Overdue': 'bg-red-100 text-red-800 border-red-200',
    'On-Hold': 'bg-orange-100 text-orange-800 border-orange-200',
  };

  const currentBackgroundStyle = statusBackgroundStyles[task.status] || statusBackgroundStyles['Todo'];
  const currentBadgeStyle = statusBadgeStyles[task.status] || statusBadgeStyles['Todo'];

  return (
    <div className={`p-4 rounded-xl border hover:shadow-md transition-shadow relative group flex flex-col gap-3 ${currentBackgroundStyle}`}>
      {/* Header: Title and Delete icon */}
      <div className="flex justify-between items-start gap-2">
        <h3 className="font-medium text-gray-900 text-[15px] leading-snug">
          {task.title}
        </h3>
        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
          {onEdit && (
            <button 
              onClick={onEdit}
              className="p-1.5 text-gray-400 hover:text-blue-500 rounded-md hover:bg-blue-50"
              title="Edit Task"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>
            </button>
          )}
          {onDelete && (
            <button 
              onClick={onDelete}
              className="p-1.5 text-gray-400 hover:text-red-500 rounded-md hover:bg-red-50"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Description */}
      {task.description && (
        <p className="text-gray-500 text-sm line-clamp-2">{task.description}</p>
      )}

      {/* Middle Row: Avatar, Due Date, Status */}
      <div className="flex items-center gap-2 mt-1 flex-wrap">
        {/* Avatar and Name */}
        <div className="flex items-center bg-white border border-gray-200 rounded-full pl-1 pr-3 py-1 shadow-sm" title={task.assigneeName || 'Unassigned'}>
          <div className="w-6 h-6 rounded-full bg-[#938237] text-white flex items-center justify-center text-xs font-semibold mr-2">
            {task.assigneeName ? task.assigneeName.substring(0, 2).toUpperCase() : 'U'}
          </div>
          <span className="text-[13px] font-medium text-gray-700">{task.assigneeName || 'Unassigned'}</span>
        </div>

        {/* Due Date */}
        {task.dueDate && (
          <div className="flex items-center gap-1 border border-gray-200 rounded-md px-2 py-1 text-[13px] font-medium text-red-600 bg-white shadow-sm">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
          </div>
        )}

        {/* Status */}
        <div className={`flex items-center gap-1 border rounded-md px-2 py-1 text-[13px] font-medium shadow-sm ${currentBadgeStyle}`}>
          <div className="w-2 h-2 rounded-full currentColor opacity-70"></div>
          <span>{task.status}</span>
        </div>
      </div>

      {/* Bottom Row: Tags (Dates) */}
      {(task.start_date || task.estimation_date || task.closed_date) && (
        <div className="flex items-center gap-2 mt-1 flex-wrap">
          <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
          </svg>
          {task.start_date && (
            <span className="bg-[#EF4444] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              Started
            </span>
          )}
          {task.estimation_date && (
            <span className="bg-[#0EA5E9] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              Estimated
            </span>
          )}
          {task.closed_date && (
            <span className="bg-[#10B981] text-white text-[11px] font-medium px-2.5 py-0.5 rounded-full">
              Closed
            </span>
          )}
        </div>
      )}
    </div>
  );
}
