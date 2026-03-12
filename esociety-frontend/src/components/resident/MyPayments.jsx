import React, { useState, useEffect } from 'react'

export default function MyPayments() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [payments, setPayments] = useState([])

    async function fetchPayments() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/resident/payments/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setPayments(responseData.data)
    }

    useEffect(() => {
        fetchPayments()
    }, [])

    return (
        <div>
            <h5 className="fw-bold mb-4">My Payments</h5>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover table-borderless mb-0">
                        <thead style={{ background: "#f0f4ff" }}>
                            <tr>
                                <th className="py-3 ps-4 small">#</th>
                                <th className="py-3 small">Bill ID</th>
                                <th className="py-3 small">Amount Paid</th>
                                <th className="py-3 small">Payment Date</th>
                                <th className="py-3 small">Status</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {payments.length === 0 ?
                                <tr><td colSpan="5" className="text-center text-secondary py-4 small">No payments found</td></tr>
                                :
                                payments.map((p, index) => {
                                    return (
                                        <tr key={p.paymentId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small">{p.billId}</td>
                                            <td className="small fw-semibold">₹{p.amountPaid}</td>
                                            <td className="small">{p.paymentDate}</td>
                                            <td>
                                                <span className={`badge ${p.status === "SUCCESS" ? "bg-success" : p.status === "FAILED" ? "bg-danger" : "bg-warning text-dark"}`}>
                                                    {p.status}
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
        </div>
    )
}