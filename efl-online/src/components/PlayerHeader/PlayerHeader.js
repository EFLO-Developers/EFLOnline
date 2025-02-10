import React, { useState, useEffect } from 'react';
import AuthorizedTemplate from "../../layout/PageTemplates/Authorized";
import MainTemplate from "../../layout/PageTemplates/Main/main";
import Helmet from 'react-helmet';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import Cookies from 'js-cookie';
import usePersistedState from '../../serviceAgents/usePersistedState';
import LoadingSpinner from '../LoadingSpinner/spinner';
import LeagueServiceAgent from '../../serviceAgents/LeagueServiceAgent';
import bootstrap from 'bootstrap';
import Alerts from '../Alerts/alerts';
import { useAlert } from '../../context/AlertContext';

const PlayerHeader = (props) => {
    
    const { addAlert } = useAlert();
    const [loading, SetLoading] = useState(true);
    const [player, SetPlayer] = useState(props.Player);

    const [AssignedTeamId, SetAssignedTeamId] = useState(null);
    const [Teams, SetTeams] = useState([]);

    useEffect(() => {
        
            //get teams set teams
            LeagueServiceAgent.GetTeams().then(res => {
                if(res){           
                    if (Array.isArray(res)) {
                        SetTeams(res);
                    } else {
                        SetTeams([]);
                    }                    
                } else {
                    SetTeams([]);
                } 
            }).catch(error => {
                console.log(error , 'Could not get teams');
                SetTeams([]);
            }).finally(() => {
                SetLoading(false);
            });




        //set teamId to player team id
        SetAssignedTeamId(player.TeamId);
    }, []);

    const AssignToTeam = () => {

        PlayerServiceAgent.AssignToTeam(player.PlayerId, AssignedTeamId).then(res => {
            window.location.reload();
            console.log(res);
        }).catch(error => {
            addAlert('danger',`Could not assign player to team`);
        });
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;

        if(id == "team_assn_id"){
            SetAssignedTeamId(value);
        }
    };


    return (
        <div >
            { player ? (
                <div className="card card-background player-header">
                    <div className="full-background"  
                        style={{ backgroundImage: `linear-gradient(50deg, #${player.team.PrimaryColor}95 0%, #${player.team.SecondaryColor}85 100%)`, zIndex:'4' }}></div>
                    <div className="profile-header-logo" 
                        style={{backgroundImage: `url(/EFL_Logo/${player.team.LogoFileName})`}}></div>
                        <div className="profile-header-logo bg-wave" ></div>
                    <div className="card-body text-start p-3 w-100 h-100">
                        <div className={`badge bg-${player.RetiredDate ? 'danger' : 'primary'} m-1 mb-4 mt-2 d-inline-block`} style={{width: 'auto'}}>{player.RetiredDate ? "RETIRED" : "ACTIVE"}</div>
                        <div className={`badge bg-primary m-1 mb-4 mt-2 d-inline-block`} style={{width: 'auto'}}>TPE : {player.tpe.TotalTPE}</div>
                        <div className={`badge bg-primary m-1 mb-4 mt-2 d-inline-block`} style={{width: 'auto'}}>
                            APE : {parseInt(player.tpe.AppliedTPE) + parseInt(player.tpe.AppliedPendingTPE)}
                            {player.tpe.AppliedPendingTPE > 0 ? (<span> ({parseInt(player.tpe.AppliedPendingTPE)})</span>) :(<></>)}
                        </div>
                        
                        <h2 className="mb-0" style={{color:'#fff'}}>{player.FirstName} {player.LastName}  <i className="text-sm">{player.Nickname}</i> </h2>                                    
                        <p className="mb-2 ms-1">{player.Position} : {player.ArchetypeName} : {player.team.City} {player.team.Name}</p>
                    
                        
                        <span className="team-assn-btn position-absolute top-10 end-2 text-white" style={{cursor:'pointer'}} data-bs-toggle="modal" data-bs-target="#modal_team_assn" >                                        
                            <svg width="24" height="24" fill="currentColor" className="bi bi-stars" viewBox="0 0 16 16">
                                <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z"/>
                            </svg>
                        </span>
                    </div>

                </div>
            ) : (
                <LoadingSpinner />
            )}



             {/* TEAM ASSN MODAL */}
            <div className="modal fade" id="modal_team_assn" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title" id="exampleModalLabel">Assign Player to Team</h5>
                        <button type="button" className="btn-close text-dark p-4 pt-0 pb-0" data-bs-dismiss="modal" aria-label="Close">
                            <svg width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z"/>
                            </svg>
                        </button>
                    </div>
                    <div className="modal-body">
                        <label>Team</label>

                        {Teams && Teams.length > 0 ? (
                            <select className="form-select mb-2"
                                            id="team_assn_id"
                                            value={AssignedTeamId}
                                            onChange={handleInputChange}>

                                {Teams.map((team, index) => (                                            
                                    <option key={index} value={team.TeamId}>
                                        {team.City} {team.Name}
                                    </option>

                                ))}
                            </select>

                        ) : (<></>)}
                        
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>

                        <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={AssignToTeam}>                                        
                            Assign
                        </button>
                    </div>
                    </div>
                </div>
            </div>


        </div>
)};
export default PlayerHeader;