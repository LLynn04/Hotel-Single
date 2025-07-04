"use client"

import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"
import { Notification } from "../../components/CostumAlert"

const VerifyNotice = () => {
  const [notification, setNotification] = useState<{
    isOpen: boolean
    title: string
    message: string
    type: "success" | "error" | "info" | "warning"
  }>({
    isOpen: false,
    title: "",
    message: "",
    type: "info",
  })

  const navigate = useNavigate()
  const token = localStorage.getItem("token")

  const showNotification = (title: string, message: string, type: "success" | "error" | "info" | "warning") => {
    setNotification({
      isOpen: true,
      title,
      message,
      type,
    })
  }

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>

    const checkVerification = async () => {
      try {
        // Use the correct endpoint /me instead of /users
        const res = await fetch("http://127.0.0.1:8000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        const data = await res.json()

        if (res.ok) {
          // Handle the response structure properly
          const user = data.user || data

          if (user.email_verified_at) {
            localStorage.setItem("role", user.role)
            localStorage.removeItem("pendingVerificationEmail")

            showNotification("Email Verified!", "Your email has been successfully verified. Redirecting...", "success")

            // Redirect after showing success message
            setTimeout(() => {
              navigate(user.role === "admin" ? "/admin" : "/")
            }, 2000)
          }
        } else {
          console.error("Error checking verification status:", data.message)
        }
      } catch (err) {
        console.error("Error checking verification status:", err)
      }
    }

    if (token) {
      checkVerification()
      intervalId = setInterval(checkVerification, 5000)
    }

    return () => {
      if (intervalId) {
        clearInterval(intervalId)
      }
    }
  }, [navigate, token])

  const resendVerification = async () => {
    try {
      const email = localStorage.getItem("pendingVerificationEmail")

      if (!email) {
        showNotification("Error", "No email found for verification", "error")
        return
      }

      const res = await fetch("http://127.0.0.1:8000/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      })

      const data = await res.json()

      if (res.ok) {
        showNotification("Email Sent!", data.message || "Verification email has been resent to your inbox.", "success")
      } else {
        showNotification("Failed to Send", data.message || "Failed to resend verification email.", "error")
      }
    } catch (err) {
      console.error("Resend verification error:", err)
      showNotification("Network Error", "Network error while resending verification email.", "error")
    }
  }

  return (
    <>
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 text-white px-6">
        <div className="max-w-md w-full bg-white bg-opacity-10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white border-opacity-20">
          {/* Email Icon */}
          <div className="w-20 h-20 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <span className="text-4xl">📧</span>
          </div>

          <h1 className="text-3xl font-bold mb-4 text-center">Verify Your Email</h1>

          <p className="text-center text-lg mb-6 text-gray-200 leading-relaxed">
            A verification link has been sent to your email. Please check your inbox and spam folder.
          </p>

          <div className="bg-blue-50 bg-opacity-20 rounded-lg p-4 mb-6">
            <p className="text-sm text-blue-200 text-center">
              ⏱️ After Verify, You can back to login page and sign in with your account.
            </p>
          </div>

          <button
            onClick={resendVerification}
            className="w-full py-3 bg-gradient-to-r from-yellow-500 to-orange-500 rounded-xl text-lg font-semibold hover:brightness-110 transition duration-300 mb-4"
          >
            Resend Verification Email
          </button>

          <div className="text-center">
            <button
              onClick={() => navigate("/sign-in")}
              className="text-indigo-300 hover:text-indigo-100 font-semibold transition-colors"
            >
              ← Back to Login
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        <div className="mt-8 flex items-center space-x-2 text-gray-300">
          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
          <span className="text-sm">Checking verification status...</span>
        </div>
      </div>

      <Notification
        isOpen={notification.isOpen}
        title={notification.title}
        message={notification.message}
        type={notification.type}
        onClose={() => setNotification({ ...notification, isOpen: false })}
      />
    </>
  )
}

export default VerifyNotice
