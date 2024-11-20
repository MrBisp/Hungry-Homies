import Image from 'next/image';

export default function NisserPage() {
    return (
        <div className="flex flex-col items-center justify-center h-screen">
            <Image src="/images/nisse.png" alt="Nisser" width={500} height={500} />
        </div>
    )
}
