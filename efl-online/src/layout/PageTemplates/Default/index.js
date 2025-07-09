

import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import { routes } from '../../../routes';


function DefaultTemplate(){
    return(
        <div>

            {/* Load main page template content */}
            <Routes>
            {routes.map(route => (

                <Route key={route.path} path={route.path} component={route.component}></Route>
            ))}

            </Routes>

        </div>
    );
};

export default DefaultTemplate;