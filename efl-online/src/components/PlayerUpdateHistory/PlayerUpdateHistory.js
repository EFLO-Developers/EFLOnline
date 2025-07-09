import React, { useState, useEffect } from 'react';
import { useAlert } from '../../context/AlertContext';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import PlayerUpdateDetail from './PlayerUpdateDetail';

/**
 * PlayerUpdateHistory displays a list of all updates for a player.
 * @param {object} props - expects props.Player (player object)
 */
const PlayerUpdateHistory = ({ Player }) => {
    const { addAlert } = useAlert();

    // Local state for player and their update history
    const [player] = useState(Player);
    const [playerUpdateHistory, setPlayerUpdateHistory] = useState([]);

    // Fetch player update history on mount
    useEffect(() => {
        if (!player?.PlayerId) return;
        PlayerServiceAgent.GetPlayerUpdateHistory(player.PlayerId)
            .then(res => {
                if (res) {
                    setPlayerUpdateHistory(res);
                }
            })
            .catch(error => {
                addAlert("danger", `${error} : Could not get Player update history`);
            });
    }, [player, addAlert]);

    // Render the accordion with update details
    return (
        <div className="accordion" id="playerUpdateAccordion">
            {playerUpdateHistory && playerUpdateHistory.length > 0 &&
                playerUpdateHistory
                    .sort((a, b) => new Date(b.playerUpdate.WeekEnding) - new Date(a.playerUpdate.WeekEnding))
                    .map((update, index) => (
                        <PlayerUpdateDetail key={update.playerUpdate.PlayerUpdateId || index} Update={update.playerUpdate} />
                    ))
            }
        </div>
    );
};

export default PlayerUpdateHistory;