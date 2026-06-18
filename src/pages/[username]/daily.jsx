import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, updateDoc, doc, query, where, orderBy } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, Check, X, Clock } from 'lucide-react';
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
    overtime: 'none',
    notes: ''
  });

  const shiftOptions = [
    { value: 'morning', label: '🌅 Morning (7:00 AM - 4:00 PM)' },
    { value: 'evening', label: '🌇 Evening (2:00 PM - 10:00 PM)' },
    { value: 'night', label: '🌙 Night (7:00 PM - 4:00 AM)' },
  ];

  const overtimeOptions = [
    { value: 'none', label: 'No Overtime' },
    { value: '2hr', label: '⏱️ 2 Hours Overtime' },
    { value: '4hr', label: '⏱️ 4 Hours Overtime' },
  ];

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
        loggedBy: username,
        timestamp: new Date().toISOString()
      };

      await addDoc(collection(db, 'dailyProduction'), entryData);

      const planRef = doc(db, 'productionPlans', formData.planId);
      const plan = plans.find(p => p.id === formData.planId);
      const newAchieved = (plan.achievedQuantity || 0) + Number(formData.achievedQuantity);
      
      await updateDoc(planRef, {
        achievedQuantity: newAchieved,
        lastUpdated: new Date().toISOString()
      });

      toast.success('✅ Production logged successfully!');
      setShowModal(false);
      setFormData({
        planId: '',
        achievedQuantity: '',
        shift: 'morning',
        overtime: 'none',
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
      morning: 'bg-cyan-500',
      evening: 'bg-yellow-500',
      night: 'bg-purple-500'
    };
    return colors[shift] || 'bg-gray-500';
  };

  const getOvertimeLabel = (overtime) => {
    const option = overtimeOptions.find(o => o.value === overtime);
    return option ? option.label : 'No Overtime';
  };

  if (loading) {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">📊 Daily Production</h1>
          <p className="text-gray-400 text-sm mt-1">Log daily production with shift & overtime</p>
        </div>
        
        <button
          onClick={() => setShowModal(true)}
          className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-all border border-cyan-400/30"
        >
          <Plus size={20} />
          Log Production
        </button>
      </div>

      {/* Today's Entries */}
      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          Today's Entries
          <span className="text-sm text-gray-400 ml-2">({entries.length})</span>
        </h2>
        
        {entries.length === 0 ? (
          <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-8 text-center">
            <p className="text-gray-400">No entries logged today</p>
          </div>
        ) : (
          <div className="space-y-3">
            {entries.map((entry) => (
              <div key={entry.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg">
                <div className="flex flex-wrap justify-between items-start gap-3">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h4 className="text-white font-semibold">{getProductName(entry.planId)}</h4>
                      <span className={`text-xs px-2 py-0.5 rounded ${getShiftBadge(entry.shift)}`}>
                        {entry.shift}
                      </span>
                      {entry.overtime && entry.overtime !== 'none' && (
                        <span className="text-xs bg-orange-500/30 text-orange-300 px-2 py-0.5 rounded border border-orange-500/30">
                          ⏱️ {getOvertimeLabel(entry.overtime)}
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-2">
                      <div>
                        <p className="text-xs text-gray-400">Quantity</p>
                        <p className="text-emerald-400 font-semibold">{entry.achievedQuantity}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Logged By</p>
                        <p className="text-white">{entry.loggedBy}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400">Time</p>
                        <p className="text-white text-sm">{new Date(entry.date).toLocaleTimeString()}</p>
                      </div>
                    </div>
                    
                    {entry.notes && (
                      <p className="text-sm text-gray-400 mt-2">📝 {entry.notes}</p>
                    )}
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
          <div className="bg-[#0d0d2b] rounded-2xl p-6 max-w-md w-full border border-white/10">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">Log Production</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-white">
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Product</label>
                <select
                  value={formData.planId}
                  onChange={(e) => setFormData({ ...formData, planId: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
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
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
                  required
                  min="1"
                />
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
                  <Clock size={16} /> Shift
                </label>
                <select
                  value={formData.shift}
                  onChange={(e) => setFormData({ ...formData, shift: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
                >
                  {shiftOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1 flex items-center gap-2">
                  ⏱️ Overtime
                </label>
                <select
                  value={formData.overtime}
                  onChange={(e) => setFormData({ ...formData, overtime: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
                >
                  {overtimeOptions.map(option => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Notes (Optional)</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-cyan-400/50"
                  rows="2"
                  placeholder="Any remarks..."
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button type="submit" className="flex-1 bg-cyan-400 hover:bg-cyan-500 py-2 rounded-lg text-black font-semibold transition-all">
                  <Check size={18} className="inline mr-1" /> Submit
                </button>
                <button type="button" onClick={() => setShowModal(false)} className="flex-1 bg-white/10 hover:bg-white/20 py-2 rounded-lg text-white font-semibold transition-all">
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