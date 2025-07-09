import React, { useEffect, useState  } from 'react';
import { useParams, useNavigate } from 'react-router-dom';

import EFLOAuthServiceAgent from '../../serviceAgents/EFLOAuthServiceAgent/EFLOAuthServiceAgent';
import UserServiceAgent from '../../serviceAgents/UserServiceAgent.js';
import Cookies from 'js-cookie';

import AuthorizedTemplate from "../../layout/PageTemplates/Authorized";
import MainTemplate from "../../layout/PageTemplates/Main/main";

import LoadingSpinner from '../../components/LoadingSpinner/spinner.js';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent.js';

export default function Profile(){
    const { userId } = useParams();

    const [member, SetMember] = useState({
        Id : '',
        DiscordNick: '',
        ForumNick: '',
        RecruitedBy: '',
        AgencyName: ''
    });
    
    const [activeMember, SetActiveMember] = useState({
        Id : '',
        DiscordNick: '',
        ForumNick: '',
        RecruitedBy: '',
        AgencyName: '',
        security_groups : []
    });

    const [canEdit, SetCanEdit] = useState(false);
    const [loading, setLoading] = useState(true);

    const [userPlayers, SetUserPlayers] = useState([]);

    
    const sortedUserPlayers = userPlayers.sort((a, b) => {
        // Sort by RetiredDate (NULL first)
        if (a.player.RetiredDate === null && b.player.RetiredDate !== null) return -1;
        if (a.player.RetiredDate !== null && b.player.RetiredDate === null) return 1;
        // Sort by CreateDate (newest to oldest)
        return new Date(b.player.CreateDate) - new Date(a.player.CreateDate);
    });

    useEffect(() => {

        SetCanEdit(false);

        if (member.Id == ''){

            EFLOAuthServiceAgent.GetActiveUser().then(res => {
                if(res != undefined)
                {
                    SetActiveMember(res);
                }
            }).catch(error => {
                console.log(error , 'Could not get active user information');
            });

            UserServiceAgent.GetUser(userId).then(res => {
                if (res !== undefined) {                    
                    SetMember(res.eflo_member);
                    console.log(activeMember.security_groups);                  
                }
            }).catch(error => {
                console.log(error, 'Could not get user information');
            });

            PlayerServiceAgent.GetAllUserPlayers(userId).then(res => {
                SetUserPlayers(res);
                console.log("All User players returned");
                console.log(res);
            }).catch(error => {
                console.log(error, 'Could not get user players');
            });
            
            
            setLoading(false);
        }

        
        if (member.Id == activeMember.Id){ //} || activeMember.security_groups.includes("Admin")){
            SetCanEdit(true);
        }
        else{
            SetCanEdit(false);
        }

        
    },[]);

if (loading) {
    return <div><MainTemplate><LoadingSpinner></LoadingSpinner></MainTemplate></div>;
}

return(

    <AuthorizedTemplate>
        <MainTemplate>
                        
            <div className="container-fluid my-3 py-3">
                <div className="row mb-5">
                    <div className="col-lg-3">
                        <div className="card position-sticky top-1">
                            <ul className="nav flex-column bg-white border-radius-lg p-3">
                            <li className="nav-item">
                                    <a className="nav-link text-body" data-scroll="" href="#profile">
                                    <div className="icon me-2">
                                        <svg  width="16" height="16" fill="currentColor" className="bi bi-info-circle-fill" viewBox="0 0 16 16">
                                            <path d="M6 8a3 3 0 1 0 0-6 3 3 0 0 0 0 6m-5 6s-1 0-1-1 1-4 6-4 6 3 6 4-1 1-1 1zM11 3.5a.5.5 0 0 1 .5-.5h4a.5.5 0 0 1 0 1h-4a.5.5 0 0 1-.5-.5m.5 2.5a.5.5 0 0 0 0 1h4a.5.5 0 0 0 0-1zm2 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1zm0 3a.5.5 0 0 0 0 1h2a.5.5 0 0 0 0-1z"/>
                                        </svg>

                                    </div>
                                    <span className="text-sm">Basic Info</span>
                                    </a>
                                </li>
                                <li className="nav-item">
                                    <a className="nav-link text-body" data-scroll="" href="#profile">
                                    <div className="icon me-2">
                                        <svg width="16" height="16" fill="currentColor" className="bi bi-person-arms-up" viewBox="0 0 16 16">
                                            <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                                            <path d="m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.5 1.5 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.7.7 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.7.7 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z"/>
                                        </svg>
                                    </div>
                                    <span className="text-sm">Players</span>
                                    </a>
                                </li>
                                
                            </ul>
                        </div>
                    </div>
                    
                    <div className="col-lg-9 mt-lg-0 mt-4">
                        {/* <-- Card Profile --. */}
                        <div className="card card-body" id="profile">
                            <div className="row justify-content-center align-items-center">
                            <div className="col-sm-auto col-4">

                                {/* PROFILE PIC
                                <div className="avatar avatar-xl position-relative">
                                    <img src="../../assets/img/bruce-mars.jpg" alt="bruce" className="w-100 border-radius-lg shadow-sm"/>
                                </div>

                                */}
                            </div>
                            <div className="col-sm-auto col-8 my-auto">
                                <div className="h-100">
                                <h5 className="mb-1 font-weight-bolder">
                                    <svg width="24" height="24" fill="currentColor" className="bi bi-discord " style={{ marginRight: '10px' }} viewBox="0 0 16 16">
                                        <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
                                    </svg>

                                    {member.DiscordNick}
                                </h5>
                                <p className="mb-0 font-weight-bold text-sm">
                                    Forum Username: {member.ForumNick}
                                </p>
                                </div>
                            </div>
                            <div className="col-sm-auto ms-sm-auto mt-sm-0 mt-3 d-flex">
                                
                            </div>
                            </div>
                        </div>

                        {/* <-- Card Basic Info --. */}
                        <div className="card mt-4" id="basic-info">
                            <div className="card-header">
                                <h5>Basic Info</h5>
                            </div>
                            <div className="card-body pt-0">
                                <div className="row ">
                                    <div className="col-6">
                                        <label className="form-label">Recruited By</label>
                                        <div className="input-group">
                                            <input id="firstName" name="firstName" className="form-control" type="text" 
                                            placeholder="ex: NBN" required="required"
                                            value={member.RecruitedBy ? member.RecruitedBy : ""} disabled />
                                        </div>
                                    </div>
                                    <div className="col-6">
                                        <label className="form-label">Agency Name</label>
                                        <div className="input-group">
                                            <input id="AgencyName" name="AgencyName" className="form-control" type="text" 
                                            placeholder="ex: Apex Athlete Network" required="required"
                                            value={member.AgencyName ? member.AgencyName : ""}  disabled />
                                        </div>
                                    </div>
                                </div>
                                
                                
                                {canEdit ? 
                                    (                                    
                                        <button className="btn bg-gradient-dark btn-sm float-end mt-4 mb-0">
                                            Update
                                        </button>
                                    ) 
                                : null }

                            </div>
                        </div>


                        <div className="card mt-4" id="basic-info">
                            <div className="card-header">
                                <h5>Players</h5>
                            </div>
                            <div className="card-body pt-0">
                                <div className="table-responsive">


                                    {userPlayers.length > 0 ? (
                                        <table className="table table-flush text-sm" id="datatable-search" style={{minHeight: '200px'}}>
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Status</th>
                                                    
                                                    <th>First Name</th>
                                                    <th>Last Name</th>
                                                    <th>Nickname</th>
                                                    <th>Position</th>
                                                    <th>Archetype</th>
                                                    <th>Season</th>
                                                    <th>TPE</th>
                                                    <th>APE</th>
                                                    <th>Banked TPE</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                
                                                {userPlayers && userPlayers.length > 0 && sortedUserPlayers.map((item, index) => (
                                                    <tr key={index} className="link" onClick={() => window.location.href = `/player/${item.player.PlayerId}/profile`}>
                                                        <td>
                                                            <div className={`badge bg-${item.player.RetiredDate ? 'danger' : 'primary'} d-inline-block`} style={{width: 'auto'}}>{item.player.RetiredDate ? "RETIRED" : "ACTIVE"}</div>
                                                        </td>
                                                        
                                                        <td>{item.player.FirstName}</td>
                                                        <td>{item.player.LastName}</td>
                                                        <td>{item.player.Nickname}</td>
                                                        <td>{item.player.Position}</td>
                                                        <td>{item.player.ArchetypeName}</td>
                                                        <td>{item.player.SeasonCreated}</td>
                                                        <td>{item.player.tpe.TotalTPE}</td>
                                                        <td>{parseInt(item.player.tpe.AppliedTPE) + parseInt(item.player.tpe.AppliedPendingTPE)}</td>
                                                        <td>{item.player.tpe.BankedTPE}</td>
                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    ) : (
                                        <div><LoadingSpinner /></div>
                                    )}
                                </div>
                            </div>
                        </div>
                        
                    </div>
                </div>
                
            </div>
                
        </MainTemplate>
    </AuthorizedTemplate>

)};