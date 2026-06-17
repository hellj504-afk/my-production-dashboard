import Link from 'next/link';
import { USER_CONFIG } from '../../config/users';

export default function UserSwitcher({ currentUser, className = '' }) {
  const users = Object.keys(USER_CONFIG);
  
  return (
    <div className={`bg-gray-800 p-4 rounded-lg ${className}`}>
      <h4 className="text-sm font-semibold text-gray-400 mb-3">Quick Switch User</h4>
      <div className="flex flex-wrap gap-2">
        {users.map((username) => {
          const userData = USER_CONFIG[username];
          return (
            <Link
              key={username}
              href={`/${username}/dashboard`}
              className={`px-3 py-1.5 rounded-lg text-xs transition-colors ${
                username === currentUser 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {username}
              <span className="block text-[10px] opacity-60">
                {userData.role.replace('_', ' ')}
              </span>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
