import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export default function ManageFlats() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [flats, setFlats] = useState([])
    let [buildings, setBuildings] = useState([])
    let [deleteId, setDeleteId] = useState(null)
    let [editId, setEditId] = useState(null)
    let [parking, setParking] = useState([])
    let [editParking, setEditParking] = useState([])

    let { register, handleSubmit, formState: { errors }, reset } = useForm()
    let { register: registerEdit, handleSubmit: handleEdit, formState: { errors: editErrors }, reset: resetEdit } = useForm()

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
        fetchFlats()
        fetchBuildings()
    }, [])

    function addParking(parkingList, setList) {
        setList([...parkingList, { parkingType: "TWO_WHEELER", slotsCount: 1 }])
    }

    function removeParking(index, parkingList, setList) {
        setList(parkingList.filter((_, i) => i !== index))
    }

    function updateParking(index, field, value, parkingList, setList) {
        let updated = [...parkingList]
        updated[index][field] = field === "slotsCount" ? parseInt(value) : value
        setList(updated)
    }

    async function addFlat(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/admin/flat/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                ...formData,
                societyId: user.societyId,
                parking: parking
            })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            reset()
            setParking([])
            fetchFlats()
            document.getElementById("closeFlatModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function updateFlat(formData) {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/flat/update/${editId}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ ...formData, parking: editParking })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            fetchFlats()
            document.getElementById("closeEditFlatModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function deleteFlat() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/flat/delete/${deleteId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data === true) {
            toast.success(responseData.message)
            fetchFlats()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Manage Flats</h5>
                <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                    data-bs-toggle="modal" data-bs-target="#addFlatModal">
                    <i className="bi bi-plus-lg me-1"></i>Add Flat
                </button>
            </div>

            <div className="card border-0 shadow-sm rounded-4">
                <div className="table-responsive">
                    <table className="table table-hover table-borderless mb-0">
                        <thead style={{ background: "#f0f4ff" }}>
                            <tr>
                                <th className="py-3 ps-4 small">#</th>
                                <th className="py-3 small">Flat No</th>
                                <th className="py-3 small">Floor</th>
                                <th className="py-3 small">Type</th>
                                <th className="py-3 small">Building</th>
                                <th className="py-3 small">Parking</th>
                                <th className="py-3 small">Status</th>
                                <th className="py-3 small">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="table-group-divider">
                            {flats.length === 0 ?
                                <tr><td colSpan="8" className="text-center text-secondary py-4 small">No flats found</td></tr>
                                :
                                flats.map((f, index) => {
                                    return (
                                        <tr key={f.flatId}>
                                            <td className="ps-4 small">{index + 1}</td>
                                            <td className="small fw-semibold">{f.flatNumber}</td>
                                            <td className="small">{f.floor}</td>
                                            <td className="small">{f.flatType}</td>
                                            <td className="small">{buildings.find(b => b.buildingId === f.buildingId)?.name || f.buildingId}</td>
                                            <td className="small">
                                                {f.parking && f.parking.length > 0 ?
                                                    f.parking.map((p, i) => (
                                                        <span key={i} className="badge bg-secondary me-1">
                                                            {p.parkingType === "TWO_WHEELER" ? "2W" : "4W"} x{p.slotsCount}
                                                        </span>
                                                    ))
                                                    : <span className="text-muted">None</span>
                                                }
                                            </td>
                                            <td>
                                                <span className={`badge ${f.isVacant ? "bg-warning text-dark" : "bg-success"}`}>
                                                    {f.isVacant ? "Vacant" : "Occupied"}
                                                </span>
                                            </td>
                                            <td>
                                                <button className="btn btn-sm btn-warning me-2"
                                                    data-bs-toggle="modal" data-bs-target="#editFlatModal"
                                                    onClick={() => {
                                                        setEditId(f.flatId)
                                                        setEditParking(f.parking || [])
                                                        resetEdit({
                                                            flatNumber: f.flatNumber,
                                                            floor: f.floor,
                                                            flatType: f.flatType,
                                                            buildingId: String(f.buildingId)
                                                        })
                                                    }}>
                                                    <i className="bi bi-pencil"></i>
                                                </button>
                                                <button className="btn btn-sm btn-danger"
                                                    data-bs-toggle="modal" data-bs-target="#deleteFlatModal"
                                                    onClick={() => { setDeleteId(f.flatId) }}>
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

            {/* Add Flat Modal */}
            <div className="modal fade" id="addFlatModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Add New Flat</h6>
                            <button id="closeFlatModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit(addFlat)} noValidate>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Building</label>
                                        <select className={`form-select form-select-sm rounded-3 ${errors.buildingId ? "is-invalid" : ""}`}
                                            {...register("buildingId", { required: { value: true, message: "Please select building" } })}>
                                            <option value="">Select Building</option>
                                            {buildings.map(b => <option key={b.buildingId} value={b.buildingId}>{b.name}</option>)}
                                        </select>
                                        <div style={{ minHeight: "20px" }}>
                                            {errors.buildingId && <div className="invalid-feedback d-block">{errors.buildingId.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Flat Number</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${errors.flatNumber ? "is-invalid" : ""}`}
                                            placeholder="e.g. 101"
                                            {...register("flatNumber", { required: { value: true, message: "Flat number is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {errors.flatNumber && <div className="invalid-feedback d-block">{errors.flatNumber.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Floor</label>
                                        <input type="number"
                                            className={`form-control form-control-sm rounded-3 ${errors.floor ? "is-invalid" : ""}`}
                                            placeholder="Floor number"
                                            {...register("floor", {
                                                required: { value: true, message: "Floor is required" },
                                                min: { value: 0, message: "Minimum floor is 0" }
                                            })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {errors.floor && <div className="invalid-feedback d-block">{errors.floor.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
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
                                </div>

                                {/* Parking Section */}
                                <div className="mt-2">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label small fw-medium mb-0">Parking</label>
                                        <button type="button" className="btn btn-sm btn-outline-secondary"
                                            onClick={() => { addParking(parking, setParking) }}>
                                            <i className="bi bi-plus-lg me-1"></i>Add Parking
                                        </button>
                                    </div>
                                    {parking.map((p, i) => {
                                        return (
                                            <div key={i} className="d-flex gap-2 align-items-center mb-2">
                                                <select className="form-select form-select-sm rounded-3"
                                                    value={p.parkingType}
                                                    onChange={(e) => { updateParking(i, "parkingType", e.target.value, parking, setParking) }}>
                                                    <option value="TWO_WHEELER">Two Wheeler</option>
                                                    <option value="FOUR_WHEELER">Four Wheeler</option>
                                                </select>
                                                <input type="number" className="form-control form-control-sm rounded-3"
                                                    value={p.slotsCount} min="1"
                                                    onChange={(e) => { updateParking(i, "slotsCount", e.target.value, parking, setParking) }}
                                                    style={{ width: "80px" }}
                                                />
                                                <button type="button" className="btn btn-sm btn-danger"
                                                    onClick={() => { removeParking(i, parking, setParking) }}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Add Flat</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit Flat Modal */}
            <div className="modal fade" id="editFlatModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered modal-lg">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Edit Flat</h6>
                            <button id="closeEditFlatModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleEdit(updateFlat)} noValidate>
                                <div className="row g-2">
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Building</label>
                                        <select className={`form-select form-select-sm rounded-3 ${editErrors.buildingId ? "is-invalid" : ""}`}
                                            {...registerEdit("buildingId", { required: { value: true, message: "Please select building" } })}>
                                            <option value="">Select Building</option>
                                            {buildings.map(b => <option key={b.buildingId} value={b.buildingId}>{b.name}</option>)}
                                        </select>
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.buildingId && <div className="invalid-feedback d-block">{editErrors.buildingId.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Flat Number</label>
                                        <input type="text"
                                            className={`form-control form-control-sm rounded-3 ${editErrors.flatNumber ? "is-invalid" : ""}`}
                                            {...registerEdit("flatNumber", { required: { value: true, message: "Flat number is required" } })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.flatNumber && <div className="invalid-feedback d-block">{editErrors.flatNumber.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Floor</label>
                                        <input type="number"
                                            className={`form-control form-control-sm rounded-3 ${editErrors.floor ? "is-invalid" : ""}`}
                                            {...registerEdit("floor", {
                                                required: { value: true, message: "Floor is required" },
                                                min: { value: 0, message: "Minimum floor is 0" }
                                            })}
                                        />
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.floor && <div className="invalid-feedback d-block">{editErrors.floor.message}</div>}
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label small fw-medium">Flat Type</label>
                                        <select className={`form-select form-select-sm rounded-3 ${editErrors.flatType ? "is-invalid" : ""}`}
                                            {...registerEdit("flatType", { required: { value: true, message: "Please select flat type" } })}>
                                            <option value="">Select Type</option>
                                            <option value="BHK1">1 BHK</option>
                                            <option value="BHK2">2 BHK</option>
                                            <option value="BHK3">3 BHK</option>
                                        </select>
                                        <div style={{ minHeight: "20px" }}>
                                            {editErrors.flatType && <div className="invalid-feedback d-block">{editErrors.flatType.message}</div>}
                                        </div>
                                    </div>
                                </div>

                                {/* Edit Parking */}
                                <div className="mt-2">
                                    <div className="d-flex justify-content-between align-items-center mb-2">
                                        <label className="form-label small fw-medium mb-0">Parking</label>
                                        <button type="button" className="btn btn-sm btn-outline-secondary"
                                            onClick={() => { addParking(editParking, setEditParking) }}>
                                            <i className="bi bi-plus-lg me-1"></i>Add Parking
                                        </button>
                                    </div>
                                    {editParking.map((p, i) => {
                                        return (
                                            <div key={i} className="d-flex gap-2 align-items-center mb-2">
                                                <select className="form-select form-select-sm rounded-3"
                                                    value={p.parkingType}
                                                    onChange={(e) => { updateParking(i, "parkingType", e.target.value, editParking, setEditParking) }}>
                                                    <option value="TWO_WHEELER">Two Wheeler</option>
                                                    <option value="FOUR_WHEELER">Four Wheeler</option>
                                                </select>
                                                <input type="number" className="form-control form-control-sm rounded-3"
                                                    value={p.slotsCount} min="1"
                                                    onChange={(e) => { updateParking(i, "slotsCount", e.target.value, editParking, setEditParking) }}
                                                    style={{ width: "80px" }}
                                                />
                                                <button type="button" className="btn btn-sm btn-danger"
                                                    onClick={() => { removeParking(i, editParking, setEditParking) }}>
                                                    <i className="bi bi-trash"></i>
                                                </button>
                                            </div>
                                        )
                                    })}
                                </div>

                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Update Flat</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Modal */}
            <div className="modal fade" id="deleteFlatModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0">
                            <h6 className="modal-title fw-bold">Delete Flat</h6>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <p className="small text-secondary mb-0">Are you sure you want to delete this flat?</p>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger btn-sm" data-bs-dismiss="modal"
                                onClick={() => { deleteFlat() }}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}