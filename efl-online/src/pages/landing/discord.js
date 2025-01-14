import React, { useEffect, useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';

const DiscordLanding = () => {



    
return(

    <div>
                
        <main className="main-content  mt-0">
            <section>
                <div className="page-header min-vh-100">
                    <div className="container">
                        <div className="row">
                            <div className="col-xl-4 col-lg-5 col-md-7 d-flex flex-column mx-lg-0 mx-auto">
                                <div className="card card-plain">
                                    <div className="card-header pb-0 text-left">
                                    <h4 className="font-weight-bolder">Almost there!</h4>
                                    <p className="mb-0">
                                        Once you've joined the EFL Discord Server, you'll be able to create your player and start your path to greatness!
                                    </p>
                                    </div>
                                    <div className="card-body pb-3">
                                
                                        
                                        <div className="text-center">
                                            <a href="https://discord.gg/4Hf9TEMS" target="_blank" className="btn btn-primary w-100 mt-4 mb-0">Join the EFL Discord Server!</a>
                                        </div>

                                        <div className="text-center">
                                            <a href="/login" target="_blank" className="btn btn-primary w-100 mt-4 mb-0">Return to Login</a>
                                        </div>
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

)};

export default DiscordLanding;
    