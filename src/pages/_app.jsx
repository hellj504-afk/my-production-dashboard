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

  // ✅ Sab se zaroori line: username URL se lo, agar nahi hai toh default (umair) lo
  const username = router.query.username || DEFAULT_USER;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        console.log("🔍 Fetching user for:", username);

        // 1. Pehle config se user fetch karein
        const configUser = getUserByUsername(username);
        if (configUser && configUser.id !== 'guest') {
          console.log("✅ User found in config:", configUser.displayName);
          setUser(configUser);
          setLoading(false);
          return; // ✅ Agar config mein mil gaya, toh yahin ruk jao
        }

        // 2. Agar config mein nahi, toh Firestore se try karein
        try {
          const userDoc = await getDoc(doc(db, 'users', username));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            console.log("✅ User found in Firestore:", userData.name);
            setUser({
              id: username,
              ...userData,
              permissions: userData.permissions || USER_CONFIG.guest.permissions
            });
            setLoading(false);
            return;
          }
        } catch (firestoreError) {
          console.warn("⚠️ Firestore error, using guest user:", firestoreError);
        }

        // 3. Agar kuch nahi mila, toh guest user use karein (🚫 KOI REDIRECT NAHI)
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
    // ✅ IMPORTANT: Yahan koi redirect nahi hona chahiye
  }, [username]); // ✅ Sirf username change hone par fetch karein

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

  const currentUser = user || USER_CONFIG.guest;

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e]">
      <Header user={currentUser} username={username} />
      <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        {/* ✅ Page component ko current user aur username pass karein */}
        <Component {...pageProps} user={currentUser} username={username} />
      </main>
    </div>
  );
}

export default MyApp;