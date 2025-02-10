import React, { useEffect, useState  } from 'react';
import { useLocation } from 'react-router-dom';
import { routes } from '../../routes';

import EFLOAuthServiceAgent from '../../serviceAgents/EFLOAuthServiceAgent/EFLOAuthServiceAgent';
import { error } from 'jquery';
import Cookies from 'js-cookie';
import usePersistedState from '../../serviceAgents/usePersistedState';

export default function TopNav(){
        
    const location = useLocation();

    const matchRoute = (route, pathname) => {
        const routePattern = new RegExp(`^${route.path.replace(/:\w+/g, '[^/]+')}$`);
        return routePattern.test(pathname);
    };

  const currentRoute = routes.find(route => matchRoute(route, location.pathname));
  const bc_category = currentRoute ? currentRoute.category : 'udf';
  const bc_title = currentRoute ? currentRoute.title : 'udf';



    const [member, SetMember] = usePersistedState('ActiveUser', null);
    const [userPlayers, SetUserPlayers] = usePersistedState('ActiveUserPlayers', null);
    const [offPlayer, SetOffPlayer] = usePersistedState('ActiveOffPlayer', null);
    const [defPlayer, SetDefPlayer] = usePersistedState('ActiveDefPlayer', null);

    useEffect(() => {

        if (member == null){

            EFLOAuthServiceAgent.GetActiveUser().then(res => {

                if(res != undefined)
                {
                    if(res.ForumNick == null){
                        window.location.href = "/setup";                    
                    }

                    SetMember(res);
                }
                else{                    
                    window.location.href = "/login";
                    //alert("Redirect to login from top nav - active user not found from token");
                }
            }).catch(error => {
                console.log(error , 'Could not get user information');
            });
        }
    }, []);

    

    const handleLogOut = (e) => {
        e.preventDefault();

        //delete cookie with key
        const TokenKey = "eflo.auth";
        Cookies.remove(TokenKey);

        SetMember(null);
        SetOffPlayer(null);
        SetDefPlayer(null);
        SetUserPlayers(null);
        
        window.location.href = "/login";

    };

    return (
        
            <nav className="navbar navbar-main navbar-expand-lg position-sticky top-1 px-0 mx-4 shadow-none border-radius-xl z-index-sticky" id="navbarBlur" data-scroll="true">
            <div className="container-fluid py-1 px-3">
                <div className="sidenav-toggler sidenav-toggler-inner d-xl-block d-none me-2 ">
                <a href="javascript:;" className="nav-link text-body p-0">
                    <div className="sidenav-toggler-inner">
                    <i className="sidenav-toggler-line"></i>
                    <i className="sidenav-toggler-line"></i>
                    <i className="sidenav-toggler-line"></i>
                    </div>
                </a>
                </div>
                <nav aria-label="breadcrumb">
                <ol className="breadcrumb bg-transparent mb-0 pb-0 pt-1 px-0 me-sm-6 me-5">
                    <li className="breadcrumb-item text-sm"><a className="opacity-5 text-dark" href="javascript:;">{bc_category}</a></li>
                    <li className="breadcrumb-item text-sm text-dark active" aria-current="page">{bc_title}</li>
                </ol>
                </nav>
                <div className="collapse navbar-collapse mt-sm-0 mt-2 me-md-0 me-sm-4" id="navbar">



                <div className="ms-md-auto pe-md-3 d-flex align-items-center">
                    
                </div>



                <ul className="navbar-nav  justify-content-end">
                    <li className="nav-item d-flex align-items-center">

                    {member ? (
                                <a href={`/profile/${member.Id}`} className="nav-link text-body font-weight-bold px-0">
                                    <i className="fa fa-user me-sm-1"></i>
                                    <span className="d-sm-inline d-none">Hello, {member.DiscordNick}</span>
                                </a>
                            ) : (

                                <span>...</span>
                            )}

                            
                    </li>
                    <li className="nav-item d-flex align-items-center">
                        <a href="#" onClick={handleLogOut} className="nav-link">
                            Log Out
                        </a>                    
                    </li>

                    <li className="nav-item d-xl-none ps-3 d-flex align-items-center">
                    <a href="javascript:;" className="nav-link text-body p-0" id="iconNavbarSidenav">
                        <div className="sidenav-toggler-inner">
                        <i className="sidenav-toggler-line"></i>
                        <i className="sidenav-toggler-line"></i>
                        <i className="sidenav-toggler-line"></i>
                        </div>
                    </a>
                    </li>
                    <li className="nav-item px-3 d-flex align-items-center">
                    <a href="javascript:;" className="nav-link text-body p-0">
                        <i className="fa fa-cog fixed-plugin-button-nav cursor-pointer"></i>
                    </a>
                    </li>
                    
                </ul>
                </div>
            </div>
            </nav>
            
    );
};