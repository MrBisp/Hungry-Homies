import { supabase } from "./supabase";

export async function createNotification({
    recipientId,
    senderId,
    type,
    content,
    link
}) {
    try {
        // Ensure IDs are numbers
        const notification = {
            recipient_id: parseInt(recipientId),
            sender_id: senderId ? parseInt(senderId) : null,
            type,
            content,
            link,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };

        const { error } = await supabase
            .from('notifications')
            .insert(notification);

        if (error) throw error;

    } catch (error) {
        console.error('Error creating notification:', error);
        throw error;
    }
} 