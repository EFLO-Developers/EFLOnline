
import React, { useState, useEffect } from 'react';
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


const PointTaskMenu = (props) => {
    
    const { addAlert } = useAlert();
    const [userPlayers, SetUserPlayers] = usePersistedState('ActiveUserPlayers', null);
    const [offPlayer, SetOffPlayer] = usePersistedState('ActiveOffPlayer', null);
    const [defPlayer, SetDefPlayer] = usePersistedState('ActiveDefPlayer', null);

    const [loading, SetLoading] = useState(true);
    const [player, SetPlayer] = useState(props.Player);

    const [pendingTasks, SetPendingTasks] = useState([]);


    const [WeeklyCapClaim, SetWeeklyCapClaim] = useState(0);
    const [nextSaturday, SetNextSaturday] = useState(null);

    const [pointTaskTypes, SetPointTaskTypes] = useState([]);
    const [weeklyPointTaskTypes, SetWeeklyPointTaskTypes] = useState([]);

    const WeeklyCap = 12;

    const [AllPlayersCheck, SetAllPlayersCheck] = useState(true);

    const [pendingPointTask, SetPendingPointTask] = useState([]);

    const [playerUpdateHistory, SetPlayerUpdateHistory] = useState([]);


    useEffect(() => {
        
        PlayerServiceAgent.GetPointTaskTypes().then(res => {
            if(res != undefined)
            {
                SetPointTaskTypes(res);

                SetWeeklyPointTaskTypes(res.filter(pointTaskType => !pointTaskType.Name.includes("Admin") && (pointTaskType.Frequency === "WEEKLY" || pointTaskType.Frequency === "UNLIMITED")));
            }
        }).catch(error => {
            addAlert("danger", `${error} : Could not get PointTask Types`)
        });

            
        const getNextSaturday = () => {
            const today = new Date();
            const nextSaturday = new Date();
            nextSaturday.setDate(today.getDate() + (6 - today.getDay() + 7) % 7);
            return nextSaturday.toISOString().split('T')[0]; // Format as YYYY-MM-DD
        };

        SetNextSaturday(getNextSaturday());
        

        PlayerServiceAgent.GetPlayerUpdateHistory(player.PlayerId).then(res => {
            console.log(res);
            if(res){
                SetPlayerUpdateHistory(res);
            }
        }).catch(error => {
            addAlert("danger", `${error} : Could not get Player update history`)
        });


    }, []);

    useEffect(() => {
        //get ClaimedTPE from all pending tasks where iscapped = true and sum them up
        const getWeeklyCapClaim = () => { 
           
           var claim =  pendingTasks
                   .filter(task => !task.IsUncapped)
                       .reduce((sum, task) => sum + (task.ClaimedPoints || 0), 0);

                       
                       return claim;
       };

       SetWeeklyCapClaim(getWeeklyCapClaim());
   }, [pendingTasks]);
   
   useEffect(() => {
        
        if (document.querySelector('.datepicker')) {
            flatpickr('.datepicker', {
                enable: [
                    function(date) {
                        // return true to enable
                        return date.getDay() === 6; // 6 is Saturday
                    }
                ],
                onChange: handleDateChange
            });
        }

        InitPendingPointTask();
    }, [nextSaturday, pointTaskTypes]);

    const InitPendingPointTask = () => {
        
        if(pointTaskTypes.length > 0){
            const firstPointTaskType = weeklyPointTaskTypes[0];

            SetPendingPointTask({
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
    };

    const handleRetirePlayer = () => {
        var playerId = player.PlayerId;

        PlayerServiceAgent.RetirePlayer(player.PlayerId).then(res => {
            console.log(res);
            if(res){
                SetPlayer(res);

                
                if(offPlayer && res.PlayerId === offPlayer.PlayerId){
                    SetOffPlayer(null);
                    SetUserPlayers(null);
                }
                else if(defPlayer && res.PlayerId === defPlayer.PlayerId){
                    SetDefPlayer(null);
                    SetUserPlayers(null);
                }


                window.location.href = `/player/${playerId}/profile`;
            }
        }).catch(error => {
            console.log(error , 'Could not get player');
        }).finally(() => {
            SetLoading(false);
        });
        
    
    };

    const AddPendingTask = () => {
        if (!validatePendingPointTask()) {
            return;
        }

        let updatedPendingPointTask = { ...pendingPointTask };

        if (!AllPlayersCheck) {
            updatedPendingPointTask = {
                ...updatedPendingPointTask,
                PlayerId: player.PlayerId,
                PlayerName: player.FirstName + " " + player.LastName                
            };
        }


        SetPendingTasks(prevState => [...prevState, updatedPendingPointTask]);

        InitPendingPointTask();
    };

    const removePendingTask = (index) => {
        SetPendingTasks(prevState => prevState.filter((_, i) => i !== index));
    };
        
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





    const handleInputChange = (e) => {
        const { id, value, type, checked } = e.target;

        if(id === "AllPlayersCheck"){
            SetAllPlayersCheck(checked);
            return;
        }

        if(id === "PointTaskTypeId"){
            //query the point task types collection where pointtaskid matches, set pendingPointTask.PointTaskName = PointTaskName
            const selectedPointTaskType = pointTaskTypes.find(pointTaskType => pointTaskType.PointTaskTypeId == value);
            
            //if the CLaimedTPE value has not been set, set it to Max Points of the found point task type        
            if (selectedPointTaskType) {
                SetPendingPointTask(prevState => ({
                    ...prevState,
                    PointTaskTypeId: value,
                    PointTaskName: selectedPointTaskType.Name,
                    ClaimedPoints: selectedPointTaskType.DefaultPoints
                }));
            }
        }
        SetPendingPointTask(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    
    const handleDateChange = (selectedDates, dateStr, instance) => {

        SetPendingPointTask(prevState => ({
            ...prevState,
            WeekEnding: dateStr
        }));
    };

    const handleSubmit = () => {
        if(pendingTasks.length > 0){
            PlayerServiceAgent.UpsertPointTaskSubmission(pendingTasks).then(res => {
                console.log(res);
                
                if (Array.isArray(res) && res.some(item => item.error)) {
                    const errorItem = res.find(item => item.error);
                    addAlert("danger", errorItem.error);
                } else{
                    //window.location.reload();
                }

            }).catch(error => {
                addAlert("danger", `${error} : Could no save all pending tasks`);
            });
        }
    };

    const handleActivityCheckSubmit = () => {

        var ac_pts = {
            
                    "PointTaskSubmissionId" : null,
                    "UserId" : player.UserId,
                    "PointTaskTypeId" : 11,
                    "PlayerId" : null,
                    "ClaimedPoints" : 3,
                    "URL" : "",
                    "Notes" : null,
                    "WeekEnding" : nextSaturday
                                                    
        };


        PlayerServiceAgent.UpsertPointTaskSubmission([ac_pts]).then(res => {
            const errors = [];

            // Check if any children of res have property error
            Object.values(res).forEach(child => {
                if (child && child.error) {
                    errors.push(child.error);
                }
            });

            if (errors.length > 0) {
                // Handle the errors
                addAlert("danger", `Could not Save Activity Check : ${errors.join(', ')} `);
            } else{
                window.location.reload();
                console.log(res);
            }

        }).catch(error => {
            console.log(error , 'Could not get player');
            addAlert("danger", `${error} : Could not Save Activity Check`);
        });        
    };

    const handleTrainingCampSubmit = () => {

        var tc_pts = {
            
                    "PointTaskSubmissionId" : null,
                    "UserId" : player.UserId,
                    "PointTaskTypeId" : 14,
                    "PlayerId" : null,
                    "ClaimedPoints" : 15,
                    "URL" : "",
                    "Notes" : null,
                    "WeekEnding" : nextSaturday
                                                    
        };


        PlayerServiceAgent.UpsertPointTaskSubmission([tc_pts]).then(res => {
            const errors = [];

            // Check if any children of res have property error
            Object.values(res).forEach(child => {
                if (child && child.error) {
                    errors.push(child.error);
                }
            });

            if (errors.length > 0) {
                // Handle the errors
                addAlert("danger", `Could not Save Training Camp : ${errors.join(', ')} `);
            } else{
                window.location.reload();
                console.log(res);
            }

        }).catch(error => {
            console.log(error , 'Could not get player');
            addAlert("danger", `${error} : Could not Save Training Camp`);
        });        
    };

return (
    <div className="card pb-4">
        <div className="card-header pb-0 p-3">
            <div className="d-flex justify-content-between">
                <h6 className="mb-2">Point Task Controls</h6>
            </div>

            <div>
                <h6 className="mt-2">WEEKLY</h6>
                <button type="button" className="btn btn-primary btn-lg w-100 mb-2 " data-bs-toggle="modal" data-bs-target="#modal_manual_pointtask" >                                        
                    Manual Point Task
                </button>
                <button type="button" className="btn btn-primary btn-lg w-100 mb-2 " onClick={handleActivityCheckSubmit} >                                        
                    Activity Check
                </button>

                <h6 className="mt-2">SEASONAL</h6>
                <button type="button" className="btn btn-primary btn-lg w-100 mb-2 " onClick={handleTrainingCampSubmit} >                                        
                    Training Camp
                </button>
                <button type="button" className="btn btn-primary btn-lg w-100 mb-2 d-none" data-bs-toggle="modal" data-bs-target="#modal_manual_pointtask"  >                                        
                    Giveaways
                </button>

                
                <h6 className="mt-2">CAREER</h6>
                <button type="button" className="btn btn-primary btn-lg w-100 mb-2 " data-bs-toggle="modal" data-bs-target="#modal_update_history" >                                        
                    View Updates
                </button>
                <a href={`/player/${player.PlayerId}/profile`} className="btn btn-primary btn-lg w-100 mb-2 " >                                        
                    View Player Profile
                </a>
                <button type="button" className="btn btn-danger btn-lg w-100 mb-2 " data-bs-toggle="modal" data-bs-target="#modal_retire">
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
                    <button type="button" className="btn-close text-dark p-4 pt-0 pb-0" data-bs-dismiss="modal" aria-label="Close" >
                        <svg width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                        </svg>
                    </button>
                </div>
                <div className="modal-body">
                    
                        
                        <div className="pb-2">
                            
                            <div className="mb-4">
                                <span className="badge bg-primary m-2 mt-0 mb-0 d-inline-block float-end">{WeeklyCapClaim}/{WeeklyCap}</span>
                                <h6 className="text-sm" style={{opacity:".6"}}>NEW POINT TASK</h6>
                            </div>
                            <div className="row mt-4">
                                <div className="col-4 mb-2">        
                                    <label >Point Task Type</label>
                                    <select className="form-select mb-2"
                                            id="PointTaskTypeId"
                                            value={pendingPointTask.PointTaskTypeId}
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
                                    value={pendingPointTask.ClaimedPoints}
                                    onChange={handleInputChange} />
                                </div>
                                <div className="col-4">
                                    <label>Week Ending</label>
                                    <input className="form-control datepicker" placeholder="Please select date" type="date" 
                                        onfocus="focused(this)" onfocusout="defocused(this)" 
                                        id="WeekEnding"
                                        value={pendingPointTask.WeekEnding}
                                         />
                                </div>
                            </div>

                            <label>Link</label>
                            <input type="text" className="form-control mb-2" placeholder="Enter URL" 
                                    id="URL"
                                    value={pendingPointTask.URL}
                                    onChange={handleInputChange}/>
                            
                            <label>Notes</label>
                            <input type="text" className="form-control mb-2" placeholder="Enter Notes" 
                                    id="Notes"
                                    value={pendingPointTask.Notes}
                                    onChange={handleInputChange}/>
                                
                            <div className="d-flex justify-content-end">
                                
                                <div className="form-check form-switch mt-3 m-5 mb-0">    
                                    <input className="form-check-input" type="checkbox" role="switch" 
                                        id="AllPlayersCheck"
                                        checked={AllPlayersCheck}
                                        onChange={handleInputChange} />                                                            

                                    <label className="form-check-label" for="AllPlayersCheck">
                                        Submit for active players
                                    </label>
                                </div>
                                <button type="button" className="btn btn-success mt-2" onClick={AddPendingTask}>
                                    Add to Pending Tasks
                                </button>
                            </div>
                        </div>

                    <div className="pt-4" style={{borderTop: '1px solid #00000040'}}>
                        <h6 className="text-sm" style={{opacity:".6"}}>PENDING TASKS</h6>
                        <table className="table table-flush text-sm" id="datatable-search" style={{minHeight: '50px'}}>
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
                                                <td>{pendingTask.URL && pendingTask.URL != "" ? (<a href={pendingTask.URL}>Link</a>) :(<></>)}</td>
                                                <td>
                                                    <a onClick={() => removePendingTask(index)}>
                                                        <svg width="16" height="16" fill="currentColor" className="bi bi-trash-fill" viewBox="0 0 16 16">
                                                            <path d="M2.5 1a1 1 0 0 0-1 1v1a1 1 0 0 0 1 1H3v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2V4h.5a1 1 0 0 0 1-1V2a1 1 0 0 0-1-1H10a1 1 0 0 0-1-1H7a1 1 0 0 0-1 1zm3 4a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 .5-.5M8 5a.5.5 0 0 1 .5.5v7a.5.5 0 0 1-1 0v-7A.5.5 0 0 1 8 5m3 .5v7a.5.5 0 0 1-1 0v-7a.5.5 0 0 1 1 0"/>
                                                        </svg>
                                                    </a>
                                                </td>
                                            </tr>
                                            {pendingTask.Notes && (
                                                <tr style={{background: "#00000005"}}>
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

        {/* PLAYER UPDATE HISTORY */}
        <div className="modal modal-lg fade" id="modal_update_history" tabIndex="-1" role="dialog">
            <div className="modal-dialog modal-dialog-centered" role="document">
                <div className="modal-content">
                <div className="modal-header">
                    <h5 className="modal-title" id="exampleModalLabel">Player Update History</h5>
                    <button type="button" className="btn-close text-dark p-4 pt-0 pb-0" data-bs-dismiss="modal" aria-label="Close">
                        <svg width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
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
                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
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
                    
)};

export default PointTaskMenu;