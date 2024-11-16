'use client';

import { Suspense } from 'react';
import ButtonSignin from '@/components/ButtonSignin';

function LoginContent() {
    return (
        <div className="min-h-screen bg-white flex flex-col items-center justify-center">
            <h1 className="text-2xl font-bold mb-6">Welcome</h1>
            <ButtonSignin text="Sign in" extraStyle="btn-primary" />
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-white flex items-center justify-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
            </div>
        }>
            <LoginContent />
        </Suspense>
    );
}