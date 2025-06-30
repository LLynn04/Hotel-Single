// import React from "react";
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

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Homepage />} />
            <Route path="/rooms" element={<RoomFilter />} />
          </Route>

          <Route path="sign-in" element={<SignIn />} />
          <Route path="sign-up" element={<SignUp />} />
          <Route path="/verify-notice" element={<VerifyNotice />} />
          <Route path="/resend-verification" element={<ResendVerification />} />

          <Route path="admin" element={<DashboardView />}>
            <Route path="add-room" element={<AddRoom />} />
            <Route path="add-service" element={<AddService />} />
            {/* Add more admin routes as needed */}
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
