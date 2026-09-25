import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '../types/fleet';
import {
  formatCurrency,
  formatDateBR,
  calculateDaysStopped,
  getStoppedAlertLevel,
  getVehicleStatusBadge
} from '../utils/fleetHelpers';
import {
  Truck,
  Plus,
  Filter,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  MapPin,
  User,
  Gauge,
  Clock,
  History,
  AlertTriangle,
  X,
  Download,
  FileSpreadsheet
} from 'lucide-react';

interface FleetViewProps {
  vehicles: Vehicle[];
  searchQuery: string;
  selectedStatusFilter: string;
  onSelectStatusFilter: (status: string) => void;
  onOpenAddVehicleModal: () => void;
  onOpenExcelImportModal?: () => void;
  onOpenEditVehicleModal: (vehicle: Vehicle) => void;
  onDeleteVehicle: (id: string) => void;
  onBulkDeleteVehicles?: (ids: string[]) => void;
  onUpdateVehicleStatus: (vehicle: Vehicle, newStatus: VehicleStatus) => void;
}

export const FleetView: React.FC<FleetViewProps> = ({
  vehicles,
  searchQuery,
  selectedStatusFilter,
  onSelectStatusFilter,
  onOpenAddVehicleModal,
  onOpenExcelImportModal,
  onOpenEditVehicleModal,
  onDeleteVehicle,
  onBulkDeleteVehicles,
  onUpdateVehicleStatus
}) => {
  const [selectedVehicleForHistory, setSelectedVehicleForHistory] = useState<Vehicle | null>(null);
  const [baseFilter, setBaseFilter] = useState<string>('Todas');
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>([]);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);

  // Unique bases for filtering dropdown
  const bases = ['Todas', ...Array.from(new Set(vehicles.map(v => v.base).filter(Boolean)))];

  // Filtering Logic
  const filteredVehicles = vehicles.filter((v) => {
    // 1. Search query
    const query = searchQuery.toLowerCase();
    const matchesSearch =
      !query ||
      v.placa.toLowerCase().includes(query) ||
      v.modelo.toLowerCase().includes(query) ||
      v.marca.toLowerCase().includes(query) ||
      v.motorista.toLowerCase().includes(query) ||
      v.base.toLowerCase().includes(query) ||
      v.status.toLowerCase().includes(query);

    // 2. Status card filter
    let matchesStatus = true;
    if (selectedStatusFilter === 'Parados 20+ Dias') {
      matchesStatus = (v.status === 'Parado' || v.status === 'Em manutenção') && calculateDaysStopped(v) >= 20;
    } else if (selectedStatusFilter === 'Operacionais') {
      matchesStatus = v.status === 'Disponível' || v.status === 'Em operação';
    } else if (selectedStatusFilter === 'Inativos') {
      matchesStatus = v.status === 'Parado' || v.status === 'Em manutenção';
    } else if (selectedStatusFilter && selectedStatusFilter !== 'Todos') {
      matchesStatus = v.status === selectedStatusFilter;
    }

    // 3. Base filter
    const matchesBase = baseFilter === 'Todas' || v.base === baseFilter;

    return matchesSearch && matchesStatus && matchesBase;
  });

  const toggleSelectVehicle = (id: string) => {
    setSelectedVehicleIds(prev =>
      prev.includes(id) ? prev.filter(vId => vId !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedVehicleIds.length === filteredVehicles.length && filteredVehicles.length > 0) {
      setSelectedVehicleIds([]);
    } else {
      setSelectedVehicleIds(filteredVehicles.map(v => v.id));
    }
  };

  const handleConfirmBulkDelete = () => {
    if (onBulkDeleteVehicles && selectedVehicleIds.length > 0) {
      onBulkDeleteVehicles(selectedVehicleIds);
      setSelectedVehicleIds([]);
      setIsBulkDeleteModalOpen(false);
    }
  };

  const exportFleetCSV = () => {
    const headers = ['Placa', 'Modelo', 'Marca', 'Ano', 'KM Atual', 'Responsável', 'Base', 'Status', 'Dias Parado', 'Observações'];
    const rows = filteredVehicles.map((v) => [
      v.placa,
      `"${v.modelo.replace(/"/g, '""')}"`,
      v.marca,
      v.ano,
      v.kmAtual,
      `"${(v.motorista || '').replace(/"/g, '""')}"`,
      v.base,
      v.status,
      calculateDaysStopped(v),
      `"${(v.observacoes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(';'), ...rows.map((e) => e.join(';'))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `frota_veiculos_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* Top Controls & Filter Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 p-4 bg-slate-900 border border-slate-800 rounded-2xl shadow-lg">
        <div className="flex flex-wrap items-center gap-3">
          {/* Operação Segmented Control (Rio, Interior, Redespacho) */}
          <div className="flex items-center gap-1.5 p-1 bg-slate-950 border border-slate-800 rounded-xl">
            <span className="text-xs font-bold text-slate-400 px-2 flex items-center gap-1">
              <MapPin className="w-3.5 h-3.5 text-indigo-400" /> Operação:
            </span>
            {['Todas', 'Rio', 'Interior', 'Redespacho'].map((op) => {
              const count = op === 'Todas' 
                ? vehicles.length 
                : vehicles.filter(v => v.base === op).length;
              
              return (
                <button
                  key={op}
                  onClick={() => setBaseFilter(op)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 ${
                    baseFilter === op
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  <span>{op}</span>
                  <span className={`text-[10px] px-1.5 py-0.2 rounded-md font-mono ${
                    baseFilter === op ? 'bg-indigo-700 text-indigo-100' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {count}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Status Quick Pills */}
          <div className="flex items-center gap-1.5 overflow-x-auto py-1 max-w-full">
            {['Todos', 'Disponível', 'Em operação', 'Parado', 'Em manutenção', 'Parados 20+ Dias'].map((s) => (
              <button
                key={s}
                onClick={() => onSelectStatusFilter(s === 'Todos' ? '' : s)}
                className={`px-3 py-1 rounded-xl text-xs font-semibold whitespace-nowrap transition ${
                  (selectedStatusFilter === s) || (s === 'Todos' && !selectedStatusFilter)
                    ? 'bg-indigo-600 text-white shadow'
                    : 'bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* Action Buttons: Export & Add New */}
        <div className="flex flex-wrap items-center gap-2 justify-end">
          {onOpenExcelImportModal && (
            <button
              onClick={onOpenExcelImportModal}
              className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-bold text-xs border border-emerald-500/30 rounded-xl transition shadow active:scale-95"
              title="Cadastrar frota em massa importando planilha Excel (.xlsx, .csv)"
            >
              <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
              <span>Importar Excel (Massa)</span>
            </button>
          )}

          <button
            onClick={exportFleetCSV}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs border border-slate-700 rounded-xl transition shadow"
            title="Exportar dados da frota para planilha CSV"
          >
            <Download className="w-4 h-4 text-indigo-400" />
            <span>Exportar CSV</span>
          </button>

          <button
            onClick={onOpenAddVehicleModal}
            className="flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-600/20 transition active:scale-95"
          >
            <Plus className="w-4 h-4" />
            <span>Cadastrar Veículo</span>
          </button>
        </div>
      </div>

      {/* Bulk Selection Action Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 p-3 bg-slate-900/90 border border-slate-800 rounded-2xl">
        <div className="flex items-center gap-3">
          <button
            onClick={toggleSelectAll}
            className="flex items-center gap-2 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl border border-slate-700 transition"
          >
            <input
              type="checkbox"
              checked={filteredVehicles.length > 0 && selectedVehicleIds.length === filteredVehicles.length}
              onChange={() => {}}
              className="w-4 h-4 rounded text-indigo-600 bg-slate-950 border-slate-700 cursor-pointer"
            />
            <span>{selectedVehicleIds.length === filteredVehicles.length && filteredVehicles.length > 0 ? 'Desmarcar Todos' : 'Selecionar Todos'}</span>
          </button>

          <span className="text-xs text-slate-300 font-medium">
            Exibindo <strong>{filteredVehicles.length}</strong> de <strong>{vehicles.length}</strong> veículos
            {selectedVehicleIds.length > 0 && (
              <span className="ml-2 px-2 py-0.5 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-lg font-bold">
                {selectedVehicleIds.length} selecionado(s)
              </span>
            )}
          </span>
        </div>

        <div className="flex items-center gap-2">
          {selectedVehicleIds.length > 0 && (
            <button
              onClick={() => setIsBulkDeleteModalOpen(true)}
              className="flex items-center gap-2 px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-rose-600/30 transition animate-pulse"
            >
              <Trash2 className="w-4 h-4" />
              <span>Excluir Selecionados ({selectedVehicleIds.length})</span>
            </button>
          )}

          {selectedStatusFilter && (
            <button
              onClick={() => onSelectStatusFilter('')}
              className="text-indigo-400 hover:underline font-medium text-xs"
            >
              Limpar Filtro Status
            </button>
          )}
        </div>
      </div>

      {/* Vehicles Table / Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredVehicles.map((vehicle) => {
          const statusBadge = getVehicleStatusBadge(vehicle.status);
          const daysStopped = calculateDaysStopped(vehicle);
          const stoppedAlert = getStoppedAlertLevel(daysStopped);
          const isSelected = selectedVehicleIds.includes(vehicle.id);

          return (
            <div
              key={vehicle.id}
              className={`p-5 rounded-2xl border transition-all shadow-lg flex flex-col justify-between relative ${
                isSelected
                  ? 'bg-slate-900 border-indigo-500 ring-2 ring-indigo-500/50 shadow-indigo-500/10'
                  : daysStopped >= 20
                  ? 'bg-gradient-to-br from-slate-900 via-rose-950/20 to-slate-900 border-rose-800/50 ring-1 ring-rose-500/20'
                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
              }`}
            >
              <div>
                {/* Checkbox & Header: Placa & Status Badge */}
                <div className="flex items-start justify-between gap-2 mb-3">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleSelectVehicle(vehicle.id)}
                      className="w-5 h-5 rounded text-rose-600 bg-slate-950 border-slate-700 cursor-pointer accent-rose-600 shrink-0"
                      title="Selecionar para exclusão em massa"
                    />
                    <div>
                      <span className="text-xl font-black text-white tracking-wider font-mono bg-slate-800/90 px-2.5 py-1 rounded-lg border border-slate-700 shadow-inner inline-block">
                        {vehicle.placa}
                      </span>
                      <h4 className="font-bold text-slate-200 text-sm mt-1.5">
                        {vehicle.modelo}
                      </h4>
                    </div>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold border ${statusBadge?.className}`}>
                    {statusBadge?.label}
                  </span>
                </div>

                {/* Stopped Alert Warning if stopped */}
                {(vehicle.status === 'Parado' || vehicle.status === 'Em manutenção') && (
                  <div className={`p-2.5 rounded-xl border mb-3 text-xs flex items-center justify-between ${stoppedAlert.cardClass}`}>
                    <div className="flex items-center gap-2">
                      <Clock className="w-4 h-4 text-amber-400" />
                      <span className="font-bold">{daysStopped} dias parado</span>
                    </div>
                    <span className={`px-2 py-0.5 rounded text-[10px] border ${stoppedAlert.badgeClass}`}>
                      {stoppedAlert.label}
                    </span>
                  </div>
                )}

                {/* Details Grid */}
                <div className="grid grid-cols-2 gap-2 text-xs text-slate-300 py-2 border-y border-slate-800/80 mb-3">
                  <div className="flex items-center gap-1.5">
                    <User className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{vehicle.motorista || 'Sem responsável'}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span className="truncate">{vehicle.base}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Gauge className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>{vehicle.kmAtual.toLocaleString('pt-BR')} km</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                    <span>Ano: {vehicle.ano}</span>
                  </div>
                </div>

                {/* Dates & Observations */}
                {vehicle.dataEntradaManutencao && (
                  <div className="text-[11px] text-slate-400 space-y-1 mb-3">
                    <p>Data Manutenção: <strong className="text-slate-200">{formatDateBR(vehicle.dataEntradaManutencao)}</strong></p>
                    {vehicle.dataPrevistaLiberacao && (
                      <p>Previsão Liberação: <strong className="text-emerald-400">{formatDateBR(vehicle.dataPrevistaLiberacao)}</strong></p>
                    )}
                  </div>
                )}

                {vehicle.observacoes && (
                  <p className="text-xs text-slate-400 bg-slate-800/40 p-2.5 rounded-xl border border-slate-800 line-clamp-2 mb-3">
                    {vehicle.observacoes}
                  </p>
                )}
              </div>

              {/* Bottom Actions */}
              <div className="flex items-center justify-between pt-2 border-t border-slate-800/60">
                <button
                  onClick={() => setSelectedVehicleForHistory(vehicle)}
                  className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 font-semibold"
                >
                  <History className="w-3.5 h-3.5" />
                  <span>Histórico ({vehicle.historico?.length || 0})</span>
                </button>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => onOpenEditVehicleModal(vehicle)}
                    className="p-1.5 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg transition"
                    title="Editar veículo"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => onDeleteVehicle(vehicle.id)}
                    className="p-1.5 text-slate-400 hover:text-rose-400 bg-slate-800 hover:bg-rose-950/40 rounded-lg transition"
                    title="Remover veículo"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredVehicles.length === 0 && (
        <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
          <Truck className="w-12 h-12 text-slate-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">Nenhum veículo encontrado</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Tente mudar os filtros de busca ou cadastre um novo veículo no botão acima.
          </p>
        </div>
      )}

      {/* Vehicle History Drawer / Modal */}
      {selectedVehicleForHistory && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-indigo-400" />
                <h3 className="font-bold text-white text-base">
                  Histórico do Veículo: <span className="font-mono text-indigo-300">{selectedVehicleForHistory.placa}</span>
                </h3>
              </div>
              <button
                onClick={() => setSelectedVehicleForHistory(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {selectedVehicleForHistory.historico && selectedVehicleForHistory.historico.length > 0 ? (
                selectedVehicleForHistory.historico.map((h) => (
                  <div key={h.id} className="p-3 bg-slate-800/60 rounded-xl border border-slate-700/60 text-xs space-y-1">
                    <div className="flex justify-between font-bold text-indigo-300">
                      <span>{formatDateBR(h.date)}</span>
                      <span>Por: {h.author}</span>
                    </div>
                    <p className="text-slate-200">{h.note}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-400 text-center py-6">Nenhum histórico registrado até o momento.</p>
              )}
            </div>

            <button
              onClick={() => setSelectedVehicleForHistory(null)}
              className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl font-semibold text-xs"
            >
              Fechar Histórico
            </button>
          </div>
        </div>
      )}

      {/* Bulk Delete Confirmation Modal */}
      {isBulkDeleteModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-rose-500/40 rounded-3xl max-w-md w-full p-6 space-y-4 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-rose-400">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="font-bold text-white text-base">Confirmar Exclusão em Massa</h3>
              </div>
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-300">
              Você selecionou <strong className="text-rose-400 font-bold">{selectedVehicleIds.length} veículos</strong> para serem removidos permanentemente do sistema:
            </p>

            <div className="flex flex-wrap gap-1.5 max-h-36 overflow-y-auto p-2 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
              {selectedVehicleIds.map(id => {
                const v = vehicles.find(veh => veh.id === id);
                return (
                  <span key={id} className="px-2 py-1 bg-slate-800 text-rose-300 rounded border border-rose-900/50">
                    {v?.placa || id}
                  </span>
                );
              })}
            </div>

            <p className="text-[11px] text-slate-400 bg-rose-950/20 border border-rose-800/30 p-2.5 rounded-xl">
              ⚠️ Esta ação removerá os veículos da frota. Certifique-se de que realmente deseja excluir estes registros.
            </p>

            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setIsBulkDeleteModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl font-semibold text-xs transition"
              >
                Cancelar
              </button>
              <button
                onClick={handleConfirmBulkDelete}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl font-bold text-xs shadow-lg shadow-rose-600/30 transition flex items-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                <span>Sim, Excluir {selectedVehicleIds.length} Veículo(s)</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
