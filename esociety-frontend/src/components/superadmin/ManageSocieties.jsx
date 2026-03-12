import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export default function ManageSocieties() {
    let token = localStorage.getItem("token")
    let [societies, setSocieties] = useState([])
    let [deleteId, setDeleteId] = useState(null)
    let [editId, setEditId] = useState(null)
    let [search, setSearch] = useState("")
    let [filterStatus, setFilterStatus] = useState("")

    let { register: registerAdd, handleSubmit: handleAdd, formState: { errors: addErrors }, reset: resetAdd } = useForm()
    let { register: registerEdit, handleSubmit: handleEdit, formState: { errors: editErrors }, reset: resetEdit } = useForm()

    let filteredSocieties = societies
        .filter(s => filterStatus === "" || (filterStatus === "active" ? s.isActive : !s.isActive))
        .filter(s => s.name.toLowerCase().includes(search.toLowerCase()) ||
                     s.city.toLowerCase().includes(search.toLowerCase()) ||
                     s.state.toLowerCase().includes(search.toLowerCase()))

    async function fetchSocieties() {
        let responseObject = await fetch("http://localhost:8080/api/v1/superadmin/society/all", {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setSocieties(responseData.data)
    }

    useEffect(() => { fetchSocieties() }, [])

    async function addSociety(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/superadmin/society/add", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData)
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            resetAdd()
            fetchSocieties()
            document.getElementById("closeSocietyModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function updateSociety(formData) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/superadmin/society/update/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData)
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchSocieties()
            document.getElementById("closeEditModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function deleteSociety() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/superadmin/society/delete/${deleteId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data === true) {
            toast.success(responseData.message)
            fetchSocieties()
        } else {
            toast.error(responseData.message)
        }
    }

    async function toggleSocietyStatus(societyId) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/superadmin/society/toggle/${societyId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchSocieties()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Manage Societies</h5>
                    <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                        data-bs-toggle="modal" data-bs-target="#addSocietyModal">
                        <i className="bi bi-plus-lg me-1"></i>Add Society
                    </button>
                </div>
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-6">
                        <input type="text" className="form-control form-control-sm rounded-3"
                            placeholder="🔍 Search by name, city, state..."
                            value={search} onChange={(e) => { setSearch(e.target.value) }}
                        />
                    </div>
                    <div className="col-12 col-md-3">
                        <select className="form-select form-select-sm rounded-3"
                            value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value) }}>
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="col-auto">
                        <span className="small text-secondary">Showing {filteredSocieties.length} of {societies.length}</span>
                    </div>
                </div>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover table-borderless mb-0">
                        <thead style={{ background: "#f0f4ff" }}>
                            <tr>
                                <th className="py-3 ps-4 small">#</th>
                                <th className="py-3 small">Name</th>
                                <th className="py-3 small">Address</th>
                                <th className="py-3 small">City</th>
                                <th className="py-3 small">State</th>
                                <th className="py-3 small">Status</th>
                                <th className="py-3 small">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {filteredSocieties.length === 0 ?
                                <tr><td colSpan="7" className="text-center text-secondary py-4 small">No societies found</td></tr>
                                :
                                filteredSocieties.map((s, index) => {
                                    return (
                                        <tr key={s.societyId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{s.name}</td>
                                            <td className="small">{s.address}</td>
                                            <td className="small">{s.city}</td>
                                            <td className="small">{s.state}</td>
                                            <td>
                                                <span className={`badge ${s.isActive ? "bg-success" : "bg-danger"}`}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => { toggleSocietyStatus(s.societyId) }}>
                                                    <i className={`bi ${s.isActive ? "bi-toggle-on" : "bi-toggle-off"} me-1`}></i>
                                                    {s.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-warning me-2"
                                                    data-bs-toggle="modal" data-bs-target="#editSocietyModal"
                                                    onClick={() => {
                                                        setEditId(s.societyId)
                                                        resetEdit({ name: s.name, address: s.address, city: s.city, state: s.state })
                                                    }}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger"
                                                    data-bs-toggle="modal" data-bs-target="#deleteSocietyModal"
                                                    onClick={() => { setDeleteId(s.societyId) }}>
                                                    <i className="bi bi-trash"></i>
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

            {/* Add Modal */}
            <div className="modal fade" id="addSocietyModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Add New Society</h6>
                            <button id="closeSocietyModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleAdd(addSociety)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Society Name</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${addErrors.name ? "is-invalid" : ""}`}
                                        placeholder="Enter society name"
                                        {...registerAdd("name", { required: { value: true, message: "Society name is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {addErrors.name && <div className="invalid-feedback d-block">{addErrors.name.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Address</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${addErrors.address ? "is-invalid" : ""}`}
                                        placeholder="Enter address"
                                        {...registerAdd("address", { required: { value: true, message: "Address is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {addErrors.address && <div className="invalid-feedback d-block">{addErrors.address.message}</div>}
                                    </div>
                                </div>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">City</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${addErrors.city ? "is-invalid" : ""}`}
                                            placeholder="City"
                                            {...registerAdd("city", { required: { value: true, message: "City is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {addErrors.city && <div className="invalid-feedback d-block">{addErrors.city.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">State</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${addErrors.state ? "is-invalid" : ""}`}
                                            placeholder="State"
                                            {...registerAdd("state", { required: { value: true, message: "State is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {addErrors.state && <div className="invalid-feedback d-block">{addErrors.state.message}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Add Society</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <div className="modal fade" id="editSocietyModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Edit Society</h6>
                            <button id="closeEditModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEdit(updateSociety)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Society Name</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${editErrors.name ? "is-invalid" : ""}`}
                                        {...registerEdit("name", { required: { value: true, message: "Society name is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {editErrors.name && <div className="invalid-feedback d-block">{editErrors.name.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Address</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${editErrors.address ? "is-invalid" : ""}`}
                                        {...registerEdit("address", { required: { value: true, message: "Address is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {editErrors.address && <div className="invalid-feedback d-block">{editErrors.address.message}</div>}
                                    </div>
                                </div>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">City</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${editErrors.city ? "is-invalid" : ""}`}
                                            {...registerEdit("city", { required: { value: true, message: "City is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.city && <div className="invalid-feedback d-block">{editErrors.city.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">State</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${editErrors.state ? "is-invalid" : ""}`}
                                            {...registerEdit("state", { required: { value: true, message: "State is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.state && <div className="invalid-feedback d-block">{editErrors.state.message}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Update Society</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <div className="modal fade" id="deleteSocietyModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0">
                            <h6 className="modal-title fw-bold">Delete Society</h6>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <p className="small text-secondary mb-0">Are you sure? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger btn-sm" data-bs-dismiss="modal"
                                onClick={() => { deleteSociety() }}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}