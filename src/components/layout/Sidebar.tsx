import { useState } from 'react';
import { Code, Target, Users, Plus, Layers, HelpCircle } from 'lucide-react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { NewBoardModal } from '../modals/NewBoardModal';
import { useTasks } from '../../context/TaskContext';
import { useTheme } from '../../context/ThemeContext';
import lightLogo from '../../../images/bg-white.png';
import darkLogo from '../../../images/bg-black.png';
import { HelpModal } from '../modals/HelpModal';

interface NavItem {
  name: string;
  path: string;
  icon: React.ReactNode;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

const navGroups: NavGroup[] = [
  {
    title: 'Development',
    items: [
      { name: 'Sprint Board', path: '/app/sprint', icon: <Code className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Strategy',
    items: [
      { name: 'Analytics', path: '/app/analytics', icon: <Target className="w-4 h-4" /> },
    ],
  },
  {
    title: 'Team',
    items: [
      { name: 'Team Members', path: '/app/team', icon: <Users className="w-4 h-4" /> },
    ],
  },
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  const [isNewBoardOpen, setIsNewBoardOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const { boards, currentBoard, switchBoard } = useTasks();
  const { theme } = useTheme();

  const handleBoardClick = (boardId: string) => {
    switchBoard(boardId);
    navigate('/app/kanban');
  };

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={onClose}
        />
      )}
      <aside className={`
        fixed lg:static inset-y-0 left-0 z-50
        w-64 h-screen bg-white dark:bg-dark-card border-r border-gray-200 dark:border-dark-border
        flex flex-col overflow-y-auto scrollbar-hide
        transform transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
      `}>
      <div className="p-6">
        <div className="flex items-center gap-3">
          <img
            src={theme === 'dark' ? darkLogo : lightLogo}
            alt="TOAD"
            className="w-10 h-10 rounded-lg object-cover"
          />
          <div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">TOAD</h1>
            <p className="text-xs text-gray-500 dark:text-gray-400">On Sui</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 px-3">
        <div className="mb-6">
          <div className="flex items-center justify-between px-3 mb-2">
            <h3 className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              My Boards
            </h3>
            <button
              onClick={() => setIsNewBoardOpen(true)}
              className="p-1 rounded hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              title="New Board"
            >
              <Plus className="w-3.5 h-3.5 text-gray-500 dark:text-gray-400" />
            </button>
          </div>
          <ul className="space-y-1">
            {boards.map(board => {
              const isActive = currentBoard.id === board.id && location.pathname === '/app/kanban';
              return (
                <li key={board.id}>
                  <button
                    onClick={() => handleBoardClick(board.id)}
                    className={`
                      w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-left
                      ${isActive
                        ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                        : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      }
                    `}
                  >
                    <Layers className="w-4 h-4 flex-shrink-0" />
                    <span className="truncate">{board.name}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </div>

        {navGroups.map((group, idx) => (
          <div key={idx} className="mb-6">
            <h3 className="px-3 mb-2 text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {group.title}
            </h3>
            <ul className="space-y-1">
              {group.items.map(item => {
                const isActive = location.pathname === item.path;
                return (
                  <li key={item.path}>
                    <Link
                      to={item.path}
                      className={`
                        flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors
                        ${isActive
                          ? 'bg-primary-50 dark:bg-primary-900/20 text-primary-700 dark:text-primary-400'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                        }
                      `}
                    >
                      {item.icon}
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </div>
        ))}
      </nav>

      <div className="px-3 pb-6 border-t border-gray-200 dark:border-dark-border pt-4">
        <button
          onClick={() => setIsHelpOpen(true)}
          className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
        >
          <HelpCircle className="w-4 h-4" />
          <span>Help</span>
        </button>
      </div>

      <NewBoardModal
        isOpen={isNewBoardOpen}
        onClose={() => setIsNewBoardOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />
    </aside>
    </>
  );
}
