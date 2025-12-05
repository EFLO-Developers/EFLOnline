import React, { useState, useEffect, useCallback } from 'react';
import { useAlert } from '../../context/AlertContext';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';

/**
 * PlayerUpdateDetail displays the details of a single player update,
 * including point task submissions and attribute updates.
 * Allows deletion of point task submissions.
 * @param {object} props - expects props.Update (player update object), props.EditMode (optional)
 */
const PlayerUpdateDetail = ({ Update, EditMode }) => {
    const { addAlert } = useAlert();

    // Local state for the update object (to allow local mutation)
    const [update, setUpdate] = useState(Update);
    // Edit mode state
    const [editMode, setEditMode] = useState(EditMode === "true");
    // Claimed capped points for this update
    const [claimedCapped, setClaimedCapped] = useState(0);

    // Delete a submitted point task, update local state and call API
    const deleteSubmittedPointTask = useCallback((pointTaskSubmissionId) => {
        // Remove from local state
        setUpdate(prevUpdate => ({
            ...prevUpdate,
            pointTaskSubmissions: prevUpdate.pointTaskSubmissions.filter(
                task => task.PointTaskSubmissionId !== pointTaskSubmissionId
            )
        }));

        // Remove from backend
        PlayerServiceAgent.DeletePointTaskSubmission(pointTaskSubmissionId)
            .then(res => {
                addAlert('info', `Deleted PT with id ${pointTaskSubmissionId}`);
            })
            .catch(() => {
                addAlert('danger', `Could not Delete PT with id ${pointTaskSubmissionId}`);
            });
    }, [addAlert]);

    // Calculate week start/end dates for display
    const weekEndingDate = new Date(update.WeekEnding);
    const weekStartingDate = new Date(weekEndingDate);
    weekStartingDate.setDate(weekStartingDate.getDate() - 6);

    const formattedEndDate = `${weekEndingDate.getMonth() + 1}/${weekEndingDate.getDate()}/${weekEndingDate.getFullYear()}`;
    const formattedStartDate = `${weekStartingDate.getMonth() + 1}/${weekStartingDate.getDate()}/${weekStartingDate.getFullYear()}`;

    // Calculate claimed capped points when update changes
    useEffect(() => {
        const claimed = update.pointTaskSubmissions
            .filter(task => task.IsUncapped === 0 && task.RejectedDate == null)
            .reduce((sum, task) => sum + task.ClaimedPoints, 0);
        setClaimedCapped(claimed);
    }, [update]);

    // Sync edit mode with prop
    useEffect(() => {
        setEditMode(EditMode === "true");
    }, [EditMode]);

    // Render nothing if no updates to show
    if (!update || (!update.pointTaskSubmissions.length && !update.attributeUpdates.length)) {
        return null;
    }

    return (
        <>
            <div className="accordion-item">
                <h6 className="accordion-header text-sm fw-bolder" id={`heading-${update.PlayerUpdateId}`}>
                    <button
                        className="accordion-button text-sm w-100 fw-bold"
                        type="button"
                        data-bs-toggle="collapse"
                        data-bs-target={`#collapse-${update.PlayerUpdateId}`}
                        aria-expanded="true"
                        aria-controls={`collapse-${update.PlayerUpdateId}`}
                    >
                        {formattedStartDate} - {formattedEndDate}
                    </button>
                </h6>

                <div
                    id={`collapse-${update.PlayerUpdateId}`}
                    className="accordion-collapse collapse"
                    aria-labelledby={`heading-${update.PlayerUpdateId}`}
                    data-bs-parent="#playerUpdateAccordion"
                >
                    <div className="accordion-body">
                        {/* Point Task Submissions Table */}
                        {update.pointTaskSubmissions && update.pointTaskSubmissions.length > 0 && (
                            <>
                                <h6 className="mini-heading">Point Task Submissions</h6>
                                
                                {/* Summary of capped vs uncapped claimed points */}
                                <div className="mb-2">
                                    <span className="badge bg-primary me-2">
                                       Total TPE: {update.pointTaskSubmissions.reduce((sum, task) => sum + task.ClaimedPoints, 0)} TPE
                                    </span>
                                    <span className="badge bg-primary me-2">
                                        Capped: {update.pointTaskSubmissions.filter(task => task.IsUncapped === 0).reduce((sum, task) => sum + task.ClaimedPoints, 0)} TPE
                                    </span>
                                    <span className="badge bg-secondary">
                                        Uncapped: {update.pointTaskSubmissions.filter(task => task.IsUncapped === 1).reduce((sum, task) => sum + task.ClaimedPoints, 0)} TPE
                                    </span>
                                </div>
                                

                                <table className="table table-flush text-sm mb-2">
                                    <thead>
                                        <tr>
                                            <th>Task</th>
                                            <th colSpan="2" className="col">TPE</th>
                                            <th>Type</th>
                                            <th></th>
                                            <th className="col text-center">Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {update.pointTaskSubmissions.map((task, index) => (
                                            <React.Fragment key={task.PointTaskSubmissionId}>
                                                <tr>
                                                    <td className="col-2">
                                                        {task.RejectedDate ? (<span>({task.PointTaskSubmissionId})</span>) : null} {task.Name}
                                                    </td>
                                                    <td className="col" colSpan="2">{task.ClaimedPoints}</td>
                                                    <td className="col" colSpan="2">{task.IsUncapped ? 'Uncapped' : 'Capped'}</td>
                                                    <td>
                                                        {task.URL ? (
                                                            <a href={task.URL} target="_blank" rel="noopener noreferrer">Link</a>
                                                        ) : null}
                                                    </td>
                                                    <td className="col-3 text-center">
                                                        {task.RejectedDate ? (
                                                            <svg width="16" height="16" fill="red" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                                            </svg>
                                                        ) : null}
                                                        {!task.RejectedDate && task.ApprovedDate ? (
                                                            <svg width="16" height="16" fill="#48af46" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                                            </svg>
                                                        ) : null}
                                                        {!task.RejectedDate && !task.ApprovedDate ? (
                                                            <span className="mini-heading">Pending</span>
                                                        ) : null}
                                                    </td>
                                                    <td className="col-1">
                                                        {(task.ApprovedDate == null || task.RejectedDate != null) && (
                                                            <a
                                                                className="svg-btn"
                                                                onClick={() => deleteSubmittedPointTask(task.PointTaskSubmissionId)}
                                                                style={{ cursor: 'pointer' }}
                                                            >
                                                                <svg width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                                                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                                                                </svg>
                                                            </a>
                                                        )}
                                                    </td>
                                                </tr>
                                                {task.Notes ? (
                                                    <tr style={{ background: "#00000005" }}>
                                                        <td className="text-bold">Notes</td>
                                                        <td colSpan="5">{task.Notes}</td>
                                                    </tr>
                                                ) : null}
                                                {task.RejectedDate ? (
                                                    <tr style={{ background: "#ff000010" }}>
                                                        <td className="text-bold">Reject Reason:</td>
                                                        <td colSpan="5">{task.RejectReason}</td>
                                                    </tr>
                                                ) : null}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}

                        {/* Attribute Updates Table */}
                        {update.attributeUpdates && update.attributeUpdates.length > 0 && (
                            <>
                                <div className="m-2 mt-4 mb-4" style={{ borderTop: "1px solid #00000040" }}></div>
                                <h6 className="mini-heading">Attribute Updates</h6>
                                <table className="table table-flush text-sm mb-2">
                                    <thead>
                                        <tr>
                                            <th>Code</th>
                                            <th>Change</th>
                                            <th>Cost</th>
                                            <th className="col text-center">Status</th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {update.attributeUpdates.map((attr, index) => (
                                            <React.Fragment key={attr.AttributeUpdateId || index}>
                                                <tr>
                                                    <td className="col-2">{attr.Code}</td>
                                                    <td className="col">{attr.ValueFrom} {'->'} {attr.ValueTo}</td>
                                                    <td className="col">{attr.PointCost}</td>
                                                    <td className="col-3 text-center">
                                                        {attr.RejectedDate ? (
                                                            <svg width="16" height="16" fill="red" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                                            </svg>
                                                        ) : null}
                                                        {!attr.RejectedDate && attr.ApprovedDate ? (
                                                            <svg width="16" height="16" fill="#48af46" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                                            </svg>
                                                        ) : null}
                                                        {!attr.RejectedDate && !attr.ApprovedDate ? (
                                                            <span className="mini-heading">Pending</span>
                                                        ) : null}
                                                    </td>
                                                    <td className="col-1"></td>
                                                </tr>
                                                {attr.RejectedDate ? (
                                                    <tr style={{ background: "#ff000010" }}>
                                                        <td className="text-bold">Reject Reason:</td>
                                                        <td colSpan="5">{attr.RejectReason}</td>
                                                    </tr>
                                                ) : null}
                                            </React.Fragment>
                                        ))}
                                    </tbody>
                                </table>
                            </>
                        )}
                    </div>
                </div>
            </div>
        </>
    );
};

export default PlayerUpdateDetail;