import React, { useState, useEffect } from 'react'

export default function MyNotices() {
    let user = JSON.parse(localStorage.getItem("user"))
    let token = localStorage.getItem("token")
    let [notices, setNotices] = useState([])

    async function fetchNotices() {
        let responseObject = await fetch(`http://localhost:8080/api/v1/resident/notices/${user.userId}`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        let responseData = await responseObject.json()
        if (responseData.data) setNotices(responseData.data)
    }

    useEffect(() => {
        fetchNotices()
    }, [])

    return (
        <div>
            <h5 className="fw-bold mb-4">Notices</h5>

            <div className="row g-3">
                {notices.length === 0 ?
                    <div className="col-12">
                        <div className="card border-0 shadow-sm rounded-4 p-4 text-center text-secondary small">
                            No notices found
                        </div>
                    </div>
                    :
                    notices.map((n) => {
                        return (
                            <div className="col-12" key={n.noticeId}>
                                <div className="card border-0 shadow-sm rounded-4 p-3">
                                    <div className="d-flex align-items-start gap-3">
                                        <div className="rounded-3 p-2" style={{ background: "#f0f4ff" }}>
                                            <i className="bi bi-megaphone fs-5" style={{ color: "#272757" }}></i>
                                        </div>
                                        <div>
                                            <h6 className="fw-semibold mb-1">{n.title}</h6>
                                            <p className="small text-secondary mb-1">{n.description}</p>
                                            <p className="small text-muted mb-0">
                                                <i className="bi bi-calendar me-1"></i>{n.postedAt}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                }
            </div>
        </div>
    )
}