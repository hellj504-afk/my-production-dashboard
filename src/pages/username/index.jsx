import { useState, useEffect } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import SummaryCards from '../../components/dashboard/SummaryCards';
import ProductGrid from '../../components/dashboard/ProductGrid';

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
    } finally {
      setLoading(false);
    }
  };

  const totalPlan = plans.reduce((sum, item) => sum + (item.targetQuantity || 0), 0);
  const totalAchieved = plans.reduce((sum, item) => sum + (item.achievedQuantity || 0), 0);
  const avgProgress = totalPlan > 0 ? ((totalAchieved / totalPlan) * 100).toFixed(1) : 0;

  if (loading) {
    return <div className="text-white text-center py-20">Loading...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">WIP PRODUCTION SUMMARY</h1>
          <p className="text-gray-400 text-sm mt-1">
            {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} - Day {new Date().getDate()}
          </p>
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

      <ProductGrid products={plans} />
    </div>
  );
}