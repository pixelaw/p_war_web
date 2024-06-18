import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './MenuBar.module.css';
import { Link } from 'react-router-dom';

const MenuBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();

    // Determine if the settings page is shown based on the current path
    const showSettings = location.pathname === '/settings';

    const toggleSettings = () => {
        if (showSettings) {
            navigate(-1); // Go back if we're currently showing settings
        } else {
            navigate('/settings'); // Navigate to settings if not currently showing
        }
    };

    return (

        // <div className={styles.inner}>
        //     <div className={styles.logoContainer}>
        //         <img src="/src/assets/logo/pixeLaw-logo.png" alt="logo"/>
        //     </div>
        //     <button className={styles.menuButton} onClick={toggleSettings}>Settings</button>
        // </div>

        // <div className="flex items-center justify-between p-4 bg-gray-800">
        <div className={styles.inner}>
            <div className={styles.logoContainer}>
                <Link to="/">
                    <img src="/src/assets/logo/pixeLaw-logo.png" alt="logo"/>
                </Link>
            </div>
            {/* <Link to="/governance" className="text-2xl text-white font-bold absolute left-1/2 transform -translate-x-1/2">
                Governance
            </Link> */}
            <div className="flex items-center space-x-2">
                <button className="bg-gray-700 text-white px-4 py-2 rounded-md">
                    Connect Wallet
                </button>
                <button className="bg-gray-700 text-white px-4 py-2 rounded-md">
                    8/10PX
                </button>
            </div>
        </div>
    );
};

export default MenuBar;
