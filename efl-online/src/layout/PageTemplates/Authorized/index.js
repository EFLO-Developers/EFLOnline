import React, { useEffect, useState  } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';
import EFLOAuthServiceAgent from '../../../serviceAgents/EFLOAuthServiceAgent/EFLOAuthServiceAgent';
import Cookies from 'js-cookie';

const AuthorizedTemplate = ({children}) => {

  useEffect(() => {
    

    const TokenKey = "eflo.auth";
    const eflo_access_token = Cookies.get(TokenKey);

    if (!eflo_access_token) {
      console.log("Token not found");
      window.location.href = "/login";
      return;
    }

    const params = {
      eflo_access_token
    };


    EFLOAuthServiceAgent.ValidateAuthToken(params).then(res => {

      //get discord member


    }).catch(error => {
        console.log("Token not found or valid");
        window.location = "/login";
    });

  });

    return(        
        <div>
            {children}
        </div>
    );
};


export default AuthorizedTemplate;