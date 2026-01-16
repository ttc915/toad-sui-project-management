import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { mockTasks } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { StatusPill, PriorityPill } from '../components/ui/StatusPill';
import { AvatarGroup } from '../components/ui/Avatar';
import { TaskModal } from '../components/modals/TaskModal';
import { Badge } from '../components/ui/Badge';
import { Clock } from 'lucide-react';

export function SprintBoardPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const sprintTasks = mockTasks.filter(t =>
    t.status === 'in-progress' || t.status === 'planned' || t.status === 'blocked'
  );

  const completedThisSprint = mockTasks.filter(t => t.status === 'done').length;
  const totalSprint = sprintTasks.length + completedThisSprint;
  const progress = totalSprint > 0 ? Math.round((completedThisSprint / totalSprint) * 100) : 0;

  const selectedTask = mockTasks.find(task => task.id === selectedTaskId);

  return (
    <AppLayout title="Sprint Board" subtitle="Current Sprint - Week 49, 2025" showAddTask>
      <div className="p-6 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Sprint Progress</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{progress}%</div>
            <div className="mt-2 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div
                className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">In Progress</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">
              {sprintTasks.filter(t => t.status === 'in-progress').length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">tasks</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completed</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">{completedThisSprint}</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">tasks</div>
          </Card>

          <Card className="p-6">
            <div className="text-sm text-gray-600 dark:text-gray-400 mb-1">Days Remaining</div>
            <div className="text-3xl font-bold text-gray-900 dark:text-white">3</div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">until sprint end</div>
          </Card>
        </div>

        <Card className="p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Active Sprint Tasks</h2>
          <div className="space-y-3">
            {sprintTasks.map(task => (
              <div
                key={task.id}
                onClick={() => {
                  setSelectedTaskId(task.id);
                  setIsModalOpen(true);
                }}
                className="p-4 border border-gray-200 dark:border-dark-border rounded-xl hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer transition-colors"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-semibold text-gray-900 dark:text-white">{task.title}</h3>
                      <StatusPill status={task.status} />
                      <PriorityPill priority={task.priority} />
                    </div>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{task.description}</p>
                    <div className="flex items-center gap-4 text-sm">
                      {task.assignees.length > 0 && (
                        <div className="flex items-center gap-2">
                          <AvatarGroup users={task.assignees} max={3} />
                        </div>
                      )}
                      {task.dueDate && (
                        <div className="flex items-center gap-1 text-gray-500 dark:text-gray-400">
                          <Clock className="w-4 h-4" />
                          <span>
                            {new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                            })}
                          </span>
                        </div>
                      )}
                      {task.tags.map((tag, i) => (
                        <Badge key={i} variant="gray" size="sm">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
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
