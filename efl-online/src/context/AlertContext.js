import React, { createContext, useState, useContext } from 'react';

const AlertContext = createContext();

export const useAlert = () => useContext(AlertContext);

export const AlertProvider = ({ children }) => {
    const [alerts, setAlerts] = useState([]);

    const addAlert = (type, message) => {
        setAlerts([...alerts, { type, message }]);

        setTimeout(() => {
            removeAlert(alerts.length - 1);
        }, 3000);
    };

    const removeAlert = (index) => {
        setAlerts(alerts.filter((_, i) => i !== index));
    };

    return (
        <AlertContext.Provider value={{ alerts, addAlert, removeAlert }}>
            {children}
        </AlertContext.Provider>
    );
};