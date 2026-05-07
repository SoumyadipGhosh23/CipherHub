export type SecurityModel = 
  | 'plain-text'
  | 'backend-encryption'
  | 'end-to-end-encryption'
  | 'hashing'
  | 'public-key-encryption'
  | 'tls-simulation';

export interface FlowStep {
  id: string;
  label: string;
  value: string;
  description: string;
}

export interface ServerLog {
  id: string;
  type: 'info' | 'error' | 'success' | 'warning';
  message: string;
  timestamp: number;
}
