// Document Import Types

export type DocumentFileType = 'pdf' | 'doc' | 'docx' | 'txt' | 'json' | 'csv' | 'md' | 'html';

export interface UploadedFile {
  id: string;
  name: string;
  type: DocumentFileType;
  size: number;
  url: string;
  uploadedAt: string;
}

export interface ParsedContent {
  title: string;
  content: string;
  sections: DocumentSection[];
  metadata: DocumentMetadata;
}

export interface DocumentSection {
  id: string;
  title: string;
  content: string;
  level: number;
  startIndex: number;
  endIndex: number;
}

export interface DocumentMetadata {
  author?: string;
  createdAt?: string;
  modifiedAt?: string;
  pageCount?: number;
  wordCount?: number;
  language?: string;
  tags?: string[];
}

export interface ImportPreview {
  fileId: string;
  fileName: string;
  fileType: DocumentFileType;
  parsedContent: ParsedContent;
  suggestedFlashcards: SuggestedFlashcard[];
  totalFlashcards: number;
  estimatedTime: number;
}

export interface SuggestedFlashcard {
  id: string;
  front: string;
  back: string;
  pronunciation?: string;
  example?: string;
  exampleTranslation?: string;
  description?: string;
  notes?: string;
  difficulty: number;
  sourceSection: string;
  confidence: number;
}

export interface ImportOptions {
  deckId?: string;
  createDeck?: boolean;
  deckName?: string;
  deckDescription?: string;
  deckIcon?: string;
  deckColor?: string;
  maxCards?: number;
  difficulty?: 'auto' | 'easy' | 'medium' | 'hard';
  includeExamples?: boolean;
  includePronunciation?: boolean;
}

export interface ImportResult {
  imported: number;
  skipped: number;
  failed: number;
  deckId: string;
  deckName: string;
  timeSpent: number;
  errors: ImportError[];
}

export interface ImportError {
  line: number;
  message: string;
  severity: 'error' | 'warning';
}

export interface DocumentImportProgress {
  fileId: string;
  status: 'uploading' | 'parsing' | 'processing' | 'complete' | 'error';
  progress: number;
  message: string;
  error?: string;
}

// Parser configuration
export interface ParserConfig {
  maxFileSize: number; // in bytes
  allowedTypes: DocumentFileType[];
  chunkSize: number; // for large files
  extractImages: boolean;
  extractTables: boolean;
  preserveFormatting: boolean;
}

export interface FlashcardGenerationConfig {
  strategy: 'sentence' | 'paragraph' | 'section' | 'keyword';
  minCardLength: number;
  maxCardLength: number;
  includeContext: boolean;
  contextLength: number;
  generateExamples: boolean;
  difficultyLevel: 'auto' | 'easy' | 'medium' | 'hard';
}
