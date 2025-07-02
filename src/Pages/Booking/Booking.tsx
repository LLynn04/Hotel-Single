"use client"

import type React from "react"
import { useState, useEffect } from "react"

// Type definitions (same as before)
interface Service {
  id: number
  name: string
  description?: string
  duration?: string
  price?: number
  created_at?: string
  updated_at?: string
}

interface BookingData {
  service_id: string
  booking_date: string
  booking_time: string
  notes: string
}

interface ValidationErrors {
  service_id?: string
  booking_date?: string
  booking_time?: string
  notes?: string
}

interface User {
  id: number
  name: string
  email: string
  role: string
  email_verified_at: string | null
  phone?: string | null
  created_at: string
  updated_at: string
}

const BookingComponent: React.FC<{
  onProceedToConfirm: (bookingData: BookingData, selectedService: Service) => void
  user: User
  token: string
  onLogout: () => void
}> = ({ onProceedToConfirm, user, token, onLogout }) => {
  const [booking, setBooking] = useState<BookingData>({
    service_id: "",
    booking_date: "",
    booking_time: "",
    notes: "",
  })

  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [apiError, setApiError] = useState<string>("")

  const API_BASE_URL = "http://127.0.0.1:8000/api"

  // Fetch services from YOUR API
  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      try {
        console.log("🔄 Fetching services with token:", token.substring(0, 20) + "...")

        const response = await fetch(`${API_BASE_URL}/services`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        console.log("📡 Services API Response status:", response.status)

        if (!response.ok) {
          if (response.status === 401) {
            setApiError("Your session has expired. Please login again.")
            setTimeout(() => onLogout(), 2000)
            return
          }
          throw new Error(`HTTP error! status: ${response.status}`)
        }

        const result = await response.json()
        console.log("📋 Services data received:", result)

        setServices(result.data || result || [])
      } catch (error) {
        console.error("❌ Error fetching services:", error)
        setApiError("Failed to load services. Please refresh the page.")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [token, onLogout])

  // Generate time slots from 9 AM to 5 PM
  const generateTimeSlots = (): string[] => {
    const slots: string[] = []
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")}`
        slots.push(time)
      }
    }
    return slots
  }

  const timeSlots = generateTimeSlots()

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target
    setBooking((prev) => ({
      ...prev,
      [name]: value,
    }))

    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!booking.service_id) {
      newErrors.service_id = "Please select a service"
    }

    if (!booking.booking_date) {
      newErrors.booking_date = "Please select a date"
    } else {
      const selectedDate = new Date(booking.booking_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.booking_date = "Please select a future date"
      }
    }

    if (!booking.booking_time) {
      newErrors.booking_time = "Please select a time"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleProceedToConfirm = (e: React.MouseEvent<HTMLButtonElement>): void => {
    e.preventDefault()
    console.log("🔍 Debug - Attempting to proceed to confirm...")

    if (!validateForm()) {
      console.log("❌ Validation failed:", errors)
      return
    }

    const selectedService = services.find((s) => s.id === Number.parseInt(booking.service_id, 10))

    if (selectedService) {
      console.log("✅ Calling onProceedToConfirm...")
      onProceedToConfirm(booking, selectedService)
    } else {
      console.error("❌ Selected service not found")
    }
  }

  const selectedService: Service | undefined = services.find((s) => s.id === Number.parseInt(booking.service_id, 10))
  const today: string = new Date().toISOString().split("T")[0]

  if (loading) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-600">Loading services...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header with user info */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-xl font-bold text-white">Book Appointment</h2>
            <p className="text-blue-100 text-sm">Select service and time</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">👋 {user.name}</p>
            <button onClick={onLogout} className="text-blue-200 hover:text-white text-xs underline">
              Logout
            </button>
          </div>
        </div>
      </div>

      <div className="p-6 space-y-4">
        {/* Auth Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <div className="text-sm text-green-800">
            ✅ <strong>Authenticated:</strong> {user.name} ({user.email})
            {user.email_verified_at ? " 🟢 Verified" : " 🟡 Not verified"}
          </div>
        </div>

        {/* API Error Display */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
            <div className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0">⚠</div>
            <p className="text-red-800 text-sm">{apiError}</p>
          </div>
        )}

        {/* Service and Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <span className="w-4 h-4 mr-1 text-gray-500">👤</span>
              Service
            </label>
            <select
              name="service_id"
              value={booking.service_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.service_id ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"
              }`}
            >
              <option value="">Choose service...</option>
              {services.map((service: Service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                  {service.duration && ` (${service.duration})`}
                  {service.price && ` - $${service.price}`}
                </option>
              ))}
            </select>
            {errors.service_id && <p className="mt-1 text-xs text-red-600">{errors.service_id}</p>}
          </div>

          {/* Date Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <span className="w-4 h-4 mr-1 text-gray-500">📅</span>
              Date
            </label>
            <input
              type="date"
              name="booking_date"
              value={booking.booking_date}
              onChange={handleInputChange}
              min={today}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.booking_date ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"
              }`}
            />
            {errors.booking_date && <p className="mt-1 text-xs text-red-600">{errors.booking_date}</p>}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <span className="w-4 h-4 mr-1 text-gray-500">🕐</span>
            Time
          </label>
          <select
            name="booking_time"
            value={booking.booking_time}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.booking_time ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"
            }`}
          >
            <option value="">Choose time...</option>
            {timeSlots.map((time: string) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.booking_time && <p className="mt-1 text-xs text-red-600">{errors.booking_time}</p>}
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <span className="w-4 h-4 mr-1 text-gray-500">📝</span>
            Notes (Optional)
          </label>
          <textarea
            name="notes"
            value={booking.notes}
            onChange={handleInputChange}
            placeholder="Special requests..."
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors resize-none"
          />
        </div>

        {/* Booking Summary */}
        {selectedService && booking.booking_date && booking.booking_time && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h3 className="font-semibold text-blue-900 text-sm mb-1">Summary</h3>
            <div className="text-xs text-blue-800 space-y-0.5">
              <p>
                {selectedService.name} • {new Date(booking.booking_date).toLocaleDateString()} • {booking.booking_time}
              </p>
              {selectedService.price && <p className="font-medium">Price: ${selectedService.price}</p>}
            </div>
          </div>
        )}

        {/* Proceed to Confirm Button */}
        <button
          onClick={handleProceedToConfirm}
          disabled={!user.email_verified_at}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-6 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center disabled:opacity-50"
        >
          {!user.email_verified_at ? (
            "Email verification required"
          ) : (
            <>
              <span className="mr-2">Proceed to Confirm</span>
              <span>→</span>
            </>
          )}
        </button>

        {!user.email_verified_at && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
            <p className="text-yellow-800 text-sm">Please verify your email before making bookings.</p>
          </div>
        )}
      </div>
    </div>
  )
}

const ConfirmBooking: React.FC<{
  initialBooking: BookingData
  initialService: Service
  user: User
  token: string
  onBack: () => void
  onBookingSuccess: () => void
  onLogout: () => void
}> = ({ initialBooking, initialService, user, token, onBack, onBookingSuccess, onLogout }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState("")

  const API_BASE_URL = "http://127.0.0.1:8000/api"

  const handleConfirmBooking = async (): Promise<void> => {
    setIsSubmitting(true)
    setApiError("")

    try {
      const payload = {
        ...initialBooking,
        service_id: Number.parseInt(initialBooking.service_id, 10),
      }

      console.log("📤 Sending authenticated booking:", payload)
      console.log("🔑 Using token:", token.substring(0, 20) + "...")

      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      })

      console.log("📡 Booking API Response status:", response.status)

      const data = await response.json()
      console.log("📋 Booking API Response data:", data)

      if (response.ok) {
        setIsSuccess(true)
        // Remove this automatic redirect:
        // setTimeout(() => {
        //   onBookingSuccess()
        // }, 3000)
      } else {
        if (response.status === 401) {
          setApiError("Your session has expired. Please login again.")
          setTimeout(() => onLogout(), 2000)
        } else {
          setApiError(data.message || "Failed to create booking. Please try again.")
        }
      }
    } catch (error) {
      console.error("❌ Booking error:", error)
      setApiError("Network error. Please check your connection and try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <span className="text-green-600 text-2xl">✓</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Booking Confirmed!</h2>
          <p className="text-gray-600 text-sm mb-3">Your appointment has been successfully scheduled.</p>

          <div className="bg-green-50 rounded-lg p-3 text-left mb-4">
            <p className="text-sm text-green-800">
              <strong>Customer:</strong> {user.name}
              <br />
              <strong>Service:</strong> {initialService.name}
              <br />
              <strong>Date:</strong> {new Date(initialBooking.booking_date).toLocaleDateString()}
              <br />
              <strong>Time:</strong> {initialBooking.booking_time}
              {initialService.price && (
                <>
                  <br />
                  <strong>Amount:</strong> ${initialService.price}
                </>
              )}
            </p>
          </div>

          {/* Payment Information */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
            <div className="text-sm text-blue-800">
              <strong>💰 Payment Information:</strong>
              <br />
              Payment will be collected in <strong>cash</strong> during or after your service.
              <br />
              Status: <span className="text-orange-600 font-medium">Payment Pending</span>
            </div>
          </div>

          {/* Manual navigation buttons */}
          <div className="flex space-x-3">
            <button
              onClick={onBookingSuccess}
              className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 transition-colors"
            >
              Book Another Appointment
            </button>
            <button
              onClick={() => (window.location.href = "/")}
              className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-300 transition-colors"
            >
              Go to Home
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Confirm Booking</h2>
        <p className="text-green-100 text-sm">Review and confirm your appointment</p>
      </div>
      <div className="p-6 space-y-4">
        {/* API Error Display */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
            <div className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0">⚠</div>
            <p className="text-red-800 text-sm">{apiError}</p>
          </div>
        )}

        <div className="bg-gray-50 rounded-lg p-4 space-y-3">
          <h3 className="font-semibold text-gray-900 text-lg mb-3">Appointment Details</h3>
          <div className="grid grid-cols-1 gap-3">
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Customer:</span>
              <span className="font-medium text-gray-900">{user.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Service:</span>
              <span className="font-medium text-gray-900">{initialService.name}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Date:</span>
              <span className="font-medium text-gray-900">
                {new Date(initialBooking.booking_date).toLocaleDateString()}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Time:</span>
              <span className="font-medium text-gray-900">{initialBooking.booking_time}</span>
            </div>
            {initialService.price && (
              <div className="flex justify-between items-center">
                <span className="text-sm text-gray-600">Amount:</span>
                <span className="font-medium text-green-600">${initialService.price}</span>
              </div>
            )}
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600">Payment:</span>
              <span className="font-medium text-orange-600">Cash (Pay on service)</span>
            </div>
            {initialBooking.notes && (
              <div className="pt-2 border-t border-gray-200">
                <span className="text-sm text-gray-600 block mb-1">Notes:</span>
                <span className="text-sm text-gray-900">{initialBooking.notes}</span>
              </div>
            )}
          </div>
        </div>

        {/* Add payment notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
          <div className="text-sm text-yellow-800">
            <strong>💡 Payment Notice:</strong> Payment will be collected in cash during or after your service. Your
            booking status will show as "Payment Pending" until payment is received.
          </div>
        </div>

        <div className="flex space-x-3">
          <button
            onClick={onBack}
            className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
          >
            ← Back
          </button>
          <button
            onClick={handleConfirmBooking}
            disabled={isSubmitting}
            className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2.5 px-6 rounded-lg font-semibold text-sm hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                Confirming...
              </span>
            ) : (
              "Confirm Booking"
            )}
          </button>
        </div>
      </div>
    </div>
  )
}

// Main App Component - Works with your existing login system
export default function BookingApp() {
  const [currentStep, setCurrentStep] = useState<"booking" | "confirm">("booking")
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [user, setUser] = useState<User | null>(null)
  const [token, setToken] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState("")

  // Check authentication using YOUR token system
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from localStorage (matching your login page)
        const storedToken = localStorage.getItem("token")
        // const storedRole = localStorage.getItem("role")

        if (!storedToken) {
          setAuthError("Please login to access the booking page.")
          setIsCheckingAuth(false)
          return
        }

        console.log("🔍 Found token, fetching user data...")

        // Fetch current user data using your API
        const response = await fetch("http://127.0.0.1:8000/api/me", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${storedToken}`,
            "Content-Type": "application/json",
            Accept: "application/json",
          },
        })

        if (response.ok) {
          const userData = await response.json()
          console.log("✅ User data fetched:", userData)

          setUser(userData.user || userData)
          setToken(storedToken)
          setCurrentStep("booking")
        } else {
          console.log("❌ Token invalid, clearing storage")
          localStorage.removeItem("token")
          localStorage.removeItem("role")
          setAuthError("Your session has expired. Please login again.")
        }
      } catch (error) {
        console.error("❌ Auth check error:", error)
        setAuthError("Authentication error. Please login again.")
      } finally {
        setIsCheckingAuth(false)
      }
    }

    checkAuth()
  }, [])

  const handleLogout = () => {
    localStorage.removeItem("token")
    localStorage.removeItem("role")
    setUser(null)
    setToken("")
    setAuthError("Please login to access the booking page.")
    setCurrentStep("booking")
    setBookingData(null)
    setSelectedService(null)
    console.log("👋 Logged out")
  }

  const handleProceedToConfirm = (booking: BookingData, service: Service) => {
    console.log("✅ Successfully proceeding to confirm with:", { booking, service })
    setBookingData(booking)
    setSelectedService(service)
    setCurrentStep("confirm")
  }

  const handleBack = () => {
    setCurrentStep("booking")
  }

  const handleBookingSuccess = () => {
    setCurrentStep("booking")
    setBookingData(null)
    setSelectedService(null)
  }

  if (isCheckingAuth) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-2"></div>
          <p className="text-gray-600">Checking authentication...</p>
        </div>
      </div>
    )
  }

  if (authError || !user || !token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200 text-center">
          <div className="mx-auto w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mb-4">
            <span className="text-red-600 text-2xl">🔒</span>
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">Authentication Required</h2>
          <p className="text-gray-600 mb-4">{authError}</p>
          <a
            href="/sign-in"
            className="inline-block bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Login
          </a>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      {currentStep === "booking" && (
        <BookingComponent
          onProceedToConfirm={handleProceedToConfirm}
          user={user}
          token={token}
          onLogout={handleLogout}
        />
      )}

      {currentStep === "confirm" && bookingData && selectedService && (
        <ConfirmBooking
          initialBooking={bookingData}
          initialService={selectedService}
          user={user}
          token={token}
          onBack={handleBack}
          onBookingSuccess={handleBookingSuccess}
          onLogout={handleLogout}
        />
      )}
    </div>
  )
}
