export const USER_CONFIG = {
  // 👑 SUPER ADMIN - Sirf Shaveel
  shaveel: {
    id: "shaveel",
    username: "shaveel",
    name: "Shaveel",
    role: "super_admin",
    displayName: "👑 Shaveel (Admin)",
    accessLink: "https://my-production-dashboard.vercel.app/shaveel/dashboard",
    permissions: {
      viewDashboard: true,
      viewPlans: true,
      createPlan: true,
      editPlan: true,
      deletePlan: true,
      viewDailyProduction: true,
      createDailyProduction: true,
      editDailyProduction: true,
      deleteDailyProduction: true,
      viewShortages: true,
      createShortage: true,
      editShortage: true,
      deleteShortage: true,
      resolveShortage: true,
      viewPriorities: true,
      createPriority: true,
      editPriority: true,
      deletePriority: true,
      viewLiveNotes: true,
      createLiveNote: true,
      editLiveNote: true,
      deleteLiveNote: true,
      manageUsers: true,
      viewAuditLog: true,
    }
  },

  // 👀 GUEST - Default Viewer
  guest: {
    id: "guest",
    username: "guest",
    name: "Guest User",
    role: "viewer",
    displayName: "👀 Guest (Viewer)",
    accessLink: "https://my-production-dashboard.vercel.app/guest/dashboard",
    permissions: {
      viewDashboard: true,
      viewPlans: false,
      createPlan: false,
      editPlan: false,
      deletePlan: false,
      viewDailyProduction: false,
      createDailyProduction: false,
      editDailyProduction: false,
      deleteDailyProduction: false,
      viewShortages: false,
      createShortage: false,
      editShortage: false,
      deleteShortage: false,
      resolveShortage: false,
      viewPriorities: false,
      createPriority: false,
      editPriority: false,
      deletePriority: false,
      viewLiveNotes: false,
      createLiveNote: false,
      editLiveNote: false,
      deleteLiveNote: false,
      manageUsers: false,
      viewAuditLog: false,
    }
  }
};

export const getUserByUsername = (username) => {
  return USER_CONFIG[username] || USER_CONFIG.guest;
};

export const hasPermission = (username, permission) => {
  const user = getUserByUsername(username);
  return user?.permissions?.[permission] || false;
};

export const DEFAULT_USER = "guest";