export type SlideDeckSourceType = 'lesson' | 'prompt';
export type SlideDeckTemplate = 'neon-classroom' | 'clean-academic' | 'quiz-reveal';
export type SlideDeckStatus = 'draft' | 'published';
export type SlideType = 'title' | 'content' | 'quiz' | 'summary';

export interface SlideContent {
  title?: string;
  subtitle?: string;
  bullets?: string[];
  question?: string;
  options?: string[];
  answer?: string;
  explanation?: string;
}

export interface SlideItem {
  id: string;
  order: number;
  type: SlideType;
  content: SlideContent;
  speakerNotes?: string;
}

export interface SlideDeck {
  id: string;
  title: string;
  description?: string;
  sourceType: SlideDeckSourceType;
  sourceLessonId?: string;
  template: SlideDeckTemplate;
  status: SlideDeckStatus;
  slides: SlideItem[];
  createdById: number;
  createdAt: string;
  updatedAt: string;
}

export interface GenerateSlideDeckRequest {
  sourceType: SlideDeckSourceType;
  lessonId?: string;
  prompt?: string;
  template: SlideDeckTemplate;
  slideCount: 5 | 8 | 12;
}

export interface UpdateSlideDeckRequest {
  title?: string;
  description?: string;
  template?: SlideDeckTemplate;
  status?: SlideDeckStatus;
  slides?: SlideItem[];
}
