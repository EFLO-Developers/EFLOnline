import React, { useEffect, useState  } from 'react';
import { routes } from '../../routes';


import logo from '../../assets/img/efl-logos/efl1000.png';
import whiteCurve from '../../assets/soft-ui/img/curved-images/white-curved.jpg';
import { error } from 'jquery';
import Cookies from 'js-cookie';
import PlayerServiceAgent from '../../serviceAgents/PlayerServiceAgent';
import usePersistedState from '../../serviceAgents/usePersistedState';


function isActivePage(path) {
    // Look for a matching route
    const matchingRoute = routes.find(route => route.path === path);
  
    // If found in routes, return true; else return false
    return matchingRoute !== undefined;
  }

export default function SideNav(){
    // Get unique categories where there is at least one route that has ShowInNav = true
    const categories = [...new Set(routes.filter(route => route.ShowInNav).map(route => route.category))];



    const [userPlayers, SetUserPlayers] = usePersistedState('ActiveUserPlayers', null);
    const [offPlayer, SetOffPlayer] = usePersistedState('ActiveOffPlayer', null);
    const [defPlayer, SetDefPlayer] = usePersistedState('ActiveDefPlayer', null);

    const [loading, SetLoading] = useState(true);

    useEffect(() => {
                    
        //get current users players
        PlayerServiceAgent.GetActiveUserPlayers().then(res => {
            if(res != undefined)
            {
                var off = res.find(players => players.player.UnitType === "OFF");
                if(off){
                    SetOffPlayer(off.player);
                }
                
                var def = res.find(players => players.player.UnitType === "DEF");

                if(def){
                    SetDefPlayer(def.player);
                }

                SetUserPlayers(res);
            }
        }).catch(error => {
            console.log(error , 'Could not get user players');
        }).finally(() => {
            SetLoading(false);
        });

    }, [userPlayers, offPlayer, defPlayer]);

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




                    <li className="nav-item mb-4">
                        <a data-bs-toggle="collapse" href={`#Player`} className="nav-link active" aria-controls="Player" role="button" aria-expanded="false">
                            <div className="icon icon-sm shadow-sm border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
                                <svg width="16" height="16" fill="currentColor" className="bi bi-person-arms-up" viewBox="0 0 16 16">
                                    <path d="M8 3a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3"/>
                                    <path d="m5.93 6.704-.846 8.451a.768.768 0 0 0 1.523.203l.81-4.865a.59.59 0 0 1 1.165 0l.81 4.865a.768.768 0 0 0 1.523-.203l-.845-8.451A1.5 1.5 0 0 1 10.5 5.5L13 2.284a.796.796 0 0 0-1.239-.998L9.634 3.84a.7.7 0 0 1-.33.235c-.23.074-.665.176-1.304.176-.64 0-1.074-.102-1.305-.176a.7.7 0 0 1-.329-.235L4.239 1.286a.796.796 0 0 0-1.24.998l2.5 3.216c.317.316.475.758.43 1.204Z"/>
                                </svg>
                            </div>
                            <span className="nav-link-text ms-1">My Players</span>
                        </a>
                        <div className="collapse show" id="Player">
                            <ul className="nav ms-4 ps-3">

                            {!loading ? (
                                <>
                                    {offPlayer ? (
                                        <li className={`nav-item active`}>
                                            <a className="nav-link" href={`/player/${offPlayer.PlayerId}/update`}>
                                                <span className="sidenav-mini-icon"> P </span>
                                                <span className="sidenav-normal">{offPlayer.FirstName} {offPlayer.LastName}</span>
                                            </a>
                                        </li>
                                    ) : (
                                        <li className="nav-item">
                                            <a className="nav-link" href="/player/create">
                                                <span className="sidenav-mini-icon"> + </span>
                                                <span className="sidenav-normal">Create New OFF Player</span>
                                            </a>
                                        </li>
                                    )}

                                    {defPlayer ? (
                                        <li className={`nav-item active`}>
                                            <a className="nav-link" href={`/player/${defPlayer.PlayerId}/update`}>
                                                <span className="sidenav-mini-icon"> P </span>
                                                <span className="sidenav-normal">{defPlayer.FirstName} {defPlayer.LastName}</span>
                                            </a>
                                        </li>
                                    ) : (
                                        <li className="nav-item">
                                            <a className="nav-link" href="/player/create">
                                                <span className="sidenav-mini-icon"> + </span>
                                                <span className="sidenav-normal">Create New DEF Player</span>
                                            </a>
                                        </li>
                                    )}
                                </>
                            ) : (
                                <span>
                                    <li>...</li>

                                    <li>...</li>

                                </span>
                            )}


                            </ul>
                        </div>
                    </li>



                    <li key="League" className="nav-item mb-4">
                        <a data-bs-toggle="collapse" href="Admin" className="nav-link active" aria-controls="League" role="button" aria-expanded="false">
                            <div className="icon icon-sm shadow-sm border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">                                
                                <svg   width="16" height="16" fill="currentColor" class="bi bi-shield-fill" viewBox="0 0 16 16">
                                    <path d="M5.072.56C6.157.265 7.31 0 8 0s1.843.265 2.928.56c1.11.3 2.229.655 2.887.87a1.54 1.54 0 0 1 1.044 1.262c.596 4.477-.787 7.795-2.465 9.99a11.8 11.8 0 0 1-2.517 2.453 7 7 0 0 1-1.048.625c-.28.132-.581.24-.829.24s-.548-.108-.829-.24a7 7 0 0 1-1.048-.625 11.8 11.8 0 0 1-2.517-2.453C1.928 10.487.545 7.169 1.141 2.692A1.54 1.54 0 0 1 2.185 1.43 63 63 0 0 1 5.072.56"/>
                                </svg>


                                </div>
                            <span className="nav-link-text ms-1">League</span>
                        </a>
                        <div className="collapse show" id="League">
                            <ul className="nav ms-4 ps-3">
                                
                                
                                <li key='/data/teams' className={`nav-item ${isActivePage('/team') ? 'active' : ''}`}>
                                    <a className="nav-link" href='/team'>
                                        <span className="sidenav-mini-icon"> T </span>
                                        <span className="sidenav-normal">Teams</span>
                                    </a>
                                </li>



                            </ul>
                        </div>
                    </li>

                    <li key="Admin" className="nav-item mb-4">
                        <a data-bs-toggle="collapse" href="Admin" className="nav-link active" aria-controls="Admin" role="button" aria-expanded="false">
                            <div className="icon icon-sm shadow-sm border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
                                


                                <svg  width="16" height="16" fill="currentColor" class="bi bi-gem" viewBox="0 0 16 16">
                                    <path d="M3.1.7a.5.5 0 0 1 .4-.2h9a.5.5 0 0 1 .4.2l2.976 3.974c.149.185.156.45.01.644L8.4 15.3a.5.5 0 0 1-.8 0L.1 5.3a.5.5 0 0 1 0-.6zm11.386 3.785-1.806-2.41-.776 2.413zm-3.633.004.961-2.989H4.186l.963 2.995zM5.47 5.495 8 13.366l2.532-7.876zm-1.371-.999-.78-2.422-1.818 2.425zM1.499 5.5l5.113 6.817-2.192-6.82zm7.889 6.817 5.123-6.83-2.928.002z"/>
                                </svg>


                            </div>
                            <span className="nav-link-text ms-1">Admin</span>
                        </a>
                        <div className="collapse show" id="Admin">
                            <ul className="nav ms-4 ps-3">
                                <li key='/data/teams' className={`nav-item ${isActivePage('/dashboard/approver') ? 'active' : ''}`}>
                                    <a className="nav-link" href='/dashboard/approver'>
                                        <span className="sidenav-mini-icon"> AD </span>
                                        <span className="sidenav-normal">Approver Hub</span>
                                    </a>
                                </li>

                            </ul>
                        </div>
                    </li>


{/*}
                    <li key="Data" className="nav-item mb-4">
                        <a data-bs-toggle="collapse" href="Data" className="nav-link active" aria-controls="Data" role="button" aria-expanded="false">
                            <div className="icon icon-sm shadow-sm border-radius-md bg-white text-center d-flex align-items-center justify-content-center me-2">
                                


                                <svg  width="16" height="16" fill="currentColor" className="bi bi-database-fill" viewBox="0 0 16 16">
                                    <path d="M3.904 1.777C4.978 1.289 6.427 1 8 1s3.022.289 4.096.777C13.125 2.245 14 2.993 14 4s-.875 1.755-1.904 2.223C11.022 6.711 9.573 7 8 7s-3.022-.289-4.096-.777C2.875 5.755 2 5.007 2 4s.875-1.755 1.904-2.223"/>
                                    <path d="M2 6.161V7c0 1.007.875 1.755 1.904 2.223C4.978 9.71 6.427 10 8 10s3.022-.289 4.096-.777C13.125 8.755 14 8.007 14 7v-.839c-.457.432-1.004.751-1.49.972C11.278 7.693 9.682 8 8 8s-3.278-.307-4.51-.867c-.486-.22-1.033-.54-1.49-.972"/>
                                    <path d="M2 9.161V10c0 1.007.875 1.755 1.904 2.223C4.978 12.711 6.427 13 8 13s3.022-.289 4.096-.777C13.125 11.755 14 11.007 14 10v-.839c-.457.432-1.004.751-1.49.972-1.232.56-2.828.867-4.51.867s-3.278-.307-4.51-.867c-.486-.22-1.033-.54-1.49-.972"/>
                                    <path d="M2 12.161V13c0 1.007.875 1.755 1.904 2.223C4.978 15.711 6.427 16 8 16s3.022-.289 4.096-.777C13.125 14.755 14 14.007 14 13v-.839c-.457.432-1.004.751-1.49.972-1.232.56-2.828.867-4.51.867s-3.278-.307-4.51-.867c-.486-.22-1.033-.54-1.49-.972"/>
                                </svg>


                                </div>
                            <span className="nav-link-text ms-1">Data</span>
                        </a>
                        <div className="collapse show" id="Data">
                            <ul className="nav ms-4 ps-3">
                                <li key='/data/teams' className={`nav-item ${isActivePage('/data/teams') ? 'active' : ''}`}>
                                    <a className="nav-link" href='/data/teams'>
                                        <span className="sidenav-mini-icon"> T </span>
                                        <span className="sidenav-normal">Teams</span>
                                    </a>
                                </li>

                                <li key='/data/players' className={`nav-item ${isActivePage('/data/players') ? 'active' : ''}`}>
                                    <a className="nav-link" href='/data/players'>
                                        <span className="sidenav-mini-icon"> P </span>
                                        <span className="sidenav-normal">Players</span>
                                    </a>
                                </li>

                                <li key='/data/users' className={`nav-item ${isActivePage('/data/users') ? 'active' : ''}`}>
                                    <a className="nav-link" href='/data/users'>
                                        <span className="sidenav-mini-icon"> U </span>
                                        <span className="sidenav-normal">Users</span>
                                    </a>
                                </li>
                            </ul>
                        </div>
                    </li>
*/}

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