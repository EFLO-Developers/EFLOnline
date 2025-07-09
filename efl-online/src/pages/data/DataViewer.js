import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import AuthorizedTemplate from "../../layout/PageTemplates/Authorized";
import MainTemplate from "../../layout/PageTemplates/Main/main";
import Helmet from 'react-helmet';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import LeagueServiceAgent from '../../serviceAgents/LeagueServiceAgent';
import Cookies from 'js-cookie';
import usePersistedState from '../../serviceAgents/usePersistedState';
import EFLOAuthServiceAgent from '../../serviceAgents/EFLOAuthServiceAgent/EFLOAuthServiceAgent';

const DataViewer = () => {
    const { objName } = useParams();
    const [data, setData] = useState([]);
    const [headers, setHeaders] = useState([]);

    useEffect(() => {

        // Fetch data dynamically based on objName
        // For demonstration, using static data
        const fetchData = async () => {
            
            switch(objName){
                case "players":
                    const players = await PlayerServiceAgent.GetAllPlayers();
                    setData(players);
                    
                    if(players.length > 0)
                        setHeaders(Object.keys(players[0]));
                    break;
                    case "teams":

                        const teams = await LeagueServiceAgent.GetTeams();
                        console.log(teams);
                        setData(teams);
                        
                        if(teams.length > 0)
                            setHeaders(Object.keys(teams[0]));
                        break;
                case "users":
                    const users = await EFLOAuthServiceAgent.GetAllUsers();
                    console.log(users);
                    setData(users);
                    
                    if(users.length > 0)
                        setHeaders(Object.keys(users[0]));
                    break;
            }



        };

        fetchData();

    }, [objName]);

    return (

        <AuthorizedTemplate>
            <MainTemplate>
                
                <div className="container-fluid py-4">
                    <div className="row m-2">                    
                        <div className="col-12">
                        <div className="card">
                            <div className="card-header">
                            <h5 className="mb-0" style={{textTransform: 'uppercase'}}>{objName}</h5>
                            </div>
                            <div className="table-responsive">
                            <table className="table table-flush text-sm" id="datatable-search" style={{minHeight: '800px;'}}>
                                <thead className="thead-light">
                                    <tr>
                                        {headers.map((header) => (
                                            <th key={header}>{header}</th>
                                        ))}
                                    </tr>
                                </thead>
                                <tbody>
                                    {Array.isArray(data) && data.map((item, index) => (
                                        <tr key={index}>
                                            {headers.map((header) => (
                                                <td key={header}>{item[header]}</td>
                                            ))}
                                        </tr>
                                    ))}
                               
                                </tbody>
                            </table>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>


            </MainTemplate>
        </AuthorizedTemplate>
    )

};
export default DataViewer;