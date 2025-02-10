import usePersistedState from "../../serviceAgents/usePersistedState";
import { useAlert } from '../../context/AlertContext';



const Alerts = () => {

    const { alerts, removeAlert } = useAlert();


    return(

        <div className="alerts">
            


            {alerts.map((alert, index) => (

                <div key={index} className={`alert alert-${alert.type} alert-dismissible fade show`} role="alert">
                    <strong>{alert.message}</strong>
                </div>
            ))}
        </div>
    )
};

export default Alerts;