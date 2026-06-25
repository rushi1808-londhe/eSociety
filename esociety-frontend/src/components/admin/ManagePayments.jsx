import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export default function ManagePayments() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [payments, setPayments] = useState([])
    let [filterStatus, setFilterStatus] = useState("")
    let [downloadingId, setDownloadingId] = useState(null)

    let filteredPayments = payments.filter(p => filterStatus === "" || p.status === filterStatus)

    async function fetchPayments() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/payment/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setPayments(responseData.data)
    }

    useEffect(() => { fetchPayments() }, [])

    async function downloadReceipt(paymentId) {
        setDownloadingId(paymentId)
        try {
            let response = await fetch(
                `http://localhost:8080/api/v1/admin/payment/${user.societyId}/receipt/${paymentId}`,
                { headers: { Authorization: `Bearer ${token}` } }
            )
            if (!response.ok) {
                toast.error("Could not generate receipt")
                return
            }
            let blob = await response.blob()
            let url = window.URL.createObjectURL(blob)
            let link = document.createElement("a")
            link.href = url
            link.download = `receipt-${paymentId}.pdf`
            document.body.appendChild(link)
            link.click()
            link.remove()
            window.URL.revokeObjectURL(url)
        } catch (err) {
            toast.error("Something went wrong while downloading the receipt")
        } finally {
            setDownloadingId(null)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Payments</h5>
                </div>
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-3">
                        <select className="form-select form-select-sm rounded-3"
                            value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value) }}>
                            <option value="">All Status</option>
                            <option value="SUCCESS">Success</option>
                            <option value="PENDING">Pending</option>
                            <option value="FAILED">Failed</option>
                        </select>
                    </div>
                    <div className="col-auto">
                        <span className="small text-secondary">Showing {filteredPayments.length} of {payments.length}</span>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover table-borderless mb-0">
                        <thead style={{ background: "#f0f4ff" }}>
                            <tr>
                                <th className="py-3 ps-4 small">#</th>
                                <th className="py-3 small">Resident</th>
                                <th className="py-3 small">Flat</th>
                                <th className="py-3 small">Amount Paid</th>
                                <th className="py-3 small">Payment Date</th>
                                <th className="py-3 small">Status</th>
                                <th className="py-3 small">Receipt</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {filteredPayments.length === 0 ?
                                <tr><td colSpan="7" className="text-center text-secondary py-4 small">No payments found</td></tr>
                                :
                                filteredPayments.map((p, index) => {
                                    return (
                                        <tr key={p.paymentId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{p.residentName || "—"}</td>
                                            <td className="small">{p.flatNumber || "—"}</td>
                                            <td className="small fw-semibold">₹{p.amountPaid}</td>
                                            <td className="small">{p.paymentDate}</td>
                                            <td>
                                                <span className={`badge ${p.status === "SUCCESS" ? "bg-success" : p.status === "FAILED" ? "bg-danger" : "bg-warning text-dark"}`}>
                                                    {p.status}
                                                </span>
                                            </td>
                                            <td>
                                                {p.status === "SUCCESS" && (
                                                    <button
                                                        className="btn btn-sm btn-outline-primary"
                                                        disabled={downloadingId === p.paymentId}
                                                        onClick={() => downloadReceipt(p.paymentId)}
                                                    >
                                                        {downloadingId === p.paymentId ? (
                                                            <span className="spinner-border spinner-border-sm" />
                                                        ) : (
                                                            <><i className="bi bi-download me-1"></i>PDF</>
                                                        )}
                                                    </button>
                                                )}
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
