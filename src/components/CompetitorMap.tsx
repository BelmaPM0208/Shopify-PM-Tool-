import { useState } from 'react';
import { Target, ShieldCheck, ShieldAlert, ExternalLink, Info } from 'lucide-react';
import { geminiService } from '@/lib/gemini';
import { CompetitorFeature } from '@/types';

interface Props {
  competitors: CompetitorFeature[];
  onUpdate: (data: CompetitorFeature[]) => void;
}

export default function CompetitorMap({ competitors, onUpdate }: Props) {
  const [category, setCategory] = useState('');
  const [featureName, setFeatureName] = useState('');
  const [isMapping, setIsMapping] = useState(false);

  const map = async () => {
    setIsMapping(true);
    try {
      const results = await geminiService.mapCompetitors(category, featureName);
      onUpdate(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsMapping(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Search Card */}
      <div className="bg-white border border-[#141414]/10 shadow-sm rounded-xl overflow-hidden">
        <div className="p-6">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
            <Target size={18} className="text-[#008060]" />
            Market Intelligence Agent
          </h3>
          <p className="text-sm text-gray-500 mb-4">Analyze top competitors in your category to see if they offer this feature.</p>
          
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">App Category</label>
                <input 
                  type="text"
                  placeholder="e.g. Upsell & Cross-sell" 
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#141414]/10 focus:ring-2 focus:ring-[#008060] outline-none transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-wider opacity-50">Feature to Check</label>
                <input 
                  type="text"
                  placeholder="e.g. Multi-currency support" 
                  value={featureName}
                  onChange={(e) => setFeatureName(e.target.value)}
                  className="w-full px-4 py-2 rounded-xl border border-[#141414]/10 focus:ring-2 focus:ring-[#008060] outline-none transition-all"
                />
              </div>
            </div>
            <button 
              onClick={map} 
              disabled={isMapping || !category || !featureName}
              className="w-full bg-[#008060] hover:bg-[#006e52] disabled:bg-gray-300 text-white rounded-xl py-2 font-medium transition-colors"
            >
              {isMapping ? 'Scanning Competitors...' : 'Map Feature Parity'}
            </button>
          </div>
        </div>
      </div>

      {/* Competitor Grid */}
      {competitors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((comp, i) => (
            <div key={i} className="bg-white border border-[#141414]/10 shadow-sm rounded-xl p-4 hover:border-[#008060]/30 transition-all group">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-sm font-bold">{comp.name}</h4>
                <ExternalLink size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {comp.hasFeature ? (
                    <span className="flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-blue-100 text-blue-700 border border-blue-200">
                      <ShieldCheck size={12} className="mr-1" /> Table Stakes
                    </span>
                  ) : (
                    <span className="flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-purple-100 text-purple-700 border border-purple-200">
                      <ShieldAlert size={12} className="mr-1" /> Differentiator
                    </span>
                  )}
                </div>
                <p className="text-xs text-[#141414]/70 leading-relaxed italic">
                  "{comp.notes}"
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insight Card */}
      {competitors.length > 0 && (
        <div className="bg-[#141414] text-white rounded-xl overflow-hidden shadow-lg">
          <div className="p-6 flex items-center gap-4">
            <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center shrink-0">
              <Info size={24} className="text-[#008060]" />
            </div>
            <div>
              <h4 className="font-bold text-sm">Strategic Insight</h4>
              <p className="text-xs text-white/70 mt-1">
                {competitors.filter(c => c.hasFeature).length > competitors.length / 2 
                  ? "This feature is becoming a standard in your category. Building it is necessary for parity."
                  : "Few competitors have this feature. This is a high-value opportunity for differentiation."}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
