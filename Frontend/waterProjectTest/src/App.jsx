import { useState } from 'react'


import { BrowserRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import Login from "./pages/Login";
import Register from "./pages/Register";
import SuperAdminDashboard from "./pages/dashboards/SuperAdminDashboard";
import ApartmentAdminDashboard from "./pages/dashboards/ApartmentAdminDashboard";
import ProtectedRoute from "./components/ProtectedRoute";
import RegisterHousehold from "./pages/household-admin/RegisterHousehold";
import HouseholdList from "./pages/household-admin/HouseholdList";
import HouseholdDashboard from "./pages/dashboards/HouseholdDashboard";
import Landing from "./pages/Landing";
import GoogleTranslate from "./components/GoogleTranslate";

function AnimatedRoutes() {
  const location = useLocation();
  return (
    <div key={location.pathname} className="route-transition">
      <Routes location={location}>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />

        <Route path="/dashboard/super-admin" element={
          <ProtectedRoute allowedRole="SUPER_ADMIN"><SuperAdminDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/apartment-admin" element={
          <ProtectedRoute allowedRole="APARTMENT_ADMIN"><ApartmentAdminDashboard /></ProtectedRoute>
        } />
        <Route path="/dashboard/apartment-admin/households/register" element={
          <ProtectedRoute allowedRole="APARTMENT_ADMIN"><RegisterHousehold /></ProtectedRoute>
        } />
        <Route path="/dashboard/apartment-admin/households/list" element={
          <ProtectedRoute allowedRole="APARTMENT_ADMIN"><HouseholdList /></ProtectedRoute>
        } />
        <Route path="/dashboard/household-user" element={
          <ProtectedRoute allowedRole="HOUSEHOLD_USER"><HouseholdDashboard /></ProtectedRoute>
        } />
      </Routes>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <GoogleTranslate />
      <AnimatedRoutes />
    </BrowserRouter>
  );
}