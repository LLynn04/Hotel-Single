"use client"

import type React from "react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

interface ServiceItem {
  id: number
  name: string
  description: string
  price: string
  duration: number
  category: string
  image: string | null
  is_active: boolean
}

const Service: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("all")
  const navigate = useNavigate()

  // Helper function to get proper image URL
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

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token")
        const res = await fetch("http://127.0.0.1:8000/api/services", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        })

        const data = await res.json()
        if (res.ok) {
          setServices(data.data)
        } else {
          setError(data.message || "Failed to load services")
        }
      } catch (err) {
        setError("Failed to fetch services. Please check your connection.")
      } finally {
        setLoading(false)
      }
    }

    fetchServices()
  }, [])

  const handleBookService = (service: ServiceItem) => {
    // Store the selected service in localStorage for the booking page
    localStorage.setItem("selectedService", JSON.stringify(service))
    // Navigate to the booking page
    navigate("/booking")
  }

  const categories = ["all", ...new Set(services.map((service) => service.category))]

  const filteredServices =
    selectedCategory === "all"
      ? services.filter((service) => service.is_active)
      : services.filter((service) => service.category === selectedCategory && service.is_active)

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-200 border-t-indigo-600 mx-auto mb-4"></div>
          <p className="text-slate-600 text-lg font-medium">Loading amazing services...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center">
        <div className="text-center p-8 bg-white rounded-2xl shadow-xl max-w-md border border-red-100">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>
          <h3 className="text-xl font-semibold text-slate-900 mb-2">Oops! Something went wrong</h3>
          <p className="text-slate-600 mb-4">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-colors font-medium"
          >
            Try Again
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50">
      {/* Enhanced Header Section */}
      <div className="bg-white/90 backdrop-blur-md border-b border-indigo-100 sticky top-0 z-20 shadow-sm">
        <div className="max-w-7xl mx-auto px-6 py-8">
          <div className="text-center mb-8">
            <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Our Premium Services
            </h1>
            <p className="text-slate-600 text-xl max-w-3xl mx-auto leading-relaxed">
              Discover our comprehensive range of professional services designed to exceed your expectations
            </p>
          </div>

          {/* Enhanced Category Filter */}
          <div className="flex flex-wrap justify-center gap-3">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={`px-8 py-3 rounded-full font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === category
                    ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-200"
                    : "bg-white text-slate-700 hover:bg-slate-50 hover:text-slate-900 shadow-md border border-slate-200"
                }`}
              >
                {category.charAt(0).toUpperCase() + category.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Services Grid */}
      <div className="max-w-7xl mx-auto px-6 py-12">
        {filteredServices.length === 0 ? (
          <div className="text-center py-20">
            <div className="w-32 h-32 bg-gradient-to-br from-slate-100 to-slate-200 rounded-full flex items-center justify-center mx-auto mb-8">
              <svg className="w-16 h-16 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                />
              </svg>
            </div>
            <h3 className="text-2xl font-semibold text-slate-900 mb-3">No services found</h3>
            <p className="text-slate-600 text-lg">Try selecting a different category or check back later.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredServices.map((service) => (
              <div
                key={service.id}
                className="bg-white rounded-3xl shadow-lg hover:shadow-2xl transition-all duration-500 overflow-hidden group hover:-translate-y-3 border border-slate-100"
              >
                {/* Enhanced Service Image */}
                <div className="relative h-56 bg-gradient-to-br from-indigo-100 via-purple-100 to-pink-100 overflow-hidden">
                  {service.image ? (
                    <img
                      src={getImageUrl(service.image) || "/placeholder.svg?height=224&width=400"}
                      alt={service.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement
                        target.src = "/placeholder.svg?height=224&width=400"
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-20 h-20 bg-white/30 rounded-full flex items-center justify-center backdrop-blur-sm">
                        <svg
                          className="w-10 h-10 text-indigo-600"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"
                          />
                        </svg>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-4 right-4">
                    <span className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white px-4 py-2 rounded-full text-sm font-semibold shadow-lg">
                      {service.category}
                    </span>
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                </div>

                {/* Enhanced Service Content */}
                <div className="p-8">
                  <h3 className="text-2xl font-bold text-slate-900 mb-4 group-hover:text-indigo-600 transition-colors">
                    {service.name}
                  </h3>

                  <p className="text-slate-600 mb-6 line-clamp-3 leading-relaxed">{service.description}</p>

                  {/* Enhanced Service Details */}
                  <div className="space-y-4 mb-8">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center text-slate-600">
                        <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                          <svg
                            className="w-4 h-4 text-indigo-600"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                        </div>
                        <span className="font-medium">{service.duration} minutes</span>
                      </div>
                      <div className="text-right">
                        <span className="text-3xl font-bold bg-gradient-to-r from-indigo-600 to-purple-600 bg-clip-text text-transparent">
                          ${Number.parseFloat(service.price).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Book Now Button */}
                  <button
                    onClick={() => handleBookService(service)}
                    className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white py-4 rounded-2xl font-bold text-lg hover:from-indigo-700 hover:via-purple-700 hover:to-pink-700 transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl group-hover:shadow-indigo-200 relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center justify-center">
                      <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                        />
                      </svg>
                      Book Now
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-pink-600 via-purple-600 to-indigo-600 opacity-0 hover:opacity-100 transition-opacity duration-300" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Enhanced Footer Section */}
      <div className="bg-white/80 backdrop-blur-sm border-t border-indigo-100 mt-16">
        <div className="max-w-7xl mx-auto px-6 py-12 text-center">
          <h3 className="text-2xl font-bold text-slate-900 mb-4">Ready to Experience Excellence?</h3>
          <p className="text-slate-600 text-lg mb-8 max-w-2xl mx-auto">
            Choose from our premium services and let our professionals take care of you
          </p>
          <div className="flex flex-wrap justify-center gap-6 text-sm text-slate-500">
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Professional Staff
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Cash Payment on Arrival
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Easy Booking Process
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 mr-2 text-green-500" fill="currentColor" viewBox="0 0 20 20">
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
              Satisfaction Guaranteed
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Service
