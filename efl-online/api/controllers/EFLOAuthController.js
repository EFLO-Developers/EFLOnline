// server/controllers/userController.js

import { v4 as uuidv4 } from 'uuid';
import User from '../models/User.js';
import AuthToken from '../models/AuthToken.js';
import axios from 'axios';

export const HelloWorld = async(req, res) => {
  return res.status(200).json( 'HELLO WORLD' );
};

export const getUsers = async (req, res) => {
  try {
    const users = await User.findAll();

    const testUser = {
      UserId: uuidv4(),
      DiscordId: 'asd342-fswe34-fsdfsd'
    };

    console.log(testUser.UserId);

    res.json(users);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to fetch users' });
  }
};


export const GetActiveUser = async (req, res) => {
  
  try {
    //required paramaters
    //eflo_access_token
    const { eflo_access_token: authTokenId } = req.body;
    
    const eflo_member = {
      Id: null,
      DiscordId : null,
      Nick : null
    };

    if (!authTokenId) {
      tokenStatus.error = 'Missing required parameters';
      return res.status(400).json({ tokenStatus });
    }

    const existingAuthToken = await AuthToken.findOne({ where: { TokenId: authTokenId } });

    if (!existingAuthToken) {
      return res.status(404).json('Auth token not found');
    }

    const user = await User.findOne({ where: { UserId: existingAuthToken.UserId } });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    const bearer = existingAuthToken.DiscordAccessToken;
    const endpoint = `https://discord.com/api/users/@me/guilds/${process.env.REACT_APP_DISCORD_EFLSERVERID}/member`;

    try {


      //to avoid rate limits, only update nickname every 10 minutes at most
      var refreshPeriod = 600;
      if(user.UpdateDate < (Date.now() - (refreshPeriod * 1000))){
        // Validate the auth token using the Discord API
        const memberResponse = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${bearer}`
          }
        });

        const member = memberResponse.data;

        // Update user info if necessary
        if (user.DiscordNick !== member.nick) {
          user.DiscordNick = member.nick;
          user.UpdateDate = new Date();
          await user.save();
        }
      }

      const eflo_member = {
        Id: user.UserId,
        DiscordId: user.DiscordId,
        Nick: user.DiscordNick
      };

      return res.status(200).json({ eflo_member });

    } catch (error) {
      console.log('Error validating auth token with Discord:', error);
      return res.status(500).json({ error: `Failed to validate auth token with Discord : ${error}` });
    }

  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: `Failed to fetch user : ${error}` });
  }
};



export const GenerateAuthToken = async (req, res) => {
  try {
    const { DiscordAccessToken, DiscordRefreshToken, DiscordId, ExpirationTime } = req.body;

    if (!DiscordAccessToken || !DiscordId || !ExpirationTime) {
      return res.status(400).json({ error: 'Missing required parameters' + DiscordAccessToken + "|" + DiscordId + "|" + ExpirationTime });
    }

    // Check if user exists
    let user = await User.findOne({ where: { DiscordId } });

    if (!user) {
      //check if the access token is valid and the id matches the given id
      const endpoint = `https://discord.com/api/users/@me/guilds/${process.env.REACT_APP_DISCORD_EFLSERVERID}/member`;

      console.log(`Getting discord Member ---------------> ${endpoint}`);

      try {

        var bearer = DiscordAccessToken;
        // Validate the auth token using the Discord API
        const memberResponse = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${bearer}`
          }
        });

        
        const member = memberResponse.data;

        if(member.user.id == DiscordId){
          // Create new user
          user = await User.create({
            UserId: uuidv4(),
            DiscordId,
            Nick: member.nick,
            CreateDate: new Date(), // Current date and time
            UpdateDate: new Date(), // Current date and time
            LastLoginDate: new Date() // Current date and time
          });
        }
        else{
          return res.status(400).json({ error: 'Failed to validate given discordId'});
        }
      } catch(error){
        return res.status(400).json({ error: `Failed to validate access_token : ${error}`});
      }
    }

    // Check if user has an auth token already
    const existingAuthToken = await AuthToken.findOne({ where: { UserId: user.UserId } });

    if (existingAuthToken) {
      // Delete the existing auth token
      await AuthToken.destroy({ where: { UserId: user.UserId } });
    }

    // Create new auth token
    const authToken = await AuthToken.create({
      TokenId: uuidv4(),
      UserId: user.UserId,
      GrantDate: Date.now(),
      ExpireDate: new Date(Date.now() + ExpirationTime),
      DiscordAccessToken: DiscordAccessToken,
      DiscordRefreshToken: DiscordRefreshToken
    });

    const AuthTokenId = authToken.TokenId;

    res.status(201).json({ AuthTokenId });
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'Failed to create or update user' });
  }
};



export const ValidateAuthToken = async (req, res) => {
  try {
    const { eflo_access_token: authTokenId } = req.body;

    const tokenStatus = {
      valid: false,
      refreshed: false,
      error: "",
    };

    const eflo_member = {
      Id: 0,
      DiscordId : 0,
      Nick : ""
    };

    if (!authTokenId) {
      tokenStatus.error = 'Missing required parameters';
      return res.status(400).json({ tokenStatus });
    }

    const existingAuthToken = await AuthToken.findOne({ where: { TokenId: authTokenId } });

    if (!existingAuthToken) {
      tokenStatus.error = 'Auth token not found';
      return res.status(404).json({ tokenStatus });
    }

    const bearer = existingAuthToken.DiscordAccessToken;
    const endpoint = "https://discord.com/api/v10/users/@me";



    try {

      //Validate the auth token using the Discord API
      const memberResponse = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${bearer}`
        }
      });

      // If the auth token is valid, return true
      tokenStatus.valid = true;
      tokenStatus.refreshed = false;

      return res.status(200).json({ tokenStatus });
    } catch (error) {
      console.log('Auth token is invalid, attempting to refresh:', error);

      // If the auth token is invalid, attempt to refresh it
      const refreshToken = existingAuthToken.DiscordRefreshToken;
      const params = new URLSearchParams({
        client_id: process.env.REACT_APP_DISCORD_CLIENTID,
        client_secret: process.env.REACT_APP_DISCORD_CLIENTSECRET,
        grant_type: 'refresh_token',
        refresh_token: refreshToken,
        redirect_uri: process.env.REACT_APP_DISCORD_CALLBACK
      });



      try {
        const response = await axios.post('https://discord.com/api/oauth2/token', params, {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          }
        });

        // Update the auth token with the new access token and refresh token
        existingAuthToken.DiscordAccessToken = response.data.access_token;
        existingAuthToken.DiscordRefreshToken = response.data.refresh_token;
        existingAuthToken.ExpireDate = new Date(Date.now() + response.data.expires_in * 1000);
        await existingAuthToken.save();

        // Validate the auth token using the Discord API
        bearer = existingAuthToken.DiscordAccessToken;
        const memberResponse = await axios.get(endpoint, {
          headers: {
            Authorization: `Bearer ${bearer}`
          }
        });

        // Return true after refreshing the token
        tokenStatus.valid = true;
        tokenStatus.refreshed = true;
        return res.status(200).json({ tokenStatus});
      } catch (refreshError) {
        console.log('Refresh token is invalid, deleting tokens:', refreshError);

        // If the refresh token is invalid, delete all tokens associated with the user
        //await AuthToken.destroy({ where: { UserId: existingAuthToken.UserId } });

        // Return false
        tokenStatus.error = 'Invalid refresh token';
        return res.status(401).json({ tokenStatus });
      }
    }
  } catch (error) {
    console.log(error);
    return res.status(500).json({ error: 'Failed to validate auth token' });
  }
};