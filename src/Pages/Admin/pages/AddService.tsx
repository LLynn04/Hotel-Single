"use client"

import type React from "react"
import { useEffect, useState } from "react"

// Define correct types
interface FormDataType {
  name: string
  description: string
  price: string
  duration: number
  category: string
  image_url: string
  is_active: boolean
}

interface ServiceItem {
  id?: number
  name: string
  description: string
  price: string
  duration: number
  category: string
  image: string | null
  is_active: boolean
}

// Custom Delete Modal Component
interface DeleteModalProps {
  isOpen: boolean
  serviceName: string
  onConfirm: () => void
  onCancel: () => void
}

const DeleteModal: React.FC<DeleteModalProps> = ({ isOpen, serviceName, onConfirm, onCancel }) => {
  if (!isOpen) return null

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full mx-4 transform transition-all">
        <div className="p-6">
          <div className="flex items-center mb-4">
            <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center mr-4">
              <svg className="w-6 h-6 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                />
              </svg>
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Delete Service</h3>
              <p className="text-sm text-gray-600">This action cannot be undone</p>
            </div>
          </div>
          <p className="text-gray-700 mb-6">
            Are you sure you want to delete <strong>"{serviceName}"</strong>? This will permanently remove the service
            and all associated data.
          </p>
          <div className="flex space-x-3 justify-end">
            <button
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-lg hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 transition-colors"
            >
              Delete Service
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

const AdminServiceCRUD: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [categories, setCategories] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [showForm, setShowForm] = useState(false)
  const [editingService, setEditingService] = useState<ServiceItem | null>(null)
  const [formData, setFormData] = useState<FormDataType>({
    name: "",
    description: "",
    price: "",
    duration: 30,
    category: "",
    image_url: "",
    is_active: true,
  })
  const [isAdmin, setIsAdmin] = useState(false)
  const [checkingAuth, setCheckingAuth] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  // Delete modal state
  const [deleteModal, setDeleteModal] = useState<{
    isOpen: boolean
    serviceId: number | null
    serviceName: string
  }>({
    isOpen: false,
    serviceId: null,
    serviceName: "",
  })


  useEffect(() => {
    const checkAdminStatus = async () => {
      try {
        const token = localStorage.getItem("token")
        if (!token) {
          setIsAdmin(false)
          setCheckingAuth(false)
          setDebugInfo({ error: "No token found" })
          return
        }

        const res = await fetch("http://127.0.0.1:8000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        if (res.ok) {
          const userData = await res.json()
          const adminCheck =
            userData.role === "admin" ||
            userData.is_admin === true ||
            userData.user_type === "admin" ||
            userData.type === "admin" ||
            (userData.user && userData.user.role === "admin") ||
            (userData.user && userData.user.is_admin === true) ||
            (userData.data && userData.data.role === "admin") ||
            (userData.data && userData.data.is_admin === true)

          setIsAdmin(adminCheck)
        } else {
          const errorData = await res.json()
          setDebugInfo({ error: errorData })
          setIsAdmin(false)
        }
      } catch (err) {
        setDebugInfo({ error: (err as Error).message })
        setIsAdmin(false)
      } finally {
        setCheckingAuth(false)
      }
    }

    checkAdminStatus()
  }, [])

  useEffect(() => {
    if (isAdmin) {
      fetchServices()
    }
  }, [isAdmin])

  const fetchServices = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem("token")
      const res = await fetch("http://127.0.0.1:8000/api/services", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      const data = await res.json()
      if (res.ok) {
        const servicesList = data.data || data
        setServices(servicesList)
        // Extract unique categories from existing services
        const uniqueCategories = [...new Set(servicesList.map((s: ServiceItem) => s.category))].filter(
          Boolean,
        ) as string[]
        setCategories(uniqueCategories)
      } else {
        setError(data.message || "Failed to load services")
      }
    } catch (err) {
      setError("Failed to fetch services. Please check your connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : type === "number" ? Number(value) : value,
    }))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    setSelectedFile(file || null)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const token = localStorage.getItem("token")
      const isEdit = !!editingService
      const url = isEdit
        ? `http://127.0.0.1:8000/api/services/${editingService.id}`
        : "http://127.0.0.1:8000/api/services"

      // Create FormData for file upload or use JSON for URL
      let requestBody: FormData | string
      const headers: Record<string, string> = {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      }

      if (selectedFile) {
        // Use FormData for file upload
        const formDataObj = new FormData()
        formDataObj.append("name", formData.name)
        formDataObj.append("description", formData.description)
        formDataObj.append("price", Number.parseFloat(formData.price).toString())
        formDataObj.append("duration", formData.duration.toString())
        formDataObj.append("category", formData.category)
        formDataObj.append("is_active", formData.is_active ? "1" : "0")
        formDataObj.append("image", selectedFile)


        // For PUT requests, Laravel needs _method field
        if (isEdit) {
          formDataObj.append("_method", "PUT")
        }

        requestBody = formDataObj
        // Don't set Content-Type header for FormData, let browser set it
      } else {
        // Use JSON for URL or no image
        const payload = {
          name: formData.name,
          description: formData.description,
          price: Number.parseFloat(formData.price),
          duration: formData.duration,
          category: formData.category,
          is_active: formData.is_active,
          ...(formData.image_url && { image_url: formData.image_url }),
        }

        requestBody = JSON.stringify(payload)
        headers["Content-Type"] = "application/json"
      }

      console.log("🚀 Submitting to:", url)
      console.log("🔑 Token:", token?.substring(0, 20) + "...")
      console.log("📦 Using FormData:", !!selectedFile)

      const res = await fetch(url, {
        method: selectedFile && isEdit ? "POST" : isEdit ? "PUT" : "POST", // Use POST for file uploads even when editing
        headers,
        body: requestBody,
      })

      console.log("📡 Response status:", res.status)
      const data = await res.json()
      console.log("📋 Response data:", data)

      if (res.ok) {
        console.log("✅ Service saved successfully!")
        await fetchServices()
        resetForm()
        setError("")
      } else {
        console.error("❌ Validation errors:", data)
        if (data.errors) {
          const errorMessages = Object.entries(data.errors)
            .map(([field, messages]) => `${field}: ${(messages as string[]).join(", ")}`)
            .join("\n")
          setError(`Validation errors:\n${errorMessages}`)
        } else {
          setError(data.message || "Failed to save service")
        }
      }
    } catch (err) {
      console.error("🔥 Network error:", err)
      setError("Network error. Please check your connection and try again.")
    }
  }

  const handleEdit = (service: ServiceItem) => {
    setEditingService(service)
    setFormData({
      name: service.name,
      description: service.description,
      price: service.price,
      duration: service.duration,
      category: service.category,
      image_url: service.image || "",
      is_active: service.is_active,
    })
    setSelectedFile(null)
    setShowForm(true)
  }

  const showDeleteModal = (service: ServiceItem) => {
    setDeleteModal({
      isOpen: true,
      serviceId: service.id!,
      serviceName: service.name,
    })
  }

  const handleDeleteConfirm = async () => {
    if (!deleteModal.serviceId) return

    try {
      const token = localStorage.getItem("token")
      const res = await fetch(`http://127.0.0.1:8000/api/services/${deleteModal.serviceId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })

      if (res.ok) {
        await fetchServices()
        setDeleteModal({ isOpen: false, serviceId: null, serviceName: "" })
      } else {
        const data = await res.json()
        setError(data.message || "Failed to delete service")
      }
    } catch (err) {
      setError("Failed to delete service. Please try again.")
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      description: "",
      price: "",
      duration: 30,
      category: "",
      image_url: "",
      is_active: true,
    })
    setSelectedFile(null)
    setEditingService(null)
    setShowForm(false)
  }

  // Helper function to get image URL
  const getImageUrl = (imagePath: string | null) => {
    if (!imagePath) return null

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

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Checking permissions...</p>
        </div>
      </div>
    )
  }

  if (!isAdmin) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 to-red-100 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Access Denied</h3>
          <p className="text-slate-600 mb-4">You need administrator privileges to access this page.</p>
          <div className="mt-4 p-4 bg-gray-100 rounded-lg text-left">
            <h4 className="font-semibold text-sm mb-2">Debug Info:</h4>
            <pre className="text-xs text-gray-600 overflow-auto max-h-32">{JSON.stringify(debugInfo, null, 2)}</pre>
          </div>
          <button
            onClick={() => {
              localStorage.removeItem("token")
              window.location.href = "/login"
            }}
            className="mt-4 px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Login Again
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg">Loading services...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-50">
      {/* Header */}
      <div className="bg-white/80 backdrop-blur-sm border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent mb-2">
                Service Management
              </h1>
              <p className="text-slate-600">Manage your services as an administrator</p>
            </div>
            <button
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-6 py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
            >
              Add New Service
            </button>
          </div>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-6 py-8">
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg mb-6">
            <div className="flex justify-between items-start">
              <div>
                <h4 className="font-semibold mb-1">Error occurred:</h4>
                <pre className="text-sm whitespace-pre-wrap">{error}</pre>
              </div>
              <button onClick={() => setError("")} className="text-red-500 hover:text-red-700 font-bold text-lg">
                &times;
              </button>
            </div>
          </div>
        )}

        {/* Service Form Modal */}
        {showForm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-slate-200">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingService ? "Edit Service" : "Add New Service"}
                </h2>
                <p className="text-sm text-slate-600 mt-1">Provide an image URL for the service</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Service Name *</label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleInputChange}
                      required
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="Enter service name"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Category *</label>
                    {categories.length > 0 ? (
                      <select
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      >
                        <option value="">Select a category</option>
                        {categories.map((category) => (
                          <option key={category} value={category}>
                            {category}
                          </option>
                        ))}
                        <option value="__custom__">+ Add new category</option>
                      </select>
                    ) : (
                      <input
                        type="text"
                        name="category"
                        value={formData.category}
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                        placeholder="e.g., Wellness & Spa, Dining & Food, Transportation"
                      />
                    )}
                    {formData.category === "__custom__" && (
                      <input
                        type="text"
                        name="category"
                        value=""
                        onChange={handleInputChange}
                        required
                        className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent mt-2"
                        placeholder="Enter new category name"
                      />
                    )}
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Price ($) *</label>
                    <input
                      type="text"
                      name="price"
                      value={formData.price}
                      onChange={handleInputChange}
                      required
                      step="0.01"
                      min="0"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="49.99"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Duration (minutes) *</label>
                    <input
                      type="number"
                      name="duration"
                      value={formData.duration}
                      onChange={handleInputChange}
                      required
                      min="15"
                      step="15"
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      placeholder="30"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">Description *</label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    required
                    rows={4}
                    className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    placeholder="Describe the service..."
                  />
                </div>

                {/* Image Upload Section */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Upload Image File</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleFileChange}
                      className="w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                    />
                    {selectedFile && (
                      <div className="mt-2">
                        <p className="text-sm text-green-600">Selected: {selectedFile.name}</p>
                        <img
                          src={URL.createObjectURL(selectedFile) || "/placeholder.svg"}
                          alt="Preview"
                          className="mt-2 w-20 h-20 object-cover rounded-lg border"
                        />
                      </div>
                    )}
                  </div>

                  <div className="text-center text-slate-500">
                    <span>OR</span>
                  </div>


                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-2">Image URL</label>
                    <input
                      type="url"
                      name="image_url"
                      value={formData.image_url}
                      onChange={handleInputChange}
                      disabled={!!selectedFile}
                      className={`w-full px-4 py-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent ${
                        selectedFile ? "bg-gray-100 text-gray-500 cursor-not-allowed" : ""
                      }`}
                      placeholder="https://example.com/image.jpg"
                    />
                    {selectedFile && (
                      <p className="text-xs text-slate-500 mt-1">Image URL is disabled when a file is selected</p>
                    )}
                    {formData.image_url && !selectedFile && (
                      <img
                        src={formData.image_url || "/placeholder.svg"}
                        alt="URL Preview"
                        className="mt-2 w-20 h-20 object-cover rounded-lg border"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement
                          target.style.display = "none"
                        }}
                      />
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <input
                    type="checkbox"
                    name="is_active"
                    checked={formData.is_active}
                    onChange={handleInputChange}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-slate-300 rounded"
                  />
                  <label className="ml-2 block text-sm text-slate-700">
                    Service is active and visible to customers
                  </label>
                </div>

                <div className="flex gap-4 pt-4">
                  <button
                    type="submit"
                    className="flex-1 bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-3 rounded-xl font-semibold hover:from-indigo-700 hover:to-purple-700 transition-all duration-300"
                  >
                    {editingService ? "Update Service" : "Create Service"}
                  </button>
                  <button
                    type="button"
                    onClick={resetForm}
                    className="flex-1 bg-slate-200 text-slate-700 py-3 rounded-xl font-semibold hover:bg-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}


        {/* Services Table */}
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Service
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Category
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Price
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Duration
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-4 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {services.map((service) => (
                  <tr key={service.id} className="hover:bg-slate-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <img
                          src={
                            getImageUrl(service.image) || "/placeholder.svg?height=48&width=48" || "/placeholder.svg"
                          }
                          alt={service.name}
                          className="w-12 h-12 rounded-lg object-cover mr-4 border border-slate-200"
                          onError={(e) => {
                            const target = e.target as HTMLImageElement
                            target.src = "/placeholder.svg?height=48&width=48"
                          }}
                        />
                        <div>
                          <div className="text-sm font-medium text-slate-900">{service.name}</div>
                          <div className="text-sm text-slate-500 truncate max-w-xs">{service.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                        {service.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                      ${Number.parseFloat(service.price).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">{service.duration} min</td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          service.is_active ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}
                      >
                        {service.is_active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-2">
                      <button
                        onClick={() => handleEdit(service)}
                        className="text-indigo-600 hover:text-indigo-900 font-medium"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => showDeleteModal(service)}

                        className="text-red-600 hover:text-red-900 font-medium"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {services.length === 0 && (
          <div className="text-center py-16">
            <div className="w-24 h-24 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-12 h-12 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-xl font-semibold text-slate-900 mb-2">No services found</h3>
            <p className="text-slate-600 mb-4">Get started by creating your first service.</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-indigo-600 text-white px-6 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
            >
              Add New Service
            </button>
          </div>
        )}
      </div>

      {/* Custom Delete Modal */}
      <DeleteModal
        isOpen={deleteModal.isOpen}
        serviceName={deleteModal.serviceName}
        onConfirm={handleDeleteConfirm}
        onCancel={() => setDeleteModal({ isOpen: false, serviceId: null, serviceName: "" })}
      />
    </div>
  )
}

export default AdminServiceCRUD
