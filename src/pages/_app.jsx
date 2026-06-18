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
  
  // Get username from URL (e.g., /waqar/dashboard → waqar)
  const username = router.query.username || DEFAULT_USER;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching user for:", username);
        
        // 1. Pehle config se user fetch karein (instant)
        const configUser = getUserByUsername(username);
        console.log("📋 Config user:", configUser);
        
        if (configUser && configUser.id !== 'guest') {
          // Agar config mein mil gaya toh use karein
          setUser(configUser);
          setLoading(false);
          return;
        }

        // 2. Agar config mein nahi toh Firestore se fetch karein
        try {
          const userDoc = await getDoc(doc(db, 'users', username));
          
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("🔥 Firestore user:", userData);
            setUser({
              id: username,
              ...userData,
              permissions: userData.permissions || USER_CONFIG.guest.permissions
            });
            setLoading(false);
            return;
          }
        } catch (firestoreError) {
          console.error("❌ Firestore error:", firestoreError);
        }

        // 3. Agar kuch nahi mila toh guest user use karein (NO REDIRECT)
        console.log("👤 Using guest user for:", username);
        setUser(USER_CONFIG.guest);
        setLoading(false);
        
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        setUser(USER_CONFIG.guest);
        setLoading(false);
      }
    };

    if (username) {
      fetchUser();
    }
    // ❌ REMOVE: else { router.push(`/${DEFAULT_USER}/dashboard`); }
  }, [username]);

  // Agar loading ho raha hai toh spinner dikhayein
  if (loading) {
    return (
      <div className="min-h-screen bg-primary flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-white">Loading user data for: {username}</p>
        </div>
      </div>
    );
  }

  // Agar user nahi mila toh guest user use karein
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