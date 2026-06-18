import { useEffect } from 'react';
import { useRouter } from 'next/router';

export default function UsernameIndex() {
  const router = useRouter();
  const { username } = router.query;

  useEffect(() => {
    if (username) {
      router.replace(`/${username}/dashboard`);
    }
  }, [username, router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-primary">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-accent border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-white">Redirecting to dashboard...</p>
      </div>
    </div>
  );
}
