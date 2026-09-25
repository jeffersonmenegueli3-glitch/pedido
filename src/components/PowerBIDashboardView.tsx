import React, { useState } from 'react';
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
  LineChart,
  Line,
  CartesianGrid,
  Legend,
  ReferenceLine
} from 'recharts';
import {
  BarChart3,
  Filter,
  DollarSign,
  Truck,
  Wrench,
  Clock,
  AlertOctagon,
  Download,
  Printer,
  Sparkles,
  ArrowUpRight,
  TrendingUp,
  RotateCcw
} from 'lucide-react';

interface PowerBIDashboardViewProps {
  vehicles: Vehicle[];
  maintenances: MaintenanceOrder[];
  budgetData: {
    orcamentoMensal: number;
    valorUtilizado: number;
    saldoDisponivel: number;
    percentualUtilizado: number;
    manutencoesAtrasadas: number;
  };
  onOpenBudgetModal: () => void;
}

export const PowerBIDashboardView: React.FC<PowerBIDashboardViewProps> = ({
  vehicles,
  maintenances,
  budgetData,
  onOpenBudgetModal
}) => {
  // Slicer States
  const [selectedBase, setSelectedBase] = useState<string>('Todas');
  const [selectedMotivo, setSelectedMotivo] = useState<string>('Todos');
  const [selectedPrioridade, setSelectedPrioridade] = useState<string>('Todas');

  const basesList = ['Todas', ...Array.from(new Set(vehicles.map((v) => v.base).filter(Boolean)))];

  // Filtered Maintenances according to Power BI Slicers
  const filteredMaintenances = maintenances.filter((m) => {
    const matchesBase = selectedBase === 'Todas' || m.base === selectedBase;
    const matchesMotivo = selectedMotivo === 'Todos' || m.motivo === selectedMotivo;
    const matchesPrioridade = selectedPrioridade === 'Todas' || m.prioridade === selectedPrioridade;
    return matchesBase && matchesMotivo && matchesPrioridade;
  });

  // Filtered Vehicles according to Power BI Slicers
  const filteredVehicles = vehicles.filter((v) => {
    return selectedBase === 'Todas' || v.base === selectedBase;
  });

  // Key Power BI Metrics
  const totalCost = filteredMaintenances.reduce((acc, curr) => acc + (curr.valor || 0), 0);
  const totalOrdersCount = filteredMaintenances.length;
  const criticalStoppedCount = filteredVehicles.filter(
    (v) => (v.status === 'Parado' || v.status === 'Em manutenção') && calculateDaysStopped(v) >= 20
  ).length;

  const totalVehiclesCount = filteredVehicles.length;
  const operationalVehiclesCount = filteredVehicles.filter(
    (v) => v.status === 'Disponível' || v.status === 'Em operação'
  ).length;
  const availabilityRate = totalVehiclesCount > 0 ? (operationalVehiclesCount / totalVehiclesCount) * 100 : 0;

  // Power BI Color Palette
  const POWERBI_COLORS = {
    yellow: '#F2C80F',
    teal: '#118D95',
    blue: '#2B579A',
    coral: '#E81123',
    purple: '#5B2C6F',
    green: '#107C41'
  };

  // Visual 1 Data: Cost by Reason
  const costByReasonMap: Record<string, number> = {};
  filteredMaintenances.forEach((m) => {
    costByReasonMap[m.motivo] = (costByReasonMap[m.motivo] || 0) + (m.valor || 0);
  });
  const costByReasonData = Object.entries(costByReasonMap).map(([motivo, val]) => ({
    name: motivo,
    value: val
  }));

  // Visual 2 Data: Cost by Base
  const costByBaseMap: Record<string, number> = {};
  filteredMaintenances.forEach((m) => {
    if (m.base) {
      costByBaseMap[m.base] = (costByBaseMap[m.base] || 0) + (m.valor || 0);
    }
  });
  const costByBaseData = Object.entries(costByBaseMap)
    .map(([base, custo]) => ({ base, custo }))
    .sort((a, b) => b.custo - a.custo);

  // Visual 3 Data: Monthly Trend x Budget Line
  const monthlyTrendData = [
    { mes: 'Mai', custo: 28500, meta: budgetData.orcamentoMensal },
    { mes: 'Jun', custo: 31200, meta: budgetData.orcamentoMensal },
    { mes: 'Jul', custo: 34000, meta: budgetData.orcamentoMensal },
    { mes: 'Ago', custo: 29800, meta: budgetData.orcamentoMensal },
    { mes: 'Set (Atual)', custo: totalCost, meta: budgetData.orcamentoMensal }
  ];

  // Visual 4 Data: Top 5 Expensive Vehicles
  const vehicleCostMap: Record<string, number> = {};
  filteredMaintenances.forEach((m) => {
    vehicleCostMap[m.placa] = (vehicleCostMap[m.placa] || 0) + (m.valor || 0);
  });
  const topCostVehicles = Object.entries(vehicleCostMap)
    .map(([placa, custo]) => ({ placa, custo }))
    .sort((a, b) => b.custo - a.custo)
    .slice(0, 5);

  const resetSlicers = () => {
    setSelectedBase('Todas');
    setSelectedMotivo('Todos');
    setSelectedPrioridade('Todas');
  };

  return (
    <div className="space-y-6">
      {/* Power BI Brand Header & Slicer Control Bar */}
      <div className="p-5 bg-gradient-to-r from-slate-900 via-slate-900 to-indigo-950/60 border border-slate-800 rounded-3xl shadow-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/30 shadow-inner">
            <BarChart3 className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-black text-white tracking-wide">Dashboard Analítico Power BI</h2>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-300 border border-amber-500/30">
                PRO BI ANALYTICS
              </span>
            </div>
            <p className="text-xs text-slate-400">Indicadores executivos, segmentadores de dados (Slicers) e análises de custo.</p>
          </div>
        </div>

        {/* Export & Reset Actions */}
        <div className="flex items-center gap-2">
          <button
            onClick={resetSlicers}
            className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl border border-slate-700 transition"
          >
            <RotateCcw className="w-3.5 h-3.5 text-slate-400" />
            <span>Resetar Slicers</span>
          </button>

          <button
            onClick={() => window.print()}
            className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs rounded-xl shadow transition"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Imprimir Dashboard Power BI</span>
          </button>
        </div>
      </div>

      {/* Power BI Slicer Pane (Filtros de Segmentação) */}
      <div className="p-4 bg-slate-900/90 border border-slate-800 rounded-2xl flex flex-wrap items-center gap-4 text-xs shadow-lg">
        <span className="font-bold text-slate-300 flex items-center gap-1.5">
          <Filter className="w-4 h-4 text-amber-400" /> Slicers (Segmentadores de Dados):
        </span>

        {/* Slicer 1: Base */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Base:</span>
          <select
            value={selectedBase}
            onChange={(e) => setSelectedBase(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {basesList.map((b) => (
              <option key={b} value={b}>{b}</option>
            ))}
          </select>
        </div>

        {/* Slicer 2: Motivo */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Motivo:</span>
          <select
            value={selectedMotivo}
            onChange={(e) => setSelectedMotivo(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {['Todos', 'Preventiva', 'Corretiva', 'Desgaste'].map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>

        {/* Slicer 3: Prioridade */}
        <div className="flex items-center gap-2">
          <span className="text-slate-400">Prioridade:</span>
          <select
            value={selectedPrioridade}
            onChange={(e) => setSelectedPrioridade(e.target.value)}
            className="bg-slate-800 border border-slate-700 rounded-xl px-3 py-1.5 text-slate-200 font-semibold focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            {['Todas', 'Baixa', 'Média', 'Alta', 'Urgente'].map((p) => (
              <option key={p} value={p}>{p}</option>
            ))}
          </select>
        </div>

        {(selectedBase !== 'Todas' || selectedMotivo !== 'Todos' || selectedPrioridade !== 'Todas') && (
          <span className="px-2.5 py-1 bg-amber-500/10 text-amber-300 rounded-lg text-[11px] font-bold border border-amber-500/20">
            Filtros ativos aplicados ao relatório
          </span>
        )}
      </div>

      {/* Top 4 Power BI Executive KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
        
        {/* KPI Tile 1: Custo Total de Manutenção */}
        <div className="p-5 bg-slate-900 border-l-4 border-l-amber-500 border-y border-r border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>CUSTO TOTAL DE MANUTENÇÃO</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black text-amber-400">{formatCurrency(totalCost)}</div>
          <p className="text-[11px] text-slate-400">Com base nos slicers selecionados ({totalOrdersCount} ordens)</p>
        </div>

        {/* KPI Tile 2: Disponibilidade Operacional */}
        <div className="p-5 bg-slate-900 border-l-4 border-l-teal-500 border-y border-r border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>DISPONIBILIDADE DA FROTA</span>
            <Truck className="w-4 h-4 text-teal-400" />
          </div>
          <div className="text-2xl font-black text-teal-400">{availabilityRate.toFixed(1)}%</div>
          <p className="text-[11px] text-slate-400">{operationalVehiclesCount} de {totalVehiclesCount} veículos em operação/disponíveis</p>
        </div>

        {/* KPI Tile 3: Percentual do Orçamento Utilizado */}
        <div className="p-5 bg-slate-900 border-l-4 border-l-indigo-500 border-y border-r border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-slate-400">
            <span>ORÇAMENTO CONSUMIDO</span>
            <TrendingUp className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-black text-white">{budgetData.percentualUtilizado}%</div>
          <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden border border-slate-700 mt-1">
            <div
              className={`h-full ${budgetData.percentualUtilizado > 90 ? 'bg-rose-500' : 'bg-emerald-500'}`}
              style={{ width: `${Math.min(100, budgetData.percentualUtilizado)}%` }}
            />
          </div>
        </div>

        {/* KPI Tile 4: Veículos Críticos (+20 Dias) */}
        <div className="p-5 bg-slate-900 border-l-4 border-l-rose-500 border-y border-r border-slate-800 rounded-2xl shadow-xl space-y-2">
          <div className="flex justify-between items-center text-xs font-bold text-rose-400">
            <span>PARADOS +20 DIAS (ALERTA CRÍTICO)</span>
            <AlertOctagon className="w-4 h-4 text-rose-400" />
          </div>
          <div className="text-2xl font-black text-rose-400">{criticalStoppedCount}</div>
          <p className="text-[11px] text-slate-400">Requerem intervenção imediata da gestão</p>
        </div>

      </div>

      {/* Visual Charts Grid: 2 Columns */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Visual 1: Custo por Motivo (Rosca / Donut Power BI Style) */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">📊 Custo por Motivo (Preventiva x Corretiva x Desgaste)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={costByReasonData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  <Cell fill={POWERBI_COLORS.teal} />
                  <Cell fill={POWERBI_COLORS.coral} />
                  <Cell fill={POWERBI_COLORS.yellow} />
                </Pie>
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, 'Custo Total']}
                />
                <Legend
                  formatter={(val) => <span className="text-xs text-slate-300 font-semibold">{val}</span>}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 2: Custo por Base (Barras Horizontais Power BI) */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">🏢 Custo Acumulado por Base Operacional</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={costByBaseData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis type="number" stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `R$${v/1000}k`} />
                <YAxis dataKey="base" type="category" stroke="#94a3b8" fontSize={11} width={100} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, 'Custo']}
                />
                <Bar dataKey="custo" fill={POWERBI_COLORS.blue} radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 3: Linha de Tendência x Linha de Meta de Orçamento */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">📈 Tendência Mensal x Linha de Meta (R$ 50.000)</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrendData}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="mes" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, 'Valor']}
                />
                <ReferenceLine y={budgetData.orcamentoMensal} label="Teto de Orçamento" stroke="#f43f5e" strokeDasharray="4 4" />
                <Line type="monotone" dataKey="custo" stroke={POWERBI_COLORS.yellow} strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Visual 4: Top 5 Veículos Mais Caros */}
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-3">
          <div className="flex justify-between items-center">
            <h3 className="font-bold text-white text-base">🚛 Top 5 Veículos Mais Onerosos no Período</h3>
          </div>
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topCostVehicles}>
                <CartesianGrid strokeDasharray="3 3" stroke="#334155" opacity={0.5} />
                <XAxis dataKey="placa" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `R$${v/1000}k`} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  formatter={(val: any) => [`R$ ${Number(val).toLocaleString('pt-BR')}`, 'Gasto Total']}
                />
                <Bar dataKey="custo" fill={POWERBI_COLORS.purple} radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>
    </div>
  );
};
