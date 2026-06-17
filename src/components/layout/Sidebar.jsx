import Link from 'next/link';
import { useRouter } from 'next/router';
import { 
  LayoutDashboard, 
  ClipboardList, 
  CalendarCheck, 
  AlertTriangle, 
  Flag,
  StickyNote,
  Users
} from 'lucide-react';

export default function Sidebar({ user, username }) {
  const router = useRouter();
  const currentPath = router.pathname;

  const menuItems = [
    {
      name: 'Dashboard',
      path: `/${username}/dashboard`,
      icon: LayoutDashboard,
      permission: 'viewDashboard'
    },
    {
      name: 'Production Plans',
      path: `/${username}/plans`,
      icon: ClipboardList,
      permission: 'viewPlans'
    },
    {
      name: 'Daily Production',
      path: `/${username}/daily`,
      icon: CalendarCheck,
      permission: 'viewDailyProduction'
    },
    {
      name: 'Shortages',
      path: `/${username}/shortages`,
      icon: AlertTriangle,
      permission: 'viewShortages'
    },
    {
      name: 'Priorities',
      path: `/${username}/priorities`,
      icon: Flag,
      permission: 'viewPriorities'
    },
    {
      name: 'Live Notes',
      path: `/${username}/notes`,
      icon: StickyNote,
      permission: 'viewLiveNotes'
    },
    {
      name: 'User Management',
      path: `/${username}/users`,
      icon: Users,
      permission: 'manageUsers'
    }
  ];

  const visibleItems = menuItems.filter(item => 
    user.permissions[item.permission]
  );

  return (
    <aside className="fixed left-0 top-16 h-full w-64 bg-secondary border-r border-gray-700 overflow-y-auto">
      <div className="p-4 border-b border-gray-700">
        <p className="text-xs text-gray-400">Logged in as:</p>
        <p className="text-white font-semibold">{user.displayName}</p>
        <div className="flex items-center gap-2 mt-1">
          <span className={`text-xs px-2 py-0.5 rounded ${
            user.role === 'super_admin' ? 'bg-purple-600' :
            user.role === 'production_planner' ? 'bg-blue-600' :
            user.role === 'floor_supervisor' ? 'bg-green-600' :
            'bg-gray-600'
          }`}>
            {user.role.replace('_', ' ').toUpperCase()}
          </span>
          {user.shift && (
            <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded">
              {user.shift}
            </span>
          )}
        </div>
      </div>
      
      <nav className="p-4 space-y-1">
        {visibleItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPath === item.path || 
                          currentPath.includes(item.path.split('/').pop());
          
          return (
            <Link
              key={item.path}
              href={item.path}
              className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 ${
                isActive 
                  ? 'bg-accent text-white shadow-lg shadow-accent/20' 
                  : 'text-gray-400 hover:bg-gray-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="text-sm font-medium">{item.name}</span>
            </Link>
          );
        })}
      </nav>
      
      <div className="absolute bottom-0 w-full p-4 border-t border-gray-700 bg-secondary">
        <p className="text-xs text-gray-500 mb-2">Quick Switch:</p>
        <div className="flex flex-wrap gap-1">
          {['umair', 'usman', 'rizwan', 'ahmed', 'guest'].map(userKey => (
            <Link
              key={userKey}
              href={`/${userKey}/dashboard`}
              className={`text-xs px-2 py-1 rounded transition-colors ${
                userKey === username 
                  ? 'bg-accent text-white' 
                  : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
              }`}
            >
              {userKey}
            </Link>
          ))}
        </div>
      </div>
    </aside>
  );
}