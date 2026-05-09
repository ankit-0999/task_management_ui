import React from 'react';
import { Calendar, Trash2 } from 'lucide-react';
import { StatusBadge } from './StatusBadge';

type Status = 'Todo' | 'In-Progress' | 'Completed' | 'Overdue';

export interface Task {
  id?: number | string;
  title: string;
  description?: string;
  assigneeName?: string;
  dueDate: string | null;
  status: Status;
}

interface TaskCardProps {
  task: Task;
  onDelete?: () => void;
}

export function TaskCard({ task, onDelete }: TaskCardProps) {
  const statusStyles: Record<Status, string> = {
    'Todo': 'bg-gray-100 text-gray-800 border-gray-200',
    'In-Progress': 'bg-yellow-100 text-yellow-800 border-yellow-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'Overdue': 'bg-red-100 text-red-800 border-red-200',
  };

  const currentStyle = statusStyles[task.status] || statusStyles['Todo'];

  return (
    <div className="bg-white p-5 rounded-xl border border-gray-200 hover:shadow-md transition-shadow relative group">
      <div className="flex justify-between items-start mb-3">
        <h3 className="font-semibold text-gray-900 pr-16 line-clamp-2 leading-tight">
          {task.title}
        </h3>
        <div className="absolute top-5 right-5 flex items-center gap-2">
          {onDelete && (
            <button 
              onClick={onDelete}
              className="opacity-0 group-hover:opacity-100 transition-opacity p-1 text-gray-400 hover:text-red-500 rounded hover:bg-red-50"
              title="Delete Task"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
          <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${currentStyle}`}>
            {task.status}
          </span>
        </div>
      </div>
      
      {task.description && (
        <p className="text-gray-500 text-sm line-clamp-2 mb-4">{task.description}</p>
      )}
      
      <div className="flex justify-between items-center mt-4 pt-4 border-t border-gray-50">
        <div className="flex items-center">
          <div className="w-6 h-6 rounded-full bg-gradient-to-r from-[#7199D6] to-blue-500 flex items-center justify-center text-white text-xs font-bold mr-2">
            {task.assigneeName ? task.assigneeName.charAt(0).toUpperCase() : 'U'}
          </div>
          <span className="text-sm text-gray-600">{task.assigneeName || 'Unassigned'}</span>
        </div>
        
        {task.dueDate && (
          <div className="flex items-center text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded border border-gray-100">
            <Calendar className="w-3 h-3 mr-1 text-gray-400" />
            {new Date(task.dueDate).toLocaleDateString()}
          </div>
        )}
      </div>
    </div>
  );
}
