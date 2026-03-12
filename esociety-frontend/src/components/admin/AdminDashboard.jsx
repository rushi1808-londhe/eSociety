import React, { useState, useEffect } from 'react'

export default function AdminDashboard() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [stats, setStats] = useState({
        totalBuildings: 0,
        totalFlats: 0,
        totalResidents: 0,
        totalComplaints: 0,
        openComplaints: 0,
        unpaidBills: 0
    })

    async function fetchStats() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/dashboard/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setStats(responseData.data)
    }

    useEffect(() => {
        fetchStats()
    }, [])

    let cards = [
        { label: "Total Buildings", value: stats.totalBuildings, icon: "bi-building", color: "#e8f0fe" },
        { label: "Total Flats", value: stats.totalFlats, icon: "bi-door-open", color: "#e6f4ea" },
        { label: "Total Residents", value: stats.totalResidents, icon: "bi-people", color: "#fce8e6" },
        { label: "Open Complaints", value: stats.openComplaints, icon: "bi-exclamation-circle", color: "#fef7e0" },
        { label: "Total Complaints", value: stats.totalComplaints, icon: "bi-chat-left-text", color: "#f3e8fd" },
        { label: "Unpaid Bills", value: stats.unpaidBills, icon: "bi-receipt", color: "#fce8e6" },
    ]

    return (
        <div>
            <h5 className="fw-bold mb-4">Dashboard</h5>
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
                                        <h3 className="fw-bold mb-0" style={{ color: "#272757" }}>{card.value}</h3>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}