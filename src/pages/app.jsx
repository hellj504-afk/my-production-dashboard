
import { useRouter } from 'next/router';
import { getUserByUsername, DEFAULT_USER } from '../config/users';
import Header from '../components/layout/Header';
import Sidebar from '../components/layout/Sidebar';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  
  // Get username from URL: /umair/dashboard
  const username = router.query.username || DEFAULT_USER;
  const user = getUserByUsername(username);
  
  // If user doesn't exist, redirect to default
  if (!user || !user.id) {
    if (typeof window !== 'undefined') {
      router.push(`/${DEFAULT_USER}/dashboard`);
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-primary">
      <Header user={user} username={username} />
      <div className="flex">
        <Sidebar user={user} username={username} />
        <main className="flex-1 p-6 ml-64 mt-16">
          <Component {...pageProps} user={user} username={username} />
        </main>
      </div>
    </div>
  );
}

export default MyApp;