import { useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { mockUsers } from '../data/mockData';
import { Card } from '../components/ui/Card';
import { Avatar } from '../components/ui/Avatar';
import { Mail, Calendar, Briefcase, Users } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { Button } from '../components/ui/Button';

export function TeamPage() {
  const { currentBoard, addMember } = useTasks();
  const [wallet, setWallet] = useState('');
  const [role, setRole] = useState('1'); // 1 = team member
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBoard) {
      setError('No board selected');
      return;
    }
    setError(null);
    setMessage(null);
    try {
      await addMember(currentBoard.id, wallet.trim(), parseInt(role, 10));
      setMessage('Member added successfully');
      setWallet('');
    } catch (err: any) {
      setError(err?.message || 'Failed to add member');
    }
  };

  return (
    <AppLayout title="Team Members" subtitle="Manage your team and their roles">
      <div className="p-4 md:p-6 space-y-6">
        <Card className="p-4 flex flex-col gap-3">
          <div className="flex items-center gap-2 text-gray-900 dark:text-white font-semibold">
            <Users className="w-5 h-5" />
            Add Team Member by Wallet Address
          </div>
          <form className="grid grid-cols-1 md:grid-cols-3 gap-3" onSubmit={handleAdd}>
            <input
              type="text"
              value={wallet}
              onChange={(e) => setWallet(e.target.value)}
              placeholder="0x... wallet address"
              required
              className="w-full px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
            >
              <option value="1">Team Member</option>
              <option value="2">Manager</option>
              <option value="3">Admin</option>
            </select>
            <Button type="submit" className="justify-center">Add Member</Button>
          </form>
          {message && <div className="text-sm text-green-600 dark:text-green-400">{message}</div>}
          {error && <div className="text-sm text-red-600 dark:text-red-400">{error}</div>}
          {!currentBoard && (
            <div className="text-sm text-amber-600 dark:text-amber-400">
              Select or create a board first to add members.
            </div>
          )}
        </Card>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 md:gap-6">
          {mockUsers.map(user => (
            <Card key={user.id} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex flex-col items-center text-center">
                <Avatar user={user} size="lg" className="mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1">
                  {user.name}
                </h3>
                <div className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 mb-4">
                  <Mail className="w-4 h-4" />
                  <span>{user.email}</span>
                </div>
                <div className="w-full space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Role</span>
                    <span className="font-medium text-gray-900 dark:text-white">
                      {user.id === '1' ? 'Product Manager' : user.id === '2' ? 'Designer' : user.id === '3' ? 'Developer' : 'QA Engineer'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-400">Status</span>
                    <span className="inline-flex items-center gap-1.5 px-2 py-1 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full text-xs font-medium">
                      <div className="w-1.5 h-1.5 bg-green-600 rounded-full" />
                      Active
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </div>

        <div className="mt-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Statistics</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-primary-600 dark:text-primary-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockUsers.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Total Members</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                    <Calendar className="w-5 h-5 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">{mockUsers.length}</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Active Today</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-yellow-100 dark:bg-yellow-900/30 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">12</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">Tasks Completed</p>
                  </div>
                </div>
              </div>
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                    <Briefcase className="w-5 h-5 text-teal-600 dark:text-teal-400" />
                  </div>
                  <div>
                    <p className="text-2xl font-bold text-gray-900 dark:text-white">8</p>
                    <p className="text-sm text-gray-600 dark:text-gray-400">In Progress</p>
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </AppLayout>
  );
}
