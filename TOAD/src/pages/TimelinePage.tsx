import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { mockTasks } from '../data/mockData';
import { TaskModal } from '../components/modals/TaskModal';
import { PriorityPill } from '../components/ui/StatusPill';

export function TimelinePage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const tasksWithDates = mockTasks.filter(task => task.dueDate).sort((a, b) => {
    return new Date(a.dueDate!).getTime() - new Date(b.dueDate!).getTime();
  });

  const selectedTask = mockTasks.find(task => task.id === selectedTaskId);

  const getBarColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'bg-red-500';
      case 'medium': return 'bg-yellow-500';
      case 'low': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <AppLayout title="Timeline View" subtitle="Gantt-style project timeline">
      <div className="p-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <div className="min-w-[1200px] p-6">
              <div className="space-y-4">
                {tasksWithDates.map(task => {
                  const dueDate = new Date(task.dueDate!);
                  const today = new Date();
                  const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
                  const isOverdue = daysUntilDue < 0;
                  const barWidth = Math.min(Math.max(Math.abs(daysUntilDue) * 8, 60), 400);

                  return (
                    <div
                      key={task.id}
                      className="flex items-center gap-4 group cursor-pointer"
                      onClick={() => {
                        setSelectedTaskId(task.id);
                        setIsModalOpen(true);
                      }}
                    >
                      <div className="w-64 flex-shrink-0">
                        <h3 className="font-medium text-gray-900 dark:text-white group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                          {task.title}
                        </h3>
                        <div className="flex items-center gap-2 mt-1">
                          <PriorityPill priority={task.priority} />
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {task.assignees[0]?.name || 'Unassigned'}
                          </span>
                        </div>
                      </div>

                      <div className="flex-1 relative">
                        <div className="h-8 bg-gray-100 dark:bg-gray-800 rounded-lg relative overflow-hidden">
                          <div
                            className={`h-full rounded-lg ${getBarColor(task.priority)} ${
                              isOverdue ? 'opacity-50' : ''
                            } transition-all duration-300 group-hover:opacity-80 flex items-center px-3`}
                            style={{ width: `${barWidth}px` }}
                          >
                            <span className="text-xs font-medium text-white truncate">
                              {task.title}
                            </span>
                          </div>
                        </div>
                        <div className="absolute -bottom-5 left-0 text-xs text-gray-500 dark:text-gray-400">
                          {dueDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                          {isOverdue && <span className="text-red-500 ml-1">(overdue)</span>}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>

      {selectedTask && (
        <TaskModal
          task={selectedTask}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedTaskId(null);
          }}
        />
      )}
    </AppLayout>
  );
}
