"use server";

import { DeepgramClient } from "@deepgram/sdk";

export async function transcribeAudio(audioUrl: string) {
  try {
    const deepgram = new DeepgramClient({ apiKey: process.env.DEEPGRAM_API_KEY! });

    const response = await deepgram.listen.v1.media.transcribeUrl({
      url: audioUrl,
      model: "nova-3",
      language: "en-IN", // Indian English outputs Hinglish in English characters
      smart_format: true, // Adds punctuation and formatting
      utterances: true, // Detects pauses and creates paragraphs
    });

    const data = response as any;
    let transcript = "";
    
    // Deepgram groups speech into utterances separated by pauses. 
    // We will join them with double newlines to create descriptive paragraphs.
    if (data?.results?.utterances) {
      transcript = data.results.utterances.map((u: any) => u.transcript).join("\n\n");
    } else {
      // Fallback
      transcript = data?.results?.channels[0]?.alternatives[0]?.transcript || "No transcript generated.";
    }

    return transcript;
  } catch (error) {
    console.error("Transcription Server Action Error:", error);
    throw new Error("Transcription failed");
  }
}
