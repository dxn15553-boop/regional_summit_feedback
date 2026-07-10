import React, { useState, useRef } from 'react';
import { dbService } from '../services/db';
import { GuestInfo, FeedbackData } from '../types';
import {
  OVERALL_SUMMIT_ASPECTS,
  TECHNICAL_SESSIONS_ASPECTS,
  FACTORY_VISIT_ASPECTS,
  HOSPITALITY_ASPECTS,
  TRANSPORTATION_ASPECTS,
  FOOD_ASPECTS,
  EVENT_ADMIN_ASPECTS,
} from '../constants';

// ── Section metadata ──────────────────────────────────────────────────────────
const sectionMeta: Record<string, { icon: string; label: string; }> = {
  overallSummitExperience: {
    icon: '🌐',
    label: '1. Overall Summit Experience'
  },
  technicalSessions: {
    icon: '🏭',
    label: '2. Technical Sessions & Presentations'
  },
  factoryVisits: {
    icon: '🌿',
    label: '3. Siddipet Factory Visits & Manufacturing Excellence'
  },
  hospitality: {
    icon: '🏨',
    label: '4. Hospitality & Accommodation'
  },
  transportation: {
    icon: '🚌',
    label: '5. Transportation & Logistics'
  },
  foodRefreshments: {
    icon: '🍛',
    label: '6. Food & Refreshments'
  },
  eventAdministration: {
    icon: '📋',
    label: '7. Event Administration & Communication'
  },
};

const STAR_LABELS = ['', 'Poor', 'Fair', 'Satisfactory', 'Very Good', 'Excellent'];

// ── Rating Stars ─────────────────────────────────────────────────────────────
const RatingStars: React.FC<{
  value: number;
  onChange: (val: number) => void;
  large?: boolean;
}> = ({ value, onChange, large }) => {
  const [hover, setHover] = useState(0);
  const active = hover || value;

  return (
    <div className="flex flex-col items-center sm:items-end gap-1">
      <div className="flex gap-1.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => onChange(star)}
            onMouseEnter={() => setHover(star)}
            onMouseLeave={() => setHover(0)}
            className={`transition-all duration-200 focus:outline-none ${large ? 'p-1.5' : 'p-1'
              } ${active >= star ? 'text-gold scale-110' : 'text-white/30 hover:text-gold/60 hover:scale-105'}`}
            style={{ filter: active >= star ? 'drop-shadow(0 0 8px rgba(212,175,55,0.8))' : 'none' }}
          >
            <svg
              className={large ? 'w-10 h-10' : 'w-7 h-7'}
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
          <span className="text-[10px] font-bold tracking-widest uppercase text-gold/90 animate-fadeIn">
            {STAR_LABELS[active]}
          </span>
        )}
      </div>
    </div>
  );
};

// ── Step Indicator ────────────────────────────────────────────────────────────
const StepIndicator: React.FC<{ currentStep: number; totalSteps: number }> = ({ currentStep, totalSteps }) => {
  const labels = ['Welcome', 'Delegate Info', 'Core Evaluation', 'Qualitative Feedback'];
  const progress = Math.round((currentStep / totalSteps) * 100);

  return (
    <div className="w-full space-y-3">
      <div className="relative h-1.5 w-full rounded-full overflow-hidden" style={{ background: 'rgba(40,40,40,0.70)' }}>
        <div
          className="absolute left-0 top-0 h-full rounded-full transition-all duration-700 ease-out progress-bar-fill"
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="flex items-center justify-end">
        <span className="text-xs text-silver/60 font-medium tracking-wide">{labels[currentStep]}</span>
      </div>
    </div>
  );
};

// ── Success Screen ────────────────────────────────────────────────────────────
const SuccessScreen: React.FC<{ guestName: string }> = ({ guestName }) => (
  <div className="aurora-bg min-h-screen flex flex-col items-center justify-center p-6">
    <div className="luxury-card max-w-lg w-full p-10 text-center space-y-6 animate-fadeIn relative overflow-hidden shadow-luxury">
      <div className="absolute inset-0 pointer-events-none">
        <div
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 rounded-full"
          style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.08) 0%, rgba(29,78,216,0.05) 50%, transparent 70%)' }}
        />
      </div>

      <div className="relative mx-auto w-24 h-24 flex items-center justify-center">
        <div
          className="absolute inset-0 rounded-full animate-ripple"
          style={{ background: 'rgba(212,175,55,0.15)', animationDelay: '0.2s' }}
        />
        <div className="w-20 h-20 rounded-full flex items-center justify-center border border-gold/30"
          style={{ background: 'linear-gradient(135deg, rgba(29,78,216,0.15), rgba(212,175,55,0.10))' }}>
          <svg className="w-10 h-10 text-gold" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
          </svg>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="section-badge text-xs tracking-widest">DXN SOUTH ASIA REGIONAL MANUFACTURING SUMMIT 2026</div>
      </div>

      <h1 className="font-display text-5xl font-bold gold-text glow-gold leading-tight">Thank You!</h1>

      {guestName && (
        <p className="font-display text-2xl text-champagne/80 italic">Dear {guestName},</p>
      )}

      <p className="text-sm text-silver/70 leading-relaxed max-w-sm mx-auto">
        Thank you for taking the time to complete this evaluation Your feedback is instrumental in maintaining DXN's manufacturing excellence and operational standard.
      </p>

      <div className="gold-divider my-4" />
      <p className="text-xs tracking-widest uppercase text-silver/40 font-medium">
        One World · One Market · One Mind
      </p>

      <button
        onClick={() => window.location.reload()}
        className="btn-outline-gold px-5 py-2.5 sm:px-8 sm:py-3 rounded-xl font-semibold text-xs sm:text-sm tracking-wide"
      >
        Submit Another Response
      </button>
    </div>
  </div>
);

// ── Aspect Rating Row ─────────────────────────────────────────────────────────
const AspectRow: React.FC<{
  aspect: string;
  value: number;
  onChange: (val: number) => void;
  index: number;
}> = ({ aspect, value, onChange, index }) => (
  <div
    className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 py-4 border-b border-white/5 last:border-0 opacity-0 animate-fadeIn"
    style={{ animationDelay: `${index * 0.04}s`, animationFillMode: 'forwards' }}
  >
    <p className="text-sm text-silver/90 leading-snug flex-1 pr-4">{aspect}</p>
    <RatingStars value={value} onChange={onChange} />
  </div>
);

// ── Main Form ─────────────────────────────────────────────────────────────────
const FeedbackForm: React.FC = () => {
  const TOTAL_STEPS = 3;
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState('');

  // Section A — Delegate Info
  const [guestInfo, setGuestInfo] = useState<GuestInfo>({
    name: '', designation: '', country: '', email: '',
  });

  // Section B — Ratings per category, per aspect
  const [ratings, setRatings] = useState<Record<string, Record<string, number>>>({
    overallSummitExperience: {},
    technicalSessions: {},
    factoryVisits: {},
    hospitality: {},
    transportation: {},
    foodRefreshments: {},
    eventAdministration: {},
  });

  // Overall
  const [overallExperience, setOverallExperience] = useState<number>(0);
  const [recommendToOthers, setRecommendToOthers] = useState(true);

  // Section C — Qualitative
  const [mostValuableAspect, setMostValuableAspect] = useState('');
  const [mostImpactfulSession, setMostImpactfulSession] = useState('');
  const [suggestionsForImprovement, setSuggestionsForImprovement] = useState('');
  const [futureTopics, setFutureTopics] = useState('');

  const sectionRefs = useRef<(HTMLDivElement | null)[]>([]);

  const handleRatingChange = (categoryKey: string, aspect: string, val: number) => {
    setRatings(prev => ({
      ...prev,
      [categoryKey]: { ...prev[categoryKey], [aspect]: val },
    }));
  };

  const handleNext = (skipDetails = false) => {
    if (step === 1 && !skipDetails) {
      if (!guestInfo.name.trim() || !guestInfo.country.trim() || !guestInfo.designation.trim()) {
        setError('Please fill in Name, Designation, and Country — or click "Skip & Remain Anonymous".');
        return;
      }
    }
    if (skipDetails) {
      setGuestInfo({ name: 'Anonymous Delegate', designation: 'Attendee', country: 'Not specified', email: '' });
    }
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => Math.min(s + 1, TOTAL_STEPS));
  };

  const handleBack = () => {
    setError('');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    setStep(s => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    if (overallExperience === 0) {
      setError('Please rate your Overall Experience before submitting.');
      return;
    }

    setIsSubmitting(true);
    setError('');

    const feedback: FeedbackData = {
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      guestInfo,
      overallSummitExperience: ratings.overallSummitExperience,
      technicalSessions: ratings.technicalSessions,
      factoryVisits: ratings.factoryVisits,
      hospitality: ratings.hospitality,
      transportation: ratings.transportation,
      foodRefreshments: ratings.foodRefreshments,
      eventAdministration: ratings.eventAdministration,
      overallExperience,
      recommendToOthers,
      mostValuableAspect,
      mostImpactfulSession,
      suggestionsForImprovement,
      futureTopics,
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
    return <SuccessScreen guestName={guestInfo.name === 'Anonymous Delegate' ? '' : guestInfo.name} />;
  }

  // ── Section B data ──────────────────────────────────────────────────────────
  const sections = [
    { key: 'overallSummitExperience', aspects: OVERALL_SUMMIT_ASPECTS },
    { key: 'technicalSessions', aspects: TECHNICAL_SESSIONS_ASPECTS },
    { key: 'factoryVisits', aspects: FACTORY_VISIT_ASPECTS },
    { key: 'hospitality', aspects: HOSPITALITY_ASPECTS },
    { key: 'transportation', aspects: TRANSPORTATION_ASPECTS },
    { key: 'foodRefreshments', aspects: FOOD_ASPECTS },
    { key: 'eventAdministration', aspects: EVENT_ADMIN_ASPECTS },
  ];

  const renderStep = () => {
    switch (step) {

      // ── Step 0: Welcome / Delegate Communication ──────────────────────────
      case 0:
        return (
          <div className="space-y-6 animate-fadeIn text-left text-champagne/90 leading-relaxed font-light">
            <div className="text-center space-y-3 mb-6">

              <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold gold-text glow-gold animate-fadeUp">
                Delegate Communication
              </h1>
              <h2 className="font-display text-lg sm:text-xl italic font-semibold text-champagne/80 animate-fadeIn">
                Your Feedback Matters &ndash; DXN South Asia Regional Manufacturing Summit 2026
              </h2>
            </div>

            <div className="space-y-5 text-sm sm:text-base">
              <p>Dear Delegates,</p>
              <p>
                Thank you for being a valued participant in the DXN South Asia Regional Manufacturing Summit 2026.
                We sincerely appreciate your presence, active participation, and valuable contributions to the success
                of this landmark regional event at our Siddipet flagship facility.
              </p>
              <p>
                To help us continuously improve future manufacturing summits, organic Ganoderma cultivation showcases,
                and regional biotechnology collaborations, we kindly request you to take 3&ndash;5 minutes to complete
                our comprehensive feedback form.
              </p>

              <div className="text-center py-5 animate-fadeUp">
                <button
                  onClick={() => handleNext(false)}
                  className="btn-gold px-4 py-2 sm:px-8 sm:py-3 rounded-full text-xs sm:text-base tracking-wide font-semibold inline-flex items-center gap-2 hover:scale-105 transition-transform shadow-luxury"
                >
                  <span className="text-xl">👉</span> Click Here to Complete the Feedback Form
                </button>
              </div>

              <p>Your insights will play a critical role in evaluating:</p>
              <ul className="list-disc pl-6 space-y-2 text-silver/90">
                <li><strong className="text-champagne">Overall Summit Experience &amp; Strategic Alignment</strong></li>
                <li><strong className="text-champagne">Technical Sessions, Presentation Quality &amp; Operational Insights</strong></li>
                <li><strong className="text-champagne">Factory Visits &amp; Manufacturing Excellence Showcases</strong></li>
                <li><strong className="text-champagne">Hospitality, Accommodation &amp; Venue Standard</strong></li>
                <li><strong className="text-champagne">Transportation, Security &amp; Logistics Precision</strong></li>
                <li><strong className="text-champagne">Event Coordination &amp; Administrative Flow</strong></li>
                <li><strong className="text-champagne">Catering, Food &amp; Refreshments</strong> (including our specialized Kombucha and probiotic wellness lines)</li>
                <li><strong className="text-champagne">Pre-event Communication &amp; Registration Compliance</strong></li>
                <li><strong className="text-champagne">Strategic Suggestions for Future Regional Manufacturing Summits</strong></li>
              </ul>

              <p className="pt-4">
                Your professional opinions and recommendations are highly valued and will play an important role in
                enhancing future DXN regional manufacturing events and sustaining our global quality standards.
              </p>
              <p>Thank you once again for your participation and continued support.</p>

              <p className="font-bold text-gold text-center text-lg sm:text-xl my-6 tracking-widest uppercase">
                One World &bull; One Market &bull; One Mind
              </p>

              <div className="space-y-1 border-t border-white/8 pt-4">
                <p>Warm Regards,</p>
                <p><strong className="text-champagne">Organising Committee</strong> DXN South Asia Regional Manufacturing Summit 2026</p>
                <p>DXN Manufacturing India Private Limited Siddipet, Telangana, India</p>
                <p className="italic text-silver/60 pt-1">
                  Contact: <a href="mailto:ts_info@dxn2u.co.in" className="hover:text-gold transition-colors">ts_info@dxn2u.co.in</a>
                </p>
              </div>
            </div>
          </div>
        );

      // ── Step 1: Section A — Delegate Information ──────────────────────────
      case 1:
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="rounded-xl p-5 flex flex-col md:flex-row md:items-center justify-between gap-4"
              style={{ background: 'linear-gradient(135deg, rgba(212,175,55,0.12), rgba(5,150,105,0.08))', border: '1px solid rgba(212,175,55,0.22)' }}>
              <div className="flex items-center gap-4">
                <span className="text-4xl">🪪</span>
                <div>
                  <h2 className="font-display text-2xl font-semibold text-champagne">Delegate Information</h2>
                  <p className="text-xs text-silver/60 mt-0.5">Optional &amp; Confidential</p>
                </div>
              </div>
              <button
                onClick={() => handleNext(true)}
                className="btn-outline-gold px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap tracking-wide"
              >
                Skip &amp; Remain Anonymous
              </button>
            </div>

            <p className="text-xs text-silver/50 italic -mt-4">
              * All fields are optional. Your identity will be kept strictly confidential and used only for corporate quality management.
            </p>

            <div className="space-y-5">
              {/* Name */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-widest uppercase text-silver/70">
                  Full Name
                </label>
                <input type="text" className="luxury-input" value={guestInfo.name}
                  onChange={e => setGuestInfo({ ...guestInfo, name: e.target.value })}
                  placeholder="e.g. Ahmad bin Razak" />
              </div>

              {/* Designation */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-widest uppercase text-silver/70">
                  Designation / Role
                </label>
                <input type="text" className="luxury-input" value={guestInfo.designation}
                  onChange={e => setGuestInfo({ ...guestInfo, designation: e.target.value })}
                  placeholder="e.g. Country Head / Regional Manager" />
              </div>

              {/* Country */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-widest uppercase text-silver/70">
                  Country / Region Represented
                </label>
                <input type="text" className="luxury-input" value={guestInfo.country}
                  onChange={e => setGuestInfo({ ...guestInfo, country: e.target.value })}
                  placeholder="e.g. Malaysia" />
              </div>

              {/* Email */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold tracking-widest uppercase text-silver/70">
                  Email Address
                </label>
                <input type="email" className="luxury-input" value={guestInfo.email}
                  onChange={e => setGuestInfo({ ...guestInfo, email: e.target.value })}
                  placeholder="e.g. delegate@example.com" />
              </div>
            </div>
          </div>
        );

      // ── Step 2: Section B — Core Evaluation ──────────────────────────────
      case 2:
        return (
          <div className="space-y-6 animate-fadeIn">
            {/* Sticky header */}
            <div className="rounded-xl p-5 sticky top-4 z-10 backdrop-blur-md flex items-center gap-4"
              style={{ background: 'rgba(22,22,22,0.92)', border: '1px solid rgba(212,175,55,0.22)' }}>
              <span className="text-3xl">⭐</span>
              <div>
                <h2 className="font-display text-xl font-semibold text-champagne">Core Evaluation Categories</h2>
                <p className="text-xs text-silver/55 mt-0.5">Rate each aspect on a scale of 1 (Poor) to 5 (Excellent)</p>
              </div>
            </div>

            {/* Category cards */}
            {sections.map((section, sIdx) => {
              const meta = sectionMeta[section.key];
              return (
                <div
                  key={section.key}
                  ref={el => { sectionRefs.current[sIdx] = el; }}
                  className="luxury-card p-5 opacity-0 animate-fadeIn"
                  style={{ animationDelay: `${sIdx * 0.06}s`, animationFillMode: 'forwards' }}
                >
                  {/* Category header */}
                  <div className="flex items-start gap-3 mb-4 pb-3 border-b border-white/8">
                    <span className="text-2xl">{meta.icon}</span>
                    <div>
                      <h3 className="text-base font-bold text-champagne leading-tight">{meta.label}</h3>
                    </div>
                  </div>

                  {/* Aspect rows */}
                  {section.aspects.map((aspect, aIdx) => (
                    <AspectRow
                      key={aspect}
                      aspect={aspect}
                      value={ratings[section.key]?.[aspect] || 0}
                      onChange={val => handleRatingChange(section.key, aspect, val)}
                      index={aIdx}
                    />
                  ))}
                </div>
              );
            })}

            {/* Overall Experience */}
            <div className="luxury-card p-6 text-center space-y-4 opacity-0 animate-fadeIn"
              style={{ animationDelay: '0.5s', animationFillMode: 'forwards' }}>
              <h3 className="font-display text-xl font-semibold text-champagne">
                Your <span className="gold-text">Overall Experience</span> <span className="text-gold">*</span>
              </h3>
              <p className="text-xs text-silver/55">How would you rate the Summit overall?</p>
              <div className="flex justify-center">
                <RatingStars large value={overallExperience} onChange={setOverallExperience} />
              </div>
            </div>

            {/* Recommend */}
            <div className="rating-card space-y-3">
              <p className="text-sm font-semibold text-champagne/90 text-center">
                Would you recommend this event to peers &amp; colleagues?
              </p>
              <div className="flex gap-3 max-w-sm mx-auto">
                <button type="button" onClick={() => setRecommendToOthers(true)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all border ${recommendToOthers
                    ? 'border-gold/60 text-gold bg-gold/12'
                    : 'border-white/10 text-silver/55 hover:border-white/20 bg-transparent'}`}>
                  ✓ Yes, Absolutely
                </button>
                <button type="button" onClick={() => setRecommendToOthers(false)}
                  className={`flex-1 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all border ${!recommendToOthers
                    ? 'border-gold/60 text-gold bg-gold/12'
                    : 'border-white/10 text-silver/55 hover:border-white/20 bg-transparent'}`}>
                  Not This Time
                </button>
              </div>
            </div>
          </div>
        );

      // ── Step 3: Section C — Qualitative Feedback ─────────────────────────
      case 3:
        return (
          <div className="space-y-8 animate-fadeIn">
            {/* Header */}
            <div className="rounded-xl p-5"
              style={{ background: 'linear-gradient(135deg, rgba(5,150,105,0.12), rgba(212,175,55,0.08))', border: '1px solid rgba(5,150,105,0.28)' }}>
              <div className="flex items-center gap-3">
                <span className="text-3xl">💬</span>
                <div>
                  <h2 className="font-display text-xl font-semibold text-champagne">Qualitative Feedback &amp; Future Directions</h2>
                  <p className="text-xs text-silver/55 mt-0.5">Your written insights help us shape future summits</p>
                </div>
              </div>
            </div>

            {/* Q1 */}
            <div className="space-y-3 opacity-0 animate-fadeIn" style={{ animationDelay: '0.05s', animationFillMode: 'forwards' }}>
              <label className="block text-sm font-semibold text-champagne">
                1. What was the most valuable aspect or key takeaway of this Manufacturing Summit for you?
              </label>
              <textarea
                className="luxury-input resize-none h-28"
                value={mostValuableAspect}
                onChange={e => setMostValuableAspect(e.target.value)}
                placeholder="Share your key takeaway..."
              />
            </div>

            {/* Q2 */}
            <div className="space-y-3 opacity-0 animate-fadeIn" style={{ animationDelay: '0.10s', animationFillMode: 'forwards' }}>
              <label className="block text-sm font-semibold text-champagne">
                2. Which technical session, presentation, or facility area did you find most impactful, and why?
              </label>
              <textarea
                className="luxury-input resize-none h-28"
                value={mostImpactfulSession}
                onChange={e => setMostImpactfulSession(e.target.value)}
                placeholder="Describe the session or area and why it stood out..."
              />
            </div>

            {/* Q3 */}
            <div className="space-y-3 opacity-0 animate-fadeIn" style={{ animationDelay: '0.15s', animationFillMode: 'forwards' }}>
              <label className="block text-sm font-semibold text-champagne">
                3. Please share any specific suggestions to improve operations, logistics, or content for future DXN Regional Manufacturing Summits:
              </label>
              <textarea
                className="luxury-input resize-none h-28"
                value={suggestionsForImprovement}
                onChange={e => setSuggestionsForImprovement(e.target.value)}
                placeholder="Your suggestions for improvement..."
              />
            </div>

            {/* Q4 */}
            <div className="space-y-3 opacity-0 animate-fadeIn" style={{ animationDelay: '0.20s', animationFillMode: 'forwards' }}>
              <label className="block text-sm font-semibold text-champagne">
                4. What specific topics, global certifications, or manufacturing innovations would you like to see featured in the next regional summit?
              </label>
              <textarea
                className="luxury-input resize-none h-28"
                value={futureTopics}
                onChange={e => setFutureTopics(e.target.value)}
                placeholder="Topics, certifications, or innovations you'd like to see..."
              />
            </div>

            {/* Administrative Note */}
            <div className="rounded-xl p-5 opacity-0 animate-fadeIn"
              style={{ animationDelay: '0.25s', animationFillMode: 'forwards', background: 'rgba(212,175,55,0.06)', border: '1px solid rgba(212,175,55,0.18)' }}>
              <p className="text-xs font-bold text-gold mb-2 tracking-widest uppercase">Administrative Note</p>
              <p className="text-xs text-silver/70 leading-relaxed">
                <strong className="text-silver/90">Submission Instructions:</strong> Please submit the completed digital form by clicking <strong className="text-champagne">Submit</strong>.
                All data collected is strictly utilised for corporate quality management and operational compliance refinement.
              </p>
              <p className="text-xs text-silver/55 mt-2 italic">Thank you for your dedication to our shared vision of manufacturing excellence.</p>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="aurora-bg min-h-full">
      <div className="min-h-screen py-10 px-4 md:px-8 w-full flex items-center justify-center">
        <div className="max-w-3xl w-full mx-auto space-y-6">

          {step > 0 && <StepIndicator currentStep={step} totalSteps={TOTAL_STEPS} />}

          <div className="luxury-card p-6 md:p-10 relative overflow-hidden shadow-luxury">
            <div
              className="pointer-events-none absolute -top-24 -right-24 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(212,175,55,0.09) 0%, rgba(5,150,105,0.05) 50%, transparent 70%)' }}
            />
            <div
              className="pointer-events-none absolute -bottom-24 -left-24 w-64 h-64 rounded-full"
              style={{ background: 'radial-gradient(circle, rgba(5,120,87,0.07) 0%, transparent 70%)' }}
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
              <div className="mt-10 pt-6 border-t border-white/8 flex justify-between items-center">
                <button
                  onClick={handleBack}
                  className="btn-outline-gold px-4 py-2 sm:px-6 sm:py-2.5 rounded-xl text-xs sm:text-sm font-semibold flex items-center gap-2"
                >
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M10.5 19.5L3 12m0 0l7.5-7.5M3 12h18" />
                  </svg>
                  Back
                </button>

                {step < TOTAL_STEPS ? (
                  <button
                    onClick={() => handleNext(false)}
                    className="btn-gold px-5 py-2 sm:px-8 sm:py-2.5 rounded-xl text-xs sm:text-sm tracking-wide flex items-center gap-2"
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
                    className="btn-gold px-4 py-2 sm:px-10 sm:py-3 rounded-xl text-[10px] sm:text-sm tracking-widest uppercase flex items-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
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

          <p className="text-center text-xs text-silver/50 font-medium tracking-wider pb-6">
            © 2026 DXN International · Confidential Feedback Portal
          </p>
        </div>
      </div>
    </div>
  );
};

export default FeedbackForm;
