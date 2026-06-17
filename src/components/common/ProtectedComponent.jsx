
export default function ProtectedComponent({ 
  children, 
  user, 
  permission, 
  fallback = null 
}) {
  if (!user?.permissions?.[permission]) {
    if (fallback) return fallback;
    
    return (
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
