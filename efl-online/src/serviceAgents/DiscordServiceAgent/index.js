
import React, { useEffect, useState  } from 'react';
import axios from 'axios';

class DiscordServiceAgent  {



    static async HelloWorld(){
        return "Hi Dad";
    }

    

    static async GetDiscordAuthToken(clientId, clientSecret, redirectUri, code){
        const params = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
          });

        //GET ACCESS TOKEN

        try{
            const response = await axios.post('https://discord.com/api/oauth2/token', params , {
                            headers: {
                            'Content-Type': 'application/x-www-form-urlencoded',
                            },
                        });

            console.log('Access Token:', response.data.access_token);                            
            return response.data.access_token;
                    
        }
        catch(error){
            return undefined;
            console.error('Error exchanging code for token:', error);
        }
    }

    static async GetDiscordGuildMember(bearer, guild_id){
        
            //GET EFL GUILD MEMBER
        try{
            const response = await axios.get(`https://discord.com/api/users/@me/guilds/${guild_id}/member`, {
                    headers: {
                    Authorization: `Bearer ${bearer}`
                }
    
            });

            console.log(`Guild Member: ${response.data.user.id} | ${response.data.nick}`); 
            const jsonString = JSON.stringify(response.data, null, 2);
            return jsonString;
                    
        }
        catch(error){
            return undefined;
            console.error('Error getting guild member:', error);
        }
    }


}

export default DiscordServiceAgent;
