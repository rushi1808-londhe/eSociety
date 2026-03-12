import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

export default function Login() {

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch("http://localhost:8080/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const result = await response.json();

      if (response.ok) {
        const { token, ...userData } = result.data;
        localStorage.setItem("token", token);
        localStorage.setItem("user", JSON.stringify(userData));
        toast.success("Login successful!");

        if (userData.role === "SUPER_ADMIN") navigate("/superadmin/dashboard");
        else if (userData.role === "ADMIN") navigate("/admin/dashboard");
        else if (userData.role === "RESIDENT") navigate("/resident/dashboard");
      } else {
        toast.error(result.message || "Login failed");
      }
    } catch (err) {
      toast.error("Unable to connect to server");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-wrapper d-flex align-items-center justify-content-center">
      <div className="col-11 col-sm-7 col-md-5 col-lg-3">

        {/* Card */}
        <div className="card border-0 shadow rounded-4 overflow-hidden">

          {/* Header */}
          <div className="text-center py-4 px-3" style={{ background: "#1e293b" }}>
            <i className="bi bi-buildings-fill fs-1 text-primary"></i>
            <h5 className="text-white fw-bold mt-2 mb-0">eSociety</h5>
            <p className="mb-0 small" style={{ color: "#94a3b8" }}>
              Society Management Portal
            </p>
          </div>

          {/* Body */}
          <div className="card-body px-4 py-4">
            <p className="text-center text-secondary small fw-semibold mb-4">
              Sign in to your account
            </p>

            <form onSubmit={handleLogin}>

              {/* Email */}
              <div className="mb-3">
                <label className="form-label small fw-medium">
                  <i className="bi bi-envelope me-1"></i>Email
                </label>
                <input
                  type="email"
                  className="form-control form-control-sm rounded-3"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              {/* Password */}
              <div className="mb-4">
                <label className="form-label small fw-medium">
                  <i className="bi bi-lock me-1"></i>Password
                </label>
                <div className="input-group input-group-sm">
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control rounded-start-3"
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                  />
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    <i className={`bi ${showPassword ? "bi-eye-slash" : "bi-eye"}`}></i>
                  </button>
                </div>
              </div>

              {/* Submit */}
              <div className="d-grid">
                <button
                  type="submit"
                  className="btn btn-primary rounded-3"
                  disabled={loading}
                >
                  {loading ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      <i className="bi bi-box-arrow-in-right me-2"></i>
                      Sign In
                    </>
                  )}
                </button>
              </div>

            </form>
          </div>

          {/* Footer */}
          <div className="text-center pb-3">
            <small className="text-muted">© 2025 eSociety. All rights reserved.</small>
          </div>

        </div>
      </div>
    </div>
  )
}