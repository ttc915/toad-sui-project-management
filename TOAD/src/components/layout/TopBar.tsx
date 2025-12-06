import { useState } from 'react';
import { Search, Star, Plus, Moon, Sun, Wallet, Menu, HelpCircle } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useSearch } from '../../context/SearchContext';
import { Button } from '../ui/Button';
import { Avatar } from '../ui/Avatar';
import { mockUsers } from '../../data/mockData';
import { AddTaskModal } from '../modals/AddTaskModal';
import { ProfileModal } from '../modals/ProfileModal';
import { HelpModal } from '../modals/HelpModal';
import { useConnectWallet, useCurrentAccount, useDisconnectWallet, useWallets } from '@mysten/dapp-kit';

interface TopBarProps {
  title: string;
  subtitle?: string;
  showAddTask?: boolean;
  onAddTask?: (task: any) => void;
  onMenuClick?: () => void;
}

export function TopBar({ title, subtitle, showAddTask = false, onAddTask, onMenuClick }: TopBarProps) {
  const { theme, toggleTheme } = useTheme();
  const { searchQuery, setSearchQuery } = useSearch();
  const [isAddTaskOpen, setIsAddTaskOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isHelpOpen, setIsHelpOpen] = useState(false);
  const [isWalletModalOpen, setIsWalletModalOpen] = useState(false);
  const currentUser = mockUsers[0];
  
  // Wallet connection hooks
  const { mutate: connectWallet } = useConnectWallet();
  const { mutate: disconnectWallet } = useDisconnectWallet();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();

  const handleAddTask = (task: any) => {
    if (onAddTask) {
      onAddTask(task);
    }
    setIsAddTaskOpen(false);
  };

  const handleWalletClick = () => {
    if (currentAccount) {
      disconnectWallet();
    } else {
      // If multiple wallets, show selection modal, otherwise connect directly
      if (wallets.length > 1) {
        setIsWalletModalOpen(true);
      } else if (wallets.length === 1) {
        connectWallet({ wallet: wallets[0] });
      } else {
        // If no wallets detected, show alert to user
        alert('No Sui wallets detected. Please install a Sui wallet extension (e.g., Sui Wallet) to connect.');
      }
    }
  };

  const handleWalletSelect = (wallet: typeof wallets[0]) => {
    connectWallet({ wallet });
    setIsWalletModalOpen(false);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <>
      <header className="h-16 bg-white dark:bg-dark-card border-b border-gray-200 dark:border-dark-border flex items-center justify-between px-4 md:px-6">
        <div className="flex items-center gap-4">
          <button
            onClick={onMenuClick}
            className="lg:hidden p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Menu className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg md:text-xl font-bold text-gray-900 dark:text-white">{title}</h1>
              <button className="hidden sm:block p-1 hover:bg-gray-100 dark:hover:bg-gray-800 rounded">
                <Star className="w-4 h-4 text-gray-400" />
              </button>
            </div>
            {subtitle && (
              <p className="text-xs md:text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>
            )}
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-3">
          <div className="relative hidden md:block">
            <input
              type="search"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-48 lg:w-64 pl-10 pr-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-primary-500"
            />
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          </div>

          {showAddTask && (
            <Button
              size="sm"
              className="flex items-center gap-2"
              onClick={() => setIsAddTaskOpen(true)}
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">Add task</span>
            </Button>
          )}

          <Button
            variant="ghost"
            size="sm"
            className="hidden lg:flex items-center gap-2"
            onClick={handleWalletClick}
          >
            <Wallet className="w-4 h-4" />
            {currentAccount ? (
              <span className="flex items-center gap-2">
                <span className="hidden xl:inline">{formatAddress(currentAccount.address)}</span>
                <span className="xl:hidden">Connected</span>
              </span>
            ) : (
              'Connect Wallet'
            )}
          </Button>

          <button
            onClick={() => setIsHelpOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            title="Help"
          >
            <HelpCircle className="w-5 h-5 text-gray-600 dark:text-gray-400" />
          </button>

          <button
            onClick={toggleTheme}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            {theme === 'light' ? (
              <Moon className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            ) : (
              <Sun className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            )}
          </button>

          <button
            onClick={() => setIsProfileOpen(true)}
            className="p-2 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          >
            <Avatar user={currentUser} size="sm" />
          </button>
        </div>
      </header>

      <AddTaskModal
        isOpen={isAddTaskOpen}
        onClose={() => setIsAddTaskOpen(false)}
        onAdd={handleAddTask}
      />

      <ProfileModal
        isOpen={isProfileOpen}
        onClose={() => setIsProfileOpen(false)}
      />

      <HelpModal
        isOpen={isHelpOpen}
        onClose={() => setIsHelpOpen(false)}
      />

      {/* Wallet Selection Modal */}
      {isWalletModalOpen && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setIsWalletModalOpen(false)}>
          <div className="bg-white dark:bg-dark-card rounded-lg p-6 max-w-md w-full mx-4 shadow-xl" onClick={(e) => e.stopPropagation()}>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Select Wallet</h2>
            <div className="space-y-2">
              {wallets.map((wallet) => (
                <button
                  key={wallet.name}
                  onClick={() => handleWalletSelect(wallet)}
                  className="w-full p-4 text-left border border-gray-200 dark:border-dark-border rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors flex items-center gap-3"
                >
                  <Wallet className="w-5 h-5 text-gray-600 dark:text-gray-400" />
                  <div className="font-medium text-gray-900 dark:text-white">{wallet.name}</div>
                </button>
              ))}
            </div>
            <button
              onClick={() => setIsWalletModalOpen(false)}
              className="mt-4 w-full py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </>
  );
}
