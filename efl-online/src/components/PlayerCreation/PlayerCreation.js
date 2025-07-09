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
import { all } from 'axios';

// PlayerCreate component handles the creation of a new player
export default function PlayerCreate() {

    // Alert context for showing messages
    const { addAlert } = useAlert();
    // Loading state for spinner
    const [loading, SetLoading] = useState(true);

    // Archetypes available for selection
    const [allArchetypes, setAllArchetypes] = useState(null);

    // Archetypes available for selection
    const [archetypes, setArchetypes] = useState(null);

    
    // Positions available for selection
    const [positions, setPositions] = useState(null);
    
    // Currently selected position
    const [selectedPosition, setSelectedPosition] = useState(null);

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
                var filteredArchetypes = res.filter(archetype => !player_unit_types.includes(archetype.UnitType));
                setAllArchetypes(filteredArchetypes);

                // Get all unique position properties from filtered archetypes and add them to the positions state object
                const uniquePositions = Array.from(
                    new Set(filteredArchetypes.map(archetype => archetype.Position))
                ).map(positionName => {
                    // Optionally, you can get the first archetype for each position if needed
                    return {
                        PositionName: positionName
                    };
                });
                setPositions(uniquePositions);

               GetArchetypesByPosition(uniquePositions[0].PositionName, filteredArchetypes);
               setSelectedPosition(uniquePositions[0].PositionName);
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

    function GetArchetypesByPosition(position, availableArchetypes) {
        // Fetch all archetypes and filter by position
        if(availableArchetypes == null && allArchetypes != null) {
            availableArchetypes = allArchetypes;
        }


        // Set default archetype if available, default archetype is the first one in the list that matches the first position in the list
        if (availableArchetypes && availableArchetypes.length > 0 && position) {

            var filteredArchetypes = availableArchetypes.filter(archetype => archetype.Position === position);
            setArchetypes(filteredArchetypes);
            console.log('archetypes set for position', position, filteredArchetypes);

            const firstArchetypeForPosition = filteredArchetypes.find(archetype => archetype.Position === position);
            if (firstArchetypeForPosition) {
                SetNewPlayer((prevState) => ({
                    ...prevState,
                    ArchetypeId: firstArchetypeForPosition.ArchetypeId
                }));
            }
        }
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

      // Handle input changes for the form fields
    const handlePositionChange = (event) => {
        const { id, value } = event.target;

        // Set the selected position
        setSelectedPosition(value);

        //get archetypes for the selected position
        GetArchetypesByPosition(value);

        if(archetypes){
            // Set the ArchetypeId to the first archetype for the selected position
            const firstArchetypeForPosition = archetypes.find(archetype => archetype.Position === value);
            if (firstArchetypeForPosition) {
                SetNewPlayer(prevState => ({
                    ...prevState,
                    ArchetypeId: firstArchetypeForPosition.ArchetypeId
                }));
            }
        }
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
                    <div className="col-12 text-center ">
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
                            <div className="row">
                                    
                                    <div className="col-6 ">
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
                                                        <div className="col-9 m-auto text-start p-2 pt-2 pb-2">
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


                                                            {/* Position */}
                                                            <label>Position</label>
                                                            <label className="sub-label required">*Required</label>
                                                            <select className="form-select mb-3" placeholder="Position"
                                                                id="Position"
                                                                name="Position"
                                                                value={selectedPosition || ''}
                                                                onChange={handlePositionChange}>
                                                                {positions && positions.map((pos) => (
                                                                    <option key={pos.PositionName} value={pos.PositionName}>
                                                                        {pos.PositionName}
                                                                    </option>
                                                                ))}
                                                            </select>


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
                                                                        {archetype.ArchetypeName}
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

                                    <div className="col-4 ">                                
                                                <h5 className="card-title mb-3">{selectedPosition} Archetypes</h5>

                                                 {archetypes && archetypes.map((archetype) => (
                                                    <div className="card pt-4 pb-4 mb-4" style={archetype.ArchetypeId == newPlayer.ArchetypeId ? { backgroundColor: "rgb(117, 182, 142)", color: "white" } : {}}>
                                                        <h6 key={archetype.ArchetypeId} value={archetype.ArchetypeId} style={archetype.ArchetypeId == newPlayer.ArchetypeId ? { color: "white" } : {}}>                   
                                                            {archetype.ArchetypeName}
                                                        </h6>
                                                        <p className="card-text  text-sm" >
                                                            <strong>Height:</strong> {archetype.MinHeight} - {archetype.MaxHeight} <br />
                                                            <strong>Weight:</strong> {archetype.MinWeight} - {archetype.MaxWeight} <br />
                                                            <strong>Jersey Number:</strong> {archetype.MinJerseyNumber} - {archetype.MaxJerseyNumber} <br />
                                                        </p>
                                                        
                                                        <p className="card-text  text-sm">
                                                            <strong>Stat Caps</strong> <br />

                                                            {archetype.StatCaps && archetype.StatCaps.map((cap) => (
                                                                <div key={cap.Code}>
                                                                    <strong>{cap.Name}:</strong> {cap.MaxValue} <br />
                                                                </div>
                                                            ))}
                                                        </p>

                                                    </div>
                                                ))}


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