import { Status, Priority } from '../../types';

interface StatusPillProps {
  status: Status;
}

export function StatusPill({ status }: StatusPillProps) {
  const variants: Record<Status, { bg: string; text: string; label: string }> = {
    'backlog': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', label: 'Open' },
    'planned': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400', label: 'Planned' },
    'in-progress': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400', label: 'In Progress' },
    'blocked': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400', label: 'Blocked' },
    'done': { bg: 'bg-green-100 dark:bg-green-900/30', text: 'text-green-700 dark:text-green-400', label: 'Done' },
    'not-started': { bg: 'bg-gray-100 dark:bg-gray-800', text: 'text-gray-700 dark:text-gray-300', label: 'Not Started' },
    'needs-review': { bg: 'bg-teal-100 dark:bg-teal-900/30', text: 'text-teal-700 dark:text-teal-400', label: 'Needs Review' },
  };

  const variant = variants[status];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${variant.bg} ${variant.text}`}>
      {variant.label}
    </span>
  );
}

interface PriorityPillProps {
  priority: Priority;
}

export function PriorityPill({ priority }: PriorityPillProps) {
  const variants: Record<Priority, { bg: string; text: string }> = {
    'low': { bg: 'bg-blue-100 dark:bg-blue-900/30', text: 'text-blue-700 dark:text-blue-400' },
    'medium': { bg: 'bg-yellow-100 dark:bg-yellow-900/30', text: 'text-yellow-700 dark:text-yellow-400' },
    'high': { bg: 'bg-red-100 dark:bg-red-900/30', text: 'text-red-700 dark:text-red-400' },
  };

  const variant = variants[priority];

  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${variant.bg} ${variant.text}`}>
      {priority}
    </span>
  );
}
