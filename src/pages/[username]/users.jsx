import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc 
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, X, Edit, Trash2, User, Check, AlertCircle, Copy, LinkIcon } from 'lucide-react';
import toast from 'react-hot-toast';

export default function UserManagementPage({ user, username }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingUser, setEditingUser] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    role: 'viewer',
    shift: '',
    employeeId: '',
    isActive: true
  });

  const roleOptions = [
    { value: 'production_planner', label: '📋 Production Planner' },
    { value: 'floor_supervisor', label: '🏭 Floor Supervisor' },
    { value: 'viewer', label: '👀 Viewer' }
  ];

  const shiftOptions = ['morning', 'evening', 'night'];

  const BASE_URL = typeof window !== 'undefined' 
    ? window.location.origin 
    : 'https://my-production-dashboard.vercel.app';

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const snapshot = await getDocs(collection(db, 'users'));
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setUsers(data);
    } catch (error) {
      console.error('Error fetching users:', error);
      toast.error('Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const generatedUsername = formData.name
        .toLowerCase()
        .replace(/\s+/g, '')
        .replace(/[^a-z0-9]/g, '');

      const existingUser = users.find(u => u.username === generatedUsername);
      if (existingUser && !editingUser) {
        toast.error(`Username "${generatedUsername}" already exists!`);
        return;
      }

      // Agar Super Admin checkbox checked hai toh role set karein
      let finalRole = formData.role;
      if (formData.isSuperAdmin) {
        finalRole = 'super_admin';
      }

      const userData = {
        name: formData.name,
        email: formData.email,
        role: finalRole,
        shift: formData.shift || '',
        employeeId: formData.employeeId || '',
        isActive: formData.isActive,
        username: generatedUsername,
        accessLink: `${BASE_URL}/${generatedUsername}/dashboard`,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        createdBy: username,
        // Permissions automatically assigned based on role
        permissions: getPermissionsByRole(finalRole)
      };

      if (editingUser) {
        await updateDoc(doc(db, 'users', editingUser.id), userData);
        toast.success('User updated successfully!');
      } else {
        await addDoc(collection(db, 'users'), userData);
        toast.success(`✅ User created! Link: ${generatedUsername}`);
      }
      
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'viewer',
        shift: '',
        employeeId: '',
        isActive: true,
        isSuperAdmin: false
      });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
  };

  // Role ke hisaab se permissions return karein
  const getPermissionsByRole = (role) => {
    const permissionsConfig = {
      super_admin: {
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
      },
      production_planner: {
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
      },
      floor_supervisor: {
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
      },
      viewer: {
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
    };
    return permissionsConfig[role] || permissionsConfig.viewer;
  };

  const handleDelete = async (userId) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    try {
      await deleteDoc(doc(db, 'users', userId));
      toast.success('User deleted successfully!');
      fetchUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      toast.error('Failed to delete user');
    }
  };

  const handleEdit = (userData) => {
    setEditingUser(userData);
    setFormData({
      name: userData.name,
      email: userData.email,
      role: userData.role === 'super_admin' ? 'viewer' : userData.role,
      shift: userData.shift || '',
      employeeId: userData.employeeId || '',
      isActive: userData.isActive !== undefined ? userData.isActive : true,
      isSuperAdmin: userData.role === 'super_admin'
    });
    setShowModal(true);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus,
        lastUpdated: new Date().toISOString()
      });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'}!`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
  };

  const copyLink = (link) => {
    navigator.clipboard.writeText(link).then(() => {
      toast.success('✅ Link copied!');
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = link;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      toast.success('✅ Link copied!');
    });
  };

  const getRoleColor = (role) => {
    switch(role) {
      case 'super_admin': return 'bg-purple-600';
      case 'production_planner': return 'bg-blue-600';
      case 'floor_supervisor': return 'bg-green-600';
      default: return 'bg-gray-600';
    }
  };

  const getRoleLabel = (role) => {
    const option = roleOptions.find(r => r.value === role);
    return option ? option.label : role.replace('_', ' ').toUpperCase();
  };

  if (loading) {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  if (user.role !== 'super_admin') {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
        <AlertCircle className="text-red-400 mx-auto mb-3" size={48} />
        <h2 className="text-2xl font-bold text-red-400">⛔ Access Denied</h2>
        <p className="text-gray-400 mt-2">Only Super Admin can manage users.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">👥 User Management</h1>
          <p className="text-gray-400 text-sm mt-1">Manage users and their access links</p>
        </div>
        
        <button
          onClick={() => {
            setEditingUser(null);
            setFormData({
              name: '',
              email: '',
              role: 'viewer',
              shift: '',
              employeeId: '',
              isActive: true,
              isSuperAdmin: false
            });
            setShowModal(true);
          }}
          className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-cyan-400/30"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl overflow-x-auto shadow-lg shadow-cyan-500/5">
        <table className="w-full">
          <thead className="bg-white/5 border-b border-white/10">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Access Link</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  No users found. Add your first user!
                </td>
              </tr>
            ) : (
              users.map((userData) => (
                <tr key={userData.id} className="hover:bg-white/5 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center shadow-lg shadow-cyan-500/20">
                        <User size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{userData.name}</p>
                        <p className="text-xs text-gray-400">{userData.email}</p>
                        {userData.employeeId && (
                          <p className="text-xs text-gray-500">ID: {userData.employeeId}</p>
                        )}
                        <p className="text-xs text-gray-600">@{userData.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${getRoleColor(userData.role)}`}>
                      {userData.role === 'super_admin' ? '👑 Super Admin' : getRoleLabel(userData.role)}
                    </span>
                    {userData.shift && (
                      <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded ml-1 capitalize">
                        {userData.shift}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {userData.accessLink ? (
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-cyan-400 truncate max-w-[150px]">
                          {userData.accessLink}
                        </span>
                        <button
                          onClick={() => copyLink(userData.accessLink)}
                          className="text-gray-400 hover:text-cyan-400 transition-colors"
                          title="Copy link"
                        >
                          <Copy size={16} />
                        </button>
                      </div>
                    ) : (
                      <span className="text-xs text-gray-500">No link</span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${
                      userData.isActive !== false ? 'bg-green-600' : 'bg-red-600'
                    }`}>
                      {userData.isActive !== false ? '🟢 Active' : '🔴 Inactive'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEdit(userData)}
                        className="bg-yellow-600/20 hover:bg-yellow-600/30 text-yellow-400 p-1.5 rounded transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(userData.id, userData.isActive !== false)}
                        className={`p-1.5 rounded transition-colors ${
                          userData.isActive !== false 
                            ? 'bg-red-600/20 hover:bg-red-600/30 text-red-400' 
                            : 'bg-green-600/20 hover:bg-green-600/30 text-green-400'
                        }`}
                      >
                        {userData.isActive !== false ? <X size={16} /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(userData.id)}
                        className="bg-red-600/20 hover:bg-red-600/30 text-red-400 p-1.5 rounded transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-[#0d0d2b] rounded-2xl p-6 max-w-md w-full max-h-[90vh] overflow-y-auto border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingUser ? 'Edit User' : 'Add User'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Full Name *</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
                  required
                  placeholder="Enter full name"
                />
                <p className="text-xs text-gray-500 mt-1">
                  🔑 Username: <span className="text-cyan-400">
                    {formData.name ? formData.name.toLowerCase().replace(/\s+/g, '') : 'username'}
                  </span>
                </p>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
                  required
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>

              {/* Super Admin Checkbox - Sirf current user Super Admin hai toh */}
              {user.role === 'super_admin' && (
                <div className="flex items-center gap-3 bg-purple-500/10 border border-purple-500/30 rounded-lg p-3">
                  <input
                    type="checkbox"
                    checked={formData.isSuperAdmin || false}
                    onChange={(e) => setFormData({ ...formData, isSuperAdmin: e.target.checked })}
                    className="w-4 h-4 accent-purple-500"
                    id="makeSuperAdmin"
                  />
                  <label htmlFor="makeSuperAdmin" className="text-white text-sm">
                    👑 Make this user Super Admin (Full Access)
                  </label>
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
                  placeholder="EMP001"
                />
              </div>
              
              {formData.role === 'floor_supervisor' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
                    required
                  >
                    <option value="">Select Shift</option>
                    {shiftOptions.map(shift => (
                      <option key={shift} value={shift} className="capitalize">
                        {shift}
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isActive}
                  onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                  className="w-4 h-4 accent-cyan-400"
                  id="userActive"
                />
                <label htmlFor="userActive" className="text-white text-sm">
                  Active User
                </label>
              </div>

              {!editingUser && (
                <div className="bg-white/5 border border-white/10 rounded-lg p-3">
                  <p className="text-xs text-gray-400 flex items-center gap-2">
                    <LinkIcon size={14} className="text-cyan-400" />
                    Access link: 
                    <span className="text-cyan-400 font-mono text-xs truncate">
                      {BASE_URL}/{formData.name ? formData.name.toLowerCase().replace(/\s+/g, '') : 'username'}/dashboard
                    </span>
                  </p>
                </div>
              )}
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-cyan-400 hover:bg-cyan-500 py-2 rounded-lg text-black font-semibold transition-all"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-white font-semibold transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}