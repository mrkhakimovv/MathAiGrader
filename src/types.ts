export interface GradingResult {
  transcription: string;
  isCorrect: boolean;
  isPartiallyCorrect: boolean;
  score: number;
  feedback: string;
  errorSteps: string[];
}
