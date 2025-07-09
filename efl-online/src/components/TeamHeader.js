import React, { useState } from 'react';
import LoadingSpinner from './LoadingSpinner/spinner';
import { useAlert } from '../context/AlertContext';

/**
 * TeamHeader displays a team's header card with logo, colors, and info.
 * @param {object} props - expects props.Team (team object)
 */
const TeamHeader = ({ Team }) => {
    const { addAlert } = useAlert();
    const [team] = useState(Team);

    // Placeholder for future GM assignment logic
    const assignGMToTeam = () => {
        // Implement GM assignment logic here
    };

    // Placeholder for future input handling logic
    const handleInputChange = (e) => {
        const { id, value } = e.target;
        // Implement input handling logic here
    };

    // Render loading spinner if no team data
    if (!team) {
        return <LoadingSpinner />;
    }

    // Main render
    return (
        <div>
            <div className="card card-background player-header team-header">
                {/* Team background gradient */}
                <div
                    className="full-background"
                    style={{
                        backgroundImage: `linear-gradient(50deg, #${team.PrimaryColor}95 0%, #${team.SecondaryColor}85 100%)`,
                        zIndex: '4'
                    }}
                ></div>
                {/* Team logo */}
                <div
                    className="profile-header-logo"
                    style={{ backgroundImage: `url(/EFL_Logo/${team.LogoFileName})` }}
                ></div>
                <div className="profile-header-logo bg-wave"></div>
                <div className="card-body text-start p-3 pb-2 w-100 h-100">
                    {/* Team city and name */}
                    <p className="city" style={{ color: '#fff' }}>{team.City}</p>
                    <h2 className="mb-2" style={{ color: '#fff' }}>{team.Name}</h2>
                    {/* Conference badge */}
                    {team.ConferenceName ? (
                        <div className="badge bg-primary">{team.ConferenceName}</div>
                    ) : null}
                    <br />
                    {/* Discord or Forum Nick badge */}
                    {(team.DiscordNick || team.ForumNick) ? (
                        <div className="badge bg-primary">{team.DiscordNick ?? team.ForumNick}</div>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default TeamHeader;