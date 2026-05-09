import React from 'react';

type Status = 'Todo' | 'In-Progress' | 'Completed' | 'Overdue';

interface StatusBadgeProps {
  status: Status;
  className?: string;
}

export function StatusBadge({ status, className = '' }: StatusBadgeProps) {
  const statusStyles: Record<Status, string> = {
    'Todo': 'bg-gray-100 text-gray-800 border-gray-200',
    'In-Progress': 'bg-blue-100 text-blue-800 border-blue-200',
    'Completed': 'bg-green-100 text-green-800 border-green-200',
    'Overdue': 'bg-red-100 text-red-800 border-red-200',
  };

  const style = statusStyles[status] || statusStyles['Todo'];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${style} ${className}`}>
      {status}
    </span>
  );
}
