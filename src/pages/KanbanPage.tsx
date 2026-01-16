import { useState, useMemo, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppLayout } from '../components/layout/AppLayout';
import { BoardColumn } from '../components/kanban/BoardColumn';
import { TaskModal } from '../components/modals/TaskModal';
import { AddTaskModal } from '../components/modals/AddTaskModal';
import { useSearch } from '../context/SearchContext';
import { useTasks } from '../context/TaskContext';
import { Task } from '../types';
import { mockUsers } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Shield } from 'lucide-react';

export function KanbanPage() {
  const [selectedTaskId, setSelectedTaskId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [defaultColumnId, setDefaultColumnId] = useState<string>('backlog');
  const { tasks, addTask, moveTask, currentBoard, columns, loadBoardById, members } = useTasks();
  const { searchQuery } = useSearch();
  const [searchParams] = useSearchParams();

  useEffect(() => {
    const boardParam = searchParams.get('board');
    if (boardParam) {
      loadBoardById(boardParam).catch((e) => console.warn('Failed to load board by id', e));
    }
  }, [searchParams, loadBoardById]);

  if (!currentBoard) {
    return <div className="p-6 text-gray-600">Loading board...</div>;
  }

  const boardTasks = tasks.filter(t => t.boardId === currentBoard.id);

  const handleTaskClick = (taskId: string) => {
    setSelectedTaskId(taskId);
    setIsModalOpen(true);
  };

  const handleAddTaskClick = (columnId?: string) => {
    if (columnId) {
      setDefaultColumnId(columnId);
    }
    setIsAddTaskOpen(true);
  };

  const handleAddTask = (newTask: Partial<Task>) => {
    const task = {
      title: newTask.title || '',
      description: newTask.description || '',
      status: newTask.status || 'backlog',
      priority: newTask.priority || 'medium',
      assignees: newTask.assignees || [],
      tags: newTask.tags || [],
      columnId: newTask.columnId || defaultColumnId,
      boardId: currentBoard.id,
      subtasks: [],
      comments: [],
      dueDate: newTask.dueDate,
      objective: newTask.objective || 'No Objective',
      effort: newTask.effort || 'No Effort',
    };
    addTask(task);
    setIsAddTaskOpen(false);
  };

  const handleDragStart = (e: React.DragEvent, taskId: string) => {
    e.dataTransfer.setData('taskId', taskId);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  };

  const handleDrop = (e: React.DragEvent, targetColumnId: string) => {
    e.preventDefault();
    const taskId = e.dataTransfer.getData('taskId');
    if (taskId) {
      moveTask(taskId, targetColumnId);
    }
  };

  const filteredColumns = useMemo(() => {
    const cols = columns.length > 0 ? columns : [];
    if (!searchQuery) {
      return cols.map(col => ({
        ...col,
        tasks: boardTasks.filter(t => t.columnId === col.id),
      }));
    }

    const query = searchQuery.toLowerCase();
    return cols.map(col => ({
      ...col,
      tasks: boardTasks.filter(
        t =>
          t.columnId === col.id &&
          (t.title.toLowerCase().includes(query) ||
            t.description.toLowerCase().includes(query) ||
            t.tags.some(tag => tag.toLowerCase().includes(query)))
      ),
    }));
  }, [boardTasks, searchQuery, columns]);

  const selectedTask = tasks.find(task => task.id === selectedTaskId);

  return (
    <AppLayout
      title={currentBoard.name}
      subtitle={currentBoard.description}
      showAddTask
      onAddTask={() => handleAddTaskClick()}
    >
      <div className="p-4 md:p-6 space-y-6">
        {/* Team members strip */}
        <Card className="p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield className="w-4 h-4 text-primary-600" />
            <span className="text-sm font-semibold text-gray-900 dark:text-white">Team Members</span>
          </div>
          <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
            {(members.length > 0
              ? members
              : mockUsers.map((u, idx) => ({ address: u.email, role: idx === 0 ? 3 : 2 }))
            )
              .sort((a, b) => (a.role === 3 ? -1 : b.role === 3 ? 1 : 0))
              .map((member, idx) => (
              <div
                key={`${member.address}-${idx}`}
                className="min-w-[200px] flex items-center gap-3 px-3 py-2 rounded-lg border border-gray-200 dark:border-dark-border bg-white dark:bg-dark-card"
              >
                <Avatar user={mockUsers[idx % mockUsers.length]} size="sm" />
                <div className="truncate">
                  <div className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                    {mockUsers[idx % mockUsers.length].name}
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
                    {member.address}
                  </div>
                  <div className="text-xs text-primary-600 dark:text-primary-400">
                    {idx === 0
                      ? 'Board Manager'
                      : member.role === 3
                        ? 'Admin'
                        : member.role === 2
                          ? 'Manager'
                          : 'Member'}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>

        <div className="flex gap-4 md:gap-6 overflow-x-auto pb-6 scrollbar-hide">
          {filteredColumns.map(column => (
            <BoardColumn
              key={column.id}
              column={column}
              onTaskClick={handleTaskClick}
              onAddTask={handleAddTaskClick}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            />
          ))}
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

      {isAddTaskOpen && (
        <AddTaskModal
          isOpen={isAddTaskOpen}
          onClose={() => setIsAddTaskOpen(false)}
          onAdd={handleAddTask}
          defaultColumnId={defaultColumnId}
        />
      )}
    </AppLayout>
  );
}
