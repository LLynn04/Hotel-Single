"use client"

import { useState, useEffect } from "react"
import { Notification } from "../../components/CostumAlert"

interface User {
  id: number
  name: string
  email: string
  email_verified_at: string | null
  role: string
  phone: string | null
  created_at: string
  updated_at: string
}

interface Service {
  id: number
  name: string
  description: string
  price: string
  duration: number
  category: string
  image: string
  is_active: boolean
  created_at: string
  updated_at: string
}

interface Booking {
  id: number
  user_id: number
  service_id: number
  booking_date: string
  booking_time: string
  status: "pending" | "approved" | "rejected" | "completed" | "cancelled"
  payment_status: "pending" | "paid"
  total_amount: string
  notes: string | null
  admin_notes: string | null
  created_at: string
  updated_at: string
  user: User
  service: Service
}

interface BookingsResponse {
  message: string
  data: {
    current_page: number
    data: Booking[]
    first_page_url: string
    from: number
    last_page: number
    last_page_url: string
    links: Array<{
      url: string | null
      label: string
      active: boolean
    }>
    next_page_url: string | null
    path: string
    per_page: number
    prev_page_url: string | null
    to: number
    total: number
  }
}

const UserBookingHistory = () => {
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [user, setUser] = useState<User | null>(null)

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

  const getAuthToken = () => {
    return localStorage.getItem("token") || ""
  }

  const showNotification = (title: string, message: string, type: "success" | "error" | "info" | "warning") => {
    setNotification({
      isOpen: true,
      title,
      message,
      type,
    })
  }

  // Fetch user's bookings
  useEffect(() => {
    const fetchUserBookings = async () => {
      try {
        const token = getAuthToken()
        if (!token) {
          setError("No authentication token found")
          setLoading(false)
          return
        }

        const headers = {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        }

        // Fetch user profile first - using the correct endpoint /me
        const userResponse = await fetch(`${API_BASE_URL}/me`, { headers })
        if (!userResponse.ok) {
          throw new Error("Failed to fetch user profile")
        }
        const userData = await userResponse.json()
        setUser(userData.user || userData)

        // Fetch user's bookings - using the existing /bookings endpoint
        // This endpoint should return only the current user's bookings
        const bookingsResponse = await fetch(`${API_BASE_URL}/bookings`, { headers })
        if (!bookingsResponse.ok) {
          throw new Error("Failed to fetch bookings")
        }

        const bookingsData: BookingsResponse = await bookingsResponse.json()
        console.log("📋 User Bookings Response:", bookingsData)

        // Handle Laravel pagination structure
        const fetchedBookings = bookingsData.data?.data || []

        if (!Array.isArray(fetchedBookings)) {
          console.error("❌ Bookings data is not an array:", fetchedBookings)
          setError("Invalid bookings data format")
          return
        }

        setBookings(fetchedBookings)

        if (fetchedBookings.length > 0) {
          showNotification(
            "Bookings Loaded",
            `Found ${fetchedBookings.length} booking${fetchedBookings.length === 1 ? "" : "s"}`,
            "success",
          )
        }
      } catch (err) {
        console.error("❌ User bookings fetch error:", err)
        const errorMessage = err instanceof Error ? err.message : "Network error occurred"
        setError(errorMessage)
        showNotification("Error Loading Bookings", errorMessage, "error")
      } finally {
        setLoading(false)
      }
    }

    fetchUserBookings()
  }, [])

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-yellow-100 text-yellow-800"
      case "approved":
        return "bg-green-100 text-green-800"
      case "rejected":
        return "bg-red-100 text-red-800"
      case "completed":
        return "bg-blue-100 text-blue-800"
      case "cancelled":
        return "bg-gray-100 text-gray-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "pending":
        return "bg-orange-100 text-orange-800"
      case "paid":
        return "bg-green-100 text-green-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Loading your bookings...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-6">
        <p className="text-red-800 mb-4">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition-colors"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <>
      <div className="space-y-6 p-6 bg-gray-50 min-h-screen">
        {/* User Profile Header */}
        {user && (
          <div className="bg-white rounded-lg border border-gray-200 p-6 shadow-sm">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl text-blue-600">👤</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
                <p className="text-gray-600">{user.email}</p>
                <p className="text-sm text-gray-500">Member since {formatDate(user.created_at)}</p>
              </div>
            </div>
          </div>
        )}

        {/* Booking Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{bookings.length}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === "pending").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">✅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Approved</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === "approved").length}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-red-100 rounded-lg">
                <span className="text-red-600 text-xl">❌</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Rejected</p>
                <p className="text-2xl font-bold text-gray-900">
                  {bookings.filter((b) => b.status === "rejected").length}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Booking History */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">My Booking History</h2>
            <p className="text-sm text-gray-600 mt-1">View all your bookings and their current status</p>
          </div>

          {bookings.length === 0 ? (
            <div className="text-center py-12">
              <div className="w-24 h-24 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl text-gray-400">📅</span>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">No bookings yet</h3>
              <p className="text-gray-500">You haven't made any bookings yet. Start by booking a service!</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Service
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date & Time
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Amount
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Payment
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Notes
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {bookings.map((booking) => (
                    <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <img
                            src={booking.service.image || "/placeholder.svg?height=48&width=48"}
                            alt={booking.service.name}
                            className="w-12 h-12 rounded-lg object-cover mr-4"
                          />
                          <div>
                            <div className="text-sm font-medium text-gray-900">{booking.service.name}</div>
                            <div className="text-sm text-gray-500">{booking.service.category}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-gray-900">{formatDate(booking.booking_date)}</div>
                          <div className="text-sm text-gray-500">{formatTime(booking.booking_time)}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">${booking.total_amount}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(booking.status)}`}
                        >
                          {booking.status}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getPaymentStatusColor(booking.payment_status)}`}
                        >
                          {booking.payment_status}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          {booking.notes && (
                            <div>
                              <span className="text-xs font-medium text-gray-500">Your note:</span>
                              <p className="text-sm text-gray-700">{booking.notes}</p>
                            </div>
                          )}
                          {booking.admin_notes && (
                            <div>
                              <span className="text-xs font-medium text-blue-600">Admin note:</span>
                              <p className="text-sm text-blue-700">{booking.admin_notes}</p>
                            </div>
                          )}
                          {!booking.notes && !booking.admin_notes && (
                            <span className="text-sm text-gray-400">No notes</span>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Custom Notification */}
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

export default UserBookingHistory
