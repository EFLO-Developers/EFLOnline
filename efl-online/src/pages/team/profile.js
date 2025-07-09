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
import LeagueServiceAgent from '../../serviceAgents/LeagueServiceAgent';

import TeamHeader from '../../components/TeamHeader';


import Alerts from '../../components/Alerts/alerts';
import { useAlert } from '../../context/AlertContext';

export default function TeamProfilePage() {

    const { addAlert } = useAlert();
    //load the player from player id
    const { teamId } = useParams();
    const [team, SetTeam] = useState(null);


    useEffect(() => {
            //get team details
            //Roster
            //--PlayerDetails
            LeagueServiceAgent.GetTeamDetails(teamId).then(res => {  
                console.log(res);              
                if(res.error == null){
                    SetTeam(res);
                }
                else{
                    addAlert("danger", `${res.error}`);
                }
            }).catch(error => {
                addAlert("danger" , `Could not get player : ${error}`);
            });    
        
    }, []);


    return (
        <AuthorizedTemplate>
            <MainTemplate>  
                <div className="container-fluid py-4">


                    {team ? (
                        <>
                            <div className="row m-2 mb-4">
                                <TeamHeader Team={team} />
                            </div>
                            <div className="row m-2">


                            <div className="col-lg mt-4 mt-lg-0 ">
                                <div className="card">
                                    <div className="card-header">
                                    <h6 className="mb-0" style={{textTransform: 'uppercase'}}>Active Roster</h6>
                                    </div>
                                    <div className="table-responsive">
                                        <table className="table table-flush text-sm" id="datatable-search" style={{minHeight: '800px;'}}>
                                            <thead className="thead-light">
                                                <tr>
                                                    <th>Pos</th>
                                                    <th>Player</th>
                                                    <th>Archetype</th>
                                                    <th>Exp</th>
                                                    <th>TPE</th>
                                                    <th>APE</th>
                                                    <th>STR</th>
                                                    <th>AGI</th>
                                                    <th>ARM</th>
                                                    <th>INT</th>
                                                    <th>ACC</th>
                                                    <th>TKL</th>
                                                    <th>SPD</th>
                                                    <th>HND</th>
                                                    <th>PBK</th>
                                                    <th>RBK</th>
                                                    <th>KDI</th>
                                                    <th>KAC</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                {team && team.activeRoster && team.activeRoster.map((player, index) => (
                                                    <tr key={index}>
                                                    <td>
                                                        {player.player.Position}
                                                    </td>
                                                        <td>
                                                            <a href={`/player/${player.player.PlayerId}/profile`} >{player.player.FirstName} {player.player.LastName}</a>
                                                        </td>
                                                        <td>
                                                            {player.player.ArchetypeName}
                                                        </td>
                                                        <td>
                                                            {player.player.Experience}
                                                        </td>
                                                        <td>
                                                            {player.player.tpe.ApprovedTPE}
                                                        </td>
                                                        <td>
                                                            {player.player.tpe.AppliedTPE}
                                                        </td>


                                                            {player.player.stats.map((stat,i) => (


                                                                <td>
                                                                    {stat.ApprovedValue}
                                                                </td>
                                                            ))}


                                                    </tr>
                                                ))}
                                            </tbody>
                                        </table>
                                    </div>
                                </div>
                            </div>

                            </div>
                        </>
                            
                    ) : null}
                </div>
            </MainTemplate>
        </AuthorizedTemplate>
  )};