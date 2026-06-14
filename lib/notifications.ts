import { db } from "@/lib/firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

/**
 * Creates a flexible notification in Firestore.
 * 
 * @param userId - The recipient user ID
 * @param type - The category of notification (e.g., "ACTIVITY_COMPLETED", "SYSTEM_ALERT")
 * @param title - The short bold title of the notification
 * @param message - The descriptive body of the notification
 * @param metadata - A flexible object to store any related data (e.g., courseId, friendId, url)
 */
export async function createNotification(
  userId: string,
  type: string,
  title: string,
  message: string,
  metadata: Record<string, any> = {}
) {
  if (!userId) {
    console.error("createNotification: userId is required");
    return null;
  }

  try {
    const notificationsRef = collection(db, "notifications");
    
    const newNotif = {
      userId,
      type,
      title,
      message,
      metadata,
      isRead: false,
      createdAt: serverTimestamp(),
    };

    const docRef = await addDoc(notificationsRef, newNotif);
    return docRef.id;
  } catch (error) {
    console.error("Error creating notification:", error);
    return null;
  }
}
