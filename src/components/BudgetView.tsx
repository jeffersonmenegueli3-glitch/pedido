import React from 'react';
import { MaintenanceOrder } from '../types/fleet';
import { formatCurrency, formatDateBR } from '../utils/fleetHelpers';
import { DollarSign, Edit3, AlertTriangle, TrendingUp, CheckCircle, Clock, ShieldAlert } from 'lucide-react';

interface BudgetViewProps {
  budgetData: {
    operacao?: string;
    orcamentoMensal: number;
    valorUtilizado: number;
    saldoDisponivel: number;
    percentualUtilizado: number;
    manutencoesAtrasadas: number;
  };
  maintenances: MaintenanceOrder[];
  selectedOperacao?: string;
  onOpenBudgetModal: () => void;
}

export const BudgetView: React.FC<BudgetViewProps> = ({
  budgetData,
  maintenances,
  selectedOperacao = 'Todas',
  onOpenBudgetModal
}) => {
  const filteredMaintenances = !selectedOperacao || selectedOperacao === 'Todas'
    ? maintenances
    : maintenances.filter(m => m.base === selectedOperacao || (selectedOperacao === 'Rio' && m.base === 'Rio de Janeiro'));

  // Sort maintenances by highest cost
  const sortedByCost = [...filteredMaintenances].sort((a, b) => (b.valor || 0) - (a.valor || 0));

  return (
    <div className="space-y-6">
      {/* Big Budget Summary Panel */}
      <div className="p-8 bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-6 border-b border-slate-800">
          <div>
            <span className="text-xs font-bold text-indigo-400 uppercase tracking-widest block mb-1">
              FINANCEIRO & MANUTENÇÃO
            </span>
            <h2 className="text-2xl font-black text-white">Painel de Orçamento Mensal</h2>
            <p className="text-xs text-slate-400 mt-1">Sincronização automática com todas as ordens lançadas</p>
          </div>

          <button
            onClick={onOpenBudgetModal}
            className="flex items-center gap-2 px-5 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm rounded-2xl shadow-lg shadow-indigo-600/30 transition active:scale-95 shrink-0"
          >
            <Edit3 className="w-4 h-4" />
            <span>✏️ ALTERAR ORÇAMENTO</span>
          </button>
        </div>

        {/* 5 Big KPI Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 pt-6">
          
          {/* Orçamento do Mês */}
          <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
            <span className="text-xs text-slate-400 font-medium block">Orçamento do Mês</span>
            <span className="text-2xl font-black text-white">{formatCurrency(budgetData.orcamentoMensal)}</span>
          </div>

          {/* Valor Utilizado */}
          <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
            <span className="text-xs text-amber-400 font-medium block">Valor Utilizado</span>
            <span className="text-2xl font-black text-amber-400">{formatCurrency(budgetData.valorUtilizado)}</span>
          </div>

          {/* Saldo Disponível */}
          <div className="p-5 bg-emerald-950/20 rounded-2xl border border-emerald-800/40 space-y-1">
            <span className="text-xs text-emerald-400 font-medium block">Saldo Disponível</span>
            <span className="text-2xl font-black text-emerald-400">{formatCurrency(budgetData.saldoDisponivel)}</span>
          </div>

          {/* % do Orçamento Utilizado */}
          <div className="p-5 bg-slate-800/60 rounded-2xl border border-slate-700/60 space-y-1">
            <span className="text-xs text-slate-400 font-medium block">% Utilizado</span>
            <span className="text-2xl font-black text-indigo-400">{budgetData.percentualUtilizado}%</span>
          </div>

          {/* Manutenções Atrasadas */}
          <div className="p-5 bg-rose-950/30 rounded-2xl border border-rose-800/50 space-y-1">
            <span className="text-xs text-rose-300 font-bold block flex items-center gap-1">
              🔴 Atrasadas
            </span>
            <span className="text-2xl font-black text-rose-300">{budgetData.manutencoesAtrasadas}</span>
          </div>

        </div>

        {/* Progress Bar Visual */}
        <div className="mt-6 space-y-2">
          <div className="flex justify-between text-xs font-bold text-slate-300">
            <span>Barra de Consumo Orçamentário</span>
            <span>{budgetData.percentualUtilizado}% Utilizado</span>
          </div>
          <div className="w-full h-4 bg-slate-800 rounded-full p-0.5 border border-slate-700 overflow-hidden">
            <div
              className={`h-full rounded-full transition-all duration-700 ${
                budgetData.percentualUtilizado > 90 ? 'bg-rose-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(100, budgetData.percentualUtilizado)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Top Maintenance Costs List */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <h3 className="font-bold text-white text-base">Despesas Lançadas por Manutenção</h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-800/80 text-slate-400 font-bold uppercase border-b border-slate-700">
              <tr>
                <th className="p-3">Placa</th>
                <th className="p-3">Atividade / Servico</th>
                <th className="p-3">Base</th>
                <th className="p-3">Prioridade</th>
                <th className="p-3">Status</th>
                <th className="p-3 text-right">Valor Custo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {sortedByCost.slice(0, 15).map((m) => (
                <tr key={m.id} className="hover:bg-slate-800/40">
                  <td className="p-3 font-mono font-bold text-white">{m.placa}</td>
                  <td className="p-3 font-medium text-slate-200">{m.atividadePendente}</td>
                  <td className="p-3">{m.base}</td>
                  <td className="p-3">{m.prioridade}</td>
                  <td className="p-3">
                    <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 border border-slate-700">
                      {m.status}
                    </span>
                  </td>
                  <td className="p-3 text-right font-bold text-amber-400">
                    {formatCurrency(m.valor || 0)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
