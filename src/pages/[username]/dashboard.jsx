import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { 
  Package, 
  TrendingUp, 
  Target, 
  CheckCircle, 
  AlertCircle,
  Zap,
  Activity,
  Cpu
} from 'lucide-react';

// ===== MOCK PRODUCTION DATA =====
const productionData = [
  { id: 1, name: 'HT CT', plan: 289, achieved: 0 },
  { id: 2, name: 'PT', plan: 100, achieved: 7 },
  { id: 3, name: 'Bushing CT', plan: 13, achieved: 0 },
  { id: 4, name: 'INSULATOR', plan: 2400, achieved: 101 },
  { id: 5, name: 'KE VCB Bushing', plan: 0, achieved: 0 },
  { id: 6, name: 'LTCT ITR-WLT', plan: 6, achieved: 0 },
  { id: 7, name: 'EARTHING SWITCH', plan: 20, achieved: 0 },
];

// ===== PRODUCT CARD COMPONENT =====
function ProductionCard({ product, index }) {
  const progress = product.plan > 0 
    ? ((product.achieved / product.plan) * 100).toFixed(1) 
    : 0;
  
  const circumference = 2 * Math.PI * 35;
  const offset = circumference - (progress / 100) * circumference;

  const productColors = {
    'HT CT': 'from-cyan-400 to-blue-600',
    'PT': 'from-emerald-400 to-cyan-600',
    'Bushing CT': 'from-yellow-400 to-amber-600',
    'INSULATOR': 'from-rose-400 to-red-600',
    'KE VCB Bushing': 'from-purple-400 to-indigo-600',
    'LTCT ITR-WLT': 'from-pink-400 to-rose-600',
    'EARTHING SWITCH': 'from-orange-400 to-yellow-600'
  };

  const glowColors = {
    'HT CT': 'shadow-cyan-500/20',
    'PT': 'shadow-emerald-500/20',
    'Bushing CT': 'shadow-yellow-500/20',
    'INSULATOR': 'shadow-rose-500/20',
    'KE VCB Bushing': 'shadow-purple-500/20',
    'LTCT ITR-WLT': 'shadow-pink-500/20',
    'EARTHING SWITCH': 'shadow-orange-500/20'
  };

  const color = productColors[product.name] || 'from-cyan-400 to-blue-600';
  const glow = glowColors[product.name] || 'shadow-cyan-500/20';

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08, duration: 0.5 }}
      whileHover={{ y: -8, scale: 1.02 }}
      className="product-card group relative glass-cyan rounded-2xl p-5 border border-cyan-500/20 hover:border-cyan-400/50 transition-all duration-500"
    >
      {/* Animated Border Glow */}
      <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-cyan-500/10 via-transparent to-blue-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
      
      {/* Holographic Scan Line */}
      <div className="absolute inset-0 rounded-2xl overflow-hidden">
        <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-[holographicScan_3s_ease-in-out_infinite]"></div>
      </div>

      {/* Product Icon / Holographic Model */}
      <div className="flex justify-center mb-3">
        <div className="holographic-model relative">
          <div className={`cube ${color}`}>
            <div className="cube-inner"></div>
          </div>
          <div className="absolute -inset-4 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all"></div>
          <div className="absolute -top-1 -right-1 w-2 h-2 bg-cyan-400 rounded-full animate-pulse shadow-[0_0_10px_cyan]"></div>
          <div className="absolute -bottom-1 -left-1 w-2 h-2 bg-blue-400 rounded-full animate-pulse shadow-[0_0_10px_blue]"></div>
        </div>
      </div>

      {/* Product Name */}
      <h3 className="text-center text-white font-bold text-lg tracking-wider font-['Orbitron'] drop-shadow-[0_0_15px_rgba(0,255,255,0.2)]">
        {product.name}
      </h3>

      {/* Plan & Achieved */}
      <div className="flex justify-between text-sm mt-3 px-2">
        <div className="text-center">
          <p className="text-gray-400 text-[10px] uppercase tracking-wider">Plan</p>
          <p className="text-white font-bold text-lg">{product.plan}</p>
        </div>
        <div className="text-center">
          <p className="text-gray-400 text-[10px] uppercase tracking-wider">Achieved</p>
          <p className="text-emerald-400 font-bold text-lg animate-pulse">{product.achieved}</p>
        </div>
      </div>

      {/* Circular Progress */}
      <div className="flex justify-center mt-4">
        <div className="relative w-24 h-24">
          <svg className="w-24 h-24 progress-ring" viewBox="0 0 100 100">
            <circle
              className="bg"
              cx="50"
              cy="50"
              r="35"
              fill="none"
              strokeWidth="6"
            />
            <circle
              className="progress"
              cx="50"
              cy="50"
              r="35"
              fill="none"
              strokeWidth="6"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              stroke={`url(#grad-${index})`}
            />
            <defs>
              <linearGradient id={`grad-${index}`} x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stopColor="#00ffff" />
                <stop offset="100%" stopColor="#0066ff" />
              </linearGradient>
            </defs>
          </svg>
          
          {/* Center Percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <span className="text-xl font-bold text-cyan-400 font-['Orbitron'] drop-shadow-[0_0_20px_rgba(0,255,255,0.3)]">
              {progress}%
            </span>
          </div>
          
          {/* Glow Effect */}
          <div className="absolute -inset-4 bg-cyan-500/5 rounded-full blur-xl animate-pulse"></div>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="flex justify-center mt-2">
        {product.achieved >= product.plan && product.plan > 0 ? (
          <span className="text-xs text-emerald-400 flex items-center gap-1">
            <CheckCircle size={14} /> Complete
          </span>
        ) : product.plan === 0 ? (
          <span className="text-xs text-gray-500 flex items-center gap-1">
            <AlertCircle size={14} /> No Target
          </span>
        ) : (
          <span className="text-xs text-cyan-400 flex items-center gap-1 animate-pulse">
            <Activity size={14} /> In Progress
          </span>
        )}
      </div>
    </motion.div>
  );
}

// ===== MAIN DASHBOARD =====
export default function DashboardPage({ user, username }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Real-time data from Firebase
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
      (error) => {
        console.error('Firebase error:', error);
        // Fallback to mock data if Firebase fails
        setPlans(productionData);
        setLoading(false);
      }
    );
    return () => unsubscribe();
  }, []);

  // Use real data or fallback
  const displayData = plans.length > 0 ? plans : productionData;

  const totalPlan = displayData.reduce((sum, item) => sum + (item.plan || item.targetQuantity || 0), 0);
  const totalAchieved = displayData.reduce((sum, item) => sum + (item.achieved || item.achievedQuantity || 0), 0);
  const avgProgress = totalPlan > 0 ? ((totalAchieved / totalPlan) * 100).toFixed(1) : 0;

  // Floating particles
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 10,
    duration: 15 + Math.random() * 20,
    size: 2 + Math.random() * 3,
  }));

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4 shadow-[0_0_40px_rgba(0,255,255,0.2)]"></div>
          <p className="text-cyan-400 font-['Orbitron'] text-sm animate-pulse">INITIALIZING HOLOGRAPHIC DISPLAY...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      {/* Background */}
      <div className="dashboard-bg"></div>
      <div className="scan-lines"></div>
      
      {/* Floating Particles */}
      <div className="particles">
        {particles.map((p) => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: `${p.left}%`,
              animationDuration: `${p.duration}s`,
              animationDelay: `${p.delay}s`,
              width: `${p.size}px`,
              height: `${p.size}px`,
            }}
          />
        ))}
      </div>

      {/* Holographic Grid Overlay */}
      <div className="fixed inset-0 holographic-grid pointer-events-none z-0"></div>

      <div className="relative z-10 p-4 md:p-8 max-w-7xl mx-auto">
        {/* ===== TOP SUMMARY PANEL ===== */}
        <motion.div
          initial={{ opacity: 0, y: -30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="glass rounded-3xl p-6 md:p-8 mb-8 border border-cyan-500/30 shadow-[0_0_60px_rgba(0,255,255,0.05)] pulse-glow relative overflow-hidden"
        >
          {/* Animated Border */}
          <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-cyan-500/5 via-transparent to-blue-500/5 animate-pulse"></div>
          
          {/* Energy Lines */}
          <div className="absolute top-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-cyan-400/50 to-transparent animate-[energyLine_3s_ease-in-out_infinite]"></div>
          <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-blue-400/30 to-transparent animate-[energyLine_4s_ease-in-out_infinite]"></div>
          
          {/* Header */}
          <div className="text-center relative">
            <h1 className="text-2xl md:text-4xl lg:text-5xl font-['Orbitron'] font-bold neon-text tracking-wider">
              WIP PRODUCTION SUMMARY
            </h1>
            <p className="text-cyan-400/60 text-sm md:text-base mt-2 font-['Orbitron'] tracking-widest">
              {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} — DAY {new Date().getDate()}
            </p>
            <div className="flex justify-center gap-6 mt-3 text-xs text-cyan-400/40 font-['Orbitron']">
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 bg-green-400 rounded-full animate-ping"></span>
                ● LIVE
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Zap size={14} className="text-cyan-400 animate-pulse" />
                AUTO-SYNC
              </span>
              <span>|</span>
              <span className="flex items-center gap-1">
                <Cpu size={14} className="text-cyan-400" />
                INDUSTRY 4.0
              </span>
            </div>
          </div>

          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-cyan rounded-2xl p-5 text-center border border-cyan-500/20 hover:border-cyan-400/40 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-cyan-400/60 text-xs uppercase tracking-wider font-['Orbitron']">
                <Target size={16} /> Global Plan Qty
              </div>
              <p className="text-3xl md:text-4xl font-['Orbitron'] font-bold text-white mt-2 drop-shadow-[0_0_30px_rgba(0,255,255,0.2)]">
                {totalPlan.toLocaleString()}
              </p>
              <div className="w-20 h-1 bg-gradient-to-r from-cyan-400 to-blue-500 rounded-full mx-auto mt-2"></div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-cyan rounded-2xl p-5 text-center border border-emerald-500/20 hover:border-emerald-400/40 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-emerald-400/60 text-xs uppercase tracking-wider font-['Orbitron']">
                <CheckCircle size={16} /> Total Achieved
              </div>
              <p className="text-3xl md:text-4xl font-['Orbitron'] font-bold text-emerald-400 mt-2 animate-pulse drop-shadow-[0_0_30px_rgba(52,211,153,0.2)]">
                {totalAchieved.toLocaleString()}
              </p>
              <div className="w-20 h-1 bg-gradient-to-r from-emerald-400 to-cyan-500 rounded-full mx-auto mt-2"></div>
            </motion.div>

            <motion.div
              whileHover={{ scale: 1.02 }}
              className="glass-cyan rounded-2xl p-5 text-center border border-purple-500/20 hover:border-purple-400/40 transition-all"
            >
              <div className="flex items-center justify-center gap-2 text-purple-400/60 text-xs uppercase tracking-wider font-['Orbitron']">
                <TrendingUp size={16} /> Average Progress
              </div>
              <div className="flex items-center justify-center gap-3 mt-2">
                <p className="text-3xl md:text-4xl font-['Orbitron'] font-bold text-purple-400 animate-pulse drop-shadow-[0_0_30px_rgba(168,85,247,0.2)]">
                  {avgProgress}%
                </p>
                <div className="flex-1 max-w-[120px] bg-cyan-950/50 rounded-full h-2 overflow-hidden border border-cyan-500/20">
                  <motion.div 
                    className="h-full bg-gradient-to-r from-cyan-400 via-purple-400 to-emerald-400 rounded-full shadow-[0_0_20px_rgba(0,255,255,0.3)]"
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min(avgProgress, 100)}%` }}
                    transition={{ duration: 1.5, ease: "easeOut" }}
                  />
                </div>
              </div>
              <div className="w-20 h-1 bg-gradient-to-r from-purple-400 to-cyan-500 rounded-full mx-auto mt-2"></div>
            </motion.div>
          </div>
        </motion.div>

        {/* ===== PRODUCT GRID ===== */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {displayData.map((product, index) => {
            // Map Firebase field names to component props
            const item = {
              name: product.productName || product.name,
              plan: product.targetQuantity || product.plan || 0,
              achieved: product.achievedQuantity || product.achieved || 0,
            };
            return <ProductionCard key={product.id || index} product={item} index={index} />;
          })}
        </div>

        {/* ===== FOOTER ===== */}
        <div className="mt-8 text-center text-[10px] text-cyan-400/20 font-['Orbitron'] tracking-[0.3em]">
          <p>◈ HOLOGRAPHIC PRODUCTION MONITOR v2.0 ◈</p>
          <p className="mt-1">SIEMENS · TESLA · INDUSTRY 4.0</p>
        </div>
      </div>
    </div>
  );
}