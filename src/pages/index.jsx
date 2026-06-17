
import { useEffect } from 'react';
import { useRouter } from 'next/router';
import { DEFAULT_USER } from '../config/users';

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    router.push(`/${DEFAULT_USER}/dashboard`);
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-white text-xl">Loading...</div>
    </div>
  );
}