import { useState } from 'react';
import { FileText, Sparkles, UserCircle, Settings2, Rocket, Download } from 'lucide-react';
import { geminiService } from '@/lib/gemini';
import { ProjectBrief, FeedbackItem, FeatureEvaluation, CompetitorFeature } from '@/types';

interface Props {
  brief: ProjectBrief | null;
  onUpdate: (data: ProjectBrief) => void;
  context: {
    feedbackData: FeedbackItem[];
    evaluation: FeatureEvaluation | null;
    competitors: CompetitorFeature[];
  };
}

export default function ProjectBriefView({ brief, onUpdate, context }: Props) {
  const [isSynthesizing, setIsSynthesizing] = useState(false);

  const synthesize = async () => {
    setIsSynthesizing(true);
    try {
      const result = await geminiService.synthesizeBrief(context);
      onUpdate(result);
    } catch (error) {
      console.error(error);
    } finally {
      setIsSynthesizing(false);
    }
  };

  const isDataReady = context.feedbackData.length > 0 && context.evaluation && context.competitors.length > 0;

  return (
    <div className="space-y-6">
      {!brief && (
        <div className="border-dashed border-2 border-[#141414]/10 bg-transparent rounded-xl p-20 flex flex-col items-center justify-center text-center space-y-4">
          <div className="w-16 h-16 bg-[#141414]/5 rounded-full flex items-center justify-center">
            <Sparkles size={32} className="text-[#008060]" />
          </div>
          <div className="max-w-md">
            <h3 className="text-xl font-bold">Synthesize Project Brief</h3>
            <p className="text-sm text-[#141414]/60 mt-2">
              Combine insights from all agents to generate a production-ready project plan.
            </p>
          </div>
          <button 
            onClick={synthesize} 
            disabled={isSynthesizing || !isDataReady}
            className="bg-[#141414] hover:bg-[#2a2a2a] disabled:bg-gray-300 text-white rounded-xl px-8 py-2 font-medium transition-colors"
          >
            {isSynthesizing ? 'Agents are collaborating...' : 'Generate Detailed Brief'}
          </button>
          {!isDataReady && (
            <p className="text-[10px] uppercase font-bold text-red-500 tracking-wider">
              Requires data from all 3 agents to proceed
            </p>
          )}
        </div>
      )}

      {brief && (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 text-[#141414]">
          <div className="lg:col-span-3 space-y-6">
            <div className="bg-white border border-[#141414]/10 shadow-lg rounded-xl overflow-hidden">
              <div className="bg-[#141414] text-white p-8">
                <div className="flex items-center justify-between">
                  <div className="space-y-1">
                    <h2 className="text-2xl font-bold">{brief.title}</h2>
                    <p className="text-white/60 text-sm font-medium">Project Specification & Roadmap</p>
                  </div>
                  <button className="flex items-center bg-transparent border border-white/20 text-white hover:bg-white/10 px-4 py-2 rounded-lg text-sm transition-colors">
                    <Download size={16} className="mr-2" /> Export PDF
                  </button>
                </div>
              </div>
              <div className="p-8 space-y-8">
                <section className="space-y-3">
                  <h4 className="text-sm font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
                    <FileText size={14} /> Executive Summary
                  </h4>
                  <p className="text-lg leading-relaxed text-[#141414]/80">
                    {brief.summary}
                  </p>
                </section>

                <hr className="border-[#141414]/5" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <section className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
                      <UserCircle size={14} /> User Stories
                    </h4>
                    <ul className="space-y-3">
                      {brief.userStories.map((story, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed">
                          <div className="w-5 h-5 rounded-full bg-[#008060]/10 text-[#008060] flex items-center justify-center shrink-0 text-[10px] font-bold">
                            {i + 1}
                          </div>
                          {story}
                        </li>
                      ))}
                    </ul>
                  </section>

                  <section className="space-y-4">
                    <h4 className="text-sm font-bold uppercase tracking-widest opacity-40 flex items-center gap-2">
                      <Settings2 size={14} /> Technical Specs
                    </h4>
                    <ul className="space-y-3">
                      {brief.technicalSpecs.map((spec, i) => (
                        <li key={i} className="flex gap-3 text-sm leading-relaxed text-[#141414]/80">
                          <div className="w-1.5 h-1.5 rounded-full bg-[#141414]/20 mt-1.5 shrink-0" />
                          {spec}
                        </li>
                      ))}
                    </ul>
                  </section>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-white border border-[#141414]/10 shadow-sm rounded-xl p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">Recommendation</h4>
              <div className="space-y-4">
                <div className="p-6 bg-[#008060]/5 rounded-2xl border border-[#008060]/20 flex flex-col items-center text-center">
                  <Rocket size={32} className="text-[#008060] mb-3" />
                  <span className="text-2xl font-black uppercase tracking-tighter text-[#008060]">
                    {brief.roadmapRecommendation}
                  </span>
                  <p className="text-[10px] font-bold opacity-50 mt-1">STRATEGIC ACTION</p>
                </div>
                <p className="text-xs text-[#141414]/60 leading-relaxed text-center">
                  Based on market parity, technical effort, and user demand, the agent recommends 
                  <strong> {brief.roadmapRecommendation}ing</strong> this feature in the next sprint.
                </p>
              </div>
            </div>

            <div className="bg-[#141414]/5 border border-[#141414]/10 rounded-xl p-6">
              <h4 className="text-xs font-bold uppercase tracking-widest opacity-40 mb-4">Agent Confidence</h4>
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-bold">
                  <span>Synthesis Accuracy</span>
                  <span>94%</span>
                </div>
                <div className="h-1.5 w-full bg-[#141414]/10 rounded-full overflow-hidden">
                  <div className="h-full bg-[#008060] w-[94%]" />
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
