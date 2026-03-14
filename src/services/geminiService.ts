import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });

export interface ProductRecommendation {
  title: string;
  description: string;
  price: number;
  originalPrice: number;
  source: string;
  reasoning: string;
}

export interface SearchResultData {
  summary: string;
  topSuggestion: ProductRecommendation;
  otherProducts: ProductRecommendation[];
  relatedTopics: string[];
}

export async function getSearchResults(query: string): Promise<SearchResultData> {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `You are an AI shopping assistant. The user is searching for: "${query}". 
      Provide a helpful summary, a top recommended product, 2 other good product options, and 4 related search topics.
      Make the prices realistic for the Indian market (in INR).`,
      config: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: {
              type: Type.STRING,
              description: 'A helpful 2-3 sentence summary of what to look for when buying this item.'
            },
            topSuggestion: {
              type: Type.OBJECT,
              properties: {
                title: { type: Type.STRING },
                description: { type: Type.STRING },
                price: { type: Type.NUMBER },
                originalPrice: { type: Type.NUMBER },
                source: { type: Type.STRING, description: 'e.g., Amazon.in, Flipkart, Myntra' },
                reasoning: { type: Type.STRING, description: 'Why this is the top suggestion' }
              },
              required: ['title', 'description', 'price', 'originalPrice', 'source', 'reasoning']
            },
            otherProducts: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  title: { type: Type.STRING },
                  description: { type: Type.STRING },
                  price: { type: Type.NUMBER },
                  originalPrice: { type: Type.NUMBER },
                  source: { type: Type.STRING },
                  reasoning: { type: Type.STRING }
                },
                required: ['title', 'description', 'price', 'originalPrice', 'source', 'reasoning']
              },
              description: 'Exactly 2 other product options'
            },
            relatedTopics: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: 'Exactly 4 related search topics or questions'
            }
          },
          required: ['summary', 'topSuggestion', 'otherProducts', 'relatedTopics']
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as SearchResultData;
    }
    throw new Error('No response text from Gemini');
  } catch (error) {
    console.error('Error fetching from Gemini:', error);
    // Return fallback data
    return {
      summary: "Finding quality items in this range is easier than ever with ongoing seasonal sales. While premium performance brands usually start higher, there are great entry-level options available that offer the best value.",
      topSuggestion: {
        title: "Adidas Adisun Slides",
        description: "Durable, lightweight slides currently at their lowest price this month.",
        price: 899,
        originalPrice: 1499,
        source: "Adidas India",
        reasoning: "Based on your history and current price drops."
      },
      otherProducts: [
        {
          title: "Sparx Men's Running Shoes",
          description: "4.2 ★ (12,400+ reviews)",
          price: 945,
          originalPrice: 1299,
          source: "Amazon.in",
          reasoning: "Highly rated budget option"
        },
        {
          title: "Bata Men's Canvas Sneakers",
          description: "4.5 ★ (800+ reviews)",
          price: 799,
          originalPrice: 999,
          source: "Myntra",
          reasoning: "Classic style with good durability"
        }
      ],
      relatedTopics: [
        "Sports shoes for daily wear",
        "Maintenance of budget shoes",
        "Upcoming Amazon Sales 2024",
        "Best running shoes for flat feet"
      ]
    };
  }
}
