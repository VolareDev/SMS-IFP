
import { Likelihood, Severity, RiskLevel } from './types';

export const getRiskLevel = (likelihood: Likelihood, severity: Severity): RiskLevel => {
  // Simple mapping based on ICAO Doc 9859 typical matrix
  // Likelihood: 5 (Frequent), 4 (Occasional), 3 (Remote), 2 (Improbable), 1 (Extremely Improbable)
  // Severity: A (Catastrophic), B (Hazardous), C (Major), D (Minor), E (Negligible)
  
  const severityVal = { 'A': 5, 'B': 4, 'C': 3, 'D': 2, 'E': 1 }[severity];
  const score = likelihood * severityVal;

  if (score >= 15) return RiskLevel.HIGH;
  if (score >= 6) return RiskLevel.MEDIUM;
  return RiskLevel.LOW;
};

export const getRiskColor = (level: RiskLevel): string => {
  switch (level) {
    case RiskLevel.HIGH: return 'bg-red-500';
    case RiskLevel.MEDIUM: return 'bg-amber-500';
    case RiskLevel.LOW: return 'bg-emerald-500';
    default: return 'bg-slate-500';
  }
};

export const SEVERITY_LABELS = {
  'A': 'Catastrófica',
  'B': 'Peligrosa',
  'C': 'Mayor',
  'D': 'Menor',
  'E': 'Insignificante'
};

export const LIKELIHOOD_LABELS = {
  5: 'Frecuente',
  4: 'Ocasional',
  3: 'Remota',
  2: 'Improbable',
  1: 'Extremadamente Improbable'
};
