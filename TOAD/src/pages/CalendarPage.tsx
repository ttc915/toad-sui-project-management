import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { mockTasks } from '../data/mockData';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { Badge } from '../components/ui/Badge';
import { TaskModal } from '../components/modals/TaskModal';

export function CalendarPage() {
  const [currentDate, setCurrentDate] = useState(new Date(2025, 11, 1));
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1).getDay();

  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  const days = [];
  for (let i = 0; i < firstDayOfMonth; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const getTasksForDay = (day: number) => {
    return mockTasks.filter(task => {
      if (!task.dueDate) return false;
      const taskDate = new Date(task.dueDate);
      return (
        taskDate.getDate() === day &&
        taskDate.getMonth() === currentDate.getMonth() &&
        taskDate.getFullYear() === currentDate.getFullYear()
      );
    });
  };

  const handlePrevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1));
  };

  const selectedTask = mockTasks.find(task => task.id === selectedTaskId);

  return (
    <AppLayout title="Calendar View" subtitle="Task scheduling and deadlines">
      <div className="p-6">
        <div className="bg-white dark:bg-dark-card rounded-2xl shadow-card dark:shadow-card-dark border border-transparent dark:border-dark-border p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">{monthName}</h2>
            <div className="flex gap-2">
              <button
                onClick={handlePrevMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronLeft className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
              <button
                onClick={handleNextMonth}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
              >
                <ChevronRight className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              </button>
            </div>
          </div>

          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
              <div key={day} className="text-center text-sm font-semibold text-gray-600 dark:text-gray-400 py-2">
                {day}
              </div>
            ))}

            {days.map((day, index) => {
              const tasks = day ? getTasksForDay(day) : [];
              return (
                <div
                  key={index}
                  className={`min-h-24 p-2 rounded-lg border ${
                    day
                      ? 'bg-white dark:bg-dark-bg border-gray-200 dark:border-dark-border'
                      : 'bg-gray-50 dark:bg-gray-900/30 border-transparent'
                  }`}
                >
                  {day && (
                    <>
                      <div className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                        {day}
                      </div>
                      <div className="space-y-1">
                        {tasks.slice(0, 3).map(task => (
                          <button
                            key={task.id}
                            onClick={() => {
                              setSelectedTaskId(task.id);
                              setIsModalOpen(true);
                            }}
                            className="w-full text-left"
                          >
                            <Badge
                              variant={
                                task.priority === 'high'
                                  ? 'red'
                                  : task.priority === 'medium'
                                  ? 'yellow'
                                  : 'blue'
                              }
                              size="sm"
                              className="truncate block"
                            >
                              {task.title.length > 15 ? task.title.substring(0, 15) + '...' : task.title}
                            </Badge>
                          </button>
                        ))}
                        {tasks.length > 3 && (
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            +{tasks.length - 3} more
                          </div>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
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
