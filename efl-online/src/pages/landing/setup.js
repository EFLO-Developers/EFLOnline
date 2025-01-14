import React, { useEffect, useState  } from 'react';
import { useNavigate } from 'react-router-dom';
import $ from 'jquery';
import MainTemplate from '../../layout/PageTemplates/Main/main';
import EFLOAuthServiceAgent from '../../serviceAgents/EFLOAuthServiceAgent/EFLOAuthServiceAgent';
import Cookies from 'js-cookie';
import UserServiceAgent from '../../serviceAgents/UserServiceAgent';

const SetupLanding = () => {
    const [member, setMember] = useState({
        Id : '',
        DiscordNick: '',
        ForumNick: '',
        RecruitedBy: '',
        AgencyName: ''
    });
    const navigate = useNavigate();




    const handleSubmit = (e) => {
        e.preventDefault();
        
        const TokenKey = "eflo.auth";
        const eflo_access_token = Cookies.get(TokenKey);
    
        if (!eflo_access_token) {
            console.log("Token not found");
            window.location.href = "/login";
            return;
        }
        

        // Wrap the member parameters in an "eflo_member" object
        const eflo_member = {
            eflo_member: {
                Id : member.Id,
                ForumNick: member.ForumNick !== '' ? member.ForumNick : null,
                RecruitedBy: member.RecruitedBy !== '' ? member.RecruitedBy : null,
                AgencyName: member.AgencyName !== '' ? member.AgencyName : null
            }
        };
        console.log(eflo_member);

        UserServiceAgent.UpdateUser(eflo_access_token, eflo_member).then(res => {        
            //user was successfully updated
            console.log("user saved successfully");
            //navigate("/");
        }).catch(error => {
            console.log(error, "ERROR UPDATING USER");
        });
    };



  useEffect(() => {


    const TokenKey = "eflo.auth";
    const eflo_access_token = Cookies.get(TokenKey);

    if (!eflo_access_token) {
        console.log("Token not found");
        window.location.href = "/login";
        return;
      }
  
      const params = {
        eflo_access_token
      };

      EFLOAuthServiceAgent.GetActiveUser(params).then(res => {
            console.log("token validated");
            
            if(res.ForumNick != undefined){
                window.location.href = "/";
            }

            setMember({
                Id : res.Id,
                DiscordNick: res.DiscordNick || '',
                ForumNick: res.ForumNick || '',
                RecruitedBy: res.RecruitedBy || '',
                AgencyName: res.AgencyName || ''
            });
            
        }).catch(error => {
            console.log(error , 'Could not get user information');
        });  
    }, []);

    const handleInputChange = (e) => {
        const { id, value } = e.target;
        setMember(prevState => ({
            ...prevState,
            [id]: value
        }));
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
                                        <div className="card-header pb-0 text-left">
                                        <h4 className="font-weight-bolder">One last thing...</h4>
                                        <p className="mb-0">We just need a few more details to finish setting up your account.</p>
                                        </div>
                                        <div className="card-body pb-3">
                                        <form role="form" onSubmit={handleSubmit}>
                                            <label>EFL Discord Nickname</label>
                                            <div className="mb-3">
                                                <input type="text" className="form-control" placeholder="" aria-label="EFL Discord Nickname" disabled
                                                    value={member.DiscordNick} />
                                            </div>
                                            <label>EFL Forum Username</label>
                                            <label className="sub-label required">*Required</label>
                                            <div className="mb-3">
                                                <input type="text" className="form-control" placeholder="" aria-label="EFL Forum Username"
                                                    id="ForumNick"
                                                    value={member.ForumNick}
                                                    onChange={handleInputChange} />
                                            </div>
                                            <label>Recruited By</label>
                                            <label className="sub-label">Optional - Give some cred.</label>
                                            <div className="mb-3">
                                                <input type="text" className="form-control" placeholder="ex: OMW" aria-label="Recruited By"
                                                    id="RecruitedBy"
                                                    value={member.RecruitedBy}
                                                    onChange={handleInputChange} />
                                            </div>
                                            <label>Agency Name</label>
                                            <label className="sub-label">Optional - For RP purposes.</label>
                                            <div className="mb-3">
                                                <input type="text" className="form-control" placeholder="ex: Apex Athlete Network" aria-label="Agency Name"
                                                    id="AgencyName"
                                                    value={member.AgencyName}
                                                    onChange={handleInputChange} />
                                            </div>
                                            
                                            <div className="text-center">
                                            <button type="submit" className="btn btn-primary w-100 mt-4 mb-0">Finish Setup</button>
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

)};

export default SetupLanding;
    