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
      </div>

      {/* Live Notes */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg shadow-cyan-500/10">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-cyan-400 flex items-center gap-2">
            <span className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></span>
            📢 LIVE NOTES
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

      {/* Products Section */}
      <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg shadow-cyan-500/10">
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
              placeholder="Product name"
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

        <div className="flex flex-wrap gap-2 mt-3">
          {plans.map((product) => (
            <div
              key={product.id}
              className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-full px-3 py-1 text-sm text-gray-300 hover:border-cyan-400/30 transition-all group"
            >
              {editingProduct && editingProduct.id === product.id ? (
                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    value={editingProduct.productName}
                    onChange={(e) => setEditingProduct({ ...editingProduct, productName: e.target.value })}
                    className="bg-white/10 border border-white/10 rounded px-2 py-0.5 text-white text-sm w-24 focus:outline-none focus:border-emerald-400/50"
                  />
                  <input
                    type="number"
                    value={editingProduct.targetQuantity}
                    onChange={(e) => setEditingProduct({ ...editingProduct, targetQuantity: e.target.value })}
                    className="bg-white/10 border border-white/10 rounded px-2 py-0.5 text-white text-sm w-16 focus:outline-none focus:border-emerald-400/50"
                  />
                  <button onClick={saveEdit} className="text-emerald-400 hover:text-emerald-300">
                    <Check size={16} />
                  </button>
                  <button onClick={() => setEditingProduct(null)} className="text-gray-500 hover:text-rose-400">
                    <X size={16} />
                  </button>
                </div>
              ) : (
                <>
                  <span>{product.productName}</span>
                  <span className="text-gray-500 text-xs">({product.targetQuantity})</span>
                  <button onClick={() => startEdit(product)} className="text-gray-500 hover:text-cyan-400 transition-all ml-1 opacity-0 group-hover:opacity-100">
                    <Edit2 size={14} />
                  </button>
                  <button onClick={() => deleteProduct(product.id, product.productName)} className="text-gray-500 hover:text-rose-400 transition-all opacity-0 group-hover:opacity-100">
                    <X size={14} />
                  </button>
                </>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* ===== SUMMARY CARDS WITH WATER ANIMATION ===== */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Global Plan Qty - Water Animation */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg shadow-cyan-500/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-cyan-400/10 via-transparent to-purple-400/10 animate-[wave_3s_ease-in-out_infinite]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-cyan-400/5 to-transparent animate-[wave_4s_ease-in-out_infinite]"></div>
          <p className="text-gray-400 text-sm uppercase tracking-wider relative z-10">Global Plan Qty</p>
          <p className="text-3xl font-bold text-white mt-2 relative z-10 animate-pulse">{totalPlan.toLocaleString()}</p>
        </div>
        
        {/* Total Achieved - Water Animation */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg shadow-emerald-500/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-emerald-400/10 via-transparent to-emerald-400/10 animate-[wave_3.5s_ease-in-out_infinite]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-emerald-400/5 to-transparent animate-[wave_4.5s_ease-in-out_infinite]"></div>
          <p className="text-gray-400 text-sm uppercase tracking-wider relative z-10">Total Achieved</p>
          <p className="text-3xl font-bold text-emerald-400 mt-2 relative z-10 animate-pulse">{totalAchieved.toLocaleString()}</p>
        </div>
        
        {/* Average Progress - Water Animation */}
        <div className="relative bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-6 text-center shadow-lg shadow-cyan-500/10 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-r from-purple-400/10 via-transparent to-cyan-400/10 animate-[wave_4s_ease-in-out_infinite]"></div>
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-400/5 to-transparent animate-[wave_5s_ease-in-out_infinite]"></div>
          <p className="text-gray-400 text-sm uppercase tracking-wider relative z-10">Average Progress</p>
          <div className="flex items-center justify-center gap-4 mt-2 relative z-10">
            <p className="text-3xl font-bold text-cyan-400 animate-pulse">{avgProgress}%</p>
            <div className="flex-1 max-w-[100px] bg-white/10 rounded-full h-2 overflow-hidden">
              <div 
                className="bg-gradient-to-r from-cyan-400 to-purple-500 h-2 rounded-full transition-all duration-500 relative"
                style={{ width: `${Math.min(avgProgress, 100)}%` }}
              >
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-[shimmer_2s_infinite]"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ===== TOWER PROGRESS BARS WITH WATER ANIMATION ===== */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {plans.map((product) => {
          const progress = product.targetQuantity > 0 ? ((product.achievedQuantity / product.targetQuantity) * 100).toFixed(1) : 0;
          const color = productColors[product.productName] || 'from-gray-400 to-gray-600';
          const towerHeight = Math.min(progress, 100);

          return (
            <div key={product.id} className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl p-4 shadow-lg shadow-cyan-500/5 hover:shadow-cyan-500/20 transition-all duration-300 hover:scale-105">
              <h3 className="text-lg font-semibold text-white tracking-wide text-center">{product.productName}</h3>
              
              {/* Tower with Water Animation */}
              <div className="relative w-full h-48 bg-white/5 rounded-lg mt-3 overflow-hidden border border-white/5">
                {/* Target Line */}
                <div className="absolute top-0 left-0 right-0 border-t-2 border-dashed border-white/20 z-10"></div>
                
                {/* Achieved Bar with Water Wave Animation */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${color} transition-all duration-1000 rounded-t-lg shadow-lg shadow-cyan-500/20 overflow-hidden`}
                  style={{ height: `${Math.min(towerHeight, 100)}%` }}
                >
                  {/* Water Wave Effect 1 */}
                  <div className="absolute inset-0 bg-gradient-to-t from-transparent to-white/10 animate-[wave_2s_ease-in-out_infinite]"></div>
                  
                  {/* Water Wave Effect 2 - Blink + Float */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-[wave_3s_ease-in-out_infinite]"></div>
                  
                  {/* Blinking Water Drops */}
                  <div className="absolute top-0 left-0 right-0 h-1 bg-white/30 rounded-full animate-pulse"></div>
                  <div className="absolute bottom-0 left-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '0.5s' }}></div>
                  <div className="absolute bottom-0 right-1/4 w-2 h-2 bg-white/20 rounded-full animate-bounce" style={{ animationDelay: '1s' }}></div>
                  
                  {/* Shimmer Effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent animate-[shimmer_2s_infinite]"></div>
                </div>
                
                {/* Neon Glow */}
                <div 
                  className={`absolute bottom-0 left-0 right-0 bg-gradient-to-t ${color} blur-xl opacity-30 transition-all duration-1000`}
                  style={{ height: `${Math.min(towerHeight, 100)}%` }}
                ></div>
                
                {/* Center Label */}
                <div className="absolute inset-0 flex items-center justify-center flex-col z-10">
                  <span className="text-2xl font-bold text-white drop-shadow-lg animate-pulse">{progress}%</span>
                  <span className="text-xs text-gray-400">{product.achievedQuantity || 0} / {product.targetQuantity}</span>
                </div>
              </div>
              
              {/* Stats */}
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