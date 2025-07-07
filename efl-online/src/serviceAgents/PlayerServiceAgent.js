import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import EFLOAuthServiceAgent from './EFLOAuthServiceAgent/EFLOAuthServiceAgent';

class PlayerServiceAgent  {



    static async GetArchetypes(){
        
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL        
        const endpoint = "Archetypes/AllArchetypes";
        try {

            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                }
            });
            return response.data;
    
            } catch (error) {
                console.error('Error getting archetypes:', error);
                throw error;
            }
    }

    
    static async GetPointTaskTypes(){
        
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL        
        const endpoint = "PointTaskType";
        try {

            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                  'Cache-Control': 'no-cache',
                  'Pragma': 'no-cache',
                  'Expires': '0'
                }
            });
            return response.data;
    
            } catch (error) {
                console.error('Error getting point task types:', error);
                throw error;
            }
    }

    static async GetAllPlayers(){
        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL        
        const endpoint = "Player";
        try {

            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                  'Authorization': `Bearer ${eflo_access_token}`,
                }
            });
            return response.data;
    
            } catch (error) {
                console.error('Error getting all players:', error);
                throw error;
            }

    }

    static async GetActivePlayers(){

        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = "Player/Active";

        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            const data = response.data;
            return Array.isArray(data) ? data : [data];
    
            } catch (error) {
                console.error('Error getting Users active PLayers:', error);
                throw error;
            }
    }
    static async GetActiveUserPlayers(){

        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = "Player/ActiveUser";

        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            const data = response.data;
            return Array.isArray(data) ? data : [data];
    
            } catch (error) {
                console.error('Error getting Users active PLayers:', error);
                throw error;
            }
    }

    static async GetAllUserPlayers(userId){

        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = `Player/UserPlayers/${userId}`;
        console.log(endpoint);
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });

            const data = response.data;
            return Array.isArray(data) ? data : [data];
    
            } catch (error) {
                console.error('Error getting Users  PLayers:', error);
                throw error;
            }
    }

    static async GetPlayer(playerId){
        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL        
        const endpoint = `Player/${playerId}`;
        try {

            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                  'Authorization': `Bearer ${eflo_access_token}`,
                }
            });
            return response.data;
    
            } catch (error) {
                console.error('Error getting players:', error);
                throw error;
            }
    }

    static async UpsertPlayer(player){
        
        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = `Player`;
        try {

            const response = await axios.post(baseURL + endpoint, player, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            
            return response.data;
    
            } catch (error) {
                console.error('Error upserting player:', error);
                throw error;
            }
    }

    static async RetirePlayer(playerId){
        
        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = `Player/Retire/${playerId}`;
        try {

            const response = await axios.post(baseURL + endpoint, null, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            
            return response.data;
    
            } catch (error) {
                console.error('Error upserting player:', error);
                throw error;
            }
    }



    //UPSERT Point Task
    static async UpsertPointTaskSubmission(pendingTasks){
        

        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
    
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = `Player/PointTaskSubmission`;
        try {
            const responses = await Promise.all(pendingTasks.map(async (task) => {
                const task_submission = {
                    "point_task_submission": task
                };
                

                const response = await axios.post(baseURL + endpoint, task_submission, {
                    headers: {
                        'Authorization': `Bearer ${eflo_access_token}`
                    }
                });

                return response.data;
            }));
            
            return responses;
        } catch (error) {
            console.log(`Error upserting point task submissions: ${error}`);
            throw error;
        }
    }

    static async DeletePointTaskSubmission(pointTaskSubmissionId){
        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
    
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = `Player/DeletePointTaskSubmission/${pointTaskSubmissionId}`;
        try {

            const response = await axios.delete(baseURL + endpoint, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            
            return response.data;

        } catch (error) {
            console.error('Error upserting player:', error);
            throw error;
        }
    }

    //UPSERT AttributeUpdate
    static async UpsertPlayerAttributeUpdates(pendingUpdates){


        //for each child "attribute_update in the pending updates array, send an api call with the individual attribute upate as teh apyload

        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = `Player/AttributeUpdate`;
        try {
            const responses = await Promise.all(pendingUpdates.map(async (update) => {
                const attr_update = {
                    "attribute_update": update.attribute_update
                };
                
                const response = await axios.post(baseURL + endpoint, attr_update, {
                    headers: {
                        'Authorization': `Bearer ${eflo_access_token}`
                    }
                });

                return response.data;
            }));

            return responses;
        } catch (error) {
            console.error('Error upserting player attribute updates:', error);
            throw error;
        }
    }

    static async AssignToTeam(playerId, teamId){
        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = `Player/AssignTeam`;

        var data = {
            "playerId" : playerId,
            "teamId" : teamId
        }

        try {

            const response = await axios.post(baseURL + endpoint, data, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            
            return response.data;
    
            } catch (error) {
                console.error('Error assigning player to team:', error);
                throw error;
            }
    }

    static async GetPlayerUpdateHistory(playerId){
        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = `Player/PlayerUpdates/${playerId}`;

        console.log(endpoint);
        try {

            const response = await axios.get(baseURL + endpoint, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            
            return response.data;
    
            } catch (error) {
                console.error('Error getting player update history:', error);
                throw error;
            }
    }

}

export default PlayerServiceAgent;