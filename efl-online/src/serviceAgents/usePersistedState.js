import { useState, useEffect } from 'react';

/**
 * Custom React hook to persist state to localStorage.
 * @param {string} key - The localStorage key to use.
 * @param {*} defaultValue - The default value if nothing is stored.
 * @returns {[any, Function]} The state and a setter function.
 */
function usePersistedState(key, defaultValue) {
    // Initialize state from localStorage or use defaultValue
    const [state, setState] = useState(() => {
        try {
            const storedValue = localStorage.getItem(key);
            return storedValue !== null ? JSON.parse(storedValue) : defaultValue;
        } catch (error) {
            console.error('Error reading localStorage key:', key, error);
            return defaultValue;
        }
    });

    // Update localStorage whenever state or key changes
    useEffect(() => {
        try {
            localStorage.setItem(key, JSON.stringify(state));
        } catch (error) {
            console.error('Error writing to localStorage key:', key, error);
        }
    }, [key, state]);

    return [state, setState];
}

export default usePersistedState;