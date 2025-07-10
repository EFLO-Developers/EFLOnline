

import React, { useEffect, useState  } from 'react';
import DashboardTemplate from "../../../layout/PageTemplates/Dashboard";
import AuthorizedTemplate from "../../../layout/PageTemplates/Authorized";
import MainTemplate from "../../../layout/PageTemplates/Main/main";
import ApproverServiceAgent from '../../../serviceAgents/ApproverServiceAgent';

import Alerts from '../../../components/Alerts/alerts';
import { useAlert } from '../../../context/AlertContext';
export default function ApproverDash(){

    const { addAlert } = useAlert();
    const [pendingUpdates, SetPendingUpdates] = useState(null);
    const [rejectReason, SetRejectReason] = useState(null);
    const [selectedPointTaskSubmissionId, SetSelectedPointTaskSubmissionId] = useState(null);
    const [selectedPlayerUpdate, SetSelectedPlayerUpdate] = useState(null);

    useEffect(() => {

        ApproverServiceAgent.GetPendingUpdates().then(res => {

            if(res.error == null){
                SetPendingUpdates(res);
            }
            else{                
                addAlert("danger", `${res.error}`);
            }
        }).catch(error => {
            addAlert("danger", `${error} : Could not get pending updates`);
        });

    }, []);


    const ProcessPointTaskSubmission = (pointTaskSubmissionId, approved, rejected) => {
        
        const timestamp = new Date();
        
        ApproverServiceAgent.ProcessPointTaskSubmission(pointTaskSubmissionId, (approved ? timestamp : null), (rejected ? timestamp : null), (approved ? null : rejectReason)).then(res => {
            console.log(res);
            if(res.error == null){

                var pts = null;
                //find the local point task submission by id in the pendingUpdates collection and set the approved and rejected date
                SetPendingUpdates((prevState) => {
                    // Find the player update from pending updates where playerUpdateId and playerId match
                    const updatedPendingUpdates = prevState.map((update) => {                       
                        // Update the attributeUpdates array
                        const updatedPointTaskSubmissions = update.playerUpdate.pointTaskSubmissions.map((task) => {

                            if(task.PointTaskSubmissionId == pointTaskSubmissionId){
                                if (approved) {                            
                                    task.ApprovedDate = timestamp.toISOString();
                                }
                                if (rejected) {
                                task.RejectedDate = timestamp.toISOString();
                                task.RejectReason = rejectReason;
                                }

                                pts = task;
                            }
                            return task;
                        });

                        var approvedTPE = update.playerUpdate.ApprovedTPE;
                        var approvedCapped = update.playerUpdate.ApprovedCapped;
                        var approvedUncapped = update.playerUpdate.ApprovedUncapped;
                        var pendingCapped = update.playerUpdate.PendingCapped;
                        var pendingUncapped = update.playerUpdate.PendingUncapped;

                        if(pts != null){


                            if(approved){
                                approvedTPE = +update.playerUpdate.ApprovedTPE + +pts.ClaimedPoints;

                                if(pts.IsUncapped == 0){
                                    approvedCapped = +update.playerUpdate.ApprovedCapped + +pts.ClaimedPoints;
                                }
                                else{
                                    approvedUncapped = +update.playerUpdate.ApprovedUncapped + +pts.ClaimedPoints;
                                }
                            }

                            
                            pendingCapped = +update.playerUpdate.PendingCapped - (pts.IsUncapped == 0 ? +pts.ClaimedPoints : 0);
                            pendingUncapped = +update.playerUpdate.PendingUncapped - (pts.IsUncapped == 1 ? +pts.ClaimedPoints : 0);
                        }

                        return {
                            ...update,
                            playerUpdate: {
                            ...update.playerUpdate,
                            ApprovedTPE: approvedTPE,
                            
                            ApprovedCapped: approvedCapped,
                            PendingCapped: pendingCapped,
                            
                            ApprovedUncapped: approvedUncapped,
                            PendingUncapped: pendingUncapped,

                            pointTaskSubmissions : updatedPointTaskSubmissions,
                            },
                        };
                    });
                
                    return updatedPendingUpdates;
                });


                addAlert("success", `Point Task Submission processed`);
            }
            else{
                
                addAlert("danger", `${res.error}`);
            }
        }).catch(error => {
            addAlert("danger", `${error} : Could not get process point task approval/rejection`);
        });


        SetRejectReason(null);
        SetSelectedPointTaskSubmissionId(null);
    };

    const ProcessAttributeUpdate = (playerUpdateId, playerId, approved, rejected) => {
        
        const timestamp = new Date();

        //gett the player update from pending updates where playerUpdateId and playerId match, then return the attributeUpdates array to a variable
        const playerUpdate = pendingUpdates.find(
            (update) => update.playerUpdate.PlayerUpdateId === playerUpdateId && update.playerUpdate.PlayerId === playerId
          );

        if (playerUpdate && playerUpdate.playerUpdate.attributeUpdates && playerUpdate.playerUpdate.attributeUpdates.length > 0) {

        ApproverServiceAgent.ProcessAttributeUpdates(playerUpdate.playerUpdate.attributeUpdates, (approved ? timestamp : null), (rejected ? timestamp : null), (approved ? null : rejectReason)).then(res => {
            
            if(res.error == null){
                //find the local point task submission by id in the pendingUpdates collection and set the approved and rejected date



                //loop through the  playerUpdate.playerUpdate.attributeUpdates array and update set approvedDate and REjectedDate in the pendingUpdates const where attributeUpdateId = playerUpdate.playerUpdate.attributeUpdates.AttributeUpdateId
                SetPendingUpdates((prevState) => {
                    // Find the player update from pending updates where playerUpdateId and playerId match
                    const updatedPendingUpdates = prevState.map((update) => {
                        if (update.playerUpdate.PlayerUpdateId === playerUpdateId && update.playerUpdate.PlayerId === playerId) {
                        // Update the attributeUpdates array
                        const updatedAttributeUpdates = update.playerUpdate.attributeUpdates.map((attributeUpdate) => {
                            if (approved) {
                            
                            attributeUpdate.ApprovedDate = timestamp.toISOString();
                            }
                            if (rejected) {
                            attributeUpdate.RejectedDate = timestamp.toISOString();
                            attributeUpdate.RejectReason = rejectReason;
                            }
                            return attributeUpdate;
                        });

                        var appliedTPE = update.playerUpdate.ApprovedTPE;

                        if(approved){
                            appliedTPE = +update.playerUpdate.AppliedTPE + +update.playerUpdate.PendingCost;
                        }
                        return {
                            ...update,
                            playerUpdate: {
                            ...update.playerUpdate,
                            AppliedTPE: appliedTPE,
                            PendingCost: 0,
                            attributeUpdates: updatedAttributeUpdates,
                            },
                        };
                        }
                        return update;
                    });
                
                    return updatedPendingUpdates;
                });



                addAlert("success", `Attribute Updates processed`);

            }
            else{
                
                addAlert("danger", `${res.error}`);
            }
        }).catch(error => {
            addAlert("danger", `${error} : Could not get process point task approval/rejection`);
        });

        addAlert("info", `UPDATE ${playerUpdate.playerUpdate.attributeUpdates.length} attributes`);
        }
          
        SetRejectReason(null);
        SetSelectedPlayerUpdate(null);

    };

    const handleRejectReasonChange = (e) => {
        const { value} = e.target;
        SetRejectReason(value);
    };

    const handleSelectedPointTaskChange = (PointTaskSubmissionId) => {
        SetSelectedPointTaskSubmissionId(PointTaskSubmissionId);

    };

    
    const handleSelectedPlayerUpdateChange = (PlayerUpdate) => {
        SetSelectedPlayerUpdate(PlayerUpdate);

    };



    return(

        <AuthorizedTemplate>
            <div>
                <MainTemplate>            
                    <div className="container-fluid py-4">                        
                        <div className = "row">    
                            
                            <h6 className="m-4 mb-2 mt-2">PENDING UPDATES</h6>                
                            <div className="container-fluid ">
                                
                                <div className="accordion" id="playerUpdateAccordion">

                                    {pendingUpdates && pendingUpdates.length > 0 && pendingUpdates
                                            .sort((a, b) => new Date(a.playerUpdate.WeekEnding) - new Date(b.playerUpdate.WeekEnding))
                                            .map((update, index) => {

                                            
                                        const weekEndingDate = new Date(update.playerUpdate.WeekEnding);
                                        const weekStartingDate = new Date(weekEndingDate);
                                        weekStartingDate.setDate(weekStartingDate.getDate() - 6);
                                        
                                        const formattedEndDate = `${weekEndingDate.getMonth() + 1}/${weekEndingDate.getDate()}/${weekEndingDate.getFullYear()}`;
                                        const formattedStartDate = `${weekStartingDate.getMonth() + 1}/${weekStartingDate.getDate()}/${weekStartingDate.getFullYear()}`;
                                                                            
                                        return (
                                            <div className="accordion-item">
                                                <h6 className="accordion-header text-sm fw-bolder" id={`heading-${update.playerUpdate.PlayerUpdateId}-${update.playerUpdate.PlayerId}`} >
                                                    <button className="accordion-button text-sm w-100 fw-bold" type="button" data-bs-toggle="collapse" data-bs-target={`#collapse-${update.playerUpdate.PlayerUpdateId}-${update.playerUpdate.PlayerId}`} aria-expanded="true" aria-controls={`collapse-${update.playerUpdate.PlayerUpdateId}-${update.playerUpdate.PlayerId}`}>
                                                        {formattedEndDate} - {update.playerUpdate.ForumNick} - {update.playerUpdate.FirstName} {update.playerUpdate.LastName}

                                                            
                                                        <div className='position-absolute end-2'>
                                                            
                                                            <div className="badge bg-primary m-2 pt-2">
                                                                <svg  width="16" height="16" fill="currentColor" className="bi bi-discord" viewBox="0 0 16 16" style={{marginRight: "8px"}}>
                                                                    <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
                                                                </svg>
                                                                {update.playerUpdate.DiscordNick}
                                                            </div>
                                                        </div>                                                        
                                                    </button>
                                                </h6>

                                                <div id={`collapse-${update.playerUpdate.PlayerUpdateId}-${update.playerUpdate.PlayerId}`} className="accordion-collapse collapse" aria-labelledby={`heading-${update.playerUpdate.PlayerUpdateId}-${update.playerUpdate.PlayerId}`} data-bs-parent="#playerUpdateAccordion">
                                                    <div className="accordion-body">

                                                    <div className='m-4 p-2 mt-0'>
                                                            <div className="badge bg-primary m-2 p-2">
                                                                Pending: {update.playerUpdate.PendingCapped} / {update.playerUpdate.WeeklyTPECap} ({update.playerUpdate.PendingUncapped})
                                                            </div>
                                                            
                                                            <div className=" badge bg-success text-dark m-2 p-2">
                                                                Approved: {update.playerUpdate.ApprovedCapped} / {update.playerUpdate.WeeklyTPECap} ({update.playerUpdate.ApprovedUncapped})
                                                            </div>
                                                            
                                                            <div className=" badge bg-primary m-2 p-2">
                                                                Available Bank TPE : {+update.playerUpdate.ApprovedTPE - +update.playerUpdate.AppliedTPE}
                                                            </div>
                                                            
                                                            <div className=" badge bg-primary m-2 p-2">
                                                                PENDING TPE Cost: {update.playerUpdate.PendingCost}
                                                            </div>
                                                        </div>

                                                    {update.playerUpdate.pointTaskSubmissions && update.playerUpdate.pointTaskSubmissions.length > 0 ? (
                                                        <>

                                                        <h6 className="mini-heading">Point Task Submissions</h6>

                                                        <table className="table table-flush text-sm mb-2">
                                                            <thead>
                                                                <tr>
                                                                    <th>Player</th>
                                                                    <th>Task</th>
                                                                    <th colSpan="2" className="col ">TPE</th>
                                                                    <th></th>
                                                                    <th className="col text-center">Status</th>
                                                                    <th></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                                
                                                                
                                                            {update.playerUpdate.pointTaskSubmissions.map((task, index) => (
                                                                <React.Fragment key={index}>
                                                                    <tr key={index}>
                                                                        
                                                                        <td>{task.PlayerId ? (<>{task.FirstName} {task.LastName}</>) : (<>All</>)}</td>
                                                                        <td className="col-2">{task.RejectedDate ? (<span>({task.PointTaskSubmissionId})</span>) : null} {task.Name}</td>
                                                                        <td className="col " colSpan="2">{task.ClaimedPoints}</td>
                                                                        <td>
                                                                            {task.URL ? (
                                                                                <a href={task.URL} target="_blank" rel="noreferrer">Link</a>
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


                                                                            {task.ApprovedDate || task.RejectedDate ? null : (
                                                                                <>
                                                                                    <a className="svg-btn approve m-2" onClick={() => ProcessPointTaskSubmission(task.PointTaskSubmissionId, true, false)} >
                                                                                        <svg width="16" height="16" fill="#48af46" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                                                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                                                                        </svg> 
                                                                                    </a>

                                                                                    <a className="svg-btn reject m-2"   data-bs-toggle="modal" data-bs-target="#modal_reject_pts" onClick={() => handleSelectedPointTaskChange(task.PointTaskSubmissionId)} >
                                                                                        <svg width="16" height="16" fill="red" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                                                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                                                                        </svg> 
                                                                                    </a>
                                                                                </>
                                                                            )}

                                                                        </td>
                                                                    </tr>
                                                                    {task.Notes ? (
                                                                        <tr style={{background: "#00000005"}}>
                                                                            <td className="text-bold" >Notes</td>
                                                                            <td colSpan="5">{task.Notes}</td>
                                                                        </tr>
                                                                    ) : null}

                                                                    {task.RejectedDate ? (
                                                                        <tr style={{background: "#ff000010"}}>
                                                                            <td className="text-bold" >Reject Reason:</td>
                                                                            <td colSpan="6"> {task.RejectReason}</td>
                                                                        </tr>
                                                                    ) : null}
                                                                </React.Fragment>
                                                            ))}
                                                            </tbody>
                                                        </table>

                                                    </>
                                                ) : (<></>)}


                                                {update.playerUpdate.attributeUpdates && update.playerUpdate.attributeUpdates.length > 0 ? (
                                                    <>
                            
                                                        <div className="m-2 mt-4 mb-4" style={{borderTop:"1px solid #00000040"}}></div>
                                                        
                                                        <div >
                                                            <h6 className="mini-heading d-inline-block">Attribute Updates</h6>

                                                            <div className="float-end m-3 mt-0 mb-0">

                                                                
                                                                {+update.playerUpdate.PendingCost > (+update.playerUpdate.ApprovedTPE - +update.playerUpdate.AppliedTPE) ? (
                                                                    <div className="m-2 mt-0 mb-0 d-inline-block">
                                                                        <h6 className="mini-heading d-inline-block">COST > BANK</h6>
                                                                        <a className="svg-btn approve m-2"  >
                                                                            <svg width="16" height="16" fill="#333" className="bi bi-exclamation-diamond-fill" viewBox="0 0 16 16">
                                                                                <path d="M9.05.435c-.58-.58-1.52-.58-2.1 0L.436 6.95c-.58.58-.58 1.519 0 2.098l6.516 6.516c.58.58 1.519.58 2.098 0l6.516-6.516c.58-.58.58-1.519 0-2.098zM8 4c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 4.995A.905.905 0 0 1 8 4m.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2"/>
                                                                            </svg>
                                                                        </a>

                                                                    </div>
                                                                ) : (

                                                                    <div className="m-2 mt-0 mb-0 d-inline-block">
                                                                        <h6 className="mini-heading d-inline-block">Approve All</h6>
                                                                        <a className="svg-btn approve m-2"  onClick={() => ProcessAttributeUpdate(update.playerUpdate.PlayerUpdateId, update.playerUpdate.PlayerId, true, false)}>
                                                                            <svg width="16" height="16" fill="#48af46" className="bi bi-check-circle-fill" viewBox="0 0 16 16">
                                                                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0m-3.97-3.03a.75.75 0 0 0-1.08.022L7.477 9.417 5.384 7.323a.75.75 0 0 0-1.06 1.06L6.97 11.03a.75.75 0 0 0 1.079-.02l3.992-4.99a.75.75 0 0 0-.01-1.05z"/>
                                                                            </svg> 
                                                                        </a>

                                                                    </div>
                                                                )}
                                                                



                                                                <div className="m-2 mt-0 mb-0 d-inline-block">
                                                                    <h6 className="mini-heading d-inline-block">Reject All</h6>
                                                                    <a className="svg-btn reject m-2"  data-bs-toggle="modal" data-bs-target="#modal_reject_au"   onClick={() => handleSelectedPlayerUpdateChange(update.playerUpdate)}  >
                                                                        <svg width="16" height="16" fill="red" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                                                            <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                                                        </svg> 
                                                                    </a>
                                                                </div>
                                                            </div>
                                                        </div>

                                                        <table className="table table-flush text-sm mb-2">
                                                            <thead>
                                                                <tr>
                                                                    <th>Player</th>
                                                                    <th>Code</th>
                                                                    <th>Change</th>
                                                                    <th>Cost</th>
                                                                    <th className="col text-center">Status</th>
                                                                    <th></th>
                                                                </tr>
                                                            </thead>
                                                            <tbody>
                                                               {update.playerUpdate.attributeUpdates.map((attr, index) => (
                                                                    <React.Fragment key={index}>
                                                                        <tr>
                                                                            <td>{attr.PlayerId ? (<>{attr.FirstName} {attr.LastName}</>) : (<>All</>)}</td>
                                                                            <td className="col-2">{attr.Code}</td>
                                                                            <td className="col">{attr.ValueFrom} -> {attr.ValueTo}</td>
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
                                                                            <td className="col-1">
                                                                             
                                                                            </td>
                                                                        </tr>
                                                                        {attr.RejectedDate ? (
                                                                            <tr style={{background: "#ff000010"}}>
                                                                            <td className="text-bold" >Reject Reason:</td>
                                                                            <td colSpan="6"> {attr.RejectReason}</td>
                                                                        </tr>
                                                                        ) : null}
                                                                    </React.Fragment>
                                                                ))}
                                                            </tbody>
                                                        </table>

                                                        </>
                                                ) : (<></>)}
                                                    </div>
                                                </div>
                                            </div>
                                        );                                       
                                    })}

                                </div>
                                
                            </div>
                        </div>
                    </div>

                    {/* REJECT PT MODAL */}
                    <div className="modal fade" id="modal_reject_pts" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Reject Point Task Submission</h5>
                                <button type="button" className="btn-close text-dark p-4 pt-0 pb-0" data-bs-dismiss="modal" aria-label="Close">
                                    <svg width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <label>Reject Reason</label>
                                <input type="text" className="form-control mb-2" placeholder="Enter Reason for Rejection" 
                                    onChange={handleRejectReasonChange}/>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>

                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => ProcessPointTaskSubmission(selectedPointTaskSubmissionId, false, true)}>                                        
                                    Reject Point Task Submission
                                </button>
                            </div>
                            </div>
                        </div>
                    </div>

                     {/* REJECT AU MODAL */}
                     <div className="modal fade" id="modal_reject_au" tabIndex="-1" role="dialog">
                        <div className="modal-dialog modal-dialog-centered" role="document">
                            <div className="modal-content">
                            <div className="modal-header">
                                <h5 className="modal-title" id="exampleModalLabel">Reject Attribute Update</h5>
                                <button type="button" className="btn-close text-dark p-4 pt-0 pb-0" data-bs-dismiss="modal" aria-label="Close">
                                    <svg width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                        <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                                    </svg>
                                </button>
                            </div>
                            <div className="modal-body">
                                <label>Reject Reason</label>
                                <input type="text" className="form-control mb-2" placeholder="Enter Reason for Rejection" 
                                    onChange={handleRejectReasonChange}/>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>

                                <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={() => ProcessAttributeUpdate(selectedPlayerUpdate.PlayerUpdateId, selectedPlayerUpdate.PlayerId, false, true)}>                                        
                                    Reject Attribute Updates
                                </button>
                            </div>
                            </div>
                        </div>
                    </div>
                </MainTemplate>
            </div>
        </AuthorizedTemplate>
        
    );
};