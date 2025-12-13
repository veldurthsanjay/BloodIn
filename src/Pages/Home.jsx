import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faDroplet,
  faHeart,
  faHandHoldingHeart,
  faShieldAlt,
  faStar,
  faSearch,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

// Define styles with vibrant gradient colors, consistent spacing, and interactive elements
const styles = {
  container: ' bg-gradient-to-br from-red-200 via-pink-100 to-white p-0 last:mb-20 ', // No left/right padding
  navBar: 'fixed top-0 left-0 right-0 bg-gradient-to-r from-red-600 to-red-800 text-white flex items-center justify-between px-4 py-3 shadow-lg z-50',
  navItems: 'flex items-center space-x-3 sm:space-x-6', // Improved spacing
  navButton:
    'py-1 px-2 sm:px-3 rounded-lg text-sm font-semibold flex items-center space-x-1 hover:bg-red-900 hover:bg-opacity-30 transition-all duration-300', // Added hover effect
  activeNavButton: 'bg-gradient-to-r from-red-200 to-pink-200 text-red-700',
  inactiveNavButton: 'text-white hover:text-gray-100',
  contentWrapper: 'pt-16 px-4 sm:px-6 md:px-8', // Padding for content, but container has none
  card: 'bg-gradient-to-br from-red-50 via-pink-50 to-white rounded-2xl p-6 shadow-lg border border-red-100 hover:shadow-2xl hover:scale-105 transform transition-all duration-300 cursor-pointer',
  statsContainer: 'grid grid-cols-1 md:grid-cols-3 gap-6 mb-8',
  statsItem: 'text-center',
  requestCard: 'bg-gradient-to-r from-red-100 via-pink-100 to-white rounded-lg p-4 mb-4 flex justify-between items-center hover:bg-red-200 hover:scale-105 transform transition-all duration-300 cursor-pointer',
  timeline: 'relative border-l-2 border-red-400 pl-4 py-2',
  donorWall: 'grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mb-8',
  donorCard: 'bg-gradient-to-br from-red-100 via-pink-100 to-white rounded-lg p-4 flex items-center space-x-3 hover:bg-red-200 hover:scale-105 transform transition-all duration-300 cursor-pointer',
  profileImage:
    'w-10 h-10 rounded-full border-2 border-red-400 object-cover hover:border-pink-500 transition-all duration-300',
  sectionGap: 'mb-8',
};

// Mock data (replace with API calls in production)
const mockDonationHistory = [
  { id: 1, date: '2025-05-15', type: 'A+', location: 'City Hospital', livesSaved: 1 },
  { id: 2, date: '2025-03-10', type: 'A+', location: 'Red Cross Center', livesSaved: 1 },
];

const mockBloodRequests = [
  { id: 1, type: 'O-', location: 'City Hospital', urgency: 'Urgent', date: '2025-06-01' },
  { id: 2, type: 'B+', location: 'General Clinic', urgency: 'Normal', date: '2025-05-30' },
];

const mockDonorWall = [
  { id: 1, name: 'Aarav Sharma', donations: 5, avatar: '🩺' },
  { id: 2, name: 'Priya Reddy', donations: 4, avatar: '🩺' },
  { id: 3, name: 'Vikram Singh', donations: 3, avatar: '🩺' },
];

// Sub-component for Navigation Bar
const NavBar = ({ profileImage, onProfileClick, onDonateClick, onSearchClick, currentPath }) => (
  <div className={styles.navBar}>
    <div className="flex items-center">
      <h1 className="text-xl sm:text-2xl font-bold">BloodIn</h1>
    </div>
    <div className={styles.navItems}>
      <button
        onClick={onDonateClick}
        className={`${styles.navButton} ${
          currentPath === '/donate' ? styles.activeNavButton : styles.inactiveNavButton
        }`}
        aria-label="Go to donate"
      >
        <FontAwesomeIcon icon={faHandHoldingHeart} className="mr-1" />
        <span className="hidden sm:inline">Donate</span>
      </button>
      <button
        onClick={onSearchClick}
        className={`${styles.navButton} ${
          currentPath === '/search-blood' ? styles.activeNavButton : styles.inactiveNavButton
        }`}
        aria-label="Search blood"
      >
        <FontAwesomeIcon icon={faSearch} className="mr-1" />
        <span className="hidden sm:inline">Search Blood</span>
      </button>
      <button onClick={onProfileClick} className="text-white hover:text-gray-200" aria-label="Go to profile">
        {profileImage ? (
          <img src={profileImage} alt="Profile" className={styles.profileImage} />
        ) : (
          <FontAwesomeIcon icon={faUser} className="text-2xl" />
        )}
      </button>
    </div>
  </div>
);

// Sub-component for Donation Stats with Progress Ring
const DonationStats = ({ donations, livesSaved, level }) => (
  <div className={`${styles.statsContainer} ${styles.sectionGap}`}>
    <motion.div whileHover={{ scale: 1.05 }} className={styles.card}>
      <div className="relative flex flex-col items-center">
        <svg className="w-24 h-24 mb-2" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="45" fill="none" stroke="#fee2e2" strokeWidth="10" />
          <circle
            cx="50"
            cy="50"
            r="45"
            fill="none"
            stroke="#f87171"
            strokeWidth="10"
            strokeDasharray="283"
            strokeDashoffset={283 - (283 * donations) / 10}
            strokeLinecap="round"
            className="transition-all duration-500"
          />
          <div className="absolute inset-0 flex items-center justify-center">
            <FontAwesomeIcon icon={faDroplet} className="text-red-500 text-3xl" />
          </div>
        </svg>
        <p className="text-lg font-semibold text-gray-800">{donations}</p>
        <p className="text-xs text-gray-600">Donations</p>
      </div>
    </motion.div>
    <motion.div whileHover={{ scale: 1.05 }} className={styles.card}>
      <div className={styles.statsItem}>
        <FontAwesomeIcon icon={faHeart} className="text-red-500 text-3xl mb-2" />
        <p className="text-lg font-semibold text-gray-800">{livesSaved}</p>
        <p className="text-xs text-gray-600">Lives Saved</p>
      </div>
    </motion.div>
    <motion.div whileHover={{ scale: 1.05 }} className={styles.card}>
      <div className={styles.statsItem}>
        <FontAwesomeIcon icon={faShieldAlt} className="text-yellow-500 text-3xl mb-2" />
        <p className="text-lg font-semibold text-gray-800">Level {level}</p>
        <p className="text-xs text-gray-600">Blood Hero</p>
      </div>
    </motion.div>
  </div>
);

// Sub-component for Donation Impact Timeline
const ImpactTimeline = ({ history }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`${styles.card} ${styles.sectionGap}`}
  >
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Your Impact Timeline</h3>
    {history.length === 0 ? (
      <p className="text-gray-600 text-sm">Start your journey by donating today!</p>
    ) : (
      <div className="space-y-6">
        {history.map((donation) => (
          <motion.div
            key={donation.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
            className={styles.timeline}
          >
            <div className="absolute w-4 h-4 bg-gradient-to-r from-red-500 to-pink-600 rounded-full -left-2 border-2 border-white" />
            <p className="font-medium text-gray-800">{donation.date}</p>
            <p className="text-gray-600 text-sm">Donated {donation.type} at {donation.location}</p>
            <p className="text-green-600 text-sm flex items-center">
              <FontAwesomeIcon icon={faHeart} className="mr-1" /> Saved {donation.livesSaved} life{donation.livesSaved !== 1 ? 's' : ''}
            </p>
          </motion.div>
        ))}
      </div>
    )}
  </motion.div>
);

// Sub-component for Blood Requests
const BloodRequests = ({ requests, onHelp }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`${styles.card} ${styles.sectionGap}`}
  >
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Blood Requests Nearby</h3>
    {requests.length === 0 ? (
      <p className="text-gray-600 text-sm">No blood requests at the moment.</p>
    ) : (
      <div className="space-y-4">
        {requests.map((request) => (
          <motion.div
            key={request.id}
            whileHover={{ scale: 1.05 }}
            className={styles.requestCard}
            onClick={() => onHelp(request.id)}
          >
            <div>
              <p className="font-medium text-gray-800">Type: {request.type}</p>
              <p className="text-gray-600 text-sm">Location: {request.location}</p>
              <p className="text-gray-600 text-sm">Date: {request.date}</p>
            </div>
            <div className="flex items-center space-x-3">
              <span
                className={`px-2 py-1 rounded text-xs font-semibold ${
                  request.urgency === 'Urgent' ? 'bg-gradient-to-r from-red-500 to-pink-600 text-white' : 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-gray-800'
                }`}
              >
                {request.urgency}
              </span>
              <button
                className="text-red-600 hover:text-red-800 text-sm font-semibold"
                aria-label="Help with this request"
              >
                I Can Help
              </button>
            </div>
          </motion.div>
        ))}
      </div>
    )}
  </motion.div>
);

// Sub-component for Donor Wall
const DonorWall = ({ donors }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5 }}
    className={`${styles.card} ${styles.sectionGap}`}
  >
    <h3 className="text-lg font-semibold text-gray-800 mb-4">Donor Wall of Fame</h3>
    <div className={styles.donorWall}>
      {donors.map((donor) => (
        <motion.div
          key={donor.id}
          whileHover={{ scale: 1.05 }}
          className={styles.donorCard}
        >
          <span className="text-2xl">{donor.avatar}</span>
          <div>
            <p className="font-medium text-gray-800">{donor.name}</p>
            <p className="text-gray-600 text-sm flex items-center">
              <FontAwesomeIcon icon={faStar} className="text-yellow-500 mr-1" /> {donor.donations} Donations
            </p>
          </div>
        </motion.div>
      ))}
    </div>
  </motion.div>
);

// Main Home Component
const Home = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [donationHistory, setDonationHistory] = useState(mockDonationHistory);
  const [bloodRequests, setBloodRequests] = useState(mockBloodRequests);
  const [successMessage, setSuccessMessage] = useState('');

  // Load user data from localStorage on mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    setUser(userData);
  }, []);

  // Calculate Blood Hero level based on donations
  const calculateLevel = (donations) => Math.floor(donations / 2) + 1;

  // Handle "I Can Help" action for blood requests
  const handleHelpRequest = (requestId) => {
    setSuccessMessage('Thank you for volunteering! We’ll connect you with the requester.');
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  return (
    <div className={styles.container}>
      {/* Navigation Bar */}
      <NavBar
        profileImage={user?.profileImage}
        onProfileClick={() => navigate('/profile')}
        onDonateClick={() => navigate('/donate')}
        onSearchClick={() => navigate('/search-blood')}
        currentPath={location.pathname}
      />

      {/* Content Wrapper */}
      <div className={styles.contentWrapper}>
        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-green-600 text-sm text-center bg-gradient-to-r from-green-100 to-green-50 p-2 rounded-lg mb-8"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Greeting and CTA */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className={`${styles.card} ${styles.sectionGap}`}
        >
          <h2 className="text-xl font-semibold text-gray-800 mb-2">
            {user?.fullName ? `Hello, ${user.fullName}!` : 'Welcome!'}
          </h2>
          <p className="text-gray-600 mb-4">Join the mission to save lives through blood donation.</p>
        </motion.div>

        {/* Donation Stats with Blood Hero Level */}
        <DonationStats
          donations={donationHistory.length}
          livesSaved={donationHistory.reduce((sum, donation) => sum + donation.livesSaved, 0)}
          level={calculateLevel(donationHistory.length)}
        />

        {/* Impact Timeline */}
        <ImpactTimeline history={donationHistory} />

        {/* Blood Requests */}
        <BloodRequests requests={bloodRequests} onHelp={handleHelpRequest} />

        {/* Donor Wall */}
        <DonorWall donors={mockDonorWall} />
      </div>
    </div>
  );
};

export default Home;