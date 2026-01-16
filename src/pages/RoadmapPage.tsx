import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { mockTasks } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Badge } from '../components/ui/Badge';
import { AvatarGroup } from '../components/ui/Avatar';
import { TaskModal } from '../components/modals/TaskModal';
import { ChevronRight } from 'lucide-react';

const quarters = [
  {
    id: 'q4-2025',
    name: 'Q4 2025',
    period: 'Oct - Dec 2025',
    status: 'current',
  },
  {
    id: 'q1-2026',
    name: 'Q1 2026',
    period: 'Jan - Mar 2026',
    status: 'planned',
  },
  {
    id: 'q2-2026',
    name: 'Q2 2026',
    period: 'Apr - Jun 2026',
    status: 'future',
  },
];

export function RoadmapPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const getTasksForQuarter = (quarterId: string) => {
    if (quarterId === 'q4-2025') {
      return mockTasks.filter(t => t.status === 'in-progress' || t.status === 'done');
    } else if (quarterId === 'q1-2026') {
      return mockTasks.filter(t => t.status === 'planned');
    } else {
      return mockTasks.filter(t => t.status === 'backlog').slice(0, 3);
    }
  };

  const selectedTask = mockTasks.find(task => task.id === selectedTaskId);

  return (
    <AppLayout title="Features Roadmap" subtitle="Product development timeline" showAddTask>
      <div className="p-6 space-y-6">
        {quarters.map(quarter => {
          const quarterTasks = getTasksForQuarter(quarter.id);
          return (
            <Card key={quarter.id} className="p-6">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <div className="flex items-center gap-3">
                    <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{quarter.name}</h2>
                    {quarter.status === 'current' && (
                      <Badge variant="teal">Current</Badge>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{quarter.period}</p>
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  {quarterTasks.length} initiatives
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {quarterTasks.map(task => (
                  <div
                    key={task.id}
                    onClick={() => {
                      setSelectedTaskId(task.id);
                      setIsModalOpen(true);
                    }}
                    className="p-4 border-2 border-gray-200 dark:border-dark-border rounded-xl hover:border-primary-300 dark:hover:border-primary-700 cursor-pointer transition-all group"
                  >
                    <div className="flex items-start justify-between mb-3">
                      <Badge variant="teal" size="sm">
                        {task.tags[0] || 'Feature'}
                      </Badge>
                      <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-600 transition-colors" />
                    </div>
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-2 group-hover:text-primary-600 dark:group-hover:text-primary-400 transition-colors">
                      {task.title}
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 line-clamp-2">
                      {task.description}
                    </p>
                    {task.assignees.length > 0 && (
                      <div className="flex items-center justify-between">
                        <AvatarGroup users={task.assignees} max={3} />
                        {task.effort && (
                          <span className="text-xs text-gray-500 dark:text-gray-400">{task.effort}</span>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </Card>
          );
        })}
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
