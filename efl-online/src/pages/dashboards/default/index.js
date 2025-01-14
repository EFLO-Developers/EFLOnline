import DashboardTemplate from "../../../layout/PageTemplates/Dashboard";
import AuthorizedTemplate from "../../../layout/PageTemplates/Authorized";
import MainTemplate from "../../../layout/PageTemplates/Main/main";

export default function DefaultDash(){
    return(
        <AuthorizedTemplate>
            <div>
                <MainTemplate>            
                    <div className="container-fluid py-4">
                        <div className="row">
                            <h2 className="mb-0">General Dashboard</h2>
                            <p className="mb-4 ms-1">This is a simple dashboard with some statistics and charts.</p>
                            <div className="col-lg-7">
                        
                            </div>
                        </div>
                
                    </div>
                    
                </MainTemplate>
            </div>
        </AuthorizedTemplate>

    );
};