import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Package, TrendingUp, Target, CheckCircle, AlertCircle,
  Zap, Activity, Cpu, BarChart3, Gauge, Factory
} from 'lucide-react';

// ===== PRODUCTION DATA =====
const productionData = [
  { id: 1, name: 'HT CT', plan: 289, achieved: 200 },
  { id: 2, name: 'PT', plan: 500, achieved: 0 },
  { id: 3, name: 'Bushing CT', plan: 13, achieved: 0 },
  { id: 4, name: 'INSULATOR', plan: 1000, achieved: 500 },
  { id: 5, name: 'KE VCB Bushing', plan: 0, achieved: 0 },
  { id: 6, name: 'LTCT ITR-WLT', plan: 6, achieved: 0 },
  { id: 7, name: 'EARTHING SWITCH', plan: 200, achieved: 0 },
];

export default function DashboardPage({ user, username }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(
      collection(db, 'productionPlans'),
      (snapshot) => {
        const data = [];
        snapshot.forEach((doc) => {
          data.push({ id: doc.id, ...doc.data() });
        });
        setPlans(data);
        setLoading(false);
      },
      () => {
        setPlans(productionData);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  const displayData = plans.length > 0 ? plans : productionData;

  const totalPlan = displayData.reduce((sum, item) => sum + (item.plan || item.targetQuantity || 0), 0);
  const totalAchieved = displayData.reduce((sum, item) => sum + (item.achieved || item.achievedQuantity || 0), 0);
  const avgProgress = totalPlan > 0 ? ((totalAchieved / totalPlan) * 100).toFixed(1) : 0;

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400 text-sm">Loading production data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e17] p-4 md:p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
            Production Dashboard
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} — Day {new Date().getDate()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs text-green-400">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></span>
            LIVE
          </span>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-xs text-gray-500">Last updated: {new Date().toLocaleTimeString()}</span>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-[#111a2e] border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Target size={16} /> Total Plan
          </div>
          <p className="text-2xl font-bold text-white mt-1">{totalPlan.toLocaleString()}</p>
          <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
            <div className="bg-blue-500 h-1 rounded-full" style={{ width: '100%' }}></div>
          </div>
        </div>

        <div className="bg-[#111a2e] border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <CheckCircle size={16} /> Total Achieved
          </div>
          <p className="text-2xl font-bold text-green-400 mt-1">{totalAchieved.toLocaleString()}</p>
          <div className="w-full bg-gray-800 rounded-full h-1 mt-2">
            <div className="bg-green-500 h-1 rounded-full" style={{ width: `${Math.min((totalAchieved/totalPlan)*100, 100)}%` }}></div>
          </div>
        </div>

        <div className="bg-[#111a2e] border border-gray-800 rounded-xl p-5">
          <div className="flex items-center gap-2 text-gray-500 text-sm">
            <Gauge size={16} /> Progress
          </div>
          <div className="flex items-end gap-3 mt-1">
            <p className="text-2xl font-bold text-blue-400">{avgProgress}%</p>
            <div className="flex-1 bg-gray-800 rounded-full h-2">
              <div 
                className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                style={{ width: `${Math.min(avgProgress, 100)}%` }}
              ></div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== PRODUCT GRID ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayData.map((product) => {
          const plan = product.plan || product.targetQuantity || 0;
          const achieved = product.achieved || product.achievedQuantity || 0;
          const progress = plan > 0 ? ((achieved / plan) * 100).toFixed(1) : 0;
          const remaining = plan - achieved;

          return (
            <div key={product.id} className="bg-[#111a2e] border border-gray-800 rounded-xl p-5 hover:border-blue-500/30 transition-all hover:shadow-lg hover:shadow-blue-500/5">
              {/* Product Name */}
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-semibold text-sm">{product.productName || product.name}</h3>
                <span className="text-xs text-gray-500">{progress}%</span>
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-800 rounded-full h-2 mb-3">
                <div 
                  className="bg-gradient-to-r from-blue-500 to-cyan-400 h-2 rounded-full transition-all duration-1000"
                  style={{ width: `${Math.min(progress, 100)}%` }}
                ></div>
              </div>

              {/* Stats */}
              <div className="flex justify-between text-sm">
                <div>
                  <p className="text-gray-500 text-xs">Plan</p>
                  <p className="text-white font-medium">{plan}</p>
                </div>
                <div className="text-center">
                  <p className="text-gray-500 text-xs">Achieved</p>
                  <p className="text-green-400 font-medium">{achieved}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500 text-xs">Remaining</p>
                  <p className="text-yellow-400 font-medium">{remaining > 0 ? remaining : 0}</p>
                </div>
              </div>

              {/* Status Badge */}
              <div className="mt-3 pt-3 border-t border-gray-800 flex items-center justify-between">
                {achieved >= plan && plan > 0 ? (
                  <span className="text-xs text-green-400 flex items-center gap-1">
                    <CheckCircle size={12} /> Complete
                  </span>
                ) : plan === 0 ? (
                  <span className="text-xs text-gray-500">No Target</span>
                ) : (
                  <span className="text-xs text-blue-400 flex items-center gap-1">
                    <Activity size={12} /> In Progress
                  </span>
                )}
                <span className="text-xs text-gray-600">ID: {product.id?.slice(0, 4) || 'N/A'}</span>
              </div>
            </div>
          );
        })}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-6 pt-4 border-t border-gray-800 flex justify-between text-xs text-gray-600">
        <span>Production Dashboard v2.0</span>
        <span>Industry 4.0 • Real-time Monitoring</span>
      </div>
    </div>
  );
}