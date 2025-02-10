
import React, { useState, useEffect } from 'react';
import Alerts from '../Alerts/alerts';
import { useAlert } from '../../context/AlertContext';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import { error } from 'jquery';
import PlayerUpdateDetail from './PlayerUpdateDetail';


const PlayerUpdateHistory = (props) => {

    const { addAlert } = useAlert();

    const [ player, SetPlayer ] = useState(props.Player);
    const [playerUpdateHistory, SetPlayerUpdateHistory] = useState([]);

    useEffect(() => {
        
        PlayerServiceAgent.GetPlayerUpdateHistory(player.PlayerId).then(res => {
            console.log(res);
            if(res){
                SetPlayerUpdateHistory(res);
            }
        }).catch(error => {
            addAlert("danger", `${error} : Could not get Player update history`)
        });


    }, []);

    return(
        <div className="accordion" id="playerUpdateAccordion">
            {playerUpdateHistory && playerUpdateHistory.length > 0 && playerUpdateHistory
                .sort((a, b) => new Date(b.playerUpdate.WeekEnding) - new Date(a.playerUpdate.WeekEnding))
                .map((update, index) => (
                    <>
                        <PlayerUpdateDetail Update={update.playerUpdate} />
                    </>
                
            ))}
        </div>
    )
};

export default PlayerUpdateHistory;