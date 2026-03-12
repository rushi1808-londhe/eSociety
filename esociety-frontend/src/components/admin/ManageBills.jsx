import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export default function ManageBills() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [bills, setBills] = useState([])
    let [month, setMonth] = useState(new Date().getMonth() + 1)
    let [year, setYear] = useState(new Date().getFullYear())
    let [filterStatus, setFilterStatus] = useState("")
    let [sortOrder, setSortOrder] = useState("desc")

    let months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

    let filteredBills = bills
        .filter(b => filterStatus === "" || b.status === filterStatus)
        .sort((a, b) => {
            if (a.billYear !== b.billYear) return sortOrder === "desc" ? b.billYear - a.billYear : a.billYear - b.billYear
            return sortOrder === "desc" ? b.billMonth - a.billMonth : a.billMonth - b.billMonth
        })

    async function fetchBills() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/bill/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setBills(responseData.data)
    }

    useEffect(() => { fetchBills() }, [])

    async function generateBills() {
        let responseObject = await fetch("http://localhost:8080/api/v1/admin/bill/generate", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ societyId: user.societyId, month, year })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchBills()
            document.getElementById("closeGenerateModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Maintenance Bills</h5>
                    <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                        data-bs-toggle="modal" data-bs-target="#generateBillModal">
                        <i className="bi bi-lightning me-1"></i>Generate Bills
                    </button>
                </div>
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-3">
                        <select className="form-select form-select-sm rounded-3"
                            value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value) }}>
                            <option value="">All Status</option>
                            <option value="UNPAID">Unpaid</option>
                            <option value="PAID">Paid</option>
                            <option value="PARTIALLY_PAID">Partially Paid</option>
                        </select>
                    </div>
                    <div className="col-12 col-md-3">
                        <select className="form-select form-select-sm rounded-3"
                            value={sortOrder} onChange={(e) => { setSortOrder(e.target.value) }}>
                            <option value="desc">Newest First</option>
                            <option value="asc">Oldest First</option>
                        </select>
                    </div>
                    <div className="col-auto">
                        <span className="small text-secondary">Showing {filteredBills.length} of {bills.length}</span>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover table-borderless mb-0">
                        <thead style={{ background: "#f0f4ff" }}>
                            <tr>
                                <th className="py-3 ps-4 small">#</th>
                                <th className="py-3 small">Flat</th>
                                <th className="py-3 small">Month/Year</th>
                                <th className="py-3 small">Flat Charge</th>
                                <th className="py-3 small">Parking</th>
                                <th className="py-3 small">Total</th>
                                <th className="py-3 small">Status</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {filteredBills.length === 0 ?
                                <tr><td colSpan="7" className="text-center text-secondary py-4 small">No bills found</td></tr>
                                :
                                filteredBills.map((b, index) => {
                                    return (
                                        <tr key={b.billId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{b.flatNumber}</td>
                                            <td className="small">{months[b.billMonth - 1]} {b.billYear}</td>
                                            <td className="small">₹{b.flatCharge}</td>
                                            <td className="small">₹{b.parkingCharge}</td>
                                            <td className="small fw-semibold">₹{b.totalAmount}</td>
                                            <td>
                                                <span className={`badge ${b.status === "PAID" ? "bg-success" : b.status === "PARTIALLY_PAID" ? "bg-warning text-dark" : "bg-danger"}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Generate Bills Modal */}
            <div className="modal fade" id="generateBillModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Generate Monthly Bills</h6>
                            <button id="closeGenerateModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <div className="mb-3">
                                <label className="form-label small fw-medium">Month</label>
                                <select className="form-select form-select-sm rounded-3"
                                    value={month} onChange={(e) => { setMonth(parseInt(e.target.value)) }}>
                                    {months.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                                </select>
                            </div>
                            <div className="mb-3">
                                <label className="form-label small fw-medium">Year</label>
                                <input type="number" className="form-control form-control-sm rounded-3"
                                    value={year} onChange={(e) => { setYear(parseInt(e.target.value)) }}
                                />
                            </div>
                            <p className="small text-secondary">Bills will be generated for all occupied flats. Already existing bills for the same month/year will be skipped.</p>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-sm text-white" style={{ background: "#272757" }}
                                onClick={() => { generateBills() }}>Generate</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}