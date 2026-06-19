import { useState, useEffect } from 'react';
import { collection, addDoc, deleteDoc, updateDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, X, Trash2, Package, Edit2, Check } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage({ user, username }) {
  const [plans, setPlans] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    targetQuantity: ''
  });

  useEffect(() => {
    const unsubscribePlans = onSnapshot(collection(db, 'productionPlans'), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setPlans(data);
      setLoading(false);
    });

    const unsubscribeNotes = onSnapshot(collection(db, 'liveNotes'), (snapshot) => {
      const notesData = [];
      snapshot.forEach((doc) => {
        notesData.push({ id: doc.id, ...doc.data() });
      });
      notesData.sort((a, b) => {
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;
        return new Date(b.createdAt) - new Date(a.createdAt);
      });
      setNotes(notesData);
    });

    return () => {
      unsubscribePlans();
      unsubscribeNotes();
    };
  }, []);

  const addProduct = async () => {
    if (!newProduct.productName.trim() || !newProduct.targetQuantity) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await addDoc(collection(db, 'productionPlans'), {
        productName: newProduct.productName.trim(),
        targetQuantity: Number(newProduct.targetQuantity),
        achievedQuantity: 0,
        status: 'ongoing',
        createdAt: new Date().toISOString(),
        createdBy: username
      });
      toast.success(`✅ ${newProduct.productName} added!`);
      setNewProduct({ productName: '', targetQuantity: '' });
      setShowAddProduct(false);
    } catch (error) {
      console.error('Error adding product:', error);
      toast.error('Failed to add product');
    }
  };

  const startEdit = (product) => {
    setEditingProduct({
      id: product.id,
      productName: product.productName,
      targetQuantity: product.targetQuantity
    });
  };

  const saveEdit = async () => {
    if (!editingProduct.productName.trim() || !editingProduct.targetQuantity) {
      toast.error('Please fill all fields');
      return;
    }
    try {
      await updateDoc(doc(db, 'productionPlans', editingProduct.id), {
        productName: editingProduct.productName.trim(),
        targetQuantity: Number(editingProduct.targetQuantity),
        lastUpdated: new Date().toISOString()
      });
      toast.success(`✅ ${editingProduct.productName} updated!`);
      setEditingProduct(null);
    } catch (error) {
      console.error('Error updating product:', error);
      toast.error('Failed to update product');
    }
  };

  const deleteProduct = async (productId, productName) => {
    if (!confirm(`Delete "${productName}"?`)) return;
    try {
      await deleteDoc(doc(db, 'productionPlans', productId));
      toast.success(`🗑️ ${productName} deleted!`);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      await addDoc(collection(db, 'liveNotes'), {
        content: noteText,
        author: username,
        authorName: user?.name || 'User',
        isPinned: false,
        createdAt: new Date().toISOString()
      });
      setNoteText('');
      setShowNoteInput(false);
      toast.success('Note added!');
    } catch (error) {
      console.error('Error adding note:', error);
      toast.error('Failed to add note');
    }
  };

  const deleteNote = async (noteId) => {
    if (!confirm('Delete this note?')) return;
    try {
      await deleteDoc(doc(db, 'liveNotes', noteId));
      toast.success('Note deleted');
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const totalPlan = plans.reduce((sum, item) => sum + (item.targetQuantity || 0), 0);
  const totalAchieved = plans.reduce((sum, item) => sum + (item.achievedQuantity || 0), 0);
  const avgProgress = totalPlan > 0 ? ((totalAchieved / totalPlan) * 100).toFixed(1) : 0;

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

  const productColors = {
    'HT CT': 'from-cyan-400 to-blue-600',
    'PT': 'from-emerald-400 to-cyan-600',
    'Bushing CT': 'from-yellow-400 to-amber-600',
    'INSULATOR': 'from-rose-400 to-red-600',
    'KE VCB Bushing': 'from-purple-400 to-indigo-600',
    'LTCT ITR-WLT': 'from-pink-400 to-rose-600',
    'EARTHING SWITCH': 'from-orange-400 to-yellow-600'
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center py-4">
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider bg-gradient-to-r from-cyan-400 to-purple-400 bg-clip-text text-transparent">
          WIP PRODUCTION SUMMARY
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
      </div>

      {/* Live Notes */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cyan-400 flex items-center gap-