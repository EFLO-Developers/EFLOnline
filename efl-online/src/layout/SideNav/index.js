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
                                    <i className="ni ni-compass-04" aria-hidden="true"></i>
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
                        <i className="ni ni-diamond text-dark text-gradient text-lg top-0" aria-hidden="true" id="sidenavCardIcon"></i>
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