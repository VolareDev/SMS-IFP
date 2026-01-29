
import React from 'react';
import { Likelihood, Severity, RiskEntry } from '../types';
import { getRiskLevel, getRiskColor } from '../constants';

interface RiskMatrixProps {
  risks: RiskEntry[];
}

const RiskMatrix: React.FC<RiskMatrixProps> = ({ risks }) => {
  const severities: Severity[] = ['A', 'B', 'C', 'D', 'E'];
  const likelihoods: Likelihood[] = [5, 4, 3, 2, 1];

  const getRisksInCell = (l: Likelihood, s: Severity) => {
    return risks.filter(r => r.likelihood === l && r.severity === s);
  };

  return (
    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
      <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
        <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-600"><rect width="18" height="18" x="3" y="3" rx="2"/><path d="M3 9h18"/><path d="M3 15h18"/><path d="M9 3v18"/><path d="M15 3v18"/></svg>
        Matriz de Evaluación de Riesgos (OACI Doc 9859)
      </h3>
      <div className="overflow-x-auto">
        <div className="min-w-[500px]">
          <div className="grid grid-cols-7 gap-1">
            {/* Headers */}
            <div className="col-span-1"></div>
            {severities.map(s => (
              <div key={s} className="text-center font-bold text-slate-500 py-2">
                {s}
              </div>
            ))}
            <div className="col-span-1"></div>

            {/* Rows */}
            {likelihoods.map(l => (
              <React.Fragment key={l}>
                <div className="flex items-center justify-end pr-4 font-bold text-slate-500">
                  {l}
                </div>
                {severities.map(s => {
                  const level = getRiskLevel(l, s);
                  const cellRisks = getRisksInCell(l, s);
                  return (
                    <div 
                      key={`${l}-${s}`} 
                      className={`${getRiskColor(level)} h-20 rounded-md flex flex-col items-center justify-center relative group transition-all hover:brightness-110 shadow-sm`}
                    >
                      {cellRisks.length > 0 && (
                        <div className="bg-white text-slate-900 rounded-full w-8 h-8 flex items-center justify-center font-bold text-sm shadow-md animate-pulse">
                          {cellRisks.length}
                        </div>
                      )}
                      
                      {/* Tooltip on hover */}
                      <div className="absolute hidden group-hover:block z-20 bottom-full mb-2 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs p-2 rounded shadow-xl w-48 pointer-events-none">
                        Riesgo: {level}
                        {cellRisks.length > 0 && (
                          <ul className="mt-1 border-t border-slate-600 pt-1">
                            {cellRisks.slice(0, 3).map(r => (
                              <li key={r.id} className="truncate">• {r.title}</li>
                            ))}
                          </ul>
                        )}
                      </div>
                    </div>
                  );
                })}
                <div className="flex items-center pl-2 text-xs text-slate-400">
                   {l === 5 ? 'Frecuente' : l === 1 ? 'Ex. Improbable' : ''}
                </div>
              </React.Fragment>
            ))}
            
            <div className="col-span-1"></div>
            {severities.map(s => (
              <div key={s} className="text-center text-xs text-slate-400 py-1">
                {s === 'A' ? 'Catastrófico' : s === 'E' ? 'Insignif.' : ''}
              </div>
            ))}
            <div className="col-span-1"></div>
          </div>
        </div>
      </div>
      <div className="mt-6 flex gap-6 text-sm justify-center">
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-red-500"></div> Inaceptable</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-amber-500"></div> Tolerable</div>
        <div className="flex items-center gap-2"><div className="w-4 h-4 rounded bg-emerald-500"></div> Aceptable</div>
      </div>
    </div>
  );
};

export default RiskMatrix;
