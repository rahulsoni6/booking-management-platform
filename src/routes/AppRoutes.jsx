import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Dashboard from "../pages/Dashboard";
import Login from "../pages/Login";

function AppRoutes() {
  const isAuthenticated = Boolean(localStorage.getItem("token"));

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            isAuthenticated ? <Dashboard /> : <Navigate to="/login" replace />
          }
        />
        <Route path="/login" element={<Login />} />
      </Routes>
    </BrowserRouter>
  );
}

export default AppRoutes;