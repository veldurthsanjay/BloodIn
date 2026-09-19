import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faHeartPulse, faMapLocationDot, faHandsHolding, faUserPlus } from '@fortawesome/free-solid-svg-icons';

const onboardingSlides = [
  {
    title: 'Welcome to BloodIn',
    description: 'Join a lifesaving movement that connects blood donors with those in need, ensuring no one faces a shortage in an emergency.',
    icon: faHeartPulse,
    color: 'from-red-500 to-red-700',
  },
  {
    title: 'Find Donors Instantly',
    description: 'Locate nearby blood donors or check hospital blood stocks in real-time. Receive urgent request alerts to act fast.',
    icon: faMapLocationDot,
    color: 'from-blue-500 to-blue-700',
  },
  {
    title: 'Save Lives Today',
    description: 'Your donation or request can make a difference. Enjoy smart matching, rewards, and a seamless experience.',
    icon: faHandsHolding,
    color: 'from-purple-500 to-purple-700',
  },
  {
    title: 'Be a Hero Now',
    description: 'Join our community of lifesavers. Together, we can ensure blood is always available when it is needed most.',
    icon: faUserPlus,
    color: 'from-orange-500 to-orange-700',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const isLastSlide = currentSlide === onboardingSlides.length - 1;
  const slide = onboardingSlides[currentSlide];

  const goToSlide = (index) => {
    setCurrentSlide(Math.max(0, Math.min(index, onboardingSlides.length - 1)));
  };

  const skipOnboarding = () => {
    goToSlide(onboardingSlides.length - 1);
  };

  const finishOnboarding = () => {
    navigate('/home', { replace: true });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        goToSlide(currentSlide + 1);
      } else if (event.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1);
      } else if (event.key === 'Enter' && isLastSlide) {
        finishOnboarding();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentSlide, isLastSlide]);

  return (
    <main className={`min-h-screen w-full bg-gradient-to-br ${slide.color} text-white flex flex-col px-6 py-8 sm:px-10`}>
      <div className="flex justify-end">
        {!isLastSlide && (
          <button
            type="button"
            onClick={skipOnboarding}
            className="text-lg font-semibold hover:text-white/80 focus:outline-none focus:ring-2 focus:ring-white rounded px-2 py-1"
          >
            Skip
          </button>
        )}
      </div>

      <section className="flex-1 flex items-center justify-center">
        <div className="w-full max-w-4xl rounded-3xl bg-white/15 backdrop-blur-sm p-8 sm:p-14 text-center shadow-xl">
          <FontAwesomeIcon icon={slide.icon} className="text-7xl mb-8" aria-hidden="true" />
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight mb-6">{slide.title}</h1>
          <p className="mx-auto max-w-2xl text-xl sm:text-2xl leading-relaxed text-white">{slide.description}</p>
        </div>
      </section>

      <div className="w-full max-w-4xl mx-auto space-y-8 pb-4">
        <div className="relative h-3 rounded-full bg-white/30 overflow-hidden" aria-label={`Onboarding progress: ${currentSlide + 1} of ${onboardingSlides.length}`}>
          <div
            className="absolute inset-y-0 left-0 rounded-full bg-white transition-all duration-300"
            style={{ width: `${((currentSlide + 1) / onboardingSlides.length) * 100}%` }}
          />
        </div>

        <div className="flex justify-center gap-4" role="tablist" aria-label="Onboarding slides">
          {onboardingSlides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => goToSlide(index)}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-4 w-4 rounded-full transition-transform focus:outline-none focus:ring-2 focus:ring-white ${index === currentSlide ? 'bg-white scale-125' : 'bg-white/60 hover:bg-white/90'}`}
            />
          ))}
        </div>

        {isLastSlide && (
          <button
            type="button"
            onClick={finishOnboarding}
            className="mx-auto block rounded-full bg-white px-10 py-4 text-xl font-semibold text-orange-600 shadow-lg transition hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-white"
          >
            Start Saving Lives
          </button>
        )}
      </div>
    </main>
  );
}
