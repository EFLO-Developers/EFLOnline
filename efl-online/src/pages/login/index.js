import React, { useEffect, useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';

import vertHero from '../../assets/img/efl-login-vertical-hero.png'

const Login = () => {
    
    const clientId = "1326244369090478161";
    const clientSecret = "Shn9KEdoq6AfMb0URjlcEl6msWAgyqwU";
    const redirectUri = "https://eflo.io/auth/discord/callback";

    const loginDiscordClick = () => {

        if (clientId) {
            const scope = encodeURIComponent('identify email guilds guilds.members.read');
            const responseType = 'code';
            const authUrl = `https://discord.com/api/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=${responseType}&scope=${scope}`;
            window.location.href = authUrl;
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
                            <p className="mb-0">Discord is required to login to EFLO, if you have not joined the EFL Discord Server, click here.</p>
                            </div>
                            <div className="card-body">
                            <form role="form">
                                <div className="text-center">
                                <button type="button" className="btn btn-primary btn-lg w-100 mt-4 mb-0 loginDiscord" onClick={loginDiscordClick}>Login with Discord</button>
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

