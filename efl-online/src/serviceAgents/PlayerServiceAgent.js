import axios from 'axios';
import EFLOAuthServiceAgent from './EFLOAuthServiceAgent/EFLOAuthServiceAgent';

/**
 * PlayerServiceAgent provides static methods for player-related API calls.
 * All methods are asynchronous and return Promises.
 */
class PlayerServiceAgent {
    /**
     * Gets all archetypes from the API.
     * @returns {Promise<object>} Archetypes data.
     */
    static async GetArchetypes() {
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "Archetypes/AllArchetypes";
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting archetypes:', error);
            throw error;
        }
    }

    /**
     * Gets all point task types from the API.
     * @returns {Promise<object>} Point task types data.
     */
    static async GetPointTaskTypes() {
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "PointTaskType";
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting point task types:', error);
            throw error;
        }
    }

    /**
     * Gets all players (admin only).
     * @returns {Promise<object>} All players data.
     */
    static async GetAllPlayers() {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "Player";
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting all players:', error);
            throw error;
        }
    }

    /**
     * Gets all active players.
     * @returns {Promise<Array>} Active players data.
     */
    static async GetActivePlayers() {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "Player/Active";
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            const data = response.data;
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error('Error getting Users active Players:', error);
            throw error;
        }
    }

    /**
     * Gets all active players for the current user.
     * @returns {Promise<Array>} Active user players data.
     */
    static async GetActiveUserPlayers() {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "Player/ActiveUser";
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            const data = response.data;
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error('Error getting Users active Players:', error);
            throw error;
        }
    }

    /**
     * Gets all players for a specific user.
     * @param {string|number} userId
     * @returns {Promise<Array>} User's players data.
     */
    static async GetAllUserPlayers(userId) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Player/UserPlayers/${userId}`;
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`,
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0'
                }
            });
            const data = response.data;
            return Array.isArray(data) ? data : [data];
        } catch (error) {
            console.error('Error getting Users Players:', error);
            throw error;
        }
    }

    /**
     * Gets a player by playerId.
     * @param {string|number} playerId
     * @returns {Promise<object>} Player data.
     */
    static async GetPlayer(playerId) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Player/${playerId}`;
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`,
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting player:', error);
            throw error;
        }
    }

    /**
     * Upserts (creates or updates) a player.
     * @param {object} player - Player object to upsert.
     * @returns {Promise<object>} API response data.
     */
    static async UpsertPlayer(player) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Player`;
        try {
            const response = await axios.post(baseURL + endpoint, player, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error upserting player:', error);
            throw error;
        }
    }

    /**
     * Retires a player by playerId.
     * @param {string|number} playerId
     * @returns {Promise<object>} API response data.
     */
    static async RetirePlayer(playerId) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Player/Retire/${playerId}`;
        try {
            const response = await axios.post(baseURL + endpoint, null, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error retiring player:', error);
            throw error;
        }
    }

    /**
     * Upserts (creates or updates) point task submissions for one or more tasks.
     * @param {Array<object>} pendingTasks - Array of point task objects.
     * @returns {Promise<Array<object>>} Array of API response data.
     */
    static async UpsertPointTaskSubmission(pendingTasks) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Player/PointTaskSubmission`;
        try {
            const responses = await Promise.all(pendingTasks.map(async (task) => {
                const task_submission = {
                    "point_task_submission": task
                };
                const response = await axios.post(baseURL + endpoint, task_submission, {
                    headers: {
                        'Authorization': `Bearer ${eflo_access_token}`
                    }
                });
                return response.data;
            }));
            return responses;
        } catch (error) {
            console.error('Error upserting point task submissions:', error);
            throw error;
        }
    }

    /**
     * Deletes a point task submission by its ID.
     * @param {string|number} pointTaskSubmissionId
     * @returns {Promise<object>} API response data.
     */
    static async DeletePointTaskSubmission(pointTaskSubmissionId) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Player/DeletePointTaskSubmission/${pointTaskSubmissionId}`;
        try {
            const response = await axios.delete(baseURL + endpoint, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error deleting point task submission:', error);
            throw error;
        }
    }

    /**
     * Upserts (creates or updates) attribute updates for one or more attributes.
     * @param {Array<object>} pendingUpdates - Array of attribute update objects.
     * @returns {Promise<Array<object>>} Array of API response data.
     */
    static async UpsertPlayerAttributeUpdates(pendingUpdates) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Player/AttributeUpdate`;
        try {
            const responses = await Promise.all(pendingUpdates.map(async (update) => {
                const attr_update = {
                    "attribute_update": update.attribute_update
                };
                const response = await axios.post(baseURL + endpoint, attr_update, {
                    headers: {
                        'Authorization': `Bearer ${eflo_access_token}`
                    }
                });
                return response.data;
            }));
            return responses;
        } catch (error) {
            console.error('Error upserting player attribute updates:', error);
            throw error;
        }
    }

    /**
     * Assigns a player to a team.
     * @param {string|number} playerId
     * @param {string|number} teamId
     * @returns {Promise<object>} API response data.
     */
    static async AssignToTeam(playerId, teamId) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Player/AssignTeam`;
        const data = {
            "playerId": playerId,
            "teamId": teamId
        };
        try {
            const response = await axios.post(baseURL + endpoint, data, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error assigning player to team:', error);
            throw error;
        }
    }

    /**
     * Gets the update history for a player.
     * @param {string|number} playerId
     * @returns {Promise<object>} Player update history data.
     */
    static async GetPlayerUpdateHistory(playerId) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Player/PlayerUpdates/${playerId}`;
        try {
            const response = await axios.get(baseURL + endpoint, {
                headers: {
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting player update history:', error);
            throw error;
        }
    }
}

export default PlayerServiceAgent;