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
import { Plus, X, Edit, Trash2, User, Check, AlertCircle } from 'lucide-react';
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
    { value: 'super_admin', label: '👑 Super Admin' },
    { value: 'production_planner', label: '📋 Production Planner' },
    { value: 'floor_supervisor', label: '🏭 Floor Supervisor' },
    { value: 'viewer', label: '👀 Viewer' }
  ];

  const shiftOptions = ['morning', 'evening', 'night'];

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
      const userData = {
        ...formData,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString(),
        createdBy: username
      };

      if (editingUser) {
        await updateDoc(doc(db, 'users', editingUser.id), userData);
        toast.success('User updated successfully!');
      } else {
        await addDoc(collection(db, 'users'), userData);
        toast.success('User added successfully!');
      }
      
      setShowModal(false);
      setEditingUser(null);
      setFormData({
        name: '',
        email: '',
        role: 'viewer',
        shift: '',
        employeeId: '',
        isActive: true
      });
      fetchUsers();
    } catch (error) {
      console.error('Error saving user:', error);
      toast.error('Failed to save user');
    }
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
      role: userData.role,
      shift: userData.shift || '',
      employeeId: userData.employeeId || '',
      isActive: userData.isActive !== undefined ? userData.isActive : true
    });
    setShowModal(true);
  };

  const toggleUserStatus = async (userId, currentStatus) => {
    try {
      await updateDoc(doc(db, 'users', userId), {
        isActive: !currentStatus,
        lastUpdated: new Date().toISOString()
      });
      toast.success(`User ${!currentStatus ? 'activated' : 'deactivated'} successfully!`);
      fetchUsers();
    } catch (error) {
      console.error('Error updating user status:', error);
      toast.error('Failed to update user status');
    }
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
    return option ? option.label : role;
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
          <p className="text-gray-400 text-sm mt-1">Manage system users and permissions</p>
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
              isActive: true
            });
            setShowModal(true);
          }}
          className="bg-accent hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
        >
          <Plus size={20} />
          Add User
        </button>
      </div>

      <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Shift</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-700">
            {users.length === 0 ? (
              <tr>
                <td colSpan="5" className="px-6 py-8 text-center text-gray-400">
                  No users found. Add your first user!
                </td>
              </tr>
            ) : (
              users.map((userData) => (
                <tr key={userData.id} className="hover:bg-gray-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gray-700 flex items-center justify-center">
                        <User size={18} className="text-gray-300" />
                      </div>
                      <div>
                        <p className="text-white font-medium">{userData.name}</p>
                        <p className="text-xs text-gray-400">{userData.email}</p>
                        {userData.employeeId && (
                          <p className="text-xs text-gray-500">ID: {userData.employeeId}</p>
                        )}
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs px-3 py-1 rounded-full ${getRoleColor(userData.role)}`}>
                      {getRoleLabel(userData.role)}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    {userData.shift ? (
                      <span className="text-xs bg-yellow-600 px-3 py-1 rounded-full capitalize">
                        {userData.shift}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-500">N/A</span>
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
                        className="bg-yellow-600 hover:bg-yellow-700 p-1.5 rounded text-white transition-colors"
                      >
                        <Edit size={16} />
                      </button>
                      <button
                        onClick={() => toggleUserStatus(userData.id, userData.isActive !== false)}
                        className={`p-1.5 rounded text-white transition-colors ${
                          userData.isActive !== false 
                            ? 'bg-red-600 hover:bg-red-700' 
                            : 'bg-green-600 hover:bg-green-700'
                        }`}
                      >
                        {userData.isActive !== false ? <X size={16} /> : <Check size={16} />}
                      </button>
                      <button
                        onClick={() => handleDelete(userData.id)}
                        className="bg-red-600 hover:bg-red-700 p-1.5 rounded text-white transition-colors"
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
          <div className="bg-card rounded-lg p-6 max-w-md w-full max-h-[90vh] overflow-y-auto">
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
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                  placeholder="Enter full name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Email *</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                  placeholder="Enter email address"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Role *</label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                >
                  {roleOptions.map(option => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Employee ID</label>
                <input
                  type="text"
                  value={formData.employeeId}
                  onChange={(e) => setFormData({ ...formData, employeeId: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  placeholder="EMP001"
                />
              </div>
              
              {formData.role === 'floor_supervisor' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Shift</label>
                  <select
                    value={formData.shift}
                    onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
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
                  className="w-4 h-4 accent-accent"
                  id="userActive"
                />
                <label htmlFor="userActive" className="text-white text-sm">
                  Active User
                </label>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-blue-700 py-2 rounded-lg text-white font-semibold transition-colors"
                >
                  {editingUser ? 'Update User' : 'Add User'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-white font-semibold transition-colors"
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