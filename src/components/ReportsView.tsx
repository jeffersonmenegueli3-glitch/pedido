import React, { useState, useMemo } from 'react';
import { Vehicle, MaintenanceOrder } from '../types/fleet';
import { formatCurrency, formatDateBR, calculateDaysStopped, getOSNumber, getStoppedAlertLevel } from '../utils/fleetHelpers';
import { BarChart3, Download, Printer, Search, Filter, AlertTriangle, Truck, Wrench, DollarSign, Calendar, ShieldAlert } from 'lucide-react';

interface ReportsViewProps {
  vehicles: Vehicle[];
  maintenances: MaintenanceOrder[];
  budgetData: any;
}

export const ReportsView: React.FC<ReportsViewProps> = ({
  vehicles,
  maintenances,
  budgetData
}) => {
  const [activeTab, setActiveTab] = useState<'geral' | 'manutencoes' | 'parados'>('geral');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterBase, setFilterBase] = useState('Todas');
  const [filterStatus, setFilterStatus] = useState('Todos');

  // Filtered Vehicles
  const filteredVehicles = useMemo(() => {
    return vehicles.filter(v => {
      const matchBase = filterBase === 'Todas' || v.base === filterBase;
      const matchStatus = filterStatus === 'Todos' || v.status === filterStatus;
      const matchSearch =
        v.placa.toLowerCase().includes(searchTerm.toLowerCase()) ||
        v.modelo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (v.motorista && v.motorista.toLowerCase().includes(searchTerm.toLowerCase())) ||
        v.base.toLowerCase().includes(searchTerm.toLowerCase());
      return matchBase && matchStatus && matchSearch;
    });
  }, [vehicles, filterBase, filterStatus, searchTerm]);

  // Stopped Vehicles (+20 days)
  const criticalStoppedVehicles = useMemo(() => {
    return vehicles.filter(v => (v.status === 'Parado' || v.status === 'Em manutenção') && calculateDaysStopped(v) >= 20);
  }, [vehicles]);

  // Export CSV for General Fleet
  const exportFleetCSV = () => {
    const headers = [
      'Placa',
      'Marca',
      'Modelo',
      'Ano',
      'KM Atual',
      'Motorista',
      'Base',
      'Status Operacional',
      'Data Início Parada',
      'Dias Parado',
      'OS Ativa',
      'Motivo Manutenção',
      'Valor Orçado (R$)',
      'Previsão Liberação',
      'Observações'
    ];

    const rows = filteredVehicles.map(v => {
      const activeM = maintenances.find(m => m.placa === v.placa && m.status !== 'Concluída');
      const dias = calculateDaysStopped(v);
      return [
        v.placa,
        v.marca || '',
        v.modelo,
        v.ano || '',
        v.kmAtual || 0,
        v.motorista || 'Não atribuído',
        v.base,
        v.status,
        v.dataInicioParada ? formatDateBR(v.dataInicioParada) : (v.dataEntradaManutencao ? formatDateBR(v.dataEntradaManutencao) : '-'),
        dias,
        getOSNumber(activeM),
        activeM ? activeM.atividadePendente : (v.observacoes || 'N/A'),
        activeM ? activeM.valor : 0,
        v.dataPrevistaLiberacao ? formatDateBR(v.dataPrevistaLiberacao) : 'A definir',
        `"${(v.observacoes || '').replace(/"/g, '""')}"`
      ];
    });

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_detalhado_frota_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export CSV for Maintenances
  const exportMaintenanceCSV = () => {
    const headers = ['Nº OS', 'Placa', 'Modelo', 'Base', 'Motorista', 'Atividade', 'Motivo', 'Prioridade', 'Status', 'Valor (R$)', 'Data Abertura', 'Data Planejada'];
    const rows = maintenances.map(m => [
      getOSNumber(m),
      m.placa,
      m.veiculoModelo || '',
      m.base,
      m.motorista,
      m.atividadePendente,
      m.motivo,
      m.prioridade,
      m.status,
      m.valor,
      formatDateBR(m.dataAbertura),
      formatDateBR(m.dataPlanejada)
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map(e => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `relatorio_manutencoes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const totalStoppedCount = vehicles.filter(v => v.status === 'Parado' || v.status === 'Em manutenção').length;
  const totalCost = maintenances.reduce((acc, m) => acc + (m.valor || 0), 0);

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <BarChart3 className="w-5 h-5 text-indigo-400" />
            <h2 className="text-xl font-bold text-white">Relatórios Executivos e Operacionais da Frota</h2>
          </div>
          <p className="text-xs text-slate-400">
            Painel completo para auditoria gerencial, controle financeiro, histórico de oficinas e rastreamento de disponibilidade.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={activeTab === 'manutencoes' ? exportMaintenanceCSV : exportFleetCSV}
            className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow transition"
          >
            <Download className="w-4 h-4" />
            <span>Exportar CSV ({activeTab === 'manutencoes' ? 'Manutenções' : 'Frota Detalhada'})</span>
          </button>
          <button
            onClick={() => window.print()}
            className="flex items-center gap-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 rounded-xl transition"
          >
            <Printer className="w-4 h-4" />
            <span>Imprimir Relatório</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 text-indigo-400 rounded-xl">
            <Truck className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Frota Cadastrada</span>
            <div className="text-xl font-black text-white">{vehicles.length} veículos</div>
            <span className="text-[10px] text-slate-500">Operações ativas</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-xl">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Total Parados / Manutenção</span>
            <div className="text-xl font-black text-amber-400">{totalStoppedCount} veículos</div>
            <span className="text-[10px] text-slate-500">
              {((totalStoppedCount / (vehicles.length || 1)) * 100).toFixed(1)}% da frota
            </span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-rose-500/10 border border-rose-500/20 text-rose-400 rounded-xl">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Parados +20 Dias (Críticos)</span>
            <div className="text-xl font-black text-rose-400">{criticalStoppedVehicles.length} veículos</div>
            <span className="text-[10px] text-rose-400 font-bold">Ação Urgente Necessária</span>
          </div>
        </div>

        <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center gap-4">
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-xl">
            <DollarSign className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs text-slate-400 font-medium">Custo Total de Manutenção</span>
            <div className="text-xl font-black text-emerald-400">{formatCurrency(totalCost)}</div>
            <span className="text-[10px] text-slate-500">Média {formatCurrency(vehicles.length > 0 ? totalCost / vehicles.length : 0)} /veículo</span>
          </div>
        </div>
      </div>

      {/* Tabs & Filters Bar */}
      <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4">
        {/* Navigation Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 border border-slate-800 rounded-xl overflow-x-auto">
          <button
            onClick={() => setActiveTab('geral')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === 'geral' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            📋 Relatório Geral da Frota ({filteredVehicles.length})
          </button>
          <button
            onClick={() => setActiveTab('manutencoes')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === 'manutencoes' ? 'bg-indigo-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🔧 Manutenções & Ordens de Serviço ({maintenances.length})
          </button>
          <button
            onClick={() => setActiveTab('parados')}
            className={`px-4 py-2 text-xs font-bold rounded-lg transition whitespace-nowrap ${
              activeTab === 'parados' ? 'bg-rose-600 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-900'
            }`}
          >
            🚨 Audit. Veículos Parados (+20d) ({criticalStoppedVehicles.length})
          </button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Search Bar */}
          <div className="relative flex-1 sm:w-60">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              placeholder="Buscar por placa, modelo, motorista..."
              className="w-full bg-slate-950 border border-slate-800 text-white placeholder-slate-500 text-xs rounded-xl pl-9 pr-3 py-2 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Base Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={filterBase}
              onChange={e => setFilterBase(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="Todas" className="bg-slate-900 text-white">Todas as Bases</option>
              <option value="Rio" className="bg-slate-900 text-white">Rio</option>
              <option value="Interior" className="bg-slate-900 text-white">Interior</option>
              <option value="Redespacho" className="bg-slate-900 text-white">Redespacho</option>
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1.5">
            <select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              className="bg-transparent text-xs text-slate-200 font-semibold focus:outline-none cursor-pointer"
            >
              <option value="Todos" className="bg-slate-900 text-white">Todos os Status</option>
              <option value="Disponível" className="bg-slate-900 text-white">Disponível</option>
              <option value="Em operação" className="bg-slate-900 text-white">Em operação</option>
              <option value="Parado" className="bg-slate-900 text-white">Parado</option>
              <option value="Em manutenção" className="bg-slate-900 text-white">Em manutenção</option>
            </select>
          </div>
        </div>
      </div>

      {/* TAB 1: RELATÓRIO GERAL DA FROTA DETALHADO */}
      {activeTab === 'geral' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>Relatório Completo da Frota</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono border border-indigo-500/30">
                {filteredVehicles.length} registros
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/90 text-slate-400 font-bold uppercase border-b border-slate-700">
                <tr>
                  <th className="p-3">Placa</th>
                  <th className="p-3">Marca / Modelo / Ano</th>
                  <th className="p-3">KM Atual</th>
                  <th className="p-3">Motorista</th>
                  <th className="p-3">Base / Operação</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Dias Parado</th>
                  <th className="p-3">OS Ativa / Motivo</th>
                  <th className="p-3">Custo Est. (R$)</th>
                  <th className="p-3">Previsão Liberação</th>
                  <th className="p-3">Observações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filteredVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={11} className="p-8 text-center text-slate-500">
                      Nenhum veículo encontrado com os filtros selecionados.
                    </td>
                  </tr>
                ) : (
                  filteredVehicles.map(v => {
                    const activeM = maintenances.find(m => m.placa === v.placa && m.status !== 'Concluída');
                    const dias = calculateDaysStopped(v);
                    const alertInfo = getStoppedAlertLevel(dias);

                    return (
                      <tr key={v.id} className="hover:bg-slate-800/50 transition-colors">
                        <td className="p-3 font-mono font-bold text-white whitespace-nowrap">{v.placa}</td>
                        <td className="p-3">
                          <div className="font-semibold text-slate-200">{v.modelo}</div>
                          <div className="text-[10px] text-slate-400">{v.marca || 'N/A'} • {v.ano || '2024'}</div>
                        </td>
                        <td className="p-3 font-mono whitespace-nowrap">
                          {v.kmAtual ? `${v.kmAtual.toLocaleString('pt-BR')} km` : '-'}
                        </td>
                        <td className="p-3 font-medium text-slate-200">{v.motorista || 'Não informado'}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-md font-medium">
                            {v.base}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap">
                          <span className={`px-2 py-0.5 rounded-md font-bold text-[11px] ${
                            v.status === 'Disponível' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                            v.status === 'Em operação' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            v.status === 'Em manutenção' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                            'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                          }`}>
                            {v.status}
                          </span>
                        </td>
                        <td className="p-3 whitespace-nowrap font-bold">
                          <span className={`px-2 py-0.5 rounded-md ${alertInfo.badgeClass}`}>
                            {dias} dias
                          </span>
                        </td>
                        <td className="p-3">
                          {activeM ? (
                            <div>
                              <div className="font-mono text-indigo-400 font-bold">{getOSNumber(activeM)}</div>
                              <div className="text-[11px] text-slate-300 truncate max-w-[150px]">{activeM.atividadePendente}</div>
                            </div>
                          ) : (
                            <span className="text-slate-500 text-[11px]">Sem OS aberta</span>
                          )}
                        </td>
                        <td className="p-3 font-mono font-bold text-emerald-400 whitespace-nowrap">
                          {activeM ? formatCurrency(activeM.valor) : '-'}
                        </td>
                        <td className="p-3 font-medium text-slate-300 whitespace-nowrap">
                          {v.dataPrevistaLiberacao ? formatDateBR(v.dataPrevistaLiberacao) : 'A definir'}
                        </td>
                        <td className="p-3 text-[11px] text-slate-400 max-w-[200px] truncate" title={v.observacoes}>
                          {v.observacoes || '-'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: RELATÓRIO DE MANUTENÇÕES & OS */}
      {activeTab === 'manutencoes' && (
        <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="font-bold text-white text-base flex items-center gap-2">
              <span>Histórico de Ordens de Serviço (OS)</span>
              <span className="text-xs bg-indigo-500/20 text-indigo-300 px-2 py-0.5 rounded-full font-mono border border-indigo-500/30">
                {maintenances.length} OS
              </span>
            </h3>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/90 text-slate-400 font-bold uppercase border-b border-slate-700">
                <tr>
                  <th className="p-3">Nº da OS</th>
                  <th className="p-3">Placa</th>
                  <th className="p-3">Atividade / Problema</th>
                  <th className="p-3">Motivo</th>
                  <th className="p-3">Base</th>
                  <th className="p-3">Prioridade</th>
                  <th className="p-3">Status OS</th>
                  <th className="p-3">Valor (R$)</th>
                  <th className="p-3">Data Abertura</th>
                  <th className="p-3">Previsão</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {maintenances.map(m => (
                  <tr key={m.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="p-3 font-mono font-bold text-indigo-400 whitespace-nowrap">{getOSNumber(m)}</td>
                    <td className="p-3 font-mono font-bold text-white whitespace-nowrap">{m.placa}</td>
                    <td className="p-3 font-medium text-slate-200">{m.atividadePendente}</td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 bg-slate-800 text-slate-300 border border-slate-700 rounded-md">
                        {m.motivo}
                      </span>
                    </td>
                    <td className="p-3">{m.base}</td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        m.prioridade === 'Urgente' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        m.prioridade === 'Alta' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30' :
                        'bg-slate-800 text-slate-300'
                      }`}>
                        {m.prioridade}
                      </span>
                    </td>
                    <td className="p-3">
                      <span className={`px-2 py-0.5 rounded-md font-bold text-[10px] ${
                        m.status === 'Concluída' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30' :
                        m.status === 'Atrasada' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30' :
                        'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      }`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="p-3 font-mono font-bold text-emerald-400 whitespace-nowrap">
                      {formatCurrency(m.valor)}
                    </td>
                    <td className="p-3 font-medium text-slate-300 whitespace-nowrap">{formatDateBR(m.dataAbertura)}</td>
                    <td className="p-3 font-medium text-slate-300 whitespace-nowrap">{formatDateBR(m.dataPlanejada)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 3: AUDITORIA DE VEÍCULOS PARADOS (+20 DIAS) */}
      {activeTab === 'parados' && (
        <div className="p-6 bg-slate-900 border border-rose-500/30 rounded-3xl shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-white text-base">Auditoria Crítica: Veículos Parados Há Mais de 20 Dias</h3>
            </div>
            <span className="text-xs bg-rose-500/20 text-rose-300 px-3 py-1 rounded-full font-bold border border-rose-500/40">
              {criticalStoppedVehicles.length} Críticos
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-800/90 text-slate-400 font-bold uppercase border-b border-slate-700">
                <tr>
                  <th className="p-3">Placa</th>
                  <th className="p-3">Modelo</th>
                  <th className="p-3">Base</th>
                  <th className="p-3">Motorista</th>
                  <th className="p-3">Data Início Parada</th>
                  <th className="p-3">Dias Parado</th>
                  <th className="p-3">Motivo da Manutenção</th>
                  <th className="p-3">Observações / Pendência</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {criticalStoppedVehicles.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="p-8 text-center text-emerald-400 font-bold">
                      🎉 Nenhum veículo parado há mais de 20 dias no momento!
                    </td>
                  </tr>
                ) : (
                  criticalStoppedVehicles.map(v => {
                    const dias = calculateDaysStopped(v);
                    const activeM = maintenances.find(m => m.placa === v.placa && m.status !== 'Concluída');

                    return (
                      <tr key={v.id} className="hover:bg-rose-950/20 transition-colors">
                        <td className="p-3 font-mono font-bold text-white whitespace-nowrap">{v.placa}</td>
                        <td className="p-3 font-medium text-slate-200">{v.modelo}</td>
                        <td className="p-3">{v.base}</td>
                        <td className="p-3">{v.motorista || 'Não atribuído'}</td>
                        <td className="p-3 font-mono text-slate-300">
                          {v.dataInicioParada ? formatDateBR(v.dataInicioParada) : (v.dataEntradaManutencao ? formatDateBR(v.dataEntradaManutencao) : '-')}
                        </td>
                        <td className="p-3 whitespace-nowrap font-black text-rose-400 text-sm">
                          🚨 {dias} dias
                        </td>
                        <td className="p-3 font-semibold text-amber-300">
                          {activeM ? activeM.atividadePendente : 'Manutenção corretiva em oficina'}
                        </td>
                        <td className="p-3 text-[11px] text-slate-300 max-w-[250px]">
                          {v.observacoes || 'Aguardando aprovação de peças ou orçamento pela gestão.'}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

