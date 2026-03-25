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
  status: "in-progress" | "completed";
  summary: InterviewSummary | null;
  createdAt: string;
}

export interface CreditBalance {
  balance: number;
}

export interface CreditPack {
  id: string;
  name: string;
  credits: number;
  price: number;
  priceId: string;
}
