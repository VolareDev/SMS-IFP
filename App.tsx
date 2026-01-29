
import React, { useState, useEffect, useMemo } from 'react';
import { IFPStage, RiskEntry, RiskLevel } from './types';
import { getRiskLevel, getRiskColor } from './constants';
import RiskMatrix from './components/RiskMatrix';
import RiskForm from './components/RiskForm';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, PieChart, Pie } from 'recharts';

const App: React.FC = () => {
  const [risks, setRisks] = useState<RiskEntry[]>(() => {
    const saved = localStorage.getItem('skyguard_risks');
    return saved ? JSON.parse(saved) : [];
  });

  const [filterStage, setFilterStage] = useState<string>('All');

  useEffect(() => {
    localStorage.setItem('skyguard_risks', JSON.stringify(risks));
  }, [risks]);

  const addRisk = (risk: RiskEntry) => {
    setRisks(prev => [risk, ...prev]);
  };

  const deleteRisk = (id: string) => {
    setRisks(prev => prev.filter(r => r.id !== id));
  };

  const updateStatus = (id: string, status: 'Active' | 'Mitigated' | 'Latent') => {
    setRisks(prev => prev.map(r => r.id === id ? { ...r, status, lastReview: Date.now() } : r));
  };

  const filteredRisks = useMemo(() => {
    return filterStage === 'All' ? risks : risks.filter(r => r.stage === filterStage);
  }, [risks, filterStage]);

  const chartData = useMemo(() => {
    return Object.values(IFPStage).map(stage => ({
      name: stage,
      count: risks.filter(r => r.stage === stage).length,
      high: risks.filter(r => r.stage === stage && getRiskLevel(r.likelihood, r.severity) === RiskLevel.HIGH).length,
      medium: risks.filter(r => r.stage === stage && getRiskLevel(r.likelihood, r.severity) === RiskLevel.MEDIUM).length,
      low: risks.filter(r => r.stage === stage && getRiskLevel(r.likelihood, r.severity) === RiskLevel.LOW).length,
    }));
  }, [risks]);

  const statusData = useMemo(() => [
    { name: 'Activos', value: risks.filter(r => r.status === 'Active').length, color: '#f43f5e' },
    { name: 'Mitigados', value: risks.filter(r => r.status === 'Mitigated').length, color: '#10b981' },
    { name: 'Latentes', value: risks.filter(r => r.status === 'Latent').length, color: '#f59e0b' },
  ], [risks]);

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Navbar */}
      <nav className="bg-slate-900 text-white p-4 sticky top-0 z-50 shadow-lg">
        <div className="container mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="bg-blue-500 p-2 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 10V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2Z"/><path d="M2 14v4a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-4"/><path d="M6 10V4"/><path d="M10 10V4"/><path d="M14 10V4"/><path d="M18 10V4"/></svg>
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight">SkyGuard SMS</h1>
              <p className="text-xs text-slate-400 font-medium">Gestión de Riesgos IFP (Doc 9859 / 8168)</p>
            </div>
          </div>
          <div className="flex items-center gap-6 text-sm overflow-x-auto pb-2 md:pb-0 w-full md:w-auto">
            <span className="bg-red-500/20 text-red-400 px-3 py-1 rounded-full font-semibold border border-red-500/30 whitespace-nowrap">
              Críticos: {risks.filter(r => getRiskLevel(r.likelihood, r.severity) === RiskLevel.HIGH).length}
            </span>
            <span className="bg-amber-500/20 text-amber-400 px-3 py-1 rounded-full font-semibold border border-amber-500/30 whitespace-nowrap">
              Latentes: {risks.filter(r => r.status === 'Latent').length}
            </span>
            <span className="bg-slate-700 px-3 py-1 rounded-full font-semibold border border-slate-600 whitespace-nowrap">
              Total Riesgos: {risks.length}
            </span>
          </div>
        </div>
      </nav>

      <main className="container mx-auto p-4 flex-grow grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Form & Statistics */}
        <div className="lg:col-span-4 space-y-6">
          <RiskForm onAdd={addRisk} />
          
          <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
            <h3 className="text-lg font-bold mb-4">Estado de Mitigación</h3>
            <div className="h-[250px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={statusData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {statusData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-2 space-y-2">
              {statusData.map(s => (
                <div key={s.name} className="flex justify-between items-center text-sm">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: s.color }}></div>
                    <span className="text-slate-600">{s.name}</span>
                  </div>
                  <span className="font-bold">{s.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: Dashboard & Table */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Top Row Graphics */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <RiskMatrix risks={risks} />
             <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
               <h3 className="text-lg font-bold mb-4">Riesgos por Etapa IFP</h3>
               <div className="h-[300px] w-full">
                 <ResponsiveContainer width="100%" height="100%">
                   <BarChart data={chartData} layout="vertical">
                     <CartesianGrid strokeDasharray="3 3" horizontal={false} />
                     <XAxis type="number" />
                     <YAxis dataKey="name" type="category" width={100} fontSize={10} />
                     <Tooltip />
                     <Bar dataKey="count" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                   </BarChart>
                 </ResponsiveContainer>
               </div>
             </div>
          </div>

          {/* Risk Register */}
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
            <div className="p-6 border-b border-slate-100 flex flex-col md:flex-row justify-between items-center gap-4">
              <h3 className="text-lg font-bold">Registro de Seguridad (Safety Register)</h3>
              <div className="flex items-center gap-2">
                <span className="text-sm text-slate-500">Filtrar por etapa:</span>
                <select 
                  className="px-3 py-1 border border-slate-300 rounded-md text-sm outline-none"
                  value={filterStage}
                  onChange={e => setFilterStage(e.target.value)}
                >
                  <option value="All">Todas las etapas</option>
                  {Object.values(IFPStage).map(s => (
                    <option key={s} value={s}>{s}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-slate-50 text-slate-500 text-xs uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="px-6 py-3">Riesgo / Etapa</th>
                    <th className="px-6 py-3">Nivel (Matriz)</th>
                    <th className="px-6 py-3">Estado</th>
                    <th className="px-6 py-3">Plan Mitigación</th>
                    <th className="px-6 py-3">Acciones</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {filteredRisks.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-6 py-12 text-center text-slate-400 italic">No se han registrado riesgos para esta etapa</td>
                    </tr>
                  ) : filteredRisks.map(risk => {
                    const level = getRiskLevel(risk.likelihood, risk.severity);
                    return (
                      <tr key={risk.id} className="hover:bg-slate-50 transition-colors group">
                        <td className="px-6 py-4">
                          <div className="font-bold text-slate-900">{risk.title}</div>
                          <div className="text-xs text-slate-400 mt-1 uppercase">{risk.stage}</div>
                        </td>
                        <td className="px-6 py-4">
                          <div className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold ${getRiskColor(level)} text-white`}>
                            {risk.likelihood}{risk.severity} - {level}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <select 
                            value={risk.status}
                            onChange={(e) => updateStatus(risk.id, e.target.value as any)}
                            className={`text-xs font-bold border rounded px-2 py-1 outline-none
                              ${risk.status === 'Active' ? 'text-red-600 border-red-200' : 
                                risk.status === 'Mitigated' ? 'text-emerald-600 border-emerald-200' : 
                                'text-amber-600 border-amber-200'}`}
                          >
                            <option value="Active">Activo (Peligro)</option>
                            <option value="Mitigated">Mitigado</option>
                            <option value="Latent">Latente (Vigilancia)</option>
                          </select>
                        </td>
                        <td className="px-6 py-4">
                          <p className="line-clamp-2 text-slate-600 text-xs max-w-[200px]" title={risk.mitigationPlan}>
                            {risk.mitigationPlan}
                          </p>
                        </td>
                        <td className="px-6 py-4">
                          <button 
                            onClick={() => deleteRisk(risk.id)}
                            className="text-slate-300 hover:text-red-500 transition-colors p-1"
                          >
                            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/><line x1="10" x2="10" y1="11" y2="17"/><line x1="14" x2="14" y1="11" y2="17"/></svg>
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Monitoring Parameters Section */}
          <div className="bg-indigo-900 text-white p-8 rounded-xl shadow-xl border border-indigo-700">
            <div className="flex items-center gap-4 mb-6">
              <div className="bg-indigo-500 p-3 rounded-xl">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12V7a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v10a2 2 0 0 0 2 2h7"/><path d="M3 10h18"/><path d="M15 19l2 2 4-4"/><path d="M10 5v5"/></svg>
              </div>
              <div>
                <h2 className="text-2xl font-bold">Vigilancia de Seguridad (Monitoring)</h2>
                <p className="text-indigo-200">Parámetros de rendimiento de seguridad (SPI) según OACI Doc 9859</p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
               <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                 <span className="text-indigo-200 text-xs font-bold uppercase">Eficiencia de Mitigación</span>
                 <div className="text-3xl font-bold mt-1">
                   {risks.length > 0 ? Math.round((risks.filter(r => r.status === 'Mitigated').length / risks.length) * 100) : 0}%
                 </div>
                 <div className="w-full bg-white/20 h-1 rounded-full mt-3 overflow-hidden">
                   <div 
                    className="bg-emerald-400 h-full transition-all duration-1000" 
                    style={{ width: `${risks.length > 0 ? (risks.filter(r => r.status === 'Mitigated').length / risks.length) * 100 : 0}%` }}
                   ></div>
                 </div>
               </div>

               <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                 <span className="text-indigo-200 text-xs font-bold uppercase">Índice de Riesgo Latente</span>
                 <div className="text-3xl font-bold mt-1 text-amber-400">
                   {risks.filter(r => r.status === 'Latent').length}
                 </div>
                 <p className="text-[10px] text-indigo-300 mt-2">Riesgos que requieren vigilancia continua por su potencial de re-activación.</p>
               </div>

               <div className="bg-white/10 backdrop-blur-sm p-4 rounded-lg border border-white/10">
                 <span className="text-indigo-200 text-xs font-bold uppercase">Críticos sin Resolver</span>
                 <div className="text-3xl font-bold mt-1 text-red-400">
                   {risks.filter(r => r.status === 'Active' && getRiskLevel(r.likelihood, r.severity) === RiskLevel.HIGH).length}
                 </div>
                 <p className="text-[10px] text-indigo-300 mt-2">Peligros de nivel INACEPTABLE que deben ser mitigados de inmediato antes de la publicación.</p>
               </div>
            </div>
            
            <div className="mt-8 p-4 bg-black/20 rounded-lg">
              <h4 className="text-sm font-bold flex items-center gap-2 mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-amber-400"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
                Nota de Cumplimiento (Doc 8168)
              </h4>
              <p className="text-xs text-indigo-200 leading-relaxed">
                El diseño de procedimientos de vuelo requiere una validación exhaustiva. Los riesgos identificados en la fase de <span className="text-white font-bold">Obtención de Información</span> (datos del terreno/obstáculos) son críticos. Si un riesgo se mantiene como "Latente" tras la <span className="text-white font-bold">Validación en Vuelo</span>, se debe establecer un periodo de revisión cíclica conforme a la normativa de seguridad operacional local.
              </p>
            </div>
          </div>
        </div>
      </main>
      
      <footer className="bg-slate-100 border-t border-slate-200 p-6 text-center text-slate-500 text-sm mt-12">
        <p>© 2024 SkyGuard SMS Toolkit - Cumplimiento OACI Anexo 19 y Doc 9859 / Doc 8168</p>
      </footer>
    </div>
  );
};

export default App;
