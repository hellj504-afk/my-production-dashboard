import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { USER_CONFIG, getUserByUsername } from '../config/users';
import Header from '../components/layout/Header';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ FIX: router.asPath se username nikaalein
  const getUsernameFromPath = () => {
    const path = router.asPath || '';
    // /waqar/dashboard → waqar
    // /umair/dashboard → umair
    const match = path.match(/^\/([^\/]+)/);
    if (match) {
      return match[1];
    }
    return null;
  };

  const username = getUsernameFromPath();

  useEffect(() => {
    // Agar username nahi mila toh guest use karein
    if (!username) {
      console.log("👤 No username found in path, using guest");
      setUser(USER_CONFIG.guest);
      setLoading(false);
      return;
    }

    const fetchUser = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching user for:", username);
        
        // 1. Config se user fetch karein
        const configUser = getUserByUsername(username);
        console.log("📋 Config user:", configUser?.displayName || "Not found");
        
        if (configUser && configUser.id !== 'guest') {
          setUser(configUser);
          setLoading(false);
          return;
        }

        // 2. Firestore se try karein
        try {
          const userDoc = await getDoc(doc(db, 'users', username));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("🔥 Firestore user:", userData.name);
            setUser({
              id: username,
              ...userData,
              permissions: userData.permissions || USER_CONFIG.guest.permissions
            });
            setLoading(false);
            return;
          }
        } catch (firestoreError) {
          console.warn("⚠️ Firestore error:", firestoreError);
        }

        // 3. Agar kuch nahi mila toh guest
        console.log("👤 Using guest for:", username);
        setUser(USER_CONFIG.guest);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error:', error);
        setUser(USER_CONFIG.guest);
        setLoading(false);
      }
    };

    fetchUser();
  }, [username, router.asPath]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading user data...</p>
        </div>
      </div>
    );
  }

  const currentUser = user || USER_CONFIG.guest;
  const displayUsername = username || 'guest';

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e]">
      <Header user={currentUser} username={displayUsername} />
      <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <Component {...pageProps} user={currentUser} username={displayUsername} />
      </main>
    </div>
  );
}

export default MyApp;