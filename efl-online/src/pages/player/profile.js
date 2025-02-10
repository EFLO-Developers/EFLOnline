import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import MainTemplate from "../../layout/PageTemplates/Main/main";
import AuthorizedTemplate from '../../layout/PageTemplates/Authorized';
import PlayerUpdate from "../../components/PlayerUpdate/PlayerUpdate";
import PointTaskMenu from "../../components/PointTaskMenu/PointTaskMenu";
import usePersistedState from '../../serviceAgents/usePersistedState';
import whiteCurve from '../../assets/soft-ui/img/curved-images/white-curved.jpg';
import PlayerHeader from '../../components/PlayerHeader/PlayerHeader';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import LoadingSpinner from '../../components/LoadingSpinner/spinner';
import PlayerUpdateHistory from '../../components/PlayerUpdateHistory/PlayerUpdateHistory';

export default function PlayerProfilePage() {

    //load the player from player id
    const { playerId } = useParams();
    const [player, SetPlayer] = useState(null);

    const [loading, SetLoading] = useState(true);

    useEffect(() => {
        if(loading){
            //get user players
            PlayerServiceAgent.GetPlayer(playerId).then(res => {
                
                console.log(res);
                if(res){
                    SetPlayer(res.player);
                }
            }).catch(error => {
                console.log(error , 'Could not get player');
            }).finally(() => {
                SetLoading(false);
            });            
        }
    }, []);


    return (
        <AuthorizedTemplate>
            <MainTemplate>   
                    
                {player && player.team ? (

                    <div className="container-fluid py-4">
                        <div className="row m-2 mb-4">
                            <PlayerHeader Player={player} />
                        </div>
                        <div className="row m-2">
                            <div className="col-lg-6">
                                <div className="card mb-4">
                                    <div className="card-header">
                                    <h5 className="mb-0" style={{textTransform: 'uppercase'}}>Info</h5>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-flush text-sm" id="datatable-search" style={{minHeight: '800px;'}}>
                                            
                                            <tbody>    
                                                <tr>
                                                    <th>Discord User</th>
                                                    <td><a href={`/profile/${player.UserId}`} >{player.DiscordNick}</a></td>
                                                </tr>     
                                                <tr>
                                                    <th>Forum User</th>
                                                    <td><a href={`/profile/${player.UserId}`} >{player.ForumNick}</a></td>
                                                </tr>     
                                                <tr>
                                                    <th>Season Created</th>
                                                    <td>{player.SeasonCreated}</td>
                                                </tr>       
                                                <tr>
                                                    <th>Experience</th>
                                                    <td>{parseInt(player.Experience)}</td>
                                                </tr>      
                                                <tr>
                                                    <th>Team</th> 
                                                    <td><a href={`/team/${player.team.TeamId}/profile`}>{player.team.City} {player.team.Name}</a></td>
                                                </tr>  
                                                <tr>
                                                    <th>Position</th>
                                                    <td>{player.Position}</td>
                                                </tr>     
                                                <tr>
                                                    <th>Archetype</th>
                                                    <td>{player.ArchetypeName}</td>
                                                </tr>     
                                                <tr>
                                                    <th>TPE</th>
                                                    <td>{player.tpe.TotalTPE}</td>
                                                </tr>     
                                                <tr>
                                                    <th>APE</th>
                                                    <td>{parseInt(player.tpe.AppliedTPE) + parseInt(player.tpe.AppliedPendingTPE)}</td>
                                                </tr>     
                                                <tr>
                                                    <th>Banked TPE</th> 
                                                    <td style={{borderBottom:"1px solid #00000020"}}>{player.tpe.BankedTPE}</td>
                                                </tr>                    
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                    <h5 className="mb-0" style={{textTransform: 'uppercase'}}>Attributes</h5>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-flush text-sm" id="datatable-search" style={{minHeight: '800px;'}}>
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Code</th>
                                                    <th>Name</th>
                                                    <th>Value</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {player.stats.map((stat, index) => (
                                                    
                                                        
                                                    <tr
                                                        key={index}
                                                        style={{
                                                            background:
                                                            +player.stats[index].ApprovedValue + +player.stats[index].PendingValue >
                                                            player.BaseSkillPoints
                                                                ? `#${player.team.PrimaryColor}10`
                                                                : ''
                                                        }}
                                                    >

                                                        <td>{player.stats[index].Code}</td>
                                                        <td>{player.stats[index].Name}</td>
                                                        <td>{parseInt(player.stats[index].ApprovedValue) + parseInt(player.stats[index].PendingValue)}</td>
                                                        
                                                    </tr>
                                                ))}                               
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            <div className="col-lg-6 mt-4 mt-lg-0 ">
                                <div className="card mb-4">
                                    <div className="card-header">
                                    <h5 className="mb-0" style={{textTransform: 'uppercase'}}>Team History</h5>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-flush text-sm" id="datatable-search" style={{minHeight: '800px;'}}>
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Team</th>
                                                    <th>Season Assigned</th>
                                                    <th>Season Released</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {player.teamHistory
                                                    .filter(team => team.Name != "Free Agent")
                                                        .map((team, index) => (
                                                    
                                                    <tr key={index} >
                                                        <td>{team.City} {team.Name}</td>
                                                        <td>{team.SeasonAssigned}</td>
                                                        <td>{team.SeasonReleased}</td>
                                                        
                                                    </tr>
                                                ))}                               
                                            </tbody>
                                        </table>
                                    </div>
                                </div>

                                <div className="card">
                                    <div className="card-header">
                                        <h5 className="mb-0" style={{textTransform: 'uppercase'}}>UPDATE History</h5>
                                    </div>
                                    <div className="card-body">
                                        <PlayerUpdateHistory Player={player} EditMode="true" />
                                    </div>

                                </div>
                            </div>
                        </div>


                        <div className="row m-2 mt-4">
                            


                            <div className="col-lg-6 mt-4 mt-lg-0 ">
                                
                            </div>

                            <div className="col-lg-6 mt-4 mt-lg-0 ">
                                
                            </div>
                        </div>
                    </div>
                ) : (<div><LoadingSpinner /></div>)}

        
            </MainTemplate>
        </AuthorizedTemplate>
  )};

