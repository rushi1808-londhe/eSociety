import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import Navbar from './navbar/Navbar'

export default function SuperAdminApp() {
  const user = JSON.parse(localStorage.getItem("user"));
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  if (!user || user.role !== "SUPER_ADMIN") {
    return <Navigate to="/login" replace />;
  }

  return (
    <div>
      <Navbar user={user} collapsed={collapsed} setCollapsed={setCollapsed} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen} />
      <div className={`main-content ${collapsed ? "expanded" : ""}`}>
        <div className="p-4">
          <Outlet />
        </div>
      </div>
    </div>
  )
}