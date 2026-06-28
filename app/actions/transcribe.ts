"use server";

import { DeepgramClient } from "@deepgram/sdk";
import { GoogleGenAI } from "@google/genai";
import Groq from "groq-sdk";

export async function transcribeAudio(audioUrl: string) {
  try {
    const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY! });

    const response = await deepgram.listen.v1.media.transcribeUrl({
      url: audioUrl,
      model: "nova-3",
      language: "hi", // Hindi model handles Hinglish and Marathi well
      smart_format: true, // Adds punctuation and formatting
      utterances: true, // Detects pauses and creates paragraphs
    });

    const data = response as any;
    let transcript = "";
    
    // Deepgram groups speech into utterances separated by pauses. 
    // Join utterances into a single paragraph, but insert "(break)" if the gap is >= 30 seconds.
    if (data?.results?.utterances) {
      const utterances = data.results.utterances;
      let transcriptParts = [];
      for (let i = 0; i < utterances.length; i++) {
        const u = utterances[i];
        if (i > 0) {
          const prev = utterances[i - 1];
          const gap = u.start - prev.end;
          if (gap >= 30) {
            transcriptParts.push("(break)");
          }
        }
        transcriptParts.push(u.transcript);
      }
      transcript = transcriptParts.join(" ");
    } else {
      // Fallback
      transcript = data?.results?.channels[0]?.alternatives[0]?.transcript || "No transcript generated.";
    }

    // Ultra-Fast AI Spelling and Grammar Verification
    // Using Groq LLaMA 3.1 (128k context) allows us to process the entire transcript in a single pass 
    // at blazing speeds (800+ tokens per second), skipping the slow chunking and Gemini process.
    if (process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        const prompt = `You are an expert transcriber and linguist. Your ONLY task is to convert the following text entirely into the Latin/Roman alphabet (Hinglish). 

CRITICAL RULES:
1. You MUST NOT output any Devanagari script (Hindi/Marathi characters like क, ख, ग). 
2. If you see Devanagari, transliterate it into English letters exactly as it sounds (e.g., "क्या कर रहे हो" MUST become "kya kar rahe ho").
3. DO NOT translate the meaning into English. Keep the exact Hinglish words.
4. If a word is already in English, keep it as is and fix any spelling mistakes.
5. Keep the exact same paragraph structure.
6. Output ONLY the converted text and nothing else.

TEXT TO CONVERT:
${transcript}`;
        
        const completion = await groq.chat.completions.create({
            messages: [{ role: "user", content: prompt }],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, // Low temperature for consistent translation
        });
        
        if (completion.choices[0]?.message?.content) {
            transcript = completion.choices[0].message.content;
        }
      } catch (aiError) {
        console.error("Fast Groq verification failed, keeping original transcript:", aiError);
      }
    }

    return transcript;
  } catch (error: any) {
    console.error("Transcription Server Action Error:", error);
    throw new Error(`Transcription failed: ${error.message || "Unknown Error"}`);
  }
}
