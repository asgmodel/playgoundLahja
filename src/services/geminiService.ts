
import { GoogleGenAI, Modality, GenerateContentParameters } from "@google/genai";
import { getSystemInstruction } from "../constants";
import { Dialect, Attachment } from "../types";

export const generateResponse = async (
  prompt: string, 
  dialect: Dialect, 
  history: {role: string, content: string}[],
  attachments?: Attachment[]
) => {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyDxrNd76neH2rhBEczqQBKIt9aglOZ2wVw" });
  
  const contents: any[] = history.map(h => ({
    role: h.role === 'user' ? 'user' : 'model',
    parts: [{ text: h.content }]
  }));
  
  const parts: any[] = [{ text: prompt }];
  
  if (attachments && attachments.length > 0) {
    attachments.forEach(file => {
      if (file.type.startsWith('image/')) {
        parts.push({
          inlineData: {
            mimeType: file.type,
            data: file.data.split(',')[1] // remove data:image/png;base64,
          }
        });
      }
    });
  }

  contents.push({ role: 'user', parts });

  const params: GenerateContentParameters = {
    model: "gemini-3-flash-preview",
    contents,
    config: {
      systemInstruction: getSystemInstruction(dialect),
      temperature: 0.7,
    },
  };

  try {
    const response = await ai.models.generateContent(params);
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw new Error("حدث خطأ أثناء التواصل مع المساعد. يرجى المحاولة مرة أخرى.");
  }
};

export const generateAudio = async (text: string, voiceName: string = 'Kore') => {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyDxrNd76neH2rhBEczqQBKIt9aglOZ2wVw" });
  
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash-preview-tts",
      contents: [{ parts: [{ text }] }],
      config: {
        responseModalities: [Modality.AUDIO],
        speechConfig: {
          voiceConfig: {
            prebuiltVoiceConfig: { voiceName },
          },
        },
      },
    });

    return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
  } catch (error) {
    console.error("Gemini TTS Error:", error);
    return null;
  }
};
