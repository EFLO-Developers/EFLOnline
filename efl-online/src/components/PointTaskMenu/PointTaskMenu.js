import React, { useState, useEffect, useCallback } from 'react';
import AuthorizedTemplate from "../../layout/PageTemplates/Authorized";
import MainTemplate from "../../layout/PageTemplates/Main/main";
import Helmet from 'react-helmet';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import usePersistedState from '../../serviceAgents/usePersistedState';
import flatpickr from 'flatpickr';
import bootstrap from 'bootstrap';
import Alerts from '../Alerts/alerts';
import { useAlert } from '../../context/AlertContext';
import PlayerUpdateDetail from '../PlayerUpdateHistory/PlayerUpdateDetail';
import PlayerUpdateHistory from '../PlayerUpdateHistory/PlayerUpdateHistory';


/**
 * PointTaskMenu allows users to submit point tasks for their player(s),
 * view pending tasks, and see player update history.
 * @param {object} props - expects props.Player (player object)
 */
const PointTaskMenu = ({ Player }) => {
    const { addAlert } = useAlert();

    // Persisted state for user players and active players
    const [userPlayers, setUserPlayers] = usePersistedState('ActiveUserPlayers', null);
    const [offPlayer, setOffPlayer] = usePersistedState('ActiveOffPlayer', null);
    const [defPlayer, setDefPlayer] = usePersistedState('ActiveDefPlayer', null);

    // Local state
    const [player, setPlayer] = useState(Player);
    const [loading, setLoading] = useState(true);

    const [pendingTasks, setPendingTasks] = useState([]);
    const [weeklyCapClaim, setWeeklyCapClaim] = useState(0);
    const [nextSaturday, setNextSaturday] = useState(null);

    const [pointTaskTypes, setPointTaskTypes] = useState([]);
    const [weeklyPointTaskTypes, setWeeklyPointTaskTypes] = useState([]);
    const [allPlayersCheck, setAllPlayersCheck] = useState(true);
    const [pendingPointTask, setPendingPointTask] = useState({});
    const [playerUpdateHistory, setPlayerUpdateHistory] = useState([]);

    const WeeklyCap = 12;

    // Fetch point task types and player update history on mount
    useEffect(() => {
        PlayerServiceAgent.GetPointTaskTypes()
            .then(res => {
                if (res) {
                    setPointTaskTypes(res);
                    setWeeklyPointTaskTypes(
                        res.filter(
                            pointTaskType =>
                                !pointTaskType.Name.includes('Admin') &&
                                (pointTaskType.Frequency === 'WEEKLY' || pointTaskType.Frequency === 'UNLIMITED')
                        )
                    );
                }
            })
            .catch(error => {
                addAlert('danger', `${error} : Could not get PointTask Types`);
            });

        // Calculate next Saturday for default week ending
        const getNextSaturday = () => {
            const today = new Date();
            const nextSaturday = new Date();
            nextSaturday.setDate(today.getDate() + ((6 - today.getDay() + 7) % 7));
            return nextSaturday.toISOString().split('T')[0];
        };
        setNextSaturday(getNextSaturday());

        PlayerServiceAgent.GetPlayerUpdateHistory(player.PlayerId)
            .then(res => {
                if (res) setPlayerUpdateHistory(res);
            })
            .catch(error => {
                addAlert('danger', `${error} : Could not get Player update history`);
            });
    }, [player.PlayerId, addAlert]);

    // Calculate weekly cap claim when pendingTasks changes
    useEffect(() => {
        const claim = pendingTasks
            .filter(task => !task.IsUncapped)
            .reduce((sum, task) => sum + (task.ClaimedPoints || 0), 0);
        setWeeklyCapClaim(claim);
    }, [pendingTasks]);

    // Initialize flatpickr and pending point task when dependencies change
    useEffect(() => {
        if (document.querySelector('.datepicker')) {
            flatpickr('.datepicker', {
                enable: [
                    function (date) {
                        return date.getDay() === 6; // Only Saturdays
                    }
                ],
                onChange: handleDateChange
            });
        }
        initPendingPointTask();
    }, [nextSaturday, pointTaskTypes, weeklyPointTaskTypes]);

    // Initialize a new pending point task with defaults
    const initPendingPointTask = useCallback(() => {
        if (weeklyPointTaskTypes.length > 0) {
            const firstPointTaskType = weeklyPointTaskTypes[0];
            setPendingPointTask({
                PointTaskSubmissionId: null,
                PointTaskTypeId: firstPointTaskType.PointTaskTypeId,
                PlayerId: null,
                PointTaskName: firstPointTaskType.Name,
                ClaimedPoints: firstPointTaskType.DefaultPoints,
                WeekEnding: nextSaturday,
                URL: '',
                Notes: ''
            });
        }
    }, [weeklyPointTaskTypes, nextSaturday]);

    // Handle retiring a player
    const handleRetirePlayer = () => {
        const playerId = player.PlayerId;
        PlayerServiceAgent.RetirePlayer(player.PlayerId)
            .then(res => {
                if (res) {
                    setPlayer(res);
                    if (offPlayer && res.PlayerId === offPlayer.PlayerId) {
                        setOffPlayer(null);
                        setUserPlayers(null);
                    } else if (defPlayer && res.PlayerId === defPlayer.PlayerId) {
                        setDefPlayer(null);
                        setUserPlayers(null);
                    }
                    window.location.href = `/player/${playerId}/profile`;
                }
            })
            .catch(error => {
                addAlert('danger', `Could not retire player: ${error}`);
            })
            .finally(() => {
                setLoading(false);
            });
    };

    // Add a pending task to the list
    const addPendingTask = () => {
        if (!validatePendingPointTask()) return;

        let updatedPendingPointTask = { ...pendingPointTask };
        if (!allPlayersCheck) {
            updatedPendingPointTask = {
                ...updatedPendingPointTask,
                PlayerId: player.PlayerId,
                PlayerName: player.FirstName + ' ' + player.LastName
            };
        }
        setPendingTasks(prevState => [...prevState, updatedPendingPointTask]);
        initPendingPointTask();
    };

    // Remove a pending task by index
    const removePendingTask = index => {
        setPendingTasks(prevState => prevState.filter((_, i) => i !== index));
    };

    // Validate the pending point task before adding
    const validatePendingPointTask = () => {
        const { PointTaskTypeId, ClaimedPoints, URL, Notes } = pendingPointTask;
        const selectedTask = pointTaskTypes.find(task => task.PointTaskTypeId == PointTaskTypeId);

        if (!PointTaskTypeId) {
            addAlert('danger', 'Please select a point task type.');
            return false;
        }
        if (ClaimedPoints <= 0) {
            addAlert('danger', 'Claimed points must be greater than 0.');
            return false;
        }
        if (selectedTask.RequireURL && (!URL || URL.trim() === '')) {
            addAlert('danger', 'URL is required for this point task type.');
            return false;
        }
        if (selectedTask.RequireNote && (!Notes || Notes.trim() === '')) {
            addAlert('danger', 'Note is required for this point task type.');
            return false;
        }
        return true;
    };

    // Handle input changes for the form
    const handleInputChange = e => {
        const { id, value, type, checked } = e.target;

        if (id === 'AllPlayersCheck') {
            setAllPlayersCheck(checked);
            return;
        }

        if (id === 'PointTaskTypeId') {
            const selectedPointTaskType = pointTaskTypes.find(
                pointTaskType => pointTaskType.PointTaskTypeId == value
            );
            if (selectedPointTaskType) {
                setPendingPointTask(prevState => ({
                    ...prevState,
                    PointTaskTypeId: value,
                    PointTaskName: selectedPointTaskType.Name,
                    ClaimedPoints: selectedPointTaskType.DefaultPoints
                }));
            }
        }
        setPendingPointTask(prevState => ({
            ...prevState,
            [id]: type === 'checkbox' ? checked : value
        }));
    };

    // Handle date change for week ending
    const handleDateChange = (selectedDates, dateStr) => {
        setPendingPointTask(prevState => ({
            ...prevState,
            WeekEnding: dateStr
        }));
    };

    // Submit all pending tasks
    const handleSubmit = () => {
        if (pendingTasks.length > 0) {
            PlayerServiceAgent.UpsertPointTaskSubmission(pendingTasks)
                .then(res => {
                    if (Array.isArray(res) && res.some(item => item.error)) {
                        const errorItem = res.find(item => item.error);
                        addAlert('danger', errorItem.error);
                    } else {
                        // Optionally reload or update state here
                    }
                })
                .catch(error => {
                    addAlert('danger', `${error} : Could not save all pending tasks`);
                });
        }
    };

    // Submit Activity Check
    const handleActivityCheckSubmit = () => {
        const ac_pts = {
            PointTaskSubmissionId: null,
            UserId: player.UserId,
            PointTaskTypeId: 11,
            PlayerId: null,
            ClaimedPoints: 3,
            URL: '',
            Notes: null,
            WeekEnding: nextSaturday
        };

        PlayerServiceAgent.UpsertPointTaskSubmission([ac_pts])
            .then(res => {
                const errors = [];
                Object.values(res).forEach(child => {
                    if (child && child.error) errors.push(child.error);
                });
                if (errors.length > 0) {
                    addAlert('danger', `Could not Save Activity Check : ${errors.join(', ')} `);
                } else {
                    window.location.reload();
                }
            })
            .catch(error => {
                addAlert('danger', `${error} : Could not Save Activity Check`);
            });
    };

    // Submit Training Camp
    const handleTrainingCampSubmit = () => {
        const tc_pts = {
            PointTaskSubmissionId: null,
            UserId: player.UserId,
            PointTaskTypeId: 14,
            PlayerId: null,
            ClaimedPoints: 15,
            URL: '',
            Notes: null,
            WeekEnding: nextSaturday
        };

        PlayerServiceAgent.UpsertPointTaskSubmission([tc_pts])
            .then(res => {
                const errors = [];
                Object.values(res).forEach(child => {
                    if (child && child.error) errors.push(child.error);
                });
                if (errors.length > 0) {
                    addAlert('danger', `Could not Save Training Camp : ${errors.join(', ')} `);
                } else {
                    window.location.reload();
                }
            })
            .catch(error => {
                addAlert('danger', `${error} : Could not Save Training Camp`);
            });
    };

    // Main render
    return (
        <div className="card pb-4">
            <div className="card-header pb-0 p-3">
                <div className="d-flex justify-content-between">
                    <h6 className="mb-2">Point Task Controls</h6>
                </div>

                {/* Controls for submitting point tasks */}
                <div>
                    <h6 className="mt-2">WEEKLY</h6>
                    <button type="button" className="btn btn-primary btn-lg w-100 mb-2" data-bs-toggle="modal" data-bs-target="#modal_manual_pointtask">
                        Manual Point Task
                    </button>
                    <button type="button" className="btn btn-primary btn-lg w-100 mb-2" onClick={handleActivityCheckSubmit}
                        disabled={player?.tpe?.Claimed_Weekly_ActivityCheck === 1}>
                        Activity Check
                    </button>
                    <h6 className="mt-2">SEASONAL</h6>
                    <button
                        type="button"
                        className="btn btn-primary btn-lg w-100 mb-2"
                        onClick={handleTrainingCampSubmit}
                        disabled={player?.tpe?.Claimed_Seasonal_TrainingCamp === 1}
                    >
                        Training Camp
                    </button>
                    <button type="button" className="btn btn-primary btn-lg w-100 mb-2 d-none" data-bs-toggle="modal" data-bs-target="#modal_manual_pointtask">
                        Giveaways
                    </button>
                    <h6 className="mt-2">CAREER</h6>
                    <button type="button" className="btn btn-primary btn-lg w-100 mb-2" data-bs-toggle="modal" data-bs-target="#modal_update_history">
                        View Updates
                    </button>
                    <a href={`/player/${player.PlayerId}/profile`} className="btn btn-primary btn-lg w-100 mb-2">
                        View Player Profile
                    </a>
                    <button type="button" className="btn btn-danger btn-lg w-100 mb-2" data-bs-toggle="modal" data-bs-target="#modal_retire">
                        Retire Player
                    </button>
                </div>
            </div>

            {/* MANUAL POINT TASK MODAL */}
            <div className="modal modal-lg fade" id="modal_manual_pointtask" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Submit a Point Task</h5>
                            <button type="button" className="btn-close text-dark p-4 pt-0 pb-0" data-bs-dismiss="modal" aria-label="Close">
                                <svg width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            {/* New Point Task Form */}
                            <div className="pb-2">
                                <div className="mb-4">
                                    <span className="badge bg-primary m-2 mt-0 mb-0 d-inline-block float-end">{weeklyCapClaim}/{WeeklyCap}</span>
                                    <h6 className="text-sm" style={{ opacity: ".6" }}>NEW POINT TASK</h6>
                                </div>
                                <div className="row mt-4">
                                    <div className="col-4 mb-2">
                                        <label>Point Task Type</label>
                                        <select className="form-select mb-2"
                                            id="PointTaskTypeId"
                                            value={pendingPointTask.PointTaskTypeId || ''}
                                            onChange={handleInputChange}>
                                            {pointTaskTypes && weeklyPointTaskTypes.map((pointTaskType, index) => (
                                                <option key={index} value={pointTaskType.PointTaskTypeId}>
                                                    {pointTaskType.Name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="col-4 mb-2">
                                        <label>Points Earned</label>
                                        <input type="number" className="form-control mb-2" placeholder="Points Earned"
                                            id="ClaimedPoints"
                                            value={pendingPointTask.ClaimedPoints || ''}
                                            onChange={handleInputChange} />
                                    </div>
                                    <div className="col-4">
                                        <label>Week Ending</label>
                                        <input className="form-control datepicker" placeholder="Please select date" type="date"
                                            id="WeekEnding"
                                            value={pendingPointTask.WeekEnding || ''}
                                            onChange={handleInputChange}
                                        />
                                    </div>
                                </div>
                                <label>Link</label>
                                <input type="text" className="form-control mb-2" placeholder="Enter URL"
                                    id="URL"
                                    value={pendingPointTask.URL || ''}
                                    onChange={handleInputChange} />
                                <label>Notes</label>
                                <input type="text" className="form-control mb-2" placeholder="Enter Notes"
                                    id="Notes"
                                    value={pendingPointTask.Notes || ''}
                                    onChange={handleInputChange} />
                                <div className="d-flex justify-content-end">
                                    <div className="form-check form-switch mt-3 m-5 mb-0">
                                        <input className="form-check-input" type="checkbox" role="switch"
                                            id="AllPlayersCheck"
                                            checked={allPlayersCheck}
                                            onChange={handleInputChange} />
                                        <label className="form-check-label" htmlFor="AllPlayersCheck">
                                            Submit for active players
                                        </label>
                                    </div>
                                    <button type="button" className="btn btn-success mt-2" onClick={addPendingTask}>
                                        Add to Pending Tasks
                                    </button>
                                </div>
                            </div>
                            {/* Pending Tasks Table */}
                            <div className="pt-4" style={{ borderTop: '1px solid #00000040' }}>
                                <h6 className="text-sm" style={{ opacity: ".6" }}>PENDING TASKS</h6>
                                <table className="table table-flush text-sm" id="datatable-search" style={{ minHeight: '50px' }}>
                                    <thead className="thead-light">
                                        <tr>
                                            <th>Player</th>
                                            <th>Type</th>
                                            <th>TPE</th>
                                            <th>Week Ending</th>
                                            <th></th>
                                            <th></th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {pendingTasks && pendingTasks.length > 0 ? (
                                            pendingTasks.map((pendingTask, index) => (
                                                <React.Fragment key={index}>
                                                    <tr>
                                                        <td>{pendingTask.PlayerId ? pendingTask.PlayerName : "All"}</td>
                                                        <td className="p-4 text-bold">{pendingTask.PointTaskName}</td>
                                                        <td>{pendingTask.ClaimedPoints}</td>
                                                        <td>{pendingTask.WeekEnding}</td>
                                                        <td>{pendingTask.URL && pendingTask.URL !== "" ? (<a href={pendingTask.URL}>Link</a>) : null}</td>
                                                        <td>
                                                            <a onClick={() => removePendingTask(index)} style={{ cursor: 'pointer' }}>
                                                                <svg width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                                                    <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                                                                </svg>
                                                            </a>
                                                        </td>
                                                    </tr>
                                                    {pendingTask.Notes && (
                                                        <tr style={{ background: "#00000005" }}>
                                                            <td className="p-4 text-bold">Notes</td>
                                                            <td colSpan="4">{pendingTask.Notes}</td>
                                                        </tr>
                                                    )}
                                                </React.Fragment>
                                            ))
                                        ) : (
                                            <tr>
                                                <td colSpan="5" className="p-4 text-center">No Pending Tasks</td>
                                            </tr>
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-success" data-bs-dismiss="modal" onClick={handleSubmit}>
                                Submit
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* PLAYER UPDATE HISTORY MODAL */}
            <div className="modal modal-lg fade" id="modal_update_history" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Player Update History</h5>
                            <button type="button" className="btn-close text-dark p-4 pt-0 pb-0" data-bs-dismiss="modal" aria-label="Close">
                                <svg width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body updateHistory">
                            <PlayerUpdateHistory Player={player} EditMode="true" />
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                        </div>
                    </div>
                </div>
            </div>

            {/* RETIRE MODAL */}
            <div className="modal fade" id="modal_retire" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Retire Player?</h5>
                            <button type="button" className="btn-close text-dark p-4 pt-0 pb-0" data-bs-dismiss="modal" aria-label="Close">
                                <svg width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            Are you absolutely sure you want to retire this player?
                            <br />
                            <br />
                            This action cannot be undone.
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={handleRetirePlayer}>
                                Retire
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PointTaskMenu;