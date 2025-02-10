import React, { useEffect, useState  } from 'react';
import axios from 'axios';
import Cookies from 'js-cookie';
import EFLOAuthServiceAgent from './EFLOAuthServiceAgent/EFLOAuthServiceAgent';

class ApproverServiceAgent  {

    
    static async GetPendingUpdates(){
        
        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL        
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

    static async ProcessPointTaskSubmission(pointTaskSubmissionId, approvedDate, rejectedDate, rejectReason){


        var data = {
            PointTaskSubmissionId : pointTaskSubmissionId,
            ApprovedDate : approvedDate,
            RejectedDate : rejectedDate,
            RejectReason : rejectReason
        };

        console.log(data);

        
        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL        
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
            console.error('Error getting pending updates:', error);
            throw error;
        }
    }

    
    //UPSERT AttributeUpdate
    static async ProcessAttributeUpdates(attributeUpdates, approvedDate, rejectedDate, rejectReason){


        //for each child "attribute_update in the pending updates array, send an api call with the individual attribute upate as teh apyload

        var eflo_access_token = EFLOAuthServiceAgent.GetActiveToken();

        const baseURL = process.env.REACT_APP_EFLO_API_BASEURL
        
        const endpoint = `Approver/ProcessAttributeUpdate`;
        try {
            const responses = await Promise.all(attributeUpdates.map(async (update) => {

                var attr_update = {
                    AttributeUpdateId: update.AttributeUpdateId,
                    ApprovedDate : approvedDate,
                    RejectedDate : rejectedDate,
                    RejectReason : rejectReason
                }
                
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
    

}
export default ApproverServiceAgent;