import React, { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faTint,
  faMapMarkerAlt,
  faCalendarAlt,
  faClock,
  faCheckCircle,
  faTimes,
  faPaperPlane,
  faQuestionCircle,
  faShareAlt,
  faTrophy,
  faUser,
  faPhone,
  faArrowRight,
  faArrowLeft,
  faIdCard,
  faDownload,
  faHeart,
  faHandsHolding,
} from '@fortawesome/free-solid-svg-icons';
import { motion, AnimatePresence } from 'framer-motion';
import QRCode from 'react-qr-code';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import { createRoot } from 'react-dom/client';

// Real-time slot generation - Uses actual current date/time
const generateSlots = () => {
  const slots = [];
  const now = new Date(); // Real current time (e.g., Dec 23, 2025 11:14 AM IST)

  const timeOptions = [
    { hour: 9, minute: 0 },   // 09:00 AM
    { hour: 12, minute: 0 },  // 12:00 PM
    { hour: 15, minute: 0 },  // 03:00 PM
    { hour: 18, minute: 0 },  // 06:00 PM
  ];

  // Generate for today + next 4 days
  for (let i = 0; i < 5; i++) {
    const date = new Date(now);
    date.setDate(now.getDate() + i);

    timeOptions.forEach(({ hour, minute }) => {
      // Skip past slots only for today
      if (i === 0) {
        const slotTime = new Date(date);
        slotTime.setHours(hour, minute, 0, 0);
        if (slotTime <= now) return; // Hide past slots
      }

      const slotDateTime = new Date(date);
      slotDateTime.setHours(hour, minute, 0, 0);

      const formattedDate = slotDateTime.toLocaleDateString('en-IN', {
        weekday: 'short',
        month: 'short',
        day: 'numeric',
      });
      const formattedTime = slotDateTime.toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
      });

      const label = `${formattedDate} at ${formattedTime}`;

      slots.push({
        time: slotDateTime.toISOString(),
        label,
        available: Math.floor(Math.random() * 6) + 1, // 1-6 slots
      });
    });
  }

  return slots.filter(slot => slot.available > 0);
};

// Mock hospitals with fresh real-time slots
const hospitals = [
  { id: 1, name: 'AIIMS Delhi', city: 'Delhi', slots: generateSlots(), highDemand: ['O+', 'A+'] },
  { id: 2, name: 'Safdarjung Hospital', city: 'Delhi', slots: generateSlots(), highDemand: ['O-', 'B+'] },
  { id: 3, name: 'Fortis Mumbai', city: 'Mumbai', slots: generateSlots(), highDemand: ['O-', 'AB+'] },
  { id: 4, name: 'KEM Hospital Blood Bank', city: 'Mumbai', slots: generateSlots(), highDemand: ['A+', 'O+'] },
  { id: 5, name: 'Jaslok Hospital', city: 'Mumbai', slots: generateSlots(), highDemand: ['B-', 'AB-'] },
  { id: 6, name: 'Apollo Chennai', city: 'Chennai', slots: generateSlots(), highDemand: ['B+', 'A-'] },
  { id: 7, name: 'Madras Medical College Blood Bank', city: 'Chennai', slots: generateSlots(), highDemand: ['O+', 'O-'] },
  { id: 8, name: 'Manipal Hospital', city: 'Bangalore', slots: generateSlots(), highDemand: ['A+', 'B+'] },
  { id: 9, name: 'Victoria Hospital Blood Bank', city: 'Bangalore', slots: generateSlots(), highDemand: ['O-', 'AB+'] },
  { id: 10, name: 'PGI Chandigarh', city: 'Chandigarh', slots: generateSlots(), highDemand: ['O+', 'A-'] },
  { id: 11, name: 'Fortis Hospital', city: 'Chandigarh', slots: generateSlots(), highDemand: ['B+', 'O-'] },
  { id: 12, name: 'CMC Vellore', city: 'Vellore', slots: generateSlots(), highDemand: ['A+', 'AB-'] },
  { id: 13, name: 'Vellore Blood Bank', city: 'Vellore', slots: generateSlots(), highDemand: ['O+', 'B-'] },
  { id: 14, name: 'Indian Red Cross Society', city: 'Kolkata', slots: generateSlots(), highDemand: ['O-', 'A+'] },
  { id: 15, name: 'SSKM Hospital Blood Bank', city: 'Kolkata', slots: generateSlots(), highDemand: ['B+', 'AB+'] },
  { id: 16, name: 'Medanta Hospital', city: 'Gurgaon', slots: generateSlots(), highDemand: ['O+', 'A-'] },
  { id: 17, name: 'Artemis Hospital Blood Bank', city: 'Gurgaon', slots: generateSlots(), highDemand: ['O-', 'B+'] },
  { id: 18, name: 'Narayana Health', city: 'Hyderabad', slots: generateSlots(), highDemand: ['A+', 'O+'] },
  { id: 19, name: 'Osmania General Hospital', city: 'Hyderabad', slots: generateSlots(), highDemand: ['B-', 'AB+'] },
  { id: 20, name: 'Global Hospital New York', city: 'New York', slots: generateSlots(), highDemand: ['AB-', 'B-'] },
];

// Eligibility questions
const eligibilityQuestions = [
  { id: 'age', question: 'Are you 18–65 years old?', required: true, info: 'Donors must be within this age range for safety.' },
  { id: 'weight', question: 'Do you weigh at least 50 kg (110 lbs)?', required: true, info: 'Minimum weight ensures safe blood volume donation.' },
  { id: 'health', question: 'Are you in good health (no fever, cold, etc.)?', required: true, info: 'Good health prevents complications during donation.' },
  { id: 'tattoo', question: 'Have you had a tattoo or piercing in the last 6 months?', required: false, reverse: true, info: 'Recent tattoos/piercings may pose infection risks.' },
  { id: 'surgery', question: 'Have you had surgery in the last 6 months?', required: false, reverse: true, info: 'Recent surgery requires recovery time before donating.' },
];

const Donate = () => {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: localStorage.getItem('donorName') || '',
    phone: localStorage.getItem('donorPhone') || '',
    aadhar: localStorage.getItem('donorAadhar') || '',
    bloodGroup: localStorage.getItem('donorBloodGroup') || '',
    city: '',
    hospital: '',
    dateTime: '',
  });
  const [errors, setErrors] = useState({});
  const [toast, setToast] = useState('');
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [showEligibilityModal, setShowEligibilityModal] = useState(false);
  const [donationHistory, setDonationHistory] = useState(
    JSON.parse(localStorage.getItem('donationHistory')) || []
  );
  const [eligibilityAnswers, setEligibilityAnswers] = useState({});
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isEligible, setIsEligible] = useState(null);
  const [showTooltip, setShowTooltip] = useState(!localStorage.getItem('seenDonateBloodTooltip'));
  const modalRef = useRef(null);
  const certificateRef = useRef(null);
  const bloodGroups = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-'];
  const cities = [
    'Mumbai',
    'Delhi',
    'Bangalore',
    'Chennai',
    'Kolkata',
    'Hyderabad',
    'Gurgaon',
    'Chandigarh',
    'Vellore',
    'New York',
  ];

  // Mock leaderboard
  const leaderboard = [
    { name: 'Anita Sharma', city: 'Delhi', donations: 12, points: 1200 },
    { name: 'Rahul Patel', city: 'Mumbai', donations: 8, points: 800 },
    { name: 'Sarah Johnson', city: 'New York', donations: 5, points: 500 },
    {
      name: formData.name || 'You',
      city: formData.city || 'Unknown',
      donations: donationHistory.length,
      points: donationHistory.length * 100,
    },
  ].sort((a, b) => b.points - a.points);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (modalRef.current && !modalRef.current.contains(event.target)) {
        resetFormAndStorage();
        setShowConfirmModal(false);
        setShowEligibilityModal(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (step === 2 && Object.keys(eligibilityAnswers).length === eligibilityQuestions.length) {
      const result = checkEligibility();
      setIsEligible(result);
      if (!result) {
        setShowEligibilityModal(true);
      }
    }
  }, [eligibilityAnswers, step]);

  const validateStep = () => {
    const newErrors = {};
    if (step === 1) {
      if (!formData.name.trim()) newErrors.name = 'Name is required';
      else if (!/^[A-Za-z\s]+$/.test(formData.name.trim())) newErrors.name = 'Name must contain only alphabets and spaces';
      if (!formData.phone.trim()) newErrors.phone = 'Phone number is required';
      else if (!/^\d{10}$/.test(formData.phone.trim())) newErrors.phone = 'Phone number must be exactly 10 digits';
      if (!formData.aadhar.trim()) newErrors.aadhar = 'Aadhar number is required';
      else if (!/^\d{12}$/.test(formData.aadhar.trim())) newErrors.aadhar = 'Aadhar number must be exactly 12 digits';
      if (!formData.bloodGroup) newErrors.bloodGroup = 'Select a blood group';
    } else if (step === 2) {
      if (Object.keys(eligibilityAnswers).length < eligibilityQuestions.length) newErrors.eligibility = 'Please answer all eligibility questions';
      else if (isEligible === false) newErrors.eligibility = 'You are not eligible to proceed';
    } else if (step === 3) {
      if (!formData.city) newErrors.city = 'Select a city';
      if (!formData.hospital) newErrors.hospital = 'Select a hospital';
      if (!formData.dateTime) newErrors.dateTime = 'Select a donation slot';
    }
    return newErrors;
  };

  const checkEligibility = () => {
    const requiredAnswers = eligibilityQuestions
      .filter((q) => q.required)
      .every((q) => eligibilityAnswers[q.id] === true);
    const optionalAnswers = eligibilityQuestions
      .filter((q) => !q.required && q.reverse)
      .every((q) => eligibilityAnswers[q.id] === false);
    return requiredAnswers && optionalAnswers;
  };

  const resetFormAndStorage = () => {
    setFormData({
      name: '',
      phone: '',
      aadhar: '',
      bloodGroup: '',
      city: '',
      hospital: '',
      dateTime: '',
    });
    setEligibilityAnswers({});
    setCurrentQuestionIndex(0);
    setIsEligible(null);
    setStep(1);
    setErrors({});
    localStorage.removeItem('donorName');
    localStorage.removeItem('donorPhone');
    localStorage.removeItem('donorAadhar');
    localStorage.removeItem('donorBloodGroup');
  };

  const resetEligibilityForRetake = () => {
    setEligibilityAnswers({});
    setCurrentQuestionIndex(0);
    setIsEligible(null);
    setShowEligibilityModal(false);
    setStep(2);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validateStep();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    if (step < 4) {
      setStep(step + 1);
      setErrors({});
      return;
    }
    const newDonation = {
      ...formData,
      id: `donation-${Date.now()}`,
      timestamp: Date.now(),
    };
    const updatedHistory = [newDonation, ...donationHistory].slice(0, 10);
    setDonationHistory(updatedHistory);
    localStorage.setItem('donationHistory', JSON.stringify(updatedHistory));
    console.log('Booking donation:', newDonation);
    setShowConfirmModal(true);
    showToast('Donation booked successfully!');
  };

  const handleShareSupport = () => {
    const shareText = `I support blood donation! Join me in saving lives by donating blood at this amazing platform. #BloodDonation #SaveLives`;
    if (navigator.share) {
      navigator.share({
        title: 'Support Blood Donation',
        text: shareText,
        url: window.location.href,
      });
    } else {
      console.log('Share Support:', shareText);
    }
    showToast('Thanks for spreading the word!');
  };

  const handleShare = () => {
    const maskedAadhar = formData.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3');
    const donationId = `DON-${Date.now()}`;
    const shareText = `${formData.name} is donating ${formData.bloodGroup} at ${formData.hospital} on ${new Date(
      formData.dateTime
    ).toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    })}! Aadhar: ${maskedAadhar} | Donation ID: ${donationId}`;
    if (navigator.share) {
      navigator.share({
        title: 'Blood Donation Certificate',
        text: shareText,
        url: window.location.href,
      });
    } else {
      console.log('Share:', shareText);
    }
    showToast('Shared your donation certificate!');
  };

  const handleCheckDonation = () => {
    console.log('Checking donation:', donationHistory[0]);
    showToast('Viewing your donation details!');
  };

  const handleDownloadCertificate = async (donation, isModal = false) => {
    const certificateElement = isModal
      ? certificateRef.current
      : document.createElement('div');
    if (!isModal) {
      certificateElement.className = 'bg-white p-6 rounded-xl shadow-2xl border-2 border-red-600 relative overflow-hidden certificate';
      certificateElement.style.width = '400px';
      certificateElement.innerHTML = `
        <div class="absolute inset-0 opacity-10 watermark"></div>
        <div class="relative z-10">
          <div class="absolute top-4 right-4 bg-white p-2 border-2 border-red-600 rounded qrcode-container"></div>
          <h3 class="text-xl font-extrabold text-red-600 mb-2">Lifesaver Certificate</h3>
          <div class="flex items-center mb-2">
            <div class="bg-red-600 text-white rounded-full p-2 mr-2">
              <svg class="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
              </svg>
            </div>
            <p class="text-sm font-semibold">${donationHistory.length} Donation${donationHistory.length > 1 ? 's' : ''}</p>
          </div>
          <p class="text-base text-gray-900 mb-1"><strong>Name:</strong> ${donation.name}</p>
          <p class="text-base text-gray-900 mb-1"><strong>Aadhar:</strong> ${donation.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3')}</p>
          <p class="text-base text-gray-900 mb-1"><strong>Blood Group:</strong> ${donation.bloodGroup}</p>
          <p class="text-base text-gray-900 mb-1"><strong>Hospital:</strong> ${donation.hospital}</p>
          <p class="text-base text-gray-900 mb-1"><strong>Date & Time:</strong> ${new Date(donation.dateTime).toLocaleString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
            hour: 'numeric',
            minute: '2-digit',
          })}</p>
          <p class="text-base text-gray-900 mb-1"><strong>Donation ID:</strong> DON-${donation.timestamp}</p>
          <p class="text-base text-red-600 mt-2"><strong>Earned 100 points!</strong> <svg class="inline w-5 h-5" fill="currentColor" viewBox="0 0 24 24"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm1 17h-2v-2h2v2zm2.07-7.75l-.9.92c-.5.51-.86.97-1.04 1.69-.17.68-.16 1.14.04 1.64.2.5.62.75 1.09.75.78 0 1.34-.62 1.66-1.22.42-.79.66-1.68.66-2.69 0-1.36-.62-2.56-1.51-3.09z"/></svg></p>
        </div>
      `;
      document.body.appendChild(certificateElement);
      const qrContainer = certificateElement.querySelector('.qrcode-container');
      const qrData = JSON.stringify({
        name: donation.name,
        aadhar: donation.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3'),
        bloodGroup: donation.bloodGroup,
        hospital: donation.hospital,
        dateTime: new Date(donation.dateTime).toLocaleString('en-US', {
          weekday: 'short',
          month: 'short',
          day: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
        }),
        donationId: `DON-${donation.timestamp}`,
      });
      const root = createRoot(qrContainer);
      root.render(
        <QRCode
          value={qrData}
          size={100}
          bgColor="#ffffff"
          fgColor="#000000"
        />
      );
    }
    try {
      const canvas = await html2canvas(certificateElement, { scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4',
      });
      const imgWidth = 180;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;
      const x = (210 - imgWidth) / 2;
      const y = (297 - imgHeight) / 2;
      pdf.addImage(imgData, 'PNG', x, y, imgWidth, imgHeight);
      pdf.save(`Lifesaver_Certificate_DON-${isModal ? donationHistory[0].timestamp : donation.timestamp}.pdf`);
      showToast('Certificate downloaded successfully!');
    } catch (error) {
      console.error('PDF generation failed:', error);
      showToast('Failed to download certificate.');
    }
    if (!isModal) {
      document.body.removeChild(certificateElement);
    }
  };

  const showToast = (message) => {
    setToast(message);
    setTimeout(() => setToast(''), 3000);
  };

  const closeTooltip = () => {
    setShowTooltip(false);
    localStorage.setItem('seenDonateBloodTooltip', 'true');
  };

  const getRecommendation = () => {
    if (!formData.bloodGroup || !formData.city) return null;
    const hospital = hospitals.find(
      (h) =>
        h.city === formData.city &&
        h.highDemand.includes(formData.bloodGroup) &&
        h.slots.some((s) => s.available > 0)
    );
    return hospital
      ? `${hospital.name} urgently needs ${formData.bloodGroup}! Book a slot now.`
      : `Your ${formData.bloodGroup} donation in ${formData.city} will save lives!`;
  };

  const navigateToStep = (targetStep) => {
    if (targetStep < step) {
      setStep(targetStep);
      return;
    }
    const validationErrors = validateStep();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setStep(targetStep);
    setErrors({});
  };

  return (
    <div className="m-2 p-0 max-w-7xl mx-auto bg-gradient-to-b from-gray-50 to-red-50 min-h-screen last:mb-10">
      {/* Hero Section */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="relative bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-2xl p-4 sm:p-6 text-center overflow-hidden m-0"
      >
        <div className="absolute inset-0 opacity-20">
          {[...Array(10)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute bg-red-300 rounded-full"
              style={{
                width: '8px',
                height: '8px',
                left: `${Math.random() * 100}%`,
                top: `${Math.random() * 100}%`,
              }}
              animate={{
                y: [0, -20, 0],
                opacity: [0.5, 1, 0.5],
              }}
              transition={{
                duration: 3 + Math.random() * 2,
                repeat: Infinity,
                delay: Math.random(),
              }}
            />
          ))}
        </div>
        <h1 className="text-xl sm:text-3xl font-extrabold">Be a Lifesaver, Donate Blood!</h1>
      </motion.div>

      {/* Toast Notification */}
      {toast && (
        <motion.div
          initial={{ opacity: 0, x: 100 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: 100 }}
          className="fixed bottom-4 right-4 bg-red-600 text-white p-3 rounded-xl shadow-2xl z-[1000] border-2 border-red-800 flex items-center space-x-2 text-sm sm:text-base max-w-[90vw]"
        >
          <FontAwesomeIcon icon={faCheckCircle} className="text-green-300" />
          <span>{toast}</span>
        </motion.div>
      )}

      {/* Interactive Progress Bar */}
      <div className="mt-2 mb-6 px-2 sm:px-6">
        <div className="flex justify-between items-center relative">
          {[
            { label: 'Profile', desc: 'Enter your details' },
            { label: 'Eligibility', desc: 'Check if you qualify' },
            { label: 'Schedule', desc: 'Pick a time slot' },
            { label: 'Confirm', desc: 'Review and book' },
          ].map((stepInfo, index) => (
            <div key={index} className="flex-1 text-center relative group z-10">
              <button
                onClick={() => navigateToStep(index + 1)}
                className={`w-8 h-8 sm:w-10 sm:h-10 mx-auto rounded-full flex items-center justify-center transition-all ${
                  step > index + 1
                    ? 'bg-gradient-to-r from-red-500 to-blue-500 text-white'
                    : step === index + 1
                    ? 'bg-red-600 text-white shadow-lg scale-110'
                    : 'bg-gray-200 text-gray-500'
                }`}
                aria-label={`Go to ${stepInfo.label} step`}
              >
                {step > index + 1 ? <FontAwesomeIcon icon={faCheckCircle} /> : index + 1}
              </button>
              <p className="text-xs sm:text-sm font-semibold mt-2">{stepInfo.label}</p>
              <div className="absolute z-20 top-12 left-1/2 transform -translate-x-1/2 hidden group-hover:block bg-gray-900 text-white text-xs rounded py-1 px-2">
                {stepInfo.desc}
              </div>
            </div>
          ))}
          <div className="absolute top-4 sm:top-5 left-0 right-0 h-1 bg-gray-200 rounded-full z-0">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 to-blue-500 rounded-full"
              initial={{ width: '0%' }}
              animate={{ width: `${(step / 4) * 100}%` }}
              transition={{ duration: 0.5, type: 'spring' }}
            />
          </div>
        </div>
      </div>

      {/* Confirmation Modal with Enhanced Certificate */}
      <AnimatePresence>
        {showConfirmModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 min-h-screen px-4 py-4"
          >
            <motion.div
              ref={modalRef}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.8, opacity: 0 }}
              transition={{ duration: 0.3, type: 'spring' }}
              className="bg-gradient-to-br from-white to-red-50 rounded-2xl p-4 w-full max-w-sm sm:max-w-md h-auto max-h-[90vh] shadow-2xl border border-red-300 flex flex-col overflow-y-auto"
              role="dialog"
              aria-labelledby="confirmModalTitle"
              aria-describedby="confirmModalDesc"
            >
              <div className="relative flex-1">
                {[...Array(20)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute bg-red-500 rounded-full"
                    style={{
                      width: '6px',
                      height: '6px',
                      left: `${Math.random() * 100}%`,
                      top: `${Math.random() * 100}%`,
                    }}
                    animate={{
                      y: [0, 100],
                      opacity: [1, 0],
                    }}
                    transition={{
                      duration: 2 + Math.random(),
                      repeat: 0,
                      delay: Math.random() * 0.5,
                    }}
                  />
                ))}
                <div className="flex justify-between items-center mb-4">
                  <h2 id="confirmModalTitle" className="text-lg sm:text-2xl font-extrabold text-red-600">
                    Donation Confirmed!
                  </h2>
                  <button
                    onClick={() => {
                      resetFormAndStorage();
                      setShowConfirmModal(false);
                    }}
                    className="text-gray-500 hover:text-red-600 transition-transform hover:scale-110"
                    aria-label="Close modal"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>
                <div
                  ref={certificateRef}
                  className="bg-white p-4 rounded-xl shadow-2xl border-2 border-red-600 relative overflow-hidden certificate animate-pulse-heartbeat mb-4"
                >
                  <div className="absolute inset-0 opacity-10 watermark"></div>
                  <div className="absolute top-4 right-4 bg-white p-2 border-2 border-red-600 rounded">
                    <QRCode
                      value={JSON.stringify({
                        name: formData.name,
                        aadhar: formData.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3'),
                        bloodGroup: formData.bloodGroup,
                        hospital: formData.hospital,
                        dateTime: new Date(formData.dateTime).toLocaleString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric',
                          hour: 'numeric',
                          minute: '2-digit',
                        }),
                        donationId: `DON-${donationHistory[0]?.timestamp || Date.now()}`,
                      })}
                      size={80}
                      bgColor="#ffffff"
                      fgColor="#000000"
                    />
                  </div>
                  <div className="relative z-10 pr-24 sm:pr-32">
                    <h3 className="text-lg sm:text-xl font-extrabold text-red-600 mb-2 font-sans">
                      Lifesaver Certificate
                    </h3>
                    <div className="flex items-center mb-2">
                      <div className="bg-red-600 text-white rounded-full p-2 mr-2">
                        <FontAwesomeIcon icon={faTint} />
                      </div>
                      <p className="text-xs sm:text-sm font-semibold">
                        {donationHistory.length} Donation{donationHistory.length > 1 ? 's' : ''}
                      </p>
                    </div>
                    <p className="text-xs sm:text-sm text-gray-900 mb-1 font-sans">
                      <strong>Name:</strong> {formData.name}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900 mb-1 font-sans">
                      <strong>Aadhar:</strong>{' '}
                      {formData.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3')}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900 mb-1 font-sans">
                      <strong>Blood Group:</strong> {formData.bloodGroup}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900 mb-1 font-sans">
                      <strong>Hospital:</strong> {formData.hospital}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900 mb-1 font-sans">
                      <strong>Date & Time:</strong>{' '}
                      {new Date(formData.dateTime).toLocaleString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: '2-digit',
                      })}
                    </p>
                    <p className="text-xs sm:text-sm text-gray-900 mb-1 font-sans">
                      <strong>Donation ID:</strong> DON-
                      {donationHistory[0]?.timestamp || Date.now()}
                    </p>
                    <p className="text-xs sm:text-sm text-red-600 mt-2 font-sans">
                      <strong>Earned 100 points!</strong>{' '}
                      <FontAwesomeIcon icon={faTrophy} className="ml-1" />
                    </p>
                  </div>
                </div>
                <div className="flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 sm:space-x-2">
                  <button
                    onClick={handleShare}
                    className="flex-1 py-2 px-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-all text-sm sm:text-lg flex items-center justify-center"
                  >
                    Share
                  </button>
                  <button
                    onClick={() => handleDownloadCertificate(donationHistory[0], true)}
                    className="flex-1 py-2 px-3 bg-green-600 text-white rounded-xl font-semibold hover:bg-green-700 transition-all text-sm sm:text-base flex items-center justify-center"
                  >
                    Download PDF
                  </button>
                  <button
                    onClick={handleCheckDonation}
                    className="flex-1 py-2 px-3 bg-yellow-600 text-white rounded-xl font-semibold hover:bg-yellow-700 transition-all text-sm sm:text-base flex items-center justify-center"
                  >
                    Check My Donations
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Enhanced Eligibility Failure Modal */}
      <AnimatePresence>
        {showEligibilityModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 px-4 py-4"
          >
            <motion.div
              initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
              animate={{ scale: 1, opacity: 1, rotate: 0 }}
              exit={{ scale: 0.8, opacity: 0, rotate: 10 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className="relative bg-white rounded-3xl p-4 w-full max-w-md h-auto max-h-[90vh] border-2 border-red-200 flex flex-col overflow-y-auto"
              role="dialog"
              aria-labelledby="eligibilityModalTitle"
              aria-describedby="eligibilityModalDesc"
            >
              {/* Background Gradient Overlay */}
              <motion.div
                className="absolute inset-0 bg-gradient-to-r from-red-100 to-blue-100 opacity-10"
                animate={{
                  background: [
                    'linear-gradient(to right, #f87171, #60a5fa)',
                    'linear-gradient(to right, #60a5fa, #f87171)',
                    'linear-gradient(to right, #f87171, #60a5fa)',
                  ],
                }}
                transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
              />
              {/* Confetti Particles */}
              {[...Array(15)].map((_, i) => (
                <motion.div
                  key={i}
                  className="absolute bg-red-400 rounded-full"
                  style={{
                    width: '6px',
                    height: '6px',
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                  }}
                  animate={{
                    y: [0, 150],
                    opacity: [1, 0],
                    rotate: Math.random() * 360,
                  }}
                  transition={{
                    duration: 3 + Math.random() * 2,
                    repeat: 0,
                    delay: Math.random() * 0.5,
                  }}
                />
              ))}
              <div className="z-10">
                {/* Header with Heartbeat Animation */}
                <div className="flex justify-between items-center mb-4">
                  <motion.h2
                    id="eligibilityModalTitle"
                    className="text-xl sm:text-3xl font-extrabold text-red-600 flex items-center"
                    animate={{ scale: [1, 1.05, 1] }}
                    transition={{ duration: 0.8, repeat: Infinity, ease: 'easeInOut' }}
                  >
                    <FontAwesomeIcon icon={faHeart} className="mr-2 text-red-500" />
                    Keep the Spirit Alive!
                  </motion.h2>
                  <button
                    onClick={() => {
                      resetFormAndStorage();
                      setShowEligibilityModal(false);
                    }}
                    className="text-gray-500 hover:text-red-600 transition-transform hover:scale-110"
                    aria-label="Close modal"
                  >
                    <FontAwesomeIcon icon={faTimes} size="lg" />
                  </button>
                </div>
                {/* Main Content */}
                <div className="bg-white p-3 rounded-2xl shadow-md border border-red-100">
                  <div className="flex justify-center mb-4">
                    <FontAwesomeIcon icon={faHandsHolding} className="text-red-600 text-5xl sm:text-7xl" />
                  </div>
                  <p id="eligibilityModalDesc" className="text-sm sm:text-lg text-gray-800 mb-4 font-medium text-center">
                    We're sorry, you are not currently eligible to donate blood. However, your compassionate spirit is truly admirable!
                  </p>
                  {/* Buttons */}
                  <div className="flex flex-col sm:flex-row justify-between space-y-3 sm:space-y-0 sm:space-x-3">
                    <button
                      onClick={resetEligibilityForRetake}
                      className="flex-1 py-3 px-4 bg-blue-500 text-white rounded-xl font-semibold hover:bg-blue-600 transition-all text-sm sm:text-base flex items-center justify-center"
                    >
                      Retake Eligibility Quiz
                    </button>
                    <button
                      onClick={handleShareSupport}
                      className="flex-1 py-3 px-4 bg-green-500 text-white rounded-xl font-semibold hover:bg-green-600 transition-all text-sm sm:text-base flex items-center justify-center shadow-md"
                    >
                      Share Your Support
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Stepper Form */}
      <motion.div
        id="donation-form"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="bg-white shadow-2xl rounded-2xl p-4 sm:p-6 mb-6 border border-red-200 mx-2 sm:mx-6"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <AnimatePresence mode="wait">
            {step === 1 && (
              <motion.div
                key="step1"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-gradient-to-br from-red-50 to-blue-50 p-4 rounded-xl border border-gray-200"
              >
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 col-span-1 sm:col-span-2">
                  Step 1: Donor Profile
                </h2>
                <div className="relative">
                  <label
                    htmlFor="name"
                    className="block text-sm sm:text-lg font-semibold text-gray-900"
                  >
                    Name
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faUser}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600"
                    />
                    <input
                      type="text"
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={(e) => {
                        const value = e.target.value;
                        if (/^[A-Za-z\s]*$/.test(value)) {
                          setFormData({ ...formData, name: value });
                        }
                      }}
                      className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-sm sm:text-base transition-all"
                      placeholder="Enter your name"
                      aria-invalid={errors.name ? 'true' : 'false'}
                    />
                  </div>
                  {errors.name && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 animate-shake">{errors.name}</p>
                  )}
                </div>
                <div className="relative">
                  <label
                    htmlFor="phone"
                    className="block text-sm sm:text-lg font-semibold text-gray-900"
                  >
                    Phone Number
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faPhone}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600"
                    />
                    <input
                      type="text"
                      id="phone"
                      name="phone"
                      value={formData.phone}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 10);
                        setFormData({ ...formData, phone: value });
                      }}
                      className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-sm sm:text-base transition-all"
                      placeholder="e.g., 9876543210"
                      aria-invalid={errors.phone ? 'true' : 'false'}
                    />
                  </div>
                  {errors.phone && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 animate-shake">{errors.phone}</p>
                  )}
                </div>
                <div className="relative">
                  <label
                    htmlFor="aadhar"
                    className="block text-sm sm:text-lg font-semibold text-gray-900"
                  >
                    Aadhar Number
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faIdCard}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600"
                    />
                    <input
                      type="text"
                      id="aadhar"
                      name="aadhar"
                      value={formData.aadhar}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '').slice(0, 12);
                        setFormData({ ...formData, aadhar: value });
                      }}
                      className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-sm sm:text-base transition-all"
                      placeholder="e.g., 123456789012"
                      aria-invalid={errors.aadhar ? 'true' : 'false'}
                    />
                  </div>
                  {errors.aadhar && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 animate-shake">{errors.aadhar}</p>
                  )}
                </div>
                <div className="relative">
                  <label
                    htmlFor="bloodGroup"
                    className="block text-sm sm:text-lg font-semibold text-gray-900"
                  >
                    Blood Group
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
                    <select
                      id="bloodGroup"
                      name="bloodGroup"
                      value={formData.bloodGroup}
                      onChange={(e) =>
                        setFormData({ ...formData, bloodGroup: e.target.value })
                      }
                      className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-sm sm:text-base transition-all"
                      aria-invalid={errors.bloodGroup ? 'true' : 'false'}
                    >
                      <option value="">Select your blood group</option>
                      {bloodGroups.map((group) => (
                        <option key={group} value={group}>
                          {group}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.bloodGroup && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 animate-shake">{errors.bloodGroup}</p>
                  )}
                  {showTooltip && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute z-20 mt-2 w-56 max-w-[90vw] sm:w-64 bg-red-600 text-white p-3 rounded-xl shadow-2xl left-1/2 -translate-x-1/2 sm:left-0 sm:-translate-x-0"
                    >
                      <p className="text-xs sm:text-sm">
                        Select your blood group. One donation can save up to 3 lives!
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
              </motion.div>
            )}
            {step === 2 && (
              <motion.div
                key="step2"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-red-50 to-blue-50 p-4 rounded-xl border border-gray-200"
              >
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4">
                  Step 2: Eligibility Check
                  <span className="text-sm font-semibold text-gray-500 ml-2">
                    ({currentQuestionIndex + 1}/{eligibilityQuestions.length})
                  </span>
                </h2>
                <motion.div
                  key={currentQuestionIndex}
                  initial={{ opacity: 0, rotateY: 90 }}
                  animate={{ opacity: 1, rotateY: 0 }}
                  transition={{ duration: 0.3 }}
                  className="bg-white p-4 rounded-xl shadow-md border border-red-200"
                >
                  <p className="text-sm sm:text-lg font-semibold text-gray-900 mb-2">
                    {eligibilityQuestions[currentQuestionIndex].question}
                  </p>
                  <p className="text-xs sm:text-sm text-gray-600 mb-4">
                    {eligibilityQuestions[currentQuestionIndex].info}
                  </p>
                  <div className="flex space-x-4">
                    <button
                      type="button"
                      onClick={() =>
                        setEligibilityAnswers({
                          ...eligibilityAnswers,
                          [eligibilityQuestions[currentQuestionIndex].id]: true,
                        })
                      }
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                        eligibilityAnswers[eligibilityQuestions[currentQuestionIndex].id] === true
                          ? 'bg-green-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      Yes
                    </button>
                    <button
                      type="button"
                      onClick={() =>
                        setEligibilityAnswers({
                          ...eligibilityAnswers,
                          [eligibilityQuestions[currentQuestionIndex].id]: false,
                        })
                      }
                      className={`flex-1 py-3 px-4 rounded-xl font-semibold text-sm sm:text-base transition-all ${
                        eligibilityAnswers[eligibilityQuestions[currentQuestionIndex].id] === false
                          ? 'bg-red-500 text-white shadow-md'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      No
                    </button>
                  </div>
                </motion.div>
                <div className="mt-4 space-y-3 sm:flex sm:items-center sm:justify-between sm:space-y-0 sm:space-x-4">
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) => Math.max(0, prev - 1))
                    }
                    disabled={currentQuestionIndex === 0}
                    className="w-full sm:w-auto py-3 px-4 bg-gray-300 text-gray-700 rounded-xl font-semibold disabled:opacity-50 hover:bg-gray-400 transition-all text-sm sm:text-base"
                  >
                    <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                    Previous
                  </button>
                  {Object.keys(eligibilityAnswers).length === eligibilityQuestions.length && isEligible && (
                    <motion.div
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3 }}
                      className="w-full sm:w-auto px-6 py-3 bg-green-600 text-white rounded-xl font-semibold text-sm sm:text-base shadow-lg flex items-center justify-center border-2 border-green-800 text-center"
                    >
                      <FontAwesomeIcon icon={faCheckCircle} className="mr-2 text-green-300" />
                      You are eligible to donate!
                    </motion.div>
                  )}
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentQuestionIndex((prev) =>
                        Math.min(eligibilityQuestions.length - 1, prev + 1)
                      )
                    }
                    disabled={currentQuestionIndex === eligibilityQuestions.length - 1}
                    className="w-full sm:w-auto py-3 px-4 bg-red-600 text-white rounded-xl font-semibold disabled:opacity-50 hover:bg-red-700 transition-all text-sm sm:text-base"
                  >
                    Next
                    <FontAwesomeIcon icon={faArrowRight} className="ml-2" />
                  </button>
                </div>
                {errors.eligibility && (
                  <p className="text-red-600 text-xs sm:text-sm mt-2 text-center animate-shake">
                    {errors.eligibility}
                  </p>
                )}
              </motion.div>
            )}
            {step === 3 && (
              <motion.div
                key="step3"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="grid grid-cols-1 gap-4 bg-gradient-to-br from-red-50 to-blue-50 p-4 rounded-xl border border-gray-200"
              >
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900">
                  Step 3: Schedule Donation
                </h2>
                {getRecommendation() && (
                  <p className="text-sm sm:text-base text-red-600 bg-red-100 p-4 rounded-xl shadow-sm">
                    <FontAwesomeIcon icon={faTrophy} className="mr-2" />
                    {getRecommendation()}
                  </p>
                )}
                <div className="relative">
                  <label
                    htmlFor="city"
                    className="block text-sm sm:text-lg font-semibold text-gray-900"
                  >
                    City
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faMapMarkerAlt}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600"
                    />
                    <select
                      id="city"
                      name="city"
                      value={formData.city}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          city: e.target.value,
                          hospital: '',
                          dateTime: '',
                        })
                      }
                      className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-sm sm:text-base transition-all"
                      aria-invalid={errors.city ? 'true' : 'false'}
                    >
                      <option value="">Select a city</option>
                      {cities.map((city) => (
                        <option key={city} value={city}>
                          {city}
                        </option>
                      ))}
                    </select>
                  </div>
                  {errors.city && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 animate-shake">{errors.city}</p>
                  )}
                </div>
                <div className="relative">
                  <label
                    htmlFor="hospital"
                    className="block text-sm sm:text-lg font-semibold text-gray-900"
                  >
                    Hospital/Blood Bank
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faCalendarAlt}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600"
                    />
                    <select
                      id="hospital"
                      name="hospital"
                      value={formData.hospital}
                      onChange={(e) =>
                        setFormData({ ...formData, hospital: e.target.value, dateTime: '' })
                      }
                      className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-sm sm:text-base transition-all"
                      disabled={!formData.city}
                      aria-invalid={errors.hospital ? 'true' : 'false'}
                    >
                      <option value="">Select a hospital or blood bank</option>
                      {hospitals
                        .filter((h) => !formData.city || h.city === formData.city)
                        .map((h) => (
                          <option key={h.id} value={h.name}>
                            {h.name}{' '}
                            {formData.bloodGroup && h.highDemand.includes(formData.bloodGroup) && (
                              <span className="text-red-600 text-xs">(High Demand)</span>
                            )}
                          </option>
                        ))}
                    </select>
                  </div>
                  {errors.hospital && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 animate-shake">{errors.hospital}</p>
                  )}
                </div>
                {/* UPDATED DONATION SLOT SECTION */}
                <div className="relative">
                  <label
                    htmlFor="dateTime"
                    className="block text-sm sm:text-lg font-semibold text-gray-900"
                  >
                    Donation Slot
                  </label>
                  <div className="relative">
                    <FontAwesomeIcon
                      icon={faClock}
                      className="absolute left-3 top-1/2 transform -translate-y-1/2 text-red-600"
                    />
                    <select
                      id="dateTime"
                      name="dateTime"
                      value={formData.dateTime}
                      onChange={(e) => setFormData({ ...formData, dateTime: e.target.value })}
                      className="mt-1 block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl shadow-sm focus:ring-red-600 focus:border-red-600 text-sm sm:text-base transition-all"
                      disabled={!formData.hospital}
                      aria-invalid={errors.dateTime ? 'true' : 'false'}
                    >
                      <option value="">Select a time slot</option>
                      {formData.hospital &&
                        hospitals
                          .find((h) => h.name === formData.hospital)
                          ?.slots.map((slot) => (
                            <option key={slot.time} value={slot.time}>
                              {slot.label}{' '}
                              <span
                                className={`font-semibold ${
                                  slot.available > 3
                                    ? 'text-green-600'
                                    : slot.available > 1
                                    ? 'text-yellow-600'
                                    : 'text-red-600'
                                }`}
                              >
                                ({slot.available} slot{slot.available > 1 ? 's' : ''} left)
                              </span>
                            </option>
                          ))}
                    </select>
                  </div>
                  {errors.dateTime && (
                    <p className="text-red-600 text-xs sm:text-sm mt-1 animate-shake">
                      {errors.dateTime}
                    </p>
                  )}
                </div>
              </motion.div>
            )}
            {step === 4 && (
              <motion.div
                key="step4"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                transition={{ duration: 0.3 }}
                className="bg-gradient-to-br from-red-50 to-blue-50 p-4 rounded-xl border border-gray-200"
              >
                <h2 className="text-lg sm:text-xl font-extrabold text-gray-900 mb-4">
                  Step 4: Confirm Your Donation
                </h2>
                <div className="bg-white p-4 rounded-xl shadow-md border border-red-200">
                  <p className="text-sm sm:text-base text-gray-900 mb-2">
                    <strong>Name:</strong> {formData.name}
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 mb-2">
                    <strong>Phone:</strong> {formData.phone}
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 mb-2">
                    <strong>Aadhar:</strong>{' '}
                    {formData.aadhar.replace(/(\d{4})(\d{4})(\d{4})/, 'XXXX XXXX $3')}
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 mb-2">
                    <strong>Blood Group:</strong> {formData.bloodGroup}
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 mb-2">
                    <strong>Hospital:</strong> {formData.hospital}
                  </p>
                  <p className="text-sm sm:text-base text-gray-900 mb-4">
                    <strong>Date & Time:</strong>{' '}
                    {new Date(formData.dateTime).toLocaleString('en-US', {
                      weekday: 'short',
                      month: 'short',
                      day: 'numeric',
                      hour: 'numeric',
                      minute: '2-digit',
                    })}
                  </p>
                  <p className="text-sm sm:text-base text-red-600 bg-red-100 p-3 rounded-lg">
                    You’ll earn <strong>100 points</strong> and a{' '}
                    <strong>Lifesaver Certificate</strong> for this donation!
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div className="flex flex-col sm:flex-row space-y-4 sm:space-y-0 sm:space-x-6 justify-center">
            {step > 1 && (
              <button
                type="button"
                onClick={() => setStep(step - 1)}
                className="w-full sm:w-auto py-4 px-6 bg-gray-300 text-gray-700 rounded-xl font-semibold hover:bg-gray-400 transition-all text-sm sm:text-xl min-h-[48px] flex items-center justify-center shadow-md"
              >
                <FontAwesomeIcon icon={faArrowLeft} className="mr-2" />
                Back
              </button>
            )}
            <button
              type="submit"
              className="w-full sm:w-auto flex-1 py-4 px-6 bg-gradient-to-r from-red-600 to-blue-600 text-white rounded-xl font-semibold hover:from-red-700 hover:to-blue-700 transition-all text-sm sm:text-xl min-h-[48px] flex items-center justify-center shadow-md"
            >
              {step === 4 ? (
                <>
                  <FontAwesomeIcon icon={faPaperPlane} className="mr-2" />
                  Book Donation
                </>
              ) : (
                <>
                  <FontAwesomeIcon icon={faArrowRight} className="mr-2" />
                  Next
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

export default Donate;