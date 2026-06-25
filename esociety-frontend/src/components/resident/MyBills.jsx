import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export default function MyBills() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [bills, setBills] = useState([])
    let [selectedBill, setSelectedBill] = useState(null)
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
        let responseObject = await fetch(`http://localhost:8080/api/v1/resident/bills/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setBills(responseData.data)
    }

    useEffect(() => {
        fetchBills()
        // Load Razorpay checkout script
        const script = document.createElement("script")
        script.src = "https://checkout.razorpay.com/v1/checkout.js"
        script.async = true
        document.body.appendChild(script)
        return () => { document.body.removeChild(script) }
        // eslint-disable-next-line
    }, [])

    async function initiatePayment() {
        try {
            // Step 1: Create Razorpay order on backend
            let orderResponse = await fetch("http://localhost:8080/api/v1/resident/bills/create-order", {
                method: "POST",
                headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                body: JSON.stringify({ userId: user.userId, billId: selectedBill.billId })
            })
            let orderData = await orderResponse.json()
            if (!orderResponse.ok) {
                toast.error(orderData.message)
                return
            }

            let { razorpayOrderId, amount, keyId } = orderData.data
            document.getElementById("closePayModal").click()

            // Step 2: Open Razorpay checkout popup
            let options = {
                key: keyId,
                amount: amount * 100, // paise
                currency: "INR",
                name: "eSociety",
                description: `Maintenance - ${months[selectedBill.billMonth - 1]} ${selectedBill.billYear}`,
                order_id: razorpayOrderId,
                handler: async function (response) {
                    // Step 3: Verify on backend and mark bill paid
                    let verifyResponse = await fetch("http://localhost:8080/api/v1/resident/bills/verify-payment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
                        body: JSON.stringify({
                            userId: user.userId,
                            billId: selectedBill.billId,
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature
                        })
                    })
                    let verifyData = await verifyResponse.json()
                    if (verifyResponse.ok) {
                        toast.success("Payment successful!")
                        fetchBills()
                    } else {
                        toast.error(verifyData.message || "Payment verification failed")
                    }
                },
                prefill: {
                    name: user.name || "",
                    email: user.email || ""
                },
                theme: { color: "#272757" },
                modal: {
                    ondismiss: function () {
                        toast.info("Payment cancelled")
                    }
                }
            }

            let rzp = new window.Razorpay(options)
            rzp.on("payment.failed", function (response) {
                toast.error("Payment failed: " + response.error.description)
            })
            rzp.open()

        } catch (err) {
            toast.error("Something went wrong. Please try again.")
        }
    }

    return (
        <div>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">My Bills</h5>
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
                                <th className="py-3 small">Month/Year</th>
                                <th className="py-3 small">Flat Charge</th>
                                <th className="py-3 small">Parking</th>
                                <th className="py-3 small">Late Fee</th>
                                <th className="py-3 small">Total</th>
                                <th className="py-3 small">Due Date</th>
                                <th className="py-3 small">Status</th>
                                <th className="py-3 small">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {filteredBills.length === 0 ?
                                <tr><td colSpan="9" className="text-center text-secondary py-4 small">No bills found</td></tr>
                                :
                                filteredBills.map((b, index) => {
                                    let isOverdue = b.status === "UNPAID" && b.dueDate && new Date(b.dueDate) < new Date()
                                    return (
                                        <tr key={b.billId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{months[b.billMonth - 1]} {b.billYear}</td>
                                            <td className="small">₹{b.flatCharge}</td>
                                            <td className="small">₹{b.parkingCharge}</td>
                                            <td className="small">
                                                {b.lateFee > 0 ? <span className="text-danger fw-semibold">₹{b.lateFee}</span> : "—"}
                                            </td>
                                            <td className="small fw-semibold">₹{b.totalAmount}</td>
                                            <td className={`small ${isOverdue ? "text-danger fw-semibold" : ""}`}>{b.dueDate || "—"}</td>
                                            <td>
                                                <span className={`badge ${b.status === "PAID" ? "bg-success" : b.status === "PARTIALLY_PAID" ? "bg-warning text-dark" : "bg-danger"}`}>
                                                    {b.status}
                                                </span>
                                            </td>
                                            <td>
                                                {b.status !== "PAID" &&
                                                    <button className="btn btn-sm text-white"
                                                        style={{ background: "#272757" }}
                                                        data-bs-toggle="modal"
                                                        data-bs-target="#payBillModal"
                                                        onClick={() => { setSelectedBill(b) }}>
                                                        <i className="bi bi-credit-card me-1"></i>Pay
                                                    </button>
                                                }
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Pay Confirm Modal */}
            <div className="modal fade" id="payBillModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Confirm Payment</h6>
                            <button id="closePayModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            {selectedBill &&
                                <div className="card border-0 rounded-4 p-3" style={{ background: "#f0f4ff" }}>
                                    <p className="small mb-1"><strong>Month:</strong> {months[selectedBill.billMonth - 1]} {selectedBill.billYear}</p>
                                    <p className="small mb-1"><strong>Flat Charge:</strong> ₹{selectedBill.flatCharge}</p>
                                    <p className="small mb-1"><strong>Parking Charge:</strong> ₹{selectedBill.parkingCharge}</p>
                                    {selectedBill.lateFee > 0 &&
                                        <p className="small mb-1 text-danger"><strong>Late Fee:</strong> ₹{selectedBill.lateFee}</p>
                                    }
                                    <p className="small mb-0 fw-bold"><strong>Total Amount:</strong> ₹{selectedBill.totalAmount}</p>
                                </div>
                            }
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-sm text-white" style={{ background: "#272757" }}
                                onClick={() => { initiatePayment() }}>
                                <i className="bi bi-credit-card me-1"></i>Pay ₹{selectedBill?.totalAmount}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}