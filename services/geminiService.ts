
import { GoogleGenAI, Type } from "@google/genai";
import { BrainwaveData, WaveType } from '../types';

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY as string });

const responseSchema = {
  type: Type.OBJECT,
  properties: {
    mood: { type: Type.STRING, description: "A concise summary of the user's mood or goal, e.g., 'Deep Relaxation'." },
    waveType: { type: Type.STRING, description: "The type of brainwave. Must be one of: 'Delta', 'Theta', 'Alpha', 'Beta', 'Gamma'." },
    binauralBeat: { type: Type.NUMBER, description: "The target binaural beat frequency in Hz. Delta: 1-4, Theta: 4-8, Alpha: 8-12, Beta: 13-38, Gamma: 39-42." },
    baseFrequency: { type: Type.NUMBER, description: "A base carrier frequency in Hz for the binaural beat, between 100 and 500." },
    description: { type: Type.STRING, description: "A brief, encouraging explanation of what this brainwave frequency is good for." },
    color: { type: Type.STRING, description: "A hex color code (e.g., '#4A90E2') that visually represents the mood and wave type." }
  },
  required: ["mood", "waveType", "binauralBeat", "baseFrequency", "description", "color"]
};


export const analyzeMoodForWave = async (moodDescription: string): Promise<BrainwaveData> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: `Analyze the following user input and generate the corresponding brainwave data: "${moodDescription}"`,
      config: {
        systemInstruction: "You are a neuroscience assistant. Your task is to analyze the user's described mood or desired mental state and determine the most appropriate brainwave entrainment frequency to help them achieve it. You must respond ONLY with a JSON object matching the provided schema. Ensure the binauralBeat value is within the correct range for the chosen waveType.",
        responseMimeType: "application/json",
        responseSchema: responseSchema,
      },
    });

    const jsonString = response.text.trim();
    const parsedData = JSON.parse(jsonString) as BrainwaveData;
    
    // Validate WaveType enum
    if (!Object.values(WaveType).includes(parsedData.waveType)) {
        throw new Error(`Invalid wave type received: ${parsedData.waveType}`);
    }

    return parsedData;

  } catch (error) {
    console.error("Error calling Gemini API:", error);
    throw new Error("Failed to analyze mood. Please check your API key and try again.");
  }
};
