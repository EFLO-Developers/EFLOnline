import React, { useEffect, useState  } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import EFLOAuthServiceAgent from '../../../serviceAgents/EFLOAuthServiceAgent/EFLOAuthServiceAgent';
import Cookies from 'js-cookie';

const AuthorizedTemplate = ({children}) => {

  useEffect(() => {
        
    EFLOAuthServiceAgent.ValidateAuthToken().then(res => {
      //get discord member

    }).catch(error => {
        console.log("Token not found or valid");
        window.location = "/login";
        //alert("Redirect to login from auth template - token not found or valid");
    });
    
  }, []);

    return(        
        <div>
            {children}
        </div>
    );
};


export default AuthorizedTemplate;