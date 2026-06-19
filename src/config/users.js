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

  // 👀 GUEST - Default Viewer (Sab dikhe, kuch na ho)
  guest: {
    id: "guest",
    username: "guest",
    name: "Guest User",
    role: "viewer",
    displayName: "👀 Guest (Viewer)",
    accessLink: "https://my-production-dashboard.vercel.app/guest/dashboard",
    permissions: {
      viewDashboard: true,
      viewPlans: true,              // ✅ Plans dikhe
      createPlan: false,            // ❌ Add na ho
      editPlan: false,              // ❌ Edit na ho
      deletePlan: false,            // ❌ Delete na ho
      viewDailyProduction: true,    // ✅ Daily dikhe
      createDailyProduction: false, // ❌ Add na ho
      editDailyProduction: false,   // ❌ Edit na ho
      deleteDailyProduction: false, // ❌ Delete na ho
      viewShortages: true,          // ✅ Shortages dikhe
      createShortage: false,        // ❌ Add na ho
      editShortage: false,          // ❌ Edit na ho
      deleteShortage: false,        // ❌ Delete na ho
      resolveShortage: false,       // ❌ Resolve na ho
      viewPriorities: true,         // ✅ Priorities dikhe
      createPriority: false,        // ❌ Add na ho
      editPriority: false,          // ❌ Edit na ho
      deletePriority: false,        // ❌ Delete na ho
      viewLiveNotes: true,          // ✅ Notes dikhe
      createLiveNote: false,        // ❌ Add na ho
      editLiveNote: false,          // ❌ Edit na ho
      deleteLiveNote: false,        // ❌ Delete na ho
      manageUsers: false,           // ❌ Users page na dikhe
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