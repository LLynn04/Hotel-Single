"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"
import { Notification } from "../../components/CostumAlert"

const bgImageUrl =
  "https://plus.unsplash.com/premium_photo-1661907977530-eb64ddbfb88a?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8aG90ZWwlMjBsb2JieXxlbnwwfHwwfHx8MA%3D%3D"

const SignUp: React.FC = () => {
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  })
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
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
      <div className="flex min-h-screen bg-gradient-to-br from-amber-50 via-orange-50 to-red-50 text-gray-800 font-sans relative">
        {/* Back Button */}
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white/90 backdrop-blur-sm rounded-full shadow-lg hover:bg-white transition-all duration-300 text-gray-700 hover:text-gray-900"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Home</span>
        </button>

        <div
          className="hidden md:block md:w-1/2 bg-cover bg-center relative"
          style={{ backgroundImage: `url(${bgImageUrl})` }}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-black/60 via-black/40 to-black/60 flex flex-col justify-center items-center px-10">
            <div className="text-center max-w-lg">
              <h1 className="text-6xl font-bold mb-6 tracking-wide drop-shadow-2xl text-white">
                Join Our Elite Community!
              </h1>
              <p className="text-xl font-light drop-shadow-lg text-white/90 leading-relaxed">
                Create your account today and unlock exclusive luxury experiences and premium services.
              </p>
              <div className="mt-8 flex items-center justify-center gap-4">
                <div className="w-12 h-0.5 bg-white/60"></div>
                <div className="w-3 h-3 rounded-full bg-white/80"></div>
                <div className="w-12 h-0.5 bg-white/60"></div>
              </div>
            </div>
          </div>
        </div>

        <div className="flex flex-col justify-center items-center w-full md:w-1/2 p-10 bg-gradient-to-br from-white via-gray-50 to-gray-100">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <h2 className="text-4xl font-bold mb-3 tracking-tight text-gray-800">Create Account</h2>
              <p className="text-gray-600">Join us and start your journey</p>
            </div>

            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <input
                  type="text"
                  name="name"
                  placeholder="Enter your full name"
                  value={form.name}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
                <input
                  type="email"
                  name="email"
                  placeholder="Enter your email"
                  value={form.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 shadow-sm"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    placeholder="Create a password (min 6 characters)"
                    value={form.password}
                    onChange={handleChange}
                    required
                    minLength={6}
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <div className="space-y-1">
                <label className="block text-sm font-medium text-gray-700 mb-2">Confirm Password</label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    name="password_confirmation"
                    placeholder="Confirm your password"
                    value={form.password_confirmation}
                    onChange={handleChange}
                    required
                    className="w-full px-4 py-3 pr-12 rounded-xl border border-gray-300 bg-white text-gray-800 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-transparent transition-all duration-300 shadow-sm"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                  >
                    {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-lg font-semibold text-white hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02] disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              >
                {loading ? (
                  <div className="flex items-center justify-center">
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Creating Account...
                  </div>
                ) : (
                  "Create Account"
                )}
              </button>
            </form>

            <div className="mt-8 text-center">
              <p className="text-gray-600">
                Already have an account?{" "}
                <button
                  onClick={() => navigate("/sign-in")}
                  className="text-amber-600 hover:text-amber-800 font-semibold transition-colors"
                >
                  Sign In
                </button>
              </p>
            </div>
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
