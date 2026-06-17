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
import ProtectedComponent from '../../components/common/ProtectedComponent';
import { Plus, Edit, Trash2, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ProductionPlansPage({ user, username }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({
    productName: '',
    targetQuantity: '',
    achievedQuantity: 0,
    status: 'ongoing'
  });

  const productOptions = [
    'HT CT', 'PT', 'Bushing CT', 'INSULATOR',
    'KE VCB Bushing', 'LTCT ITR-WLT', 'EARTHING SWITCH'
  ];

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const querySnapshot = await getDocs(collection(db, 'productionPlans'));
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setPlans(data);
    } catch (error) {
      console.error('Error fetching plans:', error);
      toast.error('Failed to load plans');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const planData = {
        ...formData,
        targetQuantity: Number(formData.targetQuantity),
        achievedQuantity: Number(formData.achievedQuantity) || 0,
        createdAt: new Date().toISOString(),
        createdBy: username,
        lastUpdated: new Date().toISOString()
      };

      if (editingPlan) {
        await updateDoc(doc(db, 'productionPlans', editingPlan.id), planData);
        toast.success('Plan updated successfully!');
      } else {
        await addDoc(collection(db, 'productionPlans'), planData);
        toast.success('Plan created successfully!');
      }
      
      setShowModal(false);
      setEditingPlan(null);
      setFormData({ productName: '', targetQuantity: '', achievedQuantity: 0, status: 'ongoing' });
      fetchPlans();
    } catch (error) {
      console.error('Error saving plan:', error);
      toast.error('Failed to save plan');
    }
  };

  const handleDelete = async (planId) => {
    if (!confirm('Are you sure you want to delete this plan?')) return;
    try {
      await deleteDoc(doc(db, 'productionPlans', planId));
      toast.success('Plan deleted successfully!');
      fetchPlans();
    } catch (error) {
      console.error('Error deleting plan:', error);
      toast.error('Failed to delete plan');
    }
  };

  const handleEdit = (plan) => {
    setEditingPlan(plan);
    setFormData({
      productName: plan.productName,
      targetQuantity: plan.targetQuantity,
      achievedQuantity: plan.achievedQuantity || 0,
      status: plan.status || 'ongoing'
    });
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch(status) {
      case 'ongoing': return 'bg-green-500';
      case 'completed': return 'bg-blue-500';
      case 'on_hold': return 'bg-yellow-500';
      default: return 'bg-gray-500';
    }
  };

  if (loading) {
    return <div className="text-white text-center py-20">Loading plans...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">📋 Production Plans</h1>
          <p className="text-gray-400 text-sm mt-1">Manage all production plans</p>
        </div>
        
        <ProtectedComponent user={user} permission="createPlan">
          <button
            onClick={() => {
              setEditingPlan(null);
              setFormData({ productName: '', targetQuantity: '', achievedQuantity: 0, status: 'ongoing' });
              setShowModal(true);
            }}
            className="bg-accent hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Create New Plan
          </button>
        </ProtectedComponent>
      </div>

      <div className="grid grid-cols-1 gap-4">
        {plans.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center">
            <p className="text-gray-400">No plans found. Create your first plan!</p>
          </div>
        ) : (
          plans.map((plan) => {
            const progress = plan.targetQuantity > 0 
              ? ((plan.achievedQuantity / plan.targetQuantity) * 100).toFixed(1) 
              : 0;
            
            return (
              <div key={plan.id} className="bg-card rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
                <div className="flex flex-wrap justify-between items-start gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-xl font-semibold text-white">{plan.productName}</h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${getStatusColor(plan.status)}`}>
                        {plan.status?.toUpperCase() || 'ONGOING'}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-400">Target</p>
                        <p className="text-white font-semibold">{plan.targetQuantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Achieved</p>
                        <p className="text-green-400 font-semibold">{plan.achievedQuantity || 0}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Remaining</p>
                        <p className="text-yellow-400 font-semibold">
                          {plan.targetQuantity - (plan.achievedQuantity || 0)}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Progress</p>
                        <p className="text-blue-400 font-semibold">{progress}%</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-3">
                      <div 
                        className="bg-green-500 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Created by: {plan.createdBy || 'Unknown'} | Last updated: {new Date(plan.lastUpdated).toLocaleDateString()}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <ProtectedComponent user={user} permission="editPlan">
                      <button
                        onClick={() => handleEdit(plan)}
                        className="bg-yellow-600 hover:bg-yellow-700 p-2 rounded-lg text-white transition-colors"
                      >
                        <Edit size={18} />
                      </button>
                    </ProtectedComponent>
                    
                    <ProtectedComponent user={user} permission="deletePlan">
                      <button
                        onClick={() => handleDelete(plan.id)}
                        className="bg-red-600 hover:bg-red-700 p-2 rounded-lg text-white transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </ProtectedComponent>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingPlan ? 'Edit Plan' : 'Create New Plan'}
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
                <label className="block text-sm text-gray-400 mb-1">Product Name</label>
                <select
                  value={formData.productName}
                  onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                >
                  <option value="">Select Product</option>
                  {productOptions.map(product => (
                    <option key={product} value={product}>{product}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Target Quantity</label>
                <input
                  type="number"
                  value={formData.targetQuantity}
                  onChange={(e) => setFormData({ ...formData, targetQuantity: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                >
                  <option value="ongoing">Ongoing</option>
                  <option value="completed">Completed</option>
                  <option value="on_hold">On Hold</option>
                </select>
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-blue-700 py-2 rounded-lg text-white font-semibold transition-colors"
                >
                  {editingPlan ? 'Update Plan' : 'Create Plan'}
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