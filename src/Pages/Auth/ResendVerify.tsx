"use client"

import type React from "react"
import { useEffect, useState } from "react"

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

const SuperDebugAdmin: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([])
  const [loading, setLoading] = useState(true)
  const [debugInfo, setDebugInfo] = useState<any>(null)
  const [fixInfo, setFixInfo] = useState<any>(null)

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
      console.log("🔍 FULL API RESPONSE:", data)

      if (res.ok) {
        const servicesList = data.data || data
        setServices(servicesList)

        // Log each service in detail
        servicesList.forEach((service: ServiceItem, index: number) => {
          console.log(`🔍 SERVICE ${index + 1}:`, {
            id: service.id,
            name: service.name,
            image: service.image,
            imageLength: service.image?.length,
            startsWithHttp: service.image?.startsWith("http"),
            startsWithServices: service.image?.startsWith("services/"),
          })
        })
      }
    } catch (err) {
      console.error("❌ Fetch error:", err)
    } finally {
      setLoading(false)
    }
  }

  const debugStorage = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://127.0.0.1:8000/api/debug-storage", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const data = await res.json()
      setDebugInfo(data)
      console.log("🔍 STORAGE DEBUG:", data)
    } catch (err) {
      console.error("❌ Debug storage failed:", err)
    }
  }

  const fixImageUrls = async () => {
    try {
      const token = localStorage.getItem("token")
      const res = await fetch("http://127.0.0.1:8000/api/fix-image-urls", {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      })
      const data = await res.json()
      setFixInfo(data)
      console.log("🔧 FIX INFO:", data)
    } catch (err) {
      console.error("❌ Fix URLs failed:", err)
    }
  }

  const testDirectImageAccess = (imageUrl: string) => {
    if (imageUrl) {
      console.log("🔗 Testing direct access to:", imageUrl)
      window.open(imageUrl, "_blank")
    }
  }

  useEffect(() => {
    fetchServices()
    debugStorage()
    fixImageUrls()
  }, [])

  if (loading) {
    return <div className="p-8">Loading...</div>
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8">🔍 Super Debug Mode</h1>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Services List */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Services ({services.length})</h2>
          <div className="space-y-4">
            {services.map((service) => (
              <div key={service.id} className="border rounded p-4">
                <h3 className="font-medium">{service.name}</h3>
                <div className="mt-2 space-y-2">
                  <div className="text-sm">
                    <strong>Image:</strong>
                    <code className="ml-2 bg-gray-100 px-2 py-1 rounded text-xs">{service.image || "NULL"}</code>
                  </div>

                  {service.image && (
                    <>
                      <div className="text-sm">
                        <strong>Type:</strong> {service.image.startsWith("http") ? "🌐 URL" : "📁 File Path"}
                      </div>

                      <button
                        onClick={() => testDirectImageAccess(service.image!)}
                        className="bg-blue-500 text-white px-3 py-1 rounded text-sm hover:bg-blue-600"
                      >
                        Test Direct Access
                      </button>

                      <div className="mt-2">
                        <img
                          src={service.image || "/placeholder.svg"}
                          alt={service.name}
                          className="w-16 h-16 object-cover rounded border"
                          onLoad={() => console.log(`✅ Image loaded: ${service.name}`)}
                          onError={(e) => {
                            console.log(`❌ Image failed: ${service.name} - ${service.image}`)
                            const target = e.target as HTMLImageElement
                            target.style.border = "2px solid red"
                          }}
                        />
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Debug Info */}
        <div className="space-y-6">
          {/* Storage Debug */}
          <div className="bg-yellow-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔧 Storage Debug</h2>
            {debugInfo && (
              <pre className="text-xs bg-yellow-100 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(debugInfo, null, 2)}
              </pre>
            )}
          </div>

          {/* Fix Info */}
          <div className="bg-green-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🔧 Fix Analysis</h2>
            {fixInfo && (
              <pre className="text-xs bg-green-100 p-4 rounded overflow-auto max-h-64">
                {JSON.stringify(fixInfo, null, 2)}
              </pre>
            )}
          </div>

          {/* Actions */}
          <div className="bg-gray-50 rounded-lg shadow p-6">
            <h2 className="text-xl font-semibold mb-4">🎯 Actions</h2>
            <div className="space-y-2">
              <button
                onClick={fetchServices}
                className="w-full bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
              >
                Refresh Services
              </button>
              <button
                onClick={debugStorage}
                className="w-full bg-yellow-500 text-white px-4 py-2 rounded hover:bg-yellow-600"
              >
                Debug Storage
              </button>
              <button
                onClick={fixImageUrls}
                className="w-full bg-green-500 text-white px-4 py-2 rounded hover:bg-green-600"
              >
                Analyze Image URLs
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default SuperDebugAdmin
