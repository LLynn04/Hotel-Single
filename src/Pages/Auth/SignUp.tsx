"use client"

import type React from "react"

import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { Notification } from "../../components/CostumAlert"

const bgImageUrl = "https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=800&q=80"

const SignUp: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })
  const [loading, setLoading] = useState(false)
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

  const showNotification = (title: string, message: string, type: "success" | "error" | "info" | "warning") => {
    setNotification({
      isOpen: true,
      title,
      message,
      type,
    })
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const validateForm = () => {
    if (!form.name.trim()) {
      showNotification("Validation Error", "Please enter your full name", "error")
      return false
    }
    if (!form.email.trim()) {
      showNotification("Validation Error", "Please enter your email address", "error")
      return false
    }
    if (form.password.length < 6) {
      showNotification("Validation Error", "Password must be at least 6 characters long", "error")
      return false
    }
    if (form.password !== form.password_confirmation) {
      showNotification("Validation Error", "Passwords do not match", "error")
      return false
    }
    return true
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      console.log("Sending registration request...")

      const res = await fetch("http://127.0.0.1:8000/api/register", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          "X-Requested-With": "XMLHttpRequest",
        },
        body: JSON.stringify(form),
      })

      console.log("Response status:", res.status)

      // Check if response is JSON
      const contentType = res.headers.get("content-type")
      if (!contentType || !contentType.includes("application/json")) {
        throw new Error("Server returned non-JSON response. Please check your Laravel API.")
      }

      const data = await res.json()
      console.log("Response data:", data)

      if (res.ok) {
        console.log("Registration successful, preparing to redirect...")

        // Store email for potential resend verification usage
        localStorage.setItem("pendingVerificationEmail", form.email)

        showNotification(
          "Registration Successful!",
          data.message || "Please check your email for verification link. Redirecting...",
          "success",
        )

        // Redirect after showing success message
        setTimeout(() => {
          console.log("Redirecting to verify-notice page...")
          navigate("/verify-notice")
        }, 2000)
      } else {
        // Handle different HTTP status codes
        if (res.status === 422) {
          // Validation errors
          if (data.errors) {
            // Handle specific field errors
            if (data.errors.email) {
              showNotification("Email Already Exists", data.errors.email[0], "error")
            } else if (data.errors.password) {
              showNotification("Password Error", data.errors.password[0], "error")
            } else if (data.errors.name) {
              showNotification("Name Error", data.errors.name[0], "error")
            } else {
              // General validation error
              const errorMessages = Object.values(data.errors).flat().join(", ")
              showNotification("Validation Error", errorMessages as string, "error")
            }
          } else {
            showNotification("Validation Error", data.message || "Please check your input", "error")
          }
        } else if (res.status === 500) {
          // Server error
          showNotification("Server Error", data.message || "Internal server error occurred", "error")
        } else {
          // Other errors
          showNotification("Registration Failed", data.message || "Registration failed", "error")
        }
      }
    } catch (err) {
      console.error("Registration error:", err)

      if (err instanceof TypeError && err.message.includes("Failed to fetch")) {
        showNotification(
          "Connection Error",
          "Cannot connect to server. Please check if your Laravel API is running on http://127.0.0.1:8000",
          "error",
        )
      } else if (err instanceof SyntaxError) {
        showNotification(
          "Server Error",
          "Server returned invalid response. Please check your Laravel API configuration.",
          "error",
        )
      } else {
        showNotification("Network Error", "An unexpected error occurred. Please try again later.", "error")
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      <div className="flex min-h-screen bg-gradient-to-br from-purple-700 via-indigo-800 to-blue-900 text-white font-sans">
        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${bgImageUrl})` }}
        >
          <div className="absolute inset-0 bg-black bg-opacity-50 flex flex-col justify-center items-center px-10">
            <h1 className="text-5xl font-extrabold mb-4 tracking-wide drop-shadow-lg">Welcome to Our Platform!</h1>
            <p className="max-w-sm text-lg font-light drop-shadow">Join us today and experience exclusive benefits.</p>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-10 bg-gradient-to-tr from-gray-900 via-gray-800 to-gray-900 rounded-l-3xl shadow-2xl">
          <div className="w-full max-w-md">
            <h2 className="text-4xl font-bold mb-8 tracking-tight text-center">Create Account</h2>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <input
                  type="text"
                  name="name"
                  placeholder="Full Name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <input
                  type="email"
                  name="email"
                  placeholder="Email Address"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password"
                  placeholder="Password (min 6 characters)"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                  className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <div>
                <input
                  type="password"
                  name="password_confirmation"
                  placeholder="Confirm Password"
                  value={form.password_confirmation}
                  onChange={handleChange}
                  required
                  className="w-full px-5 py-3 rounded-xl bg-gray-800 text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 transition-all"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-purple-600 to-indigo-500 rounded-xl text-lg font-semibold hover:brightness-110 transition duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Sign Up"
                )}
              </button>
            </form>

            <p className="mt-8 text-center text-gray-400">
              Already have an account?{" "}
              <button
                onClick={() => navigate("/sign-in")}
                className="text-indigo-400 hover:text-indigo-600 font-semibold transition-colors"
              >
                Sign In
              </button>
            </p>
          </div>
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

export default SignUp
