import React, { useEffect, useState  } from 'react';
import { routes } from '../../routes';


import logo from '../../assets/img/efl-logos/efl1000.png';
import whiteCurve from '../../assets/soft-ui/img/curved-images/white-curved.jpg';
import { error } from 'jquery';


function isActivePage(path) {
    // Look for a matching route
    const matchingRoute = routes.find(route => route.path === path);
  
    // If found in routes, return true; else return false
    return matchingRoute !== undefined;
  }

export default function SideNav(){
    // Get unique categories where there is at least one route that has ShowInNav = true
    const categories = [...new Set(routes.filter(route => route.ShowInNav).map(route => route.category))];



    return (
        
        <aside className="sidenav navbar navbar-vertical navbar-expand-xs border-0 border-radius-xl my-3 fixed-start ms-3 " id="sidenav-main">
            <div className="sidenav-header">
                <i className="fas fa-times p-3 cursor-pointer text-secondary opacity-5 position-absolute end-0 top-0 d-none d-xl-none" aria-hidden="true" id="iconSidenav"></i>
                <a className="navbar-brand m-0" href="/">
                    <img src={logo} className="navbar-brand-img h-100" alt="main_logo" />
                    <span className="ms-1 font-weight-bold">EFL Online</span>
                </a>
            </div>
            <hr className="horizontal dark mt-0" />
            <div className="collapse navbar-collapse  w-auto h-auto" id="sidenav-collapse-main">
                <ul className="navbar-nav">








                    {categories.map(category => (
                        <li key={category} className="nav-item">
                            <a data-bs-toggle="collapse" href={`#${category}`} className="nav-link active" aria-controls={category} role="button" aria-expanded="false">
                                <div className="icon icon-sm shadow-sm border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
                                    
                                    
                                {category === "Dashboard" ? (
                                    
                                    <svg width="16" height="16" fill="currentColor" className="bi bi-menu-button-wide-fill" viewBox="0 0 16 16">
                                        <path d="M1.5 0A1.5 1.5 0 0 0 0 1.5v2A1.5 1.5 0 0 0 1.5 5h13A1.5 1.5 0 0 0 16 3.5v-2A1.5 1.5 0 0 0 14.5 0zm1 2h3a.5.5 0 0 1 0 1h-3a.5.5 0 0 1 0-1m9.927.427A.25.25 0 0 1 12.604 2h.792a.25.25 0 0 1 .177.427l-.396.396a.25.25 0 0 1-.354 0zM0 8a2 2 0 0 1 2-2h12a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2H2a2 2 0 0 1-2-2zm1 3v2a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1v-2zm14-1V8a1 1 0 0 0-1-1H2a1 1 0 0 0-1 1v2zM2 8.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5m0 4a.5.5 0 0 1 .5-.5h6a.5.5 0 0 1 0 1h-6a.5.5 0 0 1-.5-.5"/>
                                    </svg>
                                ) : category === "Data" ? (
                                    
                                    <svg  width="16" height="16" fill="currentColor" className="bi bi-database-fill" viewBox="0 0 16 16">
                                        <path d="M3.904 1.777C4.978 1.289 6.427 1 8 1s3.022.289 4.096.777C13.125 2.245 14 2.993 14 4s-.875 1.755-1.904 2.223C11.022 6.711 9.573 7 8 7s-3.022-.289-4.096-.777C2.875 5.755 2 5.007 2 4s.875-1.755 1.904-2.223"/>
                                        <path d="M2 6.161V7c0 1.007.875 1.755 1.904 2.223C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777C13.125 8.755 14 8.007 14 7v-.839c-.457.432-1.004.751-1.49.972C11.278 7.693 9.682 8 8 8s-3.278-.307-4.51-.867c-.486-.22-1.033-.54-1.49-.972"/>
                                        <path d="M2 9.161V10c0 1.007.875 1.755 1.904 2.223C4.978 12.711 6.427 13 8 13s3.022-.289 4.096-.777C13.125 11.755 14 11.007 14 10v-.839c-.457.432-1.004.751-1.49.972-1.232.56-2.828.867-4.51.867s-3.278-.307-4.51-.867c-.486-.22-1.033-.54-1.49-.972"/>
                                        <path d="M2 12.161V13c0 1.007.875 1.755 1.904 2.223C4.978 15.711 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13v-.839c-.457.432-1.004.751-1.49.972-1.232.56-2.828.867-4.51.867s-3.278-.307-4.51-.867c-.486-.22-1.033-.54-1.49-.972"/>
                                    </svg>
                                ) : (
                                    <i className="ni ni-compass-04" aria-hidden="true"></i>
                                )}






                                </div>
                                <span className="nav-link-text ms-1">{category}</span>
                            </a>
                            <div className="collapse show" id={category}>
                                <ul className="nav ms-4 ps-3">
                                    {routes.filter(route => route.category === category && route.ShowInNav === true).map(route => (
                                        <li key={route.path} className={`nav-item ${isActivePage(route.path) ? 'active' : ''}`}>
                                            <a className="nav-link" href={route.path}>
                                                <span className="sidenav-mini-icon"> D </span>
                                                <span className="sidenav-normal">{route.title}</span>
                                            </a>
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </li>
                    ))}


                </ul>
            </div>
            

            {/*SIDEVAV FOOTER */}

            <div className="sidenav-footer mx-3 mt-3 pt-3">
                <div className="card card-background shadow-none card-background-mask-primary" id="sidenavCard">
                    <div className="full-background" style={{backgroundImage: 'url(' + whiteCurve + ')'}}></div>
                    <div className="card-body text-start p-3 w-100">
                    <div className="icon icon-shape icon-sm bg-white shadow text-center mb-3 d-flex align-items-center justify-content-center border-radius-md">
                        <svg width="16" height="16" fill="currentColor" className="bi bi-gem" viewBox="0 0 16 16">
                            <path d="M3.1.7a.5.5 0 0 1 .4-.2h9a.5.5 0 0 1 .4.2l2.976 3.974c.149.185.156.45.01.644L8.4 15.3a.5.5 0 0 1-.8 0L.1 5.3a.5.5 0 0 1 0-.6zm11.386 3.785-1.806-2.41-.776 2.413zm-3.633.004.961-2.989H4.186l.963 2.995zM5.47 5.495 8 13.366l2.532-7.876zm-1.371-.999-.78-2.422-1.818 2.425zM1.499 5.5l5.113 6.817-2.192-6.82zm7.889 6.817 5.123-6.83-2.928.002z"/>
                        </svg>
                    </div>
                    <div className="docs-info">
                        <h6 className="text-white up mb-0">Need help?</h6>
                        <p className="text-xs font-weight-bold">Message our admins</p>
                        <a href="https://discord.com/channels/333828099001286656/687385979010678794" target="_blank" className="btn btn-white btn-sm w-100 mb-0">#eflo-help</a>
                    </div>
                    </div>
                </div>
            </div>
        </aside>
    );
};