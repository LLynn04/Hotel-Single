"use client"

import type React from "react"
import { useState } from "react"
import { useNavigate } from "react-router-dom"
import { ArrowLeft, Eye, EyeOff } from "lucide-react"

const bgImageUrl =
  "https://plus.unsplash.com/premium_photo-1661964071015-d97428970584?fm=jpg&q=60&w=3000&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MXx8aG90ZWx8ZW58MHx8MHx8fDA%3D"

const SignIn: React.FC = () => {
  const [form, setForm] = useState({ email: "", password: "" })
  const [error, setError] = useState("")
  const [info, setInfo] = useState("")
  const [showResend, setShowResend] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value })
    setError("")
    setInfo("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setInfo("")
    setShowResend(false)

    try {
      const res = await fetch("http://127.0.0.1:8000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })

      const data = await res.json()

      // Debug: Log the entire response to see what we're getting
      console.log("Login response data:", data)
      console.log("User object:", data.user)
      console.log("User object keys:", Object.keys(data.user))
      console.log("Full user object stringified:", JSON.stringify(data.user, null, 2))

      if (res.ok && data.access_token) {
        localStorage.setItem("token", data.access_token)
        localStorage.setItem("role", data.user.role)

        // Admin bypass verification, redirect immediately
        if (data.user.role === "admin") {
          navigate("/admin")
          return
        }

        // For normal users: check email verification status
        const isVerified = data.user.email_verified_at || data.user.is_verified
        console.log("Verification check results:")
        console.log("email_verified_at:", data.user.email_verified_at)
        console.log("is_verified:", data.user.is_verified)
        console.log("Final isVerified:", isVerified)

        if (isVerified) {
          console.log("User is verified, redirecting to homepage")
          localStorage.removeItem("pendingVerificationEmail")
          navigate("/")
        } else {
          console.log("User is NOT verified, redirecting to verify-notice")
          localStorage.setItem("pendingVerificationEmail", form.email)
          navigate("/verify-notice")
        }
      } else if (data.message) {
        setError(data.message)
        // Check for verification-related messages
        const needsVerification =
          data.message.toLowerCase().includes("verify") ||
          data.message.toLowerCase().includes("unverified") ||
          data.message.toLowerCase().includes("confirm")

        if (needsVerification) {
          setShowResend(true)
          localStorage.setItem("pendingVerificationEmail", form.email)
        }
      } else {
        setError("Login failed. Please try again.")
      }
    } catch (err) {
      console.error("Login error:", err)
      setError("Network error. Please check your connection and try again.")
    }
  }

  const handleResendVerification = async () => {
    setInfo("")
    setError("")

    try {
      const res = await fetch("http://127.0.0.1:8000/api/resend-verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: form.email }),
      })

      const data = await res.json()

      if (res.ok) {
        setInfo(data.message || "Verification email sent. Please check your inbox.")
        setShowResend(false)
      } else {
        setError(data.message || "Failed to resend verification email.")
      }
    } catch (err) {
      console.error("Resend verification error:", err)
      setError("Network error when resending verification email.")
    }
  }

  return (
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
            <h1 className="text-6xl font-bold mb-6 tracking-wide drop-shadow-2xl text-white">Welcome Back!</h1>
            <p className="text-xl font-light drop-shadow-lg text-white/90 leading-relaxed">
              Sign in to continue your luxurious journey with us and access exclusive services.
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
            <h2 className="text-4xl font-bold mb-3 tracking-tight text-gray-800">Sign In</h2>
            <p className="text-gray-600">Access your account to continue</p>
          </div>

          <form className="space-y-6" onSubmit={handleSubmit}>
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
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
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

            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-amber-600 to-orange-600 rounded-xl text-lg font-semibold text-white hover:from-amber-700 hover:to-orange-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-[1.02]"
            >
              Sign In
            </button>
          </form>

          {error && (
            <div className="mt-6 p-4 bg-red-50 border border-red-200 rounded-xl">
              <p className="text-red-700 text-center">{error}</p>
              {showResend && (
                <div className="mt-3 text-center space-y-2">
                  <button
                    onClick={handleResendVerification}
                    className="text-amber-600 hover:text-amber-800 font-medium underline transition-colors"
                  >
                    Resend Verification Email
                  </button>
                  <div>
                    <a
                      href="/verify-notice"
                      className="text-sm text-gray-600 hover:text-amber-600 underline transition-colors"
                    >
                      Go to verification instructions
                    </a>
                  </div>
                </div>
              )}
            </div>
          )}

          {info && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-xl">
              <p className="text-green-700 text-center">{info}</p>
            </div>
          )}

          <div className="mt-8 text-center">
            <p className="text-gray-600">
              Don't have an account?{" "}
              <a href="/sign-up" className="text-amber-600 hover:text-amber-800 font-semibold transition-colors">
                Sign Up
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SignIn
