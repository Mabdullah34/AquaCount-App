import { initializeApp } from "firebase/app"
import { getAuth, GoogleAuthProvider } from "firebase/auth"
import { getFirestore } from "firebase/firestore"
import { getStorage } from "firebase/storage"

// Your Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyD9li6IhTL8DlbO8fJS-IJNWFs2sTkc3H4",
  authDomain: "aquacount-ec51c.firebaseapp.com",
  projectId: "aquacount-ec51c",
  storageBucket: "aquacount-ec51c.firebasestorage.app",
  messagingSenderId: "1038808673449",
  appId: "1:1038808673449:android:1b6bc165a8e73f0ef30db8",
}

// Initialize Firebase
const app = initializeApp(firebaseConfig)

// Initialize Firebase services
export const auth = getAuth(app)
export const db = getFirestore(app)
export const storage = getStorage(app)

// Initialize Google Auth Provider
export const googleProvider = new GoogleAuthProvider()
googleProvider.setCustomParameters({
  prompt: "select_account",
})

export default app
