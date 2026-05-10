'use client';

import React from 'react';
import { X, Calendar, FileText, Tag } from 'lucide-react';
import { Button } from './Button';

interface Project {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'In-Progress' | 'Completed' | 'On-Hold';
  start_date: string | null;
  estimation_date: string | null;
  closed_date: string | null;
}

interface ProjectViewModalProps {
  isOpen: boolean;
  project: Project | null;
  onClose: () => void;
  onViewBoard: (projectId: string) => void;
}

export function ProjectViewModal({ isOpen, project, onClose, onViewBoard }: ProjectViewModalProps) {
  if (!isOpen || !project) return null;

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'In-Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200';
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
          <h2 className="text-xl font-bold text-gray-950">Project Details</h2>
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
            <h3 className="text-2xl font-bold text-gray-950 mb-2">{project.title}</h3>
            <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(project.status)}`}>
              {project.status}
            </div>
          </div>

          {/* Description */}
          {project.description && (
            <div>
              <div className="flex items-center gap-2 mb-2">
                <FileText className="w-4 h-4 text-gray-400" />
                <label className="text-sm font-semibold text-gray-600 uppercase tracking-wide">Description</label>
              </div>
              <p className="text-gray-600 text-sm leading-relaxed">{project.description}</p>
            </div>
          )}

          {/* Dates */}
          <div className="space-y-3">
            {project.start_date && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Start Date</span>
                </div>
                <p className="text-sm text-gray-700 font-medium">
                  {new Date(project.start_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {project.estimation_date && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-blue-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Due Date</span>
                </div>
                <p className="text-sm text-blue-700 font-medium">
                  {new Date(project.estimation_date).toLocaleDateString('en-US', {
                    weekday: 'short',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
              </div>
            )}

            {project.closed_date && (
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Calendar className="w-4 h-4 text-green-400" />
                  <span className="text-xs font-semibold text-gray-500 uppercase">Closed Date</span>
                </div>
                <p className="text-sm text-green-700 font-medium">
                  {new Date(project.closed_date).toLocaleDateString('en-US', {
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
              onViewBoard(project.id);
              onClose();
            }}
          >
            View Board
          </Button>
        </div>
      </div>
    </div>
  );
}
