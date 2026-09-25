import React, { useState } from 'react';
import { Vehicle, MaintenanceReason, MaintenancePriority } from '../types/fleet';
import { X, Layers, CheckSquare, Square, Save, Truck, DollarSign } from 'lucide-react';

interface BulkMaintenanceModalProps {
  vehicles: Vehicle[];
  onClose: () => void;
  onSaveBulk: (orders: any[]) => void;
}

export const BulkMaintenanceModal: React.FC<BulkMaintenanceModalProps> = ({
  vehicles,
  onClose,
  onSaveBulk
}) => {
  const [selectedPlacas, setSelectedPlacas] = useState<string[]>([]);
  const [atividadePendente, setAtividadePendente] = useState<string>('Revisão Preventiva de Rotina');
  const [motivo, setMotivo] = useState<MaintenanceReason>('Preventiva');
  const [prioridade, setPrioridade] = useState<MaintenancePriority>('Média');
  const [valorPorVeiculo, setValorPorVeiculo] = useState<number>(1200);
  const [dataPlanejada, setDataPlanejada] = useState<string>(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );
  const [observacoes, setObservacoes] = useState<string>('Manutenção periódica gerada em massa.');
  const [vehicleSearch, setVehicleSearch] = useState<string>('');

  const filteredVehicles = vehicles.filter(
    v =>
      v.placa.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.modelo.toLowerCase().includes(vehicleSearch.toLowerCase()) ||
      v.base.toLowerCase().includes(vehicleSearch.toLowerCase())
  );

  const toggleSelectAll = () => {
    if (selectedPlacas.length === filteredVehicles.length) {
      setSelectedPlacas([]);
    } else {
      setSelectedPlacas(filteredVehicles.map((v) => v.placa));
    }
  };

  const togglePlaca = (placa: string) => {
    if (selectedPlacas.includes(placa)) {
      setSelectedPlacas(selectedPlacas.filter((p) => p !== placa));
    } else {
      setSelectedPlacas([...selectedPlacas, placa]);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedPlacas.length === 0) {
      alert('Selecione ao menos 1 veículo para cadastrar manutenção em massa.');
      return;
    }

    const baseOsNum = Math.floor(100 + Math.random() * 800);
    const ordersToCreate = selectedPlacas.map((placa, idx) => {
      const v = vehicles.find((veh) => veh.placa === placa);
      return {
        numeroOS: `OS-2026-${String(baseOsNum + idx).padStart(3, '0')}`,
        placa,
        veiculoModelo: v?.modelo || '',
        base: v?.base || 'Rio de Janeiro',
        motorista: v?.motorista || '',
        km: v?.kmAtual || 100000,
        atividadePendente,
        motivo,
        prioridade,
        valor: valorPorVeiculo,
        dataPlanejada,
        observacoes,
        status: 'Aberta'
      };
    });

    onSaveBulk(ordersToCreate);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-5 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
              <Layers className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">📦 Lançamento de Manutenção em Massa</h3>
              <p className="text-xs text-slate-400">Abra solicitações de manutenção simultâneas para múltiplos veículos da frota.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 text-xs">
          {/* Step 1: Select Vehicles */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <div className="flex items-center justify-between gap-3">
              <label className="text-slate-200 font-bold flex items-center gap-2 text-sm">
                <Truck className="w-4 h-4 text-indigo-400" />
                1. Selecione os Veículos ({selectedPlacas.length} selecionado(s))
              </label>

              <button
                type="button"
                onClick={toggleSelectAll}
                className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-indigo-300 font-semibold rounded-lg text-xs transition"
              >
                {selectedPlacas.length === filteredVehicles.length ? 'Desmarcar Todos' : 'Selecionar Todos'}
              </button>
            </div>

            <input
              type="text"
              placeholder="Buscar veículo por placa, modelo ou base..."
              value={vehicleSearch}
              onChange={(e) => setVehicleSearch(e.target.value)}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
            />

            <div className="grid grid-cols-2 md:grid-cols-3 gap-2 max-h-48 overflow-y-auto p-2 bg-slate-900 rounded-xl border border-slate-800">
              {filteredVehicles.map((v) => {
                const isSelected = selectedPlacas.includes(v.placa);
                return (
                  <div
                    key={v.id}
                    onClick={() => togglePlaca(v.placa)}
                    className={`p-2.5 rounded-xl border cursor-pointer transition flex items-center justify-between ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/60 text-white'
                        : 'bg-slate-800/60 border-slate-700/60 text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="truncate pr-2">
                      <div className="font-mono font-bold text-xs">{v.placa}</div>
                      <div className="text-[10px] text-slate-400 truncate">{v.modelo} ({v.base})</div>
                    </div>
                    {isSelected ? (
                      <CheckSquare className="w-4 h-4 text-indigo-400 shrink-0" />
                    ) : (
                      <Square className="w-4 h-4 text-slate-600 shrink-0" />
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Step 2: Define Common Maintenance Parameters */}
          <div className="space-y-3 bg-slate-950/60 p-4 rounded-2xl border border-slate-800">
            <label className="text-slate-200 font-bold flex items-center gap-2 text-sm">
              <DollarSign className="w-4 h-4 text-emerald-400" />
              2. Dados da Manutenção para os Veículos Selecionados
            </label>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Atividade Pendente *</label>
                <input
                  type="text"
                  required
                  value={atividadePendente}
                  onChange={(e) => setAtividadePendente(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Motivo *</label>
                <select
                  value={motivo}
                  onChange={(e) => setMotivo(e.target.value as MaintenanceReason)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="Preventiva">Preventiva</option>
                  <option value="Corretiva">Corretiva</option>
                  <option value="Desgaste">Desgaste</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Custo por Veículo (R$)</label>
                <input
                  type="number"
                  step="50"
                  required
                  value={valorPorVeiculo}
                  onChange={(e) => setValorPorVeiculo(Number(e.target.value))}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-bold focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Prioridade</label>
                <select
                  value={prioridade}
                  onChange={(e) => setPrioridade(e.target.value as MaintenancePriority)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                >
                  <option value="Baixa">Baixa</option>
                  <option value="Média">Média</option>
                  <option value="Alta">Alta</option>
                  <option value="Urgente">Urgente</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 font-semibold mb-1">Data Planejada</label>
                <input
                  type="date"
                  required
                  value={dataPlanejada}
                  onChange={(e) => setDataPlanejada(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
                />
              </div>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Observações Padrão</label>
              <textarea
                rows={2}
                value={observacoes}
                onChange={(e) => setObservacoes(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-2 border-t border-slate-800">
            <span className="text-slate-400 text-xs">
              Serão geradas <strong>{selectedPlacas.length}</strong> ordem(ns) no valor total de{' '}
              <strong className="text-emerald-400">R$ {(selectedPlacas.length * valorPorVeiculo).toLocaleString('pt-BR')}</strong>
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={selectedPlacas.length === 0}
                className={`flex items-center gap-2 px-6 py-2.5 font-bold rounded-xl shadow transition ${
                  selectedPlacas.length > 0
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                }`}
              >
                <Save className="w-4 h-4" />
                <span>Gerar {selectedPlacas.length} Solicitações em Massa</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
