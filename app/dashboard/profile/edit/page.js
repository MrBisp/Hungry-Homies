'use client';

import { useSession } from "next-auth/react";
import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import ProfileImage from '@/components/ProfileImage';
import { useRouter } from 'next/navigation';

export default function EditProfilePage() {
    const { data: session, status, update } = useSession();
    const [isLoading, setIsLoading] = useState(false);
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        image: '',
    });
    const [message, setMessage] = useState('');
    const router = useRouter();

    // Initialize form data once session is loaded
    useEffect(() => {
        if (session?.user) {
            setFormData({
                name: session.user.name || '',
                email: session.user.email || '',
                image: session.user.image || '',
            });
        }
    }, [session]);

    // Check if user is logged in with Google
    const isGoogleUser = Boolean(session?.user?.email?.endsWith('@gmail.com'));

    const handleImageUpload = useCallback(async (e) => {
        const file = e.target.files?.[0];
        if (!file) {
            console.log('No file selected');
            return;
        }

        // Validate file type
        const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
        if (!validTypes.includes(file.type)) {
            setMessage('Please upload a valid image file (JPEG, PNG, GIF, or WebP)');
            return;
        }

        if (file.size > 5 * 1024 * 1024) { // 5MB limit
            setMessage('Image must be less than 5MB');
            return;
        }

        try {
            // Create a FileReader to handle the file
            const reader = new FileReader();

            const imageLoadPromise = new Promise((resolve, reject) => {
                reader.onload = async (event) => {
                    try {
                        const img = document.createElement('img');

                        img.onload = () => {
                            try {
                                // Create canvas for resizing
                                const canvas = document.createElement('canvas');
                                const ctx = canvas.getContext('2d');

                                // Calculate new dimensions (max 400px)
                                const maxSize = 400;
                                let width = img.width;
                                let height = img.height;

                                if (width > height) {
                                    if (width > maxSize) {
                                        height *= maxSize / width;
                                        width = maxSize;
                                    }
                                } else {
                                    if (height > maxSize) {
                                        width *= maxSize / height;
                                        height = maxSize;
                                    }
                                }

                                // Set canvas dimensions and draw
                                canvas.width = width;
                                canvas.height = height;
                                ctx.drawImage(img, 0, 0, width, height);

                                // Convert to base64 with lower quality JPEG
                                const base64Image = canvas.toDataURL('image/jpeg', 0.8);

                                setFormData(prev => ({
                                    ...prev,
                                    image: base64Image
                                }));
                                resolve();
                            } catch (err) {
                                console.error('Error in canvas operations:', err);
                                reject(err);
                            }
                        };

                        img.onerror = (err) => {
                            console.error('Error loading image:', err);
                            reject(new Error('Failed to load image'));
                        };

                        img.src = event.target.result;
                    } catch (err) {
                        console.error('Error in image processing:', err);
                        reject(err);
                    }
                };

                reader.onerror = (err) => {
                    console.error('Error reading file:', err);
                    reject(new Error('Failed to read file'));
                };
            });

            reader.readAsDataURL(file);
            await imageLoadPromise;

        } catch (error) {
            console.error('Error processing image:', error);
            setMessage('Error processing image. Please try again.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setMessage('');

        try {
            const response = await fetch('/api/user/', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (!response.ok) throw new Error('Failed to update profile');

            // Update session with the returned user data from the API
            await update({
                ...session,
                user: {
                    ...session?.user,
                    ...data.user // Use the returned user data instead of just formData.image
                }
            });

            setMessage('Profile updated successfully!');
            router.refresh();
        } catch (error) {
            console.error('Error updating profile:', error);
            setMessage('Failed to update profile. Please try again.');
        } finally {
            setIsLoading(false);
        }
    };

    const handleEmailChange = (e) => {
        if (!isGoogleUser) {
            setFormData(prev => ({
                ...prev,
                email: e.target.value
            }));
        }
    };



    // Show loading state while session is being fetched
    if (status === "loading") {
        return <div className="min-h-screen bg-white flex items-center justify-center">
            <div className="text-gray-500">Loading...</div>
        </div>;
    }

    return (
        <div className="min-h-screen bg-white">
            <div className="border-b">
                <div className="px-4 py-4 flex items-center justify-between">
                    <h1 className="text-xl font-semibold">Edit Profile</h1>
                    <button
                        onClick={() => window.history.back()}
                        className="text-gray-600"
                    >
                        Cancel
                    </button>
                </div>
            </div>

            <form onSubmit={handleSubmit} className="p-4 space-y-6">
                {/* Profile Picture */}
                <div className="flex flex-col items-center space-y-2">
                    {isGoogleUser ? (
                        <>
                            <Image
                                src={session.user.image}
                                alt="Profile"
                                width={100}
                                height={100}
                                className="rounded-full"
                            />
                            <p className="text-sm text-gray-500">
                                Profile picture is managed by Google
                            </p>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <div className="w-24 h-24 mx-auto relative group">
                                <ProfileImage user={formData} size="lg" />
                                <label className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-full opacity-0 group-hover:opacity-100 cursor-pointer transition-opacity">
                                    <span className="text-white text-sm">Change</span>
                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/gif,image/webp"
                                        onChange={handleImageUpload}
                                        className="hidden"
                                    />
                                </label>
                            </div>
                            <p className="text-sm text-center text-gray-500">
                                Click to upload a profile picture
                            </p>
                        </div>
                    )}
                </div>

                {/* Form Fields */}
                <div className="space-y-4">
                    <div>
                        <label
                            htmlFor="name"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Name
                        </label>
                        <input
                            type="text"
                            id="name"
                            value={formData.name}
                            onChange={(e) => setFormData(prev => ({
                                ...prev,
                                name: e.target.value
                            }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                    </div>

                    <div>
                        <label
                            htmlFor="email"
                            className="block text-sm font-medium text-gray-700 mb-1"
                        >
                            Email
                        </label>
                        <input
                            type="email"
                            id="email"
                            value={formData.email}
                            onChange={handleEmailChange}
                            disabled={isGoogleUser}
                            className={`w-full px-3 py-2 border border-gray-300 rounded-lg ${isGoogleUser ? 'bg-gray-50 text-gray-500' : ''
                                }`}
                        />
                        {isGoogleUser && (
                            <p className="mt-1 text-sm text-gray-500">
                                Email is managed by Google
                            </p>
                        )}
                    </div>
                </div>

                {/* Submit Button */}
                <div className="pt-4">
                    <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full bg-black text-white py-3 rounded-lg font-medium disabled:opacity-50"
                    >
                        {isLoading ? 'Saving...' : 'Save Changes'}
                    </button>
                </div>
                {message && (
                    <p className={`mt-4 text-sm text-center ${message.includes('Error') || message.includes('Failed') ? 'text-red-500' : 'text-green-500'}`}>
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}