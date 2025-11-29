export interface DiaryEntry {
  id: string;
  title: string;
  content: string;
  createdAt: number; // Timestamp
  updatedAt: number;
  mood?: string;
  moodColor?: string;
  reflection?: string;
}

export interface AIAnalysisResult {
  mood: string;
  moodColor: string; // Hex code
  reflection: string;
}
