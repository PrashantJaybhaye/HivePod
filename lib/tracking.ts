import { doc, setDoc, getDoc, updateDoc, increment, serverTimestamp } from "firebase/firestore";
import { db } from "./firebase";
import { format } from "date-fns";

// Mark a material as completed
export async function markMaterialCompleted(userId: string, materialId: string, courseId: string) {
  if (!userId || !materialId) return;
  
  const progressRef = doc(db, "users", userId, "progress", materialId);
  await setDoc(progressRef, {
    completed: true,
    courseId,
    completedAt: serverTimestamp(),
  }, { merge: true });
}

// Add minutes to total time invested
export async function addTimeInvested(userId: string, minutes: number) {
  if (!userId || minutes <= 0) return;

  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  if (userSnap.exists()) {
    await updateDoc(userRef, {
      timeInvestedMinutes: increment(minutes)
    });
  } else {
    await setDoc(userRef, {
      timeInvestedMinutes: minutes,
      currentStreak: 0,
      lastLoginDate: ""
    }, { merge: true });
  }
}

// Record login to calculate streak
export async function recordLoginForStreak(userId: string) {
  if (!userId) return;
  
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  
  const todayDateStr = format(new Date(), "yyyy-MM-dd");
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayDateStr = format(yesterday, "yyyy-MM-dd");

  if (userSnap.exists()) {
    const data = userSnap.data();
    const lastLogin = data.lastLoginDate;
    
    if (lastLogin === todayDateStr) {
      // Already logged in today, do nothing
      return;
    } else if (lastLogin === yesterdayDateStr) {
      // Logged in yesterday, increment streak
      await updateDoc(userRef, {
        currentStreak: increment(1),
        lastLoginDate: todayDateStr
      });
    } else {
      // Streak broken
      await updateDoc(userRef, {
        currentStreak: 1,
        lastLoginDate: todayDateStr
      });
    }
  } else {
    // First time
    await setDoc(userRef, {
      currentStreak: 1,
      lastLoginDate: todayDateStr,
      timeInvestedMinutes: 0
    }, { merge: true });
  }
}
