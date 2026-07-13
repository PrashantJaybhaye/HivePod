import { transcribeAudioInitial, fixTranscriptionChunk } from "@/app/actions/transcribe";

export async function transcribeAudioWithProgress(audioUrl: string, onProgress?: (percentage: number) => void): Promise<string> {
  if (onProgress) onProgress(0);
  
  // Phase 1: Deepgram initial transcription
  const res = await transcribeAudioInitial(audioUrl);
  
  // 15% progress after initial transcription (Deepgram is fast)
  if (onProgress) onProgress(15);

  if (res.fallback) {
    if (onProgress) onProgress(100);
    return res.fallback;
  }

  const transcriptParts = res.transcriptParts || [];
  const CHUNK_SIZE = 20;
  let fixedChunks: string[] = [];
  
  const totalChunks = Math.ceil(transcriptParts.length / CHUNK_SIZE);

  if (totalChunks === 0) {
    if (onProgress) onProgress(100);
    return "";
  }

  // Phase 2: Groq spell check in chunks (remaining 85% of progress)
  for (let i = 0; i < totalChunks; i++) {
    const startIdx = i * CHUNK_SIZE;
    const chunk = transcriptParts.slice(startIdx, startIdx + CHUNK_SIZE).join("\n");
    
    try {
      const fixedChunk = await fixTranscriptionChunk(chunk);
      
      // Strict Line-by-Line Validation (Fail-Safe)
      const inputLines = chunk.split("\n").length;
      const outputLines = fixedChunk.split("\n").length;
      
      if (inputLines === outputLines) {
        fixedChunks.push(fixedChunk);
      } else {
        console.warn(`Line count mismatch (expected ${inputLines}, got ${outputLines}). Falling back to original chunk.`);
        fixedChunks.push(chunk);
      }
    } catch (err) {
      console.error("Error fixing chunk in client loop:", err);
      fixedChunks.push(chunk);
    }

    if (onProgress) {
      // Calculate progress between 15% and 100%
      const chunkProgress = 15 + Math.round(((i + 1) / totalChunks) * 85);
      onProgress(chunkProgress);
    }
  }

  if (onProgress) onProgress(100);
  return fixedChunks.join("\n");
}
