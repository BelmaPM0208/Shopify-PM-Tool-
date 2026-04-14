import React, { useState } from 'react';
import { Search, Upload, FileText, AlertCircle, CheckCircle2, TrendingUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
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
      // In a real app, we'd scrape the URL here. For now, we'll pass it to Gemini to "research"
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
        <Card className="border-[#141414]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Search size={18} className="text-[#008060]" />
              Shopify Store Scanner
            </CardTitle>
            <CardDescription>Enter your app's Shopify App Store URL to analyze reviews.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input 
              placeholder="https://apps.shopify.com/your-app" 
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="rounded-xl border-[#141414]/10 focus:ring-[#008060]"
            />
            <Button 
              onClick={() => analyze()} 
              disabled={isAnalyzing || !url}
              className="w-full bg-[#008060] hover:bg-[#006e52] text-white rounded-xl"
            >
              {isAnalyzing ? 'Scanning Store...' : 'Start Review Scan'}
            </Button>
          </CardContent>
        </Card>

        <Card className="border-[#141414]/10 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Upload size={18} className="text-[#008060]" />
              Support Ticket Import
            </CardTitle>
            <CardDescription>Upload a CSV of your support tickets for deep analysis.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
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
          </CardContent>
        </Card>
      </div>

      {isAnalyzing && (
        <Card className="border-[#008060]/20 bg-[#008060]/5">
          <CardContent className="py-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-bold text-[#008060] flex items-center gap-2">
                <TrendingUp size={16} className="animate-pulse" />
                Agent is analyzing feedback clusters...
              </span>
              <span className="text-xs font-mono">{progress}%</span>
            </div>
            <Progress value={progress} className="h-1.5 bg-[#008060]/10" />
          </CardContent>
        </Card>
      )}

      {data.length > 0 && (
        <Card className="border-[#141414]/10 shadow-sm overflow-hidden">
          <CardHeader className="bg-[#141414]/5">
            <CardTitle className="text-lg">Analysis Results</CardTitle>
            <CardDescription>Categorized pain points and feature requests from all sources.</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="hover:bg-transparent">
                  <TableHead className="w-[150px]">Category</TableHead>
                  <TableHead>Feedback Summary</TableHead>
                  <TableHead className="text-center">Source</TableHead>
                  <TableHead className="text-center">Sentiment</TableHead>
                  <TableHead className="text-right">Frequency</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((item, i) => (
                  <TableRow key={i} className="hover:bg-[#141414]/5">
                    <TableCell>
                      <Badge variant={item.type === 'pain-point' ? 'destructive' : 'default'} className="rounded-md">
                        {item.type === 'pain-point' ? 'Pain Point' : 'Feature Request'}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium">{item.content}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="outline" className="capitalize">{item.source}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {item.sentiment === 'negative' && <AlertCircle size={16} className="text-red-500 mx-auto" />}
                      {item.sentiment === 'positive' && <CheckCircle2 size={16} className="text-green-500 mx-auto" />}
                      {item.sentiment === 'neutral' && <div className="w-4 h-4 rounded-full bg-gray-300 mx-auto" />}
                    </TableCell>
                    <TableCell className="text-right font-mono">{item.frequency}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
