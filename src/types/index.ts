
export interface FeedbackItem {
  id: string;
  type: 'pain-point' | 'feature-request';
  content: string;
  source: 'review' | 'ticket';
  sentiment: 'positive' | 'neutral' | 'negative';
  frequency: number;
}

export interface FeatureEvaluation {
  id: string;
  name: string;
  description: string;
  feasibility: {
    isPossible: boolean;
    technicalNotes: string;
    apiEndpoints: string[];
  };
  estimation: {
    loc: number;
    complexity: 'low' | 'medium' | 'high';
    effortDays: number;
  };
  market: {
    competitors: CompetitorFeature[];
    isTableStakes: boolean;
    isDifferentiator: boolean;
  };
  riceScore: {
    reach: number;
    impact: number;
    confidence: number;
    effort: number;
    total: number;
  };
}

export interface CompetitorFeature {
  name: string;
  hasFeature: boolean;
  notes: string;
}

export interface ProjectBrief {
  title: string;
  summary: string;
  userStories: string[];
  technicalSpecs: string[];
  roadmapRecommendation: 'build' | 'buy' | 'defer';
}
