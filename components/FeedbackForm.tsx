import React, { useState, useRef, useEffect } from 'react';
import { dbService } from '../services/db';
import { GuestInfo, FeedbackData } from '../types';
import {
  REGISTRATION_ASPECTS,
  ACCOMMODATION_ASPECTS,
  GALA_DINNER_ASPECTS,
  CULTURAL_PROGRAM_ASPECTS,
  EVENT_MANAGEMENT_ASPECTS,
  FACTORY_VISIT_ASPECTS,
  VENUE_ASPECTS,
  TRANSPORTATION_ASPECTS,
  HOUSEKEEPING_ASPECTS,
  FOOD_ASPECTS,
} from '../constants';

// ── Section icons ──────────────────────────────────────────────────────────
const sectionMeta: Record<string, { icon: string; color: string; label: string }> = {
  registrationReception: { icon: '🏷️', color: 'from-gold/20 to-midnight-900/60', label: 'Registration & Reception' },
  accommodation: { icon: '🏨', color: 'from-blue-900/30 to-midnight-900/60', label: 'Accommodation' },
  galaDinner: { icon: '🍽️', color: 'from-amber-900/30 to-midnight-900/60', label: 'Gala Dinner' },
  culturalProgram: { icon: '🎭', color: 'from-purple-900/30 to-midnight-900/60', label: 'Cultural Program' },
  eventManagement: { icon: '📋', color: 'from-teal-900/30 to-midnight-900/60', label: 'Event Management' },
  factoryVisit: { icon: '🏭', color: 'from-emerald-900/30 to-midnight-900/60', label: 'Factory Visit' },
  venue: { icon: '🏛️', color: 'from-rose-900/30 to-midnight-900/60', label: 'Venue' },
  transportation: { icon: '🚌', color: 'from-cyan-900/30 to-midnight-900/60', label: 'Transportation' },
  HouseKeeping: { icon: '🛏️', color: 'from-cyan-900/30 to-midnight-900/60', label: 'HouseKeeping' },
  Food: { icon: '🍛', color: 'from-cyan-900/30 to-midnight-900/60', label: 'Food' },
};

const STAR_LABELS = ['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'];

// ── Rating Stars ────────────────────────────────────────────────────────────
const RatingStars: React.FC<{
  value: number;
  onChange: (val: number) => void;
  large?: boolean;
}> = ({ value, onChange, large }) => {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex flex-col items-center sm:items-start gap-2">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`transition-all duration-200 focus:outline-none ${large ? 'p-1.5' : 'p-1'
              } ${active >= star ? 'text-gold scale-110' : 'text-midnight-700 hover:text-gold/50 hover:scale-105'}`}
            style={{ filter: active >= star ? 'drop-shadow(0 0 8px rgba(212,175,55,0.8))' : 'none' }}
          >
            <svg
              className={large ? 'w-10 h-10' : 'w-8 h-8'}
              viewBox="0 0 24 24"
              fill={active >= star ? 'currentColor' : 'none'}
              stroke="currentColor"
              strokeWidth={active >= star ? 0 : 1.5}
            >
              <path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" />
            </svg>
          </button>
        ))}
      </div>
      <div className="h-4">
        {active > 0 && (
          <span
            className="text-[10px] font-bold tracking-widest uppercase text-gold/90 transition-all animate-fadeIn"
          >
            {STAR_LABELS[active]}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Step Indicator ───────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ currentStep: number }> = ({ currentStep }) => {
  const steps = ['Welcome', 'Guest Details', 'Event Ratings'];
  const progress = Math.round((currentStep / 2) * 100);

  return (
    <div className="w-full space-y-3">
      {/* Progress bar */}
      <div className="relative h-1 w-full bg-midnight-800 rounded-full overflow-hidden">
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${progress}%`,
            background: 'linear-gradient(90deg, #b8941f, #d4af37, #ecbc2d)',
            boxShadow: '0 0 10px rgba(212,175,55,0.6)',
          }}
        />
      </div>
      {/* Step label */}
      <div className="flex items-center justify-between">
        <span className="section-badge">
          Step {currentStep} of 2
        </span>
        <span className="text-xs text-silver/60 font-medium tracking-wide">
          {steps[currentStep]}
        </span>
      </div>
    </div>
  );
};

// ── Success Screen ───────────────────────────────────────────────────────────
const SuccessScreen: React.FC<{ guestName: string }> = ({ guestName }) => (
  <div className="aurora-bg min-h-screen flex flex-col items-center justify-center p-6">
    <div className="luxury-card max-w-lg w-full p-10 text-center space-y-6 animate-fadeIn relative overflow-hidden">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.12) 0%, transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full animate-ripple"
          style={{ background: 'rgba(212,175,55,0.2)', animationDelay: '0.2s' }}
        />
        <div className="w-20 h-20 rounded-full flex items-center justify-center bg-gradient-to-br from-gold/30 to-gold/10 border border-gold/40">
          <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="section-badge text-xs tracking-widest">DXN SOUTH ASIA REGIONAL MANUFACTURING SUMMIT 2026</div>
      </div>

      <h1 className="font-display text-5xl font-bold gold-text glow-gold leading-tight">
        Thank You!
      </h1>

      {guestName && (
        <p className="font-display text-2xl text-champagne/80 italic">
          Dear {guestName},
        </p>
      )}



      <div className="gold-divider my-4" />
      <p className="text-xs tracking-widest uppercase text-silver/40 font-medium">
        Your voice shapes the future of DXN
      </p>

      <button
        onClick={() => window.location.reload()}
        className="btn-outline-gold px-8 py-3 rounded-xl font-semibold text-sm tracking-wide"
      >
        Submit Another Response
      </button>
    </div>
  </div>
);

// ── Main Form ────────────────────────────────────────────────────────────────
const FeedbackForm: React.FC = () => {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Form State
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({ name: '', country: '', designation: '' });
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>({
    registrationReception: {},
    accommodation: {},
    galaDinner: {},
    culturalProgram: {},
    eventManagement: {},
    factoryVisit: {},
    venue: {},
    transportation: {},
    HouseKeeping: {},
    Food: {}
  });
  const [overallExperience, setOverallExperience] = useState<number>(0);
  const [suggestions, setSuggestions] = useState('');
  const [recommendToOthers, setRecommendToOthers] = useState(true);

  // Auto-scroll refs
  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleRatingChange = (categoryKey: string, aspect: string, val: number, index: number) => {
    setRatings(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], [aspect]: val }
    }));

    // Smooth auto-scroll to next section after a brief delay
    setTimeout(() => {
      if (sectionRefs.current[index + 1]) {
        sectionRefs.current[index + 1]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }, 400);
  };

  const handleNext = (skipDetails = false) => {
    if (step === 1 && !skipDetails) {
      if (!guestInfo.name.trim() || !guestInfo.country.trim() || !guestInfo.designation.trim()) {
        setError('Please fill in all guest details, or click "Skip & Remain Anonymous".');
        return;
      }
    }

    // If skipping, fill with anonymous
    if (skipDetails) {
      setGuestInfo({ name: 'Anonymous Guest', country: 'Not specified', designation: 'Attendee' });
    }

    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => Math.min(s + 1, 2));
  };

  const handleBack = () => {
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    // Validate required fields
    if (overallExperience === 0) {
      setError('Please rate your overall experience before submitting.');
      if (sectionRefs.current[8]) {
        sectionRefs.current[8].scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    setError('');

    const feedback: FeedbackData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      guestInfo,
      registrationReception: ratings.registrationReception,
      accommodation: ratings.accommodation,
      galaDinner: ratings.galaDinner,
      culturalProgram: ratings.culturalProgram,
      eventManagement: ratings.eventManagement,
      factoryVisit: ratings.factoryVisit,
      venue: ratings.venue,
      transportation: ratings.transportation,
      HouseKeeping: ratings.HouseKeeping,
      Food: ratings.Food,
      overallExperience,
      suggestions,
      recommendToOthers,
    };

    try {
      await dbService.saveFeedback(feedback);
      setIsSuccess(true);
    } catch (err: any) {
      setError(`Submission failed: ${err.message || 'Please try again.'}`);
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isSuccess) {
    return <SuccessScreen guestName={guestInfo.name === 'Anonymous Guest' ? '' : guestInfo.name} />;
  }

  const renderStep = () => {
    switch (step) {
      // ── Welcome ──────────────────────────────────────────────────────────
      case 0:
        return (
          <div className="text-center space-y-8 py-8 animate-fadeIn">




            <div className="space-y-4">
              <h1 className="font-display text-3xl sm:text-4xl md:text-5xl font-bold leading-tight tracking-tight animate-fadeUp max-w-4xl mx-auto px-4">
                <span style={{ color: '#f5f0e8' }}>South Asia Regional<br className="hidden md:block" /> Manufacturing Summit - 2026</span>
              </h1>
              <h2 className="font-display text-2xl sm:text-3xl md:text-5xl italic font-semibold gold-text glow-gold animate-fadeIn px-4">
                Executive Feedback Portal
              </h2>
            </div>

            <div className="gold-divider max-w-xs mx-auto animate-fadeIn" />

            <p className="text-lg max-w-xl mx-auto leading-relaxed font-light animate-fadeIn" style={{ color: 'rgba(184,176,160,0.8)' }}>
              Your time is valuable. We have streamlined our feedback process to ensure sharing your insights is effortless and takes under 60 seconds.
            </p>

            <div className="animate-fadeUp">
              <button
                onClick={() => handleNext(false)}
                className="btn-gold px-10 py-4 rounded-full text-base tracking-widest uppercase flex items-center gap-3 mx-auto"
              >
                Begin Feedback
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                </svg>
              </button>
            </div>
          </div>
        );

      // ── Guest Information ────────────────────────────────────────────────
      case 1:
        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="rounded-xl p-6 bg-gradient-to-r from-gold/15 to-midnight-900/60 border border-gold/20 flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <span className="text-4xl">🪪</span>
                <div>
                  <span className="section-badge mb-2 inline-flex">Step 1 of 2</span>
                  <h2 className="font-display text-3xl font-semibold text-champagne">Guest Details</h2>
                </div>
              </div>
              <button
                onClick={() => handleNext(true)}
                className="btn-outline-gold px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap tracking-wide"
              >
                Skip & Remain Anonymous
              </button>
            </div>

            <div className="space-y-6">
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-widest uppercase text-silver/70">
                  Full Name <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  className="luxury-input"
                  value={guestInfo.name}
                  onChange={(e) => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  placeholder="e.g. Ahmad bin Razak"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-widest uppercase text-silver/70">
                  Country <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  className="luxury-input"
                  value={guestInfo.country}
                  onChange={(e) => setGuestInfo({ ...guestInfo, country: e.target.value })}
                  placeholder="e.g. Malaysia"
                />
              </div>

              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-widest uppercase text-silver/70">
                  Designation / Title <span className="text-gold">*</span>
                </label>
                <input
                  type="text"
                  className="luxury-input"
                  value={guestInfo.designation}
                  onChange={(e) => setGuestInfo({ ...guestInfo, designation: e.target.value })}
                  placeholder="e.g. Country Head"
                />
              </div>
            </div>
          </div>
        );

      // ── Single Scroll Ratings ──────────────────────────────────────────────────
      case 2: {
        const sections = [
          { key: 'registrationReception', aspects: REGISTRATION_ASPECTS },
          { key: 'accommodation', aspects: ACCOMMODATION_ASPECTS },
          { key: 'galaDinner', aspects: GALA_DINNER_ASPECTS },
          { key: 'culturalProgram', aspects: CULTURAL_PROGRAM_ASPECTS },
          { key: 'eventManagement', aspects: EVENT_MANAGEMENT_ASPECTS },
          { key: 'factoryVisit', aspects: FACTORY_VISIT_ASPECTS },
          { key: 'venue', aspects: VENUE_ASPECTS },
          { key: 'transportation', aspects: TRANSPORTATION_ASPECTS },
          { key: 'HouseKeeping', aspects: HOUSEKEEPING_ASPECTS },
          { key: 'Food', aspects: FOOD_ASPECTS },
        ];

        return (
          <div className="space-y-8 animate-fadeIn">
            <div className="rounded-xl p-6 bg-gradient-to-r from-gold/15 to-midnight-900/60 border border-gold/20 sticky top-4 z-10 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <span className="text-4xl">✨</span>
                <div>
                  <span className="section-badge mb-1 inline-flex">Step 2 of 2</span>
                  <h2 className="font-display text-2xl font-semibold text-champagne leading-tight">Executive Ratings</h2>
                </div>
              </div>
            </div>

            <p className="text-sm text-silver/80 italic text-center mb-4">
              Tap a star to rate. The page will auto-scroll to the next section.
            </p>

            {/* Dynamic Event Categories */}
            {sections.map((section, index) => {
              const meta = sectionMeta[section.key];
              return (
                <div
                  key={section.key}
                  ref={el => { sectionRefs.current[index] = el; }}
                  className={`rating-card flex flex-col md:flex-row md:items-center justify-between gap-5 opacity-0 animate-fadeIn`}
                  style={{ animationDelay: `${index * 0.05}s`, animationFillMode: 'forwards' }}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl">{meta.icon}</span>
                    <span className="text-base font-semibold text-champagne">{meta.label}</span>
                  </div>
                  {/* Since aspects only has one item now ('Overall Experience') */}
                  <RatingStars
                    value={ratings[section.key]?.[section.aspects[0]] || 0}
                    onChange={(val) => handleRatingChange(section.key, section.aspects[0], val, index)}
                  />
                </div>
              );
            })}

            {/* Overall Experience & Final Thoughts */}
            <div
              ref={el => { sectionRefs.current[8] = el; }}
              className="mt-12 pt-8 border-t border-gold/20 space-y-8 opacity-0 animate-fadeIn"
              style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}
            >
              <h3 className="font-display text-3xl font-semibold text-champagne text-center mb-6">Final Thoughts</h3>

              <div className="luxury-card p-6 flex flex-col md:flex-row items-center justify-between gap-6 border-gold/40">
                <div className="text-center md:text-left">
                  <p className="text-lg font-bold text-champagne">
                    Your <span className="text-gold">Overall Experience</span> <span className="text-gold">*</span>
                  </p>
                  <p className="text-xs text-silver/60 mt-1">How was the Summit overall?</p>
                </div>
                <RatingStars large value={overallExperience} onChange={(val) => {
                  setOverallExperience(val);
                  setTimeout(() => {
                    sectionRefs.current[9]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  }, 400);
                }} />
              </div>

              <div ref={el => { sectionRefs.current[9] = el; }} className="rating-card space-y-4">
                <p className="text-base font-semibold text-champagne/90 text-center">Would you recommend this event to peers?</p>
                <div className="flex gap-3 max-w-sm mx-auto">
                  <button
                    type="button"
                    onClick={() => setRecommendToOthers(true)}
                    className={`flex-1 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all border ${recommendToOthers
                      ? 'bg-gold/15 border-gold/60 text-gold shadow-gold'
                      : 'border-midnight-700 text-silver/60 hover:border-midnight-600 bg-midnight-900/40'
                      }`}
                  >
                    ✓ Yes, Absolutely
                  </button>
                  <button
                    type="button"
                    onClick={() => setRecommendToOthers(false)}
                    className={`flex-1 py-3.5 rounded-xl font-semibold text-sm tracking-wide transition-all border ${!recommendToOthers
                      ? 'bg-gold/15 border-gold/60 text-gold shadow-gold'
                      : 'border-midnight-700 text-silver/60 hover:border-midnight-600 bg-midnight-900/40'
                      }`}
                  >
                    Not This Time
                  </button>
                </div>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-semibold tracking-widest uppercase text-silver/70 text-center">
                  Additional Comments (Optional)
                </label>
                <textarea
                  className="luxury-input resize-none h-32"
                  value={suggestions}
                  onChange={(e) => setSuggestions(e.target.value)}
                  placeholder="Share any final thoughts..."
                />
              </div>
            </div>
          </div>
        );
      }
      default:
        return null;
    }
  };

  return (
    <div className="aurora-bg min-h-full">
      <div className="min-h-screen py-10 px-4 md:px-8 w-full flex items-center justify-center">
        <div className="max-w-3xl w-full mx-auto space-y-6">


          {step > 0 && <StepIndicator currentStep={step} />}

          <div className="luxury-card p-6 md:p-10 relative overflow-hidden shadow-luxury">
            <div
              className="pointer-events-none absolute -top-20 -right-20 w-60 h-60 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.07) 0%, transparent 70%)' }}
            />

            {error && (
              <div className="mb-6 p-4 rounded-xl border border-red-500/40 bg-red-900/20 text-red-300 text-sm flex items-center gap-3 animate-shake">
                <svg className="w-4 h-4 flex-shrink-0 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126z" />
                </svg>
                {error}
              </div>
            )}

            {renderStep()}

            {step > 0 && (
              <div className="mt-10 pt-6 border-t border-gold/10 flex justify-between items-center">
                <button
                  onClick={handleBack}
                  className="btn-outline-gold px-6 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back
                </button>

                {step < 2 ? (
                  <button
                    onClick={() => handleNext(false)}
                    className="btn-gold px-8 py-2.5 rounded-xl text-sm tracking-wide flex items-center gap-2"
                  >
                    Continue
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" />
                    </svg>
                  </button>
                ) : (
                  <button
                    onClick={handleSubmit}
                    disabled={isSubmitting}
                    className="btn-gold px-10 py-3 rounded-xl text-sm tracking-widest uppercase flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z" />
                        </svg>
                        Submitting...
                      </>
                    ) : (
                      <>
                        Submit Feedback
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      </>
                    )}
                  </button>
                )}
              </div>
            )}
          </div>
          <p className="text-center text-xs text-silver/60 font-medium tracking-wider pb-6">
            © 2026 DXN International · Confidential Feedback Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
