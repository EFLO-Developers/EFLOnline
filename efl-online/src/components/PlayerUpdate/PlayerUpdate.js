
import React, { useState, useEffect } from 'react';
import AuthorizedTemplate from "../../layout/PageTemplates/Authorized";
import MainTemplate from "../../layout/PageTemplates/Main/main";
import Helmet from 'react-helmet';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import Cookies from 'js-cookie';
import usePersistedState from '../../serviceAgents/usePersistedState';
import LoadingSpinner from '../LoadingSpinner/spinner';
import Alerts from '../Alerts/alerts';
import { useAlert } from '../../context/AlertContext';

const PlayerUpdate = (props) => {

    const [loading, SetLoading] = useState(true);

    const [canEdit, SetCanEdit] = useState(true);
    const { addAlert } = useAlert();
    
      const tpeScale = [
        { minValue: 35, maxValue: 50, pointCost: 1 },
        { minValue: 50, maxValue: 60, pointCost: 2 },
        { minValue: 60, maxValue: 70, pointCost: 3 },
        { minValue: 70, maxValue: 80, pointCost: 6 },
        { minValue: 80, maxValue: 85, pointCost: 8 },
        { minValue: 85, maxValue: 90, pointCost: 12 },
        { minValue: 90, maxValue: 95, pointCost: 18 },
        { minValue: 95, maxValue: 98, pointCost: 24 },
        { minValue: 98, maxValue: 99, pointCost: 24 }
      ];

      
    const [player, setPlayer] = useState(null);

    const getPointCost = (startValue, changeAmount) => {
        let totalPointCost = 0;
        let currentValue = startValue;


        let type = (changeAmount > 0 ? "increase" : "decrease");
    
        for (let i = 0; i < Math.abs(changeAmount); i++) {
            for (let j = 0; j < tpeScale.length; j++) {

                if(type == "increase"){
                    //increase logic
                    if (currentValue >= tpeScale[j].minValue && currentValue < tpeScale[j].maxValue) {
                        totalPointCost += tpeScale[j].pointCost;
                        break;                    
                    }
                }
                else{
                    //decrease logic
                    if (currentValue > tpeScale[j].minValue && currentValue <= tpeScale[j].maxValue) {
                        totalPointCost += tpeScale[j].pointCost;
                        break;                    
                    }
                }
            }
            currentValue += (changeAmount > 0) ? 1 : -1;
        }
    
        return totalPointCost;
    };
    

      const handleIncrease = (key, amount) => {

        try{
            const approvedValue = parseInt(player.stats[key].ApprovedValue);
            const currentValue = parseInt(player.stats[key].ApprovedValue) + parseInt(player.stats[key].PendingValue);
            const capValue = parseInt(player.stats[key].MaxValue);

            //check if current value >= cap value, if so, return
            if(currentValue >= capValue){
                return;
            }

            //check if current value + amount is greater than cap value, if so, set amount = cap - current value
            if(currentValue + amount > capValue){
                amount = capValue - currentValue;
            }

            const pointCost = getPointCost(currentValue, amount);

            if (parseInt(player.tpe.BankedTPE) >= pointCost && currentValue < capValue) {
                setPlayer((prevPlayer) => {
                    const updatedStats = [...prevPlayer.stats];
                    updatedStats[key] = {
                        ...updatedStats[key],
                        PendingValue: parseInt(updatedStats[key].PendingValue) + amount,
                        PendingTPE: parseInt(updatedStats[key].PendingTPE) + pointCost
                    };

                    return {
                        ...prevPlayer,
                        stats: updatedStats,
                        tpe: {
                            ...prevPlayer.tpe,
                            AppliedTPE: parseInt(prevPlayer.tpe.AppliedTPE) + pointCost,
                            BankedTPE: parseInt(prevPlayer.tpe.BankedTPE) - pointCost
                        }
                    };
                });
            }
        } catch(error){
            console.log("ERROR INCREASING ATTR VALUE");
        }
    };

    const handleDecrease = (key, amount) => {
        const approvedValue = parseInt(player.stats[key].ApprovedValue);
        const currentValue = parseInt(player.stats[key].ApprovedValue) + parseInt(player.stats[key].PendingValue);
        const capValue = parseInt(player.stats[key].MaxValue);

        //check if current value <= approved value, if so, return
        if (currentValue <= approvedValue) {
            return;
        }

        //check if current value + amount is less than approved value, if so, set amount = current value - approved value
        if (currentValue + amount < approvedValue) {
            amount = approvedValue - currentValue;
        }


        const pointCost = getPointCost(currentValue, amount);

        if (currentValue > parseInt(player.stats[key].ApprovedValue)) {
            setPlayer((prevPlayer) => {
                const updatedStats = [...prevPlayer.stats];
                updatedStats[key] = {
                    ...updatedStats[key],
                    PendingValue: parseInt(updatedStats[key].PendingValue) + amount,
                    PendingTPE: parseInt(updatedStats[key].PendingTPE) - pointCost
                };

                return {
                    ...prevPlayer,
                    stats: updatedStats,
                    tpe: {
                        ...prevPlayer.tpe,
                        AppliedTPE: parseInt(prevPlayer.tpe.AppliedTPE) - pointCost,
                        BankedTPE: parseInt(prevPlayer.tpe.BankedTPE) + pointCost
                    }
                };
            });
        }
    };

      useEffect(() => {

        if(loading){
            setPlayer(props.Player);
            SetLoading(false);
        }
      }, []);

      function SaveChanges(){


        const pendingChanges = player.stats
            //.filter(stat => parseInt(stat.PendingValue) !== 0 && parseInt(stat.PendingTPE) !== 0)
            .map(stat => ({
                attribute_update: {
                    PlayerId: player.PlayerId,
                    Code: stat.Code, // Assuming AttributeId is part of the stat object
                    ValueFrom: parseInt(stat.ApprovedValue),
                    ValueTo: parseInt(stat.ApprovedValue) + parseInt(stat.PendingValue),
                    PointCost: parseInt(stat.PendingTPE)
                }
            }));
    
            // You can now send pendingChanges to your API or handle them as needed

            if(pendingChanges && pendingChanges.length > 0){
                PlayerServiceAgent.UpsertPlayerAttributeUpdates(pendingChanges).then(res => {

                    console.log(res);
                        
                    if (Array.isArray(res) && res.some(item => item.error)) {
                        const errorItem = res.find(item => item.error);
                        addAlert("danger", errorItem.error);
                    } else{
                        addAlert("success", "Player attributes updated successfully");

                        //window.location.reload();
                    }
                        

                }).catch(error => {
                    console.log(error , 'Could not get user players');
                });
            }
    
      }

    return (
            
    <div>
        
        {player && player.tpe && player.stats ? (

            <div>
                <div className="card mb-4">
                                            
                    <div className="card-header pb-0 p-3">
                        <div className="d-flex justify-content-between">
                            <h6 className="mb-2">TPE Snapshot</h6>
                        </div>
                    </div>

                    <div className="container border-radius-lg">
                        <div className="row">                
                            <div className="col-4 py-3 ps-0">
                                <div className="d-flex mb-2">                       
                                    <p className="text-xs mt-1 mb-0 font-weight-bold">Total TPE</p>
                                </div>
                                <h4 className="font-weight-bolder">{player.tpe.TotalTPE}</h4>
                                <div className="progress w-75">
                                    <div className="progress-bar bg-dark w-100" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                            <div className="col-4 py-3 ps-0">
                                <div className="d-flex mb-2">                        
                                    <p className="text-xs mt-1 mb-0 font-weight-bold">Applied TPE</p>
                                </div>
                                <h4 className="font-weight-bolder">{player.tpe.TotalTPE - player.tpe.BankedTPE}</h4>
                                <div className="progress w-75">
                                    <div className={`progress-bar bg-dark w-${Math.floor(((player.tpe.TotalTPE - player.tpe.BankedTPE) / player.tpe.TotalTPE) * 100 / 5) * 5}`} role="progressbar" aria-valuenow="66" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                            <div className="col-4 py-3 ps-0">
                                <div className="d-flex mb-2">                        
                                    <p className="text-xs mt-1 mb-0 font-weight-bold">Bank TPE</p>
                                </div>
                                <h4 className="font-weight-bolder">{player.tpe.BankedTPE}</h4>
                                <div className="progress w-75">
                                    <div className={`progress-bar bg-dark w-${Math.ceil((player.tpe.BankedTPE / player.tpe.TotalTPE) * 100 / 5) * 5}`} role="progressbar" aria-valuenow="50" aria-valuemin="0" aria-valuemax="100"></div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="card">
                    <div className="card-header pb-0 p-3">
                        <div className="d-flex justify-content-between">
                            <h6 className="mb-2">Update {player.FirstName} {player.LastName}</h6>
                        </div>
                    </div>

                    <div className="table-responsive" style={{borderBottom: '1px solid #00000020'}}>
                        <table className="table align-items-center mb-0" >
                        <thead>
                        <tr>
                            <th className="text-left text-sm p-0 pb-2 ps-3">Attribute</th>
                            <th className=" text-center text-sm p-0 pb-2 ps-1">Rating</th>
                            <th className=" text-center text-sm p-0 pb-2 ps-1"></th>
                            <th className=" text-center text-sm p-0 pb-2 ps-1"></th>
                            <th className=" text-center text-sm p-0 pb-2 ps-1"></th>
                            <th className=" text-center text-sm p-0 pb-2 ps-1">Change</th>
                            <th className=" text-center text-sm p-0 pb-2 ps-1">Cost</th>
                        </tr>
                        </thead>
                        <tbody>
                            
                            {Object.keys(player.stats).map((key) => (
                                
                                <tr
                                key={key}
                                style={{
                                    background:
                                    +player.stats[key].ApprovedValue + +player.stats[key].PendingValue >
                                    player.BaseSkillPoints
                                        ? `#${player.team.PrimaryColor}10`
                                        : ''
                                }}
                                >

                                    <td>
                                        <div className="ms-2 d-sm-none d-md-none d-lg-block">
                                            <h6 className="text-sm mb-0">{player.stats[key].Name} </h6>
                                        </div>
                                        
                                        <div className="ms-2 d-lg-none d-sm-block d-md-block">
                                            <h6 className="text-sm mb-0">{player.stats[key].Code} </h6>
                                        </div>
                                    </td>
                                    <td>
                                        <div className=" text-center ">
                                            <h6 className="text-sm mb-0">{+player.stats[key].ApprovedValue + +player.stats[key].PendingValue}</h6>
                                        </div>
                                    </td>
                                    <td>
                                        <div className=" text-center ">
                                            <h6 className={`text-sm mb-0 cap ${player.stats[key].MaxValue != 99 ? "active-cap" : ""}`}>{player.stats[key].MaxValue}</h6>
                                        </div>
                                    </td>
                                    <td>
                                        <div className=" text-center " >
                                            <h6 className="text-sm mb-0" style={{opacity: '.4'}}>{getPointCost(+player.stats[key].ApprovedValue + +player.stats[key].PendingValue, 1)}</h6>
                                        </div>
                                    </td>
                                    <td>
                                        <div className=" text-center">
                                            <button className="btn btn-danger p-2 text-sm mb-0 m-2 d-inline-block d-sm-none d-md-inline-block" onClick={() => handleDecrease(key, -10)}>-10</button>
                                            <button className="btn btn-danger p-2 text-sm mb-0 m-2 d-inline-block d-sm-none d-md-inline-block" onClick={() => handleDecrease(key, -5)}>-5 &nbsp;</button>
                                            <button className="btn btn-danger p-2 text-sm mb-0 m-2 d-inline-block" onClick={() => handleDecrease(key, -1)}>-1 &nbsp;</button>
                                            <button className="btn btn-primary p-2 text-sm mb-0 m-2 d-inline-block" onClick={() => handleIncrease(key, 1)}>+1 &nbsp;</button>
                                            <button className="btn btn-primary p-2 text-sm mb-0 m-2 d-inline-block d-sm-none d-md-inline-block" onClick={() => handleIncrease(key, 5)}>+5 &nbsp;</button>
                                            <button className="btn btn-primary p-2 text-sm mb-0 m-2 d-inline-block d-sm-none d-md-inline-block" onClick={() => handleIncrease(key, 10)}>+10</button>
                                        </div>
                                    </td>
                                    <td className="align-middle text-center">
                                            <h6 className="text-sm mb-0">{player.stats[key].PendingValue}</h6>
                                    </td>
                                    <td className="align-middle text-center">
                                        <div className="col text-left">
                                            <h6 className="text-sm mb-0">{player.stats[key].PendingTPE}</h6>
                                        </div>
                                    </td>
                                </tr>
                                
                            ))}
                        </tbody>
                        </table>
                    </div>

                    <div className="card-body">

                        {canEdit ? 
                            (                                    
                                <button className="btn bg-gradient-dark btn-sm float-end mt-4 mb-0" onClick={SaveChanges}>
                                    Save Attribute Updates
                                </button>
                            ) 
                        : null }
                    </div>
                </div>
            </div>
        ) : (
            <div>
                <LoadingSpinner />
            </div>
        )}

            
</div>
            
)};

export default PlayerUpdate;