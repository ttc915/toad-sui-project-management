import { useMemo, useEffect, useState } from 'react';
import { AppLayout } from '../components/layout/AppLayout';
import { Card } from '../components/ui/Card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { StatusPill, PriorityPill } from '../components/ui/StatusPill';
import { AvatarGroup } from '../components/ui/Avatar';
import { TrendingUp, Shield } from 'lucide-react';
import { useTasks } from '../context/TaskContext';
import { useConnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';
import { ProfileModal } from '../components/modals/ProfileModal';

const COLORS = {
  'Backlog': '#6B7280',
  'Planned': '#3B82F6',
  'In Progress': '#EAB308',
  'Needs Review': '#14B8A6',
  'Blocked': '#EF4444',
  'Done': '#10B981',
};

const STATUS_LABELS: Record<string, string> = {
  backlog: 'Backlog',
  'not-started': 'Backlog',
  planned: 'Planned',
  'in-progress': 'In Progress',
  'needs-review': 'Needs Review',
  blocked: 'Blocked',
  done: 'Done',
};

const STATUS_ORDER = ['Backlog', 'Planned', 'In Progress', 'Needs Review', 'Blocked', 'Done'];

export function AnalyticsPage() {
  const { tasks } = useTasks();
  const { mutate: connectWallet } = useConnectWallet();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const [isProfileOpen, setIsProfileOpen] = useState(true);

  useEffect(() => {
    if (!currentAccount && wallets.length > 0) {
      connectWallet({ wallet: wallets[0] });
    }
  }, [currentAccount, wallets, connectWallet]);

  const analytics = useMemo(() => {
    const statusCounts = tasks.reduce<Record<string, number>>((acc, task) => {
      const label =
        STATUS_LABELS[task.status] ||
        (task.status
          ? task.status
              .replace(/-/g, ' ')
              .replace(/\b\w/g, char => char.toUpperCase())
          : 'Other');
      acc[label] = (acc[label] || 0) + 1;
      return acc;
    }, {});

    const tasksByStatus = [
      ...STATUS_ORDER.map(status => ({
        status,
        count: statusCounts[status] || 0,
      })),
      ...Object.entries(statusCounts)
        .filter(([status]) => !STATUS_ORDER.includes(status))
        .map(([status, count]) => ({ status, count })),
    ];

    const totalTasks = tasks.length;
    const completedTasks = statusCounts['Done'] || 0;
    const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    const onChainTasks = tasks.filter(t => t.suiObjectId).length;

    const velocity = [
      { week: 'Week 1', completed: Math.floor(completedTasks * 0.15) },
      { week: 'Week 2', completed: Math.floor(completedTasks * 0.25) },
      { week: 'Week 3', completed: Math.floor(completedTasks * 0.35) },
      { week: 'Week 4', completed: Math.floor(completedTasks * 0.25) },
    ];

    return {
      tasksByStatus,
      completionRate,
      onChainTasks,
      velocity,
    };
  }, [tasks]);

  const pieData = analytics.tasksByStatus.map(item => ({
    name: item.status,
    value: item.count,
  }));

  return (
    <AppLayout title="Analytics Dashboard" subtitle="Team performance and insights">
      <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
      {!currentAccount && (
        <Card className="p-4 mb-4 bg-amber-50 border border-amber-200 text-amber-800">
          Please connect your wallet to load on-chain analytics. Click the wallet button in the top bar or refresh after connecting.
        </Card>
      )}
      <div className="p-4 md:p-6 space-y-4 md:space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Task Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={analytics.tasksByStatus}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="status" tick={{ fontSize: 12 }} />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#3B82F6" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </Card>

          <Card className="p-6 flex flex-col items-center justify-center">
            <div className="relative w-48 h-48">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={[
                      { value: analytics.completionRate },
                      { value: 100 - analytics.completionRate },
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    startAngle={90}
                    endAngle={-270}
                    dataKey="value"
                  >
                    <Cell fill="#10B981" />
                    <Cell fill="#E5E7EB" />
                  </Pie>
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold text-gray-900 dark:text-white">
                  {analytics.completionRate}%
                </div>
                <div className="text-sm text-gray-500 dark:text-gray-400">
                  On Track
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-gray-600 dark:text-gray-400">Tasks by Status</h3>
            </div>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={70}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[entry.name as keyof typeof COLORS] || '#6B7280'} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </Card>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Tasks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{tasks.length}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary-100 dark:bg-primary-900/30 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-primary-600 dark:text-primary-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">On-chain Tasks</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.onChainTasks}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-teal-100 dark:bg-teal-900/30 flex items-center justify-center">
                <Shield className="w-6 h-6 text-teal-600 dark:text-teal-400" />
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Completion Rate</p>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">{analytics.completionRate}%</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center">
                <div className="text-2xl">✓</div>
              </div>
            </div>
          </Card>
        </div>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Team Velocity</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={analytics.velocity}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="week" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip />
              <Line type="monotone" dataKey="completed" stroke="#3B82F6" strokeWidth={2} dot={{ fill: '#3B82F6', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </Card>

        <Card className="p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Recent Tasks</h3>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-gray-200 dark:border-dark-border">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Task Name
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Status
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Priority
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Deadline
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 dark:text-gray-400 uppercase">
                    Assignee
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-dark-border">
                {tasks.slice(0, 5).map(task => (
                  <tr key={task.id} className="hover:bg-gray-50 dark:hover:bg-gray-900/30">
                    <td className="px-4 py-3 text-sm text-gray-900 dark:text-white">
                      {task.title}
                    </td>
                    <td className="px-4 py-3">
                      <StatusPill status={task.status} />
                    </td>
                    <td className="px-4 py-3">
                      <PriorityPill priority={task.priority} />
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-700 dark:text-gray-300">
                      {task.dueDate
                        ? new Date(task.dueDate).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : '-'}
                    </td>
                    <td className="px-4 py-3">
                      {task.assignees.length > 0 ? (
                        <AvatarGroup users={task.assignees} max={2} />
                      ) : (
                        <span className="text-sm text-gray-500 dark:text-gray-400">-</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>
      </div>
    </AppLayout>
  );
}
