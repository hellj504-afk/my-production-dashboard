import { useState, useEffect } from 'react';
import { collection, getDocs, addDoc, deleteDoc, doc, onSnapshot } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Plus, X, Trash2, Package } from 'lucide-react';
import toast from 'react-hot-toast';

export default function DashboardPage({ user, username }) {
  const [plans, setPlans] = useState([]);
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProduct, setNewProduct] = useState({
    productName: '',
    targetQuantity: ''
  });

  // Real-time listeners
  useEffect(() => {
    // Real-time plans listener
    const unsubscribePlans = onSnapshot(collection(db, 'productionPlans'), (snapshot) => {
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setPlans(data);
      setLoading(false);
    });

    // Real-time notes listener
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

  // Add Product
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

  // Delete Product
  const deleteProduct = async (productId, productName) => {
    if (!confirm(`Delete "${productName}" from production plans?`)) return;
    try {
      await deleteDoc(doc(db, 'productionPlans', productId));
      toast.success(`🗑️ ${productName} deleted!`);
    } catch (error) {
      console.error('Error deleting product:', error);
      toast.error('Failed to delete product');
    }
  };

  // Add Note
  const addNote = async () => {
    if (!noteText.trim()) return;
    try {
      await addDoc(collection(db, 'liveNotes'), {
        content: noteText,
        author: username,
        authorName: user.name,
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

  // Delete Note
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

  // Calculate totals
  const totalPlan = plans.reduce((sum, item) => sum + (item.targetQuantity || 0), 0);
  const totalAchieved = plans.reduce((sum, item) => sum + (item.achievedQuantity || 0), 0);
  const avgProgress = totalPlan > 0 ? ((totalAchieved / totalPlan) * 100).toFixed(1) : 0;

  // Product Colors
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
        <h1 className="text-3xl md:text-4xl font-bold text-white tracking-wider">
          WIP PRODUCTION SUMMARY
        </h1>
        <p className="text-cyan-400/60 text-sm mt-1">
          {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} - DAY {new Date().getDate()}
        </p>
      </div>

      {/* ===== LIVE NOTES ===== */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg shadow-cyan-500/5">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            LIVE NOTES
          </h2>
          <button
            onClick={() => setShowNoteInput(!showNoteInput)}
            className="bg-cyan-400/20 hover:bg-cyan-400/30 text-cyan-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-all"
          >
            <Plus size={16} /> Add Note
          </button>
        </div>

        {showNoteInput && (
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              placeholder="Write a note..."
              className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-cyan-400/50"
              onKeyDown={(e) => e.key === 'Enter' && addNote()}
            />
            <button
              onClick={addNote}
              className="bg-cyan-400 hover:bg-cyan-500 px-4 py-2 rounded-lg text-black font-medium text-sm transition-all"
            >
              Post
            </button>
          </div>
        )}

        <div className="space-y-2 max-h-40 overflow-y-auto">
          {notes.length === 0 ? (
            <p className="text-gray-500 text-sm text-center py-2">No notes yet</p>
          ) : (
            notes.map((note) => (
              <div
                key={note.id}
                className={`flex items-center justify-between bg-white/5 border rounded-lg px-3 py-2 text-sm ${
                  note.isPinned ? 'border-yellow-400/40' : 'border-white/5'
                }`}
              >
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-white">{note.content}</span>
                  <span className="text-gray-500 text-xs ml-2">— {note.authorName || note.author}</span>
                  <span className="text-gray-600 text-xs">
                    {new Date(note.createdAt).toLocaleTimeString()}
                  </span>
                </div>
                {(user.role === 'super_admin' || note.author === username) && (
                  <button
                    onClick={() => deleteNote(note.id)}
                    className="text-gray-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))
          )}
        </div>
      </div>

      {/* ===== ADD PRODUCT SECTION ===== */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg shadow-cyan-500/5">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold text-emerald-400 flex items-center gap-2">
            <Package size={18} />
            PRODUCTS
            <span className="text-gray-500 text-xs ml-2">({plans.length})</span>
          </h2>
          <button
            onClick={() => setShowAddProduct(!showAddProduct)}
            className="bg-emerald-400/20 hover:bg-emerald-400/30 text-emerald-400 px-3 py-1 rounded-lg text-sm flex items-center gap-1 transition-all"
          >
            <Plus size={16} /> Add Product
          </button>
        </div>

        {showAddProduct && (
          <div className="flex flex-wrap gap-3 mt-3">
            <input
              type="text"
              placeholder="Product name (e.g., HT CT)"
              value={newProduct.productName}
              onChange={(e) => setNewProduct({ ...newProduct, productName: e.target.value })}
              className="flex-1 bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-400/50"
            />
            <input
              type="number"
              placeholder="Target"
              value={newProduct.targetQuantity}
              onChange={(e) => setNewProduct({ ...newProduct, targetQuantity: e.target.value })}
              className="w-24 bg-white/10 border border-white/10 rounded-lg px-4 py-2 text-white text-sm focus:outline-none focus:border-emerald-400/50"
            />
            <button
              onClick={addProduct}
              className="bg-emerald-400 hover:bg-emerald-500 px-4 py-2 rounded-lg text-black font-medium text-sm transition-all"
            >
              Add
            </button>
            <button
              onClick={() => setShowAddProduct(false)}
              className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded-lg text-gray-400 text-sm transition-all"
            >
              Cancel
            </button>
          </div>
        )}

        {/* Product Tags with Delete */}
        <div className="flex flex-wrap gap-2 mt-3">
          {plans.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-gray-300 hover:border-rose-400/30 transition-all group"
            >
              <span>{product.productName}</span>
              <span className="text-gray-500 text-xs">({product.targetQuantity})</span>
              <button
                onClick={() => deleteProduct(product.id, product.productName)}
                className="text-gray-500 hover:text-rose-400 transition-all ml-1 opacity-0 group-hover:opacity-100"
              >
                <X size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* ===== SUMMARY CARDS ===== */}
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

      {/* ===== PRODUCT GRID ===== */}
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
              className={`bg-white/5 backdrop-blur-xl border-l-4 ${colorClass} border border-white/10 rounded-2xl p-4 shadow-lg ${glowClass} hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:bg-white/10 relative group`}
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