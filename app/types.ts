export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
}

export interface InterviewSummary {
  strengths: string[];
  weaknesses: string[];
  criticalUnknowns: string[];
  mostImportantNextQuestion: string;
}

export interface ChatResponse {
  reply: string;
  interviewDone: boolean;
  summary: InterviewSummary | null;
}

export interface Suggestions {
  strengths: string[];
  weaknesses: string[];
  criticalUnknowns: string[];
}

export interface Session {
  id: string;
  idea: string;
  summary: InterviewSummary;
  createdAt: string;
}
