import React, { useState } from 'react';
import { MaintenanceOrder, MaintenanceStatus, MaintenancePriority, MaintenanceReason, Vehicle } from '../types/fleet';
import { getOSNumber } from '../utils/fleetHelpers';
import { X, Save, Wrench } from 'lucide-react';

interface MaintenanceModalProps {
  order?: MaintenanceOrder | null;
  vehicles: Vehicle[];
  onClose: () => void;
  onSave: (orderData: Partial<MaintenanceOrder>) => void;
}

export const MaintenanceModal: React.FC<MaintenanceModalProps> = ({
  order,
  vehicles,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<MaintenanceOrder>>({
    id: order?.id,
    numeroOS: order?.numeroOS || getOSNumber(order) || `OS-2026-${String(Math.floor(100 + Math.random() * 900))}`,
    placa: order?.placa || (vehicles[0]?.placa || ''),
    atividadePendente: order?.atividadePendente || '',
    motivo: order?.motivo || 'Preventiva',
    km: order?.km || 100000,
    valor: order?.valor || 0,
    prioridade: order?.prioridade || 'Média',
    motorista: order?.motorista || '',
    base: order?.base || (vehicles[0]?.base || 'Rio de Janeiro'),
    status: order?.status || 'Aberta',
    dataPlanejada: order?.dataPlanejada || new Date().toISOString().split('T')[0],
    dataRealizada: order?.dataRealizada || '',
    observacoes: order?.observacoes || ''
  });

  const handlePlacaChange = (placa: string) => {
    const selectedV = vehicles.find(v => v.placa === placa);
    setFormData({
      ...formData,
      placa,
      base: selectedV?.base || formData.base,
      motorista: selectedV?.motorista || formData.motorista,
      km: selectedV?.kmAtual || formData.km
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              {order ? 'Editar Solicitação de Manutenção' : 'Nova Solicitação de Manutenção'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Número da Ordem (Nº OS) *</label>
              <input
                type="text"
                required
                placeholder="Ex: OS-2026-001"
                value={formData.numeroOS}
                onChange={(e) => setFormData({ ...formData, numeroOS: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-300 font-mono font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Veículo (Placa) *</label>
              <select
                required
                value={formData.placa}
                onChange={(e) => handlePlacaChange(e.target.value)}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                {vehicles.map((v) => (
                  <option key={v.id} value={v.placa}>
                    {v.placa} - {v.modelo}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Motivo *</label>
              <select
                value={formData.motivo}
                onChange={(e) => setFormData({ ...formData, motivo: e.target.value as MaintenanceReason })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Preventiva">Preventiva</option>
                <option value="Corretiva">Corretiva</option>
                <option value="Desgaste">Desgaste</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Atividade Pendente *</label>
            <input
              type="text"
              required
              placeholder="Ex: Troca de pneus, Revisão do freio, Troca de óleo..."
              value={formData.atividadePendente}
              onChange={(e) => setFormData({ ...formData, atividadePendente: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Custo Estimado / Real (R$)</label>
              <input
                type="number"
                step="0.01"
                value={formData.valor}
                onChange={(e) => setFormData({ ...formData, valor: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-amber-400 font-bold focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Prioridade *</label>
              <select
                value={formData.prioridade}
                onChange={(e) => setFormData({ ...formData, prioridade: e.target.value as MaintenancePriority })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="Baixa">Baixa</option>
                <option value="Média">Média</option>
                <option value="Alta">Alta</option>
                <option value="Urgente">Urgente</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">KM no Momento</label>
              <input
                type="number"
                value={formData.km}
                onChange={(e) => setFormData({ ...formData, km: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Base do Veículo</label>
              <input
                type="text"
                value={formData.base}
                onChange={(e) => setFormData({ ...formData, base: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Responsável</label>
              <input
                type="text"
                value={formData.motorista}
                onChange={(e) => setFormData({ ...formData, motorista: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Status da Manutenção *</label>
              <select
                value={formData.status}
                onChange={(e) => setFormData({ ...formData, status: e.target.value as MaintenanceStatus })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-bold focus:outline-none"
              >
                <option value="Aberta">Aberta</option>
                <option value="Em andamento">Em andamento</option>
                <option value="Concluída">Concluída</option>
                <option value="Atrasada">Atrasada</option>
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Data Planejada</label>
              <input
                type="date"
                value={formData.dataPlanejada}
                onChange={(e) => setFormData({ ...formData, dataPlanejada: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Observações / Histórico de Reparo</label>
            <textarea
              rows={3}
              placeholder="Anotações sobre a oficina, orçamento aprovado, número de peça..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl shadow"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Solicitação</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
