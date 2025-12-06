import { Task } from '../../types';
import { Badge } from '../ui/Badge';
import { AvatarGroup } from '../ui/Avatar';
import { Calendar, Target, Zap, Shield } from 'lucide-react';
import { Card } from '../ui/Card';

interface TaskCardProps {
  task: Task;
  onClick?: () => void;
  onDragStart?: (e: React.DragEvent, taskId: string) => void;
}

export function TaskCard({ task, onClick, onDragStart }: TaskCardProps) {
  const priorityColors = {
    low: 'blue',
    medium: 'yellow',
    high: 'red',
  } as const;

  const completedSubtasks = task.subtasks.filter(s => s.completed).length;
  const totalSubtasks = task.subtasks.length;

  return (
    <Card
      hover
      onClick={onClick}
      className="p-4 mb-3 cursor-move"
      draggable={!!onDragStart}
      onDragStart={(e) => onDragStart?.(e, task.id)}
    >
      <div className="flex items-start justify-between mb-2">
        <Badge variant="teal" size="sm">
          {task.tags[0] || 'Task'}
        </Badge>
        {task.suiObjectId && (
          <div title="On Sui">
            <Shield className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
          </div>
        )}
      </div>

      <h3 className="font-semibold text-gray-900 dark:text-white mb-2 line-clamp-2">
        {task.title}
      </h3>

      {task.description && (
        <p className="text-sm text-gray-600 dark:text-gray-400 mb-3 line-clamp-2">
          {task.description}
        </p>
      )}

      <div className="flex flex-wrap gap-2 mb-3">
        {task.objective && task.objective !== 'No Objective' && (
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Target className="w-3 h-3" />
            <span>{task.objective}</span>
          </div>
        )}
        {task.effort && task.effort !== 'No Effort' && (
          <div className="flex items-center gap-1 text-xs text-gray-600 dark:text-gray-400">
            <Zap className="w-3 h-3" />
            <span>{task.effort}</span>
          </div>
        )}
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          {task.assignees.length > 0 && (
            <AvatarGroup users={task.assignees} max={2} />
          )}
          {task.dueDate && (
            <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
              <Calendar className="w-3 h-3" />
              <span>{new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>
            </div>
          )}
        </div>

        {totalSubtasks > 0 && (
          <div className="text-xs text-gray-500 dark:text-gray-400">
            {completedSubtasks}/{totalSubtasks}
          </div>
        )}

        <Badge variant={priorityColors[task.priority]} size="sm">
          {task.priority}
        </Badge>
      </div>
    </Card>
  );
}
