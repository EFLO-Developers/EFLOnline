
import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

class EFLOAuthServiceAgent  {


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

    
    static async ValidateAuthToken(params) {
        // Required parameters:
        const requiredParams = ['eflo_access_token'];

        // Validate params object
        for (const param of requiredParams) {
            if (!params.hasOwnProperty(param)) {
                throw new Error(`Missing required parameter in Validate TOken: ${param}`);
            }
        }


        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        const endpoint = "EFLOAuth/ValidateAuthToken";

        try {
            console.log(`eflo_access_token : ${params.eflo_access_token}`);
            console.log(`Validating Auth Token @ ${baseURL + endpoint}`);

            const response = await axios.post(baseURL + endpoint, {}, {
                headers: {
                    Authorization: `Bearer ${params.eflo_access_token}`
                }
            });

           const tokenStatus = response.data.tokenStatus;

           return tokenStatus;

       } catch (error) {
           console.error('Error validating auth token:', error);
           throw error;
       }
   }

   static async GetActiveUser(params) {
    // Required parameters:
        const requiredParams = ['eflo_access_token'];

    // Validate params object
    for (const param of requiredParams) {
        if (!params.hasOwnProperty(param)) {
            throw new Error(`Missing required parameter in GetActiveUser: ${param}`);
        }
    }

    const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
   const endpoint = "User/ActiveUser";

   try {
    console.log(`eflo_access_token : ${params.eflo_access_token}`);
    console.log(`Getting Active User @ ${baseURL + endpoint}`);

    
    console.log("getting data");

    const response = await axios.post(baseURL + endpoint, {}, {
        headers: {
            Authorization: `Bearer ${params.eflo_access_token}`
        }
    });

    console.log("data returned from active user");
    console.log(response);

   const member = response.data.eflo_member;

   return member;
   } catch (error) {
       console.error('Error getting active user:', error);
       throw error;
   }
}

}

export default EFLOAuthServiceAgent;
