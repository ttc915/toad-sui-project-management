import { useState, useEffect } from 'react';
import { X, Sparkles, Flag, Calendar as CalendarIcon, User as UserIcon, Tag, FileText, Layers } from 'lucide-react';
import { Button } from '../ui/Button';
import { Task, User, Priority, Status } from '../../types';
import { mockUsers } from '../../data/mockData';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (task: Partial<Task>) => void;
  defaultColumnId?: string;
}

const spaces = ['Roadmapping', 'Development', 'Strategy', 'Customer Delivery', 'Hiring'];
const workTypes = [
  { value: 'Feature', color: 'from-teal-500 to-teal-600', icon: <Sparkles className="w-4 h-4" /> },
  { value: 'Bug', color: 'from-red-500 to-red-600', icon: <Flag className="w-4 h-4" /> },
  { value: 'Task', color: 'from-blue-500 to-blue-600', icon: <FileText className="w-4 h-4" /> },
  { value: 'Epic', color: 'from-purple-500 to-purple-600', icon: <Layers className="w-4 h-4" /> },
  { value: 'Story', color: 'from-green-500 to-green-600', icon: <FileText className="w-4 h-4" /> },
];

const statuses: Status[] = ['backlog', 'planned', 'in-progress', 'blocked', 'done', 'not-started', 'needs-review'];

const priorityOptions = [
  {
    value: 'low' as Priority,
    label: 'Low',
    color: 'from-blue-400 to-blue-500',
    bg: 'bg-blue-50 dark:bg-blue-900/20',
    border: 'border-blue-300 dark:border-blue-700',
    text: 'text-blue-700 dark:text-blue-400',
    dot: 'bg-blue-500',
  },
  {
    value: 'medium' as Priority,
    label: 'Medium',
    color: 'from-yellow-400 to-yellow-500',
    bg: 'bg-yellow-50 dark:bg-yellow-900/20',
    border: 'border-yellow-300 dark:border-yellow-700',
    text: 'text-yellow-700 dark:text-yellow-400',
    dot: 'bg-yellow-500',
  },
  {
    value: 'high' as Priority,
    label: 'High',
    color: 'from-red-400 to-red-500',
    bg: 'bg-red-50 dark:bg-red-900/20',
    border: 'border-red-300 dark:border-red-700',
    text: 'text-red-700 dark:text-red-400',
    dot: 'bg-red-500',
  },
];

export function AddTaskModal({ isOpen, onClose, onAdd, defaultColumnId }: AddTaskModalProps) {
  const [space, setSpace] = useState(spaces[0]);
  const [workType, setWorkType] = useState(workTypes[0].value);
  const [status, setStatus] = useState<Status>('backlog');
  const [summary, setSummary] = useState('');
  const [description, setDescription] = useState('');
  const [assignee, setAssignee] = useState<User | null>(null);
  const [reporter, setReporter] = useState<User>(mockUsers[0]);
  const [priority, setPriority] = useState<Priority>('medium');
  const [labels, setLabels] = useState('');
  const [dueDate, setDueDate] = useState('');

  useEffect(() => {
    if (defaultColumnId) {
      setStatus(defaultColumnId as Status);
    }
  }, [defaultColumnId]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const newTask: Partial<Task> = {
      title: summary,
      description,
      status,
      priority,
      assignees: assignee ? [assignee] : [],
      tags: [workType, ...labels.split(',').map(l => l.trim()).filter(Boolean)],
      dueDate: dueDate || undefined,
      columnId: status,
      subtasks: [],
    };

    onAdd(newTask);
    handleClose();
  };

  const handleClose = () => {
    setSummary('');
    setDescription('');
    setAssignee(null);
    setLabels('');
    setDueDate('');
    setStatus('backlog');
    onClose();
  };

  const selectedPriority = priorityOptions.find(p => p.value === priority)!;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={handleClose} />
      <div className="relative w-full max-w-3xl max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-card rounded-3xl shadow-2xl m-4">
        <form onSubmit={handleSubmit}>
          <div className="sticky top-0 bg-primary-600 p-6 flex items-center justify-between rounded-t-3xl z-10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center backdrop-blur">
                <Sparkles className="w-5 h-5 text-white" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">Create New Task</h2>
                <p className="text-sm text-white/80">Fill in the details below</p>
              </div>
            </div>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-white/20 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-primary-500" />
                  Space
                </label>
                <select
                  value={space}
                  onChange={(e) => setSpace(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg border-2 border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {spaces.map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <div className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                  Work Type
                </label>
                <div className="grid grid-cols-5 gap-2">
                  {workTypes.map(type => (
                    <button
                      key={type.value}
                      type="button"
                      onClick={() => setWorkType(type.value)}
                      className={`p-2 rounded-lg border-2 transition-all ${
                        workType === type.value
                          ? 'border-primary-600 bg-primary-50 dark:bg-primary-900/20 scale-105'
                          : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                      }`}
                      title={type.value}
                    >
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${type.color} flex items-center justify-center text-white mx-auto`}>
                        {type.icon}
                      </div>
                      <p className="text-xs mt-1 text-gray-600 dark:text-gray-400 truncate">{type.value}</p>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-yellow-500" />
                Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as Status)}
                className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg border-2 border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              >
                {statuses.map(s => (
                  <option key={s} value={s}>{s.replace('-', ' ').toUpperCase()}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500" />
                Summary *
              </label>
              <input
                type="text"
                value={summary}
                onChange={(e) => setSummary(e.target.value)}
                required
                placeholder="Brief task description"
                className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg border-2 border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={4}
                placeholder="Detailed task description"
                className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg border-2 border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent resize-none transition-all"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                <Flag className="w-4 h-4 text-red-500" />
                Priority
              </label>
              <div className="grid grid-cols-3 gap-3">
                {priorityOptions.map(option => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => setPriority(option.value)}
                    className={`relative p-4 rounded-xl border-2 transition-all ${
                      priority === option.value
                        ? `${option.border} ${option.bg} scale-105 shadow-lg`
                        : 'border-gray-200 dark:border-dark-border hover:border-gray-300 dark:hover:border-gray-600'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-3 h-3 rounded-full ${option.dot} animate-pulse`} />
                      <span className={`font-semibold ${priority === option.value ? option.text : 'text-gray-700 dark:text-gray-300'}`}>
                        {option.label}
                      </span>
                    </div>
                    {priority === option.value && (
                      <div className={`absolute top-2 right-2 w-2 h-2 rounded-full bg-gradient-to-r ${option.color}`} />
                    )}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-teal-500" />
                  Assignee
                </label>
                <select
                  value={assignee?.id || ''}
                  onChange={(e) => setAssignee(mockUsers.find(u => u.id === e.target.value) || null)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg border-2 border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  <option value="">Unassigned</option>
                  {mockUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <UserIcon className="w-4 h-4 text-primary-500" />
                  Reporter
                </label>
                <select
                  value={reporter.id}
                  onChange={(e) => setReporter(mockUsers.find(u => u.id === e.target.value) || mockUsers[0])}
                  className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg border-2 border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                >
                  {mockUsers.map(user => (
                    <option key={user.id} value={user.id}>{user.name}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <CalendarIcon className="w-4 h-4 text-yellow-500" />
                  Due Date
                </label>
                <input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg border-2 border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                  <Tag className="w-4 h-4 text-purple-500" />
                  Labels
                </label>
                <input
                  type="text"
                  value={labels}
                  onChange={(e) => setLabels(e.target.value)}
                  placeholder="Comma-separated labels"
                  className="w-full px-4 py-2.5 bg-white dark:bg-dark-bg border-2 border-gray-200 dark:border-dark-border rounded-xl text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent transition-all"
                />
              </div>
            </div>
          </div>

          <div className="sticky bottom-0 bg-white dark:bg-dark-card border-t border-gray-200 dark:border-dark-border p-6 flex justify-between items-center rounded-b-3xl z-10">
            <div className="flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400">
              <div className={`w-2 h-2 rounded-full ${selectedPriority.dot}`} />
              <span>Priority: <span className={selectedPriority.text}>{selectedPriority.label}</span></span>
            </div>
            <div className="flex gap-3">
              <Button type="button" variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button type="submit" className="bg-primary-600 hover:bg-primary-700">
                Create Task
              </Button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
