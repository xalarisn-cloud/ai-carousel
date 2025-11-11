import { GoogleGenAI, Type, Modality } from "@google/genai";
import { SlideContent } from '../types';

const API_KEY = process.env.API_KEY;
if (!API_KEY) {
  throw new Error("API_KEY environment variable not set");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const textModel = 'gemini-2.5-flash';
const imageModel = 'gemini-2.5-flash-image';

export async function generateCarouselContent(topic: string): Promise<SlideContent[]> {
  try {
    const response = await ai.models.generateContent({
      model: textModel,
      contents: `Δημιούργησε περιεχόμενο για ένα καρουζέλ 10 slides στο Instagram με θέμα: "${topic}". Το περιεχόμενο πρέπει να είναι ελκυστικό, σύντομο και ευανάγνωστο. Η απάντηση πρέπει να είναι αποκλειστικά στα ελληνικά.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            slides: {
              type: Type.ARRAY,
              description: 'An array of 10 slide objects.',
              items: {
                type: Type.OBJECT,
                properties: {
                  title: {
                    type: Type.STRING,
                    description: 'Ένας σύντομος, έντονος τίτλος για το slide στα ελληνικά.'
                  },
                  description: {
                    type: Type.STRING,
                    description: 'Μια σύντομη παράγραφος για το slide στα ελληνικά, περίπου 20-30 λέξεις.'
                  }
                },
                required: ['title', 'description']
              }
            }
          },
          required: ['slides']
        },
      },
    });

    const jsonText = response.text.trim();
    const result = JSON.parse(jsonText);

    if (result.slides && Array.isArray(result.slides) && result.slides.length > 0) {
      return result.slides;
    } else {
      throw new Error("Invalid response structure from Gemini API");
    }
  } catch (error) {
    console.error("Error generating carousel content:", error);
    throw new Error("Failed to generate content from AI. Please try again.");
  }
}

export async function generateBackgroundImage(topic: string): Promise<string> {
    try {
        const response = await ai.models.generateContent({
            model: imageModel,
            contents: {
                parts: [
                    { text: `Create a vibrant and professional, hyperrealistic, cinematic photograph representing the concept of "${topic}". Use vivid colors, high contrast, and a soft-focus background (bokeh effect) to make foreground elements pop. The image should be aesthetically pleasing and suitable for a high-quality social media post.` },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data;
            }
        }
        throw new Error('No image data found in response.');
    } catch (error) {
        console.error("Error generating background image:", error);
        throw new Error("Failed to generate background image from AI.");
    }
}

export async function editBackgroundImage(imageDataUrl: string, prompt: string): Promise<string> {
    try {
        const [header, base64Data] = imageDataUrl.split(',');
        if (!header || !base64Data) {
            throw new Error('Invalid image data URL format.');
        }

        const mimeTypeMatch = header.match(/:(.*?);/);
        if (!mimeTypeMatch || !mimeTypeMatch[1]) {
            throw new Error('Could not determine mime type from data URL.');
        }
        const mimeType = mimeTypeMatch[1];

        const response = await ai.models.generateContent({
            model: imageModel,
            contents: {
                parts: [
                    {
                        inlineData: {
                            data: base64Data,
                            mimeType: mimeType,
                        },
                    },
                    { text: prompt },
                ],
            },
            config: {
                responseModalities: [Modality.IMAGE],
            },
        });

        for (const part of response.candidates[0].content.parts) {
            if (part.inlineData) {
                return part.inlineData.data; 
            }
        }
        throw new Error('No edited image data found in response.');
    } catch (error) {
        console.error("Error editing background image:", error);
        throw new Error("Failed to edit background image with AI.");
    }
}