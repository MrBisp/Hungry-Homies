import { supabase } from "@/libs/supabase";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/libs/next-auth";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const { data: review, error } = await supabase
            .from('reviews')
            .select(`
                id,
                location_name,
                location_type,
                coordinates,
                primary_emoji,
                review_text,
                images,
                user_id,
                created_at,
                updated_at,
                review_preferences (
                    preference_id,
                    is_available,
                    notes,
                    preferences (
                        name,
                        description,
                        icon
                    )
                )
            `)
            .eq('id', params.id)
            .single();

        if (error) throw error;

        const [lng, lat] = review.coordinates
            .replace(/[()]/g, '')
            .split(',')
            .map(parseFloat);

        const preferences = review.review_preferences?.filter(rp => rp.is_available).map(rp => ({
            preference_id: rp.preference_id,
            name: rp.preferences.name,
            description: rp.preferences.description,
            icon: rp.preferences.icon
        })) || [];

        return NextResponse.json({
            success: true,
            review: {
                ...review,
                coordinates: { lat, lng },
                preferences
            }
        });

    } catch (error) {
        console.error('Error fetching review:', error);
        return NextResponse.json(
            { error: 'Failed to fetch review' },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const reviewId = parseInt(params.id);
        const userId = parseInt(session.user.id);

        const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('id')
            .eq('id', reviewId)
            .eq('user_id', userId)
            .single();

        if (fetchError || !existingReview) {
            return NextResponse.json(
                { error: 'Review not found or unauthorized' },
                { status: 404 }
            );
        }

        const coordsString = `(${body.coordinates.lng},${body.coordinates.lat})`;

        const { data: updatedReview, error: updateError } = await supabase
            .from('reviews')
            .update({
                location_name: body.location_name,
                location_type: body.location_type,
                coordinates: coordsString,
                primary_emoji: body.primary_emoji,
                review_text: body.review_text,
                images: body.images || [],
                updated_at: new Date().toISOString()
            })
            .eq('id', reviewId)
            .eq('user_id', userId)
            .select()
            .single();

        if (updateError) throw updateError;

        const { error: deletePrefsError } = await supabase
            .from('review_preferences')
            .delete()
            .eq('review_id', reviewId);

        if (deletePrefsError) throw deletePrefsError;

        if (body.preferences?.length > 0) {
            const { error: insertPrefsError } = await supabase
                .from('review_preferences')
                .insert(
                    body.preferences.map(p => ({
                        review_id: reviewId,
                        preference_id: p.preference_id,
                        is_available: true,
                        notes: p.notes
                    }))
                );

            if (insertPrefsError) throw insertPrefsError;
        }

        const [lng, lat] = updatedReview.coordinates
            .replace(/[()]/g, '')
            .split(',')
            .map(parseFloat);

        return NextResponse.json({
            success: true,
            review: {
                ...updatedReview,
                coordinates: { lat, lng },
                preferences: body.preferences
            }
        });

    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { error: 'Failed to update review' },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const reviewId = parseInt(params.id);
        const userId = parseInt(session.user.id);

        const { error: deleteError } = await supabase
            .from('reviews')
            .delete()
            .eq('id', reviewId)
            .eq('user_id', userId);

        if (deleteError) throw deleteError;

        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { error: 'Failed to delete review' },
            { status: 500 }
        );
    }
}