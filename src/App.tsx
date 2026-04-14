/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  MessageSquare, 
  Zap, 
  Target, 
  FileText, 
  Settings,
  ChevronRight
} from 'lucide-react';
import FeedbackAnalysis from './components/FeedbackAnalysis';
import ImpactEvaluator from './components/ImpactEvaluator';
import CompetitorMap from './components/CompetitorMap';
import ProjectBriefView from './components/ProjectBriefView';
import { FeedbackItem, FeatureEvaluation, CompetitorFeature, ProjectBrief } from './types';

export default function App() {
  const [activeTab, setActiveTab] = useState('feedback');
  const [feedbackData, setFeedbackData] = useState<FeedbackItem[]>([]);
  const [evaluation, setEvaluation] = useState<FeatureEvaluation | null>(null);
  const [competitors, setCompetitors] = useState<CompetitorFeature[]>([]);
  const [brief, setBrief] = useState<ProjectBrief | null>(null);

  const sidebarItems = [
    { id: 'feedback', label: 'Feedback Agent', icon: MessageSquare },
    { id: 'impact', label: 'Impact Evaluator', icon: Zap },
    { id: 'competitors', label: 'Market Intelligence', icon: Target },
    { id: 'brief', label: 'Project Brief', icon: FileText },
  ];

  return (
    <div className="flex h-screen bg-[#F5F5F0] text-[#141414] font-sans">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#141414]/10 bg-white flex flex-col">
        <div className="p-6 border-bottom border-[#141414]/10">
          <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <div className="w-8 h-8 bg-[#008060] rounded-lg flex items-center justify-center text-white">
              <LayoutDashboard size={18} />
            </div>
            Architect
          </h1>
          <p className="text-[10px] uppercase tracking-widest font-semibold opacity-50 mt-1">
            Shopify PM Tool
          </p>
        </div>

        <nav className="flex-1 p-4 space-y-2">
          {sidebarItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
                activeTab === item.id 
                  ? 'bg-[#141414] text-white shadow-lg' 
                  : 'hover:bg-[#141414]/5 text-[#141414]/70'
              }`}
            >
              <item.icon size={18} />
              <span className="font-medium text-sm">{item.label}</span>
              {activeTab === item.id && (
                <motion.div layoutId="active-indicator" className="ml-auto">
                  <ChevronRight size={14} />
                </motion.div>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-[#141414]/10">
          <button className="w-full flex items-center gap-3 px-4 py-3 rounded-xl hover:bg-[#141414]/5 text-[#141414]/70 transition-all">
            <Settings size={18} />
            <span className="font-medium text-sm">Settings</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden flex flex-col">
        <header className="h-16 border-b border-[#141414]/10 bg-white flex items-center justify-between px-8">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium opacity-50">Dashboard</span>
            <ChevronRight size={14} className="opacity-30" />
            <span className="text-sm font-semibold">
              {sidebarItems.find(i => i.id === activeTab)?.label}
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-[#008060]/10 text-[#008060] rounded-full text-xs font-bold uppercase tracking-wider">
              <div className="w-2 h-2 bg-[#008060] rounded-full animate-pulse" />
              Agents Online
            </div>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto p-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
              className="max-w-6xl mx-auto"
            >
              {activeTab === 'feedback' && (
                <FeedbackAnalysis 
                  data={feedbackData} 
                  onUpdate={setFeedbackData} 
                />
              )}
              {activeTab === 'impact' && (
                <ImpactEvaluator 
                  evaluation={evaluation} 
                  onUpdate={setEvaluation} 
                />
              )}
              {activeTab === 'competitors' && (
                <CompetitorMap 
                  competitors={competitors} 
                  onUpdate={setCompetitors} 
                />
              )}
              {activeTab === 'brief' && (
                <ProjectBriefView 
                  brief={brief} 
                  onUpdate={setBrief}
                  context={{ feedbackData, evaluation, competitors }}
                />
              )}
            </motion.div>
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}
