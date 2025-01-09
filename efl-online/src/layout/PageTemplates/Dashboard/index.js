
import React from 'react';

import SideNav from '../../../layout/SideNav'
import TopNav from '../../../layout/TopNav'
import Footer from '../../../layout/Footer'

const DashboardTemplate = ({children}) => {
    return(
            <div className=" App g-sidenav-show  bg-gray-100">

                {/*Sidenav*/}
                <SideNav />

                <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                    <TopNav />
                        
                    {children}

                    <Footer />
                </main>

            </div>
    );
};


export default DashboardTemplate;