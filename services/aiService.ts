import { GoogleGenAI, Modality } from "@google/genai";
import { CodeReviewResult, CodeRewriteResult, TerminalOutput, ChatMessage } from "../types";

const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

/**
 * Safely get API keys from the defined process.env
 */
const getGroqKey = () => (process.env as any).GROQ_API_KEY || "";
const getGeminiKey = () => (process.env as any).GEMINI_API_KEY || "";

/**
 * Executes a Groq API call with optional streaming
 */
async function groqChat(
  messages: any[], 
  model: string = "llama-3.3-70b-versatile",
  jsonMode: boolean = false
) {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error("Groq API Key is missing. Check your .env file.");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.2,
      response_format: jsonMode ? { type: "json_object" } : undefined
    })
  });

  if (!response.ok) {
    const err = await response.json();
    throw new Error(err.error?.message || "Groq API Error");
  }

  return response.json();
}

export const analyzeCode = async (
  code: string, 
  language: string, 
  focus: string[]
): Promise<CodeReviewResult> => {
  const prompt = `You are a helpful Senior Software Engineer. Perform a clear and thorough analysis of this ${language} code.
  Return a JSON object with:
  1. "markdown": string (Full analysis in Markdown with ## headers)
  2. "counts": object (e.g. {"Critical Issues": 0, "High Priority": 1, ...})
  3. "suggestions": array of objects {severity: string, line: number, issue: string, recommendation: string}

  CODE:
  ${code}`;

  const result = await groqChat([
    { role: "system", content: "You are a specialized code analysis agent that outputs strictly valid JSON." },
    { role: "user", content: prompt }
  ], "llama-3.3-70b-versatile", true);

  const content = result.choices[0].message.content;
  return JSON.parse(content);
};

export const rewriteCode = async (
  code: string, 
  language: string,
  onChunk: (text: string) => void
): Promise<CodeRewriteResult> => {
  const prompt = `Rewrite the following ${language} code to be cleaner, faster, and easier to maintain.
  Provide a summary of changes first, then the rewritten code.
  
  CODE:
  ${code}`;

  const result = await groqChat([
    { role: "system", content: "You are a Senior Principal Developer. Refactor code and provide clear explanations." },
    { role: "user", content: prompt }
  ], "llama-3.3-70b-versatile");

  const fullText = result.choices[0].message.content;
  onChunk(fullText);

  const parts = fullText.split('---');
  const summary = parts[0].trim();
  const codeMatch = fullText.match(/```[\s\S]*?\n([\s\S]*?)\n```/);
  const rewrittenCode = codeMatch ? codeMatch[1].trim() : (parts.length > 1 ? parts[1].trim() : fullText.trim());

  return { 
    summary, 
    rewrittenCode,
    improvements: summary.split('\n').filter((l: string) => l.trim().length > 5).slice(0, 5),
    explanation: fullText
  };
};

export const runSimulatedCode = async (code: string, language: string): Promise<TerminalOutput> => {
  const isWeb = ['html', 'css', 'svg', 'xml'].includes(language.toLowerCase());
  const prompt = `Predict the output of this ${language} code.
  Return JSON with "stdout" and "stderr".
  ${isWeb ? "For web code, stdout must be full HTML for an iframe." : ""}
  CODE:
  ${code}`;

  const result = await groqChat([
    { role: "system", content: "You are a code execution simulator. Output JSON." },
    { role: "user", content: prompt }
  ], "llama-3.1-8b-instant", true);

  return JSON.parse(result.choices[0].message.content);
};

export const chatWithAssistant = async (
  message: string, 
  currentCode: string, 
  history: ChatMessage[],
  onChunk: (text: string) => void
): Promise<string> => {
  const apiKey = getGroqKey();
  if (!apiKey) throw new Error("Groq API Key is missing.");

  const response = await fetch(GROQ_API_URL, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: `You are a helpful coding assistant. Context: ${currentCode}` },
        ...history.map(m => ({ role: m.role === 'model' ? 'assistant' : 'user', content: m.text })),
        { role: "user", content: message }
      ],
      stream: true
    })
  });

  if (!response.ok) throw new Error("Assistant stream failed");

  const reader = response.body?.getReader();
  const decoder = new TextDecoder();
  let fullText = "";

  while (true) {
    const { done, value } = await reader!.read();
    if (done) break;
    
    const chunk = decoder.decode(value);
    const lines = chunk.split('\n').filter(line => line.trim() !== '');
    
    for (const line of lines) {
      if (line.includes('[DONE]')) break;
      if (line.startsWith('data: ')) {
        try {
          const json = JSON.parse(line.replace('data: ', ''));
          const content = json.choices[0]?.delta?.content || "";
          fullText += content;
          onChunk(fullText);
        } catch (e) {}
      }
    }
  }

  return fullText;
};

export const generateSpeech = async (text: string): Promise<string | undefined> => {
  const apiKey = getGeminiKey();
  if (!apiKey) return undefined;

  const ai = new GoogleGenAI({ apiKey });
  const cleanText = text
    .replace(/#+\s/g, '')
    .replace(/\*+/g, '')
    .replace(/`{1,3}[\s\S]*?`{1,3}/g, 'Code block omitted.')
    .substring(0, 1000);

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash-preview-tts",
    contents: [{ parts: [{ text: cleanText }] }],
    config: {
      responseModalities: [Modality.AUDIO],
      speechConfig: {
        voiceConfig: {
          prebuiltVoiceConfig: { voiceName: 'Kore' },
        },
      },
    },
  });
  return response.candidates?.[0]?.content?.parts?.[0]?.inlineData?.data;
};