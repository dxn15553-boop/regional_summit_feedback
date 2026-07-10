import React, { useState, useEffect, useMemo, useRef } from 'react';
import { dbService } from '../services/db';
import { aiService } from '../services/ai';
import { FeedbackData, UserRole } from '../types';
import { Icons } from '../constants';
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer,
  LineChart, Line
} from 'recharts';

// --- Subcomponents for clean UI ---

const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; color: string; icon: React.ReactNode }> = ({ title, value, subtitle, color, icon }) => (
  <div className="luxury-card p-6 flex flex-col gap-3">
    <div className="flex items-center justify-between">
      <h4 className="text-xs font-bold tracking-widest uppercase" style={{ color: 'rgba(184,176,160,0.85)' }}>{title}</h4>
      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.15)' }}>
        {icon}
      </div>
    </div>
    <div className={`text-3xl font-bold tracking-tight ${color}`}>{value}</div>
    {subtitle && <p className="text-xs font-medium" style={{ color: 'rgba(184,176,160,0.7)' }}>{subtitle}</p>}
  </div>
);

const RatingBadge: React.FC<{ rating: number }> = ({ rating }) => {
  if (!rating) return <span className="italic text-xs" style={{ color: 'rgba(184,176,160,0.4)' }}>N/A</span>;
  let color = 'bg-midnight-800/60 border-midnight-700';
  let textColor = 'rgba(184,176,160,0.85)';
  if (rating >= 4) { color = 'bg-emerald-900/30 border-emerald-700/50'; textColor = '#34d399'; }
  else if (rating === 3) { color = 'bg-gold/10 border-gold/30'; textColor = '#d4af37'; }
  else { color = 'bg-red-900/30 border-red-700/50'; textColor = '#f87171'; }

  return (
    <span className={`px-2 py-0.5 rounded text-[12px] font-bold border ${color}`} style={{ color: textColor }}>
      {rating} / 5
    </span>
  );
};

// DetailSection removed as it is no longer needed for single-rating categories.
interface FeedbackModalProps {
  feedback: FeedbackData;
  onClose: () => void;
  isAdmin: boolean;
  onToggleReview: (id: string) => void;
}

const FeedbackModal: React.FC<FeedbackModalProps> = ({ feedback, onClose, isAdmin, onToggleReview }) => {
  const contentRef = useRef<HTMLDivElement>(null);

  const handlePrint = () => {
    if (contentRef.current) {
      const printContents = contentRef.current.innerHTML;
      const originalContents = document.body.innerHTML;
      document.body.innerHTML = printContents;
      window.print();
      document.body.innerHTML = originalContents;
      window.location.reload();
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-fadeIn" style={{ background: 'rgba(6,9,21,0.85)', backdropFilter: 'blur(12px)' }}>
      <div className="luxury-card w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col relative z-10">

        {/* Modal Header */}
        <div className="p-6 flex items-center justify-between flex-shrink-0" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)', background: 'linear-gradient(135deg, rgba(17,29,68,0.95), rgba(13,21,38,0.98))' }}>
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0" style={{ background: 'rgba(212,175,55,0.1)', border: '1px solid rgba(212,175,55,0.25)' }}>
              <Icons.Star className="w-5 h-5" style={{ color: '#d4af37' } as React.CSSProperties} />
            </div>
            <div>
              <h3 className="font-display text-xl font-bold text-champagne">Feedback Details</h3>
              <p className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(184,176,160,0.7)' }}>Submitted: {new Date(feedback.timestamp).toLocaleString()}</p>
            </div>
            {feedback.isReviewed && (
              <span className="ml-2 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1" style={{ background: 'rgba(16,185,129,0.12)', border: '1px solid rgba(16,185,129,0.35)', color: '#34d399' }}>
                <Icons.Check className="w-3 h-3" /> Reviewed
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} title="Print" className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ color: 'rgba(212,175,55,0.5)', border: '1px solid rgba(212,175,55,0.12)', background: 'rgba(212,175,55,0.04)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.1)'; (e.currentTarget as HTMLElement).style.color = '#d4af37'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(212,175,55,0.5)'; }}
            >
              <Icons.Printer className="w-4 h-4" />
            </button>
            <button onClick={onClose} className="w-9 h-9 rounded-xl flex items-center justify-center transition-all" style={{ color: 'rgba(239,68,68,0.5)', border: '1px solid rgba(239,68,68,0.12)', background: 'rgba(239,68,68,0.04)' }}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.1)'; (e.currentTarget as HTMLElement).style.color = 'rgb(239,68,68)'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.background = 'rgba(239,68,68,0.04)'; (e.currentTarget as HTMLElement).style.color = 'rgba(239,68,68,0.5)'; }}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
        </div>

        {/* Modal Body */}
        <div className="flex-1 overflow-y-auto p-6 md:p-8 space-y-6" ref={contentRef} style={{ background: '#060915' }}>

          {/* Guest Info + Overall */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-1 rounded-2xl p-5 space-y-4" style={{ background: 'rgba(17,29,68,0.6)', border: '1px solid rgba(212,175,55,0.12)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest gold-text flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#d4af37' }} />
                Guest Information
              </h4>
              <div className="space-y-3">
                {[['Name', feedback.guestInfo.name], ['Country', feedback.guestInfo.country], ['Designation', feedback.guestInfo.designation]].map(([label, val]) => (
                  <div key={label} className="flex justify-between items-center text-sm" style={{ borderBottom: '1px solid rgba(212,175,55,0.07)', paddingBottom: '0.5rem' }}>
                    <span className="font-medium" style={{ color: 'rgba(184,176,160,0.8)' }}>{label}</span>
                    <span className="font-semibold text-champagne">{val}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2">
                <p className="text-xs font-bold uppercase tracking-widest mb-3" style={{ color: 'rgba(184,176,160,0.8)' }}>Overall Experience</p>
                <div className="flex items-center gap-2 flex-wrap">
                  <RatingBadge rating={feedback.overallExperience} />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-md border ${feedback.recommendToOthers
                    ? 'bg-emerald-900/20 text-emerald-400 border-emerald-800/60'
                    : 'bg-red-900/20 text-red-400 border-red-800/60'
                    }`}>
                    {feedback.recommendToOthers ? '✓ Recommends' : '✗ Not Recommended'}
                  </span>
                </div>
              </div>
            </div>

            {/* Event Ratings */}
            <div className="lg:col-span-2 rounded-2xl p-5" style={{ background: 'rgba(17,29,68,0.6)', border: '1px solid rgba(212,175,55,0.12)' }}>
              <h4 className="text-xs font-bold uppercase tracking-widest gold-text flex items-center gap-2 mb-4">
                <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#d4af37' }} />
                Event Ratings
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-2">
                {[
                  { label: 'Overall Summit', emoji: '🌐', data: feedback.overallSummitExperience },
                  { label: 'Technical Sessions', emoji: '🏭', data: feedback.technicalSessions },
                  { label: 'Factory Visits', emoji: '🌿', data: feedback.factoryVisits },
                  { label: 'Hospitality', emoji: '🏨', data: feedback.hospitality },
                  { label: 'Transportation', emoji: '🚌', data: feedback.transportation },
                  { label: 'Food & Refreshments', emoji: '🍛', data: feedback.foodRefreshments },
                  { label: 'Event Administration', emoji: '📋', data: feedback.eventAdministration }
                ].map(cat => {
                  const ratings = cat.data ? Object.values(cat.data) : [];
                  const sum = ratings.reduce((a, b) => a + b, 0);
                  const rating = ratings.length > 0 ? Math.round(sum / ratings.length) : 0;
                  return (
                    <div key={cat.label} className="flex items-center justify-between py-2" style={{ borderBottom: '1px solid rgba(212,175,55,0.07)' }}>
                      <span className="text-sm flex items-center gap-2 font-medium" style={{ color: 'rgba(184,176,160,0.9)' }}>
                        <span>{cat.emoji}</span>{cat.label}
                      </span>
                      <RatingBadge rating={rating} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Qualitative Feedback */}
          <div className="rounded-2xl p-5 space-y-4" style={{ background: 'rgba(17,29,68,0.6)', border: '1px solid rgba(212,175,55,0.12)' }}>
            <h4 className="text-xs font-bold uppercase tracking-widest gold-text flex items-center gap-2 mb-3">
              <span className="w-1.5 h-1.5 rounded-full" style={{ background: '#d4af37' }} />
              Qualitative Feedback
            </h4>
            
            <div className="space-y-4">
              {[
                { q: 'Most Valuable Aspect', a: feedback.mostValuableAspect },
                { q: 'Most Impactful Session', a: feedback.mostImpactfulSession },
                { q: 'Suggestions for Improvement', a: feedback.suggestionsForImprovement },
                { q: 'Future Topics/Innovations', a: feedback.futureTopics }
              ].map(item => (
                <div key={item.q}>
                  <p className="text-xs font-bold text-champagne mb-1">{item.q}</p>
                  <p className="text-sm italic leading-relaxed" style={{ color: 'rgba(184,176,160,0.7)', background: 'rgba(6,9,21,0.5)', padding: '0.75rem 1rem', borderRadius: '0.75rem', border: '1px solid rgba(212,175,55,0.08)' }}>
                    {item.a || 'No response provided.'}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-5 flex-shrink-0 flex justify-between items-center" style={{ borderTop: '1px solid rgba(212,175,55,0.1)', background: 'linear-gradient(135deg, rgba(13,21,38,0.95), rgba(6,9,21,0.98))' }}>
          {isAdmin ? (
            <button
              onClick={() => onToggleReview(feedback.id)}
              className="px-5 py-2 rounded-xl font-semibold text-sm flex items-center gap-2 transition-all"
              style={feedback.isReviewed
                ? { background: 'rgba(17,29,68,0.8)', border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(184,176,160,0.6)' }
                : { background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' }
              }
            >
              <Icons.Check className="w-4 h-4" />
              {feedback.isReviewed ? 'Mark as Unreviewed' : 'Mark as Reviewed'}
            </button>
          ) : <div />}
          <button
            onClick={onClose}
            className="btn-outline-gold px-6 py-2 rounded-xl font-semibold text-sm"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

interface AdminDashboardProps {
  role: UserRole;
  onLogout: () => void;
}

const AdminDashboard: React.FC<AdminDashboardProps> = ({ role, onLogout }) => {
  const [feedbacks, setFeedbacks] = useState<FeedbackData[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [reviewFilter, setReviewFilter] = useState<'all' | 'reviewed' | 'unreviewed'>('all');
  const [selectedFeedback, setSelectedFeedback] = useState<FeedbackData | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const data = await dbService.getAllFeedback();
    setFeedbacks(data);
  };

  const handleToggleReview = async (id: string) => {
    if (role !== 'Admin') return;
    const target = feedbacks.find(f => f.id === id);
    if (target) {
      const updated = { ...target, isReviewed: !target.isReviewed };
      await dbService.updateFeedback(updated);
      setFeedbacks(prev => prev.map(f => f.id === id ? updated : f));
      if (selectedFeedback?.id === id) setSelectedFeedback(updated);
    }
  };

  const filteredData = useMemo(() => {
    return feedbacks.filter(f => {
      const q = searchQuery.toLowerCase();
      const matchSearch = q === '' ||
        f.guestInfo.name.toLowerCase().includes(q) ||
        f.guestInfo.country.toLowerCase().includes(q) ||
        f.guestInfo.designation.toLowerCase().includes(q);
      const matchReview = reviewFilter === 'all' || (reviewFilter === 'reviewed' ? f.isReviewed : !f.isReviewed);
      return matchSearch && matchReview;
    });
  }, [feedbacks, searchQuery, reviewFilter]);

  const stats = useMemo(() => {
    if (feedbacks.length === 0) return null;

    const categories = [
      { name: 'Overall', key: 'overallSummitExperience' },
      { name: 'Technical', key: 'technicalSessions' },
      { name: 'Factory', key: 'factoryVisits' },
      { name: 'Hospitality', key: 'hospitality' },
      { name: 'Transport', key: 'transportation' },
      { name: 'Food', key: 'foodRefreshments' },
      { name: 'Admin', key: 'eventAdministration' },
    ] as const;

    const categoryPerformance = categories.map(cat => {
      let totalRating = 0;
      let count = 0;
      feedbacks.forEach(f => {
        if (!f[cat.key]) return;
        const ratings = Object.values(f[cat.key]);
        ratings.forEach(r => {
          if (r > 0) {
            totalRating += r;
            count++;
          }
        });
      });
      return {
        name: cat.name,
        score: count > 0 ? parseFloat((totalRating / count).toFixed(2)) : 0
      };
    });

    const sortedFeedbacks = [...feedbacks].sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
    const groupedByDate: Record<string, { total: number; sum: number }> = {};

    sortedFeedbacks.forEach(f => {
      const date = new Date(f.timestamp).toLocaleDateString();
      if (!groupedByDate[date]) groupedByDate[date] = { total: 0, sum: 0 };
      groupedByDate[date].total++;
      if (f.overallExperience > 0) groupedByDate[date].sum += f.overallExperience;
    });

    const trendLine = Object.entries(groupedByDate).map(([date, data]) => ({
      date,
      avg: parseFloat((data.sum / data.total).toFixed(2))
    }));

    const total = feedbacks.length;
    const reviewedCount = feedbacks.filter(f => f.isReviewed).length;

    const uniqueCountries = new Set(feedbacks.map(f => f.guestInfo.country)).size;
    const avgScore = feedbacks.reduce((acc, curr) => acc + (curr.overallExperience || 0), 0) / total;

    return { total, avgScore: avgScore.toFixed(1), countriesParticipated: uniqueCountries, reviewedCount, categoryPerformance, trendLine };
  }, [feedbacks]);

  const exportToExcel = () => {
    if (filteredData.length === 0) return;
    const data = filteredData.map(f => ({
      ID: f.id,
      Date: new Date(f.timestamp).toLocaleDateString(),
      Name: f.guestInfo.name,
      Country: f.guestInfo.country,
      Designation: f.guestInfo.designation,
      Email: f.guestInfo.email,
      'Overall Experience': f.overallExperience,
      'Recommend': f.recommendToOthers ? 'Yes' : 'No',
      'Most Valuable Aspect': f.mostValuableAspect,
      'Most Impactful Session': f.mostImpactfulSession,
      'Suggestions': f.suggestionsForImprovement,
      'Future Topics': f.futureTopics
    }));
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Feedback");
    XLSX.writeFile(wb, "Regional_Summit_Feedback.xlsx");
  };

  const exportToPDF = () => {
    if (filteredData.length === 0) return;
    const doc = new jsPDF();
    doc.text("South Asia Regional Manufacturing Summit 2026 Feedback Report", 14, 15);
    const tableColumn = ["Date", "Name", "Country", "Designation", "Overall"];
    const tableRows = filteredData.map(f => [
      new Date(f.timestamp).toLocaleDateString(),
      f.guestInfo.name,
      f.guestInfo.country,
      f.guestInfo.designation,
      f.overallExperience.toString()
    ]);

    autoTable(doc, {
      head: [tableColumn],
      body: tableRows,
      startY: 20,
    });
    doc.save("Regional_Summit_Feedback.pdf");
  };

  const isAdmin = role === 'Admin';

  return (
    <div className="p-6 md:p-10 max-w-7xl mx-auto">
      {selectedFeedback && (
        <FeedbackModal
          feedback={selectedFeedback}
          onClose={() => setSelectedFeedback(null)}
          isAdmin={isAdmin}
          onToggleReview={handleToggleReview}
        />
      )}

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
        <div>
          <div className="flex flex-wrap items-center gap-3 mb-2">
            <h1 className="font-display text-3xl font-bold text-champagne flex items-center gap-3">
              <span className="w-1 h-8 rounded-full inline-block" style={{ background: 'linear-gradient(180deg,#ecbc2d,#d4af37)', boxShadow: '0 0 12px rgba(212,175,55,0.5)' }}></span>
              Summit Analytics
            </h1>
            <span className="section-badge">{role} Mode</span>
          </div>
          <p className="text-sm" style={{ color: 'rgba(184,176,160,0.55)' }}>Real-time performance monitoring and feedback insights.</p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button onClick={() => { loadData(); }} className="btn-outline-gold px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2">
            Refresh
          </button>

          {isAdmin && (
            <>
              <button onClick={exportToExcel} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all" style={{ background: 'rgba(16,185,129,0.1)', border: '1px solid rgba(16,185,129,0.3)', color: '#34d399' }}>
                <Icons.Download className="w-4 h-4" /> Excel
              </button>
              <button onClick={exportToPDF} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all" style={{ background: 'rgba(239,68,68,0.1)', border: '1px solid rgba(239,68,68,0.3)', color: '#f87171' }}>
                <Icons.Download className="w-4 h-4" /> PDF
              </button>
            </>
          )}

          <div className="h-8 w-px mx-1 hidden md:block" style={{ background: 'rgba(212,175,55,0.15)' }}></div>
          <button onClick={onLogout} className="px-4 py-2 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all" style={{ color: 'rgba(239,68,68,0.7)', border: '1px solid transparent' }}>
            Logout
          </button>
        </div>
      </div>

      {!stats ? (
        <div className="flex flex-col items-center justify-center py-32 rounded-3xl border border-dashed animate-fadeIn" style={{ background: 'rgba(13,21,38,0.5)', borderColor: 'rgba(212,175,55,0.15)' }}>
          <div className="w-20 h-20 rounded-2xl flex items-center justify-center mx-auto mb-6" style={{ background: 'rgba(212,175,55,0.08)', border: '1px solid rgba(212,175,55,0.2)', color: 'rgba(212,175,55,0.5)' }}>
            <Icons.Chart className="w-10 h-10" />
          </div>
          <h2 className="font-display text-2xl font-bold text-champagne mb-2">Awaiting Feedback</h2>
          <p className="max-w-sm text-center px-4 leading-relaxed text-sm font-medium" style={{ color: 'rgba(184,176,160,0.85)' }}>
            Your dashboard will come to life once the first guest response is submitted.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatCard
              title="Total Responses"
              value={stats.total}
              color="text-champagne"
              subtitle="All submissions"
              icon={<svg className="w-4 h-4" style={{ color: '#d4af37' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" /></svg>}
            />
            <StatCard
              title="Avg. Satisfaction"
              value={`${stats.avgScore} / 5`}
              color="gold-text"
              subtitle="Overall experience score"
              icon={<svg className="w-4 h-4" style={{ color: '#d4af37' }} fill="currentColor" viewBox="0 0 24 24"><path d="M11.049 2.927c.3-.921 1.603-.921 1.902 0l1.519 4.674a1 1 0 00.95.69h4.915c.969 0 1.371 1.24.588 1.81l-3.976 2.888a1 1 0 00-.363 1.118l1.518 4.674c.3.922-.755 1.688-1.538 1.118l-3.976-2.888a1 1 0 00-1.176 0l-3.976 2.888c-.783.57-1.838-.197-1.538-1.118l1.518-4.674a1 1 0 00-.363-1.118l-3.976-2.888c-.784-.57-.38-1.81.588-1.81h4.914a1 1 0 00.951-.69l1.519-4.674z" /></svg>}
            />
            <StatCard
              title="Countries"
              value={stats.countriesParticipated}
              color="text-emerald-400"
              subtitle="Nations represented"
              icon={<svg className="w-4 h-4" style={{ color: '#34d399' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 21a9.004 9.004 0 008.716-6.747M12 21a9.004 9.004 0 01-8.716-6.747M12 21c2.485 0 4.5-4.03 4.5-9S14.485 3 12 3m0 18c-2.485 0-4.5-4.03-4.5-9S9.515 3 12 3m0 0a8.997 8.997 0 017.843 4.582M12 3a8.997 8.997 0 00-7.843 4.582m15.686 0A11.953 11.953 0 0112 10.5c-2.998 0-5.74-1.1-7.843-2.918m15.686 0A8.959 8.959 0 0121 12c0 .778-.099 1.533-.284 2.253m0 0A17.919 17.919 0 0112 16.5c-3.162 0-6.133-.815-8.716-2.247m0 0A9.015 9.015 0 013 12c0-1.605.42-3.113 1.157-4.418" /></svg>}
            />
            <StatCard
              title="Reviewed"
              value={`${stats.reviewedCount} / ${stats.total}`}
              color="text-blue-400"
              subtitle="Feedback processed"
              icon={<svg className="w-4 h-4" style={{ color: '#60a5fa' }} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>}
            />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 luxury-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'rgba(184,176,160,0.85)' }}>Category Performance</h3>
                <span className="section-badge">Avg. out of 5</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categoryPerformance} barCategoryGap="20%">
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212,175,55,0.06)" />
                    <XAxis dataKey="name" fontSize={9} tickLine={false} axisLine={false} tick={{ fill: 'rgba(184,176,160,0.85)' }} interval="preserveStartEnd" />
                    <YAxis domain={[0, 5]} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(184,176,160,0.85)' }} />
                    <RechartsTooltip cursor={{ fill: 'rgba(212,175,55,0.05)' }} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', background: '#0d1526', color: '#f5f0e8', fontSize: '12px' }} />
                    <Bar dataKey="score" fill="#d4af37" radius={[4, 4, 0, 0]} maxBarSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 luxury-card p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: 'rgba(184,176,160,0.85)' }}>Rating Trend</h3>
                <span className="section-badge">Over time</span>
              </div>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trendLine}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212,175,55,0.06)" />
                    <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(184,176,160,0.85)' }} />
                    <YAxis domain={[0, 5]} fontSize={10} tickLine={false} axisLine={false} tick={{ fill: 'rgba(184,176,160,0.85)' }} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', background: '#0d1526', color: '#f5f0e8', fontSize: '12px' }} />
                    <Line type="monotone" dataKey="avg" stroke="#d4af37" strokeWidth={2.5} dot={{ r: 4, fill: '#d4af37' }} activeDot={{ r: 6, fill: '#ecbc2d' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="luxury-card overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)', background: 'rgba(13,21,38,0.6)' }}>
              <div className="flex items-center gap-3">
                <h3 className="font-display text-xl font-bold text-champagne">All Feedback</h3>
                <span className="section-badge">{filteredData.length} entries</span>
              </div>
              <div className="flex flex-wrap gap-3">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search by name, country..."
                    className="luxury-input pl-9 py-2 text-sm w-full md:w-64"
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                  />
                  <Icons.Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'rgba(212,175,55,0.4)' }} />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(184,176,160,0.75)' }}>Filter:</span>
                  <div className="flex p-1 rounded-lg" style={{ background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(212,175,55,0.12)' }}>
                    {(['all', 'reviewed', 'unreviewed'] as const).map(f => (
                      <button
                        key={f}
                        onClick={() => setReviewFilter(f)}
                        className="px-3 py-1 text-xs rounded-md transition-all font-semibold"
                        style={reviewFilter === f ? { background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' } : { color: 'rgba(184,176,160,0.7)', border: '1px solid transparent' }}
                      >
                        {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr style={{ background: 'rgba(6,9,21,0.7)' }}>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: 'rgba(184,176,160,0.75)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>Review</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-left" style={{ color: 'rgba(184,176,160,0.75)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>Guest</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-left" style={{ color: 'rgba(184,176,160,0.75)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>Country</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-left" style={{ color: 'rgba(184,176,160,0.75)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>Submitted</th>
                    <th className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest text-center" style={{ color: 'rgba(184,176,160,0.75)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>Overall</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm font-medium" style={{ color: 'rgba(184,176,160,0.7)' }}>
                        No feedback found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((feedback) => (
                      <tr key={feedback.id} onClick={() => setSelectedFeedback(feedback)} className="cursor-pointer transition-all group" style={{ borderBottom: '1px solid rgba(212,175,55,0.06)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.04)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        <td className="px-6 py-4 whitespace-nowrap text-center">
                          <div onClick={(e) => { e.stopPropagation(); handleToggleReview(feedback.id); }} className="w-6 h-6 mx-auto rounded-md flex items-center justify-center transition-all cursor-pointer" style={feedback.isReviewed ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' } : { background: 'rgba(13,21,38,0.4)', border: '1px solid rgba(212,175,55,0.3)', color: 'rgba(212,175,55,0.1)' }}>
                            <Icons.Check className="w-4 h-4" />
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {feedback.guestInfo.name === 'Anonymous Guest' ? (
                            <div className="flex items-center gap-2">
                              <span className="text-xl opacity-40">👤</span>
                              <div>
                                <div className={`font-semibold italic transition-colors ${feedback.isReviewed ? 'line-through' : ''}`} style={{ color: 'rgba(184,176,160,0.5)' }}>Anonymous Guest</div>
                              </div>
                            </div>
                          ) : (
                            <>
                              <div className={`font-semibold transition-colors ${feedback.isReviewed ? 'line-through opacity-50' : ''}`} style={{ color: '#f5f0e8' }}>{feedback.guestInfo.name}</div>
                              <div className="text-xs mt-0.5 font-medium" style={{ color: 'rgba(184,176,160,0.75)' }}>{feedback.guestInfo.designation}</div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'rgba(184,176,160,0.85)' }}>{feedback.guestInfo.country}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium" style={{ color: 'rgba(184,176,160,0.75)' }}>{new Date(feedback.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-center"><RatingBadge rating={feedback.overallExperience} /></td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
