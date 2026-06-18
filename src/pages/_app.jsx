import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../firebase/config';
import { DEFAULT_USER, USER_CONFIG } from '../config/users';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  // Get username from URL
  const username = router.query.username || DEFAULT_USER;

  useEffect(() => {
    const fetchUser = async () => {
      try {
        setLoading(true);
        
        // 1. Pehle Firestore se user fetch karein
        const userDoc = await getDoc(doc(db, 'users', username));
        
        if (userDoc.exists()) {
          // Firestore mein user mil gaya
          const userData = userDoc.data();
          setUser({
            id: username,
            ...userData,
            // Permissions Firestore se lein
            permissions: userData.permissions || USER_CONFIG[username]?.permissions || USER_CONFIG.guest.permissions
          });
        } else {
          // 2. Agar Firestore mein nahi hai toh config se check karein
          const configUser = USER_CONFIG[username];
          if (configUser) {
            setUser(configUser);
          } else {
            // 3. Default guest user
            setUser(USER_CONFIG.guest);
          }
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        // Error mein bhi guest user show karein
        setUser(USER_CONFIG.guest);
      } finally {
        setLoading(false);
      }
    };

    if (username) {
      fetchUser();
    }
  }, [username]);

  // Agar loading ho raha hai toh spinner dikhayein
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