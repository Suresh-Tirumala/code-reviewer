
import { GoogleGenAI, Type, Modality, ThinkingLevel } from "@google/genai";
import { CodeReviewResult, CodeRewriteResult, TerminalOutput, ChatMessage } from "../types";

let aiInstance: GoogleGenAI | null = null;

const getAI = () => {
  if (!aiInstance) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY is not set. Please ensure it is configured in your environment.");
    }
    aiInstance = new GoogleGenAI({ apiKey });
  }
  return aiInstance;
};

export const analyzeCode = async (
  code: string, 
  language: string, 
  focus: string[]
): Promise<CodeReviewResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `You are a helpful Senior Software Engineer. Perform a clear and thorough analysis of this ${language} code.

TASKS:
1. CODE OVERVIEW: Explain simply what this code does as if you were speaking to a colleague.
2. TARGETED FEEDBACK: For each area: ${focus.join(', ')}, provide a specific check. Point out exactly where improvements can be made.
3. STRUCTURED FINDINGS: Provide suggestions with severity levels and line numbers.

CODE TO ANALYZE:
---
${code}
---

Structure your Markdown output with clear headers for "Code Overview" and specific headers for each focus area. Avoid overly technical jargon unless necessary.`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          markdown: { 
            type: Type.STRING, 
            description: "Full analysis in Markdown. Include a # Code Overview and ## [Area] sections." 
          },
          counts: {
            type: Type.OBJECT,
            properties: {
              "Critical Issues": { type: Type.INTEGER },
              "High Priority": { type: Type.INTEGER },
              "Medium Priority": { type: Type.INTEGER },
              "Low Priority": { type: Type.INTEGER }
            }
          },
          suggestions: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                severity: { type: Type.STRING, enum: ["Critical Issues", "High Priority", "Medium Priority", "Low Priority"] },
                issue: { type: Type.STRING, description: "A short, clear title for the issue." },
                recommendation: { type: Type.STRING, description: "Plain-language instruction on how to fix it." },
                line: { type: Type.INTEGER, description: "The line number in the source code." }
              },
              required: ["severity", "issue", "recommendation"]
            }
          }
        },
        required: ["markdown", "counts", "suggestions"]
      }
    }
  });

  try {
    const text = response.text;
    if (!text) throw new Error("Empty response from AI");
    return JSON.parse(text);
  } catch (e) {
    console.error("Analysis Parse Error:", e);
    throw new Error("Failed to process analysis. Please check your network or try again.");
  }
};

export const rewriteCode = async (
  code: string, 
  language: string,
  onChunk: (text: string) => void
): Promise<CodeRewriteResult> => {
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Rewrite the following ${language} code to be cleaner, faster, and easier to maintain.
    Provide a summary of changes first, then the rewritten code.
    
    CODE:
    ${code}`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW }
    }
  });

  const fullText = response.text || "";
  onChunk(fullText);

  const parts = fullText.split('---');
  const summary = parts.length > 0 ? parts[0].trim() : "Code successfully optimized.";
  const codeMatch = fullText.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
  const rewrittenCode = codeMatch ? codeMatch[1].trim() : (parts.length > 1 ? parts[1].trim() : fullText.trim());

  return { 
    summary, 
    rewrittenCode,
    improvements: summary.split('\n').filter((l: string) => l.trim().length > 5).slice(0, 5),
    explanation: summary
  };
};

export const runSimulatedCode = async (code: string, language: string): Promise<TerminalOutput> => {
  const isWeb = ['html', 'css', 'svg', 'xml'].includes(language.toLowerCase());
  const ai = getAI();
  const response = await ai.models.generateContent({
    model: 'gemini-3-flash-preview',
    contents: `Predict the output of this ${language} code.
    
${isWeb ? "IMPORTANT: Since this is web-based code (HTML/CSS/SVG), the 'stdout' field MUST be a complete, self-contained HTML document (including <style> tags if needed) that can be rendered in an iframe to visualize the results. If only CSS is provided, create a sample HTML structure that uses those styles so the user can see them." : "Provide the expected terminal console output in the 'stdout' field."}

CODE:
${code}`,
    config: {
      thinkingConfig: { thinkingLevel: ThinkingLevel.LOW },
      responseMimeType: "application/json",
      responseSchema: {
        type: Type.OBJECT,
        properties: {
          stdout: { type: Type.STRING, description: isWeb ? "Full HTML code for preview" : "Terminal output" },
          stderr: { type: Type.STRING, description: "Any simulation errors" }
        },
        required: ["stdout", "stderr"]
      }
    }
  });

  try {
    return JSON.parse(response.text || '{"stdout": "", "stderr": ""}');
  } catch (e) {
    return { stdout: "", stderr: "Error predicting output." };
  }
};

export const chatWithAssistant = async (
  message: string, 
  currentCode: string, 
  history: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> => {
  const ai = getAI();
  const chat = ai.chats.create({
    model: 'gemini-3-flash-preview',
    config: {
      systemInstruction: `You are a helpful coding assistant. Use friendly, plain language. 
Current code you are discussing:
---
${currentCode}
---`
    }
  });

  const stream = await chat.sendMessageStream({ message });
  let fullText = "";
  for await (const chunk of stream) {
    fullText += chunk.text;
    onChunk(fullText);
  }
  return fullText;
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const ai = getAI();
  // Clean text to minimize token processing time and avoid "reading" markdown symbols
  const cleanText = text
    .replace(/#+\s/g, '') // Remove headers
    .replace(/\*+/g, '')  // Remove bold/italics
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, 'Code block omitted.') // Replace code blocks with placeholder for speed
    .substring(0, 1000); // Limit length for speed

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: cleanText }] }], // Minimal prompt
    config: {
      responseModalities: [Modality.AUDIO],
      // REMOVED: thinkingConfig, which is not supported for this model variant.
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};
