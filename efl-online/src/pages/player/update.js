
import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';

import MainTemplate from "../../layout/PageTemplates/Main/main";
import AuthorizedTemplate from '../../layout/PageTemplates/Authorized';
import PlayerUpdate from "../../components/PlayerUpdate/PlayerUpdate";
import PointTaskMenu from "../../components/PointTaskMenu/PointTaskMenu";
import usePersistedState from '../../serviceAgents/usePersistedState';
import whiteCurve from '../../assets/soft-ui/img/curved-images/white-curved.jpg';
import PlayerHeader from '../../components/PlayerHeader/PlayerHeader';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import LoadingSpinner from '../../components/LoadingSpinner/spinner';

export default function PlayerUpdatePage() {

    const [userPlayers, SetUserPlayers] = usePersistedState('ActiveUserPlayers', null);
    const [offPlayer, SetOffPlayer] = usePersistedState('ActiveOffPlayer', null);
    const [defPlayer, SetDefPlayer] = usePersistedState('ActiveDefPlayer', null);

    const { playerId } = useParams();
    const [player, SetPlayer] = useState('ActiveUserPlayers', null);



    
        const [loading, SetLoading] = useState(true);

        useEffect(() => {
            if(loading){
                //get user players
                PlayerServiceAgent.GetActiveUserPlayers().then(res => {
                    if (res && Array.isArray(res)) 
                    {
                        console.log("User Players found");
                        console.log(res);
                        
                        var off = res.find(players => players.player.UnitType === "OFF");
                        
                        SetOffPlayer((off && off.player ? off.player : null));
                        
                        
                        var def = res.find(players => players.player.UnitType === "DEF");

                        SetDefPlayer((def && def.player ? def.player : null));
                        

                        SetUserPlayers(res);


                        //get player from user players where playerid matches prop.playerId
                        console.log("PLAYERS FOUND");

                        var update_player = res.find(players => players.player.PlayerId == playerId);
                        //set player = matched player
                        

                        //check if the player has been found in users active players, redirect to a player profile page if not
                        //player profile page will handle if the player exists or not
                        if(update_player != null){
                            SetPlayer(update_player.player);
                        }
                        else{
                            window.location.href = `/player/${playerId}/profile`;
                        }



                    }
                }).catch(error => {
                    console.log(error , 'Could not get user players');
                }).finally(() => {
                    SetLoading(false);
                });
                
            }
        },[]);

    return (
      <AuthorizedTemplate>
        <MainTemplate>   
            
            {player && player.team ? (

                        <div className="container-fluid py-4">
                            <div className="row">
                                <div className="col m-2">
                                    <PlayerHeader Player={player} />
                                </div>
                            </div>
                            <div className="row">
                                <div className="col-lg-8 col-sm col-md m-2">
                                    <PlayerUpdate Player={player} />
                                </div>
                                <div className="col m-2">
                                    <PointTaskMenu Player={player} />
                                </div>
                            </div>
                        </div>
                ) : (<div><LoadingSpinner /></div>)}

            </MainTemplate>
        </AuthorizedTemplate>
)};