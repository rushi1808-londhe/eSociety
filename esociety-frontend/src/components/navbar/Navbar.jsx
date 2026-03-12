import React from 'react'
import { NavLink, useNavigate } from 'react-router-dom'

const superAdminLinks = [
  { path: "/superadmin/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { path: "/superadmin/societies", label: "Societies", icon: "bi-buildings" },
  { path: "/superadmin/admins", label: "Admins", icon: "bi-person-gear" },
];

const adminLinks = [
    { path: "/admin/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
    { path: "/admin/buildings", label: "Buildings", icon: "bi-building" },
    { path: "/admin/flats", label: "Flats", icon: "bi-door-open" },
    { path: "/admin/residents", label: "Residents", icon: "bi-people" },
    { path: "/admin/maintenance", label: "Rates", icon: "bi-cash-stack" },
    { path: "/admin/bills", label: "Bills", icon: "bi-receipt" },
    { path: "/admin/complaints", label: "Complaints", icon: "bi-exclamation-circle" },
    { path: "/admin/notices", label: "Notices", icon: "bi-megaphone" },
];

const residentLinks = [
  { path: "/resident/dashboard", label: "Dashboard", icon: "bi-speedometer2" },
  { path: "/resident/bills", label: "My Bills", icon: "bi-receipt" },
  { path: "/resident/payments", label: "Payments", icon: "bi-credit-card" },
  { path: "/resident/complaints", label: "Complaints", icon: "bi-exclamation-circle" },
  { path: "/resident/notices", label: "Notices", icon: "bi-megaphone" },
];

export default function Navbar({ user, collapsed, setCollapsed, mobileOpen, setMobileOpen }) {

  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    navigate("/login");
  };

  const getLinks = () => {
    if (user?.role === "SUPER_ADMIN") return superAdminLinks;
    if (user?.role === "ADMIN") return adminLinks;
    if (user?.role === "RESIDENT") return residentLinks;
    return [];
  };

  return (
    <>
      {/* ===== SIDEBAR ===== */}
      <div className={`sidebar ${collapsed ? "collapsed" : ""} ${mobileOpen ? "mobile-open" : ""}`}>

        {/* ===== TOP BAR — Toggle + Brand ===== */}
        <div
          className="d-flex align-items-center px-3 py-3"
          style={{ borderBottom: "1px solid #505081", minHeight: "60px" }}
        >
          {/* Toggle — desktop only, always visible */}
          <button
            className="btn btn-sm p-0 me-3 d-none d-md-block"
            style={{ color: "#8686AC", background: "transparent", border: "none" }}
            onClick={() => setCollapsed(!collapsed)}
          >
            <i className="bi bi-list fs-4"></i>
          </button>

          {/* Brand — hidden when collapsed */}
          {!collapsed && (
            <div className="d-flex align-items-center gap-2">
              <i className="bi bi-buildings-fill fs-5" style={{ color: "#8686AC" }}></i>
              <span className="text-white fw-bold">eSociety</span>
            </div>
          )}

          {/* Mobile close button */}
          <button
            className="btn btn-sm p-0 d-md-none ms-auto"
            style={{ color: "#8686AC", background: "transparent", border: "none" }}
            onClick={() => setMobileOpen(false)}
          >
            <i className="bi bi-x-lg fs-5"></i>
          </button>
        </div>

        {/* ===== NAV LINKS ===== */}
        <div className="flex-grow-1 py-2">
          {getLinks().map((link) => (
            <NavLink
              key={link.path}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              className={({ isActive }) =>
                `sidebar-link d-flex align-items-center gap-3 px-3 py-2 my-1 text-decoration-none ${isActive ? "active" : ""}`
              }
              style={{ justifyContent: collapsed ? "center" : "flex-start" }}
            >
              <i
                className={`bi ${link.icon} fs-5`}
                style={{ color: "#8686AC", minWidth: "20px", textAlign: "center" }}
              ></i>
              {!collapsed && (
                <span className="small text-white">{link.label}</span>
              )}
            </NavLink>
          ))}
        </div>

        {/* ===== USER + LOGOUT ===== */}
        <div className="px-3 py-3" style={{ borderTop: "1px solid #505081" }}>

          {/* User Info */}
          <div className={`d-flex align-items-center mb-3 ${collapsed ? "justify-content-center" : "gap-2"}`}>
            <i className="bi bi-person-circle fs-5" style={{ color: "#8686AC" }}></i>
            {!collapsed && (
              <div>
                <p className="mb-0 text-white small fw-semibold">{user?.name}</p>
                <p className="mb-0" style={{ color: "#8686AC", fontSize: "11px" }}>{user?.role}</p>
              </div>
            )}
          </div>

          {/* Logout — full button when expanded, icon only when collapsed */}
          {!collapsed ? (
            <button
              className="btn btn-sm w-100 text-white"
              style={{ background: "#0F0E47", border: "1px solid #505081" }}
              onClick={handleLogout}
            >
              <i className="bi bi-box-arrow-right me-2"></i>
              Logout
            </button>
          ) : (
            <div className="text-center">
              <i
                className="bi bi-box-arrow-right fs-5"
                style={{ color: "#8686AC", cursor: "pointer" }}
                onClick={handleLogout}
              ></i>
            </div>
          )}

        </div>
      </div>

      {/* ===== MOBILE OVERLAY ===== */}
      {mobileOpen && (
        <div
          className="position-fixed top-0 start-0 w-100 h-100 bg-dark bg-opacity-50"
          style={{ zIndex: 999 }}
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* ===== MOBILE TOP BAR ===== */}
      <div
        className="d-flex d-md-none align-items-center px-3 py-2 position-fixed w-100"
        style={{ background: "#272757", minHeight: "60px", zIndex: 998, top: 0 }}
      >
        <button
          className="btn btn-sm p-0 me-3"
          style={{ color: "#8686AC", background: "transparent", border: "none" }}
          onClick={() => setMobileOpen(true)}
        >
          <i className="bi bi-list fs-4"></i>
        </button>
        <i className="bi bi-buildings-fill me-2" style={{ color: "#8686AC" }}></i>
        <span className="text-white fw-bold small">eSociety</span>
      </div>

    </>
  )
}