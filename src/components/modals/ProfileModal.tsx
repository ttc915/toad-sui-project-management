import { useRef, useState } from 'react';
import { X, Upload, Wallet } from 'lucide-react';
import { Button } from '../ui/Button';
import { mockUsers } from '../../data/mockData';
import { useConnectWallet, useCurrentAccount, useWallets } from '@mysten/dapp-kit';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ProfileModal({ isOpen, onClose }: ProfileModalProps) {
  const user = mockUsers[0];
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [avatar, setAvatar] = useState<string | null>(user.avatar || null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const { mutate: connectWallet } = useConnectWallet();
  const currentAccount = useCurrentAccount();
  const wallets = useWallets();
  const [suiAddress] = useState(''); // display currentAccount address

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onClose();
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatar(url);
    }
  };

  const handleConnect = () => {
    if (currentAccount) return;
    if (wallets.length > 0) {
      connectWallet({ wallet: wallets[0] });
    } else {
      alert('No Sui wallet detected. Please install a Sui wallet extension.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center backdrop-blur-sm">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white dark:bg-dark-card rounded-3xl shadow-2xl m-4">
        <form onSubmit={handleSubmit}>
          <div className="p-6 border-b border-gray-200 dark:border-dark-border flex items-center justify-between">
            <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Account Details</h2>
            <button
              type="button"
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-6 space-y-6">
            <div className="flex flex-col items-center">
              <div className="relative">
                <div
                  className="w-24 h-24 rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white text-3xl font-bold overflow-hidden cursor-pointer"
                  onClick={handleAvatarClick}
                >
                  {avatar ? (
                    <img src={avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    <span>{user.name.charAt(0)}</span>
                  )}
                </div>
                <button
                  type="button"
                  onClick={handleAvatarClick}
                  className="absolute bottom-0 right-0 p-2 bg-primary-600 hover:bg-primary-700 text-white rounded-full shadow-lg transition-colors"
                >
                  <Upload className="w-4 h-4" />
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleAvatarChange}
                />
              </div>
              <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Click to upload new photo</p>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Full Name
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Email Address
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-white dark:bg-dark-bg border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-primary-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 dark:text-white mb-2">
                Sui Wallet Address
              </label>
              <div className="relative">
                {currentAccount ? (
                  <input
                    type="text"
                    value={currentAccount?.address || suiAddress || 'Not connected'}
                    readOnly
                    className="w-full px-4 py-2 bg-gray-50 dark:bg-gray-800 border border-gray-300 dark:border-dark-border rounded-lg text-gray-900 dark:text-white font-mono text-sm"
                  />
                ) : (
                  <Button type="button" onClick={handleConnect} className="w-full justify-center">
                    <Wallet className="w-4 h-4" />
                    Connect Wallet
                  </Button>
                )}
              </div>
              <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                {currentAccount ? 'Connected wallet address on Sui blockchain' : 'Please connect your Sui wallet'}
              </p>
            </div>
          </div>

          <div className="p-6 border-t border-gray-200 dark:border-dark-border flex justify-end gap-3">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit">
              Save Changes
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
