
import React, { useEffect, useState  } from 'react';
import DashboardTemplate from "../../../layout/PageTemplates/Dashboard";
import AuthorizedTemplate from "../../../layout/PageTemplates/Authorized";
import MainTemplate from "../../../layout/PageTemplates/Main/main";

import whiteCurve from '../../../assets/soft-ui/img/curved-images/white-curved.jpg';
import usePersistedState from "../../../serviceAgents/usePersistedState";
import PlayerHeader from "../../../components/PlayerHeader/PlayerHeader";
import PlayerServiceAgent from "../../../serviceAgents/PlayerServiceAgent";
import LoadingSpinner from "../../../components/LoadingSpinner/spinner";

import Alerts from '../../../components/Alerts/alerts';
import { useAlert } from '../../../context/AlertContext';

import { AllCommunityModule, ModuleRegistry } from "ag-grid-community";
import { AgGridReact } from "ag-grid-react";
import { themeBalham } from 'ag-grid-community';


ModuleRegistry.registerModules([AllCommunityModule]);

export default function DefaultDash(){

    const { addAlert } = useAlert();
    const [loading, SetLoading] = useState(true);
    const [userPlayers, SetUserPlayers] = usePersistedState('ActiveUserPlayers', null);
    const [offPlayer, SetOffPlayer] = usePersistedState('ActiveOffPlayer', null);
    const [defPlayer, SetDefPlayer] = usePersistedState('ActiveDefPlayer', null);

    const [allActivePlayers, SetAllActivePlayers] = useState([]);

    

    //Get user players from API every time this board is accessed and set the ActiveUserPlayers cache
    useEffect(() => {
                    
            //get current users players
            PlayerServiceAgent.GetActiveUserPlayers().then(res => {
                console.log(res);
                if(res != undefined)
                {
                    var off = res.find(players => players.player.UnitType === "OFF");
                    if(off){
                        SetOffPlayer(off.player);
                    }
                    
                    var def = res.find(players => players.player.UnitType === "DEF");

                    if(def){
                        SetDefPlayer(def.player);
                    }

                    SetUserPlayers(res);
                }
            }).catch(error => {
                console.log(error , 'Could not get user players on dashboard');
                addAlert('danger', 'Could not get user players on dashboard');
            });

            
            //get current users players
            PlayerServiceAgent.GetActivePlayers().then(res => {
                if(res != undefined)
                {
                    SetAllActivePlayers(res);
                }
            }).catch(error => {
                console.log(error , 'Could not get active players');
            });
               
    },[]);

    const [rowData, setRowData] = useState([]);
    const [colDefs, setColDefs] = useState([
        { field: "Position" },
        { field: "FirstName" },
        { field: "LastName" },
        { field: "ArchetypeName" },
        { field: "TeamName" },
        { field: "Experience" },
        { field: "TotalTPE" },
        { field: "APE" },
    ]);
  
    // Fetch data & update rowData state
    useEffect(() => {
        
        setRowData(allActivePlayers);

    }, [allActivePlayers])
    
    return(
        <AuthorizedTemplate>
            <div>
                <MainTemplate>            
                    <div className="container-fluid py-4">
                        

                        <div className = "row">    
                            
                            <h6 className="m-4 mb-2 mt-2">MY ACTIVE PLAYERS</h6>                
                            <div className="container-fluid ">
                                <div className="row mini-headers">


                                    {offPlayer && offPlayer.team ? (

                                        <div className="col-md">
                                            <a href={`/player/${offPlayer.PlayerId}/update`} >
                                                <PlayerHeader Player = {offPlayer} />
                                            </a>
                                        </div>


                                        ) : (
                                        
                                            <a href='/player/create' className="col-md card create-placeholder d-flex justify-content-center align-items-center m-2  mt-md-0 mt-sm-4 mb-0">
                                            <button className="align-middle mx-auto create-player">
                                                <svg width="16" height="16" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                                    <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                                                </svg>
                                                <span >
                                                    Create a player
                                                </span>
                                            </button>                                                        
                                        </a>

                                        
                                    )}
                                   
                                   {defPlayer && defPlayer.team ? (

                                        <div className="col-md mt-md-0 mt-sm-4">
                                            <a href={`/player/${defPlayer.PlayerId}/update`} >
                                                <PlayerHeader Player = {defPlayer} />
                                            </a>
                                        </div>


                                        ) : (
                                                                                 
                                            <a href='/player/create' className="col-md card create-placeholder d-flex justify-content-center align-items-center m-2  mt-md-0 mt-sm-4 mb-0">
                                                <button className="align-middle mx-auto create-player">
                                                    <svg width="16" height="16" fill="currentColor" className="bi bi-plus-circle" viewBox="0 0 16 16">
                                                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14m0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16"/>
                                                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4"/>
                                                    </svg>
                                                    <span >
                                                        Create a player
                                                    </span>
                                                </button>                                                        
                                            </a>
                                    )}

                                    
                                </div>
                            </div>
                        </div>



                        <div className="row mt-4 d-none">
                            <h6 className="m-4 mb-2 mt-4">AG GRID PLAYER SNAPSHOTS</h6>                 
                            <div className="col m-4" style={{ minHeight: '600px', width: '600px' }}>
                                
                                    <AgGridReact
                                            rowData={rowData}
                                            columnDefs={colDefs}
                                            
                                    />
                            </div>
                        </div>

                        <div className = "row">

                            <h6 className="m-4 mb-2 mt-4">ALL ACTIVE PLAYERS</h6>                 
                            <div className="container-fluid ">
                                <div className="card mt-2 pt-4" >
                                    <div className="card-body pt-0">
                                        <div className="table-responsive">

                                            {allActivePlayers.length > 0 ? (
                                                <table className="table table-flush text-sm" id="datatable-search" style={{minHeight: '200px'}}>
                                                    <thead className="thead-light">
                                                        <tr>
                                                            <th>Position</th>
                                                            <th>Player</th>
                                                            <th>Nickname</th>
                                                            <th>Archetype</th>
                                                            <th>Team</th>
                                                            <th>User</th>
                                                            <th>Season</th>
                                                            <th>Experience</th>
                                                            <th>TPE</th>
                                                            <th>APE</th>
                                                        </tr>
                                                    </thead>
                                                    <tbody>
                                                        
                                                        {allActivePlayers && allActivePlayers.length > 0 && allActivePlayers.map((player, index) => (
                                                            <tr key={index} className="link">
                                                                
                                                                <td>{player.Position}</td>
                                                                <td><a href={`/player/${player.PlayerId}/profile`}>{player.FirstName} {player.LastName}</a></td>
                                                                <td>{player.Nickname}</td>
                                                                <td>{player.ArchetypeName}</td>
                                                                <td><a href={`/team/${player.TeamId}/profile`}>{player.TeamCity} {player.TeamName}</a></td>

                                                                <td>{player.DiscordNick ?? player.ForumNick}</td>
                                                                <td>{player.SeasonCreated}</td>
                                                                <td>{player.Experience}</td>
                                                                <td>{player.TotalTPE}</td>
                                                                <td>{player.APE}</td>
                                                                
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
            </div>
        </AuthorizedTemplate>

    );
};