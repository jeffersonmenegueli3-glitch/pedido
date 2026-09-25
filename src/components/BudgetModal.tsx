import React, { useState } from 'react';
import { formatCurrency } from '../utils/fleetHelpers';
import { DollarSign, Save, X, Building2, Calculator } from 'lucide-react';

interface BudgetModalProps {
  currentBudget: number;
  budgetsByBase?: Record<string, number>;
  selectedOperacao?: string;
  onClose: () => void;
  onSave: (budgetsByBase: Record<string, number>) => void;
}

export const BudgetModal: React.FC<BudgetModalProps> = ({
  currentBudget,
  budgetsByBase = {},
  selectedOperacao = 'Todas',
  onClose,
  onSave
}) => {
  const [rioBudget, setRioBudget] = useState<number>(budgetsByBase['Rio'] ?? 50000);
  const [interiorBudget, setInteriorBudget] = useState<number>(budgetsByBase['Interior'] ?? 50000);
  const [redespachoBudget, setRedespachoBudget] = useState<number>(budgetsByBase['Redespacho'] ?? 50000);
  const [todasBudget, setTodasBudget] = useState<number>(budgetsByBase['Todas'] ?? (currentBudget || 150000));

  const handleRioChange = (val: number) => {
    setRioBudget(val);
    setTodasBudget(val + Number(interiorBudget) + Number(redespachoBudget));
  };

  const handleInteriorChange = (val: number) => {
    setInteriorBudget(val);
    setTodasBudget(Number(rioBudget) + val + Number(redespachoBudget));
  };

  const handleRedespachoChange = (val: number) => {
    setRedespachoBudget(val);
    setTodasBudget(Number(rioBudget) + Number(interiorBudget) + val);
  };

  const handleAutoSum = () => {
    const sum = Number(rioBudget) + Number(interiorBudget) + Number(redespachoBudget);
    setTodasBudget(sum);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave({
      'Rio': Number(rioBudget),
      'Interior': Number(interiorBudget),
      'Redespacho': Number(redespachoBudget),
      'Todas': Number(todasBudget)
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <DollarSign className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">✏️ Alterar Orçamento por Filial</h3>
              <p className="text-xs text-slate-400">
                Ajuste os limites orçamentários individuais de cada operação
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        {selectedOperacao && selectedOperacao !== 'Todas' && (
          <div className="p-2.5 bg-indigo-950/60 border border-indigo-800/80 rounded-2xl flex items-center gap-2 text-xs text-indigo-300">
            <Building2 className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>
              Operação Selecionada no Momento: <strong className="text-white uppercase">{selectedOperacao}</strong>
            </span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Filial 1: Rio */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                📍 <span>Rio de Janeiro</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {formatCurrency(rioBudget)}
              </span>
            </div>
            <input
              type="number"
              step="1000"
              required
              min="0"
              value={rioBudget}
              onChange={(e) => handleRioChange(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filial 2: Interior */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                📍 <span>Interior</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {formatCurrency(interiorBudget)}
              </span>
            </div>
            <input
              type="number"
              step="1000"
              required
              min="0"
              value={interiorBudget}
              onChange={(e) => handleInteriorChange(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Filial 3: Redespacho */}
          <div className="p-3.5 bg-slate-950/70 rounded-2xl border border-slate-800 space-y-1.5">
            <div className="flex items-center justify-between">
              <label className="font-bold text-slate-200 flex items-center gap-1.5">
                📍 <span>Redespacho</span>
              </label>
              <span className="text-[11px] font-mono text-emerald-400 font-bold">
                {formatCurrency(redespachoBudget)}
              </span>
            </div>
            <input
              type="number"
              step="1000"
              required
              min="0"
              value={redespachoBudget}
              onChange={(e) => handleRedespachoChange(Number(e.target.value))}
              className="w-full px-3.5 py-2 bg-slate-900 border border-slate-700/80 rounded-xl font-mono font-bold text-emerald-400 focus:outline-none focus:border-emerald-500"
            />
          </div>

          {/* Consolidado: Todas as Operações */}
          <div className="p-3.5 bg-indigo-950/40 rounded-2xl border border-indigo-800/60 space-y-2">
            <div className="flex items-center justify-between">
              <label className="font-extrabold text-indigo-300 flex items-center gap-1.5">
                🌐 <span>Todas (Teto Consolidado)</span>
              </label>
              <button
                type="button"
                onClick={handleAutoSum}
                className="px-2.5 py-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold rounded-lg transition flex items-center gap-1 cursor-pointer"
                title="Somar orçamentos das 3 filiais"
              >
                <Calculator className="w-3 h-3" />
                <span>Auto-Somar Filiais</span>
              </button>
            </div>
            <input
              type="number"
              step="1000"
              required
              min="0"
              value={todasBudget}
              onChange={(e) => setTodasBudget(Number(e.target.value))}
              className="w-full px-3.5 py-2.5 bg-slate-900 border border-indigo-500/80 rounded-xl font-mono text-base font-black text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl cursor-pointer"
            >
              Cancelar
            </button>

            <button
              type="submit"
              className="flex items-center gap-2 px-5 py-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold rounded-xl shadow-lg cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Orçamentos</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
