import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export default function ManageResidents() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [residents, setResidents] = useState([])
    let [flats, setFlats] = useState([])
    let [buildings, setBuildings] = useState([])
    let [deleteId, setDeleteId] = useState(null)
    let [editId, setEditId] = useState(null)
    let [search, setSearch] = useState("")
    let [filterStatus, setFilterStatus] = useState("")

    let { register, handleSubmit, formState: { errors }, reset } = useForm()
    let { register: registerEdit, handleSubmit: handleEdit, formState: { errors: editErrors }, reset: resetEdit } = useForm()

    let vacantFlats = flats.filter(f => f.isVacant)

    let filteredResidents = residents
        .filter(r => filterStatus === "" || (filterStatus === "active" ? r.isActive : !r.isActive))
        .filter(r => (r.name && r.name.toLowerCase().includes(search.toLowerCase())) ||
            (r.email && r.email.toLowerCase().includes(search.toLowerCase())) ||
            (r.phone && r.phone.toLowerCase().includes(search.toLowerCase())))

    async function fetchResidents() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/resident/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setResidents(responseData.data)
    }

    async function toggleResidentStatus(residentId) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/resident/toggle/${residentId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchResidents()
        } else {
            toast.error(responseData.message)
        }
    }

    async function fetchFlats() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/flat/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setFlats(responseData.data)
    }

    async function fetchBuildings() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/building/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setBuildings(responseData.data)
    }

    useEffect(() => {
        fetchResidents()
        fetchFlats()
        fetchBuildings()
    }, [])

    async function addResident(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/admin/resident/add", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...formData, societyId: user.societyId })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            reset()
            fetchResidents()
            fetchFlats()
            document.getElementById("closeResidentModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function updateResident(formData) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/resident/update/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData)
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchResidents()
            document.getElementById("closeEditResidentModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function deleteResident() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/resident/delete/${deleteId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data === true) {
            toast.success(responseData.message)
            fetchResidents()
            fetchFlats()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Manage Residents</h5>
                    <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                        data-bs-toggle="modal" data-bs-target="#addResidentModal">
                        <i className="bi bi-plus-lg me-1"></i>Add Resident
                    </button>
                </div>
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-6">
                        <input type="text" className="form-control form-control-sm rounded-3"
                            placeholder="🔍 Search by name, email, phone..."
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
                        <span className="small text-secondary">Showing {filteredResidents.length} of {residents.length}</span>
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
                                <th className="py-3 small">Phone</th>
                                <th className="py-3 small">Building</th>
                                <th className="py-3 small">Flat</th>
                                <th className="py-3 small">Move In</th>
                                <th className="py-3 small">Status</th>
                                <th className="py-3 small">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {filteredResidents.length === 0 ?
                                <tr><td colSpan="9" className="text-center text-secondary py-4 small">No residents found</td></tr>
                                :
                                filteredResidents.map((r, index) => {
                                    let flat = flats.find(f => f.flatId === r.flatId)
                                    let building = flat ? buildings.find(b => b.buildingId === flat.buildingId) : null
                                    return (
                                        <tr key={r.residentId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{r.name}</td>
                                            <td className="small">{r.email}</td>
                                            <td className="small">{r.phone}</td>
                                            <td className="small">{building ? building.name : "-"}</td>
                                            <td className="small">{r.flatNumber} ({r.flatType})</td>
                                            <td className="small">{r.moveInDate}</td>
                                            <td>
                                                <span className={`badge ${r.isActive ? "bg-success" : "bg-danger"}`}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => { toggleResidentStatus(r.residentId) }}>
                                                    <i className={`bi ${r.isActive ? "bi-toggle-on" : "bi-toggle-off"} me-1`}></i>
                                                    {r.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-warning me-2"
                                                    data-bs-toggle="modal" data-bs-target="#editResidentModal"
                                                    onClick={() => {
                                                        setEditId(r.residentId)
                                                        resetEdit({
                                                            name: r.name,
                                                            email: r.email,
                                                            phone: r.phone,
                                                            moveInDate: r.moveInDate
                                                        })
                                                    }}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger"
                                                    data-bs-toggle="modal" data-bs-target="#deleteResidentModal"
                                                    onClick={() => { setDeleteId(r.residentId) }}>
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

            {/* Add Resident Modal */}
            <div className="modal fade" id="addResidentModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Add New Resident</h6>
                            <button id="closeResidentModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit(addResident)} noValidate>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Name</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${errors.name ? "is-invalid" : ""}`}
                                            placeholder="Full name"
                                            {...register("name", { required: { value: true, message: "Name is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Email</label>
                                        <input type="email"
                                            className={`form-control form-control-sm rounded-3 ${errors.email ? "is-invalid" : ""}`}
                                            placeholder="Email address"
                                            {...register("email", {
                                                required: { value: true, message: "Email is required" },
                                                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                            })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {errors.email && <div className="invalid-feedback d-block">{errors.email.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
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
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Phone</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${errors.phone ? "is-invalid" : ""}`}
                                            placeholder="Phone number"
                                            {...register("phone", {
                                                required: { value: true, message: "Phone is required" },
                                                pattern: { value: /^[0-9]{10}$/, message: "Enter valid 10 digit number" }
                                            })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {errors.phone && <div className="invalid-feedback d-block">{errors.phone.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Flat</label>
                                        <select className={`form-select form-select-sm rounded-3 ${errors.flatId ? "is-invalid" : ""}`}
                                            {...register("flatId", { required: { value: true, message: "Please select flat" } })}>
                                            <option value="">Select Vacant Flat</option>
                                            {vacantFlats.map(f => {
                                                let building = buildings.find(b => b.buildingId === f.buildingId)
                                                return (
                                                    <option key={f.flatId} value={f.flatId}>
                                                        {building ? building.name : "?"} — Flat {f.flatNumber} ({f.flatType})
                                                    </option>
                                                )
                                            })}
                                        </select>
                                        <div style={{ minHeight: "20px" }}>
                                            {errors.flatId && <div className="invalid-feedback d-block">{errors.flatId.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Move In Date</label>
                                        <input type="date"
                                            className={`form-control form-control-sm rounded-3 ${errors.moveInDate ? "is-invalid" : ""}`}
                                            {...register("moveInDate", { required: { value: true, message: "Move in date is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {errors.moveInDate && <div className="invalid-feedback d-block">{errors.moveInDate.message}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Add Resident</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Resident Modal */}
            <div className="modal fade" id="editResidentModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Edit Resident</h6>
                            <button id="closeEditResidentModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEdit(updateResident)} noValidate>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Name</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${editErrors.name ? "is-invalid" : ""}`}
                                            {...registerEdit("name", { required: { value: true, message: "Name is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.name && <div className="invalid-feedback d-block">{editErrors.name.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Email</label>
                                        <input type="email"
                                            className={`form-control form-control-sm rounded-3 ${editErrors.email ? "is-invalid" : ""}`}
                                            {...registerEdit("email", {
                                                required: { value: true, message: "Email is required" },
                                                pattern: { value: /^\S+@\S+$/i, message: "Invalid email" }
                                            })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.email && <div className="invalid-feedback d-block">{editErrors.email.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Phone</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${editErrors.phone ? "is-invalid" : ""}`}
                                            {...registerEdit("phone", {
                                                required: { value: true, message: "Phone is required" },
                                                pattern: { value: /^[0-9]{10}$/, message: "Enter valid 10 digit number" }
                                            })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.phone && <div className="invalid-feedback d-block">{editErrors.phone.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Move In Date</label>
                                        <input type="date"
                                            className={`form-control form-control-sm rounded-3 ${editErrors.moveInDate ? "is-invalid" : ""}`}
                                            {...registerEdit("moveInDate", { required: { value: true, message: "Move in date is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.moveInDate && <div className="invalid-feedback d-block">{editErrors.moveInDate.message}</div>}
                                        </div>
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Update Resident</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <div className="modal fade" id="deleteResidentModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0">
                            <h6 className="modal-title fw-bold">Delete Resident</h6>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <p className="small text-secondary mb-0">Are you sure? Flat will be marked as vacant.</p>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger btn-sm" data-bs-dismiss="modal"
                                onClick={() => { deleteResident() }}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}