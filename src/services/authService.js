// src/services/authService.js
import { auth } from "./firebaseConfig";
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
} from "firebase/auth";

// Sign up new user
export async function signUpWithEmail(email, password) {
  const userCred = await createUserWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

// Login user
export async function loginWithEmail(email, password) {
  const userCred = await signInWithEmailAndPassword(auth, email, password);
  return userCred.user;
}

// Logout
export async function logoutUser() {
  await signOut(auth);
}

// Current user observer
export function onUserChanged(callback) {
  return onAuthStateChanged(auth, callback);
}
