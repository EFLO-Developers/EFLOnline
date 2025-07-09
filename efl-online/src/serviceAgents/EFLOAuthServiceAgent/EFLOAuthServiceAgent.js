import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';

/**
 * EFLOAuthServiceAgent provides static methods for EFLO authentication and user management.
 * All methods are asynchronous and return Promises.
 */
class EFLOAuthServiceAgent {
    /**
     * Retrieves the active EFLO auth token from cookies.
     * Redirects to login if not found.
     * @returns {string|undefined} The token string or undefined if not found.
     */
    static GetActiveToken() {
        const TokenKey = "eflo.auth";
        const eflo_access_token = Cookies.get(TokenKey);

        if (!eflo_access_token) {
            console.log("Token not found");
            window.location.href = "/login";
            return undefined;
        }

        return eflo_access_token;
    }

    /**
     * Generates a new EFLO auth token and stores it in cookies.
     * @param {object} params - Must include DiscordId, DiscordAccessToken, DiscordRefreshToken, ExpirationTime
     * @returns {Promise<string>} The new token ID.
     */
    static async GenerateAuthToken(params) {
        const requiredParams = ['DiscordId', 'DiscordAccessToken', 'DiscordRefreshToken', 'ExpirationTime'];

        // Validate params object
        for (const param of requiredParams) {
            if (!params.hasOwnProperty(param)) {
                throw new Error(`Missing required parameter in Generate Token: ${param}`);
            }
        }

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "EFLOAuth/GenerateAuthToken";

        try {
            const response = await axios.post(baseURL + endpoint, params);
            const tokenId = response.data.AuthTokenId;

            const TokenKey = "eflo.auth";
            // Set or update cookie where key = TokenKey, expires in 7 days
            Cookies.set(TokenKey, tokenId, { expires: 7 });

            return tokenId;
        } catch (error) {
            console.error('Error generating auth token:', error);
            throw error;
        }
    }

    /**
     * Validates the current EFLO auth token.
     * @returns {Promise<string>} The token status.
     */
    static async ValidateAuthToken() {
        const token = EFLOAuthServiceAgent.GetActiveToken();
        if (!token) return;

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "EFLOAuth/ValidateAuthToken";

        try {
            const response = await axios.get(baseURL + endpoint, {
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

    /**
     * Gets all users from the EFLO API.
     * @returns {Promise<object>} The users data.
     */
    static async GetAllUsers() {
        try {
            const token = EFLOAuthServiceAgent.GetActiveToken();
            if (!token) return;

            const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
            const endpoint = "User";

            const response = await axios.get(baseURL + endpoint, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            });

            return response.data;
        } catch (error) {
            console.error('Error getting all users:', error);
            throw error;
        }
    }

    /**
     * Gets the currently active user from the EFLO API.
     * @returns {Promise<object>} The active user data.
     */
    static async GetActiveUser() {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        if (!eflo_access_token) return;

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "User/ActiveUser";

        try {
            const response = await axios.post(baseURL + endpoint, {}, {
                headers: {
                    Authorization: `Bearer ${eflo_access_token}`
                }
            });

            return response.data.eflo_member;
        } catch (error) {
            console.error('Error getting active user:', error);
            throw error;
        }
    }
}

export default EFLOAuthServiceAgent;
