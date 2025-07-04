"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { Notification } from "../../components/CostumAlert"
import { Edit3, Calendar, Clock, UserIcon, DollarSign, FileText, ArrowLeft } from "lucide-react"

// Type definitions
interface Service {
  id: number
  name: string
  description?: string
  duration?: string | number
  price?: number | string
  category?: string
  image?: string | null // Changed from string | undefined to string | null
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

interface AppUser {
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
  user: AppUser
  token: string
  onLogout: () => void
  preSelectedService?: Service | null
}> = ({ onProceedToConfirm, user, token, onLogout, preSelectedService }) => {
  const [booking, setBooking] = useState<BookingData>({
    service_id: preSelectedService ? preSelectedService.id.toString() : "",
    booking_date: "",
    booking_time: "",
    notes: "",
  })
  const [services, setServices] = useState<Service[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [apiError, setApiError] = useState<string>("")

  const API_BASE_URL = "http://127.0.0.1:8000/api"

  // Helper function to get image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "/placeholder.svg?height=60&width=60"
    // If it's already a full URL (starts with http:// or https://), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath
    }
    // If it starts with 'services/' (Laravel storage path), prepend the storage URL
    if (imagePath.startsWith("services/")) {
      return `http://127.0.0.1:8000/storage/${imagePath}`
    }
    // If it's just a filename or other relative path, assume it's in storage/services
    return `http://127.0.0.1:8000/storage/services/${imagePath}`
  }

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
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-2"></div>
          <span className="text-gray-600">Loading services...</span>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 px-6 py-6">
        <div className="flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold text-white">Book Your Service</h2>
            <p className="text-blue-100 text-sm">Reserve now, pay cash when you arrive</p>
          </div>
          <div className="text-right">
            <p className="text-blue-100 text-sm">👋 {user.name}</p>
            <button onClick={onLogout} className="text-blue-200 hover:text-white text-xs underline">
              Logout
            </button>
          </div>
        </div>
      </div>

      {/* Pre-selected Service Display */}
      {preSelectedService && (
        <div className="bg-gradient-to-r from-green-50 to-blue-50 border-b border-green-200 p-6">
          <div className="flex items-center space-x-4">
            <img
              src={getImageUrl(preSelectedService.image) || "/placeholder.svg"}
              alt={preSelectedService.name}
              className="w-16 h-16 rounded-lg object-cover border-2 border-white shadow-md"
              onError={(e) => {
                const target = e.target as HTMLImageElement
                target.src = "/placeholder.svg?height=60&width=60"
              }}
            />
            <div>
              <h3 className="text-lg font-bold text-gray-900">{preSelectedService.name}</h3>
              <p className="text-gray-600 text-sm">{preSelectedService.description}</p>
              <div className="flex items-center space-x-3 mt-1">
                <span className="text-lg font-semibold text-green-600">
                  $
                  {typeof preSelectedService.price === "string"
                    ? preSelectedService.price
                    : preSelectedService.price?.toFixed(2)}
                </span>
                <span className="text-sm text-gray-500">{preSelectedService.duration} minutes</span>
                {preSelectedService.category && (
                  <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                    {preSelectedService.category}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="p-6 space-y-6">
        {/* Auth Status */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="text-sm text-green-800">
            ✅ <strong>Authenticated:</strong> {user.name} ({user.email})
            {user.email_verified_at ? " 🟢 Verified" : " 🟡 Not verified"}
          </div>
        </div>

        {/* Cash Payment Notice */}
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
              <span className="text-yellow-600 text-lg">💰</span>
            </div>
            <div>
              <h3 className="font-semibold text-yellow-800">Cash Payment Required</h3>
              <p className="text-sm text-yellow-700">
                Payment will be collected in cash when you arrive for your service. No online payment required.
              </p>
            </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Service Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="w-4 h-4 mr-2 text-gray-500">🛎️</span>
              Service
            </label>
            <select
              name="service_id"
              value={booking.service_id}
              onChange={handleInputChange}
              disabled={!!preSelectedService}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.service_id ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"
              } ${preSelectedService ? "bg-gray-100 cursor-not-allowed" : ""}`}
            >
              <option value="">Choose service...</option>
              {services.map((service: Service) => (
                <option key={service.id} value={service.id}>
                  {service.name}
                  {service.duration && ` (${service.duration} min)`}
                  {service.price && ` - $${service.price}`}
                </option>
              ))}
            </select>
            {errors.service_id && <p className="mt-1 text-xs text-red-600">{errors.service_id}</p>}
            {preSelectedService && <p className="mt-1 text-xs text-blue-600">Service pre-selected from homepage</p>}
          </div>

          {/* Date Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
              <span className="w-4 h-4 mr-2 text-gray-500">📅</span>
              Service Date
            </label>
            <input
              type="date"
              name="booking_date"
              value={booking.booking_date}
              onChange={handleInputChange}
              min={today}
              className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.booking_date ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"
              }`}
            />
            {errors.booking_date && <p className="mt-1 text-xs text-red-600">{errors.booking_date}</p>}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <span className="w-4 h-4 mr-2 text-gray-500">🕐</span>
            Preferred Time
          </label>
          <select
            name="booking_time"
            value={booking.booking_time}
            onChange={handleInputChange}
            className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
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
          <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
            <span className="w-4 h-4 mr-2 text-gray-500">📝</span>
            Special Requests (Optional)
          </label>
          <textarea
            name="notes"
            value={booking.notes}
            onChange={handleInputChange}
            placeholder="Any special requests or notes for your service..."
            rows={3}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors resize-none"
          />
        </div>

        {/* Booking Summary */}
        {selectedService && booking.booking_date && booking.booking_time && (
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <h3 className="font-semibold text-blue-900 text-base mb-3">Booking Summary</h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-blue-700">Service:</span>
                <span className="font-medium text-blue-900">{selectedService.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Date:</span>
                <span className="font-medium text-blue-900">{new Date(booking.booking_date).toLocaleDateString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-blue-700">Time:</span>
                <span className="font-medium text-blue-900">{booking.booking_time}</span>
              </div>
              {selectedService.price && (
                <div className="flex justify-between">
                  <span className="text-blue-700">Amount (Cash):</span>
                  <span className="font-bold text-green-600">${selectedService.price}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-blue-700">Payment:</span>
                <span className="font-medium text-orange-600">Cash on Arrival</span>
              </div>
            </div>
          </div>
        )}

        {/* Important Instructions */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-2">Important Instructions</h4>
          <ul className="text-sm text-gray-700 space-y-1">
            <li>• Arrive 10 minutes before your scheduled time</li>
            <li>• Bring exact cash amount for payment</li>
            <li>• Payment is required before service begins</li>
            <li>• You will receive a cash receipt upon payment</li>
            <li>• Cancellations must be made at least 2 hours in advance</li>
          </ul>
        </div>

        {/* Proceed to Confirm Button */}
        <button
          onClick={handleProceedToConfirm}
          disabled={!user.email_verified_at}
          className="w-full bg-gradient-to-r from-blue-600 via-purple-600 to-indigo-600 text-white py-4 px-6 rounded-lg font-semibold text-base hover:from-blue-700 hover:via-purple-700 hover:to-indigo-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 flex items-center justify-center disabled:opacity-50 shadow-lg"
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
  user: AppUser
  token: string
  onBack: () => void
  onBookingSuccess: () => void
  onLogout: () => void
}> = ({ initialBooking, initialService, user, token, onBack, onBookingSuccess, onLogout }) => {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)
  const [apiError, setApiError] = useState("")
  const [isEditing, setIsEditing] = useState(false)
  const [services, setServices] = useState<Service[]>([])
  const [editedBooking, setEditedBooking] = useState<BookingData>(initialBooking)
  const [editedService, setEditedService] = useState<Service>(initialService)
  const [errors, setErrors] = useState<ValidationErrors>({})
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

  const API_BASE_URL = "http://127.0.0.1:8000/api"

  // Helper function to get image URL
  const getImageUrl = (imagePath: string | null | undefined) => {
    if (!imagePath) return "/placeholder.svg?height=120&width=120"
    // If it's already a full URL (starts with http:// or https://), return as is
    if (imagePath.startsWith("http://") || imagePath.startsWith("https://")) {
      return imagePath
    }
    // If it starts with 'services/' (Laravel storage path), prepend the storage URL
    if (imagePath.startsWith("services/")) {
      return `http://127.0.0.1:8000/storage/${imagePath}`
    }
    // If it's just a filename or other relative path, assume it's in storage/services
    return `http://127.0.0.1:8000/storage/services/${imagePath}`
  }

  // Fetch services for editing
  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      try {
        const response = await fetch(`${API_BASE_URL}/services`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.ok) {
          const result = await response.json()
          setServices(result.data || result || [])
        }
      } catch (error) {
        console.error("❌ Error fetching services:", error)
      }
    }

    if (isEditing) {
      fetchServices()
    }
  }, [isEditing, token])

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

  const showNotification = (title: string, message: string, type: "success" | "error" | "info" | "warning") => {
    setNotification({
      isOpen: true,
      title,
      message,
      type,
    })
  }

  const handleEditInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>,
  ): void => {
    const { name, value } = e.target
    setEditedBooking((prev) => ({
      ...prev,
      [name]: value,
    }))

    // Update selected service when service_id changes
    if (name === "service_id") {
      const selectedService = services.find((s) => s.id === Number.parseInt(value, 10))
      if (selectedService) {
        setEditedService(selectedService)
      }
    }

    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }))
    }
  }

  const validateEditForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    if (!editedBooking.service_id) {
      newErrors.service_id = "Please select a service"
    }

    if (!editedBooking.booking_date) {
      newErrors.booking_date = "Please select a date"
    } else {
      const selectedDate = new Date(editedBooking.booking_date)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      if (selectedDate < today) {
        newErrors.booking_date = "Please select a future date"
      }
    }

    if (!editedBooking.booking_time) {
      newErrors.booking_time = "Please select a time"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSaveEdit = () => {
    if (validateEditForm()) {
      setIsEditing(false)
      showNotification("Changes Saved", "Your booking details have been updated", "success")
    }
  }

  const handleCancelEdit = () => {
    setEditedBooking(initialBooking)
    setEditedService(initialService)
    setErrors({})
    setIsEditing(false)
  }

  const handleConfirmBooking = async (): Promise<void> => {
    setIsSubmitting(true)
    setApiError("")

    try {
      const payload = {
        ...editedBooking,
        service_id: Number.parseInt(editedBooking.service_id, 10),
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
        showNotification(
          "Booking Confirmed!",
          "Your appointment has been successfully scheduled. Please bring cash payment when you arrive.",
          "success",
        )
      } else {
        if (response.status === 401) {
          setApiError("Your session has expired. Please login again.")
          setTimeout(() => onLogout(), 2000)
        } else {
          setApiError(data.message || "Failed to create booking. Please try again.")
          showNotification("Booking Failed", data.message || "Failed to create booking", "error")
        }
      }
    } catch (error) {
      console.error("❌ Booking error:", error)
      setApiError("Network error. Please check your connection and try again.")
      showNotification("Network Error", "Failed to submit booking. Please try again.", "error")
    } finally {
      setIsSubmitting(false)
    }
  }

  const today: string = new Date().toISOString().split("T")[0]

  if (isSuccess) {
    return (
      <>
        <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-8 border border-gray-200">
          <div className="text-center">
            <div className="mx-auto w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mb-4">
              <span className="text-green-600 text-3xl">✓</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-3">Booking Confirmed!</h2>
            <p className="text-gray-600 mb-6">Your appointment has been successfully scheduled.</p>

            <div className="bg-green-50 rounded-lg p-4 text-left mb-6">
              <h3 className="font-semibold text-green-800 mb-2">Appointment Details</h3>
              <div className="space-y-1 text-sm text-green-700">
                <p>
                  <strong>Customer:</strong> {user.name}
                </p>
                <p>
                  <strong>Service:</strong> {editedService.name}
                </p>
                <p>
                  <strong>Date:</strong> {new Date(editedBooking.booking_date).toLocaleDateString()}
                </p>
                <p>
                  <strong>Time:</strong> {editedBooking.booking_time}
                </p>
                {editedService.price && (
                  <p>
                    <strong>Amount:</strong> ${editedService.price}
                  </p>
                )}
              </div>
            </div>

            {/* Payment Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
              <div className="text-sm text-blue-800">
                <strong>💰 Payment Information:</strong>
                <br />
                Payment will be collected in <strong>cash</strong> when you arrive for your service.
                <br />
                Status: <span className="text-orange-600 font-medium">Payment Pending</span>
              </div>
            </div>

            {/* Manual navigation buttons */}
            <div className="flex space-x-3">
              <button
                onClick={onBookingSuccess}
                className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                Book Another Service
              </button>
              <button
                onClick={() => (window.location.href = "/")}
                className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
              >
                Go to Home
              </button>
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

  return (
    <>
      <div className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
        <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold text-white">Confirm Your Booking</h2>
              <p className="text-green-100 text-sm">Review and confirm your appointment details</p>
            </div>
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="flex items-center gap-2 px-3 py-1 bg-white/20 rounded-lg text-white hover:bg-white/30 transition-colors"
              >
                <Edit3 size={16} />
                <span className="text-sm">Edit</span>
              </button>
            )}
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* API Error Display */}
          {apiError && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
              <div className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0">⚠</div>
              <p className="text-red-800 text-sm">{apiError}</p>
            </div>
          )}

          {/* Service Image and Details */}
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
            <div className="flex items-start space-x-4">
              <img
                src={getImageUrl(editedService.image) || "/placeholder.svg"}
                alt={editedService.name}
                className="w-24 h-24 rounded-lg object-cover border-2 border-white shadow-md flex-shrink-0"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  target.src = "/placeholder.svg?height=120&width=120"
                }}
              />
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{editedService.name}</h3>
                <p className="text-gray-600 text-sm mb-3">{editedService.description}</p>
                <div className="flex items-center space-x-4">
                  {editedService.price && (
                    <div className="flex items-center gap-1">
                      <DollarSign size={16} className="text-green-600" />
                      <span className="text-lg font-semibold text-green-600">${editedService.price}</span>
                    </div>
                  )}
                  {editedService.duration && (
                    <div className="flex items-center gap-1">
                      <Clock size={16} className="text-blue-600" />
                      <span className="text-sm text-gray-600">{editedService.duration} minutes</span>
                    </div>
                  )}
                  {editedService.category && (
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded-full">
                      {editedService.category}
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>

          {isEditing ? (
            /* Edit Mode */
            <div className="space-y-6">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Edit3 size={16} className="text-yellow-600" />
                  <h3 className="font-semibold text-yellow-800">Edit Booking Details</h3>
                </div>
                <p className="text-sm text-yellow-700">Make changes to your booking below</p>
              </div>

              {/* Service Selection */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <span className="w-4 h-4 mr-2 text-gray-500">🛎️</span>
                  Service
                </label>
                <select
                  name="service_id"
                  value={editedBooking.service_id}
                  onChange={handleEditInputChange}
                  className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                    errors.service_id ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"
                  }`}
                >
                  <option value="">Choose service...</option>
                  {services.map((service: Service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                      {service.duration && ` (${service.duration} min)`}
                      {service.price && ` - $${service.price}`}
                    </option>
                  ))}
                </select>
                {errors.service_id && <p className="mt-1 text-xs text-red-600">{errors.service_id}</p>}
              </div>

              {/* Date and Time */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Calendar size={16} className="mr-2 text-gray-500" />
                    Service Date
                  </label>
                  <input
                    type="date"
                    name="booking_date"
                    value={editedBooking.booking_date}
                    onChange={handleEditInputChange}
                    min={today}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                      errors.booking_date ? "border-red-300 bg-red-50" : "border-gray-300 bg-gray-50"
                    }`}
                  />
                  {errors.booking_date && <p className="mt-1 text-xs text-red-600">{errors.booking_date}</p>}
                </div>

                <div>
                  <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                    <Clock size={16} className="mr-2 text-gray-500" />
                    Preferred Time
                  </label>
                  <select
                    name="booking_time"
                    value={editedBooking.booking_time}
                    onChange={handleEditInputChange}
                    className={`w-full px-4 py-3 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
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
              </div>

              {/* Notes */}
              <div>
                <label className="flex items-center text-sm font-medium text-gray-700 mb-2">
                  <FileText size={16} className="mr-2 text-gray-500" />
                  Special Requests (Optional)
                </label>
                <textarea
                  name="notes"
                  value={editedBooking.notes}
                  onChange={handleEditInputChange}
                  placeholder="Any special requests or notes for your service..."
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors resize-none"
                />
              </div>

              {/* Edit Actions */}
              <div className="flex space-x-3">
                <button
                  onClick={handleCancelEdit}
                  className="flex-1 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSaveEdit}
                  className="flex-1 bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 transition-colors"
                >
                  Save Changes
                </button>
              </div>
            </div>
          ) : (
            /* View Mode */
            <div className="bg-gray-50 rounded-lg p-6 space-y-4">
              <h3 className="font-semibold text-gray-900 text-lg mb-4">Appointment Details</h3>

              <div className="grid grid-cols-1 gap-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <UserIcon size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Customer:</span>
                  </div>
                  <span className="font-medium text-gray-900">{user.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-600">Service:</span>
                  </div>
                  <span className="font-medium text-gray-900">{editedService.name}</span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Calendar size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Date:</span>
                  </div>
                  <span className="font-medium text-gray-900">
                    {new Date(editedBooking.booking_date).toLocaleDateString()}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Clock size={16} className="text-gray-500" />
                    <span className="text-sm text-gray-600">Time:</span>
                  </div>
                  <span className="font-medium text-gray-900">{editedBooking.booking_time}</span>
                </div>

                {editedService.price && (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <DollarSign size={16} className="text-gray-500" />
                      <span className="text-sm text-gray-600">Amount:</span>
                    </div>
                    <span className="font-medium text-green-600">${editedService.price}</span>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Payment:</span>
                  <span className="font-medium text-orange-600">Cash on Arrival</span>
                </div>

                {editedBooking.notes && (
                  <div className="pt-2 border-t border-gray-200">
                    <div className="flex items-start gap-2">
                      <FileText size={16} className="text-gray-500 mt-0.5" />
                      <div>
                        <span className="text-sm text-gray-600 block mb-1">Notes:</span>
                        <span className="text-sm text-gray-900">{editedBooking.notes}</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {!isEditing && (
            <>
              {/* Add payment notice */}
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="text-sm text-yellow-800">
                  <strong>💡 Payment Notice:</strong> Payment will be collected in cash when you arrive for your
                  service. Your booking status will show as "Payment Pending" until payment is received.
                </div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={onBack}
                  className="flex items-center gap-2 bg-gray-200 text-gray-700 py-3 px-4 rounded-lg font-medium hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
                >
                  <ArrowLeft size={16} />
                  Back
                </button>

                <button
                  onClick={handleConfirmBooking}
                  disabled={isSubmitting}
                  className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-3 px-6 rounded-lg font-semibold hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <span className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Confirming...
                    </span>
                  ) : (
                    "Confirm Booking (Pay Cash on Arrival)"
                  )}
                </button>
              </div>
            </>
          )}
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

// Main App Component - Works with your existing login system
export default function BookingApp() {
  const [currentStep, setCurrentStep] = useState<"booking" | "confirm">("booking")
  const [bookingData, setBookingData] = useState<BookingData | null>(null)
  const [selectedService, setSelectedService] = useState<Service | null>(null)
  const [user, setUser] = useState<AppUser | null>(null)
  const [token, setToken] = useState("")
  const [isCheckingAuth, setIsCheckingAuth] = useState(true)
  const [authError, setAuthError] = useState("")
  const [preSelectedService, setPreSelectedService] = useState<Service | null>(null)

  // Check authentication using YOUR token system
  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Get token from localStorage (matching your login page)
        const storedToken = localStorage.getItem("token")
        const storedService = localStorage.getItem("selectedService")

        // Load pre-selected service if available
        if (storedService) {
          try {
            const service = JSON.parse(storedService)
            setPreSelectedService(service)
            console.log("🎯 Pre-selected service loaded:", service.name)
          } catch (error) {
            console.error("Error parsing stored service:", error)
          }
        }

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
    localStorage.removeItem("selectedService")
    setUser(null)
    setToken("")
    setAuthError("Please login to access the booking page.")
    setCurrentStep("booking")
    setBookingData(null)
    setSelectedService(null)
    setPreSelectedService(null)
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
    // Clear the selected service from localStorage after successful booking
    localStorage.removeItem("selectedService")
    setPreSelectedService(null)
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
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 py-8">
      <div className="max-w-4xl mx-auto px-6">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {preSelectedService ? `Book ${preSelectedService.name}` : "Book Your Service"}
          </h1>
          <p className="text-gray-600">Reserve now, pay cash when you arrive</p>
        </div>

        {currentStep === "booking" && (
          <BookingComponent
            onProceedToConfirm={handleProceedToConfirm}
            user={user}
            token={token}
            onLogout={handleLogout}
            preSelectedService={preSelectedService}
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
    </div>
  )
}
