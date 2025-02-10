import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import EFLOAuthServiceAgent from './EFLOAuthServiceAgent/EFLOAuthServiceAgent';

class LeagueServiceAgent  {

    
    static async GetTeams(){
        
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL        
        const endpoint = "Team";
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
                console.error('Error getting teams:', error);
                throw error;
            }
    }

    static async GetTeamDetails(teamId){
        
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL        
        const endpoint = `Team/${teamId}`;
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
                console.error('Error getting teams details:', error);
                throw error;
            }
    }

}

export default LeagueServiceAgent;