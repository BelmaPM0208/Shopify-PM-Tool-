import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const geminiService = {
  async analyzeFeedback(reviews: string, tickets: string) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Analyze the following Shopify app reviews and support tickets. 
      Categorize them into "Pain Points" and "Feature Requests".
      Reviews: ${reviews}
      Tickets: ${tickets}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              type: { type: Type.STRING, enum: ["pain-point", "feature-request"] },
              content: { type: Type.STRING },
              source: { type: Type.STRING, enum: ["review", "ticket"] },
              sentiment: { type: Type.STRING, enum: ["positive", "neutral", "negative"] },
              frequency: { type: Type.NUMBER }
            },
            required: ["type", "content", "source", "sentiment", "frequency"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  async evaluateFeature(featureName: string, featureDescription: string) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Evaluate the following feature idea for a Shopify app:
      Name: ${featureName}
      Description: ${featureDescription}
      
      Research Shopify API documentation to see if it's technically possible.
      Estimate complexity and market positioning.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            feasibility: {
              type: Type.OBJECT,
              properties: {
                isPossible: { type: Type.BOOLEAN },
                technicalNotes: { type: Type.STRING },
                apiEndpoints: { type: Type.ARRAY, items: { type: Type.STRING } }
              },
              required: ["isPossible", "technicalNotes", "apiEndpoints"]
            },
            estimation: {
              type: Type.OBJECT,
              properties: {
                loc: { type: Type.NUMBER },
                complexity: { type: Type.STRING, enum: ["low", "medium", "high"] },
                effortDays: { type: Type.NUMBER }
              },
              required: ["loc", "complexity", "effortDays"]
            },
            market: {
              type: Type.OBJECT,
              properties: {
                isTableStakes: { type: Type.BOOLEAN },
                isDifferentiator: { type: Type.BOOLEAN }
              },
              required: ["isTableStakes", "isDifferentiator"]
            },
            riceScore: {
              type: Type.OBJECT,
              properties: {
                reach: { type: Type.NUMBER },
                impact: { type: Type.NUMBER },
                confidence: { type: Type.NUMBER },
                effort: { type: Type.NUMBER }
              },
              required: ["reach", "impact", "confidence", "effort"]
            }
          },
          required: ["feasibility", "estimation", "market", "riceScore"]
        }
      }
    });
    return JSON.parse(response.text);
  },

  async mapCompetitors(category: string, featureName: string) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Browse the Shopify App Store for the category "${category}".
      Check if top-ranking competitors have the feature: "${featureName}".`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              hasFeature: { type: Type.BOOLEAN },
              notes: { type: Type.STRING }
            },
            required: ["name", "hasFeature", "notes"]
          }
        }
      }
    });
    return JSON.parse(response.text);
  },

  async synthesizeBrief(data: any) {
    const response = await ai.models.generateContent({
      model: "gemini-2.0-flash",
      contents: `Synthesize the following data into a detailed project brief for a Shopify app feature:
      ${JSON.stringify(data)}`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            title: { type: Type.STRING },
            summary: { type: Type.STRING },
            userStories: { type: Type.ARRAY, items: { type: Type.STRING } },
            technicalSpecs: { type: Type.ARRAY, items: { type: Type.STRING } },
            roadmapRecommendation: { type: Type.STRING, enum: ["build", "buy", "defer"] }
          },
          required: ["title", "summary", "userStories", "technicalSpecs", "roadmapRecommendation"]
        }
      }
    });
    return JSON.parse(response.text);
  }
};
