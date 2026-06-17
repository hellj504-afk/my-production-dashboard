import { Bell, User } from 'lucide-react';

export default function Header({ user, username }) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-secondary border-b border-gray-700 h-16 px-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <h1 className="text-xl font-bold text-white">
          🏭 Production Dashboard
        </h1>
        <span className="text-xs bg-accent px-2 py-1 rounded text-gray-300">
          v1.0
        </span>
      </div>
      
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
          <span className="text-xs text-gray-400">Live</span>
        </div>
        
        <button className="text-gray-400 hover:text-white transition-colors">
          <Bell size={20} />
        </button>
        
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-sm font-semibold text-white">{user.displayName}</p>
            <p className="text-xs text-gray-400">@{username}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-accent flex items-center justify-center">
            <User size={20} className="text-white" />
          </div>
        </div>
      </div>
    </header>
  );
}