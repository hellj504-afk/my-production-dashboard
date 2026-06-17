import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  query, 
  where, 
  orderBy,
  updateDoc,
  doc
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import ProtectedComponent from '../../components/common/ProtectedComponent';
import { Plus, Check, X } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DailyProductionPage({ user, username }) {
  const [plans, setPlans] = useState([]);
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    planId: '',
    achievedQuantity: '',
    shift: 'morning',
    operator: '',
    machineUsed: '',
    notes: ''
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

      // Fetch today's entries
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const entriesQuery = query(
        collection(db, 'dailyProduction'),
        where('date', '>=', today.toISOString()),
        orderBy('date', 'desc')
      );
      
      const entriesSnapshot = await getDocs(entriesQuery);
      const entriesData = [];
      entriesSnapshot.forEach((doc) => {
        entriesData.push({ id: doc.id, ...doc.data() });
      });
      setEntries(entriesData);
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
      const entryData = {
        ...formData,
        achievedQuantity: Number(formData.achievedQuantity),
        date: new Date().toISOString(),
        operator: formData.operator || username,
        loggedBy: username,
        timestamp: new Date().toISOString()
      };

      // Add daily entry
      await addDoc(collection(db, 'dailyProduction'), entryData);

      // Update plan's achieved quantity
      const planRef = doc(db, 'productionPlans', formData.planId);
      const plan = plans.find(p => p.id === formData.planId);
      const newAchieved = (plan.achievedQuantity || 0) + Number(formData.achievedQuantity);
      
      await updateDoc(planRef, {
        achievedQuantity: newAchieved,
        lastUpdated: new Date().toISOString()
      });

      toast.success('Production logged successfully!');
      setShowModal(false);
      setFormData({
        planId: '',
        achievedQuantity: '',
        shift: 'morning',
        operator: '',
        machineUsed: '',
        notes: ''
      });
      fetchData();
    } catch (error) {
      console.error('Error logging production:', error);
      toast.error('Failed to log production');
    }
  };

  const getProductName = (planId) => {
    const plan = plans.find(p => p.id === planId);
    return plan ? plan.productName : 'Unknown';
  };

  const getShiftBadge = (shift) => {
    const colors = {
      morning: 'bg-blue-500',
      evening: 'bg-yellow-500',
      night: 'bg-purple-500'
    };
    return colors[shift] || 'bg-gray-500';
  };

  if (loading) {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">📊 Daily Production</h1>
          <p className="text-gray-400 text-sm mt-1">Log and track daily production</p>
        </div>
        
        <ProtectedComponent user={user} permission="createDailyProduction">
          <button
            onClick={() => setShowModal(true)}
            className="bg-accent hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Log Production
          </button>
        </ProtectedComponent>
      </div>

      {/* Today's Entries */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Today's Entries
          <span className="text-sm text-gray-400 ml-2">({entries.length})</span>
        </h2>
        
        {entries.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center">
            <p className="text-gray-400">No entries logged today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-card rounded-lg p-4 shadow-lg">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-white font-semibold">
                        {getProductName(entry.planId)}
                      </h4>
                      <span className={`text-xs px-2 py-0.5 rounded ${getShiftBadge(entry.shift)}`}>
                        {entry.shift}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-2">
                      <div>
                        <p className="text-xs text-gray-400">Quantity</p>
                        <p className="text-green-400 font-semibold">{entry.achievedQuantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Operator</p>
                        <p className="text-white">{entry.operator || entry.loggedBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Machine</p>
                        <p className="text-white">{entry.machineUsed || 'N/A'}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Time</p>
                        <p className="text-white text-sm">
                          {new Date(entry.date).toLocaleTimeString()}
                        </p>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <p className="text-sm text-gray-400 mt-2">📝 {entry.notes}</p>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-500">
                      Logged by: {entry.loggedBy}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Log Production</h2>
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
                  onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
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
                <label className="block text-sm text-gray-400 mb-1">Quantity Produced</label>
                <input
                  type="number"
                  value={formData.achievedQuantity}
                  onChange={(e) => setFormData({ ...formData, achievedQuantity: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  required
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Shift</label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                >
                  <option value="morning">Morning (6AM - 2PM)</option>
                  <option value="evening">Evening (2PM - 10PM)</option>
                  <option value="night">Night (10PM - 6AM)</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Operator Name</label>
                <input
                  type="text"
                  value={formData.operator}
                  onChange={(e) => setFormData({ ...formData, operator: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  placeholder="Enter operator name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Machine Used</label>
                <input
                  type="text"
                  value={formData.machineUsed}
                  onChange={(e) => setFormData({ ...formData, machineUsed: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  placeholder="Enter machine name"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  rows="2"
                  placeholder="Any remarks..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-blue-700 py-2 rounded-lg text-white font-semibold transition-colors"
                >
                  <Check size={18} className="inline mr-1" />
                  Submit
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