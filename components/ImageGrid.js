import { useState } from 'react';
import Image from 'next/image';

export default function ImageGrid({ images }) {
    const [isModalOpen, setIsModalOpen] = useState(false);

    if (!images || images.length === 0) return null;

    return (
        <>
            {/* Image Grid */}
            <div className="grid grid-cols-2 gap-4">
                {images.map((image, index) => (
                    <div
                        key={index}
                        className="cursor-pointer hover:opacity-90 transition-opacity"
                        onClick={() => setIsModalOpen(true)}
                    >
                        <Image
                            src={image}
                            width={300}
                            height={200}
                            alt={`Review image ${index + 1}`}
                            className="rounded-lg object-cover w-full h-48"
                        />
                    </div>
                ))}
            </div>

            {/* Scrollable Modal */}
            {isModalOpen && (
                <div
                    className="fixed inset-0 bg-black bg-opacity-90 z-50 overflow-y-auto"
                    onClick={() => setIsModalOpen(false)}
                >
                    <button
                        className="fixed top-4 right-4 text-white hover:text-gray-300 z-50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </button>
                    <div
                        className="max-w-5xl mx-auto py-8 px-4 space-y-8"
                        onClick={e => e.stopPropagation()}
                    >
                        {images.map((image, index) => (
                            <div key={index} className="w-full">
                                <Image
                                    src={image}
                                    width={1920}
                                    height={1080}
                                    alt={`Review image ${index + 1}`}
                                    className="w-full h-auto"
                                    priority={index === 0}
                                />
                            </div>
                        ))}
                    </div>
                </div>
            )}
        </>
    );
}