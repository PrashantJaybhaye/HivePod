"use server";

import { DeepgramClient } from "@deepgram/sdk";

export async function transcribeAudio(audioUrl: string) {
  try {
    const deepgram = new DeepgramClient(process.env.DEEPGRAM_API_KEY!);

    const response = await deepgram.listen.v1.media.transcribeUrl({
      url: audioUrl,
      model: "nova-3",
      language: "hi", // Hindi model handles Hinglish extremely well
      smart_format: true, // Adds punctuation and formatting
      utterances: true, // Detects pauses and creates paragraphs
    });

    let transcript = "";
    
    // Deepgram groups speech into utterances separated by pauses. 
    // We will join them with double newlines to create descriptive paragraphs.
    if (response?.results?.utterances) {
      transcript = response.results.utterances.map((u: any) => u.transcript).join("\n\n");
    } else {
      // Fallback
      transcript = response?.results?.channels[0]?.alternatives[0]?.transcript || "No transcript generated.";
    }

    return transcript;
  } catch (error) {
    console.error("Transcription Server Action Error:", error);
    throw new Error("Transcription failed");
  }
}
