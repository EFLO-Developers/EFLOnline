import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

class UserServiceAgent  {

    static async UpdateUser(eflo_access_token, eflo_member) {
    
        console.log(eflo_member);
        
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
