import React, { useState, useEffect } from 'react';
import AuthorizedTemplate from "../layout/PageTemplates/Authorized";
import MainTemplate from "../layout/PageTemplates/Main/main";
import Helmet from 'react-helmet';
import PlayerServiceAgent from '../serviceAgents/PlayerServiceAgent';
import Cookies from 'js-cookie';
import usePersistedState from '../serviceAgents/usePersistedState';
import LoadingSpinner from './LoadingSpinner/spinner';
import LeagueServiceAgent from '../serviceAgents/LeagueServiceAgent';
import bootstrap from 'bootstrap';
import Alerts from './Alerts/alerts';
import { useAlert } from '../context/AlertContext';

const TeamHeader = (props) => {
    
    const { addAlert } = useAlert();
    const [loading, SetLoading] = useState(true);
    const [team, SetTeam] = useState(props.Team);

    useEffect(() => {
        
    }, [team]);

    const AssignGMToTeam = () => {

        
    };

    const handleInputChange = (e) => {
        const { id, value } = e.target;

        
    };


    return (
        <div >
            { team ? (
            
                <div className="card card-background player-header team-header">
                    <div className="full-background"  
                        style={{ backgroundImage: `linear-gradient(50deg, #${team.PrimaryColor}95 0%, #${team.SecondaryColor}85 100%)`, zIndex:'4' }}></div>
                    <div className="profile-header-logo" 
                        style={{backgroundImage: `url(/EFL_Logo/${team.LogoFileName})`}}></div>
                        <div className="profile-header-logo bg-wave" ></div>
                    <div className="card-body text-start p-3 pb-2 w-100 h-100">
                        <p className="city" style={{color:'#fff'}}>{team.City}</p>
                        <h2 className="mb-2" style={{color:'#fff'}}>{team.Name}</h2>
                        {team.ConferenceName ? (<div className="badge bg-primary">{team.ConferenceName}</div>) : null}
                        <br/>
                        {team.DiscordNick || team.ForumNick ? (<div className="badge bg-primary">{team.DiscordNick ?? team.ForumNick}</div>) : null}
                    </div>

                </div>
            ) : (
                <LoadingSpinner />
            )}

        </div>
)};
export default TeamHeader;