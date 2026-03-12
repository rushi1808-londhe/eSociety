import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export default function ManageBuildings() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [buildings, setBuildings] = useState([])
    let [deleteId, setDeleteId] = useState(null)
    let [editId, setEditId] = useState(null)
    let [search, setSearch] = useState("")
    let [filterStatus, setFilterStatus] = useState("")

    let { register, handleSubmit, formState: { errors }, reset } = useForm()
    let { register: registerEdit, handleSubmit: handleEdit, formState: { errors: editErrors }, reset: resetEdit } = useForm()

    let filteredBuildings = buildings
        .filter(b => filterStatus === "" || (filterStatus === "active" ? b.isActive : !b.isActive))
        .filter(b => b.name.toLowerCase().includes(search.toLowerCase()))

    async function fetchBuildings() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/building/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setBuildings(responseData.data)
    }

    useEffect(() => { fetchBuildings() }, [])

    async function addBuilding(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/admin/building/add", {
            method: "POST",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify({ ...formData, societyId: user.societyId })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            reset()
            fetchBuildings()
            document.getElementById("closeBuildingModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function updateBuilding(formData) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/building/update/${editId}`, {
            method: "PUT",
            headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
            body: JSON.stringify(formData)
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchBuildings()
            document.getElementById("closeEditBuildingModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function toggleBuildingStatus(buildingId) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/building/toggle/${buildingId}`, {
            method: "PUT",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchBuildings()
        } else {
            toast.error(responseData.message)
        }
    }

    async function deleteBuilding() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/building/delete/${deleteId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data === true) {
            toast.success(responseData.message)
            fetchBuildings()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="mb-4">
                <div className="d-flex justify-content-between align-items-center mb-3">
                    <h5 className="fw-bold mb-0">Manage Buildings</h5>
                    <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                        data-bs-toggle="modal" data-bs-target="#addBuildingModal">
                        <i className="bi bi-plus-lg me-1"></i>Add Building
                    </button>
                </div>
                <div className="row g-2 align-items-center">
                    <div className="col-12 col-md-6">
                        <input type="text" className="form-control form-control-sm rounded-3"
                            placeholder="🔍 Search by name..."
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
                        <span className="small text-secondary">Showing {filteredBuildings.length} of {buildings.length}</span>
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
                                <th className="py-3 small">Total Floors</th>
                                <th className="py-3 small">Status</th>
                                <th className="py-3 small">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {filteredBuildings.length === 0 ?
                                <tr><td colSpan="5" className="text-center text-secondary py-4 small">No buildings found</td></tr>
                                :
                                filteredBuildings.map((b, index) => {
                                    return (
                                        <tr key={b.buildingId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{b.name}</td>
                                            <td className="small">{b.totalFloors}</td>
                                            <td>
                                                <span className={`badge ${b.isActive ? "bg-success" : "bg-danger"}`}
                                                    style={{ cursor: "pointer" }}
                                                    onClick={() => { toggleBuildingStatus(b.buildingId) }}>
                                                    <i className={`bi ${b.isActive ? "bi-toggle-on" : "bi-toggle-off"} me-1`}></i>
                                                    {b.isActive ? "Active" : "Inactive"}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-warning me-2"
                                                    data-bs-toggle="modal" data-bs-target="#editBuildingModal"
                                                    onClick={() => {
                                                        setEditId(b.buildingId)
                                                        resetEdit({ name: b.name, totalFloors: b.totalFloors })
                                                    }}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger"
                                                    data-bs-toggle="modal" data-bs-target="#deleteBuildingModal"
                                                    onClick={() => { setDeleteId(b.buildingId) }}>
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
            <div className="modal fade" id="addBuildingModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Add New Building</h6>
                            <button id="closeBuildingModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit(addBuilding)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Building Name</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${errors.name ? "is-invalid" : ""}`}
                                        placeholder="Enter building name"
                                        {...register("name", { required: { value: true, message: "Building name is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.name && <div className="invalid-feedback d-block">{errors.name.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Total Floors</label>
                                    <input type="number"
                                        className={`form-control form-control-sm rounded-3 ${errors.totalFloors ? "is-invalid" : ""}`}
                                        placeholder="Enter total floors"
                                        {...register("totalFloors", {
                                            required: { value: true, message: "Total floors is required" },
                                            min: { value: 1, message: "Minimum 1 floor" }
                                        })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.totalFloors && <div className="invalid-feedback d-block">{errors.totalFloors.message}</div>}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Add Building</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Modal */}
            <div className="modal fade" id="editBuildingModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Edit Building</h6>
                            <button id="closeEditBuildingModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEdit(updateBuilding)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Building Name</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${editErrors.name ? "is-invalid" : ""}`}
                                        {...registerEdit("name", { required: { value: true, message: "Building name is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {editErrors.name && <div className="invalid-feedback d-block">{editErrors.name.message}</div>}
                                    </div>
                                </div>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Total Floors</label>
                                    <input type="number"
                                        className={`form-control form-control-sm rounded-3 ${editErrors.totalFloors ? "is-invalid" : ""}`}
                                        {...registerEdit("totalFloors", {
                                            required: { value: true, message: "Total floors is required" },
                                            min: { value: 1, message: "Minimum 1 floor" }
                                        })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {editErrors.totalFloors && <div className="invalid-feedback d-block">{editErrors.totalFloors.message}</div>}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Update Building</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <div className="modal fade" id="deleteBuildingModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0">
                            <h6 className="modal-title fw-bold">Delete Building</h6>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <p className="small text-secondary mb-0">Are you sure? All flats inside will also be deleted.</p>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger btn-sm" data-bs-dismiss="modal"
                                onClick={() => { deleteBuilding() }}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}