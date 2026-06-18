import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import toast from 'react-hot-toast';

export default function DashboardPage({ user, username }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

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

  // Calculate totals
  const totalPlan = plans.reduce((sum, item) => sum + (item.targetQuantity || 0), 0);
  const totalAchieved = plans.reduce((sum, item) => sum + (item.achievedQuantity || 0), 0);
  const avgProgress = totalPlan > 0 ? ((totalAchieved / totalPlan) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading production data...</p>
        </div>
      </div>
    );
  }

  // Product colors (neon theme)
  const productColors = {
    'HT CT': 'border-cyan-400',
    'PT': 'border-emerald-400',
    'Bushing CT': 'border-yellow-400',
    'INSULATOR': 'border-rose-400',
    'KE VCB Bushing': 'border-purple-400',
    'LTCT ITR-WLT': 'border-pink-400',
    'EARTHING SWITCH': 'border-orange-400'
  };

  const productGlows = {
    'HT CT': 'shadow-cyan-500/20',
    'PT': 'shadow-emerald-500/20',
    'Bushing CT': 'shadow-yellow-500/20',
    'INSULATOR': 'shadow-rose-500/20',
    'KE VCB Bushing': 'shadow-purple-500/20',
    'LTCT ITR-WLT': 'shadow-pink-500/20',
    'EARTHING SWITCH': 'shadow-orange-500/20'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
          WIP PRODUCTION SUMMARY
        </h1>
        <p className="text-cyan-400/60 text-sm mt-1">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} - DAY {new Date().getDate()}
        </p>
      </div>

      {/* Summary Cards - Neon Glass */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg shadow-cyan-500/5">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Global Plan Qty</p>
          <p className="text-3xl font-bold text-white mt-2">{totalPlan.toLocaleString()}</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg shadow-emerald-500/5">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Total Achieved</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2">{totalAchieved.toLocaleString()}</p>
        </div>
        
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg shadow-cyan-500/5">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Average Progress</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <p className="text-3xl font-bold text-cyan-400">{avgProgress}%</p>
            <div className="flex-1 max-w-[100px] bg-white/10 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${Math.min(avgProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* Product Grid - Neon Glass Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {plans.map((product) => {
          const progress = product.targetQuantity > 0 
            ? ((product.achievedQuantity / product.targetQuantity) * 100).toFixed(1) 
            : 0;
          
          const colorClass = productColors[product.productName] || 'border-gray-500';
          const glowClass = productGlows[product.productName] || 'shadow-gray-500/20';
          
          return (
            <div 
              key={product.id} 
              className={`bg-white/5 backdrop-blur-xl border-l-4 ${colorClass} border border-white/10 rounded-2xl p-4 shadow-lg ${glowClass} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/10`}
            >
              <h3 className="text-lg font-semibold text-white tracking-wide">{product.productName}</h3>
              <div className="mt-3 space-y-1">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">PLAN</span>
                  <span className="text-white font-medium">{product.targetQuantity}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-400">ACHIEVED</span>
                  <span className="text-emerald-400 font-medium">{product.achievedQuantity || 0}</span>
                </div>
                <div className="w-full bg-white/10 rounded-full h-2 mt-2">
                  <div 
                    className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(progress, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-right font-bold text-white mt-1">
                  {progress}%
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}