import Link from 'next/link';
import ProfileImage from '@/components/ProfileImage';

const ProfileListItem = ({ user, extraInfo }) => {
    return (
        <Link href={`/dashboard/profile/${user.id}`} className="flex items-center space-x-3 hover:bg-gray-50 p-2 rounded-lg">
            <ProfileImage
                user={user}
                size="md"
            />
            <div className="flex-1 flex items-center justify-between">
                <p className="font-medium">{user.name}</p>
                {extraInfo && (
                    <span className="text-sm text-gray-500">{extraInfo}</span>
                )}
            </div>
        </Link>
    );
};

export default ProfileListItem;