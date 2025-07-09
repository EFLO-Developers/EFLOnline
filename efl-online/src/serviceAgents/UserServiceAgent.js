import axios from 'axios';
import EFLOAuthServiceAgent from './EFLOAuthServiceAgent/EFLOAuthServiceAgent';

/**
 * UserServiceAgent provides static methods for user-related API calls.
 * All methods are asynchronous and return Promises.
 */
class UserServiceAgent {
    /**
     * Retrieves a user by their UserId.
     * @param {string|number} UserId - The user's ID.
     * @returns {Promise<object>} The user data.
     */
    static async GetUser(UserId) {
        if (UserId == null) {
            throw new Error('Missing required parameter in GetUser');
        }

        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `User/${UserId}`;

        try {
            const response = await axios.get(baseURL + endpoint, {
                headers: {
                    Authorization: `Bearer ${eflo_access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting user:', error);
            throw error;
        }
    }

    /**
     * Updates a user with the provided eflo_member object.
     * @param {object} eflo_member - The user object to update (must include eflo_member.Id).
     * @returns {Promise<object>} The updated user data.
     */
    static async UpdateUser(eflo_member) {
        if (!eflo_member || !eflo_member.eflo_member || !eflo_member.eflo_member.Id) {
            throw new Error('Missing required parameter in UpdateUser');
        }

        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = `User/${eflo_member.eflo_member.Id}`;

        try {
            const response = await axios.put(baseURL + endpoint, eflo_member, {
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${eflo_access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error updating user:', error);
            throw error;
        }
    }
}

export default UserServiceAgent;
