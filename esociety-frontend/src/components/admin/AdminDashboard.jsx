import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [stats, setStats] = useState({
        totalBuildings: 0,
        totalFlats: 0,
        totalResidents: 0,
        totalComplaints: 0,
        openComplaints: 0,
        unpaidBills: 0,
        monthlyIncome: 0,
        monthlyExpense: 0,
        monthlyProfitOrLoss: 0
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

    let financeCards = [
        { label: "Income This Month", value: `₹${stats.monthlyIncome.toLocaleString()}`, icon: "bi-graph-up-arrow", color: "#e6f4ea", textColor: "#198754" },
        { label: "Expense This Month", value: `₹${stats.monthlyExpense.toLocaleString()}`, icon: "bi-graph-down-arrow", color: "#fce8e6", textColor: "#dc3545" },
        {
            label: stats.monthlyProfitOrLoss >= 0 ? "Profit This Month" : "Loss This Month",
            value: `₹${Math.abs(stats.monthlyProfitOrLoss).toLocaleString()}`,
            icon: "bi-piggy-bank",
            color: stats.monthlyProfitOrLoss >= 0 ? "#e6f4ea" : "#fce8e6",
            textColor: stats.monthlyProfitOrLoss >= 0 ? "#198754" : "#dc3545"
        },
    ]

    return (
        <div>
            <h5 className="fw-bold mb-4">Dashboard</h5>
            <div className="row g-3 mb-2">
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

            <div className="d-flex justify-content-between align-items-center mt-4 mb-3">
                <p className="fw-bold mb-0 small text-secondary">FINANCE OVERVIEW</p>
                <Link to="/admin/finance" className="small text-decoration-none" style={{ color: "#272757" }}>
                    View full report <i className="bi bi-arrow-right"></i>
                </Link>
            </div>
            <div className="row g-3">
                {financeCards.map((card, index) => {
                    return (
                        <div className="col-12 col-md-6 col-lg-4" key={index}>
                            <div className="card border-0 shadow-sm rounded-4 p-3">
                                <div className="d-flex align-items-center gap-3">
                                    <div className="rounded-3 p-3" style={{ background: card.color }}>
                                        <i className={`bi ${card.icon} fs-3`} style={{ color: card.textColor }}></i>
                                    </div>
                                    <div>
                                        <p className="mb-0 text-secondary small">{card.label}</p>
                                        <h3 className="fw-bold mb-0" style={{ color: card.textColor }}>{card.value}</h3>
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