import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeart,
  faPhone,
  faMapMarkerAlt,
  faSort,
  faTimes,
  faSearch,
  faTint,
  faBell,
  faMapSigns,
  faGlobe,
  faExclamationTriangle,
  faQuestionCircle,
  faCheckCircle,
  faClock,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const SearchBlood = () => {
  const [formData, setFormData] = useState({
    bloodGroups: [],
    city: '',
    urgency: 'immediate',
    radius: '10',
  });
  const [selectedBloodGroups, setSelectedBloodGroups] = useState([]);
  const [sortBy, setSortBy] = useState('distance');
  const [filters, setFilters] = useState({
    facilityType: 'all',
    is24Hour: 'all',
    minUnits: 0,
  });
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [favorites, setFavorites] = useState(JSON.parse(localStorage.getItem('favorites')) || []);
  const [recentSearches, setRecentSearches] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('recentSearches')) || [];
    return stored.map((search) => ({
      ...search,
      bloodGroups: Array.isArray(search.bloodGroups) ? search.bloodGroups : [],
    }));
  });
  const [toast, setToast] = useState('');
  const [errors, setErrors] = useState({});
  const [showBloodGroupDropdown, setShowBloodGroupDropdown] = useState(false);
  const [showTooltip, setShowTooltip] = useState(!localStorage.getItem('seenBloodGroupTooltip'));
  const [showUrgencyTooltip, setShowUrgencyTooltip] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const bloodGroupRef = useRef(null);
  const notifyModalRef = useRef(null);

  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = ['Mumbai', 'Delhi', 'Bangalore', 'Chennai', 'Kolkata', 'Bhubaneswar','Hyderabadn'];

  const mockData = [
    {
      id: '1',
      name: 'Apollo Hospital Blood Bank',
      type: 'Hospital',
      address: '123 MG Road, Mumbai, Maharashtra',
      latitude: 19.0760,
      longitude: 72.8777,
      contact: '+91-22-12345678',
      website: 'https://www.apollohospitals.com',
      is24Hour: true,
      distance: 2.5,
      lastUpdated: Date.now() - 3600000,
      bloodAvailability: { 'A+': 10, 'A-': 3, 'B+': 8, 'B-': 2, 'AB+': 5, 'AB-': 1, 'O+': 15, 'O-': 4 },
    },
    {
      id: '2',
      name: 'Red Cross Blood Bank',
      type: 'NGO',
      address: '456 Connaught Place, Delhi',
      latitude: 28.6328,
      longitude: 77.2167,         
      contact: '+91-11-98765432',
      website: 'https://www.redcrossindia.org',
      is24Hour: false,
      distance: 5.0,
      lastUpdated: Date.now() - 7200000,
      bloodAvailability: { 'A+': 12, 'A-': 4, 'B+': 6, 'B-': 1, 'AB+': 3, 'AB-': 0, 'O+': 10, 'O-': 2 },
    },
    {
      id: '3',
      name: 'Fortis Blood Bank',
      type: 'Hospital',
      address: '789 Bannerghatta Road, Bangalore, Karnataka',
      latitude: 12.9716,
      longitude: 77.5946,
      contact: '+91-80-12344321',
      website: 'https://www.fortishealthcare.com',
      is24Hour: true,
      distance: 3.2,
      lastUpdated: Date.now() - 86400000,
      bloodAvailability: { 'A+': 8, 'A-': 2, 'B+': 9, 'B-': 3, 'AB+': 6, 'AB-': 2, 'O+': 12, 'O-': 5 },
    },
    {
      id: '4',
      name: 'Chennai Blood Centre',
      type: 'Blood Bank',
      address: '101 Anna Salai, Chennai, Tamil Nadu',
      latitude: 13.0827,
      longitude: 80.2707,
      contact: '+91-44-56789012',
      website: 'https://www.chennaibloodcentre.org',
      is24Hour: false,
      distance: 4.8,
      lastUpdated: Date.now() - 3600000,
      bloodAvailability: { 'A+': 15, 'A-': 5, 'B+': 7, 'B-': 0, 'AB+': 4, 'AB-': 1, 'O+': 20, 'O-': 3 },
    },
    {
      id: '5',
      name: 'Kolkata Medical College Blood Bank',
      type: 'Hospital',
      address: '88 College Street, Kolkata, West Bengal',
      latitude: 22.5726,
      longitude: 88.3639,
      contact: '+91-33-12349876',
      website: 'https://www.kolkatamedicalcollege.org',
      is24Hour: true,
      distance: 6.1,
      lastUpdated: Date.now() - 172800000,
      bloodAvailability: { 'A+': 9, 'A-': 1, 'B+': 10, 'B-': 4, 'AB+': 2, 'AB-': 0, 'O+': 8, 'O-': 1 },
    },
    {
      id: '6',
      name: 'Bhubaneswar Blood Bank',
      type: 'Blood Bank',
      address: '321 Saheed Nagar, Bhubaneswar, Odisha',
      latitude: 20.2961,
      longitude: 85.8245,
      contact: '+91-674-98761234',
      website: 'https://www.bhubaneswarbloodbank.org',
      is24Hour: false,
      distance: 7.5,
      lastUpdated: Date.now() - 7200000,
      bloodAvailability: { 'A+': 6, 'A-': 2, 'B+': 5, 'B-': 1, 'AB+': 3, 'AB-': 0, 'O+': 10, 'O-': 2 },
    },
    {
      id: '7',
      name: 'Max Super Speciality Blood Bank',
      type: 'Hospital',
      address: '654 Saket, Delhi',
      latitude: 28.5273,
      longitude: 77.2119,
      contact: '+91-11-45678901',
      website: 'https://www.maxhealthcare.in',
      is24Hour: true,
      distance: 4.0,
      lastUpdated: Date.now() - 3600000,
      bloodAvailability: { 'A+': 14, 'A-': 4, 'B+': 8, 'B-': 2, 'AB+': 5, 'AB-': 1, 'O+': 18, 'O-': 6 },
    },
    {
      id: '8',
      name: 'Lions Blood Bank',
      type: 'NGO',
      address: '234 Teynampet, Chennai, Tamil Nadu',
      latitude: 13.0403,
      longitude: 80.2503,
      contact: '+91-44-67891234',
      website: 'https://www.lionsclubs.org',
      is24Hour: false,
      distance: 5.7,
      lastUpdated: Date.now() - 86400000,
      bloodAvailability: { 'A+': 7, 'A-': 3, 'B+': 6, 'B-': 2, 'AB+': 4, 'AB-': 1, 'O+': 9, 'O-': 3 },
    },
    {
      id: '9',
      name: 'Manipal Hospital Blood Bank',
      type: 'Hospital',
      address: '567 Old Airport Road, Bangalore, Karnataka',
      latitude: 12.9562,
      longitude: 77.6492,
      contact: '+91-80-98765432',
      website: 'https://www.manipalhospitals.com',
      is24Hour: true,
      distance: 3.9,
      lastUpdated: Date.now() - 3600000,
      bloodAvailability: { 'A+': 11, 'A-': 5, 'B+': 9, 'B-': 3, 'AB+': 6, 'AB-': 2, 'O+': 14, 'O-': 4 },
    },
    {
      id: '10',
      name: 'Rotary Blood Bank',
      type: 'NGO',
      address: '789 Park Street, Kolkata, West Bengal',
      latitude: 22.5532,
      longitude: 88.3547,
      contact: '+91-33-45678901',
      website: 'https://www.rotaryindia.org',
      is24Hour: false,
      distance: 8.2,
      lastUpdated: Date.now() - 172800000,
      bloodAvailability: { 'A+': 5, 'A-': 1, 'B+': 4, 'B-': 0, 'AB+': 2, 'AB-': 0, 'O+': 7, 'O-': 1 },
    },
  ];

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (bloodGroupRef.current && !bloodGroupRef.current.contains(event.target)) {
        setShowBloodGroupDropdown(false);
      }
      if (notifyModalRef.current && !notifyModalRef.current.contains(event.target)) {
        setShowNotifyModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const validateSearchForm = () => {
    const newErrors = {};
    if (formData.bloodGroups.length === 0) newErrors.bloodGroups = 'Select at least one blood group';
    if (!formData.city.trim()) newErrors.city = 'Please enter a city';
    if (!formData.radius || isNaN(formData.radius) || formData.radius <= 0)
      newErrors.radius = 'Enter a valid radius';
    return newErrors;
  };

  const validateNotifyForm = () => {
    const newErrors = {};
    if (formData.bloodGroups.length === 0) newErrors.bloodGroups = 'Select at least one blood group';
    if (!formData.city.trim()) newErrors.city = 'Please enter a city';
    if (!formData.urgency) newErrors.urgency = 'Select an urgency level';
    return newErrors;
  };

  const handleSearch = async (e) => {
    e.preventDefault();
    const validationErrors = validateSearchForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setErrors({});
    setHasSearched(true);

    // Save recent search
    const newSearch = { bloodGroups: formData.bloodGroups, city: formData.city, timestamp: Date.now() };
    const updatedSearches = [
      newSearch,
      ...recentSearches.filter(
        (s) => !(s.bloodGroups.join(',') === newSearch.bloodGroups.join(',') && s.city === newSearch.city)
      ),
    ].slice(0, 5);
    setRecentSearches(updatedSearches);
    localStorage.setItem('recentSearches', JSON.stringify(updatedSearches));
    // showToast('Search saved!');

    try {
      // Store selected blood groups for results display
      setSelectedBloodGroups(formData.bloodGroups);

      // Filter results based on form data
      const filteredResults = mockData
        .filter((item) => {
          const matchesBloodGroup = formData.bloodGroups.some((bg) => item.bloodAvailability[bg] > 0);
          const matchesCity = item.address.toLowerCase().includes(formData.city.toLowerCase());
          const matchesRadius = item.distance <= parseFloat(formData.radius);
          const matchesUrgency = formData.urgency !== 'immediate' || item.is24Hour;
          return matchesBloodGroup && matchesCity && matchesRadius && matchesUrgency;
        })
        .filter((item) => {
          const matchesFacilityType =
            filters.facilityType === 'all' ||
            item.type.toLowerCase().replace(' ', '_') === filters.facilityType;
          const matches24Hour =
            filters.is24Hour === 'all' ||
            (filters.is24Hour === 'true' ? item.is24Hour : !item.is24Hour);
          const matchesMinUnits = formData.bloodGroups.every(
            (bg) => item.bloodAvailability[bg] >= filters.minUnits
          );
          return matchesFacilityType && matches24Hour && matchesMinUnits;
        })
        .sort((a, b) => {
          if (sortBy === 'distance') return a.distance - b.distance;
          if (sortBy === 'units') {
            const aUnits = Math.max(...formData.bloodGroups.map((bg) => a.bloodAvailability[bg] || 0));
            const bUnits = Math.max(...formData.bloodGroups.map((bg) => b.bloodAvailability[bg] || 0));
            return bUnits - aUnits;
          }
          return a.name.localeCompare(b.name);
        });

      setResults(filteredResults);
      if (filteredResults.length === 0) {
        if (formData.urgency === 'immediate') {
          setErrors({
            form: (
              <span>
                No 24/7 facilities have{' '}
                <span className="inline-flex flex-wrap gap-2">
                  {formData.bloodGroups.map((group) => (
                    <span
                      key={group}
                      className="bg-red-200 text-red-600 px-3 py-1.5 rounded-full text-sm border border-red-300 shadow-sm"
                    >
                      {group}
                    </span>
                  ))}
                </span>{' '}
                in {formData.city}. Click "Notify Me" to get alerted when it becomes available!
              </span>
            ),
          });
        } else {
          setErrors({
            form: (
              <span>
                No{' '}
                <span className="inline-flex flex-wrap gap-2">
                  {formData.bloodGroups.map((group) => (
                    <span
                      key={group}
                      className="bg-red-200 text-red-600 px-3 py-1.5 rounded-full text-sm border border-red-300 shadow-sm"
                    >
                      {group}
                    </span>
                  ))}
                </span>{' '}
                available in {formData.city}. Click "Notify Me" to get alerted when it becomes available!
              </span>
            ),
          });
        }
        // Do not reset form to allow "Notify Me"
      } else {
        // Reset form only if results are found
        setFormData({
          bloodGroups: [],
          city: '',
          urgency: 'immediate',
          radius: '10',
        });
      }
    } catch (error) {
      console.error('Search Error:', error);
      setErrors({
        form: (
          <span>
            No{' '}
            <span className="inline-flex flex-wrap gap-2">
              {formData.bloodGroups.map((group) => (
                <span
                  key={group}
                  className="bg-red-200 text-red-600 px-3 py-1.5 rounded-full text-sm border border-red-300 shadow-sm"
                >
                  {group}
                </span>
              ))}
            </span>{' '}
            available in {formData.city}. Click "Notify Me" to get alerted when it becomes available!
          </span>
        ),
      });
      setResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleFavorite = (id) => {
    const newFavorites = favorites.includes(id)
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];
    setFavorites(newFavorites);
    localStorage.setItem('favorites', JSON.stringify(newFavorites));
    showToast(favorites.includes(id) ? 'Removed from favorites' : 'Added to favorites');
  };

  const handleContact = (contact) => {
    window.location.href = `tel:${contact}`;
    showToast(`Contacting: ${contact}`);
  };

  const handleShare = (item) => {
    if (navigator.share) {
      navigator.share({
        title: item.name,
        text: `${item.name} - ${item.address} - ${selectedBloodGroups
          .map((group) => `${group}: ${item.bloodAvailability[group]} units`)
          .join(', ')}`,
        url: window.location.href,
      });
    } else {
      showToast(`Sharing: ${item.name} - ${item.address}`);
    }
  };

  const handleDirections = (latitude, longitude, name) => {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}&destination_place_id=${encodeURIComponent(
      name
    )}`;
    window.open(url, '_blank');
    showToast(`Getting directions to ${name}`);
  };

  const handleWebsite = (website, name) => {
    if (website) {
      window.open(website, '_blank');
      showToast(`Visiting ${name} website`);
    } else {
      showToast('Website not available');
    }
  };

  const handleReportInaccuracy = (name) => {
    console.log(`Reporting inaccuracy for: ${name}`);
    showToast(`Inaccuracy reported for ${name}. We'll verify the data.`);
  };

  const handleRequestBlood = (name, bloodGroups) => {
    showToast(`Blood request sent to ${name} for ${bloodGroups.join(', ')}. You'll be contacted soon.`);
  };

  const handleNotify = () => {
    const validationErrors = validateNotifyForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      showToast('Please fill in all required fields.');
      return;
    }

    // Capture current formData for modal display
    const subscription = {
      bloodGroups: [...formData.bloodGroups], // Ensure bloodGroups is copied
      city: formData.city,
      urgency: formData.urgency,
    };
    localStorage.setItem('notifySubscription', JSON.stringify(subscription));

    // Show modal
    setShowNotifyModal(true);

    // Reset form after setting notification
    setFormData({ bloodGroups: [], city: '', urgency: 'immediate', radius: '10' });
    setErrors({});
    // showToast('Notification subscription saved!');
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 5000);
  };

  const clearForm = () => {
    setFormData({ bloodGroups: [], city: '', urgency: 'immediate', radius: '10' });
    setSelectedBloodGroups([]);
    setResults([]);
    setErrors({});
    setRecentSearches([]);
    localStorage.removeItem('recentSearches');
    showToast('Form and search history cleared!');
  };

  const handleRecentSearch = (search) => {
    setFormData({ ...formData, bloodGroups: search.bloodGroups || [], city: search.city });
    handleSearch({ preventDefault: () => {} });
  };

  const toggleBloodGroup = (group) => {
    setFormData((prev) => ({
      ...prev,
      bloodGroups: prev.bloodGroups.includes(group)
        ? prev.bloodGroups.filter((g) => g !== group)
        : [...prev.bloodGroups, group],
    }));
  };

  const removeBloodGroup = (group) => {
    setFormData((prev) => ({
      ...prev,
      bloodGroups: prev.bloodGroups.filter((g) => g !== group),
    }));
  };

  const closeTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('seenBloodGroupTooltip', 'true');
  };

  const searchStreak = recentSearches.filter(
    (s) => s.timestamp > Date.now() - 7 * 24 * 60 * 60 * 1000
  ).length;

  const isNotifyDisabled = () => {
    return formData.bloodGroups.length === 0 || !formData.city.trim() || !formData.urgency;
  };

  return (
    <div className="p-4 sm:p-6 md:p-8 max-w-7xl mx-auto bg-gradient-to-b from-gray-100 to-red-50 min-h-screen">
      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-4 right-4 bg-red-600 text-white p-4 rounded-xl shadow-2xl z-[1000] border-2 border-red-800 flex items-center space-x-2 text-base"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-300" />
          <span>{toast}</span>
        </motion.div>
      )}

      {/* Notify Modal */}
      <AnimatePresence>
        {showNotifyModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
          >
            <motion.div
              ref={notifyModalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="bg-gradient-to-r from-red-100 to-red-200 rounded-2xl p-6 w-11/12 max-w-sm sm:max-w-md shadow-2xl border border-red-300"
              role="dialog"
              aria-labelledby="notifyModalTitle"
              aria-describedby="notifyModalDesc"
            >
              <div className="flex justify-between items-center mb-4">
                <h2 id="notifyModalTitle" className="text-xl sm:text-2xl font-extrabold text-red-600">
                  Notification Set
                </h2>
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="text-gray-500 hover:text-red-600 transition-transform hover:scale-110"
                  aria-label="Close modal"
                >
                  <FontAwesomeIcon icon={faTimes} size="lg" />
                </button>
              </div>
              <p id="notifyModalDesc" className="text-base sm:text-lg text-gray-900 mb-6">
                {results.length === 0 ? (
                  <>
                    No{' '}
                    <span className="inline-flex flex-wrap gap-2">
                      {formData.bloodGroups.length > 0 ? (
                        formData.bloodGroups.map((group) => (
                          <span
                            key={group}
                            className="bg-red-200 text-red-600 px-3 py-1.5 rounded-full text-sm border border-red-300 shadow-sm"
                          >
                            {group}
                          </span>
                        ))
                      ) : (
                        <span className="font-semibold">blood groups</span>
                      )}
                    </span>{' '}
                    found in <span className="font-semibold">{formData.city || 'your selected city'}</span>. You’ll be notified when it becomes available.
                  </>
                ) : (
                  <>
                    You’ll be notified when{' '}
                    <span className="inline-flex flex-wrap gap-2">
                      {formData.bloodGroups.length > 0 ? (
                        formData.bloodGroups.map((group) => (
                          <span
                            key={group}
                            className="bg-red-200 text-red-600 px-3 py-1.5 rounded-full text-sm border border-red-300 shadow-sm"
                          >
                            {group}
                          </span>
                        ))
                      ) : (
                        <span className="font-semibold">any blood group</span>
                      )}
                    </span>{' '}
                    is available in{' '}
                    <span className="font-semibold">{formData.city || 'your selected city'}</span>.
                  </>
                )}
              </p>
              <div className="flex justify-end space-x-4">
                <button
                  onClick={() => setShowNotifyModal(false)}
                  className="py-3 px-6 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all hover:scale-105 text-base min-h-[48px]"
                >
                  Confirm
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Search Form */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, type: 'spring' }}
        className="bg-gradient-to-r from-red-100 to-red-200 shadow-xl rounded-2xl p-4 sm:p-6 mb-8 border border-red-300"
      >
        <h1 className="text-3xl sm:text-4xl font-extrabold text-red-600 mb-4">Find Blood Near You</h1>
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6 bg-white p-4 sm:p-6 rounded-xl border border-red-200 shadow-lg">
            {/* Blood Groups */}
            <div className="relative" ref={bloodGroupRef}>
              <label htmlFor="bloodGroups" className="block text-base sm:text-lg font-semibold text-gray-900">
                Blood Groups
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  className="ml-2 text-red-600 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setShowTooltip(true)}
                  aria-label="Show blood group help"
                />
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faTint}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600"
                />
                <div
                  className="mt-1 block w-full min-w-[200px] pl-10 pr-3 py-3 border border-red-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 cursor-pointer bg-white max-h-16 overflow-auto transition-all"
                  onClick={() => setShowBloodGroupDropdown(!showBloodGroupDropdown)}
                >
                  {formData.bloodGroups.length === 0 ? (
                    <span className="text-gray-500 text-base">Select blood groups</span>
                  ) : (
                    <div className="flex flex-wrap gap-2">
                      {formData.bloodGroups.map((group) => (
                        <motion.span
                          key={group}
                          initial={{ scale: 0 }}
                          animate={{ scale: 1 }}
                          exit={{ scale: 0 }}
                          className="bg-red-200 text-red-600 px-3 py-1.5 rounded-full text-sm flex items-center border border-red-300 shadow-sm"
                        >
                          {group}
                          <FontAwesomeIcon
                            icon={faTimes}
                            className="ml-2 cursor-pointer hover:text-red-800"
                            onClick={(e) => {
                              e.stopPropagation();
                              removeBloodGroup(group);
                            }}
                          />
                        </motion.span>
                      ))}
                    </div>
                  )}
                </div>
                {showBloodGroupDropdown && (
                  <motion.div
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -10 }}
                    className="absolute z-10 mt-1 w-full min-w-[200px] bg-white border border-red-300 rounded-xl shadow-2xl max-h-60 overflow-auto overscroll-contain"
                  >
                    {bloodGroups.map((group) => (
                      <label
                        key={group}
                        className="flex items-center p-3 hover:bg-red-100 cursor-pointer text-base transition-colors"
                      >
                        <input
                          type="checkbox"
                          checked={formData.bloodGroups.includes(group)}
                          onChange={() => toggleBloodGroup(group)}
                          className="mr-2 h-5 w-5 text-red-600"
                        />
                        {group}
                        {['O+', 'A+'].includes(group) && (
                          <span className="ml-2 text-sm text-red-600">(Common)</span>
                        )}
                      </label>
                    ))}
                  </motion.div>
                )}
              </div>
              {errors.bloodGroups && (
                <p className="text-red-600 text-sm mt-1 animate-shake">{errors.bloodGroups}</p>
              )}
              {showTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-20 mt-2 w-56 max-w-[90vw] sm:w-64 bg-red-600 text-white p-3 rounded-xl shadow-2xl left-1/2 -translate-x-1/2 sm:left-0 sm:-translate-x-0"
                >
                  <p className="text-xs sm:text-sm">
                    Select one or more blood groups (e.g., A+, O+). Click to add or remove.
                  </p>
                  <button
                    onClick={closeTooltip}
                    className="mt-2 text-xs underline hover:text-red-200"
                    aria-label="Close tooltip"
                  >
                    Got it
                  </button>
                </motion.div>
              )}
            </div>

            {/* City */}
            <div className="relative">
              <label htmlFor="city" className="block text-base sm:text-lg font-semibold text-gray-900">
                City
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faMapMarkerAlt}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600"
                />
                <input
                  type="text"
                  id="city"
                  name="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  list="cities"
                  className="mt-1 block w-full pl-10 pr-3 py-3 border border-red-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-base transition-all"
                  placeholder="Enter city (e.g., Mumbai)"
                  aria-invalid={errors.city ? 'true' : 'false'}
                />
                <datalist id="cities">
                  {cities.map((city) => (
                    <option key={city} value={city} />
                  ))}
                </datalist>
              </div>
              {errors.city && <p className="text-red-600 text-sm mt-1 animate-shake">{errors.city}</p>}
            </div>

            {/* Urgency */}
            <div className="relative">
              <label htmlFor="urgency" className="block text-base sm:text-lg font-semibold text-gray-900">
                Urgency
                <FontAwesomeIcon
                  icon={faQuestionCircle}
                  className="ml-2 text-red-600 cursor-pointer hover:scale-110 transition-transform"
                  onClick={() => setShowUrgencyTooltip(true)}
                  aria-label="Show urgency help"
                />
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faClock}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600"
                />
                <select
                  id="urgency"
                  name="urgency"
                  value={formData.urgency}
                  onChange={(e) => setFormData({ ...formData, urgency: e.target.value })}
                  className="mt-1 block w-full pl-10 pr-3 py-3 border border-red-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-base bg-white transition-all"
                  aria-describedby="urgency-help"
                >
                  <option value="immediate">Immediate</option>
                  <option value="24 hours">24 Hours</option>
                  <option value="48 hours">48 Hours</option>
                  <option value="72 hours">72 Hours</option>
                  <option value="flexible">Flexible</option>
                </select>
              </div>
              {errors.urgency && (
                <p className="text-red-600 text-sm mt-1 animate-shake">{errors.urgency}</p>
              )}
              {showUrgencyTooltip && (
                <motion.div
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0 }}
                  className="absolute z-20 mt-2 w-56 max-w-[90vw] sm:w-64 bg-red-600 text-white p-3 rounded-xl shadow-2xl left-1/2 -translate-x-1/2 sm:left-0 sm:-translate-x-0"
                >
                  <p className="text-xs sm:text-sm" id="urgency-help">
                    - Immediate: Only 24/7 facilities.
                    <br />
                    - 24/48/72 Hours: Available within the selected timeframe.
                    <br />
                    - Flexible: No time restrictions.
                  </p>
                  <button
                    onClick={() => setShowUrgencyTooltip(false)}
                    className="mt-2 text-xs underline hover:text-red-200"
                    aria-label="Close urgency tooltip"
                  >
                    Got it
                  </button>
                </motion.div>
              )}
            </div>

            {/* Search Radius */}
            <div>
              <label htmlFor="radius" className="block text-base sm:text-lg font-semibold text-gray-900">
                Search Radius (km)
              </label>
              <input
                type="number"
                id="radius"
                name="radius"
                value={formData.radius}
                onChange={(e) => setFormData({ ...formData, radius: e.target.value })}
                className="mt-1 block w-full p-3 border border-red-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-base transition-all"
                placeholder="e.g., 10"
                min="1"
                aria-invalid={errors.radius ? 'true' : 'false'}
              />
              {errors.radius && (
                <p className="text-red-600 text-sm mt-1 animate-shake">{errors.radius}</p>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6">
            <button
              type="submit"
              disabled={loading}
              className={`flex-1 py-4 px-4 sm:px-6 bg-red-600 text-white rounded-xl font-semibold hover:bg-red-700 transition-all duration-300 flex items-center justify-center text-lg sm:text-xl min-h-[48px] hover:scale-105 ${
                loading ? 'opacity-50 cursor-not-allowed' : ''
              }`}
            >
              {loading ? (
                <svg className="animate-spin h-6 w-6 mr-2 text-white" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                  />
                </svg>
              ) : (
                <FontAwesomeIcon icon={faSearch} className="mr-2" />
              )}
              {loading ? 'Searching...' : 'Search Blood'}
            </button>
            <button
              type="button"
              onClick={handleNotify}
              disabled={isNotifyDisabled()}
              className={`py-4 px-4 sm:px-6 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all duration-300 flex items-center justify-center text-lg sm:text-xl min-h-[48px] hover:scale-105 ${
                isNotifyDisabled() ? 'opacity-50 cursor-not-allowed' : results.length === 0 && hasSearched ? 'animate-pulse' : ''
              }`}
            >
              <FontAwesomeIcon icon={faBell} className="mr-2" />
              Notify Me
            </button>
          </div>
        </form>
      </motion.div>

      {/* Recent Searches */}
      {recentSearches.length > 0 && (
        <div className="mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl sm:text-2xl font-extrabold text-red-600">Recent Searches</h2>
            {searchStreak > 0 && (
              <span className="bg-yellow-100 text-yellow-600 px-3 py-1 rounded-full text-sm font-semibold">
                Search Streak: {searchStreak} this week!
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-4">
            {recentSearches.map((search, index) => (
              <button
                key={index}
                onClick={() => handleRecentSearch(search)}
                className="py-2 px-4 bg-red-200 text-red-600 rounded-xl hover:bg-red-300 transition-all hover:scale-105 flex items-center space-x-2"
              >
                <span>
                  {search.bloodGroups.join(', ')} in {search.city}
                </span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Sorting, Filters, and Results */}
      {hasSearched && (
        <>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8 gap-4"
          >
            <p className="text-gray-900 text-base sm:text-lg font-semibold">
              {results.length} {results.length === 1 ? 'facility' : 'facilities'} found
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex items-center space-x-3">
                <FontAwesomeIcon icon={faSort} className="text-red-600" />
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="p-3 border border-red-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-base bg-white transition-all"
                >
                  <option value="distance">Distance</option>
                  <option value="units">Available Units</option>
                  <option value="name">Name</option>
                </select>
              </div>
              <div className="flex flex-col sm:flex-row gap-4">
                <select
                  value={filters.facilityType}
                  onChange={(e) => setFilters({ ...filters, facilityType: e.target.value })}
                  className={`p-3 border border-red-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-base bg-white transition-all ${
                    filters.facilityType !== 'all' ? 'font-semibold text-red-600' : ''
                  }`}
                >
                  <option value="all">All Facilities</option>
                  <option value="hospital">Hospital</option>
                  <option value="ngo">NGO</option>
                  <option value="blood_bank">Blood Bank</option>
                </select>
                <select
                  value={filters.is24Hour}
                  onChange={(e) => setFilters({ ...filters, is24Hour: e.target.value })}
                  className={`p-3 border border-red-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-base bg-white transition-all ${
                    filters.is24Hour !== 'all' ? 'font-semibold text-red-600' : ''
                  }`}
                >
                  <option value="all">All Hours</option>
                  <option value="true">24/7 Only</option>
                  <option value="false">Non-24/7</option>
                </select>
                <input
                  type="number"
                  value={filters.minUnits}
                  onChange={(e) => setFilters({ ...filters, minUnits: parseInt(e.target.value) || 0 })}
                  className={`p-3 border border-red-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-base transition-all ${
                    filters.minUnits > 0 ? 'font-semibold text-red-600' : ''
                  }`}
                  placeholder="Min Units (e.g., 5)"
                  min="0"
                />
              </div>
            </div>
          </motion.div>

          <div>
            <AnimatePresence>
              {loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <svg
                    className="animate-spin h-12 w-12 mx-auto text-red-600"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8v8h8a8 8 0 01-16 0z"
                    />
                  </svg>
                  <p className="text-gray-900 text-base sm:text-lg mt-3 font-semibold">
                    Searching for blood...
                  </p>
                </motion.div>
              ) : results.length === 0 && !loading ? (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="text-center"
                >
                  <p className="text-gray-900 text-base sm:text-lg font-semibold">
                    {errors.form || (
                      <span>
                        No blood available. Click "Notify Me" to get alerted when it becomes available!
                      </span>
                    )}
                  </p>
                </motion.div>
              ) : (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 last:mb-10">
                  {results.map((item, index) => (
                    <motion.div
                      key={item.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.5, delay: index * 0.1, type: 'spring' }}
                      className="bg-gradient-to-br from-white to-red-50 shadow-xl rounded-2xl p-6 hover:shadow-2xl hover:scale-105 transition-all duration-300 border border-red-200"
                    >
                      {/* Header */}
                      <div className="flex justify-between items-start mb-4">
                        <h2 className="text-xl sm:text-2xl font-extrabold text-red-600 leading-tight">
                          {item.name}
                        </h2>
                        <button
                          onClick={() => handleFavorite(item.id)}
                          className={`p-2 rounded-full ${
                            favorites.includes(item.id) ? 'text-red-600' : 'text-gray-400'
                          } hover:text-red-600 hover:scale-110 transition-all`}
                          aria-label={
                            favorites.includes(item.id) ? 'Remove from favorites' : 'Add to favorites'
                          }
                        >
                          <FontAwesomeIcon icon={faHeart} size="lg" />
                        </button>
                      </div>

                      {/* Details */}
                      <div className="space-y-2 mb-4">
                        <p className="text-sm text-gray-900 flex items-center">
                          <span className="font-semibold w-20">Type:</span> {item.type}
                        </p>
                        <p className="text-sm text-gray-900 flex items-center">
                          <FontAwesomeIcon icon={faMapMarkerAlt} className="mr-2 text-red-600" />
                          <span className="font-semibold w-20">Address:</span> {item.address} (
                          {item.distance.toFixed(1)} km)
                        </p>
                        <p className="text-sm text-gray-900 flex items-center">
                          <span className="font-semibold w-20">Hours:</span>
                          {item.is24Hour ? (
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                              24/7 Available
                            </span>
                          ) : (
                            <span className="bg-yellow-100 text-yellow-600 px-2 py-1 rounded-full text-xs font-semibold">
                              Limited Hours
                            </span>
                          )}
                        </p>
                        <p className="text-sm text-gray-900 flex items-center">
                          <span className="font-semibold w-20">Updated:</span>
                          {Date.now() - item.lastUpdated < 7200000 ? (
                            <span className="bg-green-100 text-green-600 px-2 py-1 rounded-full text-xs font-semibold">
                              Live Data
                            </span>
                          ) : (
                            <span className="bg-gray-100 text-gray-600 px-2 py-1 rounded-full text-xs font-semibold">
                              {new Date(item.lastUpdated).toLocaleTimeString()}
                            </span>
                          )}
                        </p>
                      </div>

                      {/* Blood Availability */}
                      <div className="mb-4">
                        <p className="text-sm font-semibold text-gray-900 mb-2">Available Blood:</p>
                        <div className="flex flex-wrap gap-2">
                          {selectedBloodGroups.map((group) => {
                            const units = item.bloodAvailability[group];
                            return (
                              <span
                                key={group}
                                className="flex items-center bg-red-100 text-red-600 px-3 py-1 rounded-full text-sm font-medium"
                              >
                                {group}: {units} units
                                <span
                                  className={`ml-2 h-3 w-3 rounded-full ${
                                    units > 2
                                      ? 'bg-green-500'
                                      : units > 0
                                      ? 'bg-yellow-500 animate-pulse'
                                      : 'bg-red-500'
                                  }`}
                                />
                                {units <= 2 && units > 0 && (
                                  <span className="ml-2 text-xs text-red-600">Low stock!</span>
                                )}
                              </span>
                            );
                          })}
                        </div>
                      </div>

                      {/* Actions */}
                      <div className="flex flex-wrap gap-2">
                        <button
                          onClick={() => handleRequestBlood(item.name, selectedBloodGroups)}
                          className="p-2 rounded-full bg-orange-200 text-orange-600 hover:bg-orange-300 hover:scale-110 transition-all relative group"
                          aria-label="Request blood"
                        >
                          <FontAwesomeIcon icon={faTint} size="lg" />
                          <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Request Blood
                          </span>
                        </button>
                        <button
                          onClick={() => handleContact(item.contact)}
                          className="p-2 rounded-full bg-blue-200 text-blue-600 hover:bg-blue-300 hover:scale-110 transition-all relative group"
                          aria-label="Contact facility"
                        >
                          <FontAwesomeIcon icon={faPhone} size="lg" />
                          <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Call
                          </span>
                        </button>
                        <button
                          onClick={() => handleShare(item)}
                          className="p-2 rounded-full bg-green-200 text-green-600 hover:bg-green-300 hover:scale-110 transition-all relative group"
                          aria-label="Share facility details"
                        >
                          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z"
                            />
                          </svg>
                          <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Share
                          </span>
                        </button>
                        <button
                          onClick={() => handleDirections(item.latitude, item.longitude, item.name)}
                          className="p-2 rounded-full bg-purple-200 text-purple-600 hover:bg-purple-300 hover:scale-110 transition-all relative group"
                          aria-label="Get directions"
                        >
                          <FontAwesomeIcon icon={faMapSigns} size="lg" />
                          <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Directions
                          </span>
                        </button>
                        <button
                          onClick={() => handleWebsite(item.website, item.name)}
                          className="p-2 rounded-full bg-teal-200 text-teal-600 hover:bg-teal-300 hover:scale-110 transition-all relative group"
                          aria-label="Visit website"
                        >
                          <FontAwesomeIcon icon={faGlobe} size="lg" />
                          <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Website
                          </span>
                        </button>
                        <button
                          onClick={() => handleReportInaccuracy(item.name)}
                          className="p-2 rounded-full bg-red-200 text-red-600 hover:bg-red-300 hover:scale-110 transition-all relative group"
                          aria-label="Report inaccuracy"
                        >
                          <FontAwesomeIcon icon={faExclamationTriangle} size="lg" />
                          <span className="absolute bottom-10 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs rounded py-1 px-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            Report Issue
                          </span>
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </AnimatePresence>
          </div>
        </>
      )}
    </div>
  );
};

export default SearchBlood;