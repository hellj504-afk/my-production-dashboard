import { useState } from 'react';
import { useRouter } from 'next/router';
import { Shield, LogIn, User } from 'lucide-react';
import { USER_CONFIG } from '../../config/users';

export default function GuestDashboard() {
  const router = useRouter();
  const [showLogin, setShowLogin] = useState(false);
  const [adminUsername, setAdminUsername] = useState('');
  const [loginError, setLoginError] = useState('');

  // ✅ Admin username check
  const handleAdminLogin = () => {
    if (adminUsername === 'Shaveel@CTPT') {
      router.push('/shaveel/dashboard');
    } else {
      setLoginError('❌ Invalid Admin Username');
      setTimeout(() => setLoginError(''), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e] flex items-center justify-center p-4">
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 max-w-md w-full shadow-2xl shadow-cyan-500/10 text-center">
        
        {/* Logo/Icon */}
        <div className="w-20 h-20 rounded-full bg-gradient-to-r from-cyan-400 to-purple-500 flex items-center justify-center mx-auto shadow-lg shadow-cyan-500/20">
          <User size={40} className="text-white" />
        </div>
        
        <h1 className="text-3xl font-bold text-white mt-4">👀 Viewer Dashboard</h1>
        <p className="text-gray-400 text-sm mt-2">You are viewing as a Guest</p>
        
        <div className="mt-6 border-t border-white/10 pt-6">
          <p className="text-gray-500 text-xs">📊 Production Summary</p>
          <div className="grid grid-cols-2 gap-4 mt-4">
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-xs">Total Products</p>
              <p className="text-2xl font-bold text-white">7</p>
            </div>
            <div className="bg-white/5 rounded-xl p-4">
              <p className="text-gray-400 text-xs">Total Target</p>
              <p className="text-2xl font-bold text-cyan-400">2,828</p>
            </div>
          </div>
        </div>

        {/* ✅ Admin Login Button */}
        {!showLogin ? (
          <button
            onClick={() => setShowLogin(true)}
            className="mt-6 w-full bg-purple-500/20 hover:bg-purple-500/30 text-purple-400 border border-purple-500/30 py-3 rounded-xl flex items-center justify-center gap-2 transition-all duration-300 hover:scale-105"
          >
            <Shield size={20} />
            Admin Login
          </button>
        ) : (
          <div className="mt-6 space-y-4">
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
          </div>
        )}

        <div className="mt-6 text-xs text-gray-600">
          <p>🔒 Admin Login: <span className="text-purple-400">Shaveel@CTPT</span></p>
        </div>
      </div>
    </div>
  );
}
