import usePersistedState from "../../serviceAgents/usePersistedState";
import { useAlert } from '../../context/AlertContext';

// Alerts component displays alert messages from context
const Alerts = () => {
    // Get alerts array and removeAlert function from AlertContext
    const { alerts, removeAlert } = useAlert();

    return (
        <div className="alerts">
            {/* Map through alerts and render each as a Bootstrap alert */}
            {alerts.map((alert, index) => (
                <div
                    key={index}
                    className={`alert alert-${alert.type} alert-dismissible fade show`}
                    role="alert"
                >
                    {/* Display the alert message */}
                    <strong>{alert.message}</strong>
                </div>
            ))}
        </div>
    );
};

export default Alerts;