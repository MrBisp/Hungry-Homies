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
            .select('*')
            .eq('id', params.id)
            .single();

        if (error) throw error;

        // Clean up coordinates format
        const coordsStr = review.coordinates.replace('(', '').replace(')', '');
        const [lng, lat] = coordsStr.split(',');

        return NextResponse.json({
            success: true,
            review: {
                ...review,
                coordinates: {
                    lat: parseFloat(lat),
                    lng: parseFloat(lng)
                }
            }
        });

    } catch (error) {
        console.error('Error fetching review:', error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch review" },
            { status: 500 }
        );
    }
}

export async function PUT(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log('No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        const body = await request.json();
        const {
            location_name,
            location_type,
            coordinates,
            primary_emoji,
            review_text,
            images
        } = body;

        console.log('Received coordinates:', coordinates);
        console.log('Request body:', body);

        // First check if the review exists and belongs to the user
        const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', params.id)
            .single();

        if (fetchError) {
            console.error('Error fetching review:', fetchError);
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        // Add this log to debug user IDs
        console.log('User IDs:', {
            sessionUserId: session.user.id,
            reviewUserId: existingReview.user_id,
            typeof: {
                sessionUserId: typeof session.user.id,
                reviewUserId: typeof existingReview.user_id
            }
        });

        // Convert user ID to number for comparison
        if (existingReview.user_id !== parseInt(session.user.id)) {
            console.log('Review does not belong to the user');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Format coordinates
        const coordsString = `(${coordinates.lng},${coordinates.lat})`;
        console.log('Formatted coordinates:', coordsString);

        // Add this log to see the exact query parameters
        console.log('Update parameters:', {
            id: params.id,
            user_id: session.user.id,
            updateData: {
                location_name,
                location_type,
                coordinates: coordsString,
                primary_emoji,
                review_text,
                images: images || [],
                updated_at: new Date().toISOString()
            }
        });

        // First try just the update without select()
        const { error: updateError } = await supabase
            .from('reviews')
            .update({
                location_name,
                location_type,
                coordinates: coordsString,
                primary_emoji,
                review_text,
                images: images || [], // Supabase will handle the array conversion
                updated_at: new Date().toISOString()
            })
            .eq('id', parseInt(params.id))
            .eq('user_id', session.user.id);

        console.log('Basic update result:', { error: updateError });

        if (updateError) {
            console.error('Error updating review:', updateError);
            return NextResponse.json(
                { error: 'Failed to update review' },
                { status: 500 }
            );
        }

        // Then fetch the updated review
        const { data: updatedReview, error: fetchUpdatedError } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', parseInt(params.id))
            .single();

        console.log('Fetched updated review:', updatedReview);

        if (fetchUpdatedError) {
            console.error('Error fetching updated review:', fetchUpdatedError);
            return NextResponse.json(
                { error: 'Failed to fetch updated review' },
                { status: 500 }
            );
        }

        // Clean up coordinates for response
        const cleanCoords = updatedReview.coordinates.replace('(', '').replace(')', '');
        const [lng, lat] = cleanCoords.split(',');

        console.log('Sending updated data to client:', updatedReview);
        return NextResponse.json({
            success: true,
            review: {
                ...updatedReview,
                coordinates: {
                    lat: parseFloat(lat),
                    lng: parseFloat(lng)
                }
            }
        });

    } catch (error) {
        console.error('Error updating review:', error);
        return NextResponse.json(
            { error: error.message || "Failed to update review" },
            { status: 500 }
        );
    }
}

export async function DELETE(request, { params }) {
    try {
        const session = await getServerSession(authOptions);
        if (!session) {
            console.log('No session found');
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // First check if the review exists and belongs to the user
        const { data: existingReview, error: fetchError } = await supabase
            .from('reviews')
            .select('*')
            .eq('id', params.id)
            .single();

        if (fetchError || !existingReview) {
            console.error('Review not found:', fetchError);
            return NextResponse.json(
                { error: 'Review not found' },
                { status: 404 }
            );
        }

        // Verify ownership
        if (existingReview.user_id !== parseInt(session.user.id)) {
            console.log('Review does not belong to the user');
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Delete the review
        const { error: deleteError } = await supabase
            .from('reviews')
            .delete()
            .eq('id', params.id)
            .eq('user_id', parseInt(session.user.id)); // Add explicit user_id check

        if (deleteError) {
            console.error('Delete error:', deleteError);
            throw deleteError;
        }

        console.log('Review deleted successfully');
        return NextResponse.json({ success: true });

    } catch (error) {
        console.error('Error deleting review:', error);
        return NextResponse.json(
            { error: error.message || "Failed to delete review" },
            { status: 500 }
        );
    }
}