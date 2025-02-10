import React, { useEffect, useState  } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';


import DiscordServiceAgent from '../../../serviceAgents/DiscordServiceAgent/DiscordServiceAgent.js';
import EFLOAuthServiceAgent from '../../../serviceAgents/EFLOAuthServiceAgent/EFLOAuthServiceAgent.js';


const DiscordCallback = () => {

    const location = useLocation();

    const [status, setStatus] = useState('');
    const [bearer, setBearer] = useState('');
    const [jsonData, setJsonData] = useState('');
    const [guildData, setGuildData] = useState('');

    const [dsa, setDsa] = useState(null);
    const [error, setError] = useState(null);

    
    const [refresh, SetRefreshToken] = useState(null);


  useEffect(() => {

    
    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    setStatus("Trying");


    let env;

    //create a switch, if the location is production, use the production env, otherwise use the development env
    if (window.location.hostname.includes(process.env.REACT_APP_PROD_BASEURL)) {
        env = 'PROD';
    } else if (window.location.hostname.includes(process.env.REACT_APP_DEV_BASEURL)) {
        env = 'DEV';
    } else {
        env = 'UNKNOWN'; // Fallback case
    }

    
    const clientId = process.env.REACT_APP_DISCORD_CLIENTID;
    const clientSecret = process.env.REACT_APP_DISCORD_CLIENTSECRET;
    const redirectUri = (env === "PROD" ? process.env.REACT_APP_PROD_DISCORD_CALLBACK : process.env.REACT_APP_DEV_DISCORD_CALLBACK);
    const efl_id = process.env.REACT_APP_DISCORD_EFLSERVERID;


        if (code) {

            //GET ACCESS TOKEN                    
            DiscordServiceAgent.GetDiscordAuthToken(clientId, clientSecret, redirectUri, code).then(rsp => {

                //generate eflo auth token paramaters
                var params = {
                    DiscordId : "",
                    DiscordAccessToken : rsp.access_token,
                    DiscordRefreshToken : rsp.refresh_token,
                    ExpirationTime: rsp.expires_in,
                };


                DiscordServiceAgent.GetDiscordGuildMember(rsp.access_token, efl_id).then(rsp => {

                    if(rsp.status == 404)
                    {
                        window.location.href = "/discord";
                    }
                    else{
                        setGuildData(rsp);
                        console.log("GuildData: ", rsp);

                        params.DiscordId = rsp.data.user.id;

                        //generate eflo auth token paramaters
                        EFLOAuthServiceAgent.GenerateAuthToken(params).then(rsp => {  
                            
                            if(rsp == undefined){
                               alert("Error generating access token");
                               return;
                            }
                            

                            params = {
                                eflo_access_token : rsp
                            };


                            console.log(`GENERATED ACCESS TOKEN: ${params.eflo_access_token}`);

                            EFLOAuthServiceAgent.GetActiveUser(params).then(rsp => {

                                    if(rsp.ForumNick == undefined){
                                        window.location.href = "/setup";
                                    }
                                    else{
                                        window.location.href = '/';
                                    }
                                
                            }).catch(error => {
                                console.error('Error getting active user in callback:', error);
                                window.location.href = '/login';
                            });



                        }).catch(error => {
                            console.error('Error generating access token:', error);
                            window.location.href = '/login';
                        });
                    }

                }).catch(error => {                
                    console.error('Error getting guild member:', error);
                    window.location.href = '/login';
                });


            }).catch(error => {                
                console.error('Error getting bearer:', error);
                window.location.href = '/login';
            });


        }




  }, [location]);

  return (
        
        <div>
            {/*<h5>Guild Member</h5>
            <pre>{guildData}</pre>
            <br/>
            <a href="/login"> return to login </a>    

            */}

        </div>


  );
};

export default DiscordCallback;