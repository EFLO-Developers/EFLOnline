

import DashboardTemplate from "../../../layout/PageTemplates/Dashboard";

export default function AdminDash(){
    return(

        <DashboardTemplate>  

<           div className="container-fluid py-4">
                <div className="row">
                    <h2 className="mb-0">Admin Dashboard</h2>
                    <p className="mb-4 ms-1">This is a simple dashboard with some statistics and charts.</p>
                </div>
            </div>
        
        </DashboardTemplate>  
    );
};