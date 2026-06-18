import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    // ✅ User selector page par redirect
    router.replace('/select-user');
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white text-lg">Loading...</p>
      </div>
    </div>
  );
}