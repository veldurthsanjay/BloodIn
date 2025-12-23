import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
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
  faCheckCircle,
  faExclamationCircle,
  faInfoCircle,
} from '@fortawesome/free-solid-svg-icons';
import { Toaster, toast } from 'react-hot-toast';

// Validation schema
const schema = yup.object({
  fullName: yup.string().required('Full name is required'),
  email: yup.string().email('Invalid email format').required('Email is required'),
  phone: yup.string().matches(/^\+?\d{10,15}$/, 'Invalid phone number format').nullable(),
  password: yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
});

const styles = {
  container:
    'min-h-screen flex items-center justify-center bg-gradient-to-br from-red-50 via-rose-50 to-gray-100 relative overflow-hidden mb-20',
  backgroundPattern:
    'absolute inset-0 opacity-5 pointer-events-none',
  card:
    'bg-white/80 backdrop-blur-sm rounded-3xl p-4 md:p-6 max-w-md w-full border border-red-200/50 shadow-2xl relative z-10',
  headerActions: 'absolute top-4 right-4 flex space-x-3',
  actionButton:
    'flex items-center space-x-2 px-4 py-2 rounded-xl font-medium text-sm transition-all duration-300 shadow-md hover:shadow-lg',
  editButton:
    'bg-blue-500 text-white hover:bg-blue-600',
  logoutButton:
    'bg-red-500 text-white hover:bg-red-600',
  avatarWrapper: 'relative w-20 h-20 mb-4 mx-auto',
  avatar: 'w-full h-full rounded-full bg-gradient-to-br from-red-100 to-rose-200 flex items-center justify-center border-4 border-white/50 shadow-lg overflow-hidden',
  avatarOverlay:
    'absolute inset-0 flex items-center justify-center bg-gradient-to-t from-black/60 to-transparent rounded-full cursor-pointer opacity-0 hover:opacity-100 transition-opacity',
  statsContainer: 'flex justify-around mb-4 bg-gradient-to-r from-red-50 to-rose-50 rounded-2xl p-3 shadow-inner',
  statsItem: 'text-center',
  inputWrapper: 'space-y-0.5',
  inputIcon: 'absolute left-3 top-1/2 -translate-y-1/2 text-gray-400',
  input:
    'w-full pl-10 pr-12 p-3 rounded-xl text-gray-800 placeholder-gray-500 bg-white/50 backdrop-blur-sm border border-gray-200 focus:outline-none focus:ring-2 focus:ring-red-400/50 focus:border-transparent shadow-sm',
  inputDisabled: 'bg-gray-100/50 cursor-not-allowed opacity-70',
  buttonContainer: 'flex space-x-3 mt-6',
  cancelButton:
    'flex-1 py-3 px-4 rounded-xl text-base font-semibold text-gray-700 bg-gradient-to-r from-gray-100 to-gray-200 hover:from-gray-200 hover:to-gray-300 transition-all duration-300 shadow-lg',
  updateButton:
    'flex-1 py-3 px-4 rounded-xl text-base font-semibold text-white bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 transition-all duration-300 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed',
  editModeBanner:
    'bg-blue-50 border border-blue-200 text-blue-700 px-4 py-3 rounded-xl text-center text-sm font-medium mb-4 flex items-center justify-center',
  tooltip:
    'absolute -bottom-8 left-1/2 transform -translate-x-1/2 bg-gray-800 text-white text-xs rounded px-2 py-1 whitespace-nowrap z-10 opacity-0 group-hover:opacity-100 transition-opacity',
  completionBar: 'h-1 bg-gradient-to-r from-red-400 to-rose-500 rounded-full',
};

// Profile completion hook
const useProfileCompletion = (formData) => {
  const fields = ['fullName', 'email', 'phone', 'password'];
  return useMemo(() => {
    const completed = fields.filter(field => formData[field]?.trim()).length;
    return (completed / fields.length) * 100;
  }, [formData]);
};

// Avatar Component
const ProfileAvatar = ({ isEditing, profileImage, onImageChange, completion }) => {
  const handleDrop = useCallback((e) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onloadend = () => onImageChange(reader.result);
      reader.readAsDataURL(file);
      toast.success('Profile picture updated!');
    } else {
      toast.error('Please upload a valid image');
    }
  }, [onImageChange]);

  return (
    <div className={styles.avatarWrapper}>
      <svg className="absolute inset-0 w-full h-full pointer-events-none">
        <circle
          cx="50%"
          cy="50%"
          r="calc(50% - 2px)"
          fill="none"
          stroke="#ef4444"
          strokeWidth="4"
          strokeDasharray={`${2 * Math.PI * 38}`}
          strokeDashoffset={`${2 * Math.PI * 38 * (1 - completion / 100)}`}
          strokeLinecap="round"
        />
      </svg>
      <div
        className={styles.avatar}
        onDrop={isEditing ? handleDrop : undefined}
        onDragOver={isEditing ? (e) => e.preventDefault() : undefined}
      >
        {profileImage ? (
          <img src={profileImage} alt="Profile" className="w-full h-full object-cover" />
        ) : (
          <FontAwesomeIcon icon={faUser} className="text-4xl text-red-500" />
        )}
        {isEditing && (
          <label className={`${styles.avatarOverlay} group`}>
            <div className="text-center">
              <FontAwesomeIcon icon={faCamera} className="text-white text-2xl mb-1" />
              <p className="text-white text-xs font-medium">Change Photo</p>
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onloadend = () => onImageChange(reader.result);
                  reader.readAsDataURL(file);
                  toast.success('Photo uploaded!');
                }
              }}
              className="hidden"
            />
            <div className={styles.tooltip}>Drag & drop or click</div>
          </label>
        )}
      </div>
    </div>
  );
};

// Stats Component
const DonationStats = ({ donations = 3, livesSaved = 9 }) => (
  <div className={styles.statsContainer}>
    {[
      { icon: faDroplet, value: donations, label: 'Donations', color: 'from-blue-500 to-cyan-500' },
      { icon: faHeart, value: livesSaved, label: 'Lives Saved', color: 'from-red-500 to-pink-500' },
    ].map((stat) => (
      <div key={stat.label} className={styles.statsItem}>
        <div className={`p-3 rounded-full bg-gradient-to-r ${stat.color} mx-auto mb-2 shadow-lg w-fit`}>
          <FontAwesomeIcon icon={stat.icon} className="text-white text-2xl" />
        </div>
        <p className="text-2xl font-bold text-gray-800">{stat.value}</p>
        <p className="text-sm text-gray-600 font-medium">{stat.label}</p>
      </div>
    ))}
  </div>
);

// Input Component
const FormInput = ({ name, type, control, errors, icon, showPassword, toggleShowPassword, disabled, placeholder }) => (
  <div className={styles.inputWrapper}>
    <div className="relative">
      <FontAwesomeIcon
        icon={icon}
        className={`${styles.inputIcon} ${errors[name] ? 'text-red-500' : 'text-gray-400'}`}
      />
      <Controller
        name={name}
        control={control}
        render={({ field }) => (
          <input
            {...field}
            type={type}
            disabled={disabled}
            className={`${styles.input} ${disabled ? styles.inputDisabled : ''} ${errors[name] ? 'border-red-300 ring-red-200' : ''}`}
            placeholder={disabled ? placeholder + ' (Locked)' : placeholder}
          />
        )}
      />
      {name === 'password' && !disabled && (
        <button
          type="button"
          onClick={toggleShowPassword}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-red-500 transition-colors p-1 rounded-full hover:bg-gray-100"
        >
          <FontAwesomeIcon icon={showPassword ? faEyeSlash : faEye} size="sm" />
        </button>
      )}
    </div>
    {errors[name] && (
      <p className="flex items-center text-red-600 text-xs mt-1">
        <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" />
        {errors[name]?.message}
      </p>
    )}
  </div>
);

const Profile = ({ logout }) => {
  const navigate = useNavigate();
  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const defaultValues = useMemo(() => {
    const userData = JSON.parse(localStorage.getItem('userData')) || {};
    return {
      fullName: userData.fullName || '',
      email: userData.email || '',
      phone: userData.phone || '',
      password: userData.password || '',
      profileImage: userData.profileImage || null,
    };
  }, []);

  const { control, handleSubmit, formState: { errors, isSubmitting }, reset, watch } = useForm({
    defaultValues,
    resolver: yupResolver(schema),
    mode: 'onChange',
  });

  const formData = watch();
  const completion = useProfileCompletion({ ...defaultValues, ...formData });

  useEffect(() => {
    setProfileImage(defaultValues.profileImage || null);
    reset(defaultValues);
  }, [defaultValues, reset]);

  const onSubmit = async (data) => {
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      const updatedData = { ...data, profileImage };
      localStorage.setItem('userData', JSON.stringify(updatedData));
      toast.success('Profile updated successfully!');
      setIsEditing(false);
    } catch (error) {
      toast.error('Failed to update profile.');
    }
  };

  const handleImageChange = useCallback((imageSrc) => {
    setProfileImage(imageSrc);
  }, []);

  const handleEditToggle = () => {
    if (isEditing) {
      reset(defaultValues);
      setProfileImage(defaultValues.profileImage || null);
    }
    setIsEditing(prev => !prev);
  };

  const confirmLogout = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('userData');
    toast.success('Logged out successfully!');
    if (logout) logout();
    navigate('/auth', { replace: true });
  };

  return (
    <div className={styles.container}>
      <Toaster position="top-right" toastOptions={{ duration: 4000 }} />
      <div className={styles.backgroundPattern} style={{ backgroundImage: `radial-gradient(circle at 1px 1px, #ef4444 1px, transparent 0)`, backgroundSize: '50px 50px' }} />

      <div className={styles.card}>
        {/* Header Actions - Clear Labels */}
        <div className={styles.headerActions}>
          <div className="relative group">
            <button
              onClick={handleEditToggle}
              className={`${styles.actionButton} ${styles.editButton}`}
            >
              <FontAwesomeIcon icon={faEdit} />
              <span>{isEditing ? 'Cancel Edit' : 'Edit Profile'}</span>
            </button>
            <div className={styles.tooltip}>
              {isEditing ? 'Discard changes' : 'Update your information'}
            </div>
          </div>

          <div className="relative group">
            <button
              onClick={() => setShowLogoutConfirm(true)}
              className={`${styles.actionButton} ${styles.logoutButton}`}
            >
              <FontAwesomeIcon icon={faSignOutAlt} />
              <span>Logout</span>
            </button>
            <div className={styles.tooltip}>Sign out of your account</div>
          </div>
        </div>

        {/* Edit Mode Banner */}
        {isEditing && (
          <div className={styles.editModeBanner}>
            <FontAwesomeIcon icon={faInfoCircle} className="mr-2" />
            You are in edit mode. Make changes and click "Update Profile".
          </div>
        )}

        <div className="flex flex-col items-center mb-6 pt-12">
          <ProfileAvatar
            isEditing={isEditing}
            profileImage={profileImage}
            onImageChange={handleImageChange}
            completion={completion}
          />
          <h2 className="text-2xl md:text-3xl font-bold text-gray-800 mt-3">
            {formData.fullName || 'Your Profile'}
          </h2>
          <p className="text-sm text-gray-600">Complete your profile to help save more lives</p>
          <div className="w-full bg-gray-200 rounded-full h-2 mt-3">
            <div className={styles.completionBar} style={{ width: `${completion}%` }} />
          </div>
          <p className="text-xs text-gray-500 mt-1">{Math.round(completion)}% Profile Complete</p>
        </div>

        <DonationStats donations={3} livesSaved={9} />

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
          {Object.keys(errors).length > 0 && !isEditing && (
            <div className="bg-yellow-50 border border-yellow-200 text-yellow-800 px-4 py-3 rounded-xl text-sm">
              <FontAwesomeIcon icon={faExclamationCircle} className="mr-2" />
              Click "Edit Profile" to update your information.
            </div>
          )}

          <FormInput name="fullName" type="text" control={control} errors={errors} icon={faUser} disabled={!isEditing} placeholder="Full Name" />
          <FormInput name="email" type="email" control={control} errors={errors} icon={faEnvelope} disabled={!isEditing} placeholder="Email Address" />
          <FormInput name="phone" type="tel" control={control} errors={errors} icon={faPhone} disabled={!isEditing} placeholder="Phone Number (optional)" />
          <FormInput
            name="password"
            type={showPassword ? 'text' : 'password'}
            control={control}
            errors={errors}
            icon={faLock}
            showPassword={showPassword}
            toggleShowPassword={() => setShowPassword(!showPassword)}
            disabled={!isEditing}
            placeholder="Password"
          />

          {isEditing && (
            <div className={styles.buttonContainer}>
              <button type="button" onClick={handleEditToggle} className={styles.cancelButton}>
                Cancel
              </button>
              <button type="submit" disabled={isSubmitting} className={styles.updateButton}>
                {isSubmitting ? 'Updating...' : 'Update Profile'}
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Logout Confirmation */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setShowLogoutConfirm(false)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-2xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-xl font-bold text-gray-800 mb-3">Logout Confirmation</h3>
            <p className="text-gray-600 mb-6">Are you sure you want to log out? You will be redirected to the login page.</p>
            <div className="flex space-x-3">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 rounded-xl bg-gray-200 text-gray-700 font-medium hover:bg-gray-300 transition"
              >
                Stay Logged In
              </button>
              <button
                onClick={confirmLogout}
                className="flex-1 py-3 rounded-xl bg-red-500 text-white font-medium hover:bg-red-600 transition"
              >
                Yes, Logout
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;