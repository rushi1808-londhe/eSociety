import React, { useState, useEffect } from 'react'

export default function ResidentDashboard() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [stats, setStats] = useState({})
    let [notices, setNotices] = useState([])

    async function fetchStats() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/resident/dashboard/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setStats(responseData.data)
    }

    async function fetchNotices() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/resident/notices/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setNotices(responseData.data)
    }

    useEffect(() => {
        fetchStats()
        fetchNotices()
    }, [])

    let cards = [
        { label: "Flat Number", value: stats.flatNumber || "-", icon: "bi-door-open", color: "#e8f0fe" },
        { label: "Flat Type", value: stats.flatType || "-", icon: "bi-house", color: "#e6f4ea" },
        { label: "Move In Date", value: stats.moveInDate || "-", icon: "bi-calendar", color: "#fce8e6" },
        { label: "Total Bills", value: stats.totalBills || 0, icon: "bi-receipt", color: "#fef7e0" },
        { label: "Paid Bills", value: stats.paidBills || 0, icon: "bi-check-circle", color: "#e6f4ea" },
        { label: "Unpaid Bills", value: stats.unpaidBills || 0, icon: "bi-exclamation-circle", color: "#fce8e6" },
    ]

    return (
        <div>
            <h5 className="fw-bold mb-4">My Dashboard</h5>

            {/* Welcome Card */}
            <div className="card border-0 shadow-sm rounded-4 p-3 mb-4" style={{ background: "#272757" }}>
                <div className="d-flex align-items-center gap-3">
                    <i className="bi bi-person-circle fs-1 text-white"></i>
                    <div>
                        <h6 className="text-white fw-bold mb-0">{user.name}</h6>
                        <p className="mb-0 small" style={{ color: "#8686AC" }}>{user.email}</p>
                        <p className="mb-0 small" style={{ color: "#8686AC" }}>Phone: {stats.phone || "-"}</p>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="row g-3">
                {cards.map((card, index) => {
                    return (
                        <div className="col-12 col-md-6 col-lg-4" key={index}>
                            <div className="card border-0 shadow-sm rounded-4 p-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-3 p-3" style={{ background: card.color }}>
                                        <i className={`bi ${card.icon} fs-3`} style={{ color: "#272757" }}></i>
                                    </div>
                                    <div>
                                        <p className="mb-0 text-secondary small">{card.label}</p>
                                        <h5 className="fw-bold mb-0" style={{ color: "#272757" }}>{card.value}</h5>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>

            {/* Notices Section */}
            <div className="mt-4">
                <h6 className="fw-bold mb-3">
                    <i className="bi bi-megaphone me-2" style={{ color: "#272757" }}></i>
                    Latest Notices
                </h6>
                {notices.length === 0 ?
                    <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-secondary small">
                        No notices posted yet
                    </div>
                    :
                    <div className="row g-3">
                        {notices.slice(0, 4).map((n) => {
                            return (
                                <div className="col-12" key={n.noticeId}>
                                    <div className="card border-0 shadow-sm rounded-4 p-3">
                                        <div className="d-flex align-items-start gap-3">
                                            <div className="rounded-3 p-2 flex-shrink-0" style={{ background: "#f0f4ff" }}>
                                                <i className="bi bi-megaphone fs-5" style={{ color: "#272757" }}></i>
                                            </div>
                                            <div>
                                                <h6 className="fw-semibold mb-1 small">{n.title}</h6>
                                                <p className="small text-secondary mb-1">{n.description}</p>
                                                <p className="small text-muted mb-0">
                                                    <i className="bi bi-calendar me-1"></i>{n.postedAt}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                }
            </div>
        </div>
    )
}