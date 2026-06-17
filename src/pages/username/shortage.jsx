import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  doc,
  query,
  where
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import ProtectedComponent from '../../components/common/ProtectedComponent';
import { Plus, Check, X, AlertTriangle, CheckCircle } from 'lucide-react';
import toast from 'react-hot-toast';

export default function ShortagesPage({ user, username }) {
  const [shortages, setShortages] = useState([]);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    planId: '',
    materialName: '',
    requiredQuantity: '',
    availableQuantity: '',
    assignedTo: ''
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      // Fetch plans
      const plansSnapshot = await getDocs(collection(db, 'productionPlans'));
      const plansData = [];
      plansSnapshot.forEach((doc) => {
        plansData.push({ id: doc.id, ...doc.data() });
      });
      setPlans(plansData);

      // Fetch shortages
      const shortagesSnapshot = await getDocs(collection(db, 'shortages'));
      const shortagesData = [];
      shortagesSnapshot.forEach((doc) => {
        shortagesData.push({ id: doc.id, ...doc.data() });
      });
      setShortages(shortagesData);
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
      const shortageData = {
        ...formData,
        requiredQuantity: Number(formData.requiredQuantity),
        availableQuantity: Number(formData.availableQuantity),
        shortageQuantity: Number(formData.requiredQuantity) - Number(formData.availableQuantity),
        status: 'critical',
        reportedBy: username,
        reportedAt: new Date().toISOString(),
        resolvedAt: null,
        resolvedBy: null,
        resolutionNotes: ''
      };

      await addDoc(collection(db, 'shortages'), shortageData);
      toast.success('Shortage reported successfully!');
      setShowModal(false);
      setFormData({
        planId: '',
        materialName: '',
        requiredQuantity: '',
        availableQuantity: '',
        assignedTo: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error reporting shortage:', error);
      toast.error('Failed to report shortage');
    }
  };

  const handleResolve = async (shortageId) => {
    if (!confirm('Mark this shortage as resolved?')) return;

    try {
      await updateDoc(doc(db, 'shortages', shortageId), {
        status: 'resolved',
        resolvedBy: username,
        resolvedAt: new Date().toISOString()
      });
      toast.success('Shortage marked as resolved!');
      fetchData();
    } catch (error) {
      console.error('Error resolving shortage:', error);
      toast.error('Failed to resolve shortage');
    }
  };

  const getProductName = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.productName : 'Unknown';
  };

  const filteredShortages = filter === 'all' 
    ? shortages 
    : shortages.filter(s => s.status === filter);

  if (loading) {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">⚠️ Shortages</h1>
          <p className="text-gray-400 text-sm mt-1">Track and resolve material shortages</p>
        </div>
        
        <ProtectedComponent user={user} permission="createShortage">
          <button
            onClick={() => setShowModal(true)}
            className="bg-red-600 hover:bg-red-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Report Shortage
          </button>
        </ProtectedComponent>
      </div>

      {/* Filters */}
      <div className="flex gap-2">
        <button
          onClick={() => setFilter('all')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'all' ? 'bg-accent text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          All
        </button>
        <button
          onClick={() => setFilter('critical')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'critical' ? 'bg-red-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Critical
        </button>
        <button
          onClick={() => setFilter('resolved')}
          className={`px-4 py-2 rounded-lg transition-colors ${
            filter === 'resolved' ? 'bg-green-600 text-white' : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
          }`}
        >
          Resolved
        </button>
      </div>

      {/* Shortages List */}
      <div className="space-y-4">
        {filteredShortages.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center">
            <p className="text-gray-400">No shortages found</p>
          </div>
        ) : (
          filteredShortages.map((shortage) => {
            const isCritical = shortage.status === 'critical';
            const progress = shortage.requiredQuantity > 0 
              ? ((shortage.availableQuantity / shortage.requiredQuantity) * 100).toFixed(1)
              : 0;

            return (
              <div 
                key={shortage.id} 
                className={`bg-card rounded-lg p-4 shadow-lg border-l-4 ${
                  isCritical ? 'border-red-500' : 'border-green-500'
                }`}
              >
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      {isCritical ? (
                        <AlertTriangle className="text-red-500" size={20} />
                      ) : (
                        <CheckCircle className="text-green-500" size={20} />
                      )}
                      <h3 className="text-xl font-semibold text-white">
                        {shortage.materialName || getProductName(shortage.planId)}
                      </h3>
                      <span className={`text-xs px-2 py-0.5 rounded ${
                        isCritical ? 'bg-red-600' : 'bg-green-600'
                      }`}>
                        {shortage.status.toUpperCase()}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-2">
                      <div>
                        <p className="text-xs text-gray-400">Required</p>
                        <p className="text-white font-semibold">{shortage.requiredQuantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Available</p>
                        <p className={`font-semibold ${
                          isCritical ? 'text-red-400' : 'text-green-400'
                        }`}>
                          {shortage.availableQuantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Shortage</p>
                        <p className="text-yellow-400 font-semibold">
                          {shortage.shortageQuantity}
                        </p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Progress</p>
                        <p className="text-blue-400 font-semibold">{progress}%</p>
                      </div>
                    </div>
                    
                    <div className="w-full bg-gray-700 rounded-full h-2 mt-2">
                      <div 
                        className={`h-2 rounded-full transition-all duration-500 ${
                          isCritical ? 'bg-red-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${Math.min(progress, 100)}%` }}
                      ></div>
                    </div>
                    
                    <div className="text-xs text-gray-500 mt-2">
                      Reported by: {shortage.reportedBy} | {new Date(shortage.reportedAt).toLocaleString()}
                      {shortage.resolvedBy && ` | Resolved by: ${shortage.resolvedBy}`}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    {isCritical && (
                      <ProtectedComponent user={user} permission="resolveShortage">
                        <button
                          onClick={() => handleResolve(shortage.id)}
                          className="bg-green-600 hover:bg-green-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
                        >
                          <Check size={18} />
                          Mark Complete
                        </button>
                      </ProtectedComponent>
                    )}
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
              <h2 className="text-2xl font-bold text-white">Report Shortage</h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Product</label>
                <select
                  value={formData.planId}
                  onChange={(e) => {
                    const plan = plans.find(p => p.id === e.target.value);
                    setFormData({ 
                      ...formData, 
                      planId: e.target.value,
                      materialName: plan ? plan.productName : ''
                    });
                  }}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                >
                  <option value="">Select Product</option>
                  {plans.map(plan => (
                    <option key={plan.id} value={plan.id}>
                      {plan.productName} (Target: {plan.targetQuantity})
                    </option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Material Name</label>
                <input
                  type="text"
                  value={formData.materialName}
                  onChange={(e) => setFormData({ ...formData, materialName: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                  placeholder="e.g., INSULATOR, COPPER, etc."
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Required Quantity</label>
                <input
                  type="number"
                  value={formData.requiredQuantity}
                  onChange={(e) => setFormData({ ...formData, requiredQuantity: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Available Quantity</label>
                <input
                  type="number"
                  value={formData.availableQuantity}
                  onChange={(e) => setFormData({ ...formData, availableQuantity: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                  min="0"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Assigned To</label>
                <input
                  type="text"
                  value={formData.assignedTo}
                  onChange={(e) => setFormData({ ...formData, assignedTo: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  placeholder="Who is working on this?"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-red-600 hover:bg-red-700 py-2 rounded-lg text-white font-semibold transition-colors"
                >
                  Report Shortage
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