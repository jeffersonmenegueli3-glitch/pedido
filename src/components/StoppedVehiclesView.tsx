import React from 'react';
import { Vehicle } from '../types/fleet';
import {
  calculateDaysStopped,
  getStoppedAlertLevel,
  formatDateBR
} from '../utils/fleetHelpers';
import { Clock, AlertTriangle, Mail, Send, User, MapPin, Truck, CheckCircle, ShieldAlert, MessageSquare } from 'lucide-react';

interface StoppedVehiclesViewProps {
  vehicles: Vehicle[];
  managerEmail: string;
  onOpenEmailPreviewModal: (vehicle: Vehicle, days: number) => void;
  onTriggerTestEmail: (placa: string) => void;
  onOpenSendWhatsAppModal?: (placa: string) => void;
}

export const StoppedVehiclesView: React.FC<StoppedVehiclesViewProps> = ({
  vehicles,
  managerEmail,
  onOpenEmailPreviewModal,
  onTriggerTestEmail,
  onOpenSendWhatsAppModal
}) => {
  // Filter only stopped or in maintenance vehicles
  const stoppedVehicles = vehicles
    .filter(v => v.status === 'Parado' || v.status === 'Em manutenção')
    .map(v => ({
      vehicle: v,
      days: calculateDaysStopped(v),
      alert: getStoppedAlertLevel(calculateDaysStopped(v))
    }))
    .sort((a, b) => b.days - a.days);

  const count20Plus = stoppedVehicles.filter(s => s.days >= 20).length;

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Clock className="w-5 h-5 text-amber-400" />
            <h2 className="text-xl font-bold text-white">Controle Automático dos Veículos Parados</h2>
          </div>
          <p className="text-xs text-slate-400">
            Contagem contínua atualizada diariamente. Alertas automáticos por e-mail configurados para 20 dias.
          </p>
        </div>

        {count20Plus > 0 && (
          <div className="p-3 bg-rose-950/50 border border-rose-800/60 rounded-2xl flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-rose-400 animate-bounce shrink-0" />
            <div>
              <span className="text-xs font-bold text-rose-300 block">🚨 {count20Plus} Veículos com +20 Dias</span>
              <span className="text-[10px] text-rose-300/80">E-mail para: {managerEmail}</span>
            </div>
          </div>
        )}
      </div>

      {/* Threshold Legend Bar */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <div className="p-3 bg-emerald-950/20 border border-emerald-800/40 rounded-xl text-center">
          <span className="text-[10px] text-emerald-400 font-bold block">1 – 10 Dias</span>
          <span className="text-xs font-semibold text-emerald-300">🟢 Situação normal</span>
        </div>
        <div className="p-3 bg-amber-950/20 border border-amber-800/40 rounded-xl text-center">
          <span className="text-[10px] text-amber-400 font-bold block">11 – 15 Dias</span>
          <span className="text-xs font-semibold text-amber-300">🟡 Atenção</span>
        </div>
        <div className="p-3 bg-orange-950/20 border border-orange-800/40 rounded-xl text-center">
          <span className="text-[10px] text-orange-400 font-bold block">16 – 19 Dias</span>
          <span className="text-xs font-semibold text-orange-300">🟠 Alerta</span>
        </div>
        <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-xl text-center">
          <span className="text-[10px] text-rose-400 font-bold block">20 Dias</span>
          <span className="text-xs font-bold text-rose-300">🔴 VEÍCULO PARADO 20D</span>
        </div>
        <div className="p-3 bg-red-950/50 border border-red-700/60 rounded-xl text-center">
          <span className="text-[10px] text-red-300 font-bold block">+20 Dias</span>
          <span className="text-xs font-black text-red-200">🚨 CRÍTICO</span>
        </div>
      </div>

      {/* Cards List */}
      <div className="space-y-4">
        {stoppedVehicles.map(({ vehicle, days, alert }) => (
          <div
            key={vehicle.id}
            className={`p-6 rounded-3xl border transition-all shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 ${alert.cardClass}`}
          >
            {/* Left Column: Placa & Info */}
            <div className="space-y-2 flex-1">
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-2xl font-black font-mono text-white bg-slate-900 px-3 py-1 rounded-xl border border-slate-700">
                  {vehicle.placa}
                </span>
                <span className="font-bold text-slate-200 text-base">{vehicle.modelo}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${alert.badgeClass}`}>
                  {alert.label}
                </span>
              </div>

              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-1">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-slate-400" />
                  <span>Base: <strong>{vehicle.base}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-400" />
                  <span>Responsável: <strong>{vehicle.motorista || 'Não informado'}</strong></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  <span>Início Parada: <strong>{formatDateBR(vehicle.dataInicioParada || vehicle.dataEntradaManutencao)}</strong></span>
                </div>
              </div>

              {vehicle.observacoes && (
                <p className="text-xs text-slate-300 bg-slate-900/60 p-3 rounded-xl border border-slate-800/80">
                  {vehicle.observacoes}
                </p>
              )}
            </div>

            {/* Right Column: Counter & Email Trigger */}
            <div className="flex flex-col items-start md:items-end gap-3 shrink-0">
              <div className="text-right">
                <div className="text-3xl font-black text-white tracking-tight">
                  {days} <span className="text-sm font-normal text-slate-400">dias</span>
                </div>
                <span className="text-[11px] text-slate-400 block">Contador automático em tempo real</span>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                {onOpenSendWhatsAppModal && (
                  <button
                    onClick={() => onOpenSendWhatsAppModal(vehicle.placa)}
                    className="flex items-center gap-1.5 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition active:scale-95"
                    title="Enviar Alerta de WhatsApp para a equipe"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>Enviar WhatsApp</span>
                  </button>
                )}

                <button
                  onClick={() => onOpenEmailPreviewModal(vehicle, days)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition"
                >
                  <Mail className="w-3.5 h-3.5" />
                  <span>Modelo E-mail</span>
                </button>

                <button
                  onClick={() => onTriggerTestEmail(vehicle.placa)}
                  className="flex items-center gap-1.5 px-3 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition"
                  title="Disparar Notificação por E-mail Agora"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>E-mail</span>
                </button>
              </div>
            </div>
          </div>
        ))}

        {stoppedVehicles.length === 0 && (
          <div className="p-12 text-center bg-slate-900 border border-slate-800 rounded-3xl space-y-2">
            <CheckCircle className="w-12 h-12 text-emerald-400 mx-auto" />
            <h3 className="text-lg font-bold text-white">Nenhum veículo parado no momento!</h3>
            <p className="text-xs text-slate-400">Toda a frota está operando ou disponível normalmente.</p>
          </div>
        )}
      </div>
    </div>
  );
};
