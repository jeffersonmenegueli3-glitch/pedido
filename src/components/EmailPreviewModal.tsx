import React from 'react';
import { Vehicle, MaintenanceOrder } from '../types/fleet';
import { generateEmailAlertTemplate } from '../utils/fleetHelpers';
import { Mail, Send, X, CheckCircle2 } from 'lucide-react';

interface EmailPreviewModalProps {
  vehicle: Vehicle;
  diasParado: number;
  managerEmail: string;
  maintenances?: MaintenanceOrder[];
  onClose: () => void;
  onSendNow: (placa: string) => void;
}

export const EmailPreviewModal: React.FC<EmailPreviewModalProps> = ({
  vehicle,
  diasParado,
  managerEmail,
  maintenances = [],
  onClose,
  onSendNow
}) => {
  const activeM = maintenances.find(m => m.placa === vehicle.placa && m.status !== 'Concluída');
  const motivoStr = activeM
    ? `${activeM.atividadePendente} (${activeM.motivo})${activeM.observacoes ? ` - ${activeM.observacoes}` : ''}`
    : (vehicle.observacoes || 'Manutenção preventiva / corretiva');

  const emailLog = generateEmailAlertTemplate(vehicle, diasParado, managerEmail, true, motivoStr);

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <Mail className="w-5 h-5 text-rose-400" />
            <h3 className="font-bold text-white text-base">Modelo de E-mail de Alerta (20 Dias)</h3>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="space-y-3 text-xs">
          <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 space-y-1">
            <div className="text-slate-400">Para: <strong className="text-slate-200">{managerEmail}</strong></div>
            <div className="text-slate-400">Assunto: <strong className="text-rose-400">{emailLog.assunto}</strong></div>
          </div>

          <div>
            <label className="block text-slate-400 font-semibold mb-1">Corpo da Mensagem Gerada:</label>
            <pre className="text-xs text-slate-200 font-sans whitespace-pre-wrap bg-slate-950/80 p-4 rounded-xl border border-slate-800 leading-relaxed font-mono">
              {emailLog.corpo}
            </pre>
          </div>
        </div>

        <div className="flex items-center justify-between pt-3 border-t border-slate-800">
          <span className="text-[11px] text-slate-400 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Disparo programado pelo backend
          </span>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs"
            >
              Fechar
            </button>

            <button
              onClick={() => {
                onSendNow(vehicle.placa);
                onClose();
              }}
              className="flex items-center gap-2 px-5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow"
            >
              <Send className="w-4 h-4" />
              <span>Simular Envio Agora</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
