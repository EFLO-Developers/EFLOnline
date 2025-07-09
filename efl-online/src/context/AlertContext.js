import React, { createContext, useState, useContext, useCallback } from 'react';

// Create the AlertContext
const AlertContext = createContext();

/**
 * Custom hook to access the alert context.
 * @returns {object} - { alerts, addAlert, removeAlert }
 */
export const useAlert = () => useContext(AlertContext);

/**
 * AlertProvider manages alert state and provides alert functions to children.
 * @param {object} props - expects children (React nodes)
 */
export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    /**
     * Adds a new alert and schedules its removal after 3 seconds.
     * @param {string} type - The type of alert (e.g., 'success', 'danger')
     * @param {string} message - The alert message
     */
    const addAlert = useCallback((type, message) => {
        setAlerts(prevAlerts => {
            const newAlerts = [...prevAlerts, { type, message }];
            // Remove the alert after 3 seconds
            setTimeout(() => {
                setAlerts(currentAlerts => currentAlerts.slice(1));
            }, 3000);
            return newAlerts;
        });
    }, []);

    /**
     * Removes an alert by index.
     * @param {number} index - The index of the alert to remove
     */
    const removeAlert = useCallback((index) => {
        setAlerts(prevAlerts => prevAlerts.filter((_, i) => i !== index));
    }, []);

    return (
        <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
            {children}
        </AlertContext.Provider>
    );
};