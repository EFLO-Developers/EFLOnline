import axios from 'axios';

/**
 * LeagueServiceAgent provides static methods for retrieving league and team data from the EFLO API.
 * All methods are asynchronous and return Promises.
 */
class LeagueServiceAgent {
    /**
     * Retrieves all teams from the EFLO API.
     * @returns {Promise<object>} The teams data.
     */
    static async GetTeams() {
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "Team";
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
            console.error('Error getting teams:', error);
            throw error;
        }
    }

    /**
     * Retrieves details for a specific team by teamId from the EFLO API.
     * @param {string|number} teamId - The ID of the team to retrieve.
     * @returns {Promise<object>} The team details data.
     */
    static async GetTeamDetails(teamId) {
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `Team/${teamId}`;
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
            console.error('Error getting team details:', error);
            throw error;
        }
    }
}

export default LeagueServiceAgent;