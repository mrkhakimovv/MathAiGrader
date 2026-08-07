export interface GradingResult {
  id?: string;
  transcription: string;
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  score: number;
  feedback: string;
  errorSteps: string[];
  createdAt?: any;
  studentUsername?: string;
  taskId?: string;
  inputTokens?: number;
  outputTokens?: number;
  thinkingTokens?: number;
  cachedTokens?: number;
  totalTokens?: number;
}