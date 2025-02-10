

import React, { useEffect, useState  } from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom'
import { routes } from './routes';


import SoftUI from './assets/soft-ui/SoftUI';
import logo from './logo.svg';
import './App.css';
import DiscordCallback from './auth/discord/callback';
import { AlertProvider } from './context/AlertContext';


function App() {
  useEffect(() => {
    document.title = 'EFL Online';
  }, []);
  return (

    <Router>
      <AlertProvider>
        <div className="App">
              
          <SoftUI />

          {/* Load main page template content */}
          <Routes>
            
            {routes.map(route => (
              <Route key={route.path} path={route.path} element={<route.component />}></Route>
            ))}

            <Route path="/auth/discord/callback" element={<DiscordCallback />} ></Route>
          </Routes>

        </div>
      </AlertProvider>
    </Router>
  );
}

export default App;
