export interface Experiment {
  id: string;
  question: string;
  experimentType: 'FOOD' | 'GENERAL';
  status: 'CREATED' | 'READY' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  createdAt: string;
  updatedAt: string;
  hypothesis: string | null;
  entities: string[];
  confidence: number;
  reasoningTrace: string[];
  observations: string[];
  recommendations: string[];
  workspaceState: Record<string, any>;
}
