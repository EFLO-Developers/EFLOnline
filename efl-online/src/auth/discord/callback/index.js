import React, { useEffect, useState  } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

import DiscordServiceAgent from '../../../serviceAgents/DiscordServiceAgent'

const DiscordCallback = () => {

    const location = useLocation();

    const [status, setStatus] = useState('');
    const [bearer, setBearer] = useState('');
    const [jsonData, setJsonData] = useState('');
    const [guildData, setGuildData] = useState('');

    const [dsa, setDsa] = useState(null);
    const [error, setError] = useState(null);


  useEffect(() => {

    
            //GET ACCESS TOKEN                    
            DiscordServiceAgent.HelloWorld().then(rsp => {            
                console.log("Hello World: ", rsp);
            }).catch(error => {                
                console.error('Error getting hello world:', error);
            });

    const params = new URLSearchParams(location.search);
    const code = params.get('code');

    setStatus("Trying");

    const clientId = "1326244369090478161";
    const clientSecret = "Shn9KEdoq6AfMb0URjlcEl6msWAgyqwU";
    const redirectUri = "https://eflo.io/auth/discord/callback";
    const efl_id = "333828099001286656";


        if (code) {

            //GET ACCESS TOKEN                    
            DiscordServiceAgent.GetDiscordAuthToken(clientId, clientSecret, redirectUri, code).then(rsp => {
                
                DiscordServiceAgent.GetDiscordGuildMember(rsp, efl_id).then(rsp => {
                    setGuildData(rsp);
                    console.log("GuildData: ", rsp);
                    window.location.href = '/';


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
            <br/>*/}
            <a href="/login"> return to login </a>    
        </div>


  );
};

export default DiscordCallback;