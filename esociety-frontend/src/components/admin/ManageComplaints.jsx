import React, { useState, useEffect } from 'react'
import { toast } from 'react-toastify'

export default function ManageComplaints() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [complaints, setComplaints] = useState([])
    let [selectedId, setSelectedId] = useState(null)
    let [selectedStatus, setSelectedStatus] = useState("")
    let [search, setSearch] = useState("")
    let [filterStatus, setFilterStatus] = useState("")

    let filteredComplaints = complaints
        .filter(c => filterStatus === "" || c.status === filterStatus)
        .filter(c => c.title.toLowerCase().includes(search.toLowerCase()))

    async function fetchComplaints() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/complaint/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setComplaints(responseData.data)
    }

    useEffect(() => { fetchComplaints() }, [])

    async function updateStatus() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/complaint/update/${selectedId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ status: selectedStatus })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchComplaints()
            document.getElementById("closeStatusModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Manage Complaints</h5>
                </div>
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-5">
                        <input type="text" className="form-control form-control-sm rounded-3"
                            placeholder="🔍 Search by title..."
                            value={search} onChange={(e) => { setSearch(e.target.value) }}
                        />
                    </div>
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
                                <th className="py-3 small">Flat</th>
                                <th className="py-3 small">Date</th>
                                <th className="py-3 small">Status</th>
                                <th className="py-3 small">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {filteredComplaints.length === 0 ?
                                <tr><td colSpan="7" className="text-center text-secondary py-4 small">No complaints found</td></tr>
                                :
                                filteredComplaints.map((c, index) => {
                                    return (
                                        <tr key={c.complaintId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{c.title}</td>
                                            <td className="small">{c.description}</td>
                                            <td className="small">{c.flatId}</td>
                                            <td className="small">{c.createdAt}</td>
                                            <td>
                                                <span className={`badge ${c.status === "OPEN" ? "bg-danger" : c.status === "IN_PROGRESS" ? "bg-warning text-dark" : "bg-success"}`}>
                                                    {c.status}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-outline-secondary"
                                                    data-bs-toggle="modal" data-bs-target="#updateStatusModal"
                                                    onClick={() => {
                                                        setSelectedId(c.complaintId)
                                                        setSelectedStatus(c.status)
                                                    }}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                            </td>
                                        </tr>
                                    )
                                })
                            }
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Update Status Modal */}
            <div className="modal fade" id="updateStatusModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Update Complaint Status</h6>
                            <button id="closeStatusModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <label className="form-label small fw-medium">Status</label>
                            <select className="form-select form-select-sm rounded-3"
                                value={selectedStatus}
                                onChange={(e) => { setSelectedStatus(e.target.value) }}>
                                <option value="OPEN">Open</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="CLOSED">Closed</option>
                            </select>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-sm text-white" style={{ background: "#272757" }}
                                onClick={() => { updateStatus() }}>Update</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}