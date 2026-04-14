import { useState } from 'react';
import { Zap, Code, Terminal, BarChart3, Info, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
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
    { subject: 'Effort', A: 10 - evaluation.riceScore.effort, fullMark: 10 }, // Invert effort for radar
  ] : [];

  return (
    <div className="space-y-6">
      <Card className="border-[#141414]/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Zap size={18} className="text-[#008060]" />
            Technical & Impact Evaluator
          </CardTitle>
          <CardDescription>Input a feature idea to evaluate its technical feasibility and potential impact.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-50">Feature Name</label>
              <Input 
                placeholder="e.g. Multi-currency checkout widget" 
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                className="rounded-xl border-[#141414]/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-50">Description</label>
              <Input 
                placeholder="Briefly describe the value proposition..." 
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="rounded-xl border-[#141414]/10"
              />
            </div>
          </div>
          <Button 
            onClick={evaluate} 
            disabled={isEvaluating || !featureName}
            className="w-full bg-[#141414] hover:bg-[#2a2a2a] text-white rounded-xl"
          >
            {isEvaluating ? 'Evaluating Feasibility...' : 'Run Technical Evaluation'}
          </Button>
        </CardContent>
      </Card>

      {evaluation && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Feasibility Card */}
          <Card className="border-[#141414]/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Code size={16} />
                Feasibility
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2">
                {evaluation.feasibility.isPossible ? (
                  <Badge className="bg-green-100 text-green-700 border-green-200 hover:bg-green-100">
                    <CheckCircle2 size={12} className="mr-1" /> Possible
                  </Badge>
                ) : (
                  <Badge variant="destructive">
                    <XCircle size={12} className="mr-1" /> Not Possible
                  </Badge>
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
            </CardContent>
          </Card>

          {/* Estimation Card */}
          <Card className="border-[#141414]/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <Terminal size={16} />
                Estimation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-[#141414]/5 rounded-xl border border-[#141414]/10">
                  <span className="text-[10px] font-bold uppercase opacity-50 block mb-1">Complexity</span>
                  <span className="text-lg font-bold capitalize">{evaluation.estimation.complexity}</span>
                </div>
                <div className="p-3 bg-[#141414]/5 rounded-xl border border-[#141414]/10">
                  <span className="text-[10px] font-bold uppercase opacity-50 block mb-1">Effort</span>
                  <span className="text-lg font-bold">{evaluation.estimation.effortDays} Days</span>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-bold uppercase opacity-50">Estimated LOC</span>
                  <span className="text-xs font-mono font-bold">{evaluation.estimation.loc} lines</span>
                </div>
                <Progress value={(evaluation.estimation.loc / 5000) * 100} className="h-1 bg-[#141414]/10" />
              </div>
            </CardContent>
          </Card>

          {/* RICE Matrix */}
          <Card className="border-[#141414]/10 shadow-sm">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-bold uppercase tracking-wider flex items-center gap-2">
                <BarChart3 size={16} />
                RICE Matrix
              </CardTitle>
            </CardHeader>
            <CardContent className="h-[200px]">
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
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}
