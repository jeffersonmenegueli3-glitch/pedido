import React, { useState } from 'react';
import { MaintenanceOrder, MaintenanceStatus, MaintenancePriority } from '../types/fleet';
import { formatCurrency, formatDateBR, getOSNumber } from '../utils/fleetHelpers';
import { OSDetailModal } from './OSDetailModal';
import {
  Wrench,
  Plus,
  CheckCircle2,
  Clock,
  MapPin,
  User,
  Edit3,
  Check,
  Lock,
  Layers,
  Trash2,
  CheckSquare,
  Square,
  PackagePlus,
  Download,
  Table as TableIcon,
  LayoutGrid,
  FilterX,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  RotateCcw,
  Search,
  FileSpreadsheet
} from 'lucide-react';

interface MaintenanceViewProps {
  maintenances: MaintenanceOrder[];
  searchQuery: string;
  selectedOperacao?: string;
  onSelectOperacao?: (op: string) => void;
  selectedStatusFilter?: string;
  onSelectStatusFilter?: (status: string) => void;
  onOpenAddMaintenanceModal: () => void;
  onOpenBulkMaintenanceModal: () => void;
  onOpenExcelImportModal?: () => void;
  onOpenEditMaintenanceModal: (order: MaintenanceOrder) => void;
  onUpdateOrderStatus: (order: MaintenanceOrder, newStatus: MaintenanceStatus) => void;
  onApproveStep: (order: MaintenanceOrder, step: 'aprovacao1' | 'aprovacao2' | 'conclusao') => void;
  onBulkDeleteMaintenances: (ids: string[]) => void;
}

export const MaintenanceView: React.FC<MaintenanceViewProps> = ({
  maintenances,
  searchQuery,
  selectedOperacao = 'Todas',
  onSelectOperacao,
  selectedStatusFilter = '',
  onSelectStatusFilter,
  onOpenAddMaintenanceModal,
  onOpenBulkMaintenanceModal,
  onOpenExcelImportModal,
  onOpenEditMaintenanceModal,
  onUpdateOrderStatus,
  onApproveStep,
  onBulkDeleteMaintenances
}) => {
  const [workflowFilter, setWorkflowFilter] = useState<string>('Todas');
  const [priorityFilter, setPriorityFilter] = useState<string>('Todas');
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('table'); // Default to table as requested
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [selectedOSForDetail, setSelectedOSForDetail] = useState<MaintenanceOrder | null>(null);

  // Per-Column Filter States
  const [colFilters, setColFilters] = useState({
    numeroOS: '',
    atividade: '',
    motivo: '',
    placa: '',
    kmMin: '',
    valorMin: '',
    prioridade: '',
    motorista: '',
    base: '',
    status: '',
    data: ''
  });

  // Sorting State
  const [sortCol, setSortCol] = useState<string | null>(null);
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const handleSort = (columnKey: string) => {
    if (sortCol === columnKey) {
      if (sortDir === 'asc') setSortDir('desc');
      else {
        setSortCol(null);
        setSortDir('asc');
      }
    } else {
      setSortCol(columnKey);
      setSortDir('asc');
    }
  };

  const handleClearColFilters = () => {
    setColFilters({
      numeroOS: '',
      atividade: '',
      motivo: '',
      placa: '',
      kmMin: '',
      valorMin: '',
      prioridade: '',
      motorista: '',
      base: '',
      status: '',
      data: ''
    });
  };

  const handleClearAllFilters = () => {
    handleClearColFilters();
    setWorkflowFilter('Todas');
    setPriorityFilter('Todas');
    if (onSelectOperacao) onSelectOperacao('Todas');
    if (onSelectStatusFilter) onSelectStatusFilter('');
  };

  const isColFilterActive = Object.values(colFilters).some((v) => v !== '');
  const isGlobalFilterActive =
    isColFilterActive ||
    workflowFilter !== 'Todas' ||
    priorityFilter !== 'Todas' ||
    (selectedOperacao && selectedOperacao !== 'Todas') ||
    Boolean(selectedStatusFilter);

  const filteredOrders = maintenances.filter((m) => {
    // 1. Search Query
    const query = searchQuery.toLowerCase();
    const osNum = getOSNumber(m).toLowerCase();
    const matchesSearch =
      !query ||
      osNum.includes(query) ||
      (m.numeroOS && m.numeroOS.toLowerCase().includes(query)) ||
      m.placa.toLowerCase().includes(query) ||
      m.atividadePendente.toLowerCase().includes(query) ||
      m.motorista.toLowerCase().includes(query) ||
      m.base.toLowerCase().includes(query) ||
      m.motivo.toLowerCase().includes(query);

    // 2. Operação (Base) Filter
    const matchesOperacao =
      !selectedOperacao || selectedOperacao === 'Todas' || m.base === selectedOperacao;

    // 3. Status Filter (from global KPI cards or header)
    let matchesStatus = true;
    if (selectedStatusFilter) {
      if (selectedStatusFilter === 'Inativos') {
        matchesStatus = m.status === 'Em andamento' || m.status === 'Atrasada' || m.status === 'Aberta';
      } else if (selectedStatusFilter === 'Operacionais') {
        matchesStatus = m.status === 'Concluída';
      } else {
        matchesStatus = m.status === selectedStatusFilter;
      }
    }

    // 4. Workflow Filter
    let matchesWorkflow = true;
    if (workflowFilter === 'Aguardando 1ª Aprovação') {
      matchesWorkflow = !m.aprovacao1?.aprovado && m.status !== 'Concluída';
    } else if (workflowFilter === 'Aguardando 2ª Aprovação') {
      matchesWorkflow = m.aprovacao1?.aprovado === true && !m.aprovacao2?.aprovado && m.status !== 'Concluída';
    } else if (workflowFilter === 'Pronto p/ Concluir') {
      matchesWorkflow = m.aprovacao1?.aprovado === true && m.aprovacao2?.aprovado === true && m.status !== 'Concluída';
    } else if (workflowFilter === 'Concluídas') {
      matchesWorkflow = m.status === 'Concluída' || m.conclusao?.aprovado === true;
    } else if (workflowFilter === 'Atrasadas') {
      matchesWorkflow = m.status === 'Atrasada';
    }

    // 5. Priority Filter
    const matchesPriority = priorityFilter === 'Todas' || m.prioridade === priorityFilter;

    return matchesSearch && matchesOperacao && matchesStatus && matchesWorkflow && matchesPriority;
  });

  // Apply Per-Column Filters and Sorting
  const finalOrders = filteredOrders
    .filter((m) => {
      if (colFilters.numeroOS && !getOSNumber(m).toLowerCase().includes(colFilters.numeroOS.toLowerCase())) return false;
      if (colFilters.atividade && !m.atividadePendente.toLowerCase().includes(colFilters.atividade.toLowerCase())) return false;
      if (colFilters.motivo && m.motivo !== colFilters.motivo) return false;
      if (colFilters.placa && !m.placa.toLowerCase().includes(colFilters.placa.toLowerCase())) return false;
      if (colFilters.kmMin && (m.km || 0) < Number(colFilters.kmMin)) return false;
      if (colFilters.valorMin && (m.valor || 0) < Number(colFilters.valorMin)) return false;
      if (colFilters.prioridade && m.prioridade !== colFilters.prioridade) return false;
      if (colFilters.motorista && !(m.motorista || '').toLowerCase().includes(colFilters.motorista.toLowerCase())) return false;
      if (colFilters.base && m.base !== colFilters.base) return false;
      if (colFilters.status) {
        if (colFilters.status === 'Concluída' && !(m.status === 'Concluída' || m.conclusao?.aprovado)) return false;
        if (colFilters.status === 'Atrasada' && m.status !== 'Atrasada') return false;
        if (colFilters.status === 'Em andamento' && (m.status === 'Concluída' || m.status === 'Atrasada')) return false;
      }
      if (colFilters.data && !formatDateBR(m.dataAtualizacao).includes(colFilters.data)) return false;

      return true;
    })
    .sort((a, b) => {
      if (!sortCol) return 0;
      let valA: any = sortCol === 'numeroOS' ? getOSNumber(a) : (a[sortCol as keyof MaintenanceOrder] || '');
      let valB: any = sortCol === 'numeroOS' ? getOSNumber(b) : (b[sortCol as keyof MaintenanceOrder] || '');

      if (typeof valA === 'string') valA = valA.toLowerCase();
      if (typeof valB === 'string') valB = valB.toLowerCase();

      if (valA < valB) return sortDir === 'asc' ? -1 : 1;
      if (valA > valB) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  const exportMaintenancesCSV = () => {
    const headers = [
      'Nº ORDEM DE SERVIÇO',
      'Atividades Pendentes',
      'MOTIVO',
      'PLACA',
      'KM',
      'VALOR',
      'Prioridade',
      'RESPONSÁVEL',
      'BASE',
      'Status',
      'Data Atualização'
    ];

    const rows = finalOrders.map((m) => [
      getOSNumber(m),
      `"${m.atividadePendente.replace(/"/g, '""')}"`,
      m.motivo,
      m.placa,
      m.km || 0,
      m.valor || 0,
      m.prioridade,
      `"${(m.motorista || '').replace(/"/g, '""')}"`,
      m.base,
      m.status,
      formatDateBR(m.dataAtualizacao)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `ordens_manutencao_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === finalOrders.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(finalOrders.map((m) => m.id));
    }
  };

  const toggleSelectOrder = (id: string) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter((item) => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleBulkDelete = () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Tem certeza que deseja excluir as ${selectedIds.length} ordens de manutenção selecionadas?`)) {
      onBulkDeleteMaintenances(selectedIds);
      setSelectedIds([]);
    }
  };

  const getPriorityBadge = (p: MaintenancePriority) => {
    switch (p) {
      case 'Urgente':
        return 'bg-rose-500/20 text-rose-300 border border-rose-500/40';
      case 'Alta':
        return 'bg-amber-500/20 text-amber-300 border border-amber-500/40';
      case 'Média':
        return 'bg-blue-500/20 text-blue-300 border border-blue-500/40';
      default:
        return 'bg-slate-500/20 text-slate-300 border border-slate-500/40';
    }
  };

  const renderSortIcon = (columnKey: string) => {
    if (sortCol !== columnKey) return <ArrowUpDown className="w-3 h-3 text-sky-300/60 ml-1 inline" />;
    return sortDir === 'asc' ? (
      <ArrowUp className="w-3 h-3 text-amber-300 ml-1 inline font-bold" />
    ) : (
      <ArrowDown className="w-3 h-3 text-amber-300 ml-1 inline font-bold" />
    );
  };

  return (
    <div className="space-y-5">
      {/* Header Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/90 p-5 rounded-3xl border border-slate-800 shadow-xl">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-extrabold text-white tracking-wide">
              Ordens de Manutenção ({finalOrders.length})
            </h2>
            <p className="text-xs text-slate-400 font-medium">
              Acompanhamento detalhado das ordens de serviço e status
            </p>
          </div>
        </div>

        {/* View Controls & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2.5 select-none">
          {/* View Mode Toggle */}
          <div className="flex bg-slate-950 p-1 rounded-2xl border border-slate-800 shadow-inner">
            <button
              type="button"
              onClick={() => setViewMode('table')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 select-none cursor-pointer outline-none ${
                viewMode === 'table'
                  ? 'bg-sky-600 text-white shadow-md shadow-sky-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <TableIcon className="w-3.5 h-3.5 shrink-0" />
              <span className="select-none">Tabela Planilha</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('cards')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 select-none cursor-pointer outline-none ${
                viewMode === 'cards'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 shrink-0" />
              <span className="select-none">Cards Workflow</span>
            </button>
          </div>

          {onOpenExcelImportModal && (
            <button
              onClick={onOpenExcelImportModal}
              className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 text-xs font-bold rounded-2xl border border-emerald-500/30 transition flex items-center gap-1.5 cursor-pointer shadow active:scale-95"
              title="Importar ordens de manutenção em massa via planilha Excel (.xlsx, .csv)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Importar Excel</span>
            </button>
          )}

          <button
            onClick={exportMaintenancesCSV}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-2xl border border-slate-700 transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Download className="w-4 h-4 text-sky-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenBulkMaintenanceModal}
            className="px-3.5 py-2 bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 text-xs font-bold rounded-2xl border border-indigo-500/40 transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <PackagePlus className="w-4 h-4 text-indigo-400" />
            <span>Em Lote</span>
          </button>

          <button
            onClick={onOpenAddMaintenanceModal}
            className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 text-xs font-extrabold rounded-2xl shadow-lg transition flex items-center gap-1.5 cursor-pointer active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Nova Ordem</span>
          </button>
        </div>
      </div>

      {/* Synchronized Filter Bar for both Tabela Planilha & Cards Workflow */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg space-y-3">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 text-xs">
          
          {/* Workflow Status Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            <span className="text-slate-400 font-bold px-1 flex items-center gap-1 text-[11px] shrink-0">
              <Wrench className="w-3.5 h-3.5 text-amber-400" /> Workflow:
            </span>
            {[
              'Todas',
              'Aguardando 1ª Aprovação',
              'Aguardando 2ª Aprovação',
              'Pronto p/ Concluir',
              'Concluídas',
              'Atrasadas'
            ].map((wf) => {
              const count =
                wf === 'Todas'
                  ? maintenances.length
                  : wf === 'Aguardando 1ª Aprovação'
                  ? maintenances.filter((m) => !m.aprovacao1?.aprovado && m.status !== 'Concluída').length
                  : wf === 'Aguardando 2ª Aprovação'
                  ? maintenances.filter((m) => m.aprovacao1?.aprovado && !m.aprovacao2?.aprovado && m.status !== 'Concluída').length
                  : wf === 'Pronto p/ Concluir'
                  ? maintenances.filter((m) => m.aprovacao1?.aprovado && m.aprovacao2?.aprovado && m.status !== 'Concluída').length
                  : wf === 'Concluídas'
                  ? maintenances.filter((m) => m.status === 'Concluída' || m.conclusao?.aprovado).length
                  : maintenances.filter((m) => m.status === 'Atrasada').length;

              const isSel = workflowFilter === wf;

              return (
                <button
                  key={wf}
                  type="button"
                  onClick={() => setWorkflowFilter(wf)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer select-none ${
                    isSel
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  <span>{wf}</span>
                  <span
                    className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                      isSel ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-900 text-slate-400'
                    }`}
                  >
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Operation & Priority Selectors */}
          <div className="flex flex-wrap items-center gap-2 shrink-0">
            {/* Operação Selector */}
            {onSelectOperacao && (
              <select
                value={selectedOperacao}
                onChange={(e) => onSelectOperacao(e.target.value)}
                className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-indigo-300 font-bold focus:outline-none focus:border-indigo-500 cursor-pointer"
              >
                <option value="Todas">📍 Operação: TODAS</option>
                <option value="Rio">📍 Rio de Janeiro</option>
                <option value="Interior">📍 Interior</option>
                <option value="Redespacho">📍 Redespacho</option>
              </select>
            )}

            {/* Priority Selector */}
            <select
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              className="bg-slate-950 border border-slate-700/80 rounded-xl px-2.5 py-1.5 text-xs text-amber-300 font-bold focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="Todas">⚡ Prioridade: TODAS</option>
              <option value="Urgente">🔴 Urgente</option>
              <option value="Alta">🟠 Alta</option>
              <option value="Média">🔵 Média</option>
              <option value="Baixa">⚪ Baixa</option>
            </select>

            {/* Reset All Filters Button */}
            {isGlobalFilterActive && (
              <button
                type="button"
                onClick={handleClearAllFilters}
                className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-bold rounded-xl border border-rose-500/40 transition flex items-center gap-1 cursor-pointer"
                title="Limpar todos os filtros da tela"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Limpar Filtros</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Bulk Delete Bar */}
      {selectedIds.length > 0 && (
        <div className="flex items-center justify-between bg-indigo-950/80 border border-indigo-800/80 p-3 px-5 rounded-2xl shadow-lg text-xs">
          <span className="text-indigo-200 font-bold flex items-center gap-2">
            <CheckSquare className="w-4 h-4 text-indigo-400" />
            {selectedIds.length} ordem(ns) selecionada(s)
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3.5 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-xl transition flex items-center gap-1.5 cursor-pointer shadow"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Excluir Selecionadas</span>
          </button>
        </div>
      )}

      {/* VIEW MODE 1: CARDS WORKFLOW */}
      {viewMode === 'cards' && (
        <div className="grid grid-cols-1 gap-4">
          {finalOrders.map((order) => {
            const isApp1 = order.aprovacao1?.aprovado;
            const isApp2 = order.aprovacao2?.aprovado;
            const isDone = order.status === 'Concluída' || order.conclusao?.aprovado;

            return (
              <div
                key={order.id}
                className="p-5 bg-slate-900/90 border border-slate-800 hover:border-slate-700/80 rounded-3xl shadow-xl space-y-4 transition"
              >
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <span className="px-3 py-1 bg-amber-500/10 text-amber-300 font-mono font-bold text-sm rounded-xl border border-amber-500/20">
                      {order.placa}
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedOSForDetail(order)}
                      className="px-2.5 py-1 bg-indigo-500/10 hover:bg-indigo-500/25 text-indigo-300 hover:text-white font-mono font-extrabold text-xs rounded-xl border border-indigo-500/30 transition cursor-pointer flex items-center gap-1 active:scale-95"
                      title="Clique para abrir detalhes completos da OS"
                    >
                      #{getOSNumber(order)}
                    </button>
                    <div>
                      <h3 className="font-extrabold text-white text-base">{order.atividadePendente}</h3>
                      <p className="text-xs text-slate-400">
                        Motivo: <strong className="text-slate-200 uppercase">{order.motivo}</strong> | Base:{' '}
                        <strong className="text-slate-200">{order.base}</strong>
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className={`px-2.5 py-1 rounded-xl text-xs font-bold ${getPriorityBadge(order.prioridade)}`}>
                      {order.prioridade}
                    </span>
                    <span className="text-sm font-black text-emerald-400 font-mono bg-emerald-500/10 px-3 py-1 rounded-xl border border-emerald-500/20">
                      {formatCurrency(order.valor || 0)}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {/* 1ª Aprovação */}
                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isApp1 ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-300' : 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">1️⃣ 1ª Aprovação</span>
                      {isApp1 ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-400 font-bold text-[10px] border border-emerald-500/30">
                          APROVADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px] border border-amber-500/30">
                          PENDENTE
                        </span>
                      )}
                    </div>

                    {!isApp1 && (
                      <button
                        onClick={() => onApproveStep(order, 'aprovacao1')}
                        className="w-full py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
                      >
                        Aprovar 1ª Etapa
                      </button>
                    )}
                  </div>

                  {/* 2ª Aprovação */}
                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isApp2 ? 'bg-blue-950/20 border-blue-800/40 text-blue-300' : 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">2️⃣ 2ª Aprovação</span>
                      {isApp2 ? (
                        <span className="px-2 py-0.5 rounded bg-blue-500/20 text-blue-400 font-bold text-[10px] border border-blue-500/30">
                          APROVADO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-400 font-bold text-[10px]">
                          AGUARDANDO
                        </span>
                      )}
                    </div>

                    {!isApp2 && (
                      <button
                        onClick={() => onApproveStep(order, 'aprovacao2')}
                        disabled={!isApp1}
                        className={`w-full py-2 px-3 font-bold text-xs rounded-xl transition ${
                          isApp1 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Aprovar 2ª Etapa
                      </button>
                    )}
                  </div>

                  {/* Conclusão */}
                  <div className={`p-3.5 rounded-2xl border flex flex-col justify-between space-y-3 ${
                    isDone ? 'bg-emerald-950/30 border-emerald-700/60 text-emerald-300' : 'bg-slate-800/60 border-slate-700/80 text-slate-300'
                  }`}>
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold">✅ Conclusão</span>
                      {isDone ? (
                        <span className="px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-bold text-[10px]">
                          CONCLUÍDO
                        </span>
                      ) : (
                        <span className="px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 font-bold text-[10px]">
                          EM ANDAMENTO
                        </span>
                      )}
                    </div>

                    {!isDone && (
                      <button
                        onClick={() => onApproveStep(order, 'conclusao')}
                        disabled={!isApp2}
                        className={`w-full py-2 px-3 font-bold text-xs rounded-xl transition ${
                          isApp2 ? 'bg-emerald-600 hover:bg-emerald-500 text-white' : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        }`}
                      >
                        Finalizar & Concluir
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* VIEW MODE 2: TABLE SPREADSHEET (Full Screen Width + Column Filters) */}
      {viewMode === 'table' && (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl overflow-hidden shadow-2xl w-full">
          <div className="w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse table-fixed min-w-[1200px]">
              <thead>
                {/* Header Row 1: Titles & Sorting */}
                <tr className="bg-sky-700 text-white font-extrabold uppercase tracking-wider text-[11px] border-b border-sky-600 select-none">
                  <th className="p-2.5 w-[3%] min-w-[35px] text-center border-r border-sky-600">
                    <button onClick={toggleSelectAll} className="flex items-center justify-center w-full">
                      {selectedIds.length === finalOrders.length && finalOrders.length > 0 ? (
                        <CheckSquare className="w-3.5 h-3.5 text-white" />
                      ) : (
                        <Square className="w-3.5 h-3.5 text-sky-200" />
                      )}
                    </button>
                  </th>

                  <th className="p-2.5 w-[9%] min-w-[105px] border-r border-sky-600 cursor-pointer hover:bg-sky-600 transition text-center" onClick={() => handleSort('numeroOS')}>
                    <div className="flex items-center justify-center">
                      <span className="truncate">Nº OS</span>
                      {renderSortIcon('numeroOS')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[17%] min-w-[150px] border-r border-sky-600 cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('atividadePendente')}>
                    <div className="flex items-center justify-between">
                      <span className="truncate">ATIVIDADES PENDENTES</span>
                      {renderSortIcon('atividadePendente')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[8%] min-w-[90px] border-r border-sky-600 cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('motivo')}>
                    <div className="flex items-center justify-between">
                      <span className="truncate">MOTIVO</span>
                      {renderSortIcon('motivo')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[7%] min-w-[75px] border-r border-sky-600 cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('placa')}>
                    <div className="flex items-center justify-between">
                      <span className="truncate">PLACA</span>
                      {renderSortIcon('placa')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[6%] min-w-[65px] border-r border-sky-600 text-right cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('km')}>
                    <div className="flex items-center justify-end gap-1">
                      <span className="truncate">KM</span>
                      {renderSortIcon('km')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[8%] min-w-[90px] border-r border-sky-600 text-right cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('valor')}>
                    <div className="flex items-center justify-end gap-1">
                      <span className="truncate">VALOR</span>
                      {renderSortIcon('valor')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[9%] min-w-[100px] border-r border-sky-600 text-center cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('prioridade')}>
                    <div className="flex items-center justify-center">
                      <span className="truncate">PRIORIDADE</span>
                      {renderSortIcon('prioridade')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[11%] min-w-[115px] border-r border-sky-600 cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('motorista')}>
                    <div className="flex items-center justify-between">
                      <span className="truncate">RESPONSÁVEL</span>
                      {renderSortIcon('motorista')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[7%] min-w-[85px] border-r border-sky-600 text-center cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('base')}>
                    <div className="flex items-center justify-center">
                      <span className="truncate">BASE</span>
                      {renderSortIcon('base')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[12%] min-w-[135px] border-r border-sky-600 text-center cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('status')}>
                    <div className="flex items-center justify-center">
                      <span className="truncate">STATUS</span>
                      {renderSortIcon('status')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[9%] min-w-[100px] border-r border-sky-600 text-center cursor-pointer hover:bg-sky-600 transition" onClick={() => handleSort('dataAtualizacao')}>
                    <div className="flex items-center justify-center">
                      <span className="truncate">DATA ATUALIZ.</span>
                      {renderSortIcon('dataAtualizacao')}
                    </div>
                  </th>

                  <th className="p-2.5 w-[4%] min-w-[45px] text-center">AÇÕES</th>
                </tr>

                {/* Header Row 2: Per-Column Filter Inputs & Selects */}
                <tr className="bg-slate-950/90 border-b border-slate-800 p-1">
                  {/* Clear All Column Filters Button */}
                  <th className="p-1.5 text-center border-r border-slate-800">
                    {isColFilterActive ? (
                      <button
                        onClick={handleClearColFilters}
                        className="p-1 bg-rose-500/20 text-rose-300 hover:bg-rose-500/40 rounded transition"
                        title="Limpar todos os filtros das colunas"
                      >
                        <FilterX className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-slate-600 text-[9px] font-mono">Filtros</span>
                    )}
                  </th>

                  {/* Nº OS Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      placeholder="Nº OS..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1.5 py-1 text-[10px] text-amber-300 font-mono text-center focus:outline-none focus:border-sky-400 placeholder:text-slate-500 font-normal"
                      value={colFilters.numeroOS}
                      onChange={(e) => setColFilters({ ...colFilters, numeroOS: e.target.value })}
                    />
                  </th>

                  {/* ATIVIDADE Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      placeholder="🔍 Filtrar atividade..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none focus:border-sky-400 placeholder:text-slate-500 font-normal"
                      value={colFilters.atividade}
                      onChange={(e) => setColFilters({ ...colFilters, atividade: e.target.value })}
                    />
                  </th>

                  {/* MOTIVO Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <select
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1 py-1 text-[10px] text-white focus:outline-none focus:border-sky-400 font-normal cursor-pointer"
                      value={colFilters.motivo}
                      onChange={(e) => setColFilters({ ...colFilters, motivo: e.target.value })}
                    >
                      <option value="">Todos</option>
                      <option value="CORRETIVA">CORRETIVA</option>
                      <option value="PREVENTIVA">PREVENTIVA</option>
                      <option value="DESGASTE">DESGASTE</option>
                    </select>
                  </th>

                  {/* PLACA Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      placeholder="Placa..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1.5 py-1 text-[10px] text-amber-300 font-mono focus:outline-none focus:border-sky-400 placeholder:text-slate-500 font-normal"
                      value={colFilters.placa}
                      onChange={(e) => setColFilters({ ...colFilters, placa: e.target.value })}
                    />
                  </th>

                  {/* KM Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <input
                      type="number"
                      placeholder="Min KM..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1 py-1 text-[10px] text-slate-200 font-mono text-right focus:outline-none focus:border-sky-400 placeholder:text-slate-500 font-normal"
                      value={colFilters.kmMin}
                      onChange={(e) => setColFilters({ ...colFilters, kmMin: e.target.value })}
                    />
                  </th>

                  {/* VALOR Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <input
                      type="number"
                      placeholder="Min R$..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1 py-1 text-[10px] text-emerald-300 font-mono text-right focus:outline-none focus:border-sky-400 placeholder:text-slate-500 font-normal"
                      value={colFilters.valorMin}
                      onChange={(e) => setColFilters({ ...colFilters, valorMin: e.target.value })}
                    />
                  </th>

                  {/* PRIORIDADE Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <select
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1 py-1 text-[10px] text-white focus:outline-none focus:border-sky-400 font-normal cursor-pointer"
                      value={colFilters.prioridade}
                      onChange={(e) => setColFilters({ ...colFilters, prioridade: e.target.value })}
                    >
                      <option value="">Todas</option>
                      <option value="Urgente">Urgente</option>
                      <option value="Alta">Alta</option>
                      <option value="Média">Média</option>
                      <option value="Baixa">Baixa</option>
                    </select>
                  </th>

                  {/* RESPONSÁVEL Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      placeholder="Responsável..."
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1.5 py-1 text-[10px] text-white focus:outline-none focus:border-sky-400 placeholder:text-slate-500 font-normal"
                      value={colFilters.motorista}
                      onChange={(e) => setColFilters({ ...colFilters, motorista: e.target.value })}
                    />
                  </th>

                  {/* BASE Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <select
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1 py-1 text-[10px] text-white focus:outline-none focus:border-sky-400 font-normal cursor-pointer"
                      value={colFilters.base}
                      onChange={(e) => setColFilters({ ...colFilters, base: e.target.value })}
                    >
                      <option value="">Todas</option>
                      <option value="Rio">Rio</option>
                      <option value="Interior">Interior</option>
                      <option value="Redespacho">Redespacho</option>
                    </select>
                  </th>

                  {/* STATUS Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <select
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1 py-1 text-[10px] text-white focus:outline-none focus:border-sky-400 font-normal cursor-pointer"
                      value={colFilters.status}
                      onChange={(e) => setColFilters({ ...colFilters, status: e.target.value })}
                    >
                      <option value="">Todos</option>
                      <option value="Em andamento">Em Andamento</option>
                      <option value="Concluída">Serviço Realizado</option>
                      <option value="Atrasada">Atrasada</option>
                    </select>
                  </th>

                  {/* DATA ATUALIZ. Filter */}
                  <th className="p-1 border-r border-slate-800">
                    <input
                      type="text"
                      placeholder="Ex: 23/09"
                      className="w-full bg-slate-900 border border-slate-700/80 rounded px-1 py-1 text-[10px] text-slate-300 font-mono text-center focus:outline-none focus:border-sky-400 placeholder:text-slate-500 font-normal"
                      value={colFilters.data}
                      onChange={(e) => setColFilters({ ...colFilters, data: e.target.value })}
                    />
                  </th>

                  {/* Reset Actions */}
                  <th className="p-1 text-center">
                    {isColFilterActive && (
                      <button
                        onClick={handleClearColFilters}
                        className="p-1 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded transition text-[9px] font-bold"
                        title="Limpar"
                      >
                        Limpar
                      </button>
                    )}
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-800 text-slate-200 font-medium">
                {finalOrders.map((m, idx) => {
                  const isSelected = selectedIds.includes(m.id);

                  return (
                    <tr
                      key={m.id}
                      className={`hover:bg-slate-800/90 transition ${
                        isSelected
                          ? 'bg-indigo-950/40 text-white'
                          : idx % 2 === 0
                          ? 'bg-slate-900'
                          : 'bg-slate-900/60'
                      }`}
                    >
                      <td className="p-2.5 text-center border-r border-slate-800">
                        <button onClick={() => toggleSelectOrder(m.id)} className="flex items-center justify-center w-full">
                          {isSelected ? (
                            <CheckSquare className="w-3.5 h-3.5 text-indigo-400" />
                          ) : (
                            <Square className="w-3.5 h-3.5 text-slate-600" />
                          )}
                        </button>
                      </td>
                      <td className="p-2.5 border-r border-slate-800 text-center font-mono font-bold truncate">
                        <button
                          type="button"
                          onClick={() => setSelectedOSForDetail(m)}
                          className="px-2 py-0.5 bg-amber-500/10 hover:bg-amber-500/25 border border-amber-500/30 text-amber-300 hover:text-white rounded-lg text-[11px] transition cursor-pointer active:scale-95"
                          title="Clique para abrir a Ficha Detalhada da OS"
                        >
                          #{getOSNumber(m)}
                        </button>
                      </td>
                      <td className="p-2.5 font-semibold text-white border-r border-slate-800 truncate" title={m.atividadePendente}>
                        {m.atividadePendente}
                      </td>
                      <td className="p-2.5 border-r border-slate-800 font-bold uppercase text-indigo-300 truncate" title={m.motivo}>
                        {m.motivo}
                      </td>
                      <td className="p-2.5 border-r border-slate-800 font-mono font-bold text-amber-300 truncate">
                        {m.placa}
                      </td>
                      <td className="p-2.5 border-r border-slate-800 text-right font-mono text-slate-300 truncate">
                        {m.km?.toLocaleString('pt-BR') || '-'}
                      </td>
                      <td className="p-2.5 border-r border-slate-800 text-right font-mono font-bold text-emerald-400 truncate">
                        {formatCurrency(m.valor || 0)}
                      </td>
                      <td className="p-2.5 border-r border-slate-800 text-center">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${getPriorityBadge(m.prioridade)}`}>
                          {m.prioridade}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-800 text-slate-300 truncate" title={m.motorista || ''}>
                        {m.motorista || '-'}
                      </td>
                      <td className="p-2.5 border-r border-slate-800 font-bold text-slate-300 text-center truncate">
                        {m.base}
                      </td>
                      <td className="p-2.5 border-r border-slate-800 text-center">
                        <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase whitespace-nowrap ${
                          m.status === 'Atrasada'
                            ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                            : m.status === 'Concluída'
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40'
                            : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {m.status === 'Concluída' ? 'SERVIÇO REALIZADO' : m.status}
                        </span>
                      </td>
                      <td className="p-2.5 border-r border-slate-800 text-slate-300 font-mono text-center whitespace-nowrap text-[11px]">
                        {formatDateBR(m.dataAtualizacao)}
                      </td>
                      <td className="p-2.5 text-center">
                        <button
                          onClick={() => onOpenEditMaintenanceModal(m)}
                          className="p-1 text-slate-400 hover:text-white bg-slate-800 rounded transition"
                          title="Editar"
                        >
                          <Edit3 className="w-3.5 h-3.5" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {finalOrders.length === 0 && (
        <div className="p-10 text-center text-slate-400 bg-slate-900 border border-slate-800 rounded-3xl">
          Nenhuma ordem de manutenção encontrada para os filtros selecionados.
        </div>
      )}

      {selectedOSForDetail && (
        <OSDetailModal
          order={selectedOSForDetail}
          onClose={() => setSelectedOSForDetail(null)}
          onEditOrder={onOpenEditMaintenanceModal}
          onApproveStep={onApproveStep}
        />
      )}
    </div>
  );
};
