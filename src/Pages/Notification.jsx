import React, { useState, useEffect, useCallback } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faBell,
  faCheck,
  faHeart,
  faClock,
  faExclamationTriangle,
  faUsers,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import { useSwipeable } from 'react-swipeable'; 
// Simple Error Boundary Component
class ErrorBoundary extends React.Component {
  state = { hasError: false };

  static getDerivedStateFromError(error) {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="text-center py-10 text-red-600">
          <p>Something went wrong while displaying notifications.</p>
          <p>Please refresh the page or try again later.</p>
        </div>
      );
    }
    return this.props.children;
  }
}

const Notification = () => {
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem('notifications'));
      if (Array.isArray(stored) && stored.length > 0) {
        console.log('Loaded notifications from localStorage:', stored);
        return stored;
      }
      // Default notifications (May 29, 2025, 09:41 PM IST)
      const now = new Date('2025-05-29T21:41:00+05:30');
      const defaults = [
        {
          id: 'notif-1',
          type: 'urgent',
          message: 'Urgent: A+ blood needed at Fortis Mumbai! Can you help?',
          timestamp: new Date(now.getTime() - 1 * 60 * 1000).toISOString(), // 1 minute ago
          user: 'Fortis Mumbai',
        },
        {
          id: 'notif-2',
          type: 'urgent',
          message: 'Critical: B- blood required at Apollo Delhi! Please respond.',
          timestamp: new Date(now.getTime() - 5 * 60 * 1000).toISOString(), // 5 minutes ago
          user: 'Apollo Delhi',
        },
        {
          id: 'notif-3',
          type: 'personal',
          message: 'Thank you! Your O+ donation on May 28th saved a life in Delhi.',
          timestamp: new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
          user: 'Blood Connector Team',
        },
        {
          id: 'notif-4',
          type: 'community',
          message: 'Join our blood donation camp in Bangalore on May 31st!',
          timestamp: new Date(now.getTime() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
          user: 'Priya S.',
        },
        {
          id: 'notif-5',
          type: 'personal',
          message: 'Great job! Your AB+ donation helped a patient in Chennai.',
          timestamp: new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
          user: 'Blood Connector Team',
        },
        {
          id: 'notif-6',
          type: 'urgent',
          message: 'Emergency: O- blood needed at KIMS Hyderabad! Can you donate?',
          timestamp: new Date(now.getTime() - 15 * 60 * 1000).toISOString(), // 15 minutes ago
          user: 'KIMS Hyderabad',
        },
        {
          id: 'notif-7',
          type: 'community',
          message: 'Volunteer at our blood drive in Kolkata on June 1st!',
          timestamp: new Date(now.getTime() - 4 * 24 * 60 * 60 * 1000).toISOString(), // 4 days ago
          user: 'Rahul K.',
        },
        {
          id: 'notif-8',
          type: 'personal',
          message: 'Reminder: You’re eligible to donate blood again on June 5th!',
          timestamp: new Date(now.getTime() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
          user: 'Blood Connector Team',
        },
      ];
      console.log('Using default notifications:', defaults);
      return defaults;
    } catch (e) {
      console.error('Error loading notifications:', e);
      return [];
    }
  });
  const [toast, setToast] = useState('');

  // Debounce function to limit localStorage updates
  const debounce = (func, delay) => {
    let timeoutId;
    return (...args) => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => func(...args), delay);
    };
  };

  // Save notifications to localStorage with debouncing
  const saveNotifications = useCallback(
    debounce((notifs) => {
      try {
        localStorage.setItem('notifications', JSON.stringify(notifs));
      } catch (e) {
        console.error('Error saving notifications:', e);
      }
    }, 500),
    []
  );

  useEffect(() => {
    console.log('Current notifications state:', notifications);
    saveNotifications(notifications);
  }, [notifications, saveNotifications]);

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((notif) => notif.id !== id));
    showToast('Notification dismissed');
  };

  // Helper to format timestamp as "X time ago"
  const timeAgo = (timestamp) => {
    const now = new Date('2025-05-29T21:41:00+05:30');
    const date = new Date(timestamp);
    const diffMs = now - date;
    const diffMins = Math.floor(diffMs / (1000 * 60));
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

    if (diffMins < 60) return `${diffMins} min${diffMins !== 1 ? 's' : ''} ago`;
    if (diffHours < 24) return `${diffHours} hr${diffHours !== 1 ? 's' : ''} ago`;
    if (diffDays < 7) return `${diffDays} day${diffDays !== 1 ? 's' : ''} ago`;
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  return (
    <ErrorBoundary>
      <div className="m-2 p-0 max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-red-50 min-h-screen mt-5 last:mb-16">
        {/* Toast */}
        {toast && (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-xl shadow-2xl z-[1000] border-2 border-red-800 flex items-center space-x-2 text-sm sm:text-base max-w-[90vw]"
          >
            <FontAwesomeIcon icon={faCheck} className="text-green-300" />
            <span>{toast}</span>
          </motion.div>
        )}

        {/* Notification Feed */}
        <div className="px-2 sm:px-6 pb-6">
          {notifications.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="text-center py-10"
            >
              <FontAwesomeIcon icon={faBell} className="text-gray-400 text-5xl sm:text-7xl mb-4" />
              <p className="text-lg sm:text-xl font-semibold text-gray-600">
                No notifications yet!
              </p>
              <p className="text-sm sm:text-base text-gray-500 mt-2">
                Stay tuned for urgent blood requests and donation updates.
              </p>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {notifications.map((notif, index) => {
                  // Swipe handlers using react-swipeable
                  const handlers = useSwipeable({
                    onSwipedLeft: () => dismissNotification(notif.id),
                    onSwipedRight: () => dismissNotification(notif.id),
                    delta: 150, // Minimum swipe distance in pixels
                    preventDefaultTouchmoveEvent: true, // Prevent scrolling while swiping
                  });

                  return (
                    <motion.div
                      key={notif.id}
                      initial={{ opacity: 0, x: -50 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: 100 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      {...handlers} // Apply swipe handlers
                      className={`relative bg-white rounded-2xl p-4 sm:p-6 shadow-lg border-l-8 transition-all ${
                        notif.type === 'urgent'
                          ? 'border-red-600'
                          : notif.type === 'personal'
                          ? 'border-blue-600'
                          : 'border-green-600'
                      } flex items-start space-x-4 sm:space-x-6 hover:shadow-xl hover:-translate-y-1 touch-none`} // touch-none to improve swipe behavior
                    >
                      {/* Avatar/Icon */}
                      <motion.div
                        className="flex-shrink-0 w-12 h-12 sm:w-14 sm:h-14 rounded-full flex items-center justify-center"
                        whileHover={{ scale: 1.1 }}
                        style={{
                          background:
                            notif.type === 'urgent'
                              ? 'linear-gradient(to bottom, #f87171, #ef4444)'
                              : notif.type === 'personal'
                              ? 'linear-gradient(to bottom, #60a5fa, #3b82f6)'
                              : 'linear-gradient(to bottom, #34d399, #10b981)',
                        }}
                      >
                        {notif.type === 'urgent' ? (
                          <FontAwesomeIcon icon={faExclamationTriangle} className="text-white text-xl sm:text-2xl" />
                        ) : notif.type === 'personal' ? (
                          <FontAwesomeIcon icon={faHeart} className="text-white text-xl sm:text-2xl" />
                        ) : (
                          <FontAwesomeIcon icon={faUsers} className="text-white text-xl sm:text-2xl" />
                        )}
                      </motion.div>

                      {/* Content */}
                      <div className="flex-1">
                        <p className="text-sm sm:text-lg font-semibold text-gray-900">
                          {notif.user || 'Unknown'}
                        </p>
                        <p className="text-sm sm:text-base text-gray-700 mt-1 sm:mt-2">
                          {notif.message}
                        </p>
                        <p className="text-xs sm:text-sm text-gray-500 mt-1 sm:mt-2 flex items-center">
                          <FontAwesomeIcon icon={faClock} className="mr-2 text-gray-400" />
                          {notif.timestamp ? timeAgo(notif.timestamp) : 'Unknown time'}
                        </p>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>
      </div>
    </ErrorBoundary>
  );
};

export default Notification;