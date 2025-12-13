import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGoogle } from '@fortawesome/free-brands-svg-icons';
import { faEye, faEyeSlash, faUser, faEnvelope, faLock, faHeart, faDroplet } from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';

const Auth = () => {
  const navigate = useNavigate();
  const [isSignup, setIsSignup] = useState(true);
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    password: '',
  });
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  // Calculate password strength
  const calculatePasswordStrength = (password) => {
    let strength = 0;
    if (password.length >= 8) strength += 25;
    if (password.match(/[A-Z]/)) strength += 25;
    if (password.match(/[0-9]/)) strength += 25;
    if (password.match(/[^A-Za-z0-9]/)) strength += 25;
    return strength;
  };

  const validateForm = () => {
    const newErrors = {};
    if (isSignup && !formData.fullName.trim()) newErrors.fullName = 'Full name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (!formData.password) newErrors.password = 'Password is required';
    else if (formData.password.length < 8) newErrors.password = 'Password must be at least 8 characters';
    return newErrors;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
    setErrors({ ...errors, [name]: '' });
    if (name === 'password') {
      setPasswordStrength(calculatePasswordStrength(value));
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateForm();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    console.log(isSignup ? 'Signup data:' : 'Login data:', formData);

    // Store user data in localStorage
    localStorage.setItem('authToken', 'mock-token');
    localStorage.setItem('userData', JSON.stringify({
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password, // Insecure for production; use backend
    }));

    setLoading(false);
    navigate('/home', { replace: true }); // Navigate to /home
  };

  const handleGoogleSignIn = () => {
    alert('Google Sign-In will be available soon!');
  };

  // Reset form state after animation completes
  const handleToggle = () => {
    setIsAnimating(true);
    setIsSignup(!isSignup);
  };

  useEffect(() => {
    if (isAnimating) {
      const timer = setTimeout(() => {
        setFormData({ fullName: '', email: '', password: '' });
        setErrors({});
        setPasswordStrength(0);
        setIsAnimating(false);
      }, 300); // Match the animation duration
      return () => clearTimeout(timer);
    }
  }, [isSignup, isAnimating]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-white">
      {/* Subtle Background Overlay */}
      <div
        className="absolute inset-0 bg-gray-50/50 backdrop-blur-sm pointer-events-none"
        style={{
          backgroundImage: `radial-gradient(circle, #ef4444 1px, transparent 1px)`,
          backgroundSize: '20px 20px',
          opacity: 0.05,
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="bg-red-100 rounded-2xl p-8 max-w-md w-full border-2 border-red-300 shadow-2xl relative z-10 hover:shadow-3xl transition-shadow duration-300"
      >
        {/* Header with Blood Drop Icon */}
        <div className="flex justify-center items-center mb-6">
          <FontAwesomeIcon icon={faDroplet} className="text-red-500 text-3xl mr-2" />
          <h2 className="text-3xl font-extrabold text-gray-900 text-center">
            {isSignup ? 'Join BloodIn' : 'Welcome Back'}
          </h2>
        </div>

        {/* Form with Animation */}
        <AnimatePresence mode="wait">
          <motion.form
            key={isSignup ? 'signup' : 'login'}
            layout // Add layout prop to handle shared elements
            initial={{ opacity: 0, x: isSignup ? 20 : -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: isSignup ? -20 : 20 }}
            transition={{ duration: 0.2, ease: 'linear' }} // Optimize transition
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {errors.form && (
              <div className="text-red-600 text-sm text-center bg-red-200 p-2 rounded">
                {errors.form}
              </div>
            )}

            {/* Full Name (Signup Only) */}
            {isSignup && (
              <div>
                <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="fullName">
                  Full Name
                </label>
                <div className="relative">
                  <FontAwesomeIcon
                    icon={faUser}
                    className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                  />
                  <input
                    type="text"
                    id="fullName"
                    name="fullName"
                    value={formData.fullName}
                    onChange={handleChange}
                    className="w-full pl-10 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all duration-300 shadow-sm hover:bg-gray-50"
                    placeholder="Enter your full name"
                    aria-invalid={errors.fullName ? 'true' : 'false'}
                    aria-describedby={errors.fullName ? 'fullName-error' : undefined}
                  />
                </div>
                {errors.fullName && (
                  <p id="fullName-error" className="text-red-600 text-xs mt-1">{errors.fullName}</p>
                )}
              </div>
            )}

            {/* Email */}
            <div>
              <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="email">
                Email
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faEnvelope}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full pl-10 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all duration-300 shadow-sm hover:bg-gray-50"
                  placeholder="Enter your email"
                  aria-invalid={errors.email ? 'true' : 'false'}
                  aria-describedby={errors.email ? 'email-error' : undefined}
                />
              </div>
              {errors.email && (
                <p id="email-error" className="text-red-600 text-xs mt-1">{errors.email}</p>
              )}
            </div>

            {/* Password */}
            <div>
              <label className="block text-gray-800 text-sm font-medium mb-1" htmlFor="password">
                Password
              </label>
              <div className="relative">
                <FontAwesomeIcon
                  icon={faLock}
                  className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500"
                />
                <input
                  type={showPassword ? 'text' : 'password'}
                  id="password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  className="w-full pl-10 pr-12 p-3 rounded-lg bg-white text-gray-900 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-red-400 focus:bg-white transition-all duration-300 shadow-sm hover:bg-gray-50"
                  placeholder="Enter your password"
                  aria-invalid={errors.password ? 'true' : 'false'}
                  aria-describedby={errors.password ? 'password-error' : undefined}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-red-500 transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} />
                </button>
              </div>
              {errors.password && (
                <p id="password-error" className="text-red-600 text-xs mt-1">{errors.password}</p>
              )}
              {/* Password Strength Indicator */}
              <div className="mt-2">
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full transition-all duration-300 ${
                      passwordStrength <= 25
                        ? 'bg-red-500'
                        : passwordStrength <= 50
                        ? 'bg-orange-500'
                        : passwordStrength <= 75
                        ? 'bg-yellow-500'
                        : 'bg-green-500'
                    }`}
                    style={{ width: `${passwordStrength}%` }}
                  />
                </div>
                <p className="text-xs text-gray-600 mt-1">
                  Password Strength: {passwordStrength <= 25 ? 'Weak' : passwordStrength <= 50 ? 'Fair' : passwordStrength <= 75 ? 'Good' : 'Strong'}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-lg text-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-300 shadow-md relative overflow-hidden group ${loading ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              <span className="absolute inset-0 bg-red-700 opacity-0 group-hover:opacity-30 transition-opacity duration-300" />
              {loading ? 'Processing...' : isSignup ? 'Sign Up' : 'Log In'}
            </button>
          </motion.form>
        </AnimatePresence>

        {/* Google Sign-In */}
        <div className="mt-6">
          <button
            onClick={handleGoogleSignIn}
            disabled={true}
            className="w-full py-3 rounded-lg text-lg font-semibold text-gray-600 bg-gray-100 flex items-center justify-center space-x-2 relative group transition-all duration-300 hover:bg-gray-200"
            title="Google Sign-In coming soon"
          >
            <FontAwesomeIcon icon={faGoogle} className="text-blue-600" />
            <span>Sign in with Google</span>
            <span className="absolute invisible group-hover:visible bg-gray-800 text-white text-xs rounded py-1 px-2 -top-10 shadow-md">
              Coming Soon!
            </span>
          </button>
        </div>

        {/* Navigation Links */}
        <div className="text-center mt-4">
          <p className="text-gray-600">
            {isSignup ? 'Have an account?' : 'New here?'}
            <button
              onClick={handleToggle}
              className="ml-1 text-red-500 font-semibold hover:text-red-600 transition-colors duration-300"
            >
              {isSignup ? 'Login' : 'Sign Up'}
            </button>
          </p>
        </div>

        {/* Tagline */}
        {/* <div className="mt-4 text-center">
          <p className="text-gray-600 text-sm flex items-center justify-center">
            Made with <FontAwesomeIcon icon={faHeart} className="text-red-500 mx-1" /> for Blood Sharing
          </p>
        </div> */}
      </motion.div>
    </div>
  );
};

export default Auth;