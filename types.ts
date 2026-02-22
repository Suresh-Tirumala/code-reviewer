
export enum Severity {
  CRITICAL = 'Critical Issues',
  HIGH = 'High Priority',
  MEDIUM = 'Medium Priority',
  LOW = 'Low Priority'
}

export interface CodeReviewResult {
  counts: Record<string, number>;
  markdown: string;
  suggestions: Array<{
    severity: string;
    line?: number;
    issue: string;
    recommendation: string;
  }>;
}

export type ReviewAnalysis = CodeReviewResult;

export interface CodeRewriteResult {
  rewrittenCode: string;
  summary: string;
  improvements: string[];
  explanation: string;
}

export interface TerminalOutput {
  stdout: string;
  stderr: string;
}

export type TabType = 'editor' | 'review' | 'rewrite' | 'output' | 'history';

export interface HistoryItem {
  id: string;
  timestamp: Date;
  type: 'Review' | 'Rewrite' | 'Run';
  language: string;
  codePreview: string;
  resultSummary?: string;
  fullCode: string;
  result: any; // Stores ReviewAnalysis, CodeRewriteResult, or TerminalOutput
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface User {
  email: string;
  name: string;
  role?: string;
}
