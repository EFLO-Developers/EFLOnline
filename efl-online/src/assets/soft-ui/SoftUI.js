import React, { useEffect } from 'react';
import WebFont from 'webfontloader';
import '@fortawesome/fontawesome-free/css/all.min.css';
import './css/nucleo-icons.css';
import './css/nucleo-svg.css';
import './css/soft-ui-dashboard.css';



const SoftUI = () => {
    useEffect(() => {
      WebFont.load({
        google: {
          families: ['Inter:300,400,500,600,700,800'],
        },
      });
    }, []);
};


export default SoftUI;