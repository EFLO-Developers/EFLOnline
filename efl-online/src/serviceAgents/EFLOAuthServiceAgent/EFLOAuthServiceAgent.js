
import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

class EFLOAuthServiceAgent  {

    static GetActiveToken(){
        const TokenKey = "eflo.auth";
        const eflo_access_token = Cookies.get(TokenKey);
    
        if (!eflo_access_token) {
            console.log("Token not found");
            window.location.href = "/login";
            return;
        }

        return eflo_access_token;
    }

    static async GenerateAuthToken(params) {
         // Required parameters:
         const requiredParams = ['DiscordId', 'DiscordAccessToken', 'DiscordRefreshToken', 'ExpirationTime'];

         // Validate params object
         for (const param of requiredParams) {
             if (!params.hasOwnProperty(param)) {
                 throw new Error(`Missing required parameter in Generate Token: ${param}`);
             }
         }

         const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        const endpoint = "EFLOAuth/GenerateAuthToken";

        try {
            const response = await axios.post(baseURL + endpoint, params);
            const tokenId = response.data.AuthTokenId;

            const TokenKey = "eflo.auth";
            // Set or update cookie where key = TokenKey
            Cookies.set(TokenKey, tokenId, { expires: 7 }); // Cookie expires in 7 days


            return tokenId;
        } catch (error) {
            console.error('Error generating auth token:', error);
            throw error;
        }
    }

    
    static async ValidateAuthToken() {
        
        var token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        const endpoint = "EFLOAuth/ValidateAuthToken";

        try {

            const response = await axios.get(baseURL + endpoint , {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

           const tokenStatus = response.data.tokenStatus;

           return tokenStatus;

       } catch (error) {
           console.error('Error validating auth token:', error);
           throw error;
       }
    }

    static async GetAllUsers(){
        try {
            
            var token = EFLOAuthServiceAgent.GetActiveToken();
        
            const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
            const endpoint = "User";
        
            const response = await axios.get(baseURL + endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });
        
        const member = response.data;
        
        return member;
        } catch (error) {
            console.error('Error getting active user:', error);
            throw error;
        }

    }

    static async GetActiveUser() {
    
    var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

    const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
   const endpoint = "User/ActiveUser";

   try {

    const response = await axios.post(baseURL + endpoint, {}, {
        headers: {
            Authorization: `Bearer ${eflo_access_token}`
        }
    });

   const member = response.data.eflo_member;

   return member;
   } catch (error) {
       console.error('Error getting active user:', error);
       throw error;
   }
    }

}

export default EFLOAuthServiceAgent;
