import React, { useState } from 'react';
import { Vehicle, VehicleStatus } from '../types/fleet';
import { X, Save, Truck, Calendar, MapPin, User, Gauge } from 'lucide-react';

interface VehicleModalProps {
  vehicle?: Vehicle | null;
  onClose: () => void;
  onSave: (vehicleData: Partial<Vehicle>) => void;
}

export const VehicleModal: React.FC<VehicleModalProps> = ({
  vehicle,
  onClose,
  onSave
}) => {
  const [formData, setFormData] = useState<Partial<Vehicle>>({
    placa: vehicle?.placa || '',
    modelo: vehicle?.modelo || '',
    marca: vehicle?.marca || 'Mercedes-Benz',
    ano: vehicle?.ano || 2022,
    kmAtual: vehicle?.kmAtual || 100000,
    motorista: vehicle?.motorista || '',
    base: vehicle?.base || 'Rio de Janeiro',
    status: vehicle?.status || 'Disponível',
    dataEntradaManutencao: vehicle?.dataEntradaManutencao || '',
    dataPrevistaLiberacao: vehicle?.dataPrevistaLiberacao || '',
    dataInicioParada: vehicle?.dataInicioParada || '',
    observacoes: vehicle?.observacoes || ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Truck className="w-5 h-5 text-indigo-400" />
            <h3 className="font-bold text-white text-base">
              {vehicle ? 'Editar Veículo' : 'Cadastrar Novo Veículo'}
            </h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Placa *</label>
              <input
                type="text"
                required
                placeholder="Ex: ABC1D23"
                value={formData.placa}
                onChange={(e) => setFormData({ ...formData, placa: e.target.value.toUpperCase() })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Modelo *</label>
              <input
                type="text"
                required
                placeholder="Ex: Mercedes-Benz Atego"
                value={formData.modelo}
                onChange={(e) => setFormData({ ...formData, modelo: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Marca</label>
              <input
                type="text"
                value={formData.marca}
                onChange={(e) => setFormData({ ...formData, marca: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Ano</label>
              <input
                type="number"
                value={formData.ano}
                onChange={(e) => setFormData({ ...formData, ano: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">KM Atual</label>
              <input
                type="number"
                value={formData.kmAtual}
                onChange={(e) => setFormData({ ...formData, kmAtual: Number(e.target.value) })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Responsável</label>
              <input
                type="text"
                placeholder="Ex: João Silva"
                value={formData.motorista}
                onChange={(e) => setFormData({ ...formData, motorista: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Base do Veículo</label>
              <input
                type="text"
                required
                placeholder="Ex: Rio de Janeiro"
                value={formData.base}
                onChange={(e) => setFormData({ ...formData, base: e.target.value })}
                className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Status do Veículo *</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as VehicleStatus })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 font-semibold"
            >
              <option value="Disponível">🟢 Disponível</option>
              <option value="Em operação">🔵 Em operação</option>
              <option value="Parado">🟠 Parado</option>
              <option value="Em manutenção">🔴 Em manutenção</option>
              <option value="Inativo">⚫ Inativo</option>
            </select>
          </div>

          {(formData.status === 'Parado' || formData.status === 'Em manutenção') && (
            <div className="grid grid-cols-2 gap-3 p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl">
              <div>
                <label className="block text-amber-300 font-semibold mb-1">Data Início da Parada</label>
                <input
                  type="date"
                  value={formData.dataInicioParada || formData.dataEntradaManutencao || ''}
                  onChange={(e) => setFormData({ ...formData, dataInicioParada: e.target.value, dataEntradaManutencao: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-amber-300 font-semibold mb-1">Previsão Liberação</label>
                <input
                  type="date"
                  value={formData.dataPrevistaLiberacao || ''}
                  onChange={(e) => setFormData({ ...formData, dataPrevistaLiberacao: e.target.value })}
                  className="w-full px-2.5 py-1.5 bg-slate-800 border border-slate-700 rounded-lg text-white focus:outline-none"
                />
              </div>
            </div>
          )}

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Observações / Histórico Inicial</label>
            <textarea
              rows={3}
              placeholder="Detalhes sobre o estado do veículo ou motivo da parada..."
              value={formData.observacoes}
              onChange={(e) => setFormData({ ...formData, observacoes: e.target.value })}
              className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
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
              <span>Salvar Veículo</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
