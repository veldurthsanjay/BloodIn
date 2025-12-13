import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faUser,
  faEnvelope,
  faLock,
  faEye,
  faEyeSlash,
  faSignOutAlt,
  faHeart,
  faDroplet,
  faEdit,
  faPhone,
  faCamera,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

// Define styles as a constant object for better organization
const styles = {
  container:
    'min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 to-gray-100 relative overflow-x-hidden last:mb-10',
  backgroundPattern:
    'absolute inset-0 opacity-10 pointer-events-none',
  card:
    'bg-white rounded-2xl p-8 max-w-md w-full border border-red-200 shadow-lg relative z-10 hover:shadow-xl transition-shadow duration-300',
  avatarWrapper: 'relative w-20 h-20 mb-4',
  avatar: 'w-20 h-20 rounded-full bg-red-100 flex items-center justify-center border-2 border-red-300 overflow-hidden',
  avatarOverlay:
    'absolute inset-0 flex items-center justify-center bg-black bg-opacity-40 cursor-pointer transition-opacity duration-300 hover:bg-opacity-60',
  statsContainer: 'flex justify-around mb-6 bg-red-50 rounded-lg p-4',
  statsItem: 'text-center',
  inputWrapper: 'border-2 rounded-lg p-1',
  inputIcon: 'absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400',
  input:
    'w-full pl-10 p-3 rounded-lg text-gray-800 placeholder-gray-400 focus:outline-none transition-all duration-300 shadow-sm hover:bg-gray-100',
  inputEditable: 'bg-gray-50 focus:ring-2 focus:ring-red-400 focus:bg-white',
  inputDisabled: 'bg-gray-200 cursor-not-allowed',
  buttonContainer: 'flex space-x-3',
  editButton:
    'flex-1 py-3 rounded-lg text-lg font-semibold text-gray-800 bg-gray-200 hover:bg-gray-300 transition-all duration-300 shadow-md relative overflow-hidden group',
  updateButton:
    'flex-1 py-3 rounded-lg text-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-md relative overflow-hidden group',
  logoutButton:
    'py-2 px-4 rounded-lg text-sm font-semibold text-red-600 bg-red-100 hover:bg-red-200 transition-all duration-300 flex items-center mx-auto relative group',
  rippleEffect:
    'absolute inset-0 opacity-0 group-hover:opacity-30 transition-opacity duration-300',
};

// Sub-component for the Avatar and Progress Ring
const ProfileAvatar = ({ isEditing, profileImage, handleImageChange }) => (
  <div className={styles.avatarWrapper}>
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="45" fill="none" stroke="#e5e7eb" strokeWidth="10" />
      <circle
        cx="50"
        cy="50"
        r="45"
        fill="none"
        stroke="#ef4444"
        strokeWidth="10"
        strokeDasharray="283"
        strokeDashoffset={283 - (283 * 3) / 5} // Hardcoded donation stats for now
        strokeLinecap="round"
        className="transition-all duration-500"
      />
    </svg>
    <div className={styles.avatar}>
      {profileImage ? (
        <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
      ) : (
        <FontAwesomeIcon icon={faUser} className="text-3xl text-red-500" />
      )}
      {isEditing && (
        <label className={styles.avatarOverlay}>
          <FontAwesomeIcon icon={faCamera} className="text-white text-xl" />
          <input type="file" accept="image/*" onChange={handleImageChange} className="hidden" />
        </label>
      )}
    </div>
  </div>
);

// Sub-component for Donation Stats
const DonationStats = () => (
  <div className={styles.statsContainer}>
    <div className={styles.statsItem}>
      <FontAwesomeIcon icon={faDroplet} className="text-red-500 text-2xl mb-2" />
      <p className="text-lg font-semibold text-gray-800">3</p>
      <p className="text-xs text-gray-600">Donations</p>
    </div>
    <div className={styles.statsItem}>
      <FontAwesomeIcon icon={faHeart} className="text-red-500 text-2xl mb-2" />
      <p className="text-lg font-semibold text-gray-800">3</p>
      <p className="text-xs text-gray-600">Lives Saved</p>
    </div>
  </div>
);

// Sub-component for Form Input with Animation
const FormInput = ({ label, name, type, value, onChange, disabled, errors, icon, showPassword, toggleShowPassword }) => (
  <motion.div
    animate={{ borderColor: disabled ? '#e5e7eb' : '#ef4444', transition: { duration: 0.3 } }}
    className={styles.inputWrapper}
  >
    <label className="block text-gray-700 text-sm font-medium mb-1" htmlFor={name}>
      {label}
    </label>
    <div className="relative">
      <FontAwesomeIcon icon={icon} className={styles.inputIcon} />
      <input
        type={type}
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className={`${styles.input} ${disabled ? styles.inputDisabled : styles.inputEditable}`}
        placeholder={`Enter your ${label.toLowerCase()}`}
        aria-invalid={errors[name] ? 'true' : 'false'}
        aria-describedby={errors[name] ? `${name}-error` : undefined}
      />
      {name === 'password' && (
        <button
          type="button"
          onClick={toggleShowPassword}
          disabled={disabled}
          className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors"
          aria-label={showPassword ? 'Hide password' : 'Show password'}
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
        </button>
      )}
    </div>
    {errors[name] && (
      <p id={`${name}-error`} className="text-red-600 text-xs mt-1">
        {errors[name]}
      </p>
    )}
  </motion.div>
);

const Profile = ({ logout }) => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
    phone: '',
    profileImage: null,
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [isEditing, setIsEditing] = useState(false);

  // Load user data from localStorage on mount
  useEffect(() => {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    setFormData({
      fullName: userData.fullName || '',
      email: userData.email || '',
      password: userData.password || '',
      phone: userData.phone || '',
      profileImage: userData.profileImage || null,
    });
  }, []);

  // Form validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    if (formData.phone && !/^\+?\d{10,15}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number format';
    return newErrors;
  };

  // Handle input changes
  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  // Handle profile image upload
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.startsWith('image/')) {
        setErrors({ ...errors, profileImage: 'Please upload a valid image file' });
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setFormData({ ...formData, profileImage: reader.result });
        setErrors({ ...errors, profileImage: '' });
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    localStorage.setItem('userData', JSON.stringify(formData));
    setSuccessMessage('Profile updated successfully!');
    setLoading(false);
    setIsEditing(false);
    setTimeout(() => setSuccessMessage(''), 3000);
  };

  // Toggle edit mode
  const handleEditToggle = () => {
    setIsEditing(!isEditing);
    setErrors({});
  };

  // Handle logout and redirect
  const handleLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    logout();
    navigate('/auth', { replace: true });
  };

  return (
    <div className={styles.container}>
      {/* Background Pattern */}
      <div
        className={styles.backgroundPattern}
        style={{
          backgroundImage: `radial-gradient(circle, #ef4444 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className={styles.card}
      >
        {/* Header Section */}
        <div className="flex flex-col items-center mb-6">
          <ProfileAvatar
            isEditing={isEditing}
            profileImage={formData.profileImage}
            handleImageChange={handleImageChange}
          />
          <h2 className="text-2xl font-bold text-gray-800 text-center">
            {formData.fullName || 'Your Profile'}
          </h2>
          </div>

        {/* Donation Stats Section */}
        <DonationStats />

        {/* Success Message */}
        <AnimatePresence>
          {successMessage && (
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="text-green-600 text-sm text-center bg-green-100 p-2 rounded mb-4"
            >
              {successMessage}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Profile Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {errors.form && (
            <div className="text-red-600 text-sm text-center bg-red-100 p-2 rounded">
              {errors.form}
            </div>
          )}

          <FormInput
            label="Full Name"
            name="fullName"
            type="text"
            value={formData.fullName}
            onChange={handleChange}
            disabled={!isEditing}
            errors={errors}
            icon={faUser}
          />

          <FormInput
            label="Email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            disabled={!isEditing}
            errors={errors}
            icon={faEnvelope}
          />

          <FormInput
            label="Phone Number"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleChange}
            disabled={!isEditing}
            errors={errors}
            icon={faPhone}
          />

          <FormInput
            label="Password"
            name="password"
            type={showPassword ? 'text' : 'password'}
            value={formData.password}
            onChange={handleChange}
            disabled={!isEditing}
            errors={errors}
            icon={faLock}
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword(!showPassword)}
          />

          {/* Edit and Update Buttons */}
          <div className={styles.buttonContainer}>
            <button
              type="button"
              onClick={handleEditToggle}
              className={styles.editButton}
            >
              <span className={styles.rippleEffect} style={{ backgroundColor: '#9ca3af' }} />
              <FontAwesomeIcon icon={faEdit} className="mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
            {isEditing && (
              <button
                type="submit"
                disabled={loading}
                className={`${styles.updateButton} ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span className={styles.rippleEffect} style={{ backgroundColor: '#b91c1c' }} />
                {loading ? 'Updating...' : 'Update Profile'}
              </button>
            )}
          </div>
        </form>

        {/* Logout Button */}
        <div className="mt-6 text-center">
          <button onClick={handleLogout} className={styles.logoutButton}>
            <span className={styles.rippleEffect} style={{ backgroundColor: '#f87171' }} />
            <FontAwesomeIcon icon={faSignOutAlt} className="mr-2" />
            Log Out
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default Profile;