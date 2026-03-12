import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export default function ManageAdmins() {
    let token = localStorage.getItem("token")
    let [admins, setAdmins] = useState([])
    let [societies, setSocieties] = useState([])
    let [deleteId, setDeleteId] = useState(null)
    let [editId, setEditId] = useState(null)
    let [search, setSearch] = useState("")
    let [filterStatus, setFilterStatus] = useState("")
    let [filterSociety, setFilterSociety] = useState("")

    let { register, handleSubmit, formState: { errors }, reset } = useForm()
    let { register: registerEdit, handleSubmit: handleEdit, formState: { errors: editErrors }, reset: resetEdit } = useForm()

    let filteredAdmins = admins
        .filter(a => filterStatus === "" || (filterStatus === "active" ? a.isActive : !a.isActive))
        .filter(a => filterSociety === "" || String(a.societyId) === filterSociety)
        .filter(a => a.name.toLowerCase().includes(search.toLowerCase()) ||
                     a.email.toLowerCase().includes(search.toLowerCase()))

    async function fetchAdmins() {
        let responseObject = await fetch("http://localhost:8080/api/v1/superadmin/admin/all", {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setAdmins(responseData.data)
    }

    async function fetchSocieties() {
        let responseObject = await fetch("http://localhost:8080/api/v1/superadmin/society/all", {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setSocieties(responseData.data)
    }

    useEffect(() => {
        fetchAdmins()
        fetchSocieties()
    }, [])

    async function addAdmin(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/superadmin/admin/add", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData)
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            reset()
            fetchAdmins()
            document.getElementById("closeAdminModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function updateAdmin(formData) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/superadmin/admin/update/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData)
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchAdmins()
            document.getElementById("closeEditAdminModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function toggleStatus(userId) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/superadmin/admin/toggle/${userId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchAdmins()
        } else {
            toast.error(responseData.message)
        }
    }

    async function deleteAdmin() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/superadmin/admin/delete/${deleteId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data === true) {
            toast.success(responseData.message)
            fetchAdmins()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Manage Admins</h5>
                    <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                        data-bs-toggle="modal" data-bs-target="#addAdminModal">
                        <i className="bi bi-plus-lg me-1"></i>Add Admin
                    </button>
                </div>
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-4">
                        <input type="text" className="form-control form-control-sm rounded-3"
                            placeholder="🔍 Search by name, email..."
                            value={search} onChange={(e) => { setSearch(e.target.value) }}
                        />
                    </div>
                    <div className="col-12 col-md-3">
                        <select className="form-select form-select-sm rounded-3"
                            value={filterSociety} onChange={(e) => { setFilterSociety(e.target.value) }}>
                            <option value="">All Societies</option>
                            {societies.map(s => <option key={s.societyId} value={s.societyId}>{s.name}</option>)}
                        </select>
                    </div>
                    <div className="col-12 col-md-2">
                        <select className="form-select form-select-sm rounded-3"
                            value={filterStatus} onChange={(e) => { setFilterStatus(e.target.value) }}>
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                        </select>
                    </div>
                    <div className="col-auto">
                        <span className="small text-secondary">Showing {filteredAdmins.length} of {admins.length}</span>
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
                                <th className="py-3 small">Email</th>
                                <th className="py-3 small">Society</th>
                                <th className="py-3 small">Status</th>
                                <th className="py-3 small">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {filteredAdmins.length === 0 ?
                                <tr><td colSpan="6" className="text-center text-secondary py-4 small">No admins found</td></tr>
                                :
                                filteredAdmins.map((a, index) => {
                                    return (
                                        <tr key={a.userId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{a.name}</td>
                                            <td className="small">{a.email}</td>
                                            <td className="small">{societies.find(s => s.societyId === a.societyId)?.name || a.societyId}</td>
                                            <td>
                                                <span className={`badge ${a.isActive ? "bg-success" : "bg-danger"}`}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => { toggleStatus(a.userId) }}>
                                                    <i className={`bi ${a.isActive ? "bi-toggle-on" : "bi-toggle-off"} me-1`}></i>
                                                    {a.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-warning me-2"
                                                    data-bs-toggle="modal" data-bs-target="#editAdminModal"
                                                    onClick={() => {
                                                        setEditId(a.userId)
                                                        resetEdit({ name: a.name, email: a.email, societyId: String(a.societyId) })
                                                    }}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger"
                                                    data-bs-toggle="modal" data-bs-target="#deleteAdminModal"
                                                    onClick={() => { setDeleteId(a.userId) }}>
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

            {/* Add Admin Modal */}
            <div className="modal fade" id="addAdminModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Add New Admin</h6>
                            <button id="closeAdminModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit(addAdmin)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Name</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${errors.name ? "is-invalid" : ""}`}
                                        placeholder="Enter admin name"
                                        {...register("name", { required: { value: true, message: "Name is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Email</label>
                                    <input type="email"
                                        className={`form-control form-control-sm rounded-3 ${errors.email ? "is-invalid" : ""}`}
                                        placeholder="Enter admin email"
                                        {...register("email", {
                                            required: { value: true, message: "Email is required" },
                                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                                        })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Password</label>
                                    <input type="password"
                                        className={`form-control form-control-sm rounded-3 ${errors.password ? "is-invalid" : ""}`}
                                        placeholder="Set initial password"
                                        {...register("password", {
                                            required: { value: true, message: "Password is required" },
                                            minLength: { value: 6, message: "Minimum 6 characters" }
                                        })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.password && <div className="invalid-feedback d-block">{errors.password.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Society</label>
                                    <select className={`form-select form-select-sm rounded-3 ${errors.societyId ? "is-invalid" : ""}`}
                                        {...register("societyId", { required: { value: true, message: "Please select a society" } })}>
                                        <option value="">Select Society</option>
                                        {societies.map(s => <option key={s.societyId} value={s.societyId}>{s.name}</option>)}
                                    </select>
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.societyId && <div className="invalid-feedback d-block">{errors.societyId.message}</div>}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Add Admin</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Admin Modal */}
            <div className="modal fade" id="editAdminModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Edit Admin</h6>
                            <button id="closeEditAdminModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEdit(updateAdmin)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Name</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${editErrors.name ? "is-invalid" : ""}`}
                                        {...registerEdit("name", { required: { value: true, message: "Name is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {editErrors.name && <div className="invalid-feedback d-block">{editErrors.name.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Email</label>
                                    <input type="email"
                                        className={`form-control form-control-sm rounded-3 ${editErrors.email ? "is-invalid" : ""}`}
                                        {...registerEdit("email", {
                                            required: { value: true, message: "Email is required" },
                                            pattern: { value: /^\S+@\S+$/i, message: "Invalid email format" }
                                        })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {editErrors.email && <div className="invalid-feedback d-block">{editErrors.email.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Society</label>
                                    <select className={`form-select form-select-sm rounded-3 ${editErrors.societyId ? "is-invalid" : ""}`}
                                        {...registerEdit("societyId", { required: { value: true, message: "Please select a society" } })}>
                                        <option value="">Select Society</option>
                                        {societies.map(s => <option key={s.societyId} value={s.societyId}>{s.name}</option>)}
                                    </select>
                                    <div style={{ minHeight: "20px" }}>
                                        {editErrors.societyId && <div className="invalid-feedback d-block">{editErrors.societyId.message}</div>}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Update Admin</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <div className="modal fade" id="deleteAdminModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0">
                            <h6 className="modal-title fw-bold">Delete Admin</h6>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <p className="small text-secondary mb-0">Are you sure? This action cannot be undone.</p>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger btn-sm" data-bs-dismiss="modal"
                                onClick={() => { deleteAdmin() }}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}