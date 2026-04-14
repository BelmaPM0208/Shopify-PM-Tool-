import React, { useState } from 'react';
import { Search, Upload, FileText, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { geminiService } from '@/lib/gemini';
import { FeedbackItem } from '@/types';
import Papa from 'papaparse';

interface Props {
  data: FeedbackItem[];
  onUpdate: (data: FeedbackItem[]) => void;
}

export default function FeedbackAnalysis({ data, onUpdate }: Props) {
  const [url, setUrl] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [progress, setProgress] = useState(0);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      complete: async (results) => {
        const text = JSON.stringify(results.data);
        await analyze(text);
      },
      header: true,
    });
  };

  const analyze = async (ticketsText: string = '') => {
    setIsAnalyzing(true);
    setProgress(20);
    try {
      setProgress(40);
      const results = await geminiService.analyzeFeedback(url, ticketsText);
      setProgress(100);
      onUpdate(results);
    } catch (error) {
      console.error(error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Shopify Scanner Card */}
        <div className="bg-white border border-[#141414]/10 shadow-sm rounded-xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Search size={18} className="text-[#008060]" />
              Shopify Store Scanner
            </h3>
            <p className="text-sm text-gray-500 mb-4">Enter your app's Shopify App Store URL to analyze reviews.</p>
            <div className="space-y-4">
              <input 
                type="text"
                placeholder="https://apps.shopify.com/your-app" 
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full px-4 py-2 rounded-xl border border-[#141414]/10 focus:ring-2 focus:ring-[#008060] outline-none transition-all"
              />
              <button 
                onClick={() => analyze()} 
                disabled={isAnalyzing || !url}
                className="w-full bg-[#008060] hover:bg-[#006e52] disabled:bg-gray-300 text-white rounded-xl py-2 font-medium transition-colors"
              >
                {isAnalyzing ? 'Scanning Store...' : 'Start Review Scan'}
              </button>
            </div>
          </div>
        </div>

        {/* Support Ticket Import Card */}
        <div className="bg-white border border-[#141414]/10 shadow-sm rounded-xl overflow-hidden">
          <div className="p-6">
            <h3 className="text-lg font-semibold flex items-center gap-2 mb-1">
              <Upload size={18} className="text-[#008060]" />
              Support Ticket Import
            </h3>
            <p className="text-sm text-gray-500 mb-4">Upload a CSV of your support tickets for deep analysis.</p>
            <div className="border-2 border-dashed border-[#141414]/10 rounded-xl p-8 flex flex-col items-center justify-center text-center hover:bg-[#141414]/5 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileUpload}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <FileText size={32} className="text-[#141414]/30 mb-2" />
              <p className="text-sm font-medium">Click to upload or drag and drop</p>
              <p className="text-xs opacity-50">CSV files only (max 10MB)</p>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar Section */}
      {isAnalyzing && (
        <div className="border border-[#008060]/20 bg-[#008060]/5 rounded-xl p-6">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-bold text-[#008060] flex items-center gap-2">
              <TrendingUp size={16} className="animate-pulse" />
              Agent is analyzing feedback clusters...
            </span>
            <span className="text-xs font-mono">{progress}%</span>
          </div>
          <div className="w-full h-1.5 bg-[#008060]/10 rounded-full overflow-hidden">
            <div 
              className="h-full bg-[#008060] transition-all duration-500" 
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      )}

      {/* Results Table */}
      {data.length > 0 && (
        <div className="border border-[#141414]/10 shadow-sm rounded-xl overflow-hidden bg-white">
          <div className="bg-[#141414]/5 p-6 border-b border-[#141414]/10">
            <h3 className="text-lg font-semibold">Analysis Results</h3>
            <p className="text-sm text-gray-500">Categorized pain points and feature requests from all sources.</p>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 border-b border-[#141414]/10 text-gray-600">
                <tr>
                  <th className="px-6 py-3 font-semibold w-[150px]">Category</th>
                  <th className="px-6 py-3 font-semibold">Feedback Summary</th>
                  <th className="px-6 py-3 font-semibold text-center">Source</th>
                  <th className="px-6 py-3 font-semibold text-center">Sentiment</th>
                  <th className="px-6 py-3 font-semibold text-right">Frequency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#141414]/10">
                {data.map((item, i) => (
                  <tr key={i} className="hover:bg-[#141414]/5 transition-colors">
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-md text-xs font-medium text-white ${item.type === 'pain-point' ? 'bg-red-500' : 'bg-blue-500'}`}>
                        {item.type === 'pain-point' ? 'Pain Point' : 'Feature Request'}
                      </span>
                    </td>
                    <td className="px-6 py-4 font-medium">{item.content}</td>
                    <td className="px-6 py-4 text-center">
                      <span className="px-2 py-1 border border-gray-300 rounded text-xs capitalize">{item.source}</span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      <div className="flex justify-center">
                        {item.sentiment === 'negative' && <AlertCircle size={16} className="text-red-500" />}
                        {item.sentiment === 'positive' && <CheckCircle2 size={16} className="text-green-500" />}
                        {item.sentiment === 'neutral' && <div className="w-4 h-4 rounded-full bg-gray-300" />}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right font-mono">{item.frequency}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
