"use server";

import { DeepgramClient } from "@deepgram/sdk";
import { GoogleGenAI } from "@google/genai";

export async function transcribeAudio(audioUrl: string) {
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
    let transcript = "";
    
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
      
      // We will chunk the utterances into batches to fix spelling line by line
      if (process.env.GROQ_API_KEY) {
        try {
          const Groq = (await import("groq-sdk")).default;
          const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
          const prompt = `You are an expert transcriber and linguist. 
Fix the spelling mistakes in this Hinglish (Hindi written in Latin alphabet) transcript.
Format the output line-by-line exactly as provided (do not combine into one giant paragraph).
DO NOT translate to English, keep the exact spoken Hinglish words.
DO NOT add any preamble or extra text. Output ONLY the fixed transcript line-by-line.`;
          const CHUNK_SIZE = 40;
          let fixedChunks = [];
          
          // Process sequentially to avoid API rate limits
          for (let i = 0; i < transcriptParts.length; i += CHUNK_SIZE) {
            const chunk = transcriptParts.slice(i, i + CHUNK_SIZE).join("\n");
            try {
              const aiRes = await groq.chat.completions.create({
                model: "llama-3.1-8b-instant",
                messages: [
                  { role: "system", content: prompt },
                  { role: "user", content: chunk }
                ],
                temperature: 0.1,
              });
              fixedChunks.push(aiRes.choices[0]?.message?.content?.trim() || chunk);
            } catch (err) {
              console.error("Groq chunk error:", err);
              fixedChunks.push(chunk);
            }
          }
          transcript = fixedChunks.join("\n");
        } catch (err) {
          console.error("Groq init error:", err);
          transcript = transcriptParts.join("\n");
        }
      } else {
        transcript = transcriptParts.join("\n");
      }
    } else {
      // Fallback
      transcript = data?.results?.channels[0]?.alternatives[0]?.transcript || "No transcript generated.";
    }

    return transcript;
  } catch (error: any) {
    console.error("Transcription Server Action Error:", error);
    throw new Error(`Transcription failed: ${error.message || "Unknown Error"}`);
  }
}
