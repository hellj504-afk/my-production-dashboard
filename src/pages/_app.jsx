import { useRouter } from 'next/router';
import { getUserByUsername, DEFAULT_USER } from '../config/users';
import Header from '../components/layout/Header';
import '../styles/globals.css';

function MyApp({ Component, pageProps }) {
  const router = useRouter();
  const username = router.query.username || DEFAULT_USER;
  const user = getUserByUsername(username);

  if (!user || !user.id) {
    if (typeof window !== 'undefined') {
      router.push(`/${DEFAULT_USER}/dashboard`);
    }
    return null;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0a1a] via-[#0d0d2b] to-[#1a0a2e]">
      <Header user={user} username={username} />
      <main className="pt-20 px-4 md:px-8 max-w-7xl mx-auto">
        <Component {...pageProps} user={user} username={username} />
      </main>
    </div>
  );
}

export default MyApp;