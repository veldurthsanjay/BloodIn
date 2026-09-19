import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import {
  faHeartPulse,
  faMapLocationDot,
  faHandsHolding,
  faUserPlus,
} from '@fortawesome/free-solid-svg-icons';

const onboardingSlides = [
  {
    title: 'Welcome to BloodIn',
    description:
      'Connect with blood donors and people who need help, whenever it matters most.',
    icon: faHeartPulse,
    color: 'from-red-500 to-red-600',
  },
  {
    title: 'Find Donors Nearby',
    description:
      'Discover nearby donors and respond quickly to urgent blood requests.',
    icon: faMapLocationDot,
    color: 'from-blue-500 to-blue-600',
  },
  {
    title: 'Save Lives',
    description:
      'Your donation can make a real difference when someone needs it most.',
    icon: faHandsHolding,
    color: 'from-purple-500 to-purple-600',
  },
  {
    title: 'Join BloodIn',
    description:
      'Become part of a community helping make blood available when needed.',
    icon: faUserPlus,
    color: 'from-orange-500 to-orange-600',
  },
];

export default function Onboarding() {
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);

  const slide = onboardingSlides[currentSlide];
  const isLastSlide = currentSlide === onboardingSlides.length - 1;

  const goToSlide = (index) => {
    setCurrentSlide(
      Math.max(0, Math.min(index, onboardingSlides.length - 1))
    );
  };

  const skipOnboarding = () => {
    setCurrentSlide(onboardingSlides.length - 1);
  };

  const finishOnboarding = () => {
    navigate('/home', { replace: true });
  };

  useEffect(() => {
    const handleKeyDown = (event) => {
      if (event.key === 'ArrowRight') {
        goToSlide(currentSlide + 1);
      }

      if (event.key === 'ArrowLeft') {
        goToSlide(currentSlide - 1);
      }

      if (event.key === 'Enter' && isLastSlide) {
        finishOnboarding();
      }
    };

    window.addEventListener('keydown', handleKeyDown);

    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [currentSlide, isLastSlide]);

  return (
    <main
      className={`min-h-screen bg-gradient-to-br ${slide.color} text-white flex flex-col`}
    >
      {/* Top */}
      <div className="flex justify-end px-6 pt-6">
        {!isLastSlide && (
          <button
            onClick={skipOnboarding}
            className="text-sm font-medium text-white/90 hover:text-white"
          >
            Skip
          </button>
        )}
      </div>

      {/* Content */}
      <section className="flex flex-1 items-center justify-center px-6">
        <div className="w-full max-w-md text-center">

          {/* Icon */}
          <div className="mx-auto mb-7 flex h-20 w-20 items-center justify-center rounded-full bg-white/20 backdrop-blur-sm">
            <FontAwesomeIcon
              icon={slide.icon}
              className="text-4xl"
              aria-hidden="true"
            />
          </div>

          {/* Text */}
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {slide.title}
          </h1>

          <p className="mx-auto max-w-sm text-base leading-7 text-white/90">
            {slide.description}
          </p>
        </div>
      </section>

      {/* Bottom */}
      <div className="px-6 pb-8">

        {/* Dots */}
        <div
          className="mb-7 flex justify-center gap-2"
          role="tablist"
          aria-label="Onboarding slides"
        >
          {onboardingSlides.map((item, index) => (
            <button
              key={item.title}
              type="button"
              onClick={() => goToSlide(index)}
              role="tab"
              aria-selected={index === currentSlide}
              aria-label={`Go to slide ${index + 1}`}
              className={`h-2 rounded-full transition-all duration-300 ${
                index === currentSlide
                  ? 'w-7 bg-white'
                  : 'w-2 bg-white/40'
              }`}
            />
          ))}
        </div>

        {/* Button */}
        {isLastSlide && (
          <button
            type="button"
            onClick={finishOnboarding}
            className="mx-auto block w-full max-w-sm rounded-xl bg-white py-3.5 text-base font-semibold text-orange-600 shadow-lg transition hover:bg-white/90"
          >
            Start Saving Lives
          </button>
        )}

        {!isLastSlide && (
          <button
            type="button"
            onClick={() => goToSlide(currentSlide + 1)}
            className="mx-auto block text-sm font-medium text-white/90 hover:text-white"
          >
            Continue →
          </button>
        )}
      </div>
    </main>
  );
}
