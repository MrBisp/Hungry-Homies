import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { supabase } from "@/libs/supabase";
import ReviewDetail from "@/components/ReviewDetail";

export default async function ReviewPage({ params }) {
    const session = await getServerSession(authOptions);

    const { data: review, error } = await supabase
        .from('reviews')
        .select(`
            *,
            preferences:review_preferences (
                preference_id,
                preferences (
                    name,
                    description,
                    icon
                )
            )
        `)
        .eq('id', params.id)
        .single();

    if (error) {
        throw new Error(error.message);
    }

    const isOwnReview = session?.user?.id === review.user_id;

    return <ReviewDetail review={review} isOwnReview={isOwnReview} />;
}
