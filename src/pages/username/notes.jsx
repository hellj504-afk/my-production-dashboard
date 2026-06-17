import { useState, useEffect } from 'react';
import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc,
  query,
  orderBy
} from 'firebase/firestore';
import { db } from '../../firebase/config';
import ProtectedComponent from '../../components/common/ProtectedComponent';
import { Plus, X, Edit, Trash2, Pin, Clock, User } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LiveNotesPage({ user, username }) {
  const [notes, setNotes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [formData, setFormData] = useState({
    content: '',
    isPinned: false,
    expiresAt: ''
  });

  useEffect(() => {
    fetchNotes();
  }, []);

  const fetchNotes = async () => {
    try {
      const notesQuery = query(
        collection(db, 'liveNotes'),
        orderBy('isPinned', 'desc'),
        orderBy('createdAt', 'desc')
      );
      const snapshot = await getDocs(notesQuery);
      const data = [];
      snapshot.forEach((doc) => {
        data.push({ id: doc.id, ...doc.data() });
      });
      setNotes(data);
    } catch (error) {
      console.error('Error fetching notes:', error);
      toast.error('Failed to load notes');
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const noteData = {
        ...formData,
        author: username,
        authorName: user.name,
        createdAt: new Date().toISOString(),
        lastEditedAt: new Date().toISOString(),
        lastEditedBy: username
      };

      if (editingNote) {
        await updateDoc(doc(db, 'liveNotes', editingNote.id), {
          ...noteData,
          lastEditedAt: new Date().toISOString(),
          lastEditedBy: username
        });
        toast.success('Note updated successfully!');
      } else {
        await addDoc(collection(db, 'liveNotes'), noteData);
        toast.success('Note added successfully!');
      }
      
      setShowModal(false);
      setEditingNote(null);
      setFormData({ content: '', isPinned: false, expiresAt: '' });
      fetchNotes();
    } catch (error) {
      console.error('Error saving note:', error);
      toast.error('Failed to save note');
    }
  };

  const handleDelete = async (noteId) => {
    if (!confirm('Are you sure you want to delete this note?')) return;
    try {
      await deleteDoc(doc(db, 'liveNotes', noteId));
      toast.success('Note deleted successfully!');
      fetchNotes();
    } catch (error) {
      console.error('Error deleting note:', error);
      toast.error('Failed to delete note');
    }
  };

  const handleEdit = (note) => {
    setEditingNote(note);
    setFormData({
      content: note.content,
      isPinned: note.isPinned || false,
      expiresAt: note.expiresAt || ''
    });
    setShowModal(true);
  };

  const canEditNote = (note) => {
    if (user.role === 'super_admin') return true;
    if (user.role === 'production_planner' && note.author === username) return true;
    return false;
  };

  const canDeleteNote = (note) => {
    return user.role === 'super_admin';
  };

  if (loading) {
    return <div className="text-white text-center py-20">Loading notes...</div>;
  }

  const pinnedNotes = notes.filter(n => n.isPinned);
  const unpinnedNotes = notes.filter(n => !n.isPinned);

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white">📝 Live Notes</h1>
          <p className="text-gray-400 text-sm mt-1">Real-time announcements and updates</p>
        </div>
        
        <ProtectedComponent user={user} permission="createLiveNote">
          <button
            onClick={() => {
              setEditingNote(null);
              setFormData({ content: '', isPinned: false, expiresAt: '' });
              setShowModal(true);
            }}
            className="bg-accent hover:bg-blue-700 px-4 py-2 rounded-lg text-white flex items-center gap-2 transition-colors"
          >
            <Plus size={20} />
            Add Note
          </button>
        </ProtectedComponent>
      </div>

      {pinnedNotes.length > 0 && (
        <div>
          <h2 className="text-xl font-semibold text-yellow-400 flex items-center gap-2 mb-4">
            <Pin size={20} />
            Pinned Notes
          </h2>
          <div className="space-y-3">
            {pinnedNotes.map((note) => (
              <div key={note.id} className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-4">
                {renderNoteContent(note)}
              </div>
            ))}
          </div>
        </div>
      )}

      <div>
        <h2 className="text-xl font-semibold text-white mb-4">
          All Notes
          <span className="text-sm text-gray-400 ml-2">({unpinnedNotes.length})</span>
        </h2>
        
        {unpinnedNotes.length === 0 && pinnedNotes.length === 0 ? (
          <div className="bg-card rounded-lg p-8 text-center">
            <p className="text-gray-400">No notes yet. Add your first note!</p>
          </div>
        ) : (
          <div className="space-y-3">
            {unpinnedNotes.map((note) => (
              <div key={note.id} className="bg-card rounded-lg p-4 shadow-lg hover:shadow-xl transition-shadow">
                {renderNoteContent(note)}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4">
          <div className="bg-card rounded-lg p-6 max-w-md w-full">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-white">
                {editingNote ? 'Edit Note' : 'Add Note'}
              </h2>
              <button
                onClick={() => setShowModal(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm text-gray-400 mb-1">Content *</label>
                <textarea
                  value={formData.content}
                  onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                  rows="4"
                  required
                  placeholder="Write your note here..."
                />
              </div>
              
              <div className="flex items-center gap-3">
                <input
                  type="checkbox"
                  checked={formData.isPinned}
                  onChange={(e) => setFormData({ ...formData, isPinned: e.target.checked })}
                  className="w-4 h-4 accent-accent"
                  id="pinNote"
                />
                <label htmlFor="pinNote" className="text-white text-sm">
                  Pin this note (stays at top)
                </label>
              </div>
              
              <div>
                <label className="block text-sm text-gray-400 mb-1">Expires At (Optional)</label>
                <input
                  type="datetime-local"
                  value={formData.expiresAt}
                  onChange={(e) => setFormData({ ...formData, expiresAt: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:outline-none focus:border-accent"
                />
              </div>
              
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-accent hover:bg-blue-700 py-2 rounded-lg text-white font-semibold transition-colors"
                >
                  {editingNote ? 'Update Note' : 'Add Note'}
                </button>
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 bg-gray-700 hover:bg-gray-600 py-2 rounded-lg text-white font-semibold transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );

  function renderNoteContent(note) {
    const canEdit = canEditNote(note);
    const canDelete = canDeleteNote(note);

    return (
      <div>
        <div className="flex justify-between items-start gap-4">
          <div className="flex-1">
            <p className="text-white whitespace-pre-wrap">{note.content}</p>
            <div className="flex flex-wrap items-center gap-3 mt-2">
              <span className="text-xs flex items-center gap-1 text-gray-400">
                <User size={12} />
                {note.authorName || note.author}
              </span>
              <span className="text-xs flex items-center gap-1 text-gray-400">
                <Clock size={12} />
                {new Date(note.createdAt).toLocaleString()}
              </span>
              {note.lastEditedAt && note.lastEditedAt !== note.createdAt && (
                <span className="text-xs text-gray-500">
                  (Edited {new Date(note.lastEditedAt).toLocaleString()})
                </span>
              )}
              {note.isPinned && (
                <span className="text-xs bg-yellow-600 px-2 py-0.5 rounded flex items-center gap-1">
                  <Pin size={12} />
                  Pinned
                </span>
              )}
            </div>
          </div>
          
          <div className="flex gap-2 flex-shrink-0">
            {canEdit && (
              <ProtectedComponent user={user} permission="editLiveNote">
                <button
                  onClick={() => handleEdit(note)}
                  className="bg-yellow-600 hover:bg-yellow-700 p-1.5 rounded text-white transition-colors"
                >
                  <Edit size={16} />
                </button>
              </ProtectedComponent>
            )}
            
            {canDelete && (
              <ProtectedComponent user={user} permission="deleteLiveNote">
                <button
                  onClick={() => handleDelete(note.id)}
                  className="bg-red-600 hover:bg-red-700 p-1.5 rounded text-white transition-colors"
                >
                  <Trash2 size={16} />
                </button>
              </ProtectedComponent>
            )}
          </div>
        </div>
      </div>
    );
  }
}
