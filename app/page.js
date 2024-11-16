'use client';
import LoginModal from "@/components/LoginModal";
import dynamic from 'next/dynamic';
import { useSession } from "next-auth/react";

// Import Map component with dynamic loading and no SSR
const Map = dynamic(() => import('@/components/Map'), {
  ssr: false,
  loading: () => <div>Loading map...</div>
});

export default function Page() {
  const { status } = useSession();

  return (
    <div className="h-screen w-full">
      {status === 'unauthenticated' && <LoginModal isAutoOpen={true} />}
      <Map useRandom={status === 'unauthenticated'} />
    </div>
  );
}
