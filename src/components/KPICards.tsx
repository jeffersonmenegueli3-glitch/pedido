import React from 'react';
import { Vehicle } from '../types/fleet';
import { calculateDaysStopped } from '../utils/fleetHelpers';
import { Truck, CheckCircle2, Play, Clock, Wrench, AlertOctagon, Filter, Layers, MapPin } from 'lucide-react';

interface KPICardsProps {
  vehicles: Vehicle[];
  onSelectStatusFilter: (status: string) => void;
  selectedFilter: string;
  selectedOperacao: string;
  onSelectOperacao: (operacao: string) => void;
}

function normalizeBase(baseName?: string): string {
  if (!baseName) return 'Todas';
  const clean = baseName.trim().toLowerCase();
  if (clean === 'rio' || clean === 'rio de janeiro' || clean.includes('rio')) return 'Rio';
  if (clean === 'interior') return 'Interior';
  if (clean === 'redespacho') return 'Redespacho';
  if (clean === 'todas' || clean === 'all') return 'Todas';
  return baseName;
}

export const KPICards: React.FC<KPICardsProps> = ({
  vehicles,
  onSelectStatusFilter,
  selectedFilter,
  selectedOperacao,
  onSelectOperacao
}) => {
  // Filter vehicles dynamically by the selected operation
  const targetNorm = normalizeBase(selectedOperacao);
  const targetVehicles = targetNorm === 'Todas'
    ? vehicles
    : vehicles.filter((v) => normalizeBase(v.base) === targetNorm);

  const total = targetVehicles.length || 1;
  const disponiveis = targetVehicles.filter((v) => v.status === 'Disponível').length;
  const emOperacao = targetVehicles.filter((v) => v.status === 'Em operação').length;
  const operacionaisTotal = disponiveis + emOperacao;

  const parados = targetVehicles.filter((v) => v.status === 'Parado').length;
  const emManutencao = targetVehicles.filter((v) => v.status === 'Em manutenção').length;
  const inativosTotal = parados + emManutencao;

  const parados20DiasPlus = targetVehicles.filter(
    (v) => (v.status === 'Parado' || v.status === 'Em manutenção') && calculateDaysStopped(v) >= 20
  ).length;

  return (
    <div className="space-y-4">
      {/* Operação Selector Bar above KPI Cards */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 p-3.5 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <MapPin className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">
              Operação Selecionada: <span className="text-indigo-400 font-black">{selectedOperacao || 'Todas'}</span>
            </h3>
            <p className="text-[11px] text-slate-400">
              Altere a operação para recalcular todos os cards e gráficos em tempo real
            </p>
          </div>
        </div>

        {/* Buttons for Rio, Interior, Redespacho, Todas */}
        <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl w-full sm:w-auto overflow-x-auto">
          {['Todas', 'Rio', 'Interior', 'Redespacho'].map((op) => {
            const isSel = selectedOperacao === op || (op === 'Todas' && (!selectedOperacao || selectedOperacao === 'Todas'));
            const opCount = op === 'Todas' ? vehicles.length : vehicles.filter((v) => v.base === op).length;

            return (
              <button
                key={op}
                onClick={() => onSelectOperacao(op)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-extrabold transition flex items-center gap-2 whitespace-nowrap cursor-pointer ${
                  isSel
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30 scale-105'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <span>{op === 'Todas' ? '🌐 TODAS' : `📍 ${op.toUpperCase()}`}</span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-md font-mono font-bold ${
                    isSel ? 'bg-indigo-700 text-white' : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {opCount}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {/* 4 Combined KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        
        {/* CARD 1: TOTAL DE VEÍCULOS DA OPERAÇÃO */}
        <div
          onClick={() => onSelectStatusFilter('')}
          className={`group relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-300 text-left overflow-hidden shadow-xl backdrop-blur-md cursor-pointer ${
            !selectedFilter
              ? 'border-indigo-500/80 ring-2 ring-indigo-500/30 bg-indigo-950/30 shadow-indigo-900/30'
              : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 hover:-translate-y-1'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-indigo-500 to-violet-500" />

          <div>
            <div className="flex items-center justify-between mb-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-indigo-400 shadow-[0_0_12px_rgba(99,102,241,0.8)]" />
                <span className="text-xs font-extrabold tracking-wider uppercase text-slate-300 group-hover:text-white transition">
                  TOTAL DA FROTA {selectedOperacao !== 'Todas' && `(${selectedOperacao.toUpperCase()})`}
                </span>
              </div>

              <div className="p-2.5 rounded-2xl border border-indigo-500/30 bg-indigo-500/15 text-indigo-400 shadow-indigo-500/20 shadow-md">
                <Truck className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-2 mb-1">
              <span className="text-4xl font-black text-white tracking-tight font-mono tabular-nums">
                {targetVehicles.length}
              </span>
              <span className="text-xs font-bold text-slate-400 bg-slate-800/80 px-2.5 py-0.5 rounded-lg border border-slate-700/60 font-mono">
                100%
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium mb-3">
              {selectedOperacao === 'Todas' ? 'Todos os veículos do sistema' : `Veículos da Operação ${selectedOperacao}`}
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-500 font-medium">Filtro de Status</span>
            {!selectedFilter ? (
              <span className="font-bold text-indigo-400 flex items-center gap-1">
                <Filter className="w-3 h-3" /> Exibindo Todos
              </span>
            ) : (
              <span className="text-slate-400 group-hover:text-white underline">Mostrar Todos</span>
            )}
          </div>
        </div>

        {/* CARD 2: DISPONÍVEIS & EM OPERAÇÃO */}
        <div
          className={`group relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-300 text-left overflow-hidden shadow-xl backdrop-blur-md ${
            selectedFilter === 'Operacionais' || selectedFilter === 'Disponível' || selectedFilter === 'Em operação'
              ? 'border-emerald-500/80 ring-2 ring-emerald-500/30 bg-emerald-950/30 shadow-emerald-900/30'
              : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 hover:-translate-y-1'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-400 to-blue-500" />

          <div>
            <div className="flex items-center justify-between mb-3 pt-1">
              <button
                onClick={() => onSelectStatusFilter('Operacionais')}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.8)]" />
                <span className="text-xs font-extrabold tracking-wider uppercase text-emerald-400 group-hover:text-emerald-300 transition">
                  DISPONÍVEIS & EM OPERAÇÃO
                </span>
              </button>

              <div className="p-2.5 rounded-2xl border border-emerald-500/30 bg-emerald-500/15 text-emerald-400 shadow-emerald-500/20 shadow-md flex items-center gap-1">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div
              onClick={() => onSelectStatusFilter('Operacionais')}
              className="cursor-pointer flex items-baseline justify-between mt-1 mb-2"
            >
              <span className="text-4xl font-black text-white tracking-tight font-mono tabular-nums">
                {operacionaisTotal}
              </span>
              <span className="text-xs font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-0.5 rounded-lg border border-emerald-500/30 font-mono">
                {((operacionaisTotal / total) * 100).toFixed(0)}% da Frota
              </span>
            </div>

            {/* Sub-Pills for Individual Sub-Filters */}
            <div className="grid grid-cols-2 gap-2 my-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStatusFilter(selectedFilter === 'Em operação' ? '' : 'Em operação');
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                  selectedFilter === 'Em operação'
                    ? 'bg-blue-500/20 border-blue-500 text-blue-300 shadow'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-blue-500/50 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Play className="w-3 h-3 text-blue-400" /> Em Operação
                </span>
                <span className="font-mono font-bold text-white ml-1">{emOperacao}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStatusFilter(selectedFilter === 'Disponível' ? '' : 'Disponível');
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                  selectedFilter === 'Disponível'
                    ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300 shadow'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-emerald-500/50 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <CheckCircle2 className="w-3 h-3 text-emerald-400" /> Disponíveis
                </span>
                <span className="font-mono font-bold text-white ml-1">{disponiveis}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Veículos Ativos</span>
            <button
              onClick={() => onSelectStatusFilter(selectedFilter === 'Operacionais' ? '' : 'Operacionais')}
              className="font-bold text-emerald-400 hover:underline"
            >
              {selectedFilter === 'Operacionais' ? 'Filtro Conjunto Ativo' : 'Filtrar Ambos'}
            </button>
          </div>
        </div>

        {/* CARD 3: PARADOS & EM MANUTENÇÃO */}
        <div
          className={`group relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-300 text-left overflow-hidden shadow-xl backdrop-blur-md ${
            selectedFilter === 'Inativos' || selectedFilter === 'Parado' || selectedFilter === 'Em manutenção'
              ? 'border-amber-500/80 ring-2 ring-amber-500/30 bg-amber-950/30 shadow-amber-900/30'
              : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 hover:-translate-y-1'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-amber-500 via-orange-400 to-rose-500" />

          <div>
            <div className="flex items-center justify-between mb-3 pt-1">
              <button
                onClick={() => onSelectStatusFilter('Inativos')}
                className="flex items-center gap-2 hover:opacity-80 transition"
              >
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 shadow-[0_0_12px_rgba(251,191,36,0.8)]" />
                <span className="text-xs font-extrabold tracking-wider uppercase text-amber-400 group-hover:text-amber-300 transition">
                  PARADOS & EM MANUTENÇÃO
                </span>
              </button>

              <div className="p-2.5 rounded-2xl border border-amber-500/30 bg-amber-500/15 text-amber-400 shadow-amber-500/20 shadow-md flex items-center gap-1">
                <Layers className="w-4 h-4" />
              </div>
            </div>

            <div
              onClick={() => onSelectStatusFilter('Inativos')}
              className="cursor-pointer flex items-baseline justify-between mt-1 mb-2"
            >
              <span className="text-4xl font-black text-white tracking-tight font-mono tabular-nums">
                {inativosTotal}
              </span>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2.5 py-0.5 rounded-lg border border-amber-500/30 font-mono">
                {((inativosTotal / total) * 100).toFixed(0)}% da Frota
              </span>
            </div>

            {/* Sub-Pills for Individual Sub-Filters */}
            <div className="grid grid-cols-2 gap-2 my-2">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStatusFilter(selectedFilter === 'Parado' ? '' : 'Parado');
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                  selectedFilter === 'Parado'
                    ? 'bg-amber-500/20 border-amber-500 text-amber-300 shadow'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-amber-500/50 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Clock className="w-3 h-3 text-amber-400" /> Parados
                </span>
                <span className="font-mono font-bold text-white ml-1">{parados}</span>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectStatusFilter(selectedFilter === 'Em manutenção' ? '' : 'Em manutenção');
                }}
                className={`px-2.5 py-1.5 rounded-xl border text-xs font-semibold flex items-center justify-between transition ${
                  selectedFilter === 'Em manutenção'
                    ? 'bg-rose-500/20 border-rose-500 text-rose-300 shadow'
                    : 'bg-slate-800/80 border-slate-700/80 text-slate-300 hover:border-rose-500/50 hover:text-white'
                }`}
              >
                <span className="flex items-center gap-1.5 truncate">
                  <Wrench className="w-3 h-3 text-rose-400" /> Oficina
                </span>
                <span className="font-mono font-bold text-white ml-1">{emManutencao}</span>
              </button>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Veículos Inativos</span>
            <button
              onClick={() => onSelectStatusFilter(selectedFilter === 'Inativos' ? '' : 'Inativos')}
              className="font-bold text-amber-400 hover:underline"
            >
              {selectedFilter === 'Inativos' ? 'Filtro Conjunto Ativo' : 'Filtrar Ambos'}
            </button>
          </div>
        </div>

        {/* CARD 4: PARADOS +20 DIAS */}
        <div
          onClick={() => onSelectStatusFilter(selectedFilter === 'Parados 20+ Dias' ? '' : 'Parados 20+ Dias')}
          className={`group relative flex flex-col justify-between p-5 rounded-3xl border transition-all duration-300 text-left overflow-hidden shadow-xl backdrop-blur-md cursor-pointer ${
            selectedFilter === 'Parados 20+ Dias'
              ? 'border-red-500 ring-2 ring-red-500/40 bg-red-950/40 shadow-red-950/50'
              : 'bg-slate-900/90 border-slate-800/90 hover:border-slate-700 hover:bg-slate-850 hover:-translate-y-1'
          }`}
        >
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-600 via-rose-500 to-amber-500 animate-pulse" />

          <div>
            <div className="flex items-center justify-between mb-3 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-[0_0_14px_rgba(239,68,68,1)] animate-ping" />
                <span className="text-xs font-extrabold tracking-wider uppercase text-rose-400 group-hover:text-rose-300 transition">
                  PARADOS +20 DIAS
                </span>
              </div>

              <div className="p-2.5 rounded-2xl border border-red-500/50 bg-red-500/20 text-red-300 shadow-red-500/30 shadow-md">
                <AlertOctagon className="w-4 h-4" />
              </div>
            </div>

            <div className="flex items-baseline justify-between mt-2 mb-1">
              <span className="text-4xl font-black text-rose-300 tracking-tight font-mono tabular-nums">
                {parados20DiasPlus}
              </span>
              <span className="text-xs font-bold text-rose-300 bg-red-500/20 px-2.5 py-0.5 rounded-lg border border-red-500/40 font-mono">
                🚨 Atenção Crítica
              </span>
            </div>

            <p className="text-xs text-slate-400 font-medium mb-3">
              Inativos ou na oficina por tempo prolongado
            </p>
          </div>

          <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px]">
            <span className="text-slate-400 font-medium">Urgência de Ação</span>
            <span className="font-bold text-rose-400 group-hover:underline">
              {selectedFilter === 'Parados 20+ Dias' ? 'Filtro Ativo' : 'Filtrar Críticos'}
            </span>
          </div>
        </div>

      </div>
    </div>
  );
};
