import { Plus, MoreHorizontal } from 'lucide-react';
import { Column } from '../../types';
import { TaskCard } from './TaskCard';
import { Badge } from '../ui/Badge';

interface BoardColumnProps {
  column: Column;
  onTaskClick: (taskId: string) => void;
  onAddTask?: (columnId: string) => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
  onDragOver?: (e: React.DragEvent) => void;
  onDrop?: (e: React.DragEvent, columnId: string) => void;
}

export function BoardColumn({ column, onTaskClick, onAddTask, onDragStart, onDragOver, onDrop }: BoardColumnProps) {
  const colorVariants = {
    gray: 'bg-gray-900 dark:bg-gray-700',
    blue: 'bg-primary-600 dark:bg-primary-700',
    yellow: 'bg-yellow-600 dark:bg-yellow-700',
    red: 'bg-red-600 dark:bg-red-700',
    green: 'bg-green-600 dark:bg-green-700',
  } as const;

  const badgeVariants = {
    gray: 'gray',
    blue: 'blue',
    yellow: 'yellow',
    red: 'red',
    green: 'green',
  } as const;

  return (
    <div
      className="flex-shrink-0 w-80"
      onDragOver={onDragOver}
      onDrop={(e) => onDrop?.(e, column.id)}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-2 h-2 rounded-full ${colorVariants[column.color as keyof typeof colorVariants] || colorVariants.gray}`} />
          <h3 className="font-semibold text-gray-900 dark:text-white">
            {column.title}
          </h3>
          <Badge variant={badgeVariants[column.color as keyof typeof badgeVariants] || 'gray'} size="sm">
            {column.tasks.length}
          </Badge>
        </div>
        <button className="p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded transition-colors">
          <MoreHorizontal className="w-4 h-4 text-gray-400" />
        </button>
      </div>

      <div className="space-y-3 mb-3 min-h-[100px]">
        {column.tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            onClick={() => onTaskClick(task.id)}
            onDragStart={onDragStart}
          />
        ))}
      </div>

      <button
        onClick={() => onAddTask?.(column.id)}
        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-2xl text-sm font-medium text-gray-500 dark:text-gray-400 hover:border-gray-400 dark:hover:border-gray-600 hover:text-gray-700 dark:hover:text-gray-300 transition-colors flex items-center justify-center gap-2"
      >
        <Plus className="w-4 h-4" />
        Add task
      </button>
    </div>
  );
}
