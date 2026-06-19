import { useState, useEffect } from 'react';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Target, CheckCircle, Activity, 
  Zap, Cpu, Gauge, TrendingUp
} from 'lucide-react';

// ===== PRODUCTION DATA =====
const productionData = [
  { id: 1, name: 'Insulator', plan: 1000, achieved: 500 },
  { id: 2, name: 'HTCT', plan: 289, achieved: 200 },
  { id: 3, name: 'A', plan: 500, achieved: 0 },
  { id: 4, name: 'EARTHING SWITCH', plan: 200, achieved: 0 },
  { id: 5, name: 'PT (potential Transformer)', plan: 500, achieved: 0 },
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
          <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_30px_rgba(0,255,255,0.2)]"></div>
          <p className="text-cyan-400/60 text-sm font-mono">INITIALIZING...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0e1a] p-4 md:p-6">
      {/* ===== HEADER ===== */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight flex items-center gap-2">
            <span className="bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
              ⚡ Production
            </span>
            <span className="text-gray-400">Monitor</span>
          </h1>
          <p className="text-gray-500 text-sm mt-1 font-mono tracking-wider">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} — DAY {new Date().getDate()}
          </p>
        </div>
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-2 text-xs text-green-400 font-mono">
            <span className="w-2 h-2 bg-green-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(74,222,128,0.5)]"></span>
            ● LIVE
          </span>
          <span className="text-xs text-gray-600">|</span>
          <span className="text-xs text-gray-500 font-mono">
            {new Date().toLocaleTimeString()}
          </span>
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="relative bg-gradient-to-br from-cyan-950/30 to-blue-950/30 border border-cyan-500/20 rounded-xl p-5 overflow-hidden group hover:border-cyan-400/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/10 to-cyan-500/0 blur-xl group-hover:animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-cyan-400/60 text-xs font-mono tracking-wider">
              <Target size={14} /> TOTAL PLAN
            </div>
            <p className="text-3xl font-bold text-white mt-1 font-mono tracking-wider drop-shadow-[0_0_20px_rgba(0,255,255,0.15)]">
              {totalPlan.toLocaleString()}
            </p>
            <div className="w-full bg-cyan-950/50 rounded-full h-1 mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-cyan-400 to-blue-500 h-1 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.3)]" style={{ width: '100%' }}></div>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-emerald-950/30 to-cyan-950/30 border border-emerald-500/20 rounded-xl p-5 overflow-hidden group hover:border-emerald-400/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/5 via-transparent to-cyan-500/5"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500/10 to-emerald-500/0 blur-xl group-hover:animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-emerald-400/60 text-xs font-mono tracking-wider">
              <CheckCircle size={14} /> TOTAL ACHIEVED
            </div>
            <p className="text-3xl font-bold text-emerald-400 mt-1 font-mono tracking-wider animate-pulse drop-shadow-[0_0_20px_rgba(52,211,153,0.15)]">
              {totalAchieved.toLocaleString()}
            </p>
            <div className="w-full bg-emerald-950/50 rounded-full h-1 mt-2 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-400 to-cyan-400 h-1 rounded-full shadow-[0_0_20px_rgba(52,211,153,0.3)]" style={{ width: `${Math.min((totalAchieved/totalPlan)*100, 100)}%` }}></div>
            </div>
          </div>
        </div>

        <div className="relative bg-gradient-to-br from-purple-950/30 to-cyan-950/30 border border-purple-500/20 rounded-xl p-5 overflow-hidden group hover:border-purple-400/50 transition-all duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-cyan-500/5"></div>
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500/0 via-purple-500/10 to-purple-500/0 blur-xl group-hover:animate-pulse"></div>
          <div className="relative z-10">
            <div className="flex items-center gap-2 text-purple-400/60 text-xs font-mono tracking-wider">
              <Gauge size={14} /> PROGRESS
            </div>
            <div className="flex items-end gap-3 mt-1">
              <p className="text-3xl font-bold text-purple-400 font-mono tracking-wider drop-shadow-[0_0_20px_rgba(168,85,247,0.15)]">
                {avgProgress}%
              </p>
              <div className="flex-1 bg-purple-950/50 rounded-full h-2 overflow-hidden border border-purple-500/10">
                <div 
                  className="bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 h-2 rounded-full transition-all duration-1000 shadow-[0_0_20px_rgba(0,255,255,0.2)]"
                  style={{ width: `${Math.min(avgProgress, 100)}%` }}
                ></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== FUTURISTIC NEON TILES ===== */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {displayData.map((product, index) => {
          const plan = product.plan || product.targetQuantity || 0;
          const achieved = product.achieved || product.achievedQuantity || 0;
          const progress = plan > 0 ? ((achieved / plan) * 100).toFixed(1) : 0;
          
          // Neon colors based on progress
          const getNeonColor = () => {
            if (progress >= 80) return 'from-emerald-400 to-cyan-400';
            if (progress >= 50) return 'from-cyan-400 to-blue-400';
            if (progress >= 25) return 'from-yellow-400 to-orange-400';
            return 'from-red-400 to-pink-400';
          };

          const getGlowColor = () => {
            if (progress >= 80) return 'shadow-emerald-500/20';
            if (progress >= 50) return 'shadow-cyan-500/20';
            if (progress >= 25) return 'shadow-yellow-500/20';
            return 'shadow-red-500/20';
          };

          const neonColor = getNeonColor();
          const glowColor = getGlowColor();

          return (
            <div 
              key={product.id}
              className={`relative group bg-gradient-to-br from-gray-900/50 to-gray-800/30 border border-gray-700/50 rounded-xl p-5 overflow-hidden transition-all duration-500 hover:scale-[1.02] hover:border-cyan-400/30 ${glowColor} hover:shadow-2xl`}
              style={{
                animation: `fadeIn 0.5s ease-out ${index * 0.1}s backwards`
              }}
            >
              {/* Animated Border Glow */}
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              
              {/* Neon Scan Line */}
              <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/30 to-transparent animate-pulse"></div>
              
              {/* Glow Effect */}
              <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/0 via-cyan-500/5 to-cyan-500/0 blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>

              {/* Product Name with Neon Icon */}
              <div className="flex items-center justify-between mb-3 relative z-10">
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full bg-gradient-to-r ${neonColor} shadow-[0_0_10px_currentColor]`}></div>
                  <h3 className="text-white font-semibold text-sm font-mono tracking-wide truncate">
                    {product.productName || product.name}
                  </h3>
                </div>
                <span className={`text-xs font-mono font-bold bg-gradient-to-r ${neonColor} bg-clip-text text-transparent`}>
                  {progress}%
                </span>
              </div>

              {/* Neon Progress Bar */}
              <div className="relative w-full h-1.5 bg-gray-800/50 rounded-full mb-4 overflow-hidden border border-gray-700/30">
                <div 
                  className={`h-full rounded-full bg-gradient-to-r ${neonColor} transition-all duration-1000 shadow-[0_0_20px_currentColor]`}
                  style={{ width: `${Math.min(progress, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer"></div>
                </div>
              </div>

              {/* Stats - Neon Grid */}
              <div className="grid grid-cols-3 gap-2 text-center relative z-10">
                <div className="bg-gray-800/30 rounded-lg py-1.5 px-1 border border-gray-700/30">
                  <p className="text-[10px] text-gray-500 font-mono tracking-wider">PLAN</p>
                  <p className="text-white font-bold text-sm font-mono">{plan}</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg py-1.5 px-1 border border-emerald-500/20">
                  <p className="text-[10px] text-emerald-400/60 font-mono tracking-wider">ACHIEVED</p>
                  <p className="text-emerald-400 font-bold text-sm font-mono animate-pulse">{achieved}</p>
                </div>
                <div className="bg-gray-800/30 rounded-lg py-1.5 px-1 border border-yellow-500/20">
                  <p className="text-[10px] text-yellow-400/60 font-mono tracking-wider">REMAINING</p>
                  <p className="text-yellow-400 font-bold text-sm font-mono">{plan - achieved > 0 ? plan - achieved : 0}</p>
                </div>
              </div>

              {/* Status Badge with Neon Glow */}
              <div className="mt-3 pt-3 border-t border-gray-700/30 flex items-center justify-between relative z-10">
                {achieved >= plan && plan > 0 ? (
                  <span className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono tracking-wider">
                    <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(52,211,153,0.5)]"></span>
                    COMPLETE
                  </span>
                ) : plan === 0 ? (
                  <span className="text-[10px] text-gray-500 font-mono">NO TARGET</span>
                ) : (
                  <span className="text-[10px] text-cyan-400 flex items-center gap-1 font-mono tracking-wider">
                    <span className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_rgba(0,255,255,0.5)]"></span>
                    IN PROGRESS
                  </span>
                )}
                <span className="text-[10px] text-gray-600 font-mono">
                  #{product.id?.slice(0, 4) || 'N/A'}
                </span>
              </div>

              {/* Corner Decorations */}
              <div className="absolute top-2 right-2 w-6 h-6 border-t border-r border-cyan-500/10 rounded-tr-lg"></div>
              <div className="absolute bottom-2 left-2 w-6 h-6 border-b border-l border-cyan-500/10 rounded-bl-lg"></div>
            </div>
          );
        })}
      </div>

      {/* ===== FOOTER ===== */}
      <div className="mt-6 pt-4 border-t border-gray-800/50 flex justify-between text-[10px] text-gray-600 font-mono tracking-wider">
        <span className="flex items-center gap-2">
          <Zap size={12} className="text-cyan-400/40" />
          PRODUCTION MONITOR v2.0
        </span>
        <span className="flex items-center gap-2">
          <Cpu size={12} className="text-cyan-400/40" />
          INDUSTRY 4.0 • REAL-TIME
        </span>
      </div>

      {/* ===== GLOBAL CSS FOR ANIMATIONS ===== */}
      <style jsx global>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @keyframes shimmer {
          0% { transform: translateX(-100%); }
          100% { transform: translateX(100%); }
        }
        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
        .animate-fadeIn {
          animation: fadeIn 0.5s ease-out;
        }
      `}</style>
    </div>
  );
}