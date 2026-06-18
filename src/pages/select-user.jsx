import { useRouter } from 'next/router';
import { USER_CONFIG } from '../config/users';

export default function SelectUser() {
  const router = useRouter();

  // ✅ Sirf non-admin users dikhayein (viewers ke liye)
  const users = [
    { id: 'shaveel', label: '📋 Shaveel (Planner)' },
    { id: 'rashid', label: '🏭 Rashid (Supervisor)' },
    { id: 'amir', label: '🏭 Amir (Shortage)' },
    { id: 'imran', label: '🏭 Imran (Shortage)' },
    { id: 'riaz', label: '🏭 Riaz (Shortage)' },
    { id: 'bilalbutt', label: '📝 Bilal Butt (Notes)' },
    { id: 'waqar', label: '👀 Waqar (Viewer)' },
    { id: 'aliakbar', label: '👀 Ali Akbar (Viewer)' },
    { id: 'guest', label: '👀 Guest (Viewer)' },
  ];

  // Admin users (development ke liye)
  const adminUsers = [
    { id: 'umair', label: '👑 Umair (Admin)' },
    { id: 'haris', label: '👑 Haris (Admin)' },
  ];

  const goToUser = (username) => {
    router.push(`/${username}/dashboard`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-2xl w-full shadow-2xl shadow-cyan-500/10">
        <h1 className="text-3xl font-bold text-white text-center mb-2">👥 Select User</h1>
        <p className="text-gray-400 text-center text-sm mb-6">⚠️ Development Mode - Select a user to login</p>
        
        {/* Admin Users */}
        <div className="mb-4">
          <p className="text-xs text-purple-400/60 mb-2">👑 Admins</p>
          <div className="grid grid-cols-2 gap-3">
            {adminUsers.map((user) => (
              <button
                key={user.id}
                onClick={() => goToUser(user.id)}
                className="bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/30 hover:border-purple-400/50 rounded-xl px-4 py-3 text-white text-sm transition-all duration-300 hover:scale-105"
              >
                {user.label}
              </button>
            ))}
          </div>
        </div>

        {/* Regular Users */}
        <div>
          <p className="text-xs text-gray-400/60 mb-2">👥 Regular Users</p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {users.map((user) => (
              <button
                key={user.id}
                onClick={() => goToUser(user.id)}
                className="bg-white/5 hover:bg-white/10 border border-white/10 hover:border-cyan-400/30 rounded-xl px-4 py-3 text-white text-sm transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-cyan-500/10"
              >
                {user.label}
              </button>
            ))}
          </div>
        </div>
        
        <div className="mt-6 text-center text-xs text-gray-500 border-t border-white/5 pt-4">
          🔗 Direct links: /umair/dashboard, /waqar/dashboard, etc.
        </div>
      </div>
    </div>
  );
}