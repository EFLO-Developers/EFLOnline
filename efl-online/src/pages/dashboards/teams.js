import React, { useState, useEffect } from 'react';
import AuthorizedTemplate from "../../layout/PageTemplates/Authorized";
import MainTemplate from "../../layout/PageTemplates/Main/main";

import Helmet from 'react-helmet';
import usePersistedState from '../../serviceAgents/usePersistedState';

import Alerts from '../../components/Alerts/alerts';
import { useAlert } from '../../context/AlertContext';
import LeagueServiceAgent from '../../serviceAgents/LeagueServiceAgent';
import TeamHeader from '../../components/TeamHeader';

const TeamsIndex = () => {

    const { addAlert } = useAlert();
    const [teams, SetTeams] = useState(null);

    useEffect(() => {

        LeagueServiceAgent.GetTeams().then(res => {   
            console.log(res);
            if(res.error == null){
                SetTeams(res);
            }
            else{                
                addAlert("danger", `${res.error}`);
            }
        }).catch((error => {
            addAlert("danger", `Could not get teams : ${error}`);
        }));

    }, []);


    return (

        <AuthorizedTemplate>
            <div>
                <MainTemplate>            
                    <div className="container-fluid py-4">                        
                        <div className = "row">    
                            
                            <h6 className="m-4 mb-2 mt-2">TEAMS</h6>                
                            <div className="container-fluid ">



                                <div className="row mini-headers">


                                    {teams ? (

                                        teams.map((team, index) => (

                                            <div className="col-md-4 mb-4">
                                                <a href={`team/${team.TeamId}/profile`} >
                                                    <TeamHeader Team={team} />
                                                </a>
                                            </div>
                                        ))
                                    ) : (
                                        <>No Teams loaded</>
                                    ) }

                                </div>
                            </div>
                        </div>
                    </div>
                </MainTemplate>
            </div>
        </AuthorizedTemplate>
    );
};

export default TeamsIndex;
