import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import EFLOAuthServiceAgent from './EFLOAuthServiceAgent/EFLOAuthServiceAgent';

/**
 * ApproverServiceAgent provides static methods for approving or rejecting
 * point task submissions and attribute updates via the EFLO API.
 * All methods are asynchronous and return Promises.
 */
class ApproverServiceAgent {
    /**
     * Fetches all pending updates for approval.
     * @returns {Promise<object>} The pending updates data.
     */
    static async GetPendingUpdates() {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "Approver/PendingUpdates";
        try {
            const response = await axios.get(`${baseURL}${endpoint}`, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error getting pending updates:', error);
            throw error;
        }
    }

    /**
     * Processes a point task submission for approval or rejection.
     * @param {number} pointTaskSubmissionId
     * @param {string|null} approvedDate
     * @param {string|null} rejectedDate
     * @param {string|null} rejectReason
     * @returns {Promise<object>} The API response data.
     */
    static async ProcessPointTaskSubmission(pointTaskSubmissionId, approvedDate, rejectedDate, rejectReason) {
        const data = {
            PointTaskSubmissionId: pointTaskSubmissionId,
            ApprovedDate: approvedDate,
            RejectedDate: rejectedDate,
            RejectReason: rejectReason
        };

        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "Approver/ProcessPointTaskSubmission";
        try {
            const response = await axios.post(`${baseURL}${endpoint}`, data, {
                headers: {
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache',
                    'Expires': '0',
                    'Authorization': `Bearer ${eflo_access_token}`
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error processing point task submission:', error);
            throw error;
        }
    }

    /**
     * Processes multiple attribute updates for approval or rejection.
     * Each update is sent as a separate API call.
     * @param {Array<object>} attributeUpdates - Array of attribute update objects
     * @param {string|null} approvedDate
     * @param {string|null} rejectedDate
     * @param {string|null} rejectReason
     * @returns {Promise<Array<object>>} Array of API response data for each update.
     */
    static async ProcessAttributeUpdates(attributeUpdates, approvedDate, rejectedDate, rejectReason) {
        const eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();
        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL;
        const endpoint = "Approver/ProcessAttributeUpdate";
        try {
            const responses = await Promise.all(attributeUpdates.map(async (update) => {
                const attr_update = {
                    AttributeUpdateId: update.AttributeUpdateId,
                    ApprovedDate: approvedDate,
                    RejectedDate: rejectedDate,
                    RejectReason: rejectReason
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
            console.error('Error processing attribute updates:', error);
            throw error;
        }
    }
}

export default ApproverServiceAgent;