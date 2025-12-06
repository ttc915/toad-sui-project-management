import { User } from '../../types';

interface AvatarProps {
  user: User;
  size?: 'sm' | 'md' | 'lg';
}

export function Avatar({ user, size = 'md' }: AvatarProps) {
  const sizes = {
    sm: 'w-6 h-6 text-xs',
    md: 'w-8 h-8 text-sm',
    lg: 'w-10 h-10 text-base',
  };

  return (
    <div
      className={`${sizes[size]} rounded-full bg-gradient-to-br from-primary-400 to-teal-500 flex items-center justify-center text-white font-medium overflow-hidden`}
      title={user.name}
    >
      {user.avatar ? (
        <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
      ) : (
        <span>{user.name.charAt(0)}</span>
      )}
    </div>
  );
}

interface AvatarGroupProps {
  users: User[];
  max?: number;
}

export function AvatarGroup({ users, max = 3 }: AvatarGroupProps) {
  const displayed = users.slice(0, max);
  const remaining = users.length - max;

  return (
    <div className="flex -space-x-2">
      {displayed.map(user => (
        <div key={user.id} className="ring-2 ring-white dark:ring-dark-card rounded-full">
          <Avatar user={user} size="sm" />
        </div>
      ))}
      {remaining > 0 && (
        <div className="w-6 h-6 rounded-full bg-gray-200 dark:bg-gray-700 flex items-center justify-center text-xs font-medium text-gray-600 dark:text-gray-300 ring-2 ring-white dark:ring-dark-card">
          +{remaining}
        </div>
      )}
    </div>
  );
}
