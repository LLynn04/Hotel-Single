// "use client";

// import type React from "react";
// import { useState, useEffect } from "react";

// // Type definitions
// interface Service {
//   id: number;
//   name: string;
//   description?: string;
//   duration?: string;
//   price?: number;
//   created_at?: string;
//   updated_at?: string;
// }

// interface BookingData {
//   service_id: string;
//   booking_date: string;
//   booking_time: string;
//   notes: string;
// }

// interface BookingPayload {
//   service_id: number;
//   booking_date: string;
//   booking_time: string;
//   notes: string;
// }

// interface ValidationErrors {
//   service_id?: string;
//   booking_date?: string;
//   booking_time?: string;
//   notes?: string;
// }

// interface ApiError {
//   message?: string;
//   errors?: Record<string, string[]>;
// }

// interface ConfirmBookingProps {
//   initialBooking: BookingData;
//   initialService: Service;
//   onBack?: () => void;
//   onBookingSuccess?: () => void;
// }

// const ConfirmBooking: React.FC<ConfirmBookingProps> = ({
//   initialBooking,
//   initialService,
//   onBack,
//   onBookingSuccess,
// }) => {
//   const [booking, setBooking] = useState<BookingData>(initialBooking);
//   const [services, setServices] = useState<Service[]>([initialService]);
//   const [selectedService, setSelectedService] =
//     useState<Service>(initialService);
//   const [isEditing, setIsEditing] = useState<boolean>(false);
//   const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
//   const [isSuccess, setIsSuccess] = useState<boolean>(false);
//   const [errors, setErrors] = useState<ValidationErrors>({});
//   const [apiError, setApiError] = useState<string>("");
//   const [servicesLoaded, setServicesLoaded] = useState<boolean>(false);

//   // Environment variables with fallback
//   const API_BASE_URL = "http://127.0.0.1:8000/api";

//   // Enhanced auth token getter - checks multiple possible keys
//   const getAuthToken = () => {
//     const possibleKeys = [
//       "auth_token",
//       "token",
//       "access_token",
//       "authToken",
//       "bearer_token",
//       "sanctum_token",
//       "laravel_token",
//     ];

//     console.log("🔍 Checking localStorage for auth tokens...");
//     console.log("Available localStorage keys:", Object.keys(localStorage));

//     for (const key of possibleKeys) {
//       const token = localStorage.getItem(key);
//       if (token) {
//         console.log(`✅ Found token with key: ${key}`);
//         console.log(`Token preview: ${token.substring(0, 20)}...`);
//         return token;
//       }
//     }

//     console.log("❌ No auth token found in localStorage");
//     return "";
//   };

//   // Debug function to show all localStorage contents
//   const debugLocalStorage = () => {
//     console.log("🔍 Full localStorage contents:");
//     for (let i = 0; i < localStorage.length; i++) {
//       const key = localStorage.key(i);
//       if (key) {
//         const value = localStorage.getItem(key);
//         console.log(`${key}:`, value?.substring(0, 50) + "...");
//       }
//     }
//   };

//   // Fetch all services when editing
//   useEffect(() => {
//     if (isEditing && !servicesLoaded) {
//       const fetchServices = async (): Promise<void> => {
//         try {
//           const token = getAuthToken(); // instead of localStorage.getItem("token")

//           const response = await fetch(`${API_BASE_URL}/services`, {
//             method: "GET",
//             headers: {
//               "Content-Type": "application/json",
//               Accept: "application/json",
//               ...(token && { Authorization: `Bearer ${token}` }),
//             },
//           });

//           if (!response.ok) {
//             throw new Error(`HTTP error! status: ${response.status}`);
//           }

//           const result = await response.json();
//           setServices(result.data || [initialService]);
//           setServicesLoaded(true);
//         } catch (error) {
//           console.error("Error fetching services:", error);
//           setApiError("Failed to load services for editing.");
//         }
//       };

//       fetchServices();
//     }
//   }, [isEditing, servicesLoaded, API_BASE_URL, initialService]);

//   // Update selected service when booking changes
//   useEffect(() => {
//     const service = services.find(
//       (s) => s.id === Number.parseInt(booking.service_id, 10)
//     );
//     if (service) {
//       setSelectedService(service);
//     }
//   }, [booking.service_id, services]);

//   // Generate time slots from 9 AM to 5 PM
//   const generateTimeSlots = (): string[] => {
//     const slots: string[] = [];
//     for (let hour = 9; hour <= 17; hour++) {
//       for (let minute = 0; minute < 60; minute += 30) {
//         const time = `${hour.toString().padStart(2, "0")}:${minute
//           .toString()
//           .padStart(2, "0")}`;
//         slots.push(time);
//       }
//     }
//     return slots;
//   };

//   const timeSlots = generateTimeSlots();

//   const handleInputChange = (
//     e: React.ChangeEvent<
//       HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
//     >
//   ): void => {
//     const { name, value } = e.target;
//     setBooking((prev) => ({
//       ...prev,
//       [name]: value,
//     }));

//     // Clear error when user starts typing
//     if (errors[name as keyof ValidationErrors]) {
//       setErrors((prev) => ({
//         ...prev,
//         [name]: "",
//       }));
//     }
//   };

//   const validateForm = (): boolean => {
//     const newErrors: ValidationErrors = {};

//     if (!booking.service_id) {
//       newErrors.service_id = "Please select a service";
//     }

//     if (!booking.booking_date) {
//       newErrors.booking_date = "Please select a date";
//     } else {
//       const selectedDate = new Date(booking.booking_date);
//       const today = new Date();
//       today.setHours(0, 0, 0, 0);
//       if (selectedDate < today) {
//         newErrors.booking_date = "Please select a future date";
//       }
//     }

//     if (!booking.booking_time) {
//       newErrors.booking_time = "Please select a time";
//     }

//     setErrors(newErrors);
//     return Object.keys(newErrors).length === 0;
//   };

//   const handleEdit = () => {
//     setIsEditing(true);
//     setApiError("");
//   };

//   const handleCancelEdit = () => {
//     setBooking(initialBooking);
//     setSelectedService(initialService);
//     setIsEditing(false);
//     setErrors({});
//     setApiError("");
//   };

//   const handleSaveEdit = () => {
//     if (validateForm()) {
//       setIsEditing(false);
//       setApiError("");
//     }
//   };

//   // Manual token setter for testing
//   const handleSetTestToken = () => {
//     const testToken = prompt("Enter your auth token for testing:");
//     if (testToken) {
//       localStorage.setItem("auth_token", testToken);
//       console.log("✅ Test token saved to localStorage");
//       setApiError(""); // Clear any auth errors
//     }
//   };

//   const handleConfirmBooking = async (): Promise<void> => {
//     if (!validateForm()) {
//       return;
//     }

//     // Debug localStorage before making the request
//     debugLocalStorage();

//     const token = getAuthToken();

//     // Check if we have a token before proceeding
//     if (!token) {
//       console.log("❌ No authentication token found");
//       setApiError(
//         "Authentication required. Please log in first or set a test token."
//       );
//       return;
//     }

//     setIsSubmitting(true);
//     setApiError("");

//     try {
//       const payload: BookingPayload = {
//         ...booking,
//         service_id: Number.parseInt(booking.service_id, 10),
//       };

//       console.log("📤 Sending booking to API:", payload);
//       console.log("🔑 Using token:", `${token.substring(0, 20)}...`);
//       console.log("🌐 API URL:", `${API_BASE_URL}/bookings`);

//       const response = await fetch(`${API_BASE_URL}/bookings`, {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           Accept: "application/json",
//           Authorization: `Bearer ${token}`,
//         },
//         body: JSON.stringify(payload),
//       });

//       console.log("📡 Booking API Response status:", response.status);

//       const data: ApiError = await response.json();
//       console.log("📋 Booking API Response data:", data);

//       if (response.ok) {
//         setIsSuccess(true);
//         if (onBookingSuccess) {
//           setTimeout(() => {
//             onBookingSuccess();
//           }, 3000);
//         }
//       } else {
//         // Handle specific error cases
//         if (response.status === 401) {
//           setApiError(
//             "Authentication failed. Your session may have expired. Please log in again."
//           );
//         } else if (data.errors) {
//           // Handle Laravel validation errors
//           const formattedErrors: ValidationErrors = {};
//           Object.entries(data.errors).forEach(([key, messages]) => {
//             formattedErrors[key as keyof ValidationErrors] = messages[0];
//           });
//           setErrors(formattedErrors);
//           setApiError("Please fix the validation errors above.");
//         } else {
//           setApiError(
//             data.message || "Failed to create booking. Please try again."
//           );
//         }
//       }
//     } catch (error) {
//       console.error("❌ Booking error:", error);
//       setApiError("Network error. Please check your connection and try again.");
//     } finally {
//       setIsSubmitting(false);
//     }
//   };

//   const today: string = new Date().toISOString().split("T")[0];
//   const currentToken = getAuthToken();

//   // Success state
//   if (isSuccess) {
//     return (
//       <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg p-6 border border-gray-200">
//         <div className="text-center">
//           <div className="mx-auto w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mb-3">
//             <span className="text-green-600 text-2xl">✓</span>
//           </div>
//           <h2 className="text-xl font-bold text-gray-900 mb-2">
//             Booking Confirmed!
//           </h2>
//           <p className="text-gray-600 text-sm mb-3">
//             Your appointment has been successfully scheduled.
//           </p>
//           <div className="bg-green-50 rounded-lg p-3 text-left">
//             <p className="text-sm text-green-800">
//               <strong>Service:</strong> {selectedService?.name}
//               <br />
//               <strong>Date:</strong>{" "}
//               {new Date(booking.booking_date).toLocaleDateString()}
//               <br />
//               <strong>Time:</strong> {booking.booking_time}
//             </p>
//           </div>
//         </div>
//       </div>
//     );
//   }

//   return (
//     <div className="max-w-lg mx-auto bg-white rounded-xl shadow-lg border border-gray-200 overflow-hidden">
//       {/* Header */}
//       <div className="bg-gradient-to-r from-green-600 to-blue-600 px-6 py-4">
//         <h2 className="text-xl font-bold text-white">Confirm Booking</h2>
//         <p className="text-green-100 text-sm">
//           Review and confirm your appointment
//         </p>
//       </div>

//       <div className="p-6 space-y-4">
//         {/* Auth Status Display */}
//         <div
//           className={`border rounded-lg p-3 ${
//             currentToken
//               ? "bg-green-50 border-green-200"
//               : "bg-red-50 border-red-200"
//           }`}
//         >
//           <div className="flex items-center justify-between">
//             <div>
//               <div className="font-semibold text-sm">
//                 {currentToken ? "🔐 Authenticated" : "❌ Not Authenticated"}
//               </div>
//               <div className="text-xs text-gray-600">
//                 {currentToken
//                   ? `Token: ${currentToken.substring(0, 20)}...`
//                   : "No auth token found"}
//               </div>
//             </div>
//             {!currentToken && (
//               <button
//                 onClick={handleSetTestToken}
//                 className="bg-blue-500 text-white px-3 py-1 rounded text-xs hover:bg-blue-600"
//               >
//                 Set Token
//               </button>
//             )}
//           </div>
//         </div>

//         {/* API Error Display */}
//         {apiError && (
//           <div className="bg-red-50 border border-red-200 rounded-lg p-3 flex items-start">
//             <div className="w-4 h-4 text-red-600 mr-2 mt-0.5 flex-shrink-0">
//               ⚠
//             </div>
//             <p className="text-red-800 text-sm">{apiError}</p>
//           </div>
//         )}

//         {isEditing ? (
//           // Editing Mode
//           <>
//             {/* Service Selection */}
//             <div>
//               <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
//                 <span className="w-4 h-4 mr-1 text-gray-500">👤</span>
//                 Service
//               </label>
//               <select
//                 name="service_id"
//                 value={booking.service_id}
//                 onChange={handleInputChange}
//                 className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
//                   errors.service_id
//                     ? "border-red-300 bg-red-50"
//                     : "border-gray-300 bg-gray-50"
//                 }`}
//               >
//                 <option value="">Choose service...</option>
//                 {services.map((service: Service) => (
//                   <option key={service.id} value={service.id}>
//                     {service.name}
//                     {service.duration && ` (${service.duration})`}
//                     {service.price && ` - $${service.price}`}
//                   </option>
//                 ))}
//               </select>
//               {errors.service_id && (
//                 <p className="mt-1 text-xs text-red-600">{errors.service_id}</p>
//               )}
//             </div>

//             {/* Date Selection */}
//             <div>
//               <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
//                 <span className="w-4 h-4 mr-1 text-gray-500">📅</span>
//                 Date
//               </label>
//               <input
//                 type="date"
//                 name="booking_date"
//                 value={booking.booking_date}
//                 onChange={handleInputChange}
//                 min={today}
//                 className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
//                   errors.booking_date
//                     ? "border-red-300 bg-red-50"
//                     : "border-gray-300 bg-gray-50"
//                 }`}
//               />
//               {errors.booking_date && (
//                 <p className="mt-1 text-xs text-red-600">
//                   {errors.booking_date}
//                 </p>
//               )}
//             </div>

//             {/* Time Selection */}
//             <div>
//               <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
//                 <span className="w-4 h-4 mr-1 text-gray-500">🕐</span>
//                 Time
//               </label>
//               <select
//                 name="booking_time"
//                 value={booking.booking_time}
//                 onChange={handleInputChange}
//                 className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors ${
//                   errors.booking_time
//                     ? "border-red-300 bg-red-50"
//                     : "border-gray-300 bg-gray-50"
//                 }`}
//               >
//                 <option value="">Choose time...</option>
//                 {timeSlots.map((time: string) => (
//                   <option key={time} value={time}>
//                     {time}
//                   </option>
//                 ))}
//               </select>
//               {errors.booking_time && (
//                 <p className="mt-1 text-xs text-red-600">
//                   {errors.booking_time}
//                 </p>
//               )}
//             </div>

//             {/* Notes */}
//             <div>
//               <label className="flex items-center text-sm font-medium text-gray-700 mb-1">
//                 <span className="w-4 h-4 mr-1 text-gray-500">📝</span>
//                 Notes (Optional)
//               </label>
//               <textarea
//                 name="notes"
//                 value={booking.notes}
//                 onChange={handleInputChange}
//                 placeholder="Special requests..."
//                 rows={2}
//                 className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 bg-gray-50 transition-colors resize-none"
//               />
//             </div>

//             {/* Edit Action Buttons */}
//             <div className="flex space-x-3">
//               <button
//                 onClick={handleCancelEdit}
//                 className="flex-1 bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
//               >
//                 Cancel
//               </button>
//               <button
//                 onClick={handleSaveEdit}
//                 className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               >
//                 Save Changes
//               </button>
//             </div>
//           </>
//         ) : (
//           // Review Mode
//           <>
//             {/* Booking Details */}
//             <div className="bg-gray-50 rounded-lg p-4 space-y-3">
//               <h3 className="font-semibold text-gray-900 text-lg mb-3">
//                 Appointment Details
//               </h3>

//               <div className="grid grid-cols-1 gap-3">
//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Service:</span>
//                   <span className="font-medium text-gray-900">
//                     {selectedService?.name}
//                   </span>
//                 </div>

//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Date:</span>
//                   <span className="font-medium text-gray-900">
//                     {new Date(booking.booking_date).toLocaleDateString()}
//                   </span>
//                 </div>

//                 <div className="flex justify-between items-center">
//                   <span className="text-sm text-gray-600">Time:</span>
//                   <span className="font-medium text-gray-900">
//                     {booking.booking_time}
//                   </span>
//                 </div>

//                 {selectedService?.duration && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">Duration:</span>
//                     <span className="font-medium text-gray-900">
//                       {selectedService.duration}
//                     </span>
//                   </div>
//                 )}

//                 {selectedService?.price && (
//                   <div className="flex justify-between items-center">
//                     <span className="text-sm text-gray-600">Price:</span>
//                     <span className="font-medium text-green-600">
//                       ${selectedService.price}
//                     </span>
//                   </div>
//                 )}

//                 {booking.notes && (
//                   <div className="pt-2 border-t border-gray-200">
//                     <span className="text-sm text-gray-600 block mb-1">
//                       Notes:
//                     </span>
//                     <span className="text-sm text-gray-900">
//                       {booking.notes}
//                     </span>
//                   </div>
//                 )}
//               </div>
//             </div>

//             {/* Action Buttons */}
//             <div className="flex space-x-3">
//               {onBack && (
//                 <button
//                   onClick={onBack}
//                   className="bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium text-sm hover:bg-gray-300 focus:outline-none focus:ring-2 focus:ring-gray-500 transition-colors"
//                 >
//                   ← Back
//                 </button>
//               )}

//               <button
//                 onClick={handleEdit}
//                 className="bg-blue-600 text-white py-2 px-4 rounded-lg font-medium text-sm hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
//               >
//                 Edit Details
//               </button>

//               <button
//                 onClick={handleConfirmBooking}
//                 disabled={isSubmitting || !currentToken}
//                 className="flex-1 bg-gradient-to-r from-green-600 to-blue-600 text-white py-2.5 px-6 rounded-lg font-semibold text-sm hover:from-green-700 hover:to-blue-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
//               >
//                 {isSubmitting ? (
//                   <span className="flex items-center justify-center">
//                     <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
//                     Confirming...
//                   </span>
//                 ) : !currentToken ? (
//                   "Login Required"
//                 ) : (
//                   "Confirm Booking"
//                 )}
//               </button>
//             </div>
//           </>
//         )}
//       </div>
//     </div>
//   );
// };

// export default ConfirmBooking;
