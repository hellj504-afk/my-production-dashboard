export const USER_CONFIG = {
  // 👑 SUPER ADMIN - Full Access
  umair: {
    id: "umair",
    username: "umair",
    name: "Muhammad Umair",
    role: "super_admin",
    displayName: "👑 Umair (Admin)",
    accessLink: "https://my-production-dashboard.vercel.app/umair/dashboard",
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

  // 📋 PRODUCTION PLANNER
  usman: {
    id: "usman",
    username: "usman",
    name: "Usman Ahmed",
    role: "production_planner",
    displayName: "📋 Usman (Planner)",
    accessLink: "https://my-production-dashboard.vercel.app/usman/dashboard",
    permissions: {
      viewDashboard: true,
      viewPlans: true,
      createPlan: true,
      editPlan: true,
      deletePlan: false,
      viewDailyProduction: true,
      createDailyProduction: true,
      editDailyProduction: true,
      deleteDailyProduction: false,
      viewShortages: true,
      createShortage: true,
      editShortage: true,
      deleteShortage: false,
      resolveShortage: true,
      viewPriorities: true,
      createPriority: true,
      editPriority: true,
      deletePriority: false,
      viewLiveNotes: true,
      createLiveNote: true,
      editLiveNote: true,
      deleteLiveNote: false,
      manageUsers: false,
      viewAuditLog: false,
    }
  },

  // 🏭 FLOOR SUPERVISOR 1
  rizwan: {
    id: "rizwan",
    username: "rizwan",
    name: "Rizwan Ali",
    role: "floor_supervisor",
    displayName: "🏭 Rizwan (Supervisor - Morning)",
    shift: "morning",
    accessLink: "https://my-production-dashboard.vercel.app/rizwan/dashboard",
    permissions: {
      viewDashboard: true,
      viewPlans: true,
      createPlan: false,
      editPlan: false,
      deletePlan: false,
      viewDailyProduction: true,
      createDailyProduction: true,
      editDailyProduction: true,
      deleteDailyProduction: false,
      viewShortages: true,
      createShortage: false,
      editShortage: false,
      deleteShortage: false,
      resolveShortage: true,
      viewPriorities: true,
      createPriority: false,
      editPriority: false,
      deletePriority: false,
      viewLiveNotes: true,
      createLiveNote: false,
      editLiveNote: false,
      deleteLiveNote: false,
      manageUsers: false,
      viewAuditLog: false,
    }
  },

  // 🏭 FLOOR SUPERVISOR 2
  ahmed: {
    id: "ahmed",
    username: "ahmed",
    name: "Ahmed Hassan",
    role: "floor_supervisor",
    displayName: "🏭 Ahmed (Supervisor - Evening)",
    shift: "evening",
    accessLink: "https://my-production-dashboard.vercel.app/ahmed/dashboard",
    permissions: {
      viewDashboard: true,
      viewPlans: true,
      createPlan: false,
      editPlan: false,
      deletePlan: false,
      viewDailyProduction: true,
      createDailyProduction: true,
      editDailyProduction: true,
      deleteDailyProduction: false,
      viewShortages: true,
      createShortage: false,
      editShortage: false,
      deleteShortage: false,
      resolveShortage: true,
      viewPriorities: true,
      createPriority: false,
      editPriority: false,
      deletePriority: false,
      viewLiveNotes: true,
      createLiveNote: false,
      editLiveNote: false,
      deleteLiveNote: false,
      manageUsers: false,
      viewAuditLog: false,
    }
  },

  // 👀 VIEWER - Read Only
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

export const DEFAULT_USER = "umair";