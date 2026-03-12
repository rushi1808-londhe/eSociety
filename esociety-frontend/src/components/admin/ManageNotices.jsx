import React, { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { toast } from 'react-toastify'

export default function ManageNotices() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [notices, setNotices] = useState([])
    let [deleteId, setDeleteId] = useState(null)

    let { register, handleSubmit, formState: { errors }, reset } = useForm()

    async function fetchNotices() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/notice/all/${user.societyId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setNotices(responseData.data)
    }

    useEffect(() => {
        fetchNotices()
    }, [])

    async function addNotice(formData) {
        let responseObject = await fetch("http://localhost:8080/api/v1/admin/notice/add", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                ...formData,
                societyId: user.societyId,
                adminId: user.userId
            })
        })
        let responseData = await responseObject.json()
        if (responseObject.ok) {
            toast.success(responseData.message)
            reset()
            fetchNotices()
            document.getElementById("closeNoticeModal").click()
        } else {
            toast.error(responseData.message)
        }
    }

    async function deleteNotice() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/admin/notice/delete/${deleteId}`, {
            method: "DELETE",
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data === true) {
            toast.success(responseData.message)
            fetchNotices()
        } else {
            toast.error(responseData.message)
        }
    }

    return (
        <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
                <h5 className="fw-bold mb-0">Manage Notices</h5>
                <button className="btn btn-sm text-white" style={{ background: "#272757" }}
                    data-bs-toggle="modal" data-bs-target="#addNoticeModal">
                    <i className="bi bi-plus-lg me-1"></i>Post Notice
                </button>
            </div>

            <div className="row g-3">
                {notices.length === 0 ?
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-secondary small">
                            No notices posted yet
                        </div>
                    </div>
                    :
                    notices.map((n) => {
                        return (
                            <div className="col-12 col-md-6" key={n.noticeId}>
                                <div className="card border-0 shadow-sm rounded-4 p-3">
                                    <div className="d-flex justify-content-between align-items-start">
                                        <div>
                                            <h6 className="fw-semibold mb-1">{n.title}</h6>
                                            <p className="small text-secondary mb-1">{n.description}</p>
                                            <p className="small text-muted mb-0">
                                                <i className="bi bi-calendar me-1"></i>{n.postedAt}
                                            </p>
                                        </div>
                                        <button className="btn btn-sm btn-danger ms-2"
                                            data-bs-toggle="modal" data-bs-target="#deleteNoticeModal"
                                            onClick={() => { setDeleteId(n.noticeId) }}>
                                            <i className="bi bi-trash"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>

            {/* Add Notice Modal */}
            <div className="modal fade" id="addNoticeModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0 pb-0">
                            <h6 className="modal-title fw-bold">Post New Notice</h6>
                            <button id="closeNoticeModal" type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <form onSubmit={handleSubmit(addNotice)} noValidate>
                                <div className="mb-2">
                                    <label className="form-label small fw-medium">Title</label>
                                    <input type="text"
                                        className={`form-control form-control-sm rounded-3 ${errors.title ? "is-invalid" : ""}`}
                                        placeholder="Notice title"
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
                                        placeholder="Notice description"
                                        rows="3"
                                        {...register("description", { required: { value: true, message: "Description is required" } })}
                                    />
                                    <div style={{ minHeight: "20px" }}>
                                        {errors.description && <div className="invalid-feedback d-block">{errors.description.message}</div>}
                                    </div>
                                </div>
                                <div className="modal-footer border-0 px-0 pb-0">
                                    <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                                    <button type="submit" className="btn btn-sm text-white" style={{ background: "#272757" }}>Post Notice</button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            </div>

            {/* Delete Notice Modal */}
            <div className="modal fade" id="deleteNoticeModal" data-bs-backdrop="static" data-bs-keyboard="false" tabIndex="-1">
                <div className="modal-dialog modal-dialog-centered">
                    <div className="modal-content border-0 rounded-4">
                        <div className="modal-header border-0">
                            <h6 className="modal-title fw-bold">Delete Notice</h6>
                            <button type="button" className="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div className="modal-body">
                            <p className="small text-secondary mb-0">Are you sure you want to delete this notice?</p>
                        </div>
                        <div className="modal-footer border-0">
                            <button type="button" className="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancel</button>
                            <button type="button" className="btn btn-danger btn-sm" data-bs-dismiss="modal"
                                onClick={() => { deleteNotice() }}>Delete</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}