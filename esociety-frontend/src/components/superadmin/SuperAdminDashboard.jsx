import React, { useState, useEffect } from 'react'

export default function SuperAdminDashboard() {
    let token = localStorage.getItem("token")
    let [stats, setStats] = useState({ totalSocieties: 0, totalAdmins: 0 })

    async function fetchStats() {
        let responseObject = await fetch("http://localhost:8080/api/v1/superadmin/dashboard", {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setStats(responseData.data)
    }

    useEffect(() => {
        fetchStats()
    }, [])

    return (
        <div>
            <h5 className="fw-bold mb-4">Dashboard</h5>
            <div className="row g-3">

                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-3 p-3" style={{ background: "#f0f4ff" }}>
                                <i className="bi bi-buildings fs-3" style={{ color: "#272757" }}></i>
                            </div>
                            <div>
                                <p className="mb-0 text-secondary small">Total Societies</p>
                                <h3 className="fw-bold mb-0" style={{ color: "#272757" }}>{stats.totalSocieties}</h3>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-12 col-md-6">
                    <div className="card border-0 shadow-sm rounded-4 p-3">
                        <div className="d-flex align-items-center gap-3">
                            <div className="rounded-3 p-3" style={{ background: "#f0f4ff" }}>
                                <i className="bi bi-person-gear fs-3" style={{ color: "#272757" }}></i>
                            </div>
                            <div>
                                <p className="mb-0 text-secondary small">Total Admins</p>
                                <h3 className="fw-bold mb-0" style={{ color: "#272757" }}>{stats.totalAdmins}</h3>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    )
}