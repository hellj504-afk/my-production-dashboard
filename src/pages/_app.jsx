import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DEFAULT_USER, USER_CONFIG, getUserByUsername } from '../config/users';
import Header from '../components/layout/Header';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // ✅ Sirf URL se username lo, koi default nahi (agar username nahi hai toh guest)
  const username = router.query.username;

  useEffect(() => {
    // ✅ Agar username nahi hai toh guest user use karein (redirect nahi)
    if (!username) {
      console.log("👤 No username in URL, using guest");
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
    // ❌ YAHAN KOI REDIRECT NAHI HONA CHAHIYE
  }, [username]);

  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading user data for: {username || 'guest'}</p>
        </div>
      </div>
    );
  }

  const currentUser = user || USER_CONFIG.guest;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e]">
      <Header user={currentUser} username={username || 'guest'} />
      <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <Component {...pageProps} user={currentUser} username={username || 'guest'} />
      </main>
    </div>
  );
}

export default MyApp;