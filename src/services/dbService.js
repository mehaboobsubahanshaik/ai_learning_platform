// dbService.js
import { auth, db } from "./firebaseConfig.js";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut as fbSignOut,
} from "firebase/auth";
import {
  doc,
  setDoc,
  getDoc,
  collection,
  addDoc,
  getDocs,
  serverTimestamp,
  query,
  where,
  orderBy,
} from "firebase/firestore";

/* -------------------
   AUTH HELPERS
------------------- */
export async function signUpWithEmail(email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function loginWithEmail(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

export async function signOut() {
  await fbSignOut(auth);
  window.location.href = "/";
}

/* -------------------
   LEARNING PATH (🔥 Updated to support dynamic cards per user)
------------------- */
export async function saveLearningPath(uid, path) {
  if (!uid) return console.error("User not logged in.");

  try {
    // ✅ Save each plan separately under a subcollection
    if (path && typeof path === "object" && path.courseTitle && path.days) {
      const ref = collection(db, "learningPaths", uid, "userPlans");
      await addDoc(ref, {
        uid,
        title: path.courseTitle,
        days: path.days,
        createdAt: serverTimestamp(),
      });
    } else if (Array.isArray(path)) {
      // ✅ Support chatbot sending only days array (plan.plan.days)
      const ref = collection(db, "learningPaths", uid, "userPlans");
      await addDoc(ref, {
        uid,
        title: "Custom Learning Plan",
        days: path,
        createdAt: serverTimestamp(),
      });
    } else {
      // ✅ Fallback: single doc (old behavior)
      const ref = doc(db, "learningPaths", uid);
      await setDoc(ref, { uid, path }, { merge: true });
    }
  } catch (err) {
    console.error("Error saving learning path:", err);
  }
}

export async function getLearningPath(uid) {
  if (!uid) return [];
  try {
    // ✅ Fetch all user plans dynamically (show old + new)
    const ref = collection(db, "learningPaths", uid, "userPlans");
    const q = query(ref, where("uid", "==", uid), orderBy("createdAt", "desc"));
    const snap = await getDocs(q);

    if (!snap.empty) {
      return snap.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    }

    // ✅ Fallback to single static path doc (for backward compatibility)
    const fallbackRef = doc(db, "learningPaths", uid);
    const fallbackSnap = await getDoc(fallbackRef);
    if (fallbackSnap.exists()) {
      const data = fallbackSnap.data();
      if (data.path) return [{ title: "Default Plan", days: data.path }];
    }

    return [];
  } catch (err) {
    console.error("Error getting learning path:", err);
    return [];
  }
}

/* -------------------
   QUIZ (Results + Questions)
------------------- */
export async function saveQuizResult(uid, topic, score, total) {
  const ref = collection(db, "quizResults");
  await addDoc(ref, {
    uid,
    topic,
    score,
    total,
    createdAt: serverTimestamp(),
  });
}

export async function getQuizResults(uid) {
  const q = query(collection(db, "quizResults"), where("uid", "==", uid));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

export async function saveQuizQuestions(uid, queryText, questions) {
  const ref = collection(db, "quizQuestions");
  await addDoc(ref, {
    uid,
    query: queryText,
    questions,
    createdAt: serverTimestamp(),
  });
}

export async function getQuizQuestions(uid) {
  const ref = collection(db, "quizQuestions");
  const q = query(ref, where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

/* -------------------
   CHATBOT HISTORY
------------------- */
export async function saveChatMessage(uid, role, content) {
  if (!uid) return console.error("User not logged in.");
  try {
    const ref = collection(db, "chatHistory");
    await addDoc(ref, {
      uid,
      role,
      content,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.error("Error saving chat message:", err);
  }
}

export async function getChatHistory(uid) {
  if (!uid) return [];
  const ref = collection(db, "chatHistory");
  const q = query(ref, where("uid", "==", uid), orderBy("createdAt", "asc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ ...d.data(), id: d.id }));
}

/* -------------------
   USER QUERIES
------------------- */
export async function saveUserQuery(uid, queryText) {
  if (!uid) return;
  const ref = collection(db, "userQueries");
  await addDoc(ref, {
    uid,
    query: queryText,
    createdAt: serverTimestamp(),
  });
}

export async function getUserQueries(uid) {
  if (!uid) return [];
  const ref = collection(db, "userQueries");
  const q = query(ref, where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((doc) => doc.data());
}

/* -------------------
   VIDEO STORAGE
------------------- */
export async function saveUserVideos(uid, queryText, videos) {
  if (!uid) return;
  try {
    const ref = collection(db, "userVideos");
    await addDoc(ref, {
      uid,
      query: queryText,
      videos,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error saving videos:", error);
  }
}

export async function getUserVideos(uid) {
  if (!uid) return [];
  const ref = collection(db, "userVideos");
  const q = query(ref, where("uid", "==", uid), orderBy("createdAt", "desc"));
  const snap = await getDocs(q);
  return snap.docs.map((d) => d.data());
}

/* -------------------
   YOUTUBE FETCHER
------------------- */
export async function fetchYouTubeVideos(prompt) {
  const apiKey = import.meta.env.VITE_YOUTUBE_API_KEY;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=6&q=${encodeURIComponent(
    prompt
  )}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error("YouTube API request failed");
    const data = await res.json();
    return data.items.map((item) => ({
      id: item.id.videoId,
      title: item.snippet.title,
      thumbnail: item.snippet.thumbnails.medium.url,
      channel: item.snippet.channelTitle,
    }));
  } catch (error) {
    console.error("YouTube API error:", error);
    return [];
  }
}
