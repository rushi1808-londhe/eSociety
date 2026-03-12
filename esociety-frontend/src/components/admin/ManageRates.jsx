import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export default function ManageRates() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [rates, setRates] = useState([])

    let { register, handleSubmit, formState: { errors }, reset } = useForm()

    async function fetchRates() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/rate/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setRates(responseData.data)
    }

    useEffect(() => {
        fetchRates()
    }, [])

    async function saveRate(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/admin/rate/save", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ ...formData, societyId: user.societyId })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            reset()
            fetchRates()
            document.getElementById("closeRateModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Maintenance Rates</h5>
                <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                    data-bs-toggle="modal" data-bs-target="#addRateModal">
                    <i className="bi bi-plus-lg me-1"></i>Set Rate
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover table-borderless mb-0">
                        <thead style={{ background: "#f0f4ff" }}>
                            <tr>
                                <th className="py-3 ps-4 small">#</th>
                                <th className="py-3 small">Flat Type</th>
                                <th className="py-3 small">Flat Charge (₹)</th>
                                <th className="py-3 small">2W Charge (₹)</th>
                                <th className="py-3 small">4W Charge (₹)</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {rates.length === 0 ?
                                <tr><td colSpan="5" className="text-center text-secondary py-4 small">No rates set yet</td></tr>
                                :
                                rates.map((r, index) => {
                                    return (
                                        <tr key={r.rateId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{r.flatType}</td>
                                            <td className="small">₹{r.flatCharge}</td>
                                            <td className="small">₹{r.twoWheelerCharge}</td>
                                            <td className="small">₹{r.fourWheelerCharge}</td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Set Rate Modal */}
            <div className="modal fade" id="addRateModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Set Maintenance Rate</h6>
                            <button id="closeRateModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit(saveRate)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Flat Type</label>
                                    <select className={`form-select form-select-sm rounded-3 ${errors.flatType ? "is-invalid" : ""}`}
                                        {...register("flatType", { required: { value: true, message: "Please select flat type" } })}>
                                        <option value="">Select Type</option>
                                        <option value="BHK1">1 BHK</option>
                                        <option value="BHK2">2 BHK</option>
                                        <option value="BHK3">3 BHK</option>
                                    </select>
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.flatType && <div className="invalid-feedback d-block">{errors.flatType.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Flat Charge (₹/month)</label>
                                    <input type="number"
                                        className={`form-control form-control-sm rounded-3 ${errors.flatCharge ? "is-invalid" : ""}`}
                                        placeholder="e.g. 2000"
                                        {...register("flatCharge", {
                                            required: { value: true, message: "Flat charge is required" },
                                            min: { value: 1, message: "Must be greater than 0" }
                                        })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.flatCharge && <div className="invalid-feedback d-block">{errors.flatCharge.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Two Wheeler Charge (₹/slot/month)</label>
                                    <input type="number"
                                        className={`form-control form-control-sm rounded-3 ${errors.twoWheelerCharge ? "is-invalid" : ""}`}
                                        placeholder="e.g. 500"
                                        {...register("twoWheelerCharge", {
                                            required: { value: true, message: "Two wheeler charge is required" },
                                            min: { value: 0, message: "Cannot be negative" }
                                        })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.twoWheelerCharge && <div className="invalid-feedback d-block">{errors.twoWheelerCharge.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Four Wheeler Charge (₹/slot/month)</label>
                                    <input type="number"
                                        className={`form-control form-control-sm rounded-3 ${errors.fourWheelerCharge ? "is-invalid" : ""}`}
                                        placeholder="e.g. 1000"
                                        {...register("fourWheelerCharge", {
                                            required: { value: true, message: "Four wheeler charge is required" },
                                            min: { value: 0, message: "Cannot be negative" }
                                        })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.fourWheelerCharge && <div className="invalid-feedback d-block">{errors.fourWheelerCharge.message}</div>}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Save Rate</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}