import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartPulse, faMapLocationDot, faHandsHolding, faUserPlus } from '@fortawesome/free-solid-svg-icons';
import { faLinkedin, faGithub, faBehance } from '@fortawesome/free-brands-svg-icons';

const Onboarding = () => {
  const navigate = useNavigate();
  const [onboardingStep, setOnboardingStep] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [showPopup, setShowPopup] = useState(true); 
  const onboardingSlides = [
    {
      title: 'Welcome to BloodIn',
      description: 'Join a lifesaving movement that connects blood donors with those in need, ensuring no one faces a shortage in an emergency.',
      icon: faHeartPulse,
      color: 'bg-gradient-to-br from-red-500 to-red-700',
      pattern: 'bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 15c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm0-10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z\' fill=\'%23ffffff\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")]',
    },
    {
      title: 'Find Donors Instantly',
      description: 'Locate nearby blood donors or check hospital blood stocks in real-time. Receive urgent request alerts to act fast.',
      icon: faMapLocationDot,
      color: 'bg-gradient-to-br from-blue-500 to-blue-700',
      pattern: 'bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Ccircle cx=\'10\' cy=\'10\' r=\'2\' fill=\'%23ffffff\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")]',
    },
    {
      title: 'Save Lives Today',
      description: 'Your donation or request can make a difference. Enjoy smart matching, rewards, and a seamless experience.',
      icon: faHandsHolding,
      color: 'bg-gradient-to-br from-purple-500 to-purple-700',
      pattern: 'bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cpath d=\'M10 14l-2-4 6-2-2 6z\' fill=\'%23ffffff\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")]',
    },
    {
      title: 'Be a Hero Now',
      description: 'Sign up to join our community of lifesavers. Together, we can ensure blood is always available when it’s needed most.',
      icon: faUserPlus,
      color: 'bg-gradient-to-br from-orange-500 to-orange-700',
      pattern: 'bg-[url("data:image/svg+xml,%3Csvg width=\'20\' height=\'20\' viewBox=\'0 0 20 20\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Crect x=\'9\' y=\'9\' width=\'2\' height=\'2\' fill=\'%23ffffff\' fill-opacity=\'0.1\'/%3E%3C/svg%3E")]',
    },
  ];

  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    if (isTransitioning || showPopup) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const handleTouchMove = (e) => {
    if (isTransitioning || showPopup) return;
    setTouchEnd(e.targetTouches ? e.targetTouches[0].clientX : e.clientX);
  };

  const handleTouchEnd = () => {
    if (isTransitioning || !touchStart || !touchEnd || showPopup) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    setIsTransitioning(true);
    if (isLeftSwipe && onboardingStep < onboardingSlides.length - 1) {
      setOnboardingStep((prev) => prev + 1);
    }
    if (isRightSwipe && onboardingStep > 0) {
      setOnboardingStep((prev) => prev - 1);
    }
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handleSkip = () => {
    if (isTransitioning || showPopup) return;
    setIsTransitioning(true);
    setOnboardingStep(onboardingSlides.length - 1);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handleBack = () => {
    if (isTransitioning || onboardingStep === 0 || showPopup) return;
    setIsTransitioning(true);
    setOnboardingStep((prev) => prev - 1);
    setTimeout(() => setIsTransitioning(false), 700);
  };

  const handleGetStarted = () => {
    if (isTransitioning) return;
    navigate('/auth');
  };

  const handlePopupClose = () => {
    setShowPopup(false); 
  };

  const handleKeyDown = (e) => {
    if (isTransitioning || showPopup) return; 
    if (e.key === 'ArrowRight' && onboardingStep < onboardingSlides.length - 1) {
      setIsTransitioning(true);
      setOnboardingStep((prev) => prev + 1);
      setTimeout(() => setIsTransitioning(false), 700);
    }
    if (e.key === 'ArrowLeft' && onboardingStep > 0) {
      setIsTransitioning(true);
      setOnboardingStep((prev) => prev - 1);
      setTimeout(() => setIsTransitioning(false), 700);
    }
    if (e.key === 'Enter' && onboardingStep === onboardingSlides.length - 1) {
      handleGetStarted();
    }
  };

  useEffect(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onboardingStep, isTransitioning, showPopup]);

  const isLastSlide = onboardingStep === onboardingSlides.length - 1;

  return (
    <div
      className="min-h-screen w-full flex flex-col bg-gray-100 font-sans touch-none"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleTouchStart}
      onMouseMove={handleTouchMove}
      onMouseUp={handleTouchEnd}
      tabIndex={0}
    >
      {/* Pop-up */}
      {showPopup && (
        <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl p-8 max-w-md w-full mx-4 text-center space-y-6 shadow-2xl animate-popup">
            <h2 className="text-3xl font-extrabold text-gray-900">Developed by Veldurthi Sanjay</h2>
            <p className="text-lg text-gray-600">
              Passionate Full Stack Developer creating impactful solutions like BloodIn to connect and save lives.
            </p>
            <div className="flex justify-center space-x-6">
              <a
                href="https://www.linkedin.com/in/veldurthisanjay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-800 transition-colors"
                aria-label="Visit Sanjay's LinkedIn profile"
              >
                <FontAwesomeIcon icon={faLinkedin} size="2x" />
              </a>
              <a
                href="https://github.com/veldurthsanjay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-900 hover:text-gray-700 transition-colors"
                aria-label="Visit Sanjay's GitHub profile"
              >
                <FontAwesomeIcon icon={faGithub} size="2x" />
              </a>
              <a
                href="https://www.behance.net/veldurthisanjay"
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-600 transition-colors"
                aria-label="Visit Sanjay's Behance profile"
              > 
                <FontAwesomeIcon icon={faBehance} size="2x" />
              </a>
            </div>
            <button
              className="bg-red-600 text-white px-8 py-3 rounded-full text-lg font-semibold shadow-lg hover:bg-red-700 transition-all duration-300 transform hover:scale-105"
              onClick={handlePopupClose}
              aria-label="Close pop-up and start onboarding"
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      {/* Onboarding Content */}
      <div
        className={`min-h-screen flex flex-col items-center justify-between ${onboardingSlides[onboardingStep].color} ${onboardingSlides[onboardingStep].pattern} text-white transition-all duration-700 ease-in-out p-6 relative overflow-hidden ${showPopup ? 'opacity-50 pointer-events-none' : ''}`}
      >
        {/* Top Navigation */}
        <div className="w-full flex justify-between pt-4 z-10">
          <button
            className={`text-white text-lg font-medium hover:opacity-80 transition-opacity ${
              onboardingStep === 0 ? 'invisible' : ''
            }`}
            onClick={handleBack}
            aria-label="Go back to previous slide"
            disabled={isTransitioning || onboardingStep === 0}
          >
            Back
          </button>
          <button
            className={`text-white text-lg font-medium hover:opacity-80 transition-opacity ${
              isLastSlide ? 'invisible' : ''
            }`}
            onClick={handleSkip}
            aria-label="Skip onboarding"
            disabled={isTransitioning || isLastSlide}
          >
            Skip
          </button>
        </div>

        {/* Main Content */}
        <div className="flex-1 flex flex-col items-center justify-center text-center space-y-6 bg-white/10 backdrop-blur-lg rounded-2xl p-8 max-w-lg mx-4 shadow-lg animate-slideIn">
          <FontAwesomeIcon
            icon={onboardingSlides[onboardingStep].icon}
            size="5x"
            className="drop-shadow-xl animate-heartbeat"
            aria-hidden="true"
          />
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
            {onboardingSlides[onboardingStep].title}
          </h1>
          <p className="text-lg md:text-xl max-w-md leading-relaxed text-white/90">
            {onboardingSlides[onboardingStep].description}
          </p>
        </div>

        {/* Bottom Controls */}
        <div className="w-full flex flex-col items-center pb-16 space-y-6 z-10">
          {/* Progress Bar */}
          <div className="w-3/4 bg-white/30 rounded-full h-3 relative">
            <div
              className="bg-white h-3 rounded-full transition-all duration-500"
              style={{ width: `${((onboardingStep + 1) / onboardingSlides.length) * 100}%` }}
            />
            <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 text-sm font-medium text-white">
              {Math.round(((onboardingStep + 1) / onboardingSlides.length) * 100)}%
            </span>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center space-x-3">
            {onboardingSlides.map((_, index) => (
              <div
                key={index}
                className={`w-4 h-4 rounded-full cursor-pointer transition-all duration-300 ${
                  index === onboardingStep ? 'bg-white scale-125' : 'bg-white/50 hover:bg-white/80'
                }`}
                onClick={() => !isTransitioning && setOnboardingStep(index)}
                role="button"
                tabIndex={0}
                aria-label={`Go to slide ${index + 1}`}
                onKeyDown={(e) => e.key === 'Enter' && !isTransitioning && setOnboardingStep(index)}
              />
            ))}
          </div>

          {/* Get Started Button */}
          {isLastSlide && (
            <button
              className="bg-white text-red-600 px-10 py-4 rounded-full text-xl font-semibold shadow-2xl hover:bg-gray-100 hover:shadow-3xl transition-all duration-300 transform hover:scale-110 animate-bounce"
              onClick={handleGetStarted}
              aria-label="Get started with BloodConnect"
              disabled={isTransitioning}
            >
              Start Saving Lives
            </button>
          )}
        </div>

        {/* Final Slide Celebration Effect */}
        {isLastSlide && (
          <div className="absolute inset-0 pointer-events-none">
            <div className="animate-confetti">
              {[...Array(20)].map((_, i) => (
                <div
                  key={i}
                  className="absolute w-2 h-2 bg-red-400 rounded-full"
                  style={{
                    left: `${Math.random() * 100}%`,
                    top: `${Math.random() * 100}%`,
                    animation: `fall ${1 + Math.random()}s ease-in infinite`,
                    animationDelay: `${Math.random()}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Custom Animations */}
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateX(50px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateX(0) scale(1);
          }
        }
        .animate-slideIn {
          animation: slideIn 0.7s ease-out forwards;
        }
        @keyframes heartbeat {
          0%, 100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.15);
          }
        }
        .animate-heartbeat {
          animation: heartbeat 1.5s infinite ease-in-out;
        }
        @keyframes bounce {
          0%, 100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
        .animate-bounce {
          animation: bounce 2s infinite ease-in-out;
        }
        @keyframes fall {
          0% {
            transform: translateY(-100vh) rotate(0deg);
            opacity: 1;
          }
          100% {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
        .animate-confetti div {
          animation: fall linear infinite;
        }
        @keyframes popup {
          0% {
            opacity: 0;
            transform: scale(0.8);
          }
          100% {
            opacity: 1;
            transform: scale(1);
          }
        }
        .animate-popup {
          animation: popup 0.5s ease-out forwards;
        }
      `}</style>
    </div>
  );
  
};

export default Onboarding;