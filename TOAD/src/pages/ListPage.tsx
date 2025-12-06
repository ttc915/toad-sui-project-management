import { useState, useMemo } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { StatusPill, PriorityPill } from '../components/ui/StatusPill';
import { AvatarGroup } from '../components/ui/Avatar';
import { TaskModal } from '../components/modals/TaskModal';
import { Badge } from '../components/ui/Badge';
import { Shield } from 'lucide-react';
import { Task } from '../types';
import { useSearch } from '../context/SearchContext';
import { useTasks } from '../context/TaskContext';

export function ListPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { tasks, addTask } = useTasks();
  const { searchQuery } = useSearch();

  const handleTaskClick = (task: Task) => {
    setSelectedTaskId(task.id);
    setIsModalOpen(true);
  };

  const handleAddTask = (newTask: Partial<Task>) => {
    const task = {
      title: newTask.title || '',
      description: newTask.description || '',
      status: newTask.status || 'backlog',
      priority: newTask.priority || 'medium',
      assignees: newTask.assignees || [],
      tags: newTask.tags || [],
      columnId: newTask.columnId || 'backlog',
      subtasks: [],
      dueDate: newTask.dueDate,
      objective: newTask.objective || 'No Objective',
      effort: newTask.effort || 'No Effort',
    };
    addTask(task);
  };

  const filteredTasks = useMemo(() => {
    if (!searchQuery) return tasks;

    const query = searchQuery.toLowerCase();
    return tasks.filter(
      t =>
        t.title.toLowerCase().includes(query) ||
        t.description.toLowerCase().includes(query) ||
        t.tags.some(tag => tag.toLowerCase().includes(query))
    );
  }, [tasks, searchQuery]);

  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  const onChainTasksCount = tasks.filter(t => t.suiObjectId).length;

  return (
    <AppLayout
      title="All Tasks"
      subtitle={`${onChainTasksCount} tasks in progress on Sui`}
      showAddTask
      onAddTask={handleAddTask}
    >
      <div className="p-4 md:p-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 dark:bg-gray-900/50 border-b border-gray-200 dark:border-dark-border">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Task Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    Assignee
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase tracking-wider">
                    On-chain
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {filteredTasks.map(task => (
                  <tr
                    key={task.id}
                    onClick={() => handleTaskClick(task)}
                    className="hover:bg-gray-50 dark:hover:bg-gray-900/30 cursor-pointer transition-colors"
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {task.title}
                          </div>
                          {task.tags.length > 0 && (
                            <div className="flex gap-1 mt-1">
                              {task.tags.slice(0, 2).map((tag, i) => (
                                <Badge key={i} variant="gray" size="sm">{tag}</Badge>
                              ))}
                            </div>
                          )}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <StatusPill status={task.status} />
                    </td>
                    <td className="px-6 py-4">
                      <PriorityPill priority={task.priority} />
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-gray-700 dark:text-gray-300">
                        {task.dueDate
                          ? new Date(task.dueDate).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              year: 'numeric',
                            })
                          : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {task.assignees.length > 0 ? (
                        <AvatarGroup users={task.assignees} max={3} />
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {task.suiObjectId ? (
                        <div className="flex items-center gap-2">
                          <Shield className="w-4 h-4 text-teal-600 dark:text-teal-400" />
                          <span className="text-xs text-teal-600 dark:text-teal-400 font-medium">
                            On Sui
                          </span>
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
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
