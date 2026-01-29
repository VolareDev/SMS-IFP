
import React, { useState } from 'react';
import { IFPStage, Likelihood, Severity, RiskEntry } from '../types';
import { analyzeRiskWithAI } from '../services/geminiService';

interface RiskFormProps {
  onAdd: (risk: RiskEntry) => void;
}

const RiskForm: React.FC<RiskFormProps> = ({ onAdd }) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [stage, setStage] = useState<IFPStage>(IFPStage.DATA_GATHERING);
  const [likelihood, setLikelihood] = useState<Likelihood>(3);
  const [severity, setSeverity] = useState<Severity>('C');
  const [mitigation, setMitigation] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newRisk: RiskEntry = {
      id: crypto.randomUUID(),
      title,
      description,
      stage,
      likelihood,
      severity,
      mitigationPlan: mitigation,
      status: 'Active',
      createdAt: Date.now(),
      lastReview: Date.now()
    };
    onAdd(newRisk);
    setTitle('');
    setDescription('');
    setMitigation('');
  };

  const handleAIAnalyze = async () => {
    if (!title || !description) return;
    setIsAnalyzing(true);
    const result = await analyzeRiskWithAI(title, description, stage);
    if (result) {
      setMitigation(result.suggestedMitigation);
      setLikelihood(result.suggestedLikelihood as Likelihood);
      setSeverity(result.suggestedSeverity as Severity);
    }
    setIsAnalyzing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-4">Registrar Nuevo Peligro / Riesgo</h3>
      
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Título del Riesgo</label>
          <input 
            value={title}
            onChange={e => setTitle(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none" 
            placeholder="Ej: Base de datos de obstáculos desactualizada"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Etapa del Proceso (Doc 8168)</label>
          <select 
            value={stage}
            onChange={e => setStage(e.target.value as IFPStage)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
          >
            {Object.values(IFPStage).map(s => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Descripción del Peligro</label>
          <textarea 
            value={description}
            onChange={e => setDescription(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none min-h-[100px]"
            placeholder="Describe la situación de peligro..."
            required
          />
        </div>

        <button 
          type="button"
          onClick={handleAIAnalyze}
          disabled={isAnalyzing || !title || !description}
          className="w-full py-2 bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-md hover:bg-indigo-100 transition-colors flex items-center justify-center gap-2 font-medium disabled:opacity-50"
        >
          {isAnalyzing ? (
            <div className="w-4 h-4 border-2 border-indigo-700 border-t-transparent rounded-full animate-spin"></div>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/><path d="M5 3v4"/><path d="M19 17v4"/><path d="M3 5h4"/><path d="M17 19h4"/></svg>
          )}
          Asistente IA: Analizar y Sugerir Mitigación
        </button>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Probabilidad (1-5)</label>
            <select 
              value={likelihood}
              onChange={e => setLikelihood(Number(e.target.value) as Likelihood)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
            >
              <option value={5}>5 - Frecuente</option>
              <option value={4}>4 - Ocasional</option>
              <option value={3}>3 - Remota</option>
              <option value={2}>2 - Improbable</option>
              <option value={1}>1 - Ext. Improbable</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Severidad (A-E)</label>
            <select 
              value={severity}
              onChange={e => setSeverity(e.target.value as Severity)}
              className="w-full px-3 py-2 border border-slate-300 rounded-md outline-none"
            >
              <option value="A">A - Catastrófica</option>
              <option value="B">B - Peligrosa</option>
              <option value="C">C - Mayor</option>
              <option value="D">D - Menor</option>
              <option value="E">E - Insignificante</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-slate-700 mb-1">Plan de Mitigación</label>
          <textarea 
            value={mitigation}
            onChange={e => setMitigation(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="¿Cómo se reducirá este riesgo?"
            required
          />
        </div>

        <button 
          type="submit"
          className="w-full py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors font-bold shadow-md"
        >
          Guardar Registro
        </button>
      </div>
    </form>
  );
};

export default RiskForm;
