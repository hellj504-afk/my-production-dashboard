export default function ProtectedComponent({ 
  children, 
  user, 
  permission, 
  fallback = null 
}) {
  // ✅ Agar user nahi hai toh fallback dikhayein
  if (!user) {
    return fallback || (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-center">
        <p className="text-red-400 font-semibold">⛔ Access Denied</p>
        <p className="text-gray-400 text-sm mt-1">Please login to access this feature.</p>
      </div>
    );
  }

  // ✅ Permission check
  const hasPermission = user?.permissions?.[permission];
  
  if (!hasPermission) {
    return fallback || (
      <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-center">
        <p className="text-red-400 font-semibold">⛔ Access Denied</p>
        <p className="text-gray-400 text-sm mt-1">
          You don't have permission to access this feature.
        </p>
      </div>
    );
  }

  return children;
}