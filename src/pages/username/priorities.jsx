import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import ProtectedComponent from '../../components/common/ProtectedComponent';
import { Plus, X, Edit, Trash2, Flag, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function PrioritiesPage({ user, username }) {
  const [priorities, setPriorities] = useState([]);
  const [plans, setPlans] = useState([]);
  const [shortages, setShortages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPriority, setEditingPriority] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    priorityLevel: 'high',
    relatedItemType: 'plan',
    relatedItemId: '',
    assignedTo: '',
    dueDate: '',
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const plansSnapshot = await getDocs(collection(db, 'productionPlans'));
      const plansData = [];
      plansSnapshot.forEach((doc) => {
        plansData.push({ id: doc.id, ...doc.data() });
      });
      setPlans(plansData);

      const shortagesSnapshot = await getDocs(collection(db, 'shortages'));
      const shortagesData = [];
      shortagesSnapshot.forEach((doc) => {
        shortagesData.push({ id: doc.id, ...doc.data() });
      });
      setShortages(shortagesData);

      const prioritiesQuery = query(
        collection(db, 'priorities'),
        orderBy('createdAt', 'desc')
      );
      const prioritiesSnapshot = await getDocs(prioritiesQuery);
      const prioritiesData = [];
      prioritiesSnapshot.forEach((doc) => {
        prioritiesData.push({ id: doc.id, ...doc.data() });
      });
      setPriorities(prioritiesData);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast.error('Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const priorityData = {
        ...formData,
        assignedBy: username,
        createdAt: new Date().toISOString(),
        lastUpdated: new Date().toISOString()
      };

      if (editingPriority) {
        await updateDoc(doc(db, 'priorities', editingPriority.id), priorityData);
        toast.success('Priority updated successfully!');
      } else {
        await addDoc(collection(db, 'priorities'), priorityData);
        toast.success('Priority created successfully!');
      }
      
      setShowModal(false);
      setEditingPriority(null);
      setFormData({
        title: '',
        description: '',
        priorityLevel: 'high',
        relatedItemType: 'plan',
        relatedItemId: '',
        assignedTo: '',
        dueDate: '',
        status: 'pending'
      });
      fetchData();
    } catch (error) {
      console.error('Error saving priority:', error);
      toast.error('Failed to save priority');
    }
  };

  const handleDelete = async (priorityId) => {
    if (!confirm('Are you sure you want to delete this priority?')) return;
    try {
      await deleteDoc(doc(db, 'priorities', priorityId));
      toast.success('Priority deleted successfully!');
      fetchData();
    } catch (error) {
      console.error('Error deleting priority:', error);
      toast.error('Failed to delete priority');
    }
  };

  const handleEdit = (priority) => {
    setEditingPriority(priority);
    setFormData({
      title: priority.title,
      description: priority.description || '',
      priorityLevel: priority.priorityLevel,
      relatedItemType: priority.relatedItemType,
      relatedItemId: priority.relatedItemId,
      assignedTo: priority.assignedTo || '',
      dueDate: priority.dueDate || '',
      status: priority.status || 'pending'
    });
    setShowModal(true);
  };

  const getPriorityBorder = (level) => {
    switch(level) {
      case 'high': return 'border-red-500';
      case 'medium': return 'border-yellow-500';
      case 'low': return 'border-green-500';
      default: return 'border-gray-500';
    }
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'pending': return 'bg-gray-500';
      case 'in_progress': return 'bg-blue-500';
      case 'completed': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };

  const getRelatedItemName = (type, id) => {
    if (type === 'plan') {
      const plan = plans.find(p => p.id === id);
      return plan ? plan.productName : 'Unknown Plan';
    } else if (type === 'shortage') {
      const shortage = shortages.find(s => s.id === id);
      return shortage ? shortage.materialName : 'Unknown Shortage';
    }
    return 'N/A';
  };

  const getPriorityIcon = (level) => {
    switch(level) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (loading) {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  const groupedPriorities = {
    high: priorities.filter(p => p.priorityLevel === 'high'),
    medium: priorities.filter(p => p.priorityLevel === 'medium'),
    low: priorities.filter(p => p.priorityLevel === 'low')
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">🎯 Priority Board</h1>
          <p className="text-gray-400 text-sm mt-1">Manage and track priorities</p>
        </div>
        
        <ProtectedComponent user={user} permission="createPriority">
          <button
            onClick={() => {
              setEditingPriority(null);
              setFormData({
                title: '',
                description: '',
                priorityLevel: 'high',
                relatedItemType: 'plan',
                relatedItemId: '',
                assignedTo: '',
                dueDate: '',
                status: 'pending'
              });
              setShowModal(true);
            }}
            className="bg-accent hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Priority
          </button>
        </ProtectedComponent>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {['high', 'medium', 'low'].map((level) => (
          <div key={level} className="bg-card rounded-lg p-4 shadow-lg">
            <div className="flex items-center justify-between mb-4">
              <h3 className={`text-lg font-semibold flex items-center gap-2 ${
                level === 'high' ? 'text-red-400' :
                level === 'medium' ? 'text-yellow-400' :
                'text-green-400'
              }`}>
                {getPriorityIcon(level)} {level.toUpperCase()} Priority
                <span className="text-xs bg-gray-700 px-2 py-0.5 rounded text-gray-300">
                  {groupedPriorities[level].length}
                </span>
              </h3>
            </div>
            
            <div className="space-y-3">
              {groupedPriorities[level].length === 0 ? (
                <p className="text-gray-500 text-sm text-center py-4">No {level} priorities</p>
              ) : (
                groupedPriorities[level].map((priority) => (
                  <div 
                    key={priority.id} 
                    className={`bg-gray-800 rounded-lg p-4 border-l-4 ${getPriorityBorder(priority.priorityLevel)} hover:shadow-lg transition-shadow`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="text-white font-semibold">{priority.title}</h4>
                        {priority.description && (
                          <p className="text-gray-400 text-sm mt-1">{priority.description}</p>
                        )}
                        
                        <div className="flex flex-wrap gap-3 mt-2">
                          <span className="text-xs flex items-center gap-1 text-gray-400">
                            <Flag size={12} />
                            {getRelatedItemName(priority.relatedItemType, priority.relatedItemId)}
                          </span>
                          {priority.assignedTo && (
                            <span className="text-xs flex items-center gap-1 text-gray-400">
                              <User size={12} />
                              {priority.assignedTo}
                            </span>
                          )}
                          {priority.dueDate && (
                            <span className="text-xs flex items-center gap-1 text-gray-400">
                              <Clock size={12} />
                              {new Date(priority.dueDate).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-2 ml-2">
                        <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(priority.status)}`}>
                          {priority.status?.replace('_', ' ').toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex justify-end gap-2 mt-3">
                      <ProtectedComponent user={user} permission="editPriority">
                        <button
                          onClick={() => handleEdit(priority)}
                          className="bg-yellow-600 hover:bg-yellow-700 p-1.5 rounded text-white transition-colors"
                        >
                          <Edit size={16} />
                        </button>
                      </ProtectedComponent>
                      
                      <ProtectedComponent user={user} permission="deletePriority">
                        <button
                          onClick={() => handleDelete(priority.id)}
                          className="bg-red-600 hover:bg-red-700 p-1.5 rounded text-white transition-colors"
                        >
                          <Trash2 size={16} />
                        </button>
                      </ProtectedComponent>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingPriority ? 'Edit Priority' : 'Add Priority'}
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
                <label className="block text-sm text-gray-400 mb-1">Title *</label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                  placeholder="Enter priority title"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Priority Level *</label>
                <select
                  value={formData.priorityLevel}
                  onChange={(e) => setFormData({ ...formData, priorityLevel: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                >
                  <option value="high">🔴 High</option>
                  <option value="medium">🟡 Medium</option>
                  <option value="low">🟢 Low</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Related To</label>
                <select
                  value={formData.relatedItemType}
                  onChange={(e) => setFormData({ ...formData, relatedItemType: e.target.value, relatedItemId: '' })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                >
                  <option value="plan">Production Plan</option>
                  <option value="shortage">Shortage</option>
                  <option value="other">Other</option>
                </select>
              </div>
              
              {formData.relatedItemType !== 'other' && (
                <div>
                  <label className="block text-sm text-gray-400 mb-1">Select Item</label>
                  <select
                    value={formData.relatedItemId}
                    onChange={(e) => setFormData({ ...formData, relatedItemId: e.target.value })}
                    className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  >
                    <option value="">Select...</option>
                    {formData.relatedItemType === 'plan' && plans.map(plan => (
                      <option key={plan.id} value={plan.id}>
                        {plan.productName} (Target: {plan.targetQuantity})
                      </option>
                    ))}
                    {formData.relatedItemType === 'shortage' && shortages.map(shortage => (
                      <option key={shortage.id} value={shortage.id}>
                        {shortage.materialName} (Shortage: {shortage.shortageQuantity})
                      </option>
                    ))}
                  </select>
                </div>
              )}
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  rows="3"
                  placeholder="Describe the priority..."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  placeholder="Who is responsible?"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Due Date</label>
                <input
                  type="date"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                >
                  <option value="pending">Pending</option>
                  <option value="in_progress">In Progress</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-blue-700 py-2 rounded-lg text-white font-semibold transition-colors"
                >
                  {editingPriority ? 'Update Priority' : 'Add Priority'}
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