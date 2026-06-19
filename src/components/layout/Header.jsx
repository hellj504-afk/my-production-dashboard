import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  CalendarCheck, 
  AlertTriangle, 
  Flag,
  StickyNote,
  Users,
  User,
  LogOut
} from 'lucide-react';

export default function Header({ user, username }) {
  const router = useRouter();
  const currentPath = router.pathname;

  const navItems = [
    { name: 'Dashboard', path: `/${username}/dashboard`, icon: LayoutDashboard, permission: 'viewDashboard' },
    { name: 'Daily', path: `/${username}/daily`, icon: CalendarCheck, permission: 'viewDailyProduction' },
    { name: 'Shortages', path: `/${username}/shortages`, icon: AlertTriangle, permission: 'viewShortages' },
    { name: 'Priorities', path: `/${username}/priorities`, icon: Flag, permission: 'viewPriorities' },
    { name: 'Notes', path: `/${username}/notes`, icon: StickyNote, permission: 'viewLiveNotes' },
    { name: 'Users', path: `/${username}/users`, icon: Users, permission: 'manageUsers' },
  ];

  // ✅ Sirf woh items dikhayein jin ki permission user ko hai
  const visibleItems = navItems.filter(item => {
    if (user?.role === 'super_admin') return true;
    return user?.permissions?.[item.permission] === true;
  });

  // ✅ Logout: Guest dashboard par jaye
  const handleLogout = () => {
    router.push('/guest/dashboard');
  };

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-black/40 backdrop-blur-xl border-b border-white/10 h-16 px-6 flex items-center justify-between">
      {/* Logo */}
      <div className="flex items-center gap-3">
        <Link href={`/${username}/dashboard`}>
          <div className="text-2xl font-bold bg-gradient-to-r from-cyan-400 to-purple-500 bg-clip-text text-transparent cursor-pointer">
            🏭 Prod<span className="text-white">Dash</span>
          </div>
        </Link>
        <span className="text-xs text-cyan-400/60 border border-cyan-400/30 px-2 py-0.5 rounded-full">
          v1.0
        </span>
      </div>

      {/* Navigation Links */}
      <nav className="hidden md:flex items-center gap-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || currentPath.includes(item.path.split('/').pop());
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-300 ${
                isActive 
                  ? 'bg-cyan-500/20 text-cyan-400 shadow-lg shadow-cyan-500/20 border border-cyan-400/30' 
                  : 'text-gray-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <Icon size={18} />
              {item.name}
            </Link>
          );
        })}
      </nav>

      {/* User Info + Logout */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <p className="text-sm font-semibold text-white">{user?.displayName || user?.name || 'Guest'}</p>
            <p className="text-xs text-cyan-400/60">@{username}</p>
          </div>
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <User size={20} className="text-white" />
          </div>
          {/* ✅ Logout Button - Guest par jaye */}
          <button
            onClick={handleLogout}
            className="text-gray-400 hover:text-white transition-colors ml-2"
            title="Logout"
          >
            <LogOut size={18} />
          </button>
        </div>
      </div>
    </header>
  );
}