import React, { useEffect, useState  } from 'react';

import AuthorizedTemplate from "../../layout/PageTemplates/Authorized";
import MainTemplate from "../../layout/PageTemplates/Main/main";
import Helmet from 'react-helmet';
import PlayerUpdate from "../PlayerUpdate/PlayerUpdate";
import PlayerServiceAgent from "../../serviceAgents/PlayerServiceAgent.js";
import EFLOAuthServiceAgent from '../../serviceAgents/EFLOAuthServiceAgent/EFLOAuthServiceAgent';

import LoadingSpinner from '../../components/LoadingSpinner/spinner.js';

import Cookies from 'js-cookie';
import usePersistedState from '../../serviceAgents/usePersistedState.js';

import Alerts from '../Alerts/alerts';
import { useAlert } from '../../context/AlertContext';

// PlayerCreate component handles the creation of a new player
export default function PlayerCreate() {

    // Alert context for showing messages
    const { addAlert } = useAlert();
    // Loading state for spinner
    const [loading, SetLoading] = useState(true);
    // Archetypes available for selection
    const [archetypes, SetArchetypes] = useState(null);

    // Persisted state for user players and user info
    const [userPlayers, SetUserPlayers] = usePersistedState('ActiveUserPlayers', null);
    const [user, SetUser] = usePersistedState('ActiveUser', null);

    // State for the new player being created
    const [newPlayer, SetNewPlayer] = useState({
        PlayerId : null,
        UserId: null,
        LeagueId: 1,
        TeamId: null,
        SeasonCreated: null,
        FirstName : '',
        LastName : '',
        Nickname : '',
        JerseyNumber : 0,
        ArchetypeId : 0,
        Height : 74,
        Weight : 220
    });

    // Fetch available archetypes, filtering out those already used by the user's players
    function GetAvailableArchetypes(){
        // Check if user already has 2 active players, redirect if so
        var player_count = userPlayers ? userPlayers.length : 0;
        if(player_count >= 2){
            window.location.href = `/player/update/${userPlayers[0].player.PlayerId}`;
        }

        // Get unique unit types from user's players
        const player_unit_types = [...new Set((userPlayers ?? []).map(player => player.player.UnitType))];

        // Fetch all archetypes and filter out those already used
        PlayerServiceAgent.GetArchetypes().then(res => {
            if(res != undefined)
            {
                const filteredArchetypes = res.filter(archetype => !player_unit_types.includes(archetype.UnitType));
                SetArchetypes(filteredArchetypes);

                // Set default archetype if available
                if (filteredArchetypes && filteredArchetypes.length > 0) {
                    const firstArchetypeId = filteredArchetypes[0].ArchetypeId;
                    SetNewPlayer((prevState) => ({
                        ...prevState,
                        ArchetypeId: firstArchetypeId
                    }));
                }
            }
            else{
                console.log('archetypes returned null response');
            }
        }).catch(error => {
            console.log(error , 'Could not get archetypes');
        }).finally(() => {
            SetLoading(false);
        });
    }

    // On mount, fetch archetypes if not already loaded
    useEffect(() => {
        if(archetypes == null && loading == true)
            GetAvailableArchetypes();
    }, [archetypes, loading]);

    // Validate player input before submitting
    const validatePlayer = (player_to_validate) => {
        if (!player_to_validate.LastName || player_to_validate.LastName.length === 0) {
            addAlert("danger", `Last name is required`);
            return false;
        }

        const archetype = archetypes.find(a => a.ArchetypeId === player_to_validate.ArchetypeId);

        if (!archetype) {
            addAlert("danger", `Invalid archetype ${player_to_validate.ArchetypeId}`);
            return false;
        }

        const jerseyNumber = parseInt(player_to_validate.JerseyNumber);
        const height = parseInt(player_to_validate.Height);
        const weight = parseInt(player_to_validate.Weight);

        if (jerseyNumber < archetype.MinJerseyNumber || jerseyNumber > archetype.MaxJerseyNumber) {
            addAlert("danger", `Jersey number out of range [${archetype.MinJerseyNumber} : ${archetype.MaxJerseyNumber}]`);
            return false;
        }

        if (height < archetype.MinHeight || height > archetype.MaxHeight) {
            addAlert("danger", `Height out of range [${archetype.MinHeight} : ${archetype.MaxHeight}]`);
            return false;
        }

        if (weight < archetype.MinWeight || weight > archetype.MaxWeight) {
            addAlert("danger", `Weight out of range [${archetype.MinWeight} : ${archetype.MaxWeight}]`);
            return false;
        }

        return true;
    };

    // Handle form submission for creating a player
    const handleSubmit = (e) => {
        e.preventDefault();

        // Prepare player object for API
        const player = {
            player: {
                PlayerId : null,
                UserId: user && user.Id ? user.Id : null,
                LeagueId: newPlayer.LeagueId,
                TeamId: null,
                SeasonCreated: null,
                FirstName : newPlayer.FirstName,
                LastName : newPlayer.LastName,
                Nickname : newPlayer.Nickname,
                JerseyNumber : newPlayer.JerseyNumber,
                ArchetypeId : newPlayer.ArchetypeId,
                Height : newPlayer.Height,
                Weight : newPlayer.Weight
            }
        };

        // Validate and submit player
        if(validatePlayer(player.player)){
            PlayerServiceAgent.UpsertPlayer(player).then(res => {        
                if(res){
                    window.location.href = `/player/${res.player.PlayerId}/update`;
                }
            }).catch(error => {
                addAlert("danger", `Error creating player: ${error}`);
            });
        }
    };

    // Handle input changes for the form fields
    const handleInputChange = (event) => {
        const { id, value } = event.target;
        SetNewPlayer(prevState => ({
            ...prevState,
            [id]: value
        }));
    };

    // Show loading spinner while loading
    if (loading) {
        return <div><MainTemplate><LoadingSpinner></LoadingSpinner></MainTemplate></div>;
    }

    // Render the player creation form
    return (
        <div>
            <div className="container-fluid py-4">
                <div className="row">
                    <div className="col-12 text-center">
                        <h3 className="mt-5">Create a Player</h3>
                        <h5 className="text-secondary font-weight-normal">Start your journey.</h5>
                        <div className="multisteps-form mb-5">

                            {/* progress bar */}
                            <div className="row">
                                <div className="col-12 col-lg-8 mx-auto my-5">
                                    <div className="multisteps-form__progress">
                                        <button className="multisteps-form__progress-btn js-active" type="button" title="User Info">
                                            <span>Player</span>
                                        </button>
                                        <button className="multisteps-form__progress-btn" disabled type="button" title="Stats">
                                            <span>Stats</span>
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* form panels */}
                            <div className="row ">
                                <div className="col-6  m-auto">
                                    <form className="multisteps-form__form" onSubmit={handleSubmit}  >
                                        {/* single form panel */}
                                        <div className="card multisteps-form__panel p-3 border-radius-xl bg-white js-active" data-animation="FadeIn">
                                            <div className="row text-center">
                                                <div className="col-8 mx-auto">
                                                    <h5 className="font-weight-normal">Let's start with the basic information</h5>
                                                    <p>This information will define your player.</p>
                                                </div>
                                            </div>
                                            <div className="multisteps-form__content">
                                                <div className="row mt-3">
                                                    <div className="col-4">
                                                        <img style={{maxHeight: "100%", maxWidth: "100%"}} src="https://www.kindpng.com/picc/m/232-2322138_nfl-draft-minnesota-vikings-american-football-football-american.png" />
                                                    </div>
                                                    <div className="col-8 m-auto text-start p-6 pt-2 pb-2">
                                                        {/* First Name */}
                                                        <label>First Name</label>
                                                        <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" 
                                                            id="FirstName"
                                                            name="FirstName"
                                                            value={newPlayer.FirstName}
                                                            onChange={handleInputChange}/>
                                                        {/* Last Name */}
                                                        <label>Last Name</label>
                                                        <label className="sub-label required">*Required</label>
                                                        <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" 
                                                            id="LastName"
                                                            name="LastName"
                                                            value={newPlayer.LastName}
                                                            onChange={handleInputChange}/>
                                                        {/* Nickname */}
                                                        <label>Nickname</label>
                                                        <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" 
                                                            id="Nickname"
                                                            name="Nickname"
                                                            value={newPlayer.Nickname}
                                                            onChange={handleInputChange}/>
                                                        {/* Archetype */}
                                                        <label>Archetype</label>
                                                        <label className="sub-label required">*Required</label>
                                                        <select className="form-select mb-3" placeholder="Archetype"
                                                            id="ArchetypeId"
                                                            name="ArchetypeId"
                                                            value={newPlayer.ArchetypeId}
                                                            onChange={handleInputChange}>
                                                            {archetypes && archetypes.map((archetype) => (
                                                                <option key={archetype.ArchetypeId} value={archetype.ArchetypeId}>
                                                                    {archetype.Position} : {archetype.ArchetypeName}
                                                                </option>
                                                            ))}
                                                        </select>
                                                        {/* Jersey Number */}
                                                        <label>Jersey Number</label>
                                                        <input className="multisteps-form__input form-control mb-3" type="number" placeholder=""
                                                            id="JerseyNumber"
                                                            value={newPlayer.JerseyNumber}
                                                            onChange={handleInputChange} />
                                                        {/* Height */}
                                                        <label>Height</label>
                                                        <label className="sub-label required">*Required</label>
                                                        <input className="multisteps-form__input form-control mb-3" type="number" placeholder="" 
                                                            id="Height"
                                                            value={newPlayer.Height}
                                                            onChange={handleInputChange}/>
                                                        {/* Weight */}
                                                        <label>Weight</label>
                                                        <label className="sub-label required">*Required</label>
                                                        <input className="multisteps-form__input form-control mb-3" type="number" placeholder="" 
                                                            id="Weight"
                                                            value={newPlayer.Weight}
                                                            onChange={handleInputChange}/>
                                                        {/* Duplicate Weight input (possible bug, left for review) */}
                                                        <label>Weight</label>
                                                        <label className="sub-label required">*Required</label>
                                                        <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" 
                                                            id="Weight"
                                                            name="Weight"
                                                            value={newPlayer.Weight}
                                                            onChange={handleInputChange}/>
                                                    </div>
                                                </div>
                                                <div className="button-row d-flex mt-4">
                                                    <button className="btn bg-gradient-dark ms-auto mb-0 " type="submit" title="Create">Create</button>
                                                </div>
                                            </div>
                                        </div>
                                    </form>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Helmet for including external scripts */}
            <Helmet>
                <script src="/SoftUI_js/js/plugins/multistep-form.js"></script>
            </Helmet>
        </div>
    );
};