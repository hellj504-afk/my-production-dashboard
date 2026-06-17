
import { 
  collection, 
  getDocs, 
  getDoc,
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  where,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from './config';
import toast from 'react-hot-toast';

// ==================== PRODUCTION PLANS ====================

// Get all plans
export const getPlans = async () => {
  try {
    const querySnapshot = await getDocs(collection(db, 'productionPlans'));
    const plans = [];
    querySnapshot.forEach((doc) => {
      plans.push({ id: doc.id, ...doc.data() });
    });
    return plans;
  } catch (error) {
    console.error('Error fetching plans:', error);
    toast.error('Failed to fetch plans');
    return [];
  }
};

// Get single plan
export const getPlanById = async (planId) => {
  try {
    const docRef = doc(db, 'productionPlans', planId);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() };
    }
    return null;
  } catch (error) {
    console.error('Error fetching plan:', error);
    return null;
  }
};

// Create plan
export const createPlan = async (planData) => {
  try {
    const docRef = await addDoc(collection(db, 'productionPlans'), {
      ...planData,
      createdAt: new Date().toISOString(),
      achievedQuantity: 0,
      status: 'ongoing'
    });
    toast.success('Plan created successfully!');
    return docRef.id;
  } catch (error) {
    console.error('Error creating plan:', error);
    toast.error('Failed to create plan');
    return null;
  }
};

// Update plan
export const updatePlan = async (planId, planData) => {
  try {
    await updateDoc(doc(db, 'productionPlans', planId), {
      ...planData,
      lastUpdated: new Date().toISOString()
    });
    toast.success('Plan updated successfully!');
    return true;
  } catch (error) {
    console.error('Error updating plan:', error);
    toast.error('Failed to update plan');
    return false;
  }
};

// Delete plan
export const deletePlan = async (planId) => {
  try {
    await deleteDoc(doc(db, 'productionPlans', planId));
    toast.success('Plan deleted successfully!');
    return true;
  } catch (error) {
    console.error('Error deleting plan:', error);
    toast.error('Failed to delete plan');
    return false;
  }
};

// ==================== DAILY PRODUCTION ====================

// Get daily production entries
export const getDailyProduction = async (date = null) => {
  try {
    let q = collection(db, 'dailyProduction');
    if (date) {
      const startDate = new Date(date);
      startDate.setHours(0, 0, 0, 0);
      const endDate = new Date(date);
      endDate.setHours(23, 59, 59, 999);
      
      q = query(
        collection(db, 'dailyProduction'),
        where('date', '>=', startDate.toISOString()),
        where('date', '<=', endDate.toISOString()),
        orderBy('date', 'desc')
      );
    }
    
    const querySnapshot = await getDocs(q);
    const entries = [];
    querySnapshot.forEach((doc) => {
      entries.push({ id: doc.id, ...doc.data() });
    });
    return entries;
  } catch (error) {
    console.error('Error fetching daily production:', error);
    return [];
  }
};

// Log daily production
export const logDailyProduction = async (entryData) => {
  try {
    const docRef = await addDoc(collection(db, 'dailyProduction'), {
      ...entryData,
      loggedAt: new Date().toISOString()
    });
    
    // Update plan's achieved quantity
    const planRef = doc(db, 'productionPlans', entryData.planId);
    const planDoc = await getDoc(planRef);
    if (planDoc.exists()) {
      const plan = planDoc.data();
      const newAchieved = (plan.achievedQuantity || 0) + Number(entryData.achievedQuantity);
      await updateDoc(planRef, {
        achievedQuantity: newAchieved,
        lastUpdated: new Date().toISOString()
      });
      
      // Check for shortage
      if (newAchieved < plan.targetQuantity) {
        await checkAndCreateShortage(entryData.planId, plan.productName, plan.targetQuantity, newAchieved);
      }
    }
    
    toast.success('Production logged successfully!');
    return docRef.id;
  } catch (error) {
    console.error('Error logging production:', error);
    toast.error('Failed to log production');
    return null;
  }
};

// ==================== SHORTAGES ====================

// Check and create shortage if needed
const checkAndCreateShortage = async (planId, productName, required, available) => {
  try {
    // Check if shortage already exists
    const q = query(
      collection(db, 'shortages'),
      where('planId', '==', planId),
      where('status', '==', 'critical')
    );
    const snapshot = await getDocs(q);
    
    if (snapshot.empty && available < required) {
      // Create new shortage
      await addDoc(collection(db, 'shortages'), {
        planId,
        materialName: productName,
        requiredQuantity: required,
        availableQuantity: available,
        shortageQuantity: required - available,
        status: 'critical',
        reportedAt: new Date().toISOString(),
        resolvedAt: null,
        resolvedBy: null,
        resolutionNotes: ''
      });
      toast.error(`⚠️ Shortage detected for ${productName}!`);
    }
  } catch (error) {
    console.error('Error checking shortage:', error);
  }
};

// Get all shortages
export const getShortages = async (status = null) => {
  try {
    let q = collection(db, 'shortages');
    if (status) {
      q = query(collection(db, 'shortages'), where('status', '==', status));
    }
    const querySnapshot = await getDocs(q);
    const shortages = [];
    querySnapshot.forEach((doc) => {
      shortages.push({ id: doc.id, ...doc.data() });
    });
    return shortages;
  } catch (error) {
    console.error('Error fetching shortages:', error);
    return [];
  }
};

// Resolve shortage
export const resolveShortage = async (shortageId, resolutionNotes = '') => {
  try {
    await updateDoc(doc(db, 'shortages', shortageId), {
      status: 'resolved',
      resolvedAt: new Date().toISOString(),
      resolvedBy: 'system',
      resolutionNotes
    });
    toast.success('Shortage resolved successfully!');
    return true;
  } catch (error) {
    console.error('Error resolving shortage:', error);
    toast.error('Failed to resolve shortage');
    return false;
  }
};

// ==================== PRIORITIES ====================

// Get all priorities
export const getPriorities = async (level = null) => {
  try {
    let q = collection(db, 'priorities');
    if (level) {
      q = query(collection(db, 'priorities'), where('priorityLevel', '==', level));
    }
    const querySnapshot = await getDocs(q);
    const priorities = [];
    querySnapshot.forEach((doc) => {
      priorities.push({ id: doc.id, ...doc.data() });
    });
    return priorities;
  } catch (error) {
    console.error('Error fetching priorities:', error