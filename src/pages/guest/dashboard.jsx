import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { collection, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Package, Shield, LogIn, User, X } from 'lucide-react';

export default function GuestDashboard() {
  const router = useRouter();
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showLogin, setShowLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    const unsubscribePlans = onSnapshot(collection(db, 'productionPlans'), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setPlans(data);
      setLoading(false);
    });

    return () => unsubscribePlans();
  }, []);

  // ✅ Admin Login Handler
  const handleAdminLogin = () => {
    if (adminUsername === 'Shaveel@CTPT') {
      router.push('/shaveel/dashboard');
    } else {
      setLoginError('❌ Invalid Admin Username');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  const totalPlan = plans.reduce((sum, item) => sum + (item.targetQuantity || 0), 0);
  const totalAchieved = plans.reduce((sum, item) => sum + (item.achievedQuantity || 0), 0);
  const avgProgress = totalPlan > 0 ? ((totalAchieved / totalPlan) * 100).toFixed(1) : 0;

  const productColors = {
    'HT CT': 'from-cyan-400 to-cyan-600',
    'PT': 'from-emerald-400 to-emerald-600',
    'Bushing CT': 'from-yellow-400 to-yellow-600',
    'INSULATOR': 'from-rose-400 to-rose-600',
    'KE VCB Bushing': 'from-purple-400 to-purple-600',
    'LTCT ITR-WLT': 'from-pink-400 to-pink-600',
    'EARTHING SWITCH': 'from-orange-400 to-orange-600'
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          ⚡ DAILY PRODUCTION PROGRESS
        </h1>
        <p className="text-cyan-400/60 text-sm mt-1 animate-pulse">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} - DAY {new Date().getDate()}
        </p>
        <div className="flex justify-center gap-4 mt-2 text-xs text-gray-500">
          <span className="flex items-center gap-1">
            <span className="w-2 h-2 bg-green-500 rounded-full animate-ping"></span>
            LIVE
          </span>
          <span>|</span>
          <span>🔄 Auto-sync</span>
        </div>
        <div className="mt-2 text-xs text-purple-400/60">
          👀 View-Only Mode
        </div>
      </div>

      {/* ===== ADMIN LOGIN SECTION ===== */}
      <div className="bg-purple-500/10 border border-purple-500/30 rounded-2xl p-4 shadow-lg shadow-purple-500/10">
        {!showLogin ? (
          <button
            onClick={() => setShowLogin(true)}
            className="w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <Shield size={20} />
            🔐 Admin Login
          </button>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <p className="text-purple-400 text-sm font-semibold">🔐 Admin Login</p>
              <button
                onClick={() => {
                  setShowLogin(false);
                  setAdminUsername('');
                  setLoginError('');
                }}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <input
                type="text"
                placeholder="Enter Admin Username"
                value={adminUsername}
                onChange={(e) => {
                  setAdminUsername(e.target.value);
                  setLoginError('');
                }}
                className="bg-white/10 border border-white/10 rounded-xl px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:border-purple-400/50 transition-all"
                onKeyDown={(e) => e.key === 'Enter' && handleAdminLogin()}
              />
              {loginError && (
                <p className="text-red-400 text-sm animate-pulse">{loginError}</p>
              )}
              <div className="flex gap-3">
                <button
                  onClick={handleAdminLogin}
                  className="flex-1 bg-purple-500 hover:bg-purple-600 py-3 rounded-xl text-white font-semibold flex items-center justify-center gap-2 transition-all"
                >
                  <LogIn size={18} />
                  Login
                </button>
                <button
                  onClick={() => {
                    setShowLogin(false);
                    setAdminUsername('');
                    setLoginError('');
                  }}
                  className="flex-1 bg-white/10 hover:bg-white/20 py-3 rounded-xl text-gray-400 transition-all"
                >
                  Cancel
                </button>
              </div>
            </div>
            <div className="text-xs text-gray-500 text-center">
              Username: <span className="text-purple-400">Shaveel@CTPT</span>
            </div>
          </div>
        )}
      </div>

      {/* Products Section - View Only */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <Package size={18} />
            PRODUCTS
            <span className="text-gray-500 text-xs ml-2">({plans.length})</span>
          </h2>
          <span className="text-xs text-gray-500">🔒 View Only</span>
        </div>

        <div className="flex flex-wrap gap-2 mt-3">
          {plans.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-gray-300"
            >
              <span>{product.productName}</span>
              <span className="text-gray-500 text-xs">({product.targetQuantity})</span>
            </div>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Global Plan Qty</p>
          <p className="text-3xl font-bold text-white mt-2">{totalPlan.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg shadow-emerald-500/10 hover:shadow-emerald-500/20 transition-all">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Total Achieved</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2 animate-pulse">{totalAchieved.toLocaleString()}</p>
        </div>
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg shadow-cyan-500/10 hover:shadow-cyan-500/20 transition-all">
          <p className="text-gray-400 text-sm uppercase tracking-wider">Average Progress</p>
          <div className="flex items-center justify-center gap-4 mt-2">
            <p className="text-3xl font-bold text-cyan-400 animate-pulse">{avgProgress}%</p>
            <div className="flex-1 max-w-[100px] bg-white/10 rounded-full h-2">
              <div className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500" style={{ width: `${Math.min(avgProgress, 100)}%` }}></div>
            </div>
          </div>
        </div>
      </div>

      {/* Tower Progress Bars */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {plans.map((product) => {
          const progress = product.targetQuantity > 0 ? ((product.achievedQuantity / product.targetQuantity) * 100).toFixed(1) : 0;
          const color = productColors[product.productName] || 'from-gray-400 to-gray-600';
          const towerHeight = Math.min(progress, 100);

          return (
            <div key={product.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105">
              <h3 className="text-lg font-semibold text-white tracking-wide text-center">{product.productName}</h3>
              
              <div className="relative w-full h-48 bg-white/5 rounded-lg mt-3 overflow-hidden border border-white/5">
                <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-white/20 z-10"></div>
                
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${color} transition-all duration-1000 rounded-t-lg shadow-lg shadow-cyan-500/20 overflow-hidden`}
                  style={{ height: `${Math.min(towerHeight, 100)}%` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 animate-[wave_2s_ease-in-out_infinite]"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[wave_3s_ease-in-out_infinite]"></div>
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>
                </div>
                
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${color} blur-xl opacity-30 transition-all duration-1000`}
                  style={{ height: `${Math.min(towerHeight, 100)}%` }}
                ></div>
                
                <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                  <span className="text-2xl font-bold text-white drop-shadow-lg animate-pulse">{progress}%</span>
                  <span className="text-xs text-gray-400">{product.achievedQuantity || 0} / {product.targetQuantity}</span>
                </div>
              </div>
              
              <div className="flex justify-between text-xs text-gray-400 mt-2 px-1">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
                  🎯 {product.targetQuantity}
                </span>
                <span className="text-emerald-400 flex items-center gap-1">
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  ✅ {product.achievedQuantity || 0}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}