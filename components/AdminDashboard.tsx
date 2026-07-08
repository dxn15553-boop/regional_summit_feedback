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

const StatCard: React.FC<{ title: string; value: string | number; subtitle?: string; color: string }> = ({ title, value, subtitle, color }) => (
  <div className="luxury-card p-6">
    <h4 className="text-xs font-semibold tracking-widest uppercase mb-1" style={{ color: 'rgba(184,176,160,0.55)' }}>{title}</h4>
    <div className={`text-3xl font-bold drop-shadow-md ${color}`}>{value}</div>
    {subtitle && <p className="text-xs mt-2" style={{ color: 'rgba(184,176,160,0.4)' }}>{subtitle}</p>}
  </div>
);

const RatingBadge: React.FC<{ rating: number }> = ({ rating }) => {
  if (!rating) return <span className="italic text-xs" style={{ color: 'rgba(184,176,160,0.4)' }}>N/A</span>;
  let color = 'bg-midnight-800/60 border-midnight-700' ;
  let textColor = 'rgba(184,176,160,0.6)';
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
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-summit-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="glass-card w-full max-w-4xl max-h-[90vh] rounded-3xl overflow-hidden flex flex-col relative z-10 border border-summit-800 bg-summit-950">
        <div className="p-6 border-b border-summit-800 flex items-center justify-between bg-summit-900/50">
          <div className="flex items-center gap-4">
            <div>
              <h3 className="text-xl font-bold text-summit-50">Feedback Details</h3>
              <p className="text-sm text-summit-400">ID: {feedback.id} • Submitted: {new Date(feedback.timestamp).toLocaleString()}</p>
            </div>
            {feedback.isReviewed && (
              <span className="bg-emerald-900/40 text-emerald-400 border border-emerald-800 px-3 py-1 rounded-full text-xs font-bold flex items-center gap-1">
                <Icons.Check className="w-3 h-3" /> Reviewed
              </span>
            )}
          </div>
          <div className="flex gap-2">
            <button onClick={handlePrint} className="p-2 hover:bg-summit-800 rounded-full transition-colors text-summit-400 hover:text-accent" title="Print Feedback">
              <Icons.Printer className="w-5 h-5" />
            </button>
            <button onClick={onClose} className="p-2 hover:bg-summit-800 rounded-full transition-colors text-summit-400 hover:text-red-400">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l18 18" /></svg>
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-summit-950" ref={contentRef}>
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-1 bg-summit-900/40 p-6 rounded-2xl border border-summit-800">
              <h4 className="text-sm font-bold text-summit-50 mb-4 flex items-center gap-2">
                <Icons.Star className="w-4 h-4 text-accent" />
                Guest Information
              </h4>
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="text-summit-400">Name</span>
                  <span className="font-bold text-summit-50">{feedback.guestInfo.name}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-summit-400">Country</span>
                  <span className="font-bold text-summit-50">{feedback.guestInfo.country}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-summit-400">Designation</span>
                  <span className="font-bold text-summit-50">{feedback.guestInfo.designation}</span>
                </div>
              </div>

              <div className="mt-6 pt-6 border-t border-summit-800/50">
                <h4 className="text-sm font-bold text-summit-50 mb-4">Overall Experience</h4>
                <div className="flex items-center gap-2">
                  <RatingBadge rating={feedback.overallExperience} />
                  <span className={`text-xs font-bold px-2 py-0.5 rounded border ${feedback.recommendToOthers ? 'bg-emerald-900/40 text-emerald-400 border-emerald-800' : 'bg-red-900/40 text-red-400 border-red-800'}`}>
                    {feedback.recommendToOthers ? 'Recommend' : 'Not Recommended'}
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold text-summit-50 mb-6 flex items-center gap-2">
                <span className="w-1.5 h-1.5 bg-accent rounded-full shadow-glow"></span>
                Event Ratings
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-4">
                {[
                  { label: "Registration & Reception", data: feedback.registrationReception },
                  { label: "Accommodation", data: feedback.accommodation },
                  { label: "Gala Dinner", data: feedback.galaDinner },
                  { label: "Cultural Program", data: feedback.culturalProgram },
                  { label: "Event Management", data: feedback.eventManagement },
                  { label: "Factory Visit", data: feedback.factoryVisit },
                  { label: "Venue", data: feedback.venue },
                  { label: "Transportation", data: feedback.transportation }
                ].map(cat => {
                  const rating = cat.data ? Object.values(cat.data)[0] : 0;
                  return (
                    <div key={cat.label} className="flex items-center justify-between py-2 border-b border-summit-800/50">
                      <span className="text-sm font-medium text-summit-300">{cat.label}</span>
                      <RatingBadge rating={rating} />
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="bg-summit-900/40 p-6 rounded-2xl border border-summit-800">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-sm font-bold text-summit-50">Additional Comments / Suggestions</h4>
            </div>
            <p className="text-summit-300 text-sm italic leading-relaxed bg-summit-950 p-4 rounded-xl border border-summit-800 shadow-inner whitespace-pre-wrap">
              {feedback.suggestions || "No suggestions provided."}
            </p>
          </div>
        </div>

        <div className="p-6 border-t border-summit-800 flex justify-between items-center bg-summit-900/50">
          {isAdmin ? (
            <button 
              onClick={() => onToggleReview(feedback.id)}
              className={`px-6 py-2 rounded-xl font-bold transition-all flex items-center gap-2 border ${
                feedback.isReviewed 
                  ? 'bg-summit-800 border-summit-600 text-summit-300 hover:text-summit-50 hover:bg-summit-700' 
                  : 'bg-emerald-900/30 border-emerald-500 text-emerald-400 hover:bg-emerald-900/50 shadow-glow'
              }`}
            >
              <Icons.Check className="w-5 h-5" />
              {feedback.isReviewed ? 'Mark as Unreviewed' : 'Mark as Reviewed'}
            </button>
          ) : <div />}
          <button onClick={onClose} className="px-6 py-2 bg-summit-800 text-summit-50 rounded-xl font-bold hover:bg-summit-700 border border-summit-700 transition-all">
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
      { name: 'Registration', key: 'registrationReception' },
      { name: 'Accommodation', key: 'accommodation' },
      { name: 'Gala Dinner', key: 'galaDinner' },
      { name: 'Cultural', key: 'culturalProgram' },
      { name: 'Event Mgmt', key: 'eventManagement' },
      { name: 'Factory', key: 'factoryVisit' },
      { name: 'Venue', key: 'venue' },
      { name: 'Transport', key: 'transportation' },
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
      if(f.overallExperience > 0) groupedByDate[date].sum += f.overallExperience;
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
      'Overall Experience': f.overallExperience,
      'Recommend': f.recommendToOthers ? 'Yes' : 'No',
      Suggestions: f.suggestions
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
          <p className="max-w-sm text-center px-4 leading-relaxed text-sm" style={{ color: 'rgba(184,176,160,0.5)' }}>
            Your dashboard will come to life once the first guest response is submitted.
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-10">
            <StatCard title="Total Feedback" value={stats.total} color="text-champagne" />
            <StatCard title="Overall Satisfaction" value={`${stats.avgScore}/5.0`} color="gold-text" />
            <StatCard title="Countries Participated" value={stats.countriesParticipated} color="text-emerald-400" />
            <StatCard title="Reviewed" value={`${stats.reviewedCount}/${stats.total}`} color="text-blue-400" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-10">
            <div className="lg:col-span-2 luxury-card p-6">
              <h3 className="text-base font-bold text-champagne mb-6 flex items-center gap-2">
                <Icons.Chart className="w-4 h-4" style={{ color: '#d4af37' } as React.CSSProperties} />
                Category Performance
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={stats.categoryPerformance}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212,175,55,0.08)" />
                    <XAxis dataKey="name" fontSize={11} tickLine={false} axisLine={false} tick={{fill: 'rgba(184,176,160,0.6)'}} />
                    <YAxis domain={[0, 5]} fontSize={11} tickLine={false} axisLine={false} tick={{fill: 'rgba(184,176,160,0.6)'}} />
                    <RechartsTooltip cursor={{fill: 'rgba(212,175,55,0.05)'}} contentStyle={{ borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', background: '#0d1526', color: '#f5f0e8' }} />
                    <Bar dataKey="score" fill="#d4af37" radius={[4, 4, 0, 0]} barSize={36} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            <div className="lg:col-span-1 luxury-card p-6">
              <h3 className="text-base font-bold text-champagne mb-6 flex items-center gap-2">
                <Icons.Star className="w-4 h-4" style={{ color: '#d4af37' } as React.CSSProperties} />
                Rating Trend
              </h3>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stats.trendLine}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(212,175,55,0.08)" />
                    <XAxis dataKey="date" fontSize={10} tickLine={false} axisLine={false} tick={{fill: 'rgba(184,176,160,0.6)'}} />
                    <YAxis domain={[0, 5]} fontSize={10} tickLine={false} axisLine={false} tick={{fill: 'rgba(184,176,160,0.6)'}} />
                    <RechartsTooltip contentStyle={{ borderRadius: '12px', border: '1px solid rgba(212,175,55,0.2)', background: '#0d1526', color: '#f5f0e8' }} />
                    <Line type="monotone" dataKey="avg" stroke="#d4af37" strokeWidth={2.5} dot={{ r: 4, fill: '#d4af37' }} activeDot={{ r: 6, fill: '#ecbc2d' }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          <div className="luxury-card overflow-hidden">
            <div className="p-6 flex flex-col md:flex-row md:items-center justify-between gap-4" style={{ borderBottom: '1px solid rgba(212,175,55,0.12)', background: 'rgba(13,21,38,0.6)' }}>
              <div className="flex items-center gap-3">
                <h3 className="font-display text-xl font-bold text-champagne">All Feedbacks</h3>
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
                  <span className="text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(184,176,160,0.4)' }}>Filter:</span>
                  <div className="flex p-1 rounded-lg" style={{ background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(212,175,55,0.12)' }}>
                    {(['all', 'reviewed', 'unreviewed'] as const).map(f => (
                      <button 
                        key={f} 
                        onClick={() => setReviewFilter(f)} 
                        className="px-3 py-1 text-xs rounded-md transition-all font-semibold"
                        style={reviewFilter === f ? { background: 'rgba(212,175,55,0.15)', color: '#d4af37', border: '1px solid rgba(212,175,55,0.3)' } : { color: 'rgba(184,176,160,0.45)', border: '1px solid transparent' }}
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
                    {['Status','Guest','Country','Submitted','Overall'].map(h => (
                      <th key={h} className="px-6 py-4 text-[10px] font-bold uppercase tracking-widest" style={{ color: 'rgba(184,176,160,0.4)', borderBottom: '1px solid rgba(212,175,55,0.1)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {filteredData.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-10 text-center text-sm" style={{ color: 'rgba(184,176,160,0.4)' }}>
                        No feedback found.
                      </td>
                    </tr>
                  ) : (
                    filteredData.map((feedback) => (
                      <tr key={feedback.id} onClick={() => setSelectedFeedback(feedback)} className="cursor-pointer transition-all group" style={{ borderBottom: '1px solid rgba(212,175,55,0.06)' }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = 'rgba(212,175,55,0.04)'}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div onClick={(e) => { e.stopPropagation(); handleToggleReview(feedback.id); }} className="w-6 h-6 rounded-md flex items-center justify-center transition-all cursor-pointer" style={feedback.isReviewed ? { background: 'rgba(16,185,129,0.15)', border: '1px solid rgba(16,185,129,0.4)', color: '#34d399' } : { background: 'rgba(13,21,38,0.8)', border: '1px solid rgba(212,175,55,0.15)', color: 'transparent' }}>
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
                              <div className="text-xs mt-0.5" style={{ color: 'rgba(184,176,160,0.45)' }}>{feedback.guestInfo.designation}</div>
                            </>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgba(184,176,160,0.7)' }}>{feedback.guestInfo.country}</td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm" style={{ color: 'rgba(184,176,160,0.5)' }}>{new Date(feedback.timestamp).toLocaleDateString()}</td>
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
