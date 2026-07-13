"use server";

import { DeepgramClient } from "@deepgram/sdk";
import { GoogleGenAI } from "@google/genai";

export async function transcribeAudioInitial(audioUrl: string) {
  try {
    const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY! });

    const response = await deepgram.listen.v1.media.transcribeUrl({
      url: audioUrl,
      model: "nova-2",
      language: "hi-Latn", // Native Hinglish support
      smart_format: true, // Adds punctuation and formatting
      utterances: true, // Detects pauses and creates paragraphs
    });

    const data = response as any;
    
    if (data?.results?.utterances) {
      const utterances = data.results.utterances;
      let transcriptParts = [];
      for (let i = 0; i < utterances.length; i++) {
        const u = utterances[i];
        if (i > 0) {
          const prev = utterances[i - 1];
          const gap = u.start - prev.end;
          if (gap >= 30) {
            transcriptParts.push("");
            transcriptParts.push("[--- LONG PAUSE ---]");
            transcriptParts.push("");
          }
        }
        // Capitalize first letter of utterance
        let line = u.transcript.trim();
        if (line.length > 0) {
            line = line.charAt(0).toUpperCase() + line.slice(1);
        }
        transcriptParts.push(line);
      }
      return { transcriptParts };
    } else {
      // Fallback
      return { fallback: data?.results?.channels[0]?.alternatives[0]?.transcript || "No transcript generated." };
    }
  } catch (error: any) {
    console.error("Deepgram Transcription Error:", error);
    throw new Error(`Transcription failed: ${error.message || "Unknown Error"}`);
  }
}

export async function fixTranscriptionChunk(chunk: string) {
  if (!process.env.GROQ_API_KEY) {
    return chunk;
  }
  
  try {
    const Groq = (await import("groq-sdk")).default;
    const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
    const prompt = `You are an expert transcriber and linguist specializing in technical subjects (like IT, networking, math). 
Fix the spelling and formatting mistakes in this Hinglish (Hindi written in Latin alphabet) transcript.
Format the output line-by-line exactly as provided. DO NOT combine into one giant paragraph. YOU MUST MATCH THE INPUT LINE COUNT EXACTLY.
DO NOT translate to English, keep the exact spoken Hinglish words.
DO NOT add any preamble, conversational text, or extra text. Output ONLY the fixed transcript line-by-line.

CRITICAL FIXES TO APPLY (DO THIS AGGRESSIVELY):
- ANY time format like "02:55", "02:56", "02:50" MUST be converted to numbers: "255", "256", "250".
- Convert spoken IP formatting: "1 dot 0" -> "1.0", "7 dot 255" -> "7.255", "16 dot 20" -> "16.20".
- Translate phonetic errors into proper English networking terms in the Hinglish sentences:
  - "mass" or "marks" -> "mask"
  - "us address", "hosh", "os", "hopes" -> "host" or "host address"
  - "us side" -> "host side"
  - "subnect", "subnete", "subnedh" -> "subnet"
  - "scene" (when used as a number) -> "teen" (3)
  - "slash" followed by a number -> "/24", "/29", etc.
  - "2 ja" or "to ja" -> "2 power" or "2 raised to"
- Do NOT rewrite the sentences in English. Keep the Hinglish (Hindi words in Latin) intact, only fix the technical terms and numbers!

EXAMPLES:
Input:
Toh yaha par humara pass 192 dot 168 dot 1 dot 0
Iska subnedh mass kya hoga?
02:55 dot 255 dot 0

Output:
Toh yaha par humara pass 192.168.1.0
Iska subnet mask kya hoga?
255.255.255.0`;
    
    const aiRes = await groq.chat.completions.create({
      model: "llama-3.3-70b-versatile",
      messages: [
        { role: "system", content: prompt },
        { role: "user", content: chunk }
      ],
      temperature: 0.1,
    });
    return aiRes.choices[0]?.message?.content?.trim() || chunk;
  } catch (err) {
    console.error("Groq chunk error:", err);
    return chunk;
  }
}

export async function generateStudySummary(transcript: string) {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }
  
  try {
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    const prompt = `You are an expert AI tutor. Analyze the following transcript and generate a structured study guide. 
Provide a clear summary, key concepts, and important takeaways. 
Format the output for readability. Use markdown bold (**text**) for headers and key terms. Use hyphens for lists. Keep it concise and educational.

Transcript:
${transcript}`;
    
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });
    
    return response.text?.trim() || "";
  } catch (err: any) {
    console.error("Gemini summary error:", err);
    throw new Error(`Summary generation failed: ${err.message}`);
  }
}
