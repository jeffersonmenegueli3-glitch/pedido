import React from 'react';
import { Vehicle, MaintenanceOrder } from '../types/fleet';
import { formatCurrency, calculateDaysStopped } from '../utils/fleetHelpers';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  CartesianGrid,
  Legend
} from 'recharts';
import {
  DollarSign,
  Truck,
  Wrench,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  CheckCircle2,
  Edit3,
  Play,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

interface DashboardViewProps {
  vehicles: Vehicle[];
  maintenances: MaintenanceOrder[];
  budgetData: {
    operacao?: string;
    orcamentoMensal: number;
    valorUtilizado: number;
    saldoDisponivel: number;
    percentualUtilizado: number;
    manutencoesAtrasadas: number;
  };
  selectedOperacao?: string;
  onOpenBudgetModal: () => void;
  onNavigateTab: (tab: string) => void;
}

export const DashboardView: React.FC<DashboardViewProps> = ({
  vehicles,
  maintenances,
  budgetData,
  selectedOperacao = 'Todas',
  onOpenBudgetModal,
  onNavigateTab
}) => {
  // Stats Calculations
  const totalVehicles = vehicles.length;
  const disponiveis = vehicles.filter((v) => v.status === 'Disponível').length;
  const emOperacao = vehicles.filter((v) => v.status === 'Em operação').length;
  const parados = vehicles.filter((v) => v.status === 'Parado').length;
  const emManutencao = vehicles.filter((v) => v.status === 'Em manutenção').length;

  const mPendentes = maintenances.filter((m) => m.status === 'Aberta').length;
  const mEmAndamento = maintenances.filter((m) => m.status === 'Em andamento').length;
  const mConcluidas = maintenances.filter((m) => m.status === 'Concluída').length;
  const mAtrasadas = maintenances.filter((m) => m.status === 'Atrasada').length;

  // Chart Data Preparation:
  // 1. Veículos por Status
  const statusPieData = [
    { name: 'Disponíveis', value: disponiveis, color: '#10b981' },
    { name: 'Em operação', value: emOperacao, color: '#3b82f6' },
    { name: 'Parados', value: parados, color: '#f59e0b' },
    { name: 'Em manutenção', value: emManutencao, color: '#f43f5e' }
  ];

  // 2. Custo por Base
  const baseCostMap: Record<string, number> = {};
  maintenances.forEach((m) => {
    if (m.base) {
      baseCostMap[m.base] = (baseCostMap[m.base] || 0) + (m.valor || 0);
    }
  });
  const costByBaseData = Object.entries(baseCostMap).map(([base, custo]) => ({
    base,
    custo
  }));

  // 3. Dias Parados por Veículo (Top 6 mais parados)
  const stoppedVehiclesData = vehicles
    .filter((v) => v.status === 'Parado' || v.status === 'Em manutenção')
    .map((v) => ({
      placa: v.placa,
      dias: calculateDaysStopped(v),
      status: v.status
    }))
    .sort((a, b) => b.dias - a.dias)
    .slice(0, 6);

  // 4. Manutenções por Mês (Histórico de Tendência)
  const maintenanceMonthlyData = [
    { mes: 'Mai', realizadas: 38, planejadas: 40, custo: 28500 },
    { mes: 'Jun', realizadas: 41, planejadas: 42, custo: 31200 },
    { mes: 'Jul', realizadas: 45, planejadas: 45, custo: 34000 },
    { mes: 'Ago', realizadas: 39, planejadas: 44, custo: 29800 },
    { mes: 'Set (Atual)', realizadas: mConcluidas, planejadas: maintenances.length, custo: budgetData.valorUtilizado }
  ];

  // 5. Custo de Manutenção por Veículo (Top 5 mais caros)
  const vehicleCostMap: Record<string, number> = {};
  maintenances.forEach((m) => {
    if (m.placa) {
      vehicleCostMap[m.placa] = (vehicleCostMap[m.placa] || 0) + (m.valor || 0);
    }
  });
  const costByVehicleData = Object.entries(vehicleCostMap)
    .map(([placa, custo]) => ({ placa, custo }))
    .sort((a, b) => b.custo - a.custo)
    .slice(0, 5);

  const isOverBudget = budgetData.saldoDisponivel < 0;

  return (
    <div className="space-y-6">
      {/* 3 Executive High-End Summary Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* CARD 1: FROTA TOTAL */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle Top Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-emerald-500" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600/30 to-indigo-500/20 text-blue-400 flex items-center justify-center border border-blue-500/30 shadow-lg shadow-blue-500/10 group-hover:scale-105 transition">
                  <Truck className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base tracking-wide flex items-center gap-2">
                    FROTA TOTAL
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    <strong className="text-white font-bold">{totalVehicles}</strong> veículos cadastrados no sistema
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('frota')}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700/60 shadow"
                title="Acessar gestão de frota"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Clean Metric Blocks with Clean Dividers */}
            <div className="grid grid-cols-2 gap-3 pt-5">
              
              {/* Disponíveis */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition group/item">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]" />
                  <span className="text-xs font-bold text-slate-300">Disponíveis</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white font-mono tabular-nums">{disponiveis}</span>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    {totalVehicles > 0 ? ((disponiveis / totalVehicles) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              {/* Em Operação */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-blue-500/40 transition group/item">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.8)]" />
                  <span className="text-xs font-bold text-slate-300">Em Operação</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white font-mono tabular-nums">{emOperacao}</span>
                  <span className="text-[10px] font-bold text-blue-400 font-mono bg-blue-500/10 px-1.5 py-0.5 rounded border border-blue-500/20">
                    {totalVehicles > 0 ? ((emOperacao / totalVehicles) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              {/* Parados */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition group/item">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.8)]" />
                  <span className="text-xs font-bold text-slate-300">Parados</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white font-mono tabular-nums">{parados}</span>
                  <span className="text-[10px] font-bold text-amber-400 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    {totalVehicles > 0 ? ((parados / totalVehicles) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

              {/* Em Manutenção */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-rose-500/40 transition group/item">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-rose-400 shadow-[0_0_8px_rgba(251,113,133,0.8)]" />
                  <span className="text-xs font-bold text-slate-300">Em Oficina</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white font-mono tabular-nums">{emManutencao}</span>
                  <span className="text-[10px] font-bold text-rose-400 font-mono bg-rose-500/10 px-1.5 py-0.5 rounded border border-rose-500/20">
                    {totalVehicles > 0 ? ((emManutencao / totalVehicles) * 100).toFixed(0) : 0}%
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Operabilidade da Frota:</span>
            <strong className="text-emerald-400 font-bold font-mono">
              {totalVehicles > 0 ? (((disponiveis + emOperacao) / totalVehicles) * 100).toFixed(1) : 0}% Ativa
            </strong>
          </div>
        </div>

        {/* CARD 2: MANUTENÇÃO */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
          {/* Subtle Top Gradient Line */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-amber-500 via-indigo-500 to-rose-500" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-amber-600/30 to-indigo-500/20 text-amber-400 flex items-center justify-center border border-amber-500/30 shadow-lg shadow-amber-500/10 group-hover:scale-105 transition">
                  <Wrench className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base tracking-wide flex items-center gap-2">
                    MANUTENÇÃO
                  </h3>
                  <p className="text-xs text-slate-400 font-medium">
                    <strong className="text-white font-bold">{maintenances.length}</strong> solicitações no histórico
                  </p>
                </div>
              </div>

              <button
                onClick={() => onNavigateTab('manutencoes')}
                className="p-2 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-xl transition border border-slate-700/60 shadow"
                title="Acessar ordens de manutenção"
              >
                <ArrowUpRight className="w-4 h-4" />
              </button>
            </div>

            {/* 4 Clean Metric Blocks */}
            <div className="grid grid-cols-2 gap-3 pt-5">
              
              {/* Pendentes */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-amber-500/40 transition">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  <span className="text-xs font-bold text-slate-300">Pendentes</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white font-mono tabular-nums">{mPendentes}</span>
                  <span className="text-[10px] font-bold text-amber-300 font-mono bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
                    Aguardando
                  </span>
                </div>
              </div>

              {/* Em Andamento */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-indigo-500/40 transition">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-indigo-400" />
                  <span className="text-xs font-bold text-slate-300">Em Andamento</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white font-mono tabular-nums">{mEmAndamento}</span>
                  <span className="text-[10px] font-bold text-indigo-300 font-mono bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
                    Executando
                  </span>
                </div>
              </div>

              {/* Concluídas */}
              <div className="p-3.5 bg-slate-950/60 rounded-2xl border border-slate-800 hover:border-emerald-500/40 transition">
                <div className="flex items-center gap-1.5 mb-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-bold text-slate-300">Concluídas</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-white font-mono tabular-nums">{mConcluidas}</span>
                  <span className="text-[10px] font-bold text-emerald-400 font-mono bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                    Finalizadas
                  </span>
                </div>
              </div>

              {/* Atrasadas (High Urgency) */}
              <div className={`p-3.5 rounded-2xl border transition ${
                mAtrasadas > 0
                  ? 'bg-rose-950/30 border-rose-800/60 animate-pulse'
                  : 'bg-slate-950/60 border-slate-800'
              }`}>
                <div className="flex items-center gap-1.5 mb-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-rose-400" />
                  <span className="text-xs font-bold text-rose-300">Atrasadas</span>
                </div>
                <div className="flex items-baseline justify-between">
                  <span className="text-3xl font-black text-rose-300 font-mono tabular-nums">{mAtrasadas}</span>
                  <span className="text-[10px] font-bold text-rose-300 font-mono bg-rose-500/20 px-1.5 py-0.5 rounded border border-rose-500/30">
                    Ação Necessária
                  </span>
                </div>
              </div>

            </div>
          </div>

          <div className="pt-4 mt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Taxa de Resolução:</span>
            <strong className="text-indigo-400 font-bold font-mono">
              {maintenances.length > 0 ? ((mConcluidas / maintenances.length) * 100).toFixed(0) : 0}% Concluídas
            </strong>
          </div>
        </div>

        {/* CARD 3: CONTROLE DE ORÇAMENTO */}
        <div className="p-6 bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl shadow-2xl transition-all duration-300 relative overflow-hidden flex flex-col justify-between group">
          {/* Top Line Color Reflecting Budget Status */}
          <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${
            isOverBudget
              ? 'from-rose-600 via-amber-500 to-red-500'
              : 'from-emerald-500 via-teal-400 to-indigo-500'
          }`} />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-3">
                <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shadow-lg group-hover:scale-105 transition ${
                  isOverBudget
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/30 shadow-rose-500/10'
                    : 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30 shadow-emerald-500/10'
                }`}>
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-extrabold text-white text-base tracking-wide flex items-center gap-2">
                    CONTROLE FINANCEIRO
                  </h3>
                  <p className="text-xs text-slate-400 font-medium flex items-center gap-1.5 flex-wrap">
                    <span>Mês Vigente <strong className="text-slate-300">(Set/2026)</strong></span>
                    <span className="text-slate-600">•</span>
                    <span className="px-2 py-0.5 rounded-md bg-indigo-500/20 text-indigo-300 font-bold text-[11px] border border-indigo-500/30">
                      📍 {selectedOperacao === 'Rio' ? 'Rio de Janeiro' : selectedOperacao === 'Todas' ? 'Todas as Operações' : selectedOperacao}
                    </span>
                  </p>
                </div>
              </div>

              <button
                onClick={onOpenBudgetModal}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition shadow-md cursor-pointer"
                title="Alterar limite orçamentário mensal"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>ALTERAR</span>
              </button>
            </div>

            {/* Financial Rows with Tabular Alignment */}
            <div className="space-y-3.5 pt-4">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Orçamento Mensal:</span>
                <span className="text-base font-extrabold text-white font-mono tabular-nums">
                  {formatCurrency(budgetData.orcamentoMensal)}
                </span>
              </div>

              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400 font-medium">Valor Utilizado:</span>
                <span className="text-base font-extrabold text-amber-400 font-mono tabular-nums">
                  {formatCurrency(budgetData.valorUtilizado)}
                </span>
              </div>

              {/* Saldo Badge */}
              <div className={`p-3 rounded-2xl border flex items-center justify-between transition ${
                isOverBudget
                  ? 'bg-rose-950/40 border-rose-800/60 text-rose-300'
                  : 'bg-emerald-950/30 border-emerald-800/50 text-emerald-300'
              }`}>
                <div className="flex items-center gap-2">
                  {isOverBudget ? (
                    <AlertCircle className="w-4 h-4 text-rose-400" />
                  ) : (
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  )}
                  <span className="text-xs font-bold">
                    {isOverBudget ? 'Estouro de Teto:' : 'Saldo Disponível:'}
                  </span>
                </div>
                <span className={`text-lg font-black font-mono tabular-nums ${
                  isOverBudget ? 'text-rose-400' : 'text-emerald-400'
                }`}>
                  {formatCurrency(budgetData.saldoDisponivel)}
                </span>
              </div>

              {/* Progress Bar */}
              <div className="space-y-1.5 pt-1">
                <div className="flex justify-between items-center text-xs font-bold">
                  <span className="text-slate-400 text-[11px] uppercase tracking-wider">% Utilizado</span>
                  <span className={`font-mono text-sm ${isOverBudget ? 'text-rose-400' : 'text-indigo-400'}`}>
                    {budgetData.percentualUtilizado}%
                  </span>
                </div>
                
                <div className="w-full h-2.5 bg-slate-950 rounded-full overflow-hidden p-0.5 border border-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-700 ${
                      isOverBudget
                        ? 'bg-gradient-to-r from-rose-600 to-red-500 shadow-[0_0_12px_rgba(239,68,68,0.8)]'
                        : budgetData.percentualUtilizado > 80
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500'
                        : 'bg-gradient-to-r from-emerald-500 to-teal-400'
                    }`}
                    style={{ width: `${Math.min(100, budgetData.percentualUtilizado)}%` }}
                  />
                </div>
              </div>

            </div>
          </div>

          <div className="pt-3 mt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
            <span>Status do Mês:</span>
            <strong className={`font-bold uppercase ${isOverBudget ? 'text-rose-400' : 'text-emerald-400'}`}>
              {isOverBudget ? '🚨 Acima do Limite' : '🟢 Dentro do Teto'}
            </strong>
          </div>
        </div>

      </div>

      {/* Recharts Analytics Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Chart 1: Distribution of Vehicles by Status */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Distribuição da Frota por Status</h3>
              <p className="text-xs text-slate-400">Visão proporcional dos veículos cadastrados</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={statusPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {statusPieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} stroke="#0f172a" strokeWidth={2} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Legend
                  verticalAlign="bottom"
                  height={36}
                  formatter={(value) => <span className="text-xs font-medium text-slate-300">{value}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Custo de Manutenção por Base / Operação */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base">Custo de Manutenção por Operação</h3>
              <p className="text-xs text-slate-400">Gasto total acumulado por base regional</p>
            </div>
          </div>

          <div className="h-64 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costByBaseData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis dataKey="base" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis
                  stroke="#94a3b8"
                  fontSize={11}
                  tickLine={false}
                  tickFormatter={(val) => `R$${val >= 1000 ? `${(val / 1000).toFixed(0)}k` : val}`}
                />
                <Tooltip
                  formatter={(value: any) => [formatCurrency(Number(value || 0)), 'Custo Total']}
                  contentStyle={{
                    backgroundColor: '#1e293b',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px'
                  }}
                />
                <Bar dataKey="custo" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Top Parados & Top Custos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Top Veículos mais Tempo Parados */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-amber-400" />
                Ranking de Veículos Parados
              </h3>
              <p className="text-xs text-slate-400">Maiores tempos de inatividade ou oficina</p>
            </div>
          </div>

          <div className="space-y-3">
            {stoppedVehiclesData.map((v) => (
              <div
                key={v.placa}
                className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 hover:bg-slate-800 transition"
              >
                <div className="flex items-center gap-3">
                  <span className="font-mono font-bold text-white text-sm bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                    {v.placa}
                  </span>
                  <span className="text-xs text-slate-300 font-semibold">{v.status}</span>
                </div>

                <div className="flex items-center gap-2">
                  <span className={`text-xs font-mono font-extrabold px-2.5 py-1 rounded-lg ${
                    v.dias >= 20
                      ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40 animate-pulse'
                      : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                  }`}>
                    {v.dias} dias
                  </span>
                </div>
              </div>
            ))}

            {stoppedVehiclesData.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                Nenhum veículo parado ou em manutenção no momento! 🎉
              </p>
            )}
          </div>
        </div>

        {/* Top Custos por Veículo */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                Maior Custo de Manutenção
              </h3>
              <p className="text-xs text-slate-400">Veículos com maior despesa acumulada</p>
            </div>
          </div>

          <div className="space-y-3">
            {costByVehicleData.map((v) => (
              <div
                key={v.placa}
                className="flex items-center justify-between p-3 bg-slate-800/60 rounded-2xl border border-slate-700/60 hover:bg-slate-800 transition"
              >
                <span className="font-mono font-bold text-white text-sm bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-700">
                  {v.placa}
                </span>

                <span className="text-sm font-mono font-extrabold text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-lg border border-emerald-500/20">
                  {formatCurrency(v.custo)}
                </span>
              </div>
            ))}

            {costByVehicleData.length === 0 && (
              <p className="text-xs text-slate-400 text-center py-6">
                Nenhuma despesa de manutenção registrada ainda.
              </p>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
