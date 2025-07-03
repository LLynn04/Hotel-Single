"use client"

import { useState, useEffect } from "react"
import { ConfirmModal, Notification } from "../../../components/CostumAlert"

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

interface UsersResponse {
  message?: string
  data?: User[]
  total?: number
}

interface ServicesResponse {
  message?: string
  data?: Service[]
  total?: number
}

interface DashboardStats {
  totalUsers: number
  totalServices: number
  totalBookings: number
  pendingBookings: number
  approvedBookings: number
  pendingPayments: number
}

const AdminDashboard = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalServices: 0,
    totalBookings: 0,
    pendingBookings: 0,
    approvedBookings: 0,
    pendingPayments: 0,
  })
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [processingBooking, setProcessingBooking] = useState<number | null>(null)

  // Modal states
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean
    title: string
    message: string
    onConfirm: () => void
    type?: "danger" | "warning" | "info"
  }>({
    isOpen: false,
    title: "",
    message: "",
    onConfirm: () => {},
  })

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

  const showConfirmModal = (
    title: string,
    message: string,
    onConfirm: () => void,
    type: "danger" | "warning" | "info" = "warning",
  ) => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      onConfirm,
      type,
    })
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

        // Fetch all data in parallel
        const [usersResponse, servicesResponse, bookingsResponse] = await Promise.all([
          fetch(`${API_BASE_URL}/users`, { headers }),
          fetch(`${API_BASE_URL}/services`, { headers }),
          fetch(`${API_BASE_URL}/bookings`, { headers }),
        ])

        if (!usersResponse.ok || !servicesResponse.ok || !bookingsResponse.ok) {
          throw new Error("Failed to fetch data from one or more endpoints")
        }

        const usersData: UsersResponse | User[] = await usersResponse.json()
        const servicesData: ServicesResponse | Service[] = await servicesResponse.json()
        const bookingsData: BookingsResponse = await bookingsResponse.json()

        console.log("📋 API Responses:", { usersData, servicesData, bookingsData })

        // Handle different response structures for users
        const totalUsers = Array.isArray(usersData) ? usersData.length : usersData.data?.length || usersData.total || 0

        // Handle different response structures for services
        const totalServices = Array.isArray(servicesData)
          ? servicesData.length
          : servicesData.data?.length || servicesData.total || 0

        // Handle Laravel pagination structure for bookings
        const fetchedBookings = bookingsData.data?.data || []
        const totalBookingsCount = bookingsData.data?.total || 0

        if (!Array.isArray(fetchedBookings)) {
          console.error("❌ Bookings data is not an array:", fetchedBookings)
          setError("Invalid bookings data format")
          return
        }

        setBookings(fetchedBookings)

        // Calculate stats
        const pendingBookings = fetchedBookings.filter((b) => b.status === "pending").length
        const approvedBookings = fetchedBookings.filter((b) => b.status === "approved").length
        const pendingPayments = fetchedBookings.filter((b) => b.payment_status === "pending").length

        setStats({
          totalUsers,
          totalServices,
          totalBookings: totalBookingsCount,
          pendingBookings,
          approvedBookings,
          pendingPayments,
        })
      } catch (err) {
        console.error("❌ Dashboard fetch error:", err)
        setError(err instanceof Error ? err.message : "Network error occurred")
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const updateBookingStatus = async (bookingId: number, status: "approved" | "rejected") => {
    const action = status === "approved" ? "approve" : "reject"
    const booking = bookings.find((b) => b.id === bookingId)

    showConfirmModal(
      `${action.charAt(0).toUpperCase() + action.slice(1)} Booking`,
      `Are you sure you want to ${action} the booking for "${booking?.service.name}" by ${booking?.user.name}?`,
      async () => {
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

            // Show success notification
            showNotification("Success!", `Booking has been ${status} successfully!`, "success")
            console.log(`✅ Booking ${bookingId} ${status}`)
          } else {
            console.error("Failed to update booking status:", data.message)
            showNotification("Error", `Failed to ${action} booking: ${data.message}`, "error")
            setError(`Failed to ${status} booking`)
          }
        } catch (err) {
          console.error("Error updating booking status:", err)
          showNotification("Network Error", `Network error occurred while trying to ${action} booking`, "error")
          setError("Network error occurred")
        } finally {
          setProcessingBooking(null)
        }
      },
      status === "rejected" ? "danger" : "warning",
    )
  }

  const markPaymentReceived = async (bookingId: number, amount: string) => {
    const booking = bookings.find((b) => b.id === bookingId)

    showConfirmModal(
      "Mark Payment Received",
      `Are you sure you want to mark the payment of $${amount} for "${booking?.service.name}" as received?`,
      async () => {
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
              prev.map((booking) =>
                booking.id === bookingId ? { ...booking, payment_status: "paid" as const } : booking,
              ),
            )

            // Update stats
            setStats((prev) => ({
              ...prev,
              pendingPayments: prev.pendingPayments - 1,
            }))

            // Show success notification
            showNotification(
              "Payment Received!",
              `Payment of $${amount} has been marked as received successfully!`,
              "success",
            )
            console.log(`✅ Payment marked as received for booking ${bookingId}`)
          } else {
            console.error("Failed to mark payment as received:", data.message)
            showNotification("Error", `Failed to mark payment as received: ${data.message}`, "error")
            setError("Failed to mark payment as received")
          }
        } catch (err) {
          console.error("Error marking payment as received:", err)
          showNotification("Network Error", "Network error occurred while marking payment as received", "error")
          setError("Network error occurred")
        } finally {
          setProcessingBooking(null)
        }
      },
      "info",
    )
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
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mr-3"></div>
        <span className="text-gray-600">Loading dashboard...</span>
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
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-4">
          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <span className="text-blue-600 text-xl">👥</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <span className="text-green-600 text-xl">🛎️</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Services</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalServices}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <span className="text-purple-600 text-xl">📅</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Total Bookings</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-yellow-100 rounded-lg">
                <span className="text-yellow-600 text-xl">⏳</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Approval</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingBookings}</p>
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
                <p className="text-2xl font-bold text-gray-900">{stats.approvedBookings}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg border border-gray-200 p-4 shadow-sm">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <span className="text-orange-600 text-xl">💰</span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-600">Pending Payment</p>
                <p className="text-2xl font-bold text-gray-900">{stats.pendingPayments}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Bookings Management */}
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-semibold text-gray-900">Booking Management</h2>
            <p className="text-sm text-gray-600 mt-1">Approve, reject, and manage payments for bookings</p>
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
                  <tr key={booking.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.user.name}</div>
                        <div className="text-sm text-gray-500">{booking.user.email}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">{booking.service.name}</div>
                        <div className="text-sm text-gray-500">{booking.service.category}</div>
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
                              className="bg-green-600 text-white px-3 py-1 rounded text-xs hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {processingBooking === booking.id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                                  Loading
                                </div>
                              ) : (
                                "Approve"
                              )}
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, "rejected")}
                              disabled={processingBooking === booking.id}
                              className="bg-red-600 text-white px-3 py-1 rounded text-xs hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                              {processingBooking === booking.id ? (
                                <div className="flex items-center">
                                  <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                                  Loading
                                </div>
                              ) : (
                                "Reject"
                              )}
                            </button>
                          </>
                        )}
                        {booking.status === "approved" && booking.payment_status === "pending" && (
                          <button
                            onClick={() => markPaymentReceived(booking.id, booking.total_amount)}
                            disabled={processingBooking === booking.id}
                            className="bg-blue-600 text-white px-3 py-1 rounded text-xs hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                          >
                            {processingBooking === booking.id ? (
                              <div className="flex items-center">
                                <div className="animate-spin rounded-full h-3 w-3 border-b border-white mr-1"></div>
                                Loading
                              </div>
                            ) : (
                              "Mark Paid"
                            )}
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

      {/* Custom Modals */}
      <ConfirmModal
        isOpen={confirmModal.isOpen}
        title={confirmModal.title}
        message={confirmModal.message}
        onConfirm={() => {
          confirmModal.onConfirm()
          setConfirmModal({ ...confirmModal, isOpen: false })
        }}
        onCancel={() => setConfirmModal({ ...confirmModal, isOpen: false })}
        type={confirmModal.type}
      />

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

export default AdminDashboard
