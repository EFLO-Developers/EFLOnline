import React, { useEffect, useState  } from 'react';
import axios from 'axios';

/**
 * DiscordServiceAgent provides static methods for interacting with the Discord API.
 * All methods are asynchronous and return Promises.
 */
class DiscordServiceAgent {

    /**
     * Exchanges an authorization code for a Discord OAuth2 access token.
     * @param {string} clientId - Discord client ID
     * @param {string} clientSecret - Discord client secret
     * @param {string} redirectUri - Redirect URI used in the OAuth2 flow
     * @param {string} code - Authorization code from Discord
     * @returns {Promise<object|undefined>} - Token response data or undefined on error
     */
    static async GetDiscordAuthToken(clientId, clientSecret, redirectUri, code) {
        const params = new URLSearchParams({
            client_id: clientId,
            client_secret: clientSecret,
            grant_type: 'authorization_code',
            code: code,
            redirect_uri: redirectUri,
        });

        try {
            const response = await axios.post(
                'https://discord.com/api/oauth2/token',
                params,
                {
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                }
            );

            // Log token details for debugging
            console.log('Access Token:', response.data.access_token);
            console.log('Refresh Token:', response.data.refresh_token);
            console.log('ExpiresIn:', response.data.expires_in);

            return response.data;
        } catch (error) {
            console.error('Error exchanging code for token:', error);
            return undefined;
        }
    }

    /**
     * Gets a Discord guild member for the authenticated user.
     * @param {string} bearer - OAuth2 access token
     * @param {string} guild_id - Discord guild (server) ID
     * @returns {Promise<{status: number, data: object|undefined}>}
     */
    static async GetDiscordGuildMember(bearer, guild_id) {
        try {
            const response = await axios.get(
                `https://discord.com/api/users/@me/guilds/${guild_id}/member`,
                {
                    headers: {
                        Authorization: `Bearer ${bearer}`,
                    },
                }
            );

            // Log member info for debugging
            console.log(`Guild Member: ${response.data.user.id} | ${response.data.nick}`);

            return {
                status: response.status,
                data: response.data,
            };
        } catch (error) {
            console.error('Error getting guild member:', error);
            return {
                status: error.response ? error.response.status : 500,
                data: undefined,
            };
        }
    }
}

export default DiscordServiceAgent;
