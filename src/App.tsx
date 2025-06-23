// import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";
import Homepage from "./Pages/Homepage";
import SignIn from "./Pages/Auth/SignIn";
import SignUp from "./Pages/Auth/SignUp";
import RoomFilter from "./components/RoomFilter";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Homepage />} />
            <Route path="/rooms" element={<RoomFilter />} />
          </Route>

          <Route path="sign-in" element={<SignIn />}/>
          <Route path="sign-up" element={<SignUp />}/>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
