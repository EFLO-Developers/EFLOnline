import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

class UserServiceAgent  {



    static async GetUser(eflo_access_token, UserId){
        
        if(eflo_access_token == null || UserId == null){
            throw new Error(`Missing required parameter in Get User`);
        }
    
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        const endpoint = `User/${UserId}`;
        try {

            const response = await axios.get(baseURL + endpoint, {
                headers: {
                    Authorization: `Bearer ${eflo_access_token}`
                }
            });
            
            return response.data;
    
            } catch (error) {
                console.error('Error updating user:', error);
                throw error;
            }
    }

    static async UpdateUser(eflo_access_token, eflo_member) {
    
        if(eflo_access_token == null || eflo_member == null){
            throw new Error(`Missing required parameter in UpdateUser`);
        }
    
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        const endpoint = `User/${eflo_member.Id}`;
    
        try {

    
        const response = await axios.put(baseURL + endpoint, eflo_member, {
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${eflo_access_token}`
            }
        });
        
        return response.data;

        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
}
export default UserServiceAgent;
