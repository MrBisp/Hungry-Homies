'use client';

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import ProfileImage from '@/components/ProfileImage';

export default function ProfilePage() {
    const { data: session } = useSession();

    return (
        <div className="min-h-screen bg-white flex flex-col">
            {/* Header with Profile */}
            <div className="px-4 pt-4 pb-6">
                <h1 className="text-2xl font-semibold mb-6">Profile</h1>
                <Link href={`/dashboard/profile/${session?.user?.id}`}>
                    <div className="flex items-center space-x-4">
                        <ProfileImage
                            user={session?.user}
                            size="lg"
                        />
                        <div>
                            <h2 className="text-xl font-medium">{session?.user?.name}</h2>
                            <p className="text-gray-500">{session?.user?.email}</p>
                        </div>
                    </div>
                </Link>
            </div>

            {/* Main Menu Grid */}
            <div className="px-4 py-6">
                <div className="grid grid-cols-3 md:grid-cols-2 gap-4" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))' }}>
                    <Link href="/dashboard/profile/reviews"
                        className="aspect-square bg-gray-50 rounded-2xl p-2 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border-2 border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 13l4 4L19 7" />
                        </svg>
                        <span className="text-md font-medium text-gray-900">My Reviews</span>
                    </Link>

                    <Link href="/dashboard/profile/edit"
                        className="aspect-square bg-gray-50 rounded-2xl p-2 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border-2 border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                        </svg>
                        <span className="text-md font-medium text-gray-900">Update profile</span>
                    </Link>

                    <Link href="/dashboard/profile/friends"
                        className="aspect-square bg-gray-50 rounded-2xl p-2 flex flex-col items-center justify-center hover:bg-gray-100 transition-colors border-2 border-gray-200">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8 text-gray-700 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
                        </svg>
                        <span className="text-lg font-medium text-gray-900">Friends</span>
                    </Link>
                </div>
            </div>

            {/* Logout Button - Fixed at Bottom */}
            <div className="mt-auto border-t">
                <button
                    onClick={() => signOut()}
                    className="w-full px-4 pt-4 pb-32 flex items-center space-x-4 text-gray-700 hover:bg-gray-50"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                    <span className="font-medium">Log out</span>
                </button>
            </div>
        </div>
    );
}
