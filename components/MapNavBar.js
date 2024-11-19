"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import ProfileImage from '@/components/ProfileImage';

const MapNavBar = () => {
    const { data: session, status } = useSession();

    if (status !== "authenticated") {
        return null;
    }

    return (
        <div id="bottom-navbar" className="fixed bottom-0 left-0 right-0 bg-base-100 shadow-lg">
            <div className="flex justify-around items-center p-4">
                <Link href="/" className="flex flex-col items-center" prefetch={true}>
                    🗺️
                    <span className="text-xs mt-1">Explore</span>
                </Link>

                <Link href="/dashboard/profile/friends" prefetch={true} className="flex flex-col items-center">
                    👥
                    <span className="text-xs mt-1">Friends</span>
                </Link>

                <Link href="/dashboard/profile/reviews/new" prefetch={true} className="flex flex-col items-center">
                    📝
                    <span className="text-xs mt-1">Add</span>
                </Link>

                <Link href="/dashboard/profile" prefetch={true} className="flex flex-col items-center">
                    <ProfileImage
                        user={session.user}
                        size="sm"
                        key={session.user.image}
                    />
                    <span className="text-xs mt-1">Me</span>
                </Link>
            </div>
        </div>
    );
};

export default MapNavBar;