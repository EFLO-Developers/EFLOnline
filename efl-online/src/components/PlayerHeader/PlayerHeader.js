import React, { useState, useEffect } from 'react';
import LoadingSpinner from '../LoadingSpinner/spinner';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import LeagueServiceAgent from '../../serviceAgents/LeagueServiceAgent';
import { useAlert } from '../../context/AlertContext';

/**
 * PlayerHeader component displays player info and allows team assignment.
 * @param {object} props - expects props.Player (player object)
 */
const PlayerHeader = ({ Player }) => {
    const { addAlert } = useAlert();

    // Player info (from props)
    const [player, setPlayer] = useState(Player);
    // Currently assigned team ID for the player
    const [assignedTeamId, setAssignedTeamId] = useState(Player?.TeamId ?? null);
    // List of all teams
    const [teams, setTeams] = useState([]);
    // Loading state for spinner
    const [loading, setLoading] = useState(true);

    // Fetch teams on mount
    useEffect(() => {
        let isMounted = true;
        LeagueServiceAgent.GetTeams()
            .then(res => {
                if (isMounted) setTeams(Array.isArray(res) ? res : []);
            })
            .catch(error => {
                console.error(error, 'Could not get teams');
                if (isMounted) setTeams([]);
            })
            .finally(() => {
                if (isMounted) setLoading(false);
            });
        return () => { isMounted = false; };
    }, []);

    // Assign player to selected team
    const assignToTeam = async () => {
        try {
            await PlayerServiceAgent.AssignToTeam(player.PlayerId, assignedTeamId);
            window.location.reload();
        } catch (error) {
            addAlert('danger', `Could not assign player to team`);
        }
    };

    // Handle dropdown change for team assignment
    const handleInputChange = (e) => {
        setAssignedTeamId(e.target.value);
    };

    // Render loading spinner if loading
    if (loading) {
        return <LoadingSpinner />;
    }

    // Main render
    return (
        <div>
            {player ? (
                <div className="card card-background player-header">
                    {/* Player header background with team colors */}
                    <div
                        className="full-background"
                        style={{
                            backgroundImage: `linear-gradient(50deg, #${player.team.PrimaryColor}95 0%, #${player.team.SecondaryColor}85 100%)`,
                            zIndex: '4'
                        }}
                    ></div>
                    {/* Team logo */}
                    <div
                        className="profile-header-logo"
                        style={{ backgroundImage: `url(/EFL_Logo/${player.team.LogoFileName})` }}
                    ></div>
                    <div className="profile-header-logo bg-wave"></div>
                    <div className="card-body text-start p-3 w-100 h-100">
                        {/* Player status badges */}
                        <div className={`badge bg-${player.RetiredDate ? 'danger' : 'primary'} m-1 mb-4 mt-2 d-inline-block`} style={{ width: 'auto' }}>
                            {player.RetiredDate ? "RETIRED" : "ACTIVE"}
                        </div>
                        <div className={`badge bg-primary m-1 mb-4 mt-2 d-inline-block`} style={{ width: 'auto' }}>
                            TPE : {player.tpe.TotalTPE}
                        </div>
                        <div className={`badge bg-primary m-1 mb-4 mt-2 d-inline-block`} style={{ width: 'auto' }}>
                            APE : {parseInt(player.tpe.AppliedTPE) + parseInt(player.tpe.AppliedPendingTPE)}
                            {player.tpe.AppliedPendingTPE > 0 ? (
                                <span> ({parseInt(player.tpe.AppliedPendingTPE)})</span>
                            ) : null}
                        </div>

                        {/* Player name and info */}
                        <h2 className="mb-0" style={{ color: '#fff' }}>
                            {player.FirstName} {player.LastName} <i className="text-sm">{player.Nickname}</i>
                        </h2>
                        <p className="mb-2 ms-1">
                            {player.Position} : {player.ArchetypeName} : {player.team.City} {player.team.Name}
                        </p>

                        {/* Button to open team assignment modal */}
                        <span
                            className="team-assn-btn position-absolute top-10 end-2 text-white"
                            style={{ cursor: 'pointer' }}
                            data-bs-toggle="modal"
                            data-bs-target="#modal_team_assn"
                        >
                            <svg width="24" height="24" fill="currentColor" className="bi bi-stars" viewBox="0 0 16 16">
                                <path d="M7.657 6.247c.11-.33.576-.33.686 0l.645 1.937a2.89 2.89 0 0 0 1.829 1.828l1.936.645c.33.11.33.576 0 .686l-1.937.645a2.89 2.89 0 0 0-1.828 1.829l-.645 1.936a.361.361 0 0 1-.686 0l-.645-1.937a2.89 2.89 0 0 0-1.828-1.828l-1.937-.645a.361.361 0 0 1 0-.686l1.937-.645a2.89 2.89 0 0 0 1.828-1.828zM3.794 1.148a.217.217 0 0 1 .412 0l.387 1.162c.173.518.579.924 1.097 1.097l1.162.387a.217.217 0 0 1 0 .412l-1.162.387A1.73 1.73 0 0 0 4.593 5.69l-.387 1.162a.217.217 0 0 1-.412 0L3.407 5.69A1.73 1.73 0 0 0 2.31 4.593l-1.162-.387a.217.217 0 0 1 0-.412l1.162-.387A1.73 1.73 0 0 0 3.407 2.31zM10.863.099a.145.145 0 0 1 .274 0l.258.774c.115.346.386.617.732.732l.774.258a.145.145 0 0 1 0 .274l-.774.258a1.16 1.16 0 0 0-.732.732l-.258.774a.145.145 0 0 1-.274 0l-.258-.774a1.16 1.16 0 0 0-.732-.732L9.1 2.137a.145.145 0 0 1 0-.274l.774-.258c.346-.115.617-.386.732-.732z" />
                            </svg>
                        </span>
                    </div>
                </div>
            ) : (
                <LoadingSpinner />
            )}

            {/* TEAM ASSIGNMENT MODAL */}
            <div className="modal fade" id="modal_team_assn" tabIndex="-1" role="dialog">
                <div className="modal-dialog modal-dialog-centered" role="document">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h5 className="modal-title" id="exampleModalLabel">Assign Player to Team</h5>
                            <button type="button" className="btn-close text-dark p-4 pt-0 pb-0" data-bs-dismiss="modal" aria-label="Close">
                                <svg width="24" height="24" fill="currentColor" className="bi bi-x-circle-fill" viewBox="0 0 16 16">
                                    <path d="M16 8A8 8 0 1 1 0 8a8 8 0 0 1 16 0M5.354 4.646a.5.5 0 1 0-.708.708L7.293 8l-2.647 2.646a.5.5 0 0 0 .708.708L8 8.707l2.646 2.647a.5.5 0 0 0 .708-.708L8.707 8l2.647-2.646a.5.5 0 0 0-.708-.708L8 7.293z" />
                                </svg>
                            </button>
                        </div>
                        <div className="modal-body">
                            <label>Team</label>
                            {/* Team selection dropdown */}
                            {teams && teams.length > 0 ? (
                                <select
                                    className="form-select mb-2"
                                    id="team_assn_id"
                                    value={assignedTeamId}
                                    onChange={handleInputChange}
                                >
                                    {teams.map((team) => (
                                        <option key={team.TeamId} value={team.TeamId}>
                                            {team.City} {team.Name}
                                        </option>
                                    ))}
                                </select>
                            ) : null}
                        </div>
                        <div className="modal-footer">
                            <button type="button" className="btn btn-secondary" data-bs-dismiss="modal">Close</button>
                            <button type="button" className="btn btn-danger" data-bs-dismiss="modal" onClick={assignToTeam}>
                                Assign
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PlayerHeader;