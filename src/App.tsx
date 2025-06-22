// import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import RootLayout from "./components/Layout/RootLayout";
import Homepage from "./Pages/Homepage";

const App = () => {
  return (
    <div>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RootLayout />}>
            <Route index element={<Homepage />} />
          </Route>
        </Routes>
      </BrowserRouter>
    </div>
  );
};

export default App;
