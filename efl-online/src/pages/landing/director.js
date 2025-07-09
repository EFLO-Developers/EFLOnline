import { useEffect, useState } from "react";
import AuthorizedTemplate from "../../layout/PageTemplates/Authorized";
import TopNav from "../../layout/TopNav";

const DirectorLanding = () => {
    const [isAuthorizedInitialized, setIsAuthorizedInitialized] = useState(false);
    const [isTopNavInitialized, setIsTopNavInitialized] = useState(false);

    useEffect(() => {
        // Simulate the initialization of AuthorizedTemplate
        const initializeAuthorized = async () => {
            console.log("init auth template");
            // Simulate some async initialization logic
            await new Promise(resolve => setTimeout(resolve, 1000));

            console.log("auth template init finished");
            setIsAuthorizedInitialized(true);
        };

        const initializeTopNav = async () => {
            console.log("init top nav active user");
            // Simulate some async initialization logic
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            console.log("top nav init finished");
            setIsTopNavInitialized(true);
        };

        initializeAuthorized();
        initializeTopNav();
    }, []);

    useEffect(() => {
        if (isAuthorizedInitialized && isTopNavInitialized) {
                console.log("redirecting...");
                window.location = "/dashboard/eflo";
            }
    }, [isAuthorizedInitialized, isTopNavInitialized]);

return(
    <AuthorizedTemplate>
        <div style={{ display: 'none' }}><TopNav /></div>
    </AuthorizedTemplate>
);

};

export default DirectorLanding;
    