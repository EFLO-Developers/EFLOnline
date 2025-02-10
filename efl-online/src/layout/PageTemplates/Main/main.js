
import React from 'react';

import SideNav from '../../SideNav'
import TopNav from '../../TopNav'
import Footer from '../../Footer'
import Alerts from '../../../components/Alerts/alerts';

const MainTemplate = ({children}) => {
    return(
            <div className=" App g-sidenav-show  bg-gray-100">

                {/*Sidenav*/}
                <SideNav />
        
                {/*Main Content*/}
                <main className="main-content position-relative max-height-vh-100 h-100 border-radius-lg ">
                    <TopNav />
                        
                    {children}
  
                    <Footer />
                </main>


                
                <Alerts />  
            </div>
    );
};


export default MainTemplate;