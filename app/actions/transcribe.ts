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

    // AI Spelling and Grammar Verification
    let aiVerified = false;

    // 1. Try Gemini first (handles large contexts easily without chunking)
    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
        const prompt = `You are an expert transcriber. Your task is to ensure the text is in Roman/Latin script (like Indian WhatsApp chat language - Hinglish). If the text contains Hindi or Marathi script (Devanagari), transliterate it into English letters. Do NOT translate the meaning into English, just transliterate the sounds (e.g., "क्या कर रहे हो" -> "kya kar rahe ho"). If the text is already in English, just fix any spelling mistakes. Keep the exact same meaning, paragraph structure, and length. Do not hide or skip words. Only output the final text:\n\n${transcript}`;
        
        const response = await ai.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: prompt,
        });
        
        if (response.text) {
          transcript = response.text;
          aiVerified = true;
        }
      } catch (geminiError) {
        console.warn("Gemini verification failed, falling back to Groq:", geminiError);
      }
    }

    // 2. Fallback to Groq with chunking if Gemini failed or wasn't available
    if (!aiVerified && process.env.GROQ_API_KEY) {
      try {
        const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
        
        // Chunk transcript to avoid TPM/context limits (approx 12000 chars per chunk ~ 3000 tokens)
        const CHUNK_SIZE = 12000;
        let finalTranscript = "";
        let start = 0;
        
        while (start < transcript.length) {
          const end = Math.min(start + CHUNK_SIZE, transcript.length);
          let chunk = transcript.slice(start, end);
          
          if (end < transcript.length) {
            const lastSpace = chunk.lastIndexOf(' ');
            if (lastSpace > 0) {
              chunk = chunk.slice(0, lastSpace);
              start += lastSpace + 1;
            } else {
              start += CHUNK_SIZE;
            }
          } else {
            start += CHUNK_SIZE;
          }

          const prompt = `You are an expert transcriber. Your task is to ensure the text chunk is in Roman/Latin script (like Indian WhatsApp chat language - Hinglish). If the text contains Hindi or Marathi script (Devanagari), transliterate it into English letters. Do NOT translate the meaning into English, just transliterate the sounds (e.g., "क्या कर रहे हो" -> "kya kar rahe ho"). If the text is already in English, just fix any spelling mistakes. Keep the exact same meaning, paragraph structure, and length. Do not hide or skip words. Only output the final text:\n\n${chunk}`;
          
          let aiText = "";
          let retries = 3;
          while (retries > 0) {
            try {
              const completion = await groq.chat.completions.create({
                  messages: [{ role: "user", content: prompt }],
                  model: "llama-3.1-8b-instant",
              });
              aiText = completion.choices[0]?.message?.content || chunk;
              break;
            } catch (err: any) {
              // Handle Groq rate limit (429) or payload too large (413)
              if (err.status === 429 || err.status === 413) {
                 console.warn(`Groq limit hit. Waiting 20 seconds before retrying... (${retries} retries left)`);
                 await new Promise(resolve => setTimeout(resolve, 20000));
                 retries--;
              } else {
                 throw err;
              }
            }
          }
          finalTranscript += (finalTranscript ? " " : "") + aiText;
        }
        
        if (finalTranscript) {
          transcript = finalTranscript;
        }
      } catch (aiError) {
        console.error("Groq fallback failed, keeping original transcript:", aiError);
      }
    }

    return transcript;
  } catch (error) {
    console.error("Transcription Server Action Error:", error);
    throw new Error("Transcription failed");
  }
}
