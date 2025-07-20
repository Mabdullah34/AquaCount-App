"use client"
import { useState, useEffect } from "react"
import { db, auth, googleProvider } from "@/lib/firebase"
import { doc, getDoc } from "firebase/firestore"
import { signInWithRedirect, getRedirectResult } from "firebase/auth"

interface AuthScreenProps {
  onLogin: (userData: any) => void
  onBack: () => void
  initialMode: "register" | "login"
}

export function AuthScreen({ onLogin, onBack, initialMode }: AuthScreenProps) {
  const [formData, setFormData] = useState({ name: "", email: "", password: "" })
  const [showAdditionalInfo, setShowAdditionalInfo] = useState(false)
  const [loading, setLoading] = useState(false)

  // Check for redirect result on component mount
  useEffect(() => {
    const checkRedirectResult = async () => {
      try {
        const result = await getRedirectResult(auth)
        if (result) {
          const firebaseUser = result.user

          // Check if user already exists in Firestore
          const userDocRef = doc(db, "users", firebaseUser.uid)
          const userDocSnap = await getDoc(userDocRef)

          if (userDocSnap.exists()) {
            // Existing user - login
            onLogin({ ...userDocSnap.data(), uid: firebaseUser.uid, email: firebaseUser.email })
          } else {
            // New user - need additional info for registration
            setFormData({
              ...formData,
              name: firebaseUser.displayName || "",
              email: firebaseUser.email || "",
            })
            setShowAdditionalInfo(true)
          }
        }
      } catch (error: any) {
        console.error("Redirect result error:", error)
        alert("Authentication failed. Please try again.")
      }
    }

    checkRedirectResult()
  }, [])

  const handleGoogleSignIn = async () => {
    setLoading(true)
    try {
      await signInWithRedirect(auth, googleProvider)
      // The redirect will happen, and we'll handle the result in useEffect
    } catch (error: any) {
      console.error("Google sign-in error:", error)
      let errorMessage = "Google sign-in failed. Please try again."
      if (error.code === "auth/unauthorized-domain") {
        errorMessage =
          "This domain is not authorized for Google sign-in. Please contact support or try from an authorized domain."
      } else if (error.code === "auth/operation-not-allowed") {
        errorMessage = "Google sign-in is not enabled. Please contact support."
      }
      alert(errorMessage)
      setLoading(false)
    }
  }

  // ... (rest of the component remains the same)
}
