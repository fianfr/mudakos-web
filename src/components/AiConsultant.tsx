import React, { useState } from 'react';
import { 
  Sparkles, 
  RefreshCw, 
  CheckCircle, 
  HelpCircle, 
  Lightbulb, 
  FileText, 
  ArrowRight,
  TrendingUp,
  AlertTriangle
} from 'lucide-react';
import { Room, Complaint, Property } from '../types';

interface AiConsultantProps {
  rooms: Room[];
  complaints: Complaint[];
  properties: Property[];
  selectedPropertyId: string;
}

export default function AiConsultant({ rooms, complaints, properties, selectedPropertyId }: AiConsultantProps) {
  const [recommendationType, setRecommendationType] = useState<'renovation' | 'marketing'>('renovation');
  const [budget, setBudget] = useState('IDR 5,000,000');
  const [focus, setFocus] = useState('');
  const [extraContext, setExtraContext] = useState('');
  
  // Loading & Response State
  const [loading, setLoading] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [recommendation, setRecommendation] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Derive current real-time stats
  const totalRoomsCount = rooms.length;
  const occupiedRoomsCount = rooms.filter(r => r.status === 'occupied').length;
  const occupancyRate = totalRoomsCount > 0 ? Math.round((occupiedRoomsCount / totalRoomsCount) * 100) : 0;
  const activeComplaintsCount = complaints.filter(c => c.status !== 'solved').length;

  const triggerStepIntervals = (isActive: boolean) => {
    if (!isActive) return;
    setLoadingStep(0);
    const interval = setInterval(() => {
      setLoadingStep(prev => {
        if (prev >= 3) {
          return 3;
        }
        return prev + 1;
      });
    }, 2800);
    return interval;
  };

  const handleRequestRecommendation = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setRecommendation(null);
    setErrorMsg(null);

    const stepInterval = triggerStepIntervals(true);

    try {
      const response = await fetch('/api/recommendation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          type: recommendationType,
          occupancyRate,
          complaintsCount: activeComplaintsCount,
          budget,
          focus: focus || "general",
          extraContext
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Internal Server requested analysis failed.");
      }

      const data = await response.json();
      setRecommendation(data.recommendation);
    } catch (error: any) {
      console.error(error);
      setErrorMsg(error.message || "An unexpected network error occurred. Please verify your Gemini connection settings.");
    } finally {
      if (stepInterval) clearInterval(stepInterval);
      setLoading(false);
    }
  };

  // Simple and highly effective regex utility to format raw Gemini markdown into gorgeous styled segments
  const renderMarkdown = (md: string) => {
    const lines = md.split('\n');
    return lines.map((line, idx) => {
      const trimmed = line.trim();

      // Heading 3
      if (trimmed.startsWith('### ')) {
        return (
          <h4 key={idx} className="font-display font-semibold text-soft-850 text-base mt-6 mb-2 flex items-center gap-2 border-b border-soft-100 pb-1.5 pt-2">
            <span className="w-1.5 h-4.5 bg-forest-300 rounded-sm inline-block" />
            {trimmed.replace('### ', '')}
          </h4>
        );
      }

      // Heading 2
      if (trimmed.startsWith('## ')) {
        return (
          <h3 key={idx} className="font-display font-bold text-soft-900 text-lg mt-8 mb-3 border-l-4 border-forest-300 pl-3">
            {trimmed.replace('## ', '')}
          </h3>
        );
      }

      // Heading 1
      if (trimmed.startsWith('# ')) {
        return (
          <h2 key={idx} className="font-display font-black text-soft-905 text-xl mt-10 mb-4 pb-2 border-b-2 border-forest-100">
            {trimmed.replace('# ', '')}
          </h2>
        );
      }

      // Bold parsing in line
      let content: React.ReactNode = trimmed;
      if (trimmed.startsWith('- ') || trimmed.startsWith('* ')) {
        const rawListItem = trimmed.substring(2);
        const boldRegex = /\*\*(.*?)\*\*/g;
        const matches = [...rawListItem.matchAll(boldRegex)];
        
        if (matches.length > 0) {
          const parts = rawListItem.split(/\*\*.*?\*\*/);
          content = (
            <span className="text-soft-700">
              {parts.map((p, i) => (
                <React.Fragment key={i}>
                  {p}
                  {matches[i] && <strong className="font-bold text-soft-900">{matches[i][1]}</strong>}
                </React.Fragment>
              ))}
            </span>
          );
        } else {
          content = <span className="text-soft-700">{rawListItem}</span>;
        }

        return (
          <li key={idx} className="ml-5 list-disc text-xs text-soft-650 leading-relaxed my-1.5">
            {content}
          </li>
        );
      }

      // Normal Line Bold checks
      const boldRegex = /\*\*(.*?)\*\*/g;
      const matches = [...trimmed.matchAll(boldRegex)];
      if (matches.length > 0) {
        const parts = trimmed.split(/\*\*.*?\*\*/);
        content = (
          <span>
            {parts.map((p, i) => (
              <React.Fragment key={i}>
                {p}
                {matches[i] && <strong className="font-semibold text-soft-900">{matches[i][1]}</strong>}
              </React.Fragment>
            ))}
          </span>
        );
      }

      if (trimmed === '') {
        return <div key={idx} className="h-2.5" />;
      }

      return (
        <p key={idx} className="text-xs text-soft-650 leading-relaxed my-1 font-sans">
          {content}
        </p>
      );
    });
  };

  const loadingQuotes = [
    "Crunching MudaKost room occupancy metrics...",
    "Querying Gemini Property Strategies AI...",
    "Structuring premium Indonesian boarding house solutions...",
    "Drafting detailed Cost-Benefit Analysis..."
  ];

  return (
    <div className="space-y-6">
      {/* Page Title */}
      <div>
        <h2 className="text-2xl font-display font-bold text-soft-850">AI Property Consultant</h2>
        <p className="text-sm text-soft-500 mt-1">
          Receive tailored boarding house renovation checklists or tenant-attracting student marketing campaigns powered by Google Gemini AI.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Input Parameters panel */}
        <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-soft-200 shadow-xs h-fit space-y-5">
          <div className="flex items-center gap-2 mb-1 bg-forest-50/50 p-3 rounded-lg border border-forest-100">
            <Sparkles className="w-4.5 h-4.5 text-forest-650" />
            <h3 className="text-xs font-semibold text-forest-800 uppercase tracking-widest leading-none">Gemini Strategic Recommender</h3>
          </div>

          <form onSubmit={handleRequestRecommendation} className="space-y-4">
            <div>
              <label className="block text-[11px] font-semibold text-soft-500 mb-1.5 uppercase">Consultation Theme</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => { setRecommendationType('renovation'); setFocus('Room aesthetic redesign'); }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold leading-tight border transition-all cursor-pointer ${
                    recommendationType === 'renovation'
                      ? 'bg-forest-300 text-white border-forest-400'
                      : 'bg-white text-soft-600 border-soft-200 hover:bg-soft-50'
                  }`}
                >
                  🛠️ Renovation / Build
                </button>
                <button
                  type="button"
                  onClick={() => { setRecommendationType('marketing'); setFocus('Social media promotion'); }}
                  className={`py-2.5 px-3 rounded-xl text-xs font-bold leading-tight border transition-all cursor-pointer ${
                    recommendationType === 'marketing'
                      ? 'bg-forest-300 text-white border-forest-400'
                      : 'bg-white text-soft-600 border-soft-200 hover:bg-soft-50'
                  }`}
                >
                  📢 Rent Marketing
                </button>
              </div>
            </div>

            {/* auto compiled information boxes */}
            <div className="bg-soft-50/50 p-4 rounded-xl border border-soft-200 space-y-3">
              <h4 className="text-[10px] font-bold text-soft-450 uppercase tracking-wider">MudaKost Auto-populated Stats</h4>
              
              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-soft-400 block text-[10px] uppercase">Occupancy Code</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <TrendingUp className="w-3.5 h-3.5 text-forest-600" />
                    <span className="font-bold text-soft-800 font-mono">{occupancyRate}% Rate</span>
                  </div>
                </div>

                <div>
                  <span className="text-soft-400 block text-[10px] uppercase">Pending complaints</span>
                  <div className="flex items-center gap-1.5 mt-1">
                    <AlertTriangle className={`w-3.5 h-3.5 ${activeComplaintsCount > 0 ? 'text-rose-500' : 'text-emerald-500'}`} />
                    <span className="font-bold text-soft-800 font-mono">{activeComplaintsCount} Grievances</span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Estimated Budget Limit</label>
              <input
                type="text"
                required
                placeholder="e.g. IDR 3,000,000"
                value={budget}
                onChange={(e) => setBudget(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500 font-mono"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Primary Optimization Focus</label>
              <input
                type="text"
                placeholder={recommendationType === 'renovation' ? 'e.g. toilet leak, paint styling, study desk' : 'e.g. TikTok video, promo deals'}
                value={focus}
                onChange={(e) => setFocus(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-soft-500 mb-1.5 uppercase">Specific details / Requirements note</label>
              <textarea
                placeholder="Write specific problems or wishes. (e.g. We want to convert our storage room to deluxe or attract students from nearby Binus University.)"
                rows={4}
                value={extraContext}
                onChange={(e) => setExtraContext(e.target.value)}
                className="w-full text-xs px-3 py-2.5 bg-soft-50 border border-soft-200 rounded-lg focus:outline-hidden focus:ring-1 focus:ring-forest-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full bg-forest-350 bg-forest-350 text-white font-semibold py-3 px-4 rounded-xl text-xs transition-all duration-200 flex items-center justify-center gap-2 cursor-pointer shadow-xs ${
                loading ? 'opacity-60 bg-forest-200 cursor-not-allowed' : 'hover:bg-forest-500 bg-forest-300'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-white" /> Consulting Gemini Agent...
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-emerald-100 animate-pulse" /> Request AI Strategy <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </form>
        </div>

        {/* Output presentation area */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-soft-200 shadow-xs flex flex-col p-6 min-h-110">
          <div className="pb-3 border-b border-soft-100 flex items-center justify-between text-soft-500">
            <div className="flex items-center gap-1.5">
              <FileText className="w-4 h-4 text-soft-400" />
              <span className="text-xs font-bold font-display tracking-wider uppercase">Strategic Recommendations Report</span>
            </div>
            
            {recommendation && (
              <button 
                onClick={() => { setRecommendation(null); }}
                className="text-xs text-soft-400 hover:text-soft-850 cursor-pointer flex items-center gap-1"
              >
                Clear output
              </button>
            )}
          </div>

          <div className="flex-1 mt-4">
            {/* INITIAL BLANK VIEW */}
            {!loading && !recommendation && !errorMsg && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-4">
                <div className="w-14 h-14 rounded-full bg-forest-50 flex items-center justify-center text-forest-600">
                  <Lightbulb className="w-7 h-7" />
                </div>
                <div className="max-w-sm">
                  <h4 className="font-display font-bold text-soft-805 text-sm">No analysis retrieved yet</h4>
                  <p className="text-xs text-soft-450 mt-1 leading-relaxed">
                    Select your theme preferences, fill in your budget limitations on the left, and request real-time Gemini recommendations.
                  </p>
                </div>
              </div>
            )}

            {/* ERROR DISPLAY */}
            {errorMsg && (
              <div className="p-4 bg-rose-50 border border-rose-150 rounded-xl space-y-2 text-rose-800 text-xs">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-rose-600" />
                  <strong className="font-semibold">Consultation Request Fault</strong>
                </div>
                <p className="leading-relaxed">{errorMsg}</p>
                <div className="text-[10px] text-rose-600 pt-2 border-t border-rose-150 font-mono">
                  Troubleshoot info: Confirm you have pasted a valid GEMINI_API_KEY in the "Settings &gt; Secrets" panel in AI Studio.
                </div>
              </div>
            )}

            {/* LOADING STATE VIEW */}
            {loading && (
              <div className="h-full flex flex-col items-center justify-center text-center p-8 space-y-6">
                {/* Visual loader icon */}
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-forest-50 border-t-forest-300 animate-spin" />
                  <Sparkles className="absolute w-5 h-5 text-forest-600 animate-bounce" />
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-display font-medium text-xs text-soft-800 animate-pulse">
                    {loadingQuotes[loadingStep] || "Processing consultation models..."}
                  </h4>
                  <p className="text-[10px] text-soft-450">
                    Typically completes in 5 to 10 seconds. Thank you for your patience!
                  </p>
                </div>

                {/* Staggered progress steps loader indicator */}
                <div className="flex items-center gap-2 mt-4">
                  {[0, 1, 2, 3].map((step) => (
                    <div 
                      key={step} 
                      className={`h-1.5 rounded-full transition-all duration-300 ${
                        loadingStep === step 
                          ? 'w-6 bg-forest-300' 
                          : loadingStep > step 
                            ? 'w-2.5 bg-forest-400' 
                            : 'w-2 bg-soft-200'
                      }`}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* RESULTS REPORT PRESENTATION PANELS */}
            {recommendation && (
              <div className="prose max-w-none text-xs font-sans pb-8 max-h-165 overflow-y-auto pr-2 space-y-1">
                {renderMarkdown(recommendation)}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
