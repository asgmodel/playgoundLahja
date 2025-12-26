import { GoogleGenAI, Modality, GenerateContentParameters } from "@google/genai";
import { getSystemInstruction } from "../constants";
import { Dialect, Attachment } from "../types";

export const generateResponse2 = async (
  prompt: string, 
  dialect: Dialect, 
  history: {role: string, content: string}[],
  attachments?: Attachment[]
) => {
  const ai = new GoogleGenAI({ apiKey: "AIzaSyBj0cZQFzmLCprC7CIOE2v2qnicLoa9HT4" });
  
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
export const generateResponse = async (
  prompt: string,
  dialect: Dialect,
  history: { role: string; content: string }[],
  attachments?: Attachment[]
): Promise<string> => {
  // Your Azure endpoint and key (consider moving to environment variables)
  const AZURE_ENDPOINT = "https://lahja-dev-resource.openai.azure.com";
  const AZURE_API_KEY = "4AwsIf87cyBIgaJVsy0phWUQdZFcbrJxpQBDQNzL4xjcP2MFzrrYJQQJ99BIACHYHv6XJ3w3AAAAACOGYrzM";
  const DEPLOYMENT_NAME = "Wasm-V1";
  const API_VERSION = "2025-01-01-preview";

  // 1. Build the messages array in OpenAI format
  const messages: any[] = [];

  // Add system instruction from dialect
  const systemInstruction = getSystemInstruction(dialect);
  if (systemInstruction) {
    messages.push({
      role: "system",
      content: systemInstruction,
    });
  }

  // Convert conversation history
  history.forEach((h) => {
    messages.push({
      role: h.role === "user" ? "user" : "assistant",
      content: h.content,
    });
  });

  // Handle the current prompt with possible image attachments
  const userMessageContent: any[] = [{ type: "text", text: prompt }];

  if (attachments && attachments.length > 0) {
    attachments.forEach((file) => {
      if (file.type.startsWith("image/")) {
        // Format image for OpenAI-compatible API
        userMessageContent.push({
          type: "image_url",
          image_url: {
            url: file.data, // base64 string with data URI prefix
          },
        });
      }
      // Add handlers for other file types (audio, video) if needed
    });
  }

  // Add the final user message
  messages.push({
    role: "user",
    content: userMessageContent,
  });

  // 2. Prepare the request body for OpenAI Chat Completions API
  const requestBody = {
    messages: messages,
    max_tokens: 16384,
    temperature: 0.7, // Kept your original temperature
    top_p: 1,
    model: DEPLOYMENT_NAME,
  };

  const url = `${AZURE_ENDPOINT}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${AZURE_API_KEY}`,
      },
      body: JSON.stringify(requestBody),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Azure OpenAI API Error:", {
        status: response.status,
        statusText: response.statusText,
        body: errorText,
      });
      throw new Error(`API request failed: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    // Extract the response text
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error communicating with Azure OpenAI:", error);
    throw new Error("حدث خطأ أثناء التواصل مع المساعد. يرجى المحاولة مرة أخرى.");
  }
};
export const generateAudio2 = async (text: string, voiceName: string = 'Kore') => {
  // إعدادات Azure TTS
  const ttsEndpoint = "https://lahja-dev-resource.cognitiveservices.azure.com/openai/deployments/LAHJA-V1/audio/speech?api-version=2025-03-01-preview";
  const apiKey = "4AwsIf87cyBIgaJVsy0phWUQdZFcbrJxpQBDQNzL4xjcP2MFzrrYJQQJ99BIACHYHv6XJ3w3AAAAACOGYrzM";
  
  // إعدادات TTS (يمكن تعديلها حسب الحاجة)
  const ttsConfig = {
    deployment: "LAHJA-V1",
    voice: voiceName, // يمكن تعديل الصوت حسب الرغبة
    speechSpeed: 1.0, // سرعة الصوت (1.0 = سرعة عادية)
  };

  try {
    // بناء request body مع جميع المعلمات المطلوبة
    const requestBody = {
      model: ttsConfig.deployment,
      input: text,
      voice: ttsConfig.voice,
      speed: ttsConfig.speechSpeed,
      response_format: "mp3"
    };

    console.log('طلب TTS:', {
      endpoint: ttsEndpoint,
      body: requestBody
    });

    const ttsResponse = await fetch(ttsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!ttsResponse.ok) {
      let errorText = await ttsResponse.text();
      console.error('تفاصيل الخطأ:', errorText);

      try {
        const errorJson = JSON.parse(errorText);
        errorText = errorJson.error?.message || errorText;
      } catch (e) {
        // الحفاظ على النص الأصلي للخطأ
      }
      throw new Error(`خطأ في خدمة الصوت (${ttsResponse.status}): ${errorText}`);
    }

    const audioBlob = await ttsResponse.blob();
    
    // تحويل Blob إلى base64 إذا كنت بحاجة لذلك
    // أو يمكنك إرجاع Blob مباشرة حسب احتياجاتك
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64data = reader.result as string;
        resolve(base64data.split(',')[1]); // إرجاع البيانات بدون prefix
      };
      reader.onerror = reject;
      reader.readAsDataURL(audioBlob);
    });

  } catch (error) {
    console.error("Azure TTS Error:", error);
    // يمكنك إرجاع null أو رمي خطأ حسب احتياجاتك
    throw new Error("حدث خطأ أثناء توليد الصوت. يرجى المحاولة مرة أخرى.");
  }
};

// بديل: إذا كنت تريد إرجاع Blob مباشرة
export const generateAudio = async (text: string, voiceName: string = 'Kore') => {
  const ttsEndpoint = "https://lahja-dev-resource.cognitiveservices.azure.com/openai/deployments/LAHJA-V1/audio/speech?api-version=2025-03-01-preview";
  const apiKey = "4AwsIf87cyBIgaJVsy0phWUQdZFcbrJxpQBDQNzL4xjcP2MFzrrYJQQJ99BIACHYHv6XJ3w3AAAAACOGYrzM";
  
  const requestBody = {
    model: "LAHJA-V1",
    input: text,
    voice: 'onyx',
    speed: 0.9,
    response_format: "mp3"
  };

  try {
    const ttsResponse = await fetch(ttsEndpoint, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`
      },
      body: JSON.stringify(requestBody)
    });

    if (!ttsResponse.ok) {
      const errorText = await ttsResponse.text();
      throw new Error(`Azure TTS Error: ${errorText}`);
    }
    const audioBlob = await ttsResponse.blob();

                    if (audioBlob.size === 0) {
                        throw new Error('تم استقبال ملف صوتي فارغ');
                    }
    // const audioUrl = URL.createObjectURL(audioBlob);

    return audioBlob;
  } catch (error) {
    console.error("Azure TTS Error:", error);
    throw error;
  }
};
