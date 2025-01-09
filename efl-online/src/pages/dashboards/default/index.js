import DashboardTemplate from "../../../layout/PageTemplates/Dashboard";

export default function DefaultDash(){
    return(

        <DashboardTemplate>            
            <div className="container-fluid py-4">
                <div className="row">
                    <h2 className="mb-0">General Dashboard</h2>
                    <p className="mb-4 ms-1">This is a simple dashboard with some statistics and charts.</p>
                    <div className="col-lg-7">
                
                    </div>
                </div>
           
            </div>
            
        </DashboardTemplate>

    );
};