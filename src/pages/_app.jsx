import { useState, useEffect } from 'react';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { USER_CONFIG, getUserByUsername } from '../config/users';
import Header from '../components/layout/Header';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [username, setUsername] = useState('guest');

  useEffect(() => {
    // ✅ Sab se simple: URL se username nikaalo
    const getUsernameFromURL = () => {
      if (typeof window === 'undefined') return 'guest';
      
      // Option 1: Path se lein
      const path = window.location.pathname;
      const parts = path.split('/').filter(Boolean);
      if (parts.length > 0) {
        const possibleUser = parts[0];
        // Check if user exists in config
        if (USER_CONFIG[possibleUser]) {
          return possibleUser;
        }
      }
      
      // Option 2: Hash se lein (fallback)
      const hash = window.location.hash.replace('#', '');
      if (hash && USER_CONFIG[hash]) {
        return hash;
      }
      
      return 'guest';
    };

    const fetchUser = async () => {
      try {
        setLoading(true);
        const userSlug = getUsernameFromURL();
        setUsername(userSlug);
        
        console.log("🔍 Fetching user for:", userSlug);
        
        // Config se user lein
        const configUser = getUserByUsername(userSlug);
        if (configUser && configUser.id !== 'guest') {
          setUser(configUser);
          setLoading(false);
          return;
        }

        // Firestore se try karein
        try {
          const userDoc = await getDoc(doc(db, 'users', userSlug));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setUser({
              id: userSlug,
              ...userData,
              permissions: userData.permissions || USER_CONFIG.guest.permissions
            });
            setLoading(false);
            return;
          }
        } catch (e) {
          console.warn("Firestore error:", e);
        }

        // Guest user
        setUser(USER_CONFIG.guest);
        setLoading(false);
      } catch (error) {
        console.error('Error:', error);
        setUser(USER_CONFIG.guest);
        setLoading(false);
      }
    };

    fetchUser();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading...</p>
        </div>
      </div>
    );
  }

  const currentUser = user || USER_CONFIG.guest;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e]">
      <Header user={currentUser} username={username} />
      <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <Component {...pageProps} user={currentUser} username={username} />
      </main>
    </div>
  );
}

export default MyApp;