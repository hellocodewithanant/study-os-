import React from 'react';
import { Priority, TaskStatus, TaskCategory, DeadlineType } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'purple';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'default',
  size = 'md',
  className = ''
}) => {
  const variantStyles = {
    default: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/40 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800/50',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/40 dark:text-amber-400 border-amber-200 dark:border-amber-800/50',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/40 dark:text-rose-400 border-rose-200 dark:border-rose-800/50',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400 border-blue-200 dark:border-blue-800/50',
    purple: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400 border-indigo-200 dark:border-indigo-800/50'
  };

  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 rounded-md font-medium',
    md: 'text-xs px-2.5 py-1 rounded-md font-medium'
  };

  return (
    <span
      className={`inline-flex items-center gap-1 border border-transparent ${variantStyles[variant]} ${sizeStyles[size]} ${className}`}
    >
      {children}
    </span>
  );
};

export const PriorityBadge: React.FC<{ priority: Priority; size?: 'sm' | 'md' }> = ({ priority, size = 'sm' }) => {
  switch (priority) {
    case 'High':
      return <Badge variant="danger" size={size}>High Priority</Badge>;
    case 'Medium':
      return <Badge variant="warning" size={size}>Medium</Badge>;
    case 'Low':
      return <Badge variant="default" size={size}>Low</Badge>;
  }
};

export const StatusBadge: React.FC<{ status: TaskStatus | 'Pending' | 'In Progress' | 'Completed'; size?: 'sm' | 'md' }> = ({
  status,
  size = 'sm'
}) => {
  switch (status) {
    case 'Completed':
      return <Badge variant="success" size={size}>Completed</Badge>;
    case 'In Progress':
      return <Badge variant="purple" size={size}>In Progress</Badge>;
    case 'Pending':
      return <Badge variant="default" size={size}>Pending</Badge>;
  }
};

export const CategoryBadge: React.FC<{ category: TaskCategory | DeadlineType; size?: 'sm' | 'md' }> = ({
  category,
  size = 'sm'
}) => {
  return (
    <Badge variant="info" size={size}>
      {category}
    </Badge>
  );
};
