import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SummaryCards from '../../components/dashboard/SummaryCards';
import ProductGrid from '../../components/dashboard/ProductGrid';
import toast from 'react-hot-toast';

export default function DashboardPage({ user, username }) {
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log("🔄 Fetching plans from Firebase...");
      
      // Check if Firebase is initialized
      if (!db) {
        throw new Error("Firebase not initialized");
      }
      
      const querySnapshot = await getDocs(collection(db, 'productionPlans'));
      console.log("✅ Query successful, size:", querySnapshot.size);
      
      const data = [];
      querySnapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      
      console.log("📦 Data fetched:", data);
      setPlans(data);
      
      if (data.length === 0) {
        toast('ℹ️ No plans found. Create your first plan!');
      }
    } catch (error) {
      console.error('❌ Error fetching plans:', error);
      setError(error.message);
      toast.error('Failed to load plans: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const totalPlan = plans.reduce((sum, item) => sum + (item.targetQuantity || 0), 0);
  const totalAchieved = plans.reduce((sum, item) => sum + (item.achievedQuantity || 0), 0);
  const avgProgress = totalPlan > 0 ? ((totalAchieved / totalPlan) * 100).toFixed(1) : 0;

  // Loading State
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white text-lg">Loading dashboard...</p>
          <p className="text-gray-400 text-sm mt-2">Fetching production plans...</p>
        </div>
      </div>
    );
  }

  // Error State
  if (error) {
    return (
      <div className="bg-red-900/20 border border-red-500 rounded-lg p-8 text-center">
        <h2 className="text-2xl font-bold text-red-400">⚠️ Connection Error</h2>
        <p className="text-gray-300 mt-2">{error}</p>
        <button 
          onClick={fetchPlans}
          className="mt-4 bg-accent hover:bg-blue-700 px-6 py-2 rounded-lg text-white transition-colors"
        >
          🔄 Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">WIP PRODUCTION SUMMARY</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} - Day {new Date().getDate()}
          </p>
          <p className="text-xs text-gray-500 mt-1">📊 Total Plans: {plans.length}</p>
        </div>
        <div className="text-right">
          <p className="text-sm text-gray-400">Welcome back,</p>
          <p className="text-white font-semibold">{user.name}</p>
        </div>
      </div>

      <SummaryCards 
        totalPlan={totalPlan} 
        totalAchieved={totalAchieved} 
        avgProgress={avgProgress} 
      />

      {plans.length === 0 ? (
        <div className="bg-card rounded-lg p-8 text-center">
          <p className="text-gray-400 text-lg">📭 No production plans found</p>
          <p className="text-gray-500 text-sm mt-2">Go to "Production Plans" tab to create your first plan</p>
        </div>
      ) : (
        <ProductGrid products={plans} />
      )}
    </div>
  );
}