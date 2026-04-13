import type {
  DocumentFileType,
  ParsedContent,
  DocumentSection,
  DocumentMetadata,
  SuggestedFlashcard,
  FlashcardGenerationConfig,
} from '@/types/document.types';

// ==================== BASE PARSER INTERFACE ====================

interface DocumentParser {
  canParse(fileType: DocumentFileType): boolean;
  parse(file: File): Promise<ParsedContent>;
  extractText(file: File): Promise<string>;
  extractMetadata(file: File): Promise<DocumentMetadata>;
}

// ==================== TEXT PARSER (TXT, MD, HTML, JSON, CSV) ====================

class TextParser implements DocumentParser {
  canParse(fileType: DocumentFileType): boolean {
    return ['txt', 'md', 'html', 'json', 'csv'].includes(fileType);
  }

  async parse(file: File): Promise<ParsedContent> {
    const text = await this.extractText(file);
    const metadata = await this.extractMetadata(file);

    const sections = this.extractSections(text, file.name);
    const title = this.extractTitle(text, file.name);

    return {
      title,
      content: text,
      sections,
      metadata,
    };
  }

  async extractText(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => resolve(e.target?.result as string);
      reader.onerror = reject;
      reader.readAsText(file);
    });
  }

  async extractMetadata(file: File): Promise<DocumentMetadata> {
    const text = await this.extractText(file);
    const wordCount = text.split(/\s+/).length;

    return {
      wordCount,
      createdAt: new Date(file.lastModified).toISOString(),
      language: this.detectLanguage(text),
    };
  }

  private extractSections(text: string, fileName: string): DocumentSection[] {
    const sections: DocumentSection[] = [];
    const lines = text.split('\n');
    let currentSection: DocumentSection | null = null;
    let sectionIndex = 0;

    lines.forEach((line, index) => {
      // Detect headers (Markdown style)
      const headerMatch = line.match(/^(#{1,6})\s+(.+)$/);
      if (headerMatch) {
        // Save previous section
        if (currentSection) {
          currentSection.endIndex = index;
          sections.push(currentSection);
        }

        // Start new section
        const level = headerMatch[1].length;
        currentSection = {
          id: `section-${sectionIndex++}`,
          title: headerMatch[2].trim(),
          content: '',
          level,
          startIndex: index,
          endIndex: index,
        };
      } else if (currentSection) {
        currentSection.content += line + '\n';
      }
    });

    // Add last section
    if (currentSection) {
      sections.push(currentSection);
    }

    // If no sections found, create one from entire content
    if (sections.length === 0) {
      sections.push({
        id: 'section-0',
        title: fileName,
        content: text,
        level: 1,
        startIndex: 0,
        endIndex: lines.length,
      });
    }

    return sections;
  }

  private extractTitle(text: string, fileName: string): string {
    // Try to find first heading
    const titleMatch = text.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      return titleMatch[1].trim();
    }

    // Use filename without extension
    return fileName.replace(/\.[^/.]+$/, '');
  }

  private detectLanguage(text: string): string {
    // Simple language detection based on common words
    const englishWords = ['the', 'and', 'is', 'in', 'at', 'of', 'to', 'a'];
    const vietnameseWords = ['và', 'là', 'trong', 'ở', 'của', 'để', 'một', 'những'];

    const words = text.toLowerCase().split(/\s+/);
    const englishCount = words.filter((w) => englishWords.includes(w)).length;
    const vietnameseCount = words.filter((w) => vietnameseWords.includes(w)).length;

    if (englishCount > vietnameseCount) return 'en';
    if (vietnameseCount > englishCount) return 'vi';
    return 'unknown';
  }
}

// ==================== PDF PARSER ====================

class PDFParser implements DocumentParser {
  canParse(fileType: DocumentFileType): boolean {
    return fileType === 'pdf';
  }

  async parse(file: File): Promise<ParsedContent> {
    // Note: This would typically use pdf.js library
    // For now, we'll return a placeholder implementation
    const text = await this.extractText(file);
    const metadata = await this.extractMetadata(file);

    return {
      title: file.name.replace('.pdf', ''),
      content: text,
      sections: this.extractSectionsFromPDF(text),
      metadata,
    };
  }

  async extractText(file: File): Promise<string> {
    // Placeholder - would use pdf.js in production
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // In production, this would parse the PDF using pdf.js
        resolve('PDF content would be extracted here using pdf.js library');
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async extractMetadata(file: File): Promise<DocumentMetadata> {
    return {
      pageCount: 1, // Would be extracted from PDF
      wordCount: 0,
      createdAt: new Date(file.lastModified).toISOString(),
    };
  }

  private extractSectionsFromPDF(text: string): DocumentSection[] {
    // Placeholder - would extract sections from PDF structure
    return [
      {
        id: 'section-0',
        title: 'PDF Content',
        content: text,
        level: 1,
        startIndex: 0,
        endIndex: text.length,
      },
    ];
  }
}

// ==================== DOC/DOCX PARSER ====================

class DocParser implements DocumentParser {
  canParse(fileType: DocumentFileType): boolean {
    return ['doc', 'docx'].includes(fileType);
  }

  async parse(file: File): Promise<ParsedContent> {
    // Note: This would typically use mammoth.js or similar library
    const text = await this.extractText(file);
    const metadata = await this.extractMetadata(file);

    return {
      title: file.name.replace(/\.(doc|docx)$/, ''),
      content: text,
      sections: this.extractSectionsFromDoc(text),
      metadata,
    };
  }

  async extractText(file: File): Promise<string> {
    // Placeholder - would use mammoth.js in production
    return new Promise((resolve) => {
      const reader = new FileReader();
      reader.onload = () => {
        // In production, this would parse the DOC/DOCX using mammoth.js
        resolve('DOC/DOCX content would be extracted here using mammoth.js library');
      };
      reader.readAsArrayBuffer(file);
    });
  }

  async extractMetadata(file: File): Promise<DocumentMetadata> {
    return {
      wordCount: 0,
      createdAt: new Date(file.lastModified).toISOString(),
      modifiedAt: new Date(file.lastModified).toISOString(),
    };
  }

  private extractSectionsFromDoc(text: string): DocumentSection[] {
    // Placeholder - would extract sections from DOC structure
    return [
      {
        id: 'section-0',
        title: 'Document Content',
        content: text,
        level: 1,
        startIndex: 0,
        endIndex: text.length,
      },
    ];
  }
}

// ==================== PARSER FACTORY ====================

class ParserFactory {
  private parsers: DocumentParser[] = [
    new TextParser(),
    new PDFParser(),
    new DocParser(),
  ];

  getParser(fileType: DocumentFileType): DocumentParser | null {
    return this.parsers.find((parser) => parser.canParse(fileType)) || null;
  }

  async parseDocument(file: File): Promise<ParsedContent> {
    const fileType = file.name.split('.').pop()?.toLowerCase() as DocumentFileType;
    const parser = this.getParser(fileType);

    if (!parser) {
      throw new Error(`No parser available for file type: ${fileType}`);
    }

    return parser.parse(file);
  }

  async extractText(file: File): Promise<string> {
    const fileType = file.name.split('.').pop()?.toLowerCase() as DocumentFileType;
    const parser = this.getParser(fileType);

    if (!parser) {
      throw new Error(`No parser available for file type: ${fileType}`);
    }

    return parser.extractText(file);
  }
}

// ==================== FLASHCARD GENERATOR ====================

export class FlashcardGenerator {
  private config: FlashcardGenerationConfig;

  constructor(config: Partial<FlashcardGenerationConfig> = {}) {
    this.config = {
      strategy: 'sentence',
      minCardLength: 10,
      maxCardLength: 200,
      includeContext: true,
      contextLength: 50,
      generateExamples: true,
      difficultyLevel: 'auto',
      ...config,
    };
  }

  generateFromContent(
    content: ParsedContent,
    maxCards: number = 50
  ): SuggestedFlashcard[] {
    const flashcards: SuggestedFlashcard[] = [];

    switch (this.config.strategy) {
      case 'sentence':
        flashcards.push(...this.generateFromSentences(content, maxCards));
        break;
      case 'paragraph':
        flashcards.push(...this.generateFromParagraphs(content, maxCards));
        break;
      case 'section':
        flashcards.push(...this.generateFromSections(content, maxCards));
        break;
      case 'keyword':
        flashcards.push(...this.generateFromKeywords(content, maxCards));
        break;
    }

    return flashcards.slice(0, maxCards);
  }

  private generateFromSentences(
    content: ParsedContent,
    maxCards: number
  ): SuggestedFlashcard[] {
    const flashcards: SuggestedFlashcard[] = [];
    const sentences = this.extractSentences(content.content);

    sentences.forEach((sentence, index) => {
      if (flashcards.length >= maxCards) return;

      const card = this.createFlashcardFromSentence(sentence, index);
      if (card) {
        flashcards.push(card);
      }
    });

    return flashcards;
  }

  private generateFromParagraphs(
    content: ParsedContent,
    maxCards: number
  ): SuggestedFlashcard[] {
    const flashcards: SuggestedFlashcard[] = [];
    const paragraphs = content.content.split(/\n\n+/);

    paragraphs.forEach((paragraph, index) => {
      if (flashcards.length >= maxCards) return;

      const card = this.createFlashcardFromParagraph(paragraph, index);
      if (card) {
        flashcards.push(card);
      }
    });

    return flashcards;
  }

  private generateFromSections(
    content: ParsedContent,
    maxCards: number
  ): SuggestedFlashcard[] {
    const flashcards: SuggestedFlashcard[] = [];

    content.sections.forEach((section, index) => {
      if (flashcards.length >= maxCards) return;

      const card = this.createFlashcardFromSection(section, index);
      if (card) {
        flashcards.push(card);
      }
    });

    return flashcards;
  }

  private generateFromKeywords(
    content: ParsedContent,
    maxCards: number
  ): SuggestedFlashcard[] {
    const flashcards: SuggestedFlashcard[] = [];
    const keywords = this.extractKeywords(content.content);

    keywords.forEach((keyword, index) => {
      if (flashcards.length >= maxCards) return;

      const card = this.createFlashcardFromKeyword(keyword, index);
      if (card) {
        flashcards.push(card);
      }
    });

    return flashcards;
  }

  private extractSentences(text: string): string[] {
    // Split by sentence endings
    return text
      .split(/[.!?]+/)
      .map((s) => s.trim())
      .filter((s) => s.length > this.config.minCardLength && s.length < this.config.maxCardLength);
  }

  private extractKeywords(text: string): string[] {
    // Extract important words (capitalized, longer words, etc.)
    const words = text
      .split(/\s+/)
      .filter((w) => w.length > 4 && /^[A-Z]/.test(w));

    return [...new Set(words)]; // Remove duplicates
  }

  private createFlashcardFromSentence(
    sentence: string,
    index: number
  ): SuggestedFlashcard | null {
    if (sentence.length < this.config.minCardLength || sentence.length > this.config.maxCardLength) {
      return null;
    }

    // Simple strategy: first half as front, second half as back
    const midPoint = Math.floor(sentence.length / 2);
    const front = sentence.substring(0, midPoint).trim();
    const back = sentence.substring(midPoint).trim();

    return {
      id: `card-${index}`,
      front,
      back,
      difficulty: this.calculateDifficulty(sentence),
      confidence: 0.8,
      sourceSection: 'sentence',
    };
  }

  private createFlashcardFromParagraph(
    paragraph: string,
    index: number
  ): SuggestedFlashcard | null {
    if (paragraph.length < this.config.minCardLength) {
      return null;
    }

    // Extract key concepts from paragraph
    const sentences = this.extractSentences(paragraph);
    if (sentences.length === 0) return null;

    return this.createFlashcardFromSentence(sentences[0], index);
  }

  private createFlashcardFromSection(
    section: DocumentSection,
    index: number
  ): SuggestedFlashcard | null {
    if (section.content.length < this.config.minCardLength) {
      return null;
    }

    // Use section title as front, first sentence as back
    const sentences = this.extractSentences(section.content);
    if (sentences.length === 0) return null;

    return {
      id: `card-${index}`,
      front: section.title,
      back: sentences[0],
      difficulty: this.calculateDifficulty(section.content),
      confidence: 0.9,
      sourceSection: section.id,
    };
  }

  private createFlashcardFromKeyword(
    keyword: string,
    index: number
  ): SuggestedFlashcard | null {
    // Find context around keyword
    // This is a simplified version
    return {
      id: `card-${index}`,
      front: keyword,
      back: `Definition or explanation for ${keyword}`,
      difficulty: 2,
      confidence: 0.6,
      sourceSection: 'keyword',
    };
  }

  private calculateDifficulty(text: string): number {
    // Simple difficulty calculation based on text complexity
    const words = text.split(/\s+/);
    const avgWordLength = words.reduce((sum, w) => sum + w.length, 0) / words.length;
    const uniqueWords = new Set(words.map((w) => w.toLowerCase())).size;

    // More complex text = higher difficulty
    let difficulty = 1;
    if (avgWordLength > 6) difficulty += 1;
    if (uniqueWords / words.length > 0.7) difficulty += 1;
    if (words.length > 20) difficulty += 1;

    return Math.min(difficulty, 5);
  }
}

// ==================== EXPORTS ====================

export const parserFactory = new ParserFactory();
export const flashcardGenerator = new FlashcardGenerator();

export { TextParser, PDFParser, DocParser };
export type { DocumentParser };
