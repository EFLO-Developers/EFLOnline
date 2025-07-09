import React, { useEffect } from 'react';
import { Helmet } from 'react-helmet';

const Analytics = () => {
    useEffect(() => {
        // Initialize Google Analytics
        window.dataLayer = window.dataLayer || [];
        function gtag() {
            window.dataLayer.push(arguments);
        }
        gtag('js', new Date());
        gtag('config', 'G-49DSDT0Z5D');
    }, []);

    return (
        <Helmet>
            <script async src="https://www.googletagmanager.com/gtag/js?id=G-49DSDT0Z5D"></script>
            <script>
                {`
                    window.dataLayer = window.dataLayer || [];
                    function gtag(){dataLayer.push(arguments);}
                    gtag('js', new Date());
                    gtag('config', 'G-49DSDT0Z5D');
                `}
            </script>
        </Helmet>
    );
};

export default Analytics;