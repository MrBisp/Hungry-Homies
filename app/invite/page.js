'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Image from 'next/image';
import ProfileImage from '@/components/ProfileImage';
import { motion } from 'framer-motion';

function InviteContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const inviteCode = searchParams.get('code');
    const [inviteUrl, setInviteUrl] = useState(null);
    const [inviter, setInviter] = useState({
        id: null,
        name: null,
        image: ""
    });
    const [showLetter, setShowLetter] = useState(false);
    const [showContinueButton, setShowContinueButton] = useState(true);
    const [showLetterMessage, setShowLetterMessage] = useState(false);
    const [showLetterButton, setShowLetterButton] = useState(false);

    useEffect(() => {
        if (inviteCode) {
            setInviteUrl(`/auth/signup?invite=${inviteCode}`);

            const validateInvite = async () => {
                const response = await fetch('/api/invites/validate', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ code: inviteCode }),
                });

                const data = await response.json();
                if (response.ok) {
                    setInviter(data.inviter);
                }
            };
            validateInvite();
        } else {
            router.replace('/');
        }
    }, [inviteCode, router]);

    const handleOpenLetter = () => {
        setShowLetter(true);
    };

    return (
        <div
            className="invite-page"
            style={{
                height: '100vh',
                background: 'rgba(0,0,0,0.9)',
                position: 'relative',
                overflow: 'hidden',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#fff',
            }}
        >
            {inviteUrl ? (
                <>
                    {/* Spotlight */}
                    <div
                        style={{
                            position: 'absolute',
                            top: 0,
                            left: 0,
                            right: 0,
                            bottom: 0,
                            background: 'radial-gradient(circle, rgba(255,255,255,0.2) 0%, rgba(0,0,0,0.9) 70%)',
                            zIndex: 0,
                        }}
                    />

                    {/* Dramatic Stick Figure */}
                    <div
                        style={{
                            position: 'relative',
                            zIndex: 1,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                        }}
                    >
                        {/* Inviter's head */}
                        <ProfileImage
                            user={inviter}
                            size="lg"
                            customStyle={{ borderRadius: '50%', marginBottom: '-10px' }}
                        />
                        {/* Stick Figure Body */}
                        <Image
                            src="/person-no-head.png"
                            alt="Stick Figure Body"
                            width={100}
                            height={100}
                        />

                        {/* Dialogue */}
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.5, duration: 1 }}
                            style={{
                                textAlign: 'center',
                                marginTop: '20px',
                                fontSize: '1.5rem',
                                lineHeight: '2rem',
                            }}
                        >
                            {!showLetterMessage ? (
                                <>
                                    <p>&quot;I have been waiting for you...</p>
                                    <p>I want your reviews.&quot;</p>
                                </>
                            ) : (
                                <p>&quot;I have a letter for you&quot;</p>
                            )}
                        </motion.div>

                        {/* Interactive Buttons and Letter */}
                        {showContinueButton && (
                            <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: 1, scale: 1 }}
                                transition={{ delay: 1.5, duration: 0.8 }}
                                onClick={() => {
                                    setShowContinueButton(false);
                                    setShowLetterMessage(true);
                                    setTimeout(() => setShowLetterButton(true), 1000);
                                }}
                                style={{
                                    marginTop: '30px',
                                    cursor: 'pointer',
                                    padding: '10px 20px',
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    borderRadius: '8px',
                                    fontWeight: 'bold',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                }}
                            >
                                Continue
                            </motion.div>
                        )}

                        {showLetterButton && !showLetter && (
                            <motion.div
                                style={{
                                    display: 'flex',
                                    flexDirection: 'column',
                                    alignItems: 'center',
                                    gap: '20px',
                                    marginTop: '30px',
                                }}
                            >
                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    onClick={handleOpenLetter}
                                    style={{
                                        cursor: 'pointer',
                                        position: 'relative',
                                    }}
                                >
                                    <Image
                                        src="/envolope.png"
                                        alt="Envelope"
                                        width={150}
                                        height={100}
                                        className="hover:scale-105 transition-transform envelope-image"
                                    />
                                </motion.div>

                                <motion.div
                                    initial={{ opacity: 0, scale: 0.8 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    transition={{ duration: 0.8 }}
                                    onClick={handleOpenLetter}
                                    style={{
                                        cursor: 'pointer',
                                        padding: '10px 20px',
                                        backgroundColor: '#fff',
                                        color: '#000',
                                        borderRadius: '8px',
                                        fontWeight: 'bold',
                                        boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                    }}
                                >
                                    Open the letter
                                </motion.div>
                            </motion.div>
                        )}

                        {showLetter && (
                            <motion.div
                                initial={{ opacity: 0, y: 50 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                style={{
                                    margin: '30px 10px',
                                    padding: '20px',
                                    backgroundColor: '#fff',
                                    color: '#000',
                                    borderRadius: '8px',
                                    boxShadow: '0 4px 6px rgba(0,0,0,0.2)',
                                    maxWidth: '400px',
                                }}
                            >
                                <p>Hey my friend,</p>
                                <p>
                                    Thank you for joining us. Your reviews are sacred and will help
                                    shape the future of this world.
                                </p>
                                <p>- {inviter.name}</p>
                                <p>
                                    Want to accept the invitation?
                                </p>

                                {/* Fun Response Buttons */}
                                <div className="mt-6 space-y-3">
                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1, duration: 0.5 }}
                                        onClick={() => router.push(inviteUrl)}
                                        className="w-full py-2 px-4 bg-green-500 text-white rounded-lg font-bold hover:bg-green-600 transition-colors"
                                    >
                                        Yes
                                    </motion.button>

                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.2, duration: 0.5 }}
                                        onClick={() => window.location.reload()}
                                        className="w-full py-2 px-4 bg-red-500 text-white rounded-lg font-bold hover:bg-red-600 transition-colors"
                                    >
                                        No
                                    </motion.button>

                                    <motion.button
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 1.4, duration: 0.5 }}
                                        onClick={() => alert("Well then, I guess we will just wait here until you make up your mind.")}
                                        className="w-full py-2 px-4 bg-yellow-500 text-white rounded-lg font-bold hover:bg-yellow-600 transition-colors"
                                    >
                                        Maybe
                                    </motion.button>
                                </div>
                            </motion.div>
                        )}
                    </div>
                </>
            ) : null}
        </div>
    );
}

//We are basically just showing a spinner until the invite url is set
export default function InvitePage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen bg-black flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
                </div>
            }
        >
            <InviteContent />
        </Suspense>
    );
}
