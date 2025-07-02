// App.tsx

import { BrowserRouter, Route, Routes } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";
import Homepage from "./Pages/Homepage";
import SignIn from "./Pages/Auth/SignIn";
import SignUp from "./Pages/Auth/SignUp";
import RoomFilter from "./components/RoomFilter";
import DashboardView from "./Pages/Admin/DashboardView";
import AddRoom from "./Pages/Admin/pages/AddRoom";
import AddService from "./Pages/Admin/pages/AddService";
import VerifyNotice from "./Pages/Auth/VerifyNotice";
import ResendVerification from "./Pages/Auth/ResendVerify";
import ProtectedRoute from "./components/Auth/ProtectedRoute";
// import BookingComponent from "./components/Booking";
import BookingComponent from "./Pages/Booking/Booking";
// import ConfirmBooking from "./Pages/Booking/ConfirmBooking";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Homepage />} />
            <Route path="/rooms" element={<RoomFilter />} />
            <Route path="/booking" element={<BookingComponent />} />
            {/* <Route
              path="/booking/confirm-booking"
              element={
                <ConfirmBooking
                  initialBooking={{
                    service_id: "",
                    booking_date: "",
                    booking_time: "",
                    notes: "",
                  }}
                  initialService={{
                    id: 0,
                    name: "",
                    description: "",
                    duration: "",
                    price: 0,
                    created_at: "",
                    updated_at: "",
                  }}
                />
              }
            /> */}
          </Route>

          <Route path="/sign-in" element={<SignIn />} />
          <Route path="/sign-up" element={<SignUp />} />
          <Route path="/verify-notice" element={<VerifyNotice />} />
          <Route path="/resend-verification" element={<ResendVerification />} />

          {/* 🔒 Protected Admin Section */}
          <Route
            path="/admin"
            element={
              <ProtectedRoute allowedRoles={["admin"]}>
                <DashboardView />
              </ProtectedRoute>
            }
          >
            <Route path="add-room" element={<AddRoom />} />
            <Route path="add-service" element={<AddService />} />
            {/* More admin routes */}
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
