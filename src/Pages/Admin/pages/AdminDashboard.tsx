"use client"

import { useState, useEffect } from "react"

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

interface DashboardStats {
  totalUsers: number
  totalBookings: number
  pendingBookings: number
  approvedBookings: number
  pendingPayments: number
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    pendingPayments: 0,
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingBooking, setProcessingBooking] = useState<number | null>(null)

  const API_BASE_URL = "http://127.0.0.1:8000/api"

  const getAuthToken = () => {
    return localStorage.getItem("token") || ""
  }

  // Fetch all data
  useEffect(() => {
    const fetchDashboardData = async () => {
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

        // Fetch users count only
        const usersResponse = await fetch(`${API_BASE_URL}/users`, { headers })

        // Fetch bookings
        const bookingsResponse = await fetch(`${API_BASE_URL}/bookings`, { headers })

        if (usersResponse.ok && bookingsResponse.ok) {
          const usersData = await usersResponse.json()
          const bookingsData = await bookingsResponse.json()

          console.log("📋 Users API Response:", usersData)
          console.log("📋 Bookings API Response:", bookingsData)
          console.log("📋 Bookings data structure:", {
            isArray: Array.isArray(bookingsData),
            hasData: !!bookingsData.data,
            dataIsArray: Array.isArray(bookingsData.data),
            total: bookingsData.total,
            currentPage: bookingsData.current_page,
          })

          // Handle different API response structures
          const totalUsers = Array.isArray(usersData)
            ? usersData.length
            : usersData.data?.length || usersData.total || 0

          // 🔧 FIXED: Handle Laravel pagination structure
          const fetchedBookings = Array.isArray(bookingsData) ? bookingsData : bookingsData.data || []

          // 🔧 ADDITIONAL FIX: Also handle total count from pagination
          const totalBookingsCount = Array.isArray(bookingsData)
            ? bookingsData.length
            : bookingsData.total || bookingsData.data?.length || 0

          // Ensure fetchedBookings is an array
          if (!Array.isArray(fetchedBookings)) {
            console.error("❌ Bookings is not an array:", fetchedBookings)
            setError("Invalid bookings data format")
            return
          }

          setBookings(fetchedBookings)

          // Calculate stats using the correct total count
          const pendingBookings = fetchedBookings.filter((b) => b.status === "pending").length
          const approvedBookings = fetchedBookings.filter((b) => b.status === "approved").length
          const pendingPayments = fetchedBookings.filter((b) => b.payment_status === "pending").length

          setStats({
            totalUsers,
            totalBookings: totalBookingsCount, // Use the correct total count
            pendingBookings,
            approvedBookings,
            pendingPayments,
          })
        } else {
          const usersError = !usersResponse.ok ? await usersResponse.text() : ""
          const bookingsError = !bookingsResponse.ok ? await bookingsResponse.text() : ""
          console.error("❌ API Errors:", { usersError, bookingsError })
          setError("Failed to fetch dashboard data")
        }
      } catch (err) {
        console.error("❌ Dashboard fetch error:", err)
        setError("Network error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const updateBookingStatus = async (bookingId: number, status: "approved" | "rejected") => {
    try {
      setProcessingBooking(bookingId)
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update local state
        setBookings((prev) => prev.map((booking) => (booking.id === bookingId ? { ...booking, status } : booking)))

        // Update stats
        setStats((prev) => ({
          ...prev,
          pendingBookings: prev.pendingBookings - 1,
          approvedBookings: status === "approved" ? prev.approvedBookings + 1 : prev.approvedBookings,
        }))

        console.log(`✅ Booking ${bookingId} ${status}`)
      } else {
        console.error("Failed to update booking status:", data.message)
        setError(`Failed to ${status} booking`)
      }
    } catch (err) {
      console.error("Error updating booking status:", err)
      setError("Network error occurred")
    } finally {
      setProcessingBooking(null)
    }
  }

  const markPaymentReceived = async (bookingId: number, amount: string) => {
    try {
      setProcessingBooking(bookingId)
      const token = getAuthToken()

      const response = await fetch(`${API_BASE_URL}/bookings/${bookingId}/mark-payment-received`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          received_amount: Number.parseFloat(amount),
          admin_notes: `Cash payment of $${amount} received`,
        }),
      })

      const data = await response.json()

      if (response.ok) {
        // Update local state
        setBookings((prev) =>
          prev.map((booking) => (booking.id === bookingId ? { ...booking, payment_status: "paid" as const } : booking)),
        )

        // Update stats
        setStats((prev) => ({
          ...prev,
          pendingPayments: prev.pendingPayments - 1,
        }))

        console.log(`✅ Payment marked as received for booking ${bookingId}`)
      } else {
        console.error("Failed to mark payment as received:", data.message)
        setError("Failed to mark payment as received")
      }
    } catch (err) {
      console.error("Error marking payment as received:", err)
      setError("Network error occurred")
    } finally {
      setProcessingBooking(null)
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString()
  }

  const formatTime = (timeString: string) => {
    return new Date(timeString).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-purple-600 mr-3"></div>
        <span className="text-gray-600">Loading dashboard...</span>
      </div>
    )
  }

  if (error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg p-4">
        <p className="text-red-800">Error: {error}</p>
        <button
          onClick={() => window.location.reload()}
          className="mt-2 bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700"
        >
          Retry
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-blue-100 rounded-lg">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-blue-600 font-medium">Total Users</p>
              <p className="text-2xl font-bold text-blue-900">{stats.totalUsers}</p>
            </div>
          </div>
        </div>

        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-green-100 rounded-lg">
              <span className="text-green-600 text-xl">📅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-green-600 font-medium">Total Bookings</p>
              <p className="text-2xl font-bold text-green-900">{stats.totalBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-yellow-600 font-medium">Pending Approval</p>
              <p className="text-2xl font-bold text-yellow-900">{stats.pendingBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-purple-100 rounded-lg">
              <span className="text-purple-600 text-xl">✅</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-purple-600 font-medium">Approved</p>
              <p className="text-2xl font-bold text-purple-900">{stats.approvedBookings}</p>
            </div>
          </div>
        </div>

        <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
          <div className="flex items-center">
            <div className="p-2 bg-orange-100 rounded-lg">
              <span className="text-orange-600 text-xl">💰</span>
            </div>
            <div className="ml-3">
              <p className="text-sm text-orange-600 font-medium">Pending Payment</p>
              <p className="text-2xl font-bold text-orange-900">{stats.pendingPayments}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Bookings Management */}
      <div className="bg-white rounded-lg border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-xl font-semibold text-gray-900">Booking Management</h2>
          <p className="text-sm text-gray-600">Approve, reject, and manage payments for bookings</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Customer
                </th>
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
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {bookings.map((booking) => (
                <tr key={booking.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div>
                      <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                      <div className="text-sm text-gray-500">{booking.user.email}</div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{booking.service.name}</div>
                    <div className="text-sm text-gray-500">{booking.service.category}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">{formatDate(booking.booking_date)}</div>
                    <div className="text-sm text-gray-500">{formatTime(booking.booking_time)}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">${booking.total_amount}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.status === "pending"
                          ? "bg-yellow-100 text-yellow-800"
                          : booking.status === "approved"
                            ? "bg-green-100 text-green-800"
                            : booking.status === "rejected"
                              ? "bg-red-100 text-red-800"
                              : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {booking.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span
                      className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                        booking.payment_status === "pending"
                          ? "bg-orange-100 text-orange-800"
                          : "bg-green-100 text-green-800"
                      }`}
                    >
                      {booking.payment_status}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <div className="flex space-x-2">
                      {booking.status === "pending" && (
                        <>
                          <button
                            onClick={() => updateBookingStatus(booking.id, "approved")}
                            disabled={processingBooking === booking.id}
                            className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50"
                          >
                            {processingBooking === booking.id ? "..." : "Approve"}
                          </button>
                          <button
                            onClick={() => updateBookingStatus(booking.id, "rejected")}
                            disabled={processingBooking === booking.id}
                            className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50"
                          >
                            {processingBooking === booking.id ? "..." : "Reject"}
                          </button>
                        </>
                      )}
                      {booking.status === "approved" && booking.payment_status === "pending" && (
                        <button
                          onClick={() => markPaymentReceived(booking.id, booking.total_amount)}
                          disabled={processingBooking === booking.id}
                          className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50"
                        >
                          {processingBooking === booking.id ? "..." : "Mark Paid"}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {bookings.length === 0 && (
            <div className="text-center py-8">
              <p className="text-gray-500">No bookings found</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default AdminDashboard
