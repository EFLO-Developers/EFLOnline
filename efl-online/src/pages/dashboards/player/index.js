

import React, { useState } from 'react';
import DashboardTemplate from "../../../layout/PageTemplates/Dashboard";
import MainTemplate from "../../../layout/PageTemplates/Main/main.js";
import AuthorizedTemplate from '../../../layout/PageTemplates/Authorized';
import { Helmet } from 'react-helmet';
import PlayerCreate from '../../player/create.js';

const PlayerDash = () => {


      
    const initialPlayerData = {
        player: {
          id: 1,
          totalTPE: 1000,
          appliedTPE: 0,
          availableTPE: 1000,
          attributes: {
            HND: { committedValue: 45, pendingValue: 0, cap: 99 },
            ARM: { committedValue: 50, pendingValue: 0, cap: 99 },
            ACC: { committedValue: 60, pendingValue: 0, cap: 99 },
            KDI: { committedValue: 70, pendingValue: 0, cap: 99 },
            KAC: { committedValue: 55, pendingValue: 0, cap: 99 },
            INT: { committedValue: 65, pendingValue: 0, cap: 99 },
            SPD: { committedValue: 75, pendingValue: 0, cap: 80 },
            AGI: { committedValue: 80, pendingValue: 0, cap: 99 },
            TCK: { committedValue: 40, pendingValue: 0, cap: 60 },
            STR: { committedValue: 85, pendingValue: 0, cap: 99 },
            PBK: { committedValue: 90, pendingValue: 0, cap: 99 },
            RBK: { committedValue: 95, pendingValue: 0, cap: 99 }
          }
        }
      };

      const tpeScale = [
        { minValue: 35, maxValue: 50, pointCost: 1 },
        { minValue: 50, maxValue: 60, pointCost: 2 },
        { minValue: 60, maxValue: 70, pointCost: 3 },
        { minValue: 70, maxValue: 80, pointCost: 8 },
        { minValue: 80, maxValue: 90, pointCost: 12 },
        { minValue: 90, maxValue: 95, pointCost: 18 },
        { minValue: 95, maxValue: 99, pointCost: 24 }
      ];

      
    const [player, setPlayer] = useState(initialPlayerData.player);
    const getPointCost = (value) => {
        for (let i = 0; i < tpeScale.length; i++) {
          if (value >= tpeScale[i].minValue && value < tpeScale[i].maxValue) {
            return tpeScale[i].pointCost;
          }
        }
        return 0;
      };
    
      const handleIncrease = (key) => {
        const currentValue = player.attributes[key].committedValue + player.attributes[key].pendingValue;
        const pointCost = getPointCost(currentValue);
    
        if (player.availableTPE >= pointCost && currentValue < player.attributes[key].cap) {
          setPlayer((prevPlayer) => ({
            ...prevPlayer,
            attributes: {
              ...prevPlayer.attributes,
              [key]: {
                ...prevPlayer.attributes[key],
                pendingValue: prevPlayer.attributes[key].pendingValue + 1
              }
            },
            appliedTPE: prevPlayer.appliedTPE + pointCost,
            availableTPE: prevPlayer.availableTPE - pointCost
          }));
        }
      };
    
      const handleDecrease = (key) => {
        const currentValue = player.attributes[key].committedValue + player.attributes[key].pendingValue;
        const pointCost = getPointCost(currentValue - 1);
    
        if (currentValue > initialPlayerData.player.attributes[key].committedValue) {
          setPlayer((prevPlayer) => ({
            ...prevPlayer,
            attributes: {
              ...prevPlayer.attributes,
              [key]: {
                ...prevPlayer.attributes[key],
                pendingValue: prevPlayer.attributes[key].pendingValue - 1
              }
            },
            appliedTPE: prevPlayer.appliedTPE - pointCost,
            availableTPE: prevPlayer.availableTPE + pointCost
          }));
        }
      };

    
      return (
        <AuthorizedTemplate>
          <MainTemplate>    





              <div className="container-fluid py-4">
                  <div className="row">
                      <h2 className="mb-0">Player Dashboard</h2>
                      <p className="mb-4 ms-1">This is a simple dashboard with some statistics and charts.</p>
                  </div>
                  <div className="row">






                    <div class="col-xl-7">

                      <div className="card">
                      <div className=" d-flex pb-0 p-3">    
                        <h6> Players</h6>
                        </div>
                        <div className="card-header d-flex pb-0 p-3">                          
                          <div className="nav-wrapper position-relative ms-auto w-50">
                            <ul className="nav nav-pills nav-fill p-1" role="tablist">
                              <li className="nav-item">
                                <a className="nav-link mb-0 px-0 py-1 active" data-bs-toggle="tab" href="#player_off" role="tab" aria-controls="player_off" aria-selected="true">
                                  OFF Player
                                </a>
                              </li>
                              <li className="nav-item">
                                <a className="nav-link mb-0 px-0 py-1" data-bs-toggle="tab" href="#player_def" role="tab" aria-controls="player_def" aria-selected="false">
                                  DEF Player
                                </a>
                              </li>
                              
                            </ul>
                          </div>
                        </div>
                          <div className="card-body p-3 mt-2">
                            <div className="tab-content" id="v-pills-tabContent">
                              <div className="tab-pane fade show position-relative active border-radius-lg" 
                                  id="player_off" role="tabpanel" aria-labelledby="player_off">
                                <div className=" d-flex top-0 w-100">
                                  <PlayerCreate />
                                </div>
                              </div>
                              <div className="tab-pane fade position-relative border-radius-lg" 
                                  id="player_def" role="tabpanel" aria-labelledby="player_def">
                                <div className=" d-flex top-0 w-100">                            
                                <div>
                                  <h2>Total TPE: {player.totalTPE}</h2>
                                  <h2>Applied TPE: {player.totalTPE - player.availableTPE}</h2>
                                  <h2>Bank TPE: {player.availableTPE}</h2>
                                      {Object.keys(player.attributes).map((key) => (
                                          <div key={key} className="attribute">
                                              <span className="attribute-name">{key.toUpperCase()} [{player.attributes[key].cap}]:</span>
                                              <button
                                                  onClick={() => handleDecrease(key)}
                                                  disabled={player.attributes[key].committedValue + player.attributes[key].pendingValue === initialPlayerData.player.attributes[key].committedValue}
                                              >
                                                  Decrease
                                              </button>


                                              <span className="attribute-value">
                                                  {player.attributes[key].committedValue + player.attributes[key].pendingValue}
                                              </span>

                                              <button
                                                  onClick={() => handleIncrease(key)}
                                                  disabled={
                                                  player.attributes[key].committedValue + player.attributes[key].pendingValue >= player.attributes[key].cap ||
                                                  player.availableTPE === 0
                                                  }
                                              >
                                                  Increase
                                              </button>
                                              
                                              <span className="attribute-value">
                                                  + {player.attributes[key].pendingValue}
                                              </span>
                                          </div>
                                      ))}
                                  </div>
                                  </div>
                                </div>
                              </div>
                              
                            </div>
                          </div>
                      </div>
                    </div>


                      
              </div>


              <Helmet>
                              
                <script src="/SoftUI_js/js/core/popper.min.js"></script>
                <script src="/SoftUI_js/js/core/bootstrap.min.js"></script>
                <script src="/SoftUI_js/js/plugins/perfect-scrollbar.min.js"></script>
                

                <script src="/SoftUI_js/js/soft-ui-dashboard.js?v=1.2.0"></script>
              </Helmet>
          </MainTemplate>  
        </AuthorizedTemplate>    
    );
};

export default PlayerDash;