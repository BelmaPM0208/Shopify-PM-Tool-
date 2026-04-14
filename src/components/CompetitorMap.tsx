import { useState } from 'react';
import { Target, ShieldCheck, ShieldAlert, ExternalLink, Info } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
      <Card className="border-[#141414]/10 shadow-sm">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Target size={18} className="text-[#008060]" />
            Market Intelligence Agent
          </CardTitle>
          <CardDescription>Analyze top competitors in your category to see if they offer this feature.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-50">App Category</label>
              <Input 
                placeholder="e.g. Upsell & Cross-sell" 
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="rounded-xl border-[#141414]/10"
              />
            </div>
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-wider opacity-50">Feature to Check</label>
              <Input 
                placeholder="e.g. Multi-currency support" 
                value={featureName}
                onChange={(e) => setFeatureName(e.target.value)}
                className="rounded-xl border-[#141414]/10"
              />
            </div>
          </div>
          <Button 
            onClick={map} 
            disabled={isMapping || !category || !featureName}
            className="w-full bg-[#008060] hover:bg-[#006e52] text-white rounded-xl"
          >
            {isMapping ? 'Scanning Competitors...' : 'Map Feature Parity'}
          </Button>
        </CardContent>
      </Card>

      {competitors.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {competitors.map((comp, i) => (
            <Card key={i} className="border-[#141414]/10 shadow-sm hover:border-[#008060]/30 transition-all group">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-bold">{comp.name}</CardTitle>
                  <ExternalLink size={14} className="opacity-0 group-hover:opacity-30 transition-opacity" />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  {comp.hasFeature ? (
                    <Badge className="bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-100">
                      <ShieldCheck size={12} className="mr-1" /> Table Stakes
                    </Badge>
                  ) : (
                    <Badge className="bg-purple-100 text-purple-700 border-purple-200 hover:bg-purple-100">
                      <ShieldAlert size={12} className="mr-1" /> Differentiator
                    </Badge>
                  )}
                </div>
                <p className="text-xs text-[#141414]/70 leading-relaxed italic">
                  "{comp.notes}"
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {competitors.length > 0 && (
        <Card className="bg-[#141414] text-white border-none">
          <CardContent className="py-6 flex items-center gap-4">
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
          </CardContent>
        </Card>
      )}
    </div>
  );
}
