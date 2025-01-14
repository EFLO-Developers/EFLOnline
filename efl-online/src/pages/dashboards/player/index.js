

import React, { useState } from 'react';
import DashboardTemplate from "../../../layout/PageTemplates/Dashboard";
import MainTemplate from "../../../layout/PageTemplates/Main/main.js";
import AuthorizedTemplate from '../../../layout/PageTemplates/Authorized';

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
          </MainTemplate>  
        </AuthorizedTemplate>    
    );
};

export default PlayerDash;