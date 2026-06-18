import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { DEFAULT_USER } from '../config/users';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // ✅ Sirf root URL (/) par redirect karein
    router.replace(`/${DEFAULT_USER}/dashboard`);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}