import { useState } from 'react';
import { Zap, Code, Terminal, BarChart3, CheckCircle2, XCircle } from 'lucide-react';
import { geminiService } from '@/lib/gemini';
import { FeatureEvaluation } from '@/types';
import { ResponsiveContainer, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';

interface Props {
  evaluation: FeatureEvaluation | null;
  onUpdate: (data: FeatureEvaluation) => void;
}

export default function ImpactEvaluator({ evaluation, onUpdate }: Props) {
  const [featureName, setFeatureName] = useState('');
  const [description, setDescription] = useState('');
  const [isEvaluating, setIsEvaluating] = useState(false);

  const evaluate = async () => {
    setIsEvaluating(true);
    try {
      const result = await geminiService.evaluateFeature(featureName, description);
      onUpdate({ ...result, name: featureName, description });
    } catch (error) {
      console.error(error);
    } finally {
      setIsEvaluating(false);
    }
  };

  const radarData = evaluation ? [
    { subject: 'Reach', A: evaluation.riceScore.reach, fullMark: 10 },
    { subject: 'Impact', A: evaluation.riceScore.impact, fullMark: 10 },
    { subject: 'Confidence', A: evaluation.riceScore.confidence, fullMark: 10 },
    { subject: 'Effort', A: 10 - evaluation.riceScore.effort, fullMark: 10 }, 
  ] : [];

  return (
    <div className="space-y-6">
      {/* Input Section */}
      <div className="bg-white border border-[#141414]/10 shadow-sm rounded-xl overflow-hidden p-6">
        <div className="mb-4">
          <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
            <Zap size={18} className="text-[#008060]" />
            Technical & Impact Evaluator
          </h3>
          <p className="text-sm text-gray-500">Input a feature idea to evaluate its technical feasibility and potential impact.</p>
        </div>
        
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-50">Feature Name</label>
              <input 
                type="text"
                placeholder="e.g. Multi-currency checkout widget" 
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#141414]/10 focus:ring-2 focus:ring-[#008060] outline-none transition-all"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-50">Description</label>
              <input 
                type="text"
                placeholder="Briefly describe the value proposition..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#141414]/10 focus:ring-2 focus:ring-[#008060] outline-none transition-all"
              />
            </div>
          </div>
          <button 
            onClick={evaluate} 
            disabled={isEvaluating || !featureName}
            className="w-full bg-[#141414] hover:bg-[#2a2a2a] disabled:bg-gray-300 text-white rounded-xl py-2 font-medium transition-colors"
          >
            {isEvaluating ? 'Evaluating Feasibility...' : 'Run Technical Evaluation'}
          </button>
        </div>
      </div>

      {evaluation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feasibility Card */}
          <div className="bg-white border border-[#141414]/10 shadow-sm rounded-xl p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
              <Code size={16} />
              Feasibility
            </h4>
            <div className="space-y-4">
              <div className="flex items-center">
                {evaluation.feasibility.isPossible ? (
                  <span className="flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-green-100 text-green-700 border border-green-200">
                    <CheckCircle2 size={12} className="mr-1" /> Possible
                  </span>
                ) : (
                  <span className="flex items-center px-2 py-1 rounded-md text-[10px] font-bold uppercase bg-red-100 text-red-700 border border-red-200">
                    <XCircle size={12} className="mr-1" /> Not Possible
                  </span>
                )}
              </div>
              <p className="text-sm text-[#141414]/80 leading-relaxed">
                {evaluation.feasibility.technicalNotes}
              </p>
              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase opacity-50">Required APIs</span>
                <div className="flex flex-wrap gap-1">
                  {evaluation.feasibility.apiEndpoints.map((api, i) => (
                    <code key={i} className="text-[10px] bg-[#141414]/5 px-2 py-1 rounded border border-[#141414]/10">
                      {api}
                    </code>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Estimation Card */}
          <div className="bg-white border border-[#141414]/10 shadow-sm rounded-xl p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
              <Terminal size={16} />
              Estimation
            </h4>
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#141414]/5 rounded-xl border border-[#141414]/10 text-center">
                  <span className="text-[10px] font-bold uppercase opacity-50 block mb-1">Complexity</span>
                  <span className="text-lg font-bold capitalize">{evaluation.estimation.complexity}</span>
                </div>
                <div className="p-3 bg-[#141414]/5 rounded-xl border border-[#141414]/10 text-center">
                  <span className="text-[10px] font-bold uppercase opacity-50 block mb-1">Effort</span>
                  <span className="text-lg font-bold">{evaluation.estimation.effortDays} Days</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase opacity-50">Estimated LOC</span>
                  <span className="text-xs font-mono font-bold">{evaluation.estimation.loc} lines</span>
                </div>
                {/* Manual Progress Bar */}
                <div className="w-full h-1 bg-[#141414]/10 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-[#141414] transition-all" 
                    style={{ width: `${Math.min((evaluation.estimation.loc / 5000) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* RICE Matrix */}
          <div className="bg-white border border-[#141414]/10 shadow-sm rounded-xl p-6">
            <h4 className="text-sm font-bold uppercase tracking-wider flex items-center gap-2 mb-4">
              <BarChart3 size={16} />
              RICE Matrix
            </h4>
            <div className="h-[200px]">
              <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={radarData}>
                  <PolarGrid stroke="#141414" strokeOpacity={0.1} />
                  <PolarAngleAxis dataKey="subject" tick={{ fontSize: 10, fontWeight: 600 }} />
                  <PolarRadiusAxis angle={30} domain={[0, 10]} tick={false} axisLine={false} />
                  <Radar
                    name="Score"
                    dataKey="A"
                    stroke="#008060"
                    fill="#008060"
                    fillOpacity={0.6}
                  />
                </RadarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
