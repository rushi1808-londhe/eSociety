import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export default function MyComplaints() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [complaints, setComplaints] = useState([])
    let [filterStatus, setFilterStatus] = useState("")

    let { register, handleSubmit, formState: { errors }, reset } = useForm()

    let filteredComplaints = complaints
        .filter(c => filterStatus === "" || c.status === filterStatus)

    async function fetchComplaints() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/resident/complaints/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setComplaints(responseData.data)
    }

    useEffect(() => { fetchComplaints() }, [])

    async function addComplaint(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/resident/complaints/add", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({
                userId: String(user.userId),
                title: formData.title,
                description: formData.description
            })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            reset()
            fetchComplaints()
            document.getElementById("closeComplaintModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">My Complaints</h5>
                    <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                        data-bs-toggle="modal" data-bs-target="#addComplaintModal">
                        <i className="bi bi-plus-lg me-1"></i>New Complaint
                    </button>
                </div>
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-3">
                        <select className="form-select form-select-sm rounded-3"
                            value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value) }}>
                            <option value="">All Status</option>
                            <option value="OPEN">Open</option>
                            <option value="IN_PROGRESS">In Progress</option>
                            <option value="CLOSED">Closed</option>
                        </select>
                    </div>
                    <div className="col-auto">
                        <span className="small text-secondary">Showing {filteredComplaints.length} of {complaints.length}</span>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover table-borderless mb-0">
                        <thead style={{ background: "#f0f4ff" }}>
                            <tr>
                                <th className="py-3 ps-4 small">#</th>
                                <th className="py-3 small">Title</th>
                                <th className="py-3 small">Description</th>
                                <th className="py-3 small">Date</th>
                                <th className="py-3 small">Status</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {filteredComplaints.length === 0 ?
                                <tr><td colSpan="5" className="text-center text-secondary py-4 small">No complaints found</td></tr>
                                :
                                filteredComplaints.map((c, index) => {
                                    return (
                                        <tr key={c.complaintId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{c.title}</td>
                                            <td className="small">{c.description}</td>
                                            <td className="small">{c.createdAt}</td>
                                            <td>
                                                <span className={`badge ${c.status === "OPEN" ? "bg-danger" : c.status === "IN_PROGRESS" ? "bg-warning text-dark" : "bg-success"}`}>
                                                    {c.status}
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

            {/* Add Complaint Modal */}
            <div className="modal fade" id="addComplaintModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Submit New Complaint</h6>
                            <button id="closeComplaintModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit(addComplaint)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Title</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${errors.title ? "is-invalid" : ""}`}
                                        placeholder="Complaint title"
                                        {...register("title", { required: { value: true, message: "Title is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.title && <div className="invalid-feedback d-block">{errors.title.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Description</label>
                                    <textarea
                                        className={`form-control form-control-sm rounded-3 ${errors.description ? "is-invalid" : ""}`}
                                        placeholder="Describe your complaint"
                                        rows="3"
                                        {...register("description", { required: { value: true, message: "Description is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Submit</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}