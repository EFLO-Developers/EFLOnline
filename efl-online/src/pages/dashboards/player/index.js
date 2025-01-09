
import React from 'react';
import DashboardTemplate from "../../../layout/PageTemplates/Dashboard";

const PlayerDash = () => {
    return(
        <DashboardTemplate>    
            <div className="container-fluid py-4">
                <div className="row">
                    <h2 className="mb-0">Player Dashboard</h2>
                    <p className="mb-4 ms-1">This is a simple dashboard with some statistics and charts.</p>
                </div>
            </div>
        </DashboardTemplate>      
    );
};

export default PlayerDash;