import { GoogleGenAI } from "@google/genai";
import { FeedbackData } from "../types";

// Always use the required initialization format: new GoogleGenAI({ apiKey: process.env.API_KEY })
const apiKey = process.env.API_KEY;
const ai = apiKey ? new GoogleGenAI({ apiKey }) : null;

export const aiService = {
  async analyzeSentiment(text: string): Promise<'Positive' | 'Neutral' | 'Negative'> {
    // Rely exclusively on process.env.API_KEY as per guidelines
    if (!text.trim() || !ai) return 'Neutral';

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `Analyze the sentiment of this customer feedback: "${text}". Return only one word: Positive, Neutral, or Negative.`,
      });
      // response.text is a property, do not call it as a method text()
      const result = response.text?.trim() || '';
      if (result.includes('Positive')) return 'Positive';
      if (result.includes('Negative')) return 'Negative';
      return 'Neutral';
    } catch (error) {
      console.error("AI Sentiment Error:", error);
      return 'Neutral';
    }
  },

  async generateInsights(feedbacks: FeedbackData[]): Promise<string> {
    if (feedbacks.length === 0) return "No data available for analysis.";
    if (!ai) return "AI Insights unavailable: Missing API Key.";

    const feedbackSummary = feedbacks
      .map(f => `- Guest ${f.guestInfo.name}: ${f.suggestions} (Overall: ${f.overallExperience})`)
      .join('\n');

    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: `
          Analyze the following customer feedback from a South Asia Regional Manufacturing Summit event. 
          Provide a concise executive summary identifying:
          1. Key strengths
          2. Top 3 areas for improvement
          3. A strategic recommendation.
          
          Feedback data:
          ${feedbackSummary}
        `,
      });
      // response.text is a property, not a method
      return response.text || "No insights could be generated at this time.";
    } catch (error) {
      console.error("AI Insight Error:", error);
      return "Unable to generate insights at this time.";
    }
  }
};