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

export default function PlayerCreate() {

    
    const { addAlert } = useAlert();
    const [loading, SetLoading] = useState(true);
    const [archetypes, SetArchetypes] = useState(null);

    const [userPlayers, SetUserPlayers] = usePersistedState('ActiveUserPlayers', null);
    const [user, SetUser] = usePersistedState('ActiveUser', null);

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




    function GetAvailableArchetypes(){
        
        //check if they have 2 active players
        var player_count = userPlayers.length;

        //if player
        if(player_count >= 2){
            window.location.href = `/player/update/${userPlayers[0].player.PlayerId}`;
        }

        console.log(`PLAYER COUNT: ${player_count}`);
        console.log(userPlayers);

        // Create array of unique res.player.UnitType values, player_unit_types
        const player_unit_types = [...new Set(userPlayers.map(player => player.player.UnitType))];
        
        console.log("PLAYER UNIT TYPES");
        console.log(player_unit_types);

        //get all archetypes
        PlayerServiceAgent.GetArchetypes().then(res => {
            if(res != undefined)
            {
                console.log("ARCHETYPES");
                console.log(res);
                // Filter res where res.UnitType is not in player_unit_types
                const filteredArchetypes = res.filter(archetype => !player_unit_types.includes(archetype.UnitType));

                SetArchetypes(filteredArchetypes);

                if (filteredArchetypes && Object.keys(filteredArchetypes).length > 0) {
                    const firstArchetypeId = filteredArchetypes[Object.keys(filteredArchetypes)[0]].ArchetypeId;
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

        console.log("getting archetypes....");
    }


    useEffect(() => {
        if(archetypes == null && loading == true)
            GetAvailableArchetypes();
    },[]);

    const validatePlayer = (player_to_validate) => {

        if (!player_to_validate.LastName || player_to_validate.LastName.length === 0) {
            console.error('Last name is required');
            addAlert("danger", `Last name is required`);
            return false;
        }

        const archetype = archetypes.find(a => a.ArchetypeId == player_to_validate.ArchetypeId);

        if (!archetype) {
            console.error('Invalid archetype');
            addAlert("danger", `Invalid archetype ${player_to_validate.ArchetypeId}`);
            return false;
        }

        const jerseyNumber = parseInt(player_to_validate.JerseyNumber);
        const height = parseInt(player_to_validate.Height);
        const weight = parseInt(player_to_validate.Weight);

        if (jerseyNumber < archetype.MinJerseyNumber || jerseyNumber > archetype.MaxJerseyNumber) {
            console.error('Jersey number out of range');
            addAlert("danger", `Jersey number out of range [${archetype.MinJerseyNumber} : ${archetype.MaxJerseyNumber}]`);
            return false;
        }

        if (height < archetype.MinHeight || height > archetype.MaxHeight) {
            console.error('Height out of range');
            addAlert("danger", `Height out of range [${archetype.MinHeight} : ${archetype.MaxHeight}]`);
            return false;
        }

        if (weight < archetype.MinWeight || weight > archetype.MaxWeight) {
            console.error('Weight out of range');
            addAlert("danger", `Weight out of range [${archetype.MinWeight} : ${archetype.MaxWeight}]`);
            return false;
        }

        return true;
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        
        
        

        // Wrap the member parameters in an "eflo_member" object
        const player = {
            player: {
                PlayerId : null,
                UserId: user.Id,
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

        if(validatePlayer(player.player)){
        
            PlayerServiceAgent.UpsertPlayer(player).then(res => {        
                //user was successfully updated
                console.log(res);
                if(res){
                    window.location.href = `/player/${res.player.PlayerId}/update`;
                }
            }).catch(error => {
                console.log(error, "ERROR CREATING PLAYER");
                addAlert("danger", `Error creating player: ${error}`);
            });
        }
    };

    const handleInputChange = (event) => {
        const { id, value } = event.target;
        
        SetNewPlayer(prevState => ({
            ...prevState,
            [id]: value
        }));
    };
    

    if (loading) {
        return <div><MainTemplate><LoadingSpinner></LoadingSpinner></MainTemplate></div>;
    }

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
                                                    <label>First Name</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" 
                                                    id="FirstName"
                                                    value={newPlayer.FirstName}
                                                    onChange={handleInputChange}/>
                                                    <label>Last Name</label>
                                                    <label className="sub-label required">*Required</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" 
                                                    id="LastName"
                                                    value={newPlayer.LastName}
                                                    onChange={handleInputChange}/>
                                                    <label>Nickname</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" 
                                                    id="Nickname"
                                                    value={newPlayer.Nickname}
                                                    onChange={handleInputChange}/>
                                                    <label>Archetype</label>
                                                    <label className="sub-label required">*Required</label>
                                                    <select className="form-select mb-3" placeholder="Archetype"
                                                    id="ArchetypeId"
                                                    value={newPlayer.ArchetypeId}
                                                    onChange={handleInputChange}>
        
                                                        {archetypes && Object.keys(archetypes).map((key) => (
                                                            <option key={archetypes[key].ArchetypeId} value={archetypes[key].ArchetypeId}>{archetypes[key].Position} : {archetypes[key].ArchetypeName}</option>

                                                        ))}

                                                    </select>
                                                    <label>Jersey Number</label>
                                                    <label className="sub-label required">*Required</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder=""
                                                    id="JerseyNumber"
                                                    value={newPlayer.JerseyNumber}
                                                    onChange={handleInputChange} />
                                                    <label>Height</label>
                                                    <label className="sub-label required">*Required</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" 
                                                    id="Height"
                                                    value={newPlayer.Height}
                                                    onChange={handleInputChange}/>
                                                    <label>Weight</label>
                                                    <label className="sub-label required">*Required</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" 
                                                    id="Weight"
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

                <Helmet>
                    <script src="/SoftUI_js/js/plugins/multistep-form.js"></script>
                </Helmet>
            </div>



)};