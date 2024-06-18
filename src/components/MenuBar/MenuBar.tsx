import React, {useState, useEffect} from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import styles from './MenuBar.module.css';
import { Link } from 'react-router-dom';

const MenuBar: React.FC = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const [timeLeft, setTimeLeft] = useState<number>(0);
    // Determine if the settings page is shown based on the current path
    const showSettings = location.pathname === '/settings';

    const toggleSettings = () => {
        if (showSettings) {
            navigate(-1); // Go back if we're currently showing settings
        } else {
            navigate('/settings'); // Navigate to settings if not currently showing
        }
    };

    useEffect(() => {
        const endTime = new Date().getTime() + 3600000; // end after 1hour.
        const interval = setInterval(() => {
            const now = new Date().getTime();
            const distance = endTime - now;
            if (distance < 0) {
                clearInterval(interval);
                setTimeLeft(0);
            } else {
                setTimeLeft(distance);
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    const formatTime = (milliseconds: number) => {
        const totalSeconds = Math.floor(milliseconds / 1000);
        const days = Math.floor(totalSeconds / (60 * 60 * 24));
        const hours = Math.floor((totalSeconds % (60 * 60 * 24)) / (60 * 60));
        const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
        const seconds = totalSeconds % 60;
        return `${days}:${hours < 10 ? '0' : ''}${hours}:${minutes < 10 ? '0' : ''}${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
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
            <div className={styles.timer}>
                {formatTime(timeLeft)}
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
