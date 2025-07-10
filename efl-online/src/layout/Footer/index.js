import Analytics from "../analytics";

const currentYear = new Date().getFullYear();

export default function Footer(){
    return(

        <footer className="footer pt-3  ">
            <div className="container-fluid">
                <div className="row align-items-center justify-content-lg-between">
                    <div className="col-lg-6 mb-lg-0 mb-4">
                        <div className="copyright text-center text-sm text-muted text-lg-start">
                            © { currentYear }
                            &nbsp; Made with <i className="fa fa-heart"></i> by &nbsp;
                            OMW.
                        </div>
                    </div>
                    <div className="col-lg-6">
                        <ul className="nav nav-footer justify-content-center justify-content-lg-end">
                            <li className="nav-item">
                                <a href="https://eflnow.jcink.net/index.php" className="nav-link text-muted" target="_blank" rel="noreferrer">EFL Forum</a>
                            </li>
                            <li className="nav-item">
                                <a href="https://eflo.io/index" className="nav-link text-muted" target="_blank" rel="noreferrer">EFL Index</a>
                            </li>
                            <li className="nav-item">
                                <a href="https://discord.com/channels/333828099001286656/333828099001286656" className="nav-link text-muted" target="_blank" rel="noreferrer">Discord</a>
                            </li>
                            
                        </ul>
                    </div>
                </div>
            </div>


            <Analytics />
        </footer>
    );
};