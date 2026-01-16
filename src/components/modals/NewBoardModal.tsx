import { useState } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';
import { Button } from '../ui/Button';
import { useTasks } from '../../context/TaskContext';
import { useNavigate } from 'react-router-dom';

interface NewBoardModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function NewBoardModal({ isOpen, onClose }: NewBoardModalProps) {
  const [boardName, setBoardName] = useState('');
  const [description, setDescription] = useState('');
  const [members, setMembers] = useState('');
  const { addBoard } = useTasks();
  const navigate = useNavigate();

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const memberList = members
      .split(',')
      .map(m => m.trim())
      .filter(Boolean);
    addBoard({
      name: boardName,
      description,
      members: memberList,
    });
    handleClose();
    navigate('/app/kanban');
  };

  const handleClose = () => {
    setBoardName('');
    setDescription('');
    setMembers('');
    onClose();
  };

  return createPortal(
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={handleClose} />
      <div className="relative w-full max-w-lg bg-white dark:bg-dark-card rounded-3xl shadow-2xl m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Create New Board</h2>
            <button
              type="button"
              onClick={handleClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Board Name *
              </label>
              <input
                type="text"
                value={boardName}
                onChange={(e) => setBoardName(e.target.value)}
                required
                placeholder="e.g., Q1 Product Development"
                className="w-full px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="What is this board for?"
                className="w-full px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Team Members (wallet addresses, comma separated)
              </label>
              <textarea
                value={members}
                onChange={(e) => setMembers(e.target.value)}
                rows={2}
                placeholder="0xabc..., 0xdef..."
                className="w-full px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500 resize-none"
              />
            </div>

          </div>

          <div className="p-6 border-t border-gray-200 dark:border-dark-border flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={handleClose}>
              Cancel
            </Button>
            <Button type="submit">
              Create Board
            </Button>
          </div>
        </form>
      </div>
    </div>,
    document.body,
  );
}
