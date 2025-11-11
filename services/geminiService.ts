import { GoogleGenAI, Type } from "@google/genai";
import { SlideContent } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const schema = {
  type: Type.ARRAY,
  items: {
    type: Type.OBJECT,
    properties: {
      title: {
        type: Type.STRING,
        description: 'A short, catchy title for the slide in Greek.'
      },
      description: {
        type: Type.STRING,
        description: 'A concise description for the slide in Greek, expanding on the title.'
      }
    },
    required: ['title', 'description']
  }
};

export const generateCarouselContent = async (topic: string): Promise<SlideContent[]> => {
  try {
    const prompt = `Generate content for a 10-slide Instagram carousel in Greek about the following topic: "${topic}".
    The structure should be:
    - Slide 1: An engaging title slide that grabs attention.
    - Slides 2-9: Each slide should present a key point, tip, or piece of information with a clear title and a short description.
    - Slide 10: A concluding slide with a strong call to action.
    
    The tone should be informative yet conversational, perfect for social media. Ensure the titles are short and powerful, and the descriptions are easy to read.
    Return the result as a JSON array of 10 objects, each with a "title" and a "description" key.`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
      },
    });

    const jsonText = response.text.trim();
    const slides = JSON.parse(jsonText);

    if (!Array.isArray(slides) || slides.length === 0) {
      throw new Error('Η AI επέστρεψε μη έγκυρη μορφή δεδομένων.');
    }
    
    if (!slides.every(s => typeof s.title === 'string' && typeof s.description === 'string')) {
      throw new Error('Η AI επέστρεψε δεδομένα με λανθασμένες ιδιότητες.');
    }

    return slides;
  } catch (error) {
    console.error("Error generating carousel content:", error);
    if (error instanceof SyntaxError) {
      throw new Error("Αποτυχία ανάλυσης της απάντησης της AI. Παρακαλώ δοκιμάστε ξανά.");
    }
    throw new Error("Παρουσιάστηκε σφάλμα κατά τη δημιουργία περιεχομένου με AI.");
  }
};