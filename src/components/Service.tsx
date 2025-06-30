import React, { useEffect, useState } from "react";

interface ServiceItem {
  id: number;
  name: string;
  description: string;
  price: string;
  duration: number;
  category: string;
  image: string | null;
  is_active: boolean;
}

const Service: React.FC = () => {
  const [services, setServices] = useState<ServiceItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchServices = async () => {
      try {
        const token = localStorage.getItem("token"); // Get token from login
        const res = await fetch("http://localhost:8000/api/services", {
          headers: {
            Authorization: `Bearer ${token}`,
            Accept: "application/json",
          },
        });

        const data = await res.json();
        console.log(data);

        if (res.ok) {
          setServices(data.data);
        } else {
          setError(data.message || "Failed to load services");
        }
      } catch (err) {
        setError("Failed to fetch services. Please check API or network.");
      } finally {
        setLoading(false);
      }
    };
    fetchServices();
  }, []);

  if (loading) {
    return <div className="text-center py-10">Loading services...</div>;
  }

  if (error) {
    return <div className="text-center text-red-500 py-10">{error}</div>;
  }

  return (
    <div className="p-10 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 bg-gray-50 min-h-screen">
      {services.map((service) => (
        <div key={service.id} className="bg-white rounded-xl shadow-lg overflow-hidden">
          {service.image && (
            <img
              src={service.image}
              alt={service.name}
              className="w-full h-40 object-cover"
            />
          )}
          <div className="p-6">
            <h2 className="text-xl font-bold mb-2 text-green-700">
              {service.name}
            </h2>
            <p className="text-gray-600 mb-3">{service.description}</p>
            <div className="text-sm mb-2">
              <span className="font-medium text-gray-700">Category:</span>{" "}
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded">
                {service.category}
              </span>
            </div>
            <div className="text-sm mb-2">
              <span className="font-medium text-gray-700">Duration:</span>{" "}
              {service.duration} minutes
            </div>
            <div className="text-sm mb-4">
              <span className="font-medium text-gray-700">Price:</span>{" "}
              <span className="text-green-600 font-bold">
                ${parseFloat(service.price).toFixed(2)}
              </span>
            </div>
            <span
              className={`inline-block px-3 py-1 rounded-full text-xs font-semibold ${
                service.is_active
                  ? "bg-green-200 text-green-800"
                  : "bg-red-200 text-red-800"
              }`}
            >
              {service.is_active ? "Active" : "Inactive"}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default Service;
