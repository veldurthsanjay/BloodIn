import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHome, faSearch, faTint, faBell, faUser } from '@fortawesome/free-solid-svg-icons';
import { motion } from 'framer-motion';

// Mock function to get user role (replace with actual auth logic, e.g., Firebase)
const getUserRole = () => {
  return 'donor'; 
};

const BloodConnectNavigator = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const userRole = getUserRole();
  const [unreadCount, setUnreadCount] = useState(0);

  // Update unread count from localStorage
  useEffect(() => {
    const updateUnreadCount = () => {
      try {
        const notifications = JSON.parse(localStorage.getItem('notifications')) || [];
        setUnreadCount(notifications.filter((n) => !n.read).length);
      } catch {
        setUnreadCount(0);
      }
    };
    updateUnreadCount();
    window.addEventListener('storage', updateUnreadCount);
    return () => window.removeEventListener('storage', updateUnreadCount);
  }, []);

  // Navigate to /home by default on first load
  useEffect(() => {
    if (location.pathname === '/' || location.pathname === '/auth') {
      navigate('/home', { replace: true });
    }
  }, [location.pathname, navigate]);

  const tabs = [
    { path: '/home', icon: faHome, label: 'Home' },
    { path: '/search-blood', icon: faSearch, label: 'Search' },
    {
      path: userRole === 'donor' ? '/donate' : userRole === 'hospital' ? '/post-need' : '/request-blood',
      icon: faTint,
      label: userRole === 'donor' ? 'Donate' : userRole === 'hospital' ? 'Post Need' : 'Request',
      isCenter: true,
    },
    { path: '/notification', icon: faBell, label: 'Alerts' },
    { path: '/profile', icon: faUser, label: 'Profile' },
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-gradient-to-r from-red-50 to-red-100 border-t border-red-200 shadow-lg flex justify-around items-center z-50 h-16 sm:h-20">
      {tabs.map((tab, index) => (
        <motion.button
          key={index}
          onClick={() => handleNavigate(tab.path)}
          className={`relative flex flex-col items-center justify-center flex-1 h-full transition-colors duration-300 ${
            location.pathname === tab.path ? 'text-red-500' : 'text-gray-700 hover:text-red-400'
          }`}
          whileTap={{ scale: 0.9 }}
          initial={{ y: 10, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: index * 0.1, type: 'spring', stiffness: 300 }}
        >
          {tab.isCenter ? (
            <div className="relative flex flex-col items-center">
              <motion.div
                className="bg-gradient-to-br from-red-500 to-red-600 text-white rounded-full p-3 -mt-6 shadow-red-200"
                whileHover={{ scale: 1.1 }}
                transition={{ type: 'spring', stiffness: 300 }}
              >
                <FontAwesomeIcon icon={tab.icon} size="2x" />
              </motion.div>
              <motion.p
                className={`mt-1 text-sm sm:text-lg font-bold tracking-wide ${
                  location.pathname === tab.path ? 'text-red-500' : 'text-gray-700'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
              >
                {tab.label}
              </motion.p>
              {location.pathname === tab.path && (
                <motion.div
                  className="absolute -top-1 -bottom-1 -left-1 -right-1 bg-red-500/30 rounded-full blur-sm"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>
          ) : (
            <div className="relative flex flex-col items-center">
              <motion.div whileHover={{ scale: 1.25 }} transition={{ type: 'spring', stiffness: 300 }}>
                <FontAwesomeIcon
                  icon={tab.icon}
                  size="lg"
                  className={`transition-transform duration-300 ${
                    location.pathname === tab.path ? 'scale-110' : ''
                  }`}
                />
              </motion.div>
              <motion.p
                className={`mt-1 text-sm sm:text-lg font-bold tracking-wide ${
                  location.pathname === tab.path ? 'text-red-500' : 'text-gray-700'
                }`}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, type: 'spring', stiffness: 300 }}
              >
                {tab.label}
              </motion.p>
              <span
                className={`w-8 h-1.5 mt-1 rounded-full bg-gradient-to-r from-red-500 to-red-600 shadow-red-200 transition-all duration-300 ${
                  location.pathname === tab.path ? 'opacity-100 scale-110' : 'opacity-0 scale-100'
                }`}
              />
              {tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center animate-pulse">
                  {tab.badge}
                </span>
              )}
              {location.pathname === tab.path && (
                <motion.div
                  className="absolute -top-1 -bottom-1 -left-1 -right-1 bg-red-500/30 rounded-full blur-sm"
                  initial={{ opacity: 0.3 }}
                  animate={{ opacity: [0.3, 0.5, 0.3] }}
                  transition={{ repeat: Infinity, duration: 1.5 }}
                />
              )}
            </div>
          )}
        </motion.button>
      ))}
    </div>
  );
};

export default BloodConnectNavigator;