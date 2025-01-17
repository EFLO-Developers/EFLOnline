import React, { useEffect, useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';

import vertHero from '../../assets/img/efl-login-vertical-hero.png'

const Login = () => {
    
    const clientId = process.env.REACT_APP_DISCORD_CLIENTID;
    const clientSecret = process.env.REACT_APP_DISCORD_CLIENTSECRET;
    const redirectUri = process.env.REACT_APP_DISCORD_CALLBACK;

    const loginDiscordClick = () => {

        if (clientId) {
            const scope = encodeURIComponent('identify email guilds guilds.members.read');
            const responseType = 'code';
            const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
            window.location.href = authUrl;
          }

          else{
            console.log("CLIENTID: ", process.env.REACT_APP_DISCORD_CLIENTID);
            console.log("CLIENTSECRET: ", process.env.REACT_APP_DISCORD_CLIENTSECRET);
            console.log("CALLBACK: ", process.env.REACT_APP_DISCORD_CALLBACK);
          }
        };


    return(
        <div>
            <main className="main-content  mt-0">
                <section>
                <div className="page-header min-vh-100">
                    <div className="container">
                    <div className="row">
                        <div className="col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0 mx-auto">
                        <div className="card card-plain">
                            <div className="card-header pb-0 text-start">
                            <h4 className="font-weight-bolder">Sign In</h4>
                            <p className="mb-0">Discord is required to login to EFL Online, if you have not joined the Official EFL Discord Server, click below.</p>
                            </div>
                            <div className="card-body">
                            <form role="form">
                                <div className="text-center">
                                    <button type="button" className="btn btn-primary btn-lg w-100 mt-4 mb-0 loginDiscord" style={{background: "#5762F8"}} onClick={loginDiscordClick}>
                                        <svg width="24" height="24" fill="currentColor" className="bi bi-discord " style={{ marginRight: '10px' }} viewBox="0 0 16 16">
                                            <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
                                        </svg>
                                        Sign In with Discord
                                    </button>

                                    
                                    <div className="text-center">
                                        <a href="https://discord.gg/4Hf9TEMS" target="_blank" className="btn btn-primary btn-lg w-100 mt-4 mb-0 ">
                                        <svg width="24" height="24" fill="currentColor" className="bi bi-discord " style={{ marginRight: '10px' }} viewBox="0 0 16 16">
                                                <path d="M13.545 2.907a13.2 13.2 0 0 0-3.257-1.011.05.05 0 0 0-.052.025c-.141.25-.297.577-.406.833a12.2 12.2 0 0 0-3.658 0 8 8 0 0 0-.412-.833.05.05 0 0 0-.052-.025c-1.125.194-2.22.534-3.257 1.011a.04.04 0 0 0-.021.018C.356 6.024-.213 9.047.066 12.032q.003.022.021.037a13.3 13.3 0 0 0 3.995 2.02.05.05 0 0 0 .056-.019q.463-.63.818-1.329a.05.05 0 0 0-.01-.059l-.018-.011a9 9 0 0 1-1.248-.595.05.05 0 0 1-.02-.066l.015-.019q.127-.095.248-.195a.05.05 0 0 1 .051-.007c2.619 1.196 5.454 1.196 8.041 0a.05.05 0 0 1 .053.007q.121.1.248.195a.05.05 0 0 1-.004.085 8 8 0 0 1-1.249.594.05.05 0 0 0-.03.03.05.05 0 0 0 .003.041c.24.465.515.909.817 1.329a.05.05 0 0 0 .056.019 13.2 13.2 0 0 0 4.001-2.02.05.05 0 0 0 .021-.037c.334-3.451-.559-6.449-2.366-9.106a.03.03 0 0 0-.02-.019m-8.198 7.307c-.789 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.45.73 1.438 1.613 0 .888-.637 1.612-1.438 1.612m5.316 0c-.788 0-1.438-.724-1.438-1.612s.637-1.613 1.438-1.613c.807 0 1.451.73 1.438 1.613 0 .888-.631 1.612-1.438 1.612"/>
                                            </svg>
                                            Official EFL Discord Server
                                        </a>
                                    </div>
                                </div>
                            </form>
                            </div>
                        </div>
                        </div>
                        <div className="col-6 d-lg-flex d-none h-100 my-auto pe-0 position-absolute top-0 end-0 text-center justify-content-center flex-column">
                        <div className="position-relative bg-primary h-100 m-3 px-7 border-radius-lg d-flex flex-column justify-content-center loginHero">
                        </div>
                        </div>
                    </div>
                    </div>
                </div>
                </section>
            </main>

        </div>
    );
};

export default Login;

