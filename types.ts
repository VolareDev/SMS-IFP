
export enum IFPStage {
  DATA_GATHERING = 'Obtención de Información',
  OBSTACLE_ANALYSIS = 'Análisis de Obstáculos',
  DESIGN_PROCESS = 'Proceso de Diseño (PANS-OPS)',
  GROUND_VALIDATION = 'Validación en Tierra',
  FLIGHT_VALIDATION = 'Validación en Vuelo'
}

export type Likelihood = 1 | 2 | 3 | 4 | 5; // 1: Extremely Improbable, 5: Frequent
export type Severity = 'A' | 'B' | 'C' | 'D' | 'E'; // E: Negligible, A: Catastrophic

export enum RiskLevel {
  LOW = 'Acceptable',
  MEDIUM = 'Tolerable',
  HIGH = 'Unacceptable'
}

export interface RiskEntry {
  id: string;
  title: string;
  description: string;
  stage: IFPStage;
  likelihood: Likelihood;
  severity: Severity;
  mitigationPlan: string;
  status: 'Active' | 'Mitigated' | 'Latent';
  createdAt: number;
  lastReview: number;
}

export interface RiskStats {
  total: number;
  unacceptable: number;
  tolerable: number;
  acceptable: number;
}
