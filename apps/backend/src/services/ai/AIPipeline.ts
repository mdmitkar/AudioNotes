/**
 * Phase 2 AI Pipeline — Stubs
 * These services will be implemented after the manual-upload MVP is stable.
 *
 * Pipeline:
 * ContentExtractor → ScriptGenerator → AudioGenerator → AIPipelineService
 */

export interface ContentExtractorResult {
  text: string;
  pageCount?: number;
  wordCount: number;
}

export class ContentExtractor {
  /**
   * Extract plain text from PDF, text file, or transcript.
   * TODO Phase 2: Implement with PyMuPDF (via child_process) or LangChain document loaders.
   */
  static async extractFromFile(filePath: string): Promise<ContentExtractorResult> {
    throw new Error("ContentExtractor not yet implemented. Phase 2 feature.");
  }
  static async extractFromText(text: string): Promise<ContentExtractorResult> {
    return { text, wordCount: text.split(/\s+/).length };
  }
}

export interface RevisionScript {
  title: string;
  estimatedDuration: number;
  sections: Array<{
    type: "key_concept" | "definition" | "formula" | "shortcut" | "common_mistake" | "pyq_insight" | "memory_trick" | "quick_question";
    content: string;
  }>;
}

export class ScriptGenerator {
  /**
   * Convert extracted text into a structured revision script.
   * TODO Phase 2: Implement with GPT-4 / Gemini API.
   *
   * The output should sound like a teacher explaining during a revision session,
   * NOT a word-for-word reading of the source material.
   */
  static async generate(_text: string, _topic: string, _exam: string): Promise<RevisionScript> {
    throw new Error("ScriptGenerator not yet implemented. Phase 2 feature.");
  }
}

export class AudioGenerator {
  /**
   * Convert a revision script into an audio file.
   * TODO Phase 2: Implement with ElevenLabs / Google TTS / Azure TTS.
   */
  static async generate(_script: RevisionScript): Promise<Buffer> {
    throw new Error("AudioGenerator not yet implemented. Phase 2 feature.");
  }
}

export class AIPipelineService {
  /**
   * Full pipeline: file → episode (status: pending, requires admin review).
   * TODO Phase 2: Orchestrate ContentExtractor → ScriptGenerator → AudioGenerator.
   */
  static async processFile(_filePath: string, _metadata: { topicId: string; examId: string; creatorId: string }): Promise<void> {
    throw new Error("AIPipelineService not yet implemented. Phase 2 feature.");
  }
}
