import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export default function ManageFinance() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")

    let [activeTab, setActiveTab] = useState("revenue")

    let [lateFeeRule, setLateFeeRule] = useState(null)
    let [expenses, setExpenses] = useState([])
    let [revenue, setRevenue] = useState(null)
    let [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

    let { register: registerLateFee, handleSubmit: handleLateFeeSubmit, reset: resetLateFee, formState: { errors: lateFeeErrors } } = useForm()
    let { register: registerExpense, handleSubmit: handleExpenseSubmit, reset: resetExpense, formState: { errors: expenseErrors } } = useForm()

    let categories = ["Watchman", "Cleaning", "Water Bill", "Electricity Bill", "Repairs", "Miscellaneous"]
    let years = Array.from({ length: 5 }, (_, i) => new Date().getFullYear() - i)

    // ===== FETCH =====
    async function fetchLateFeeRule() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/latefee/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) {
            setLateFeeRule(responseData.data)
            resetLateFee({ flatAmount: responseData.data.flatAmount })
        }
    }

    async function fetchExpenses() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/expense/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setExpenses(responseData.data)
    }

    async function fetchRevenue(year) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/revenue/${user.societyId}/${year}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setRevenue(responseData.data)
    }

    useEffect(() => {
        fetchLateFeeRule()
        fetchExpenses()
        fetchRevenue(selectedYear)
        // eslint-disable-next-line
    }, [])

    useEffect(() => {
        fetchRevenue(selectedYear)
        // eslint-disable-next-line
    }, [selectedYear])

    // ===== ACTIONS =====
    async function saveLateFeeRule(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/admin/latefee/save", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ societyId: user.societyId, flatAmount: formData.flatAmount })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchLateFeeRule()
        } else {
            toast.error(responseData.message)
        }
    }

    async function addExpense(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/admin/expense/add", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                societyId: user.societyId,
                category: formData.category,
                description: formData.description,
                amount: formData.amount,
                expenseDate: formData.expenseDate,
                recordedByAdminId: user.userId
            })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            resetExpense()
            fetchExpenses()
            fetchRevenue(selectedYear)
            document.getElementById("closeExpenseModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function deleteExpense(expenseId) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/expense/delete/${expenseId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchExpenses()
            fetchRevenue(selectedYear)
        } else {
            toast.error(responseData.message)
        }
    }

    let maxAmount = revenue ? Math.max(...revenue.monthlyBreakdown.map(m => Math.max(m.income, m.expense)), 1) : 1

    return (
        <div>
            <h5 className="fw-bold mb-4">Finance</h5>

            {/* Tabs */}
            <ul className="nav nav-pills mb-4 gap-2">
                {[
                    { key: "revenue", label: "Revenue & P&L", icon: "bi-graph-up" },
                    { key: "expenses", label: "Expenses", icon: "bi-cash-coin" },
                    { key: "latefee", label: "Late Fee Settings", icon: "bi-alarm" },
                ].map(tab => (
                    <li className="nav-item" key={tab.key}>
                        <button
                            className={`nav-link small ${activeTab === tab.key ? "active" : ""}`}
                            style={activeTab === tab.key ? { background: "#272757" } : { color: "#272757" }}
                            onClick={() => setActiveTab(tab.key)}
                        >
                            <i className={`bi ${tab.icon} me-1`}></i>{tab.label}
                        </button>
                    </li>
                ))}
            </ul>

            {/* ===== REVENUE / P&L TAB ===== */}
            {activeTab === "revenue" && revenue && (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="small text-secondary">Showing data for</span>
                        <select className="form-select form-select-sm rounded-3" style={{ width: "120px" }}
                            value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                            {years.map(y => <option key={y} value={y}>{y}</option>)}
                        </select>
                    </div>

                    <div className="row g-3 mb-4">
                        <div className="col-12 col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 p-3">
                                <p className="mb-0 text-secondary small">Total Income ({selectedYear})</p>
                                <h4 className="fw-bold mb-0 text-success">₹{revenue.totalIncome.toLocaleString()}</h4>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 p-3">
                                <p className="mb-0 text-secondary small">Total Expense ({selectedYear})</p>
                                <h4 className="fw-bold mb-0 text-danger">₹{revenue.totalExpense.toLocaleString()}</h4>
                            </div>
                        </div>
                        <div className="col-12 col-md-4">
                            <div className="card border-0 shadow-sm rounded-4 p-3">
                                <p className="mb-0 text-secondary small">Net {revenue.netProfitOrLoss >= 0 ? "Profit" : "Loss"}</p>
                                <h4 className={`fw-bold mb-0 ${revenue.netProfitOrLoss >= 0 ? "text-success" : "text-danger"}`}>
                                    ₹{Math.abs(revenue.netProfitOrLoss).toLocaleString()}
                                </h4>
                            </div>
                        </div>
                    </div>

                    {/* Monthly bar chart (pure CSS, no extra deps) */}
                    <div className="card border-0 shadow-sm rounded-4 p-3 mb-4">
                        <p className="small fw-semibold mb-3">Monthly Income vs Expense</p>
                        <div className="d-flex align-items-end gap-2" style={{ height: "180px" }}>
                            {revenue.monthlyBreakdown.map(m => (
                                <div key={m.monthNumber} className="d-flex flex-column align-items-center flex-grow-1" style={{ height: "100%" }}>
                                    <div className="d-flex align-items-end gap-1 flex-grow-1">
                                        <div title={`Income: ₹${m.income}`}
                                            style={{
                                                width: "10px",
                                                height: `${(m.income / maxAmount) * 100}%`,
                                                background: "#198754",
                                                borderRadius: "3px 3px 0 0",
                                                minHeight: m.income > 0 ? "3px" : "0"
                                            }}></div>
                                        <div title={`Expense: ₹${m.expense}`}
                                            style={{
                                                width: "10px",
                                                height: `${(m.expense / maxAmount) * 100}%`,
                                                background: "#dc3545",
                                                borderRadius: "3px 3px 0 0",
                                                minHeight: m.expense > 0 ? "3px" : "0"
                                            }}></div>
                                    </div>
                                    <span className="small text-secondary mt-1" style={{ fontSize: "10px" }}>{m.month}</span>
                                </div>
                            ))}
                        </div>
                        <div className="d-flex gap-3 mt-3">
                            <span className="small text-secondary"><span className="d-inline-block rounded-circle me-1" style={{ width: "8px", height: "8px", background: "#198754" }}></span>Income</span>
                            <span className="small text-secondary"><span className="d-inline-block rounded-circle me-1" style={{ width: "8px", height: "8px", background: "#dc3545" }}></span>Expense</span>
                        </div>
                    </div>

                    {/* Monthly breakdown table */}
                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="table-responsive">
                            <table className="table table-hover table-borderless mb-0">
                                <thead style={{ background: "#f0f4ff" }}>
                                    <tr>
                                        <th className="py-3 ps-4 small">Month</th>
                                        <th className="py-3 small">Income</th>
                                        <th className="py-3 small">Expense</th>
                                        <th className="py-3 small">Profit / Loss</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {revenue.monthlyBreakdown.map(m => (
                                        <tr key={m.monthNumber}>
                                            <td className="ps-4 small fw-semibold">{m.month}</td>
                                            <td className="small text-success">₹{m.income.toLocaleString()}</td>
                                            <td className="small text-danger">₹{m.expense.toLocaleString()}</td>
                                            <td className={`small fw-semibold ${m.profitOrLoss >= 0 ? "text-success" : "text-danger"}`}>
                                                {m.profitOrLoss >= 0 ? "+" : "-"}₹{Math.abs(m.profitOrLoss).toLocaleString()}
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== EXPENSES TAB ===== */}
            {activeTab === "expenses" && (
                <div>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <span className="small text-secondary">Showing {expenses.length} expenses</span>
                        <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                            data-bs-toggle="modal" data-bs-target="#addExpenseModal">
                            <i className="bi bi-plus-lg me-1"></i>Record Expense
                        </button>
                    </div>

                    <div className="card border-0 shadow-sm rounded-4">
                        <div className="table-responsive">
                            <table className="table table-hover table-borderless mb-0">
                                <thead style={{ background: "#f0f4ff" }}>
                                    <tr>
                                        <th className="py-3 ps-4 small">#</th>
                                        <th className="py-3 small">Category</th>
                                        <th className="py-3 small">Description</th>
                                        <th className="py-3 small">Amount</th>
                                        <th className="py-3 small">Date</th>
                                        <th className="py-3 small">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="table-group-divider">
                                    {expenses.length === 0 ?
                                        <tr><td colSpan="6" className="text-center text-secondary py-4 small">No expenses recorded yet</td></tr>
                                        :
                                        expenses
                                            .slice()
                                            .sort((a, b) => new Date(b.expenseDate) - new Date(a.expenseDate))
                                            .map((e, index) => (
                                                <tr key={e.expenseId}>
                                                    <td className="ps-4 small">{index + 1}</td>
                                                    <td className="small fw-semibold">{e.category}</td>
                                                    <td className="small">{e.description || "—"}</td>
                                                    <td className="small text-danger fw-semibold">₹{e.amount}</td>
                                                    <td className="small">{e.expenseDate}</td>
                                                    <td>
                                                        <button className="btn btn-sm btn-outline-danger"
                                                            onClick={() => deleteExpense(e.expenseId)}>
                                                            <i className="bi bi-trash"></i>
                                                        </button>
                                                    </td>
                                                </tr>
                                            ))
                                    }
                                </tbody>
                            </table>
                        </div>
                    </div>
                </div>
            )}

            {/* ===== LATE FEE SETTINGS TAB ===== */}
            {activeTab === "latefee" && (
                <div className="card border-0 shadow-sm rounded-4 p-4" style={{ maxWidth: "480px" }}>
                    <p className="small text-secondary mb-3">
                        Set a flat penalty that gets automatically added to a resident's bill if it remains
                        unpaid past the due date. Currently set to:{" "}
                        <strong>{lateFeeRule ? `₹${lateFeeRule.flatAmount}` : "Not set"}</strong>
                    </p>
                    <form onSubmit={handleLateFeeSubmit(saveLateFeeRule)} noValidate>
                        <div className="mb-2">
                            <label className="form-label small fw-medium">Late Fee Amount (₹, flat)</label>
                            <input type="number"
                                className={`form-control form-control-sm rounded-3 ${lateFeeErrors.flatAmount ? "is-invalid" : ""}`}
                                placeholder="e.g. 100"
                                {...registerLateFee("flatAmount", {
                                    required: { value: true, message: "Late fee amount is required" },
                                    min: { value: 1, message: "Must be greater than 0" }
                                })}
                            />
                            <div style={{ minHeight: "20px" }}>
                                {lateFeeErrors.flatAmount && <div className="invalid-feedback d-block">{lateFeeErrors.flatAmount.message}</div>}
                            </div>
                        </div>
                        <button type="submit" className="btn btn-sm text-white mt-2" style={{ background: "#272757" }}>
                            Save Late Fee Rule
                        </button>
                    </form>
                </div>
            )}

            {/* Record Expense Modal */}
            <div className="modal fade" id="addExpenseModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Record Expense</h6>
                            <button id="closeExpenseModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleExpenseSubmit(addExpense)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Category</label>
                                    <input type="text" list="expense-categories"
                                        className={`form-control form-control-sm rounded-3 ${expenseErrors.category ? "is-invalid" : ""}`}
                                        placeholder="e.g. Watchman Salary"
                                        {...registerExpense("category", { required: { value: true, message: "Category is required" } })}
                                    />
                                    <datalist id="expense-categories">
                                        {categories.map(c => <option key={c} value={c} />)}
                                    </datalist>
                                    <div style={{ minHeight: "20px" }}>
                                        {expenseErrors.category && <div className="invalid-feedback d-block">{expenseErrors.category.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Description (optional)</label>
                                    <input type="text"
                                        className="form-control form-control-sm rounded-3"
                                        placeholder="e.g. Monthly salary for June"
                                        {...registerExpense("description")}
                                    />
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Amount (₹)</label>
                                    <input type="number"
                                        className={`form-control form-control-sm rounded-3 ${expenseErrors.amount ? "is-invalid" : ""}`}
                                        placeholder="e.g. 5000"
                                        {...registerExpense("amount", {
                                            required: { value: true, message: "Amount is required" },
                                            min: { value: 1, message: "Must be greater than 0" }
                                        })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {expenseErrors.amount && <div className="invalid-feedback d-block">{expenseErrors.amount.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Date</label>
                                    <input type="date"
                                        className={`form-control form-control-sm rounded-3 ${expenseErrors.expenseDate ? "is-invalid" : ""}`}
                                        {...registerExpense("expenseDate", { required: { value: true, message: "Date is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {expenseErrors.expenseDate && <div className="invalid-feedback d-block">{expenseErrors.expenseDate.message}</div>}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Save Expense</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
