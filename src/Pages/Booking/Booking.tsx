import React, { useState, useEffect } from "react";
import {
  Calendar,
  Clock,
  FileText,
  User,
  CheckCircle,
  AlertCircle,
  Loader,
} from "lucide-react";

// Type definitions
interface Service {
  id: number;
  name: string;
  description?: string;
  duration?: string;
  price?: number;
  created_at?: string;
  updated_at?: string;
}

interface BookingData {
  service_id: string;
  booking_date: string;
  booking_time: string;
  notes: string;
}

interface BookingPayload {
  service_id: number;
  booking_date: string;
  booking_time: string;
  notes: string;
}

interface ValidationErrors {
  service_id?: string;
  booking_date?: string;
  booking_time?: string;
  notes?: string;
}

interface ApiError {
  message?: string;
  errors?: Record<string, string[]>;
}

const BookingComponent: React.FC = () => {
  const [booking, setBooking] = useState<BookingData>({
    service_id: "",
    booking_date: "",
    booking_time: "",
    notes: "",
  });

  const [services, setServices] = useState<Service[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [apiError, setApiError] = useState<string>("");

  // Environment variables with fallback
  const API_BASE_URL =
    import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

  // Get auth token from localStorage or your auth context
  const getAuthToken = () => {
    return localStorage.getItem("auth_token") || ""; // Adjust based on your auth implementation
  };

  // Fetch services from API
  useEffect(() => {
    const fetchServices = async (): Promise<void> => {
      try {
        const token = getAuthToken();
        const response = await fetch(`${API_BASE_URL}/services`, {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
            ...(token && { Authorization: `Bearer ${token}` }),
          },
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const result = await response.json();
        setServices(result.data || []);
      } catch (error) {
        console.error("Error fetching services:", error);
        setApiError("Failed to load services. Please refresh the page.");
      } finally {
        setLoading(false);
      }
    };

    fetchServices();
  }, [API_BASE_URL]);

  // Generate time slots from 9 AM to 5 PM
  const generateTimeSlots = (): string[] => {
    const slots: string[] = [];
    for (let hour = 9; hour <= 17; hour++) {
      for (let minute = 0; minute < 60; minute += 30) {
        const time = `${hour.toString().padStart(2, "0")}:${minute
          .toString()
          .padStart(2, "0")}`;
        slots.push(time);
      }
    }
    return slots;
  };

  const timeSlots = generateTimeSlots();

  const handleInputChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ): void => {
    const { name, value } = e.target;
    setBooking((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name as keyof ValidationErrors]) {
      setErrors((prev) => ({
        ...prev,
        [name]: "",
      }));
    }
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    if (!booking.service_id) {
      newErrors.service_id = "Please select a service";
    }

    if (!booking.booking_date) {
      newErrors.booking_date = "Please select a date";
    } else {
      const selectedDate = new Date(booking.booking_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      if (selectedDate < today) {
        newErrors.booking_date = "Please select a future date";
      }
    }

    if (!booking.booking_time) {
      newErrors.booking_time = "Please select a time";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (
    e: React.MouseEvent<HTMLButtonElement>
  ): Promise<void> => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    setApiError("");

    try {
      const payload: BookingPayload = {
        ...booking,
        service_id: parseInt(booking.service_id, 10),
      };

      const token = getAuthToken();
      const response = await fetch(`${API_BASE_URL}/bookings`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
          ...(token && { Authorization: `Bearer ${token}` }),
        },
        body: JSON.stringify(payload),
      });

      const data: ApiError = await response.json();

      if (response.ok) {
        setIsSuccess(true);
        setTimeout(() => {
          setIsSuccess(false);
          setBooking({
            service_id: "",
            booking_date: "",
            booking_time: "",
            notes: "",
          });
        }, 4000);
      } else {
        // Handle Laravel validation errors
        if (data.errors) {
          const formattedErrors: ValidationErrors = {};
          Object.entries(data.errors).forEach(([key, messages]) => {
            formattedErrors[key as keyof ValidationErrors] = messages[0];
          });
          setErrors(formattedErrors);
        }
        setApiError(
          data.message || "Failed to create booking. Please try again."
        );
      }
    } catch (error) {
      console.error("Booking error:", error);
      setApiError("Network error. Please check your connection and try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const selectedService: Service | undefined = services.find(
    (s) => s.id === parseInt(booking.service_id, 10)
  );
  const today: string = new Date().toISOString().split("T")[0];

  // Loading state
  if (loading) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center justify-center">
          <Loader className="w-6 h-6 animate-spin text-blue-600 mr-2" />
          <span className="text-gray-600">Loading services...</span>
        </div>
      </div>
    );
  }

  // Success state
  if (isSuccess) {
    return (
      <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="text-center">
          <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
            <CheckCircle className="w-6 h-6 text-green-600" />
          </div>
          <h2 className="text-xl font-bold text-gray-900 mb-2">
            Booking Confirmed!
          </h2>
          <p className="text-gray-600 text-sm mb-3">
            Your appointment has been successfully scheduled.
          </p>
          <div className="bg-green-50 rounded-lg p-3 text-left">
            <p className="text-sm text-green-800">
              <strong>Service:</strong> {selectedService?.name}
              <br />
              <strong>Date:</strong>{" "}
              {new Date(booking.booking_date).toLocaleDateString()}
              <br />
              <strong>Time:</strong> {booking.booking_time}
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-6 py-4">
        <h2 className="text-xl font-bold text-white">Book Appointment</h2>
        <p className="text-blue-100 text-sm">Select service and time</p>
      </div>

      <div className="p-6 space-y-4">
        {/* API Error Display */}
        {apiError && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
            <AlertCircle className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0" />
            <p className="text-red-800 text-sm">{apiError}</p>
          </div>
        )}

        {/* Service and Date Row */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Service Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <User className="w-4 h-4 mr-1 text-gray-500" />
              Service
            </label>
            <select
              name="service_id"
              value={booking.service_id}
              onChange={handleInputChange}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.service_id
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-gray-50"
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
            {errors.service_id && (
              <p className="mt-1 text-xs text-red-600">{errors.service_id}</p>
            )}
          </div>

          {/* Date Selection */}
          <div>
            <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
              <Calendar className="w-4 h-4 mr-1 text-gray-500" />
              Date
            </label>
            <input
              type="date"
              name="booking_date"
              value={booking.booking_date}
              onChange={handleInputChange}
              min={today}
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
                errors.booking_date
                  ? "border-red-300 bg-red-50"
                  : "border-gray-300 bg-gray-50"
              }`}
            />
            {errors.booking_date && (
              <p className="mt-1 text-xs text-red-600">{errors.booking_date}</p>
            )}
          </div>
        </div>

        {/* Time Selection */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <Clock className="w-4 h-4 mr-1 text-gray-500" />
            Time
          </label>
          <select
            name="booking_time"
            value={booking.booking_time}
            onChange={handleInputChange}
            className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
              errors.booking_time
                ? "border-red-300 bg-red-50"
                : "border-gray-300 bg-gray-50"
            }`}
          >
            <option value="">Choose time...</option>
            {timeSlots.map((time: string) => (
              <option key={time} value={time}>
                {time}
              </option>
            ))}
          </select>
          {errors.booking_time && (
            <p className="mt-1 text-xs text-red-600">{errors.booking_time}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
            <FileText className="w-4 h-4 mr-1 text-gray-500" />
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

        {/* Booking Summary - Compact */}
        {selectedService && booking.booking_date && booking.booking_time && (
          <div className="bg-blue-50 rounded-lg p-3 border border-blue-200">
            <h3 className="font-semibold text-blue-900 text-sm mb-1">
              Summary
            </h3>
            <div className="text-xs text-blue-800 space-y-0.5">
              <p>
                {selectedService.name} •{" "}
                {new Date(booking.booking_date).toLocaleDateString()} •{" "}
                {booking.booking_time}
              </p>
              {selectedService.price && (
                <p className="font-medium">Price: ${selectedService.price}</p>
              )}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <button
          onClick={handleSubmit}
          disabled={isSubmitting}
          className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white py-2.5 px-6 rounded-lg font-semibold text-sm hover:from-blue-700 hover:to-purple-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <span className="flex items-center justify-center">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
              Processing...
            </span>
          ) : (
            "Book Appointment"
          )}
        </button>
      </div>
    </div>
  );
};

export default BookingComponent;
