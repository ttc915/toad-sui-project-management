import { useState, useEffect } from 'react';
import { X, CheckCircle2, Circle, ExternalLink, MessageSquare, Clock, Send } from 'lucide-react';
import { Task } from '../../types';
import { StatusPill, PriorityPill } from '../ui/StatusPill';
import { AvatarGroup } from '../ui/Avatar';
import { Button } from '../ui/Button';
import { Badge } from '../ui/Badge';
import { useTasks } from '../../context/TaskContext';
import { mockUsers } from '../../data/mockData';

interface TaskModalProps {
  task: Task;
  isOpen: boolean;
  onClose: () => void;
}

export function TaskModal({ task, isOpen, onClose }: TaskModalProps) {
  const [subtasks, setSubtasks] = useState(task.subtasks);
  const [commentText, setCommentText] = useState('');
  const { updateTask, addComment } = useTasks();

  useEffect(() => {
    setSubtasks(task.subtasks);
  }, [task.subtasks]);

  if (!isOpen) return null;

  const toggleSubtask = (subtaskId: string) => {
    const updatedSubtasks = subtasks.map(s =>
      s.id === subtaskId ? { ...s, completed: !s.completed } : s
    );
    setSubtasks(updatedSubtasks);
    updateTask(task.id, { subtasks: updatedSubtasks });
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (commentText.trim()) {
      addComment(task.id, {
        text: commentText.trim(),
        author: mockUsers[0],
      });
      setCommentText('');
    }
  };

  const formatRelativeTime = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
    return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  };

  const completedCount = subtasks.filter(s => s.completed).length;
  const progress = subtasks.length > 0 ? (completedCount / subtasks.length) * 100 : 0;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white dark:bg-dark-card rounded-3xl shadow-2xl m-4">
        <div className="sticky top-0 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border p-6 flex items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              {task.title}
            </h2>
            <div className="flex items-center gap-3 flex-wrap">
              <StatusPill status={task.status} />
              <PriorityPill priority={task.priority} />
              {task.tags.map((tag, i) => (
                <Badge key={i} variant="teal">{tag}</Badge>
              ))}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Description</h3>
            <p className="text-gray-700 dark:text-gray-300">
              {task.description || 'No description provided.'}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Assignees</h4>
              {task.assignees.length > 0 ? (
                <AvatarGroup users={task.assignees} max={5} />
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">Unassigned</p>
              )}
            </div>
            {task.dueDate && (
              <div>
                <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Due Date</h4>
                <div className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-300">
                  <Clock className="w-4 h-4" />
                  {new Date(task.dueDate).toLocaleDateString('en-US', {
                    month: 'long',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </div>
              </div>
            )}
          </div>

          {subtasks.length > 0 && (
            <div>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                  Subtasks ({completedCount}/{subtasks.length})
                </h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">{Math.round(progress)}%</span>
              </div>
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 mb-4">
                <div
                  className="bg-teal-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <div className="space-y-2">
                {subtasks.map(subtask => (
                  <button
                    key={subtask.id}
                    onClick={() => toggleSubtask(subtask.id)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors text-left"
                  >
                    {subtask.completed ? (
                      <CheckCircle2 className="w-5 h-5 text-teal-600 flex-shrink-0" />
                    ) : (
                      <Circle className="w-5 h-5 text-gray-400 flex-shrink-0" />
                    )}
                    <span className={`flex-1 ${subtask.completed ? 'text-gray-500 dark:text-gray-400 line-through' : 'text-gray-900 dark:text-white'}`}>
                      {subtask.title}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {task.suiObjectId && (
            <div className="bg-gradient-to-br from-primary-50 to-teal-50 dark:from-primary-900/20 dark:to-teal-900/20 rounded-2xl p-6 border border-primary-200 dark:border-primary-800">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <div className="w-6 h-6 rounded-lg bg-gradient-to-br from-primary-600 to-teal-600 flex items-center justify-center text-white text-xs font-bold">
                  S
                </div>
                Sui Blockchain
              </h3>
              <div className="space-y-3">
                <div>
                  <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">On-chain Task ID</p>
                  <p className="text-sm font-mono text-gray-900 dark:text-white">{task.suiObjectId}</p>
                </div>
                {task.suiTxHash && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">Last Transaction Digest</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{task.suiTxHash}</p>
                  </div>
                )}
                {task.suiOwner && (
                  <div>
                    <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">On-chain Owner</p>
                    <p className="text-sm font-mono text-gray-900 dark:text-white">{task.suiOwner}</p>
                  </div>
                )}
                {task.suiObjectId && (
                  <a
                    href={`https://suiscan.xyz/testnet/object/${task.suiObjectId}/tx-blocks`}
                    target="_blank"
                    rel="noreferrer"
                    className="w-full"
                  >
                    <Button
                      variant="secondary"
                      size="sm"
                      className="w-full flex items-center justify-center gap-2 mt-2"
                    >
                      View on Sui Explorer
                      <ExternalLink className="w-3 h-3" />
                    </Button>
                  </a>
                )}
              </div>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
              <MessageSquare className="w-4 h-4" />
              Comments ({task.comments?.length || 0})
            </h3>
            <div className="space-y-4">
              {task.comments && task.comments.length > 0 ? (
                <div className="space-y-3">
                  {task.comments.map(comment => (
                    <div key={comment.id} className="flex gap-3">
                      {comment.author.avatar ? (
                        <img
                          src={comment.author.avatar}
                          alt={comment.author.name}
                          className="w-8 h-8 rounded-full flex-shrink-0"
                        />
                      ) : (
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex-shrink-0 flex items-center justify-center text-white text-sm font-medium">
                          {comment.author.name.charAt(0)}
                        </div>
                      )}
                      <div className="flex-1">
                        <div className="flex items-baseline gap-2">
                          <span className="font-medium text-sm text-gray-900 dark:text-white">
                            {comment.author.name}
                          </span>
                          <span className="text-xs text-gray-500 dark:text-gray-400">
                            {formatRelativeTime(comment.createdAt)}
                          </span>
                        </div>
                        <p className="text-sm text-gray-700 dark:text-gray-300 mt-1">
                          {comment.text}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">No comments yet. Be the first to comment!</p>
              )}
              <form onSubmit={handleAddComment} className="flex gap-2">
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg text-sm text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-primary-600 hover:bg-primary-700 disabled:bg-gray-300 dark:disabled:bg-gray-700 text-white rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
