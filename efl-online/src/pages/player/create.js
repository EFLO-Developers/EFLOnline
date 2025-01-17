import AuthorizedTemplate from "../../layout/PageTemplates/Authorized";
import MainTemplate from "../../layout/PageTemplates/Main/main";
import Helmet from 'react-helmet';


export default function PlayerCreate() {
    return (
        <div>
                <div className="container-fluid py-4">
                    <div className="row">
                        <div className="col-12 text-center">
                        <h3 className="mt-5">Create a Player</h3>
                        <h5 className="text-secondary font-weight-normal">Start your journey.</h5>
                        <div className="multisteps-form mb-5">


                            {/* progress bar */}
                            <div className="row">
                            <div className="col-12 col-lg-8 mx-auto my-5">
                                <div className="multisteps-form__progress">
                                <button className="multisteps-form__progress-btn js-active" type="button" title="User Info">
                                    <span>Player</span>
                                </button>
                                <button className="multisteps-form__progress-btn" type="button" title="Stats">
                                    <span>Stats</span>
                                </button>
                                </div>
                            </div>
                            </div>


                            {/* form panels */}
                            <div className="row">
                            <div className="col-12 col-lg-8 m-auto">
                                <form className="multisteps-form__form">
                                    {/* single form panel */}
                                    <div className="card multisteps-form__panel p-3 border-radius-xl bg-white js-active" data-animation="FadeIn">
                                        <div className="row text-center">
                                            <div className="col-10 mx-auto">
                                                <h5 className="font-weight-normal">Let's start with the basic information</h5>
                                                <p>This information will define your player.</p>
                                            </div>
                                        </div>
                                        <div className="multisteps-form__content">
                                            <div className="row mt-3">
                                                
                                                <div className="col-12 col-sm-8 m-auto text-start">
                                                    <label>First Name</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" />
                                                    <label>Last Name</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" />
                                                    <label>Nickname</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" />
                                                    <label>Archetype</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" />
                                                    <label>Jersey Number</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" />
                                                    <label>Height</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" />
                                                    <label>Weight</label>
                                                    <input className="multisteps-form__input form-control mb-3" type="text" placeholder="" />
                                                </div>
                                            </div>
                                            <div className="button-row d-flex mt-4">
                                                <button className="btn bg-gradient-dark ms-auto mb-0 js-btn-next" type="button" title="Next">Next</button>
                                            </div>
                                        </div>
                                    </div>
                                    {/* single form panel */}
                                    <div className="card multisteps-form__panel p-3 border-radius-xl bg-white" data-animation="FadeIn">
                                    <div className="row text-center">
                                            <div className="col-10 mx-auto">
                                                <h5 className="font-weight-normal">Build your star.</h5>
                                                <p>Assign stats to your player to create a unique playmaker!</p>
                                            </div>
                                        </div>
                                        <div className="multisteps-form__content">
                                            <div className="row mt-3">
                                                            
                                                <div class="button-row d-flex mt-4">
                                                    <button class="btn bg-gradient-light mb-0 js-btn-prev" type="button" title="Prev">Prev</button>
                                                    
                                                    <button class="btn bg-gradient-dark ms-auto mb-0" type="button" title="Send">Create</button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                
                                </form>
                            </div>
                            </div>
                        </div>
                        </div>
                    </div>
                </div>

                <Helmet>
                    <script src="/SoftUI_js/js/plugins/multistep-form.js"></script>
                </Helmet>
            </div>



)};