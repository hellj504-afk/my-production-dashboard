import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import ProtectedComponent from '../../components/common/ProtectedComponent';
import { Plus, X, Edit, Trash2, Shield, User, Clock, Check, AlertCircle } from 'lucide-react';
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
    { value: 'super_admin', label: '👑 Super Admin', color: 'purple' },
    { value: 'production_planner', label: '📋 Production Planner', color: 'blue' },
    { value: 'floor_supervisor', label: '🏭 Floor Supervisor', color: 'green' },
    { value: 'viewer', label: '👀 Viewer', color: 'gray' }
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

  // Only Super Admin can access this page
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
      {/* Header */}
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

      {/* Users Table */}
      <div className="bg-card rounded-lg shadow-lg overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-800">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">User</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Role</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Shift</th>
              <th className="px-6 py-3 text-left
