import React, { useState } from 'react';
import { Smartphone, QrCode, CheckCircle2, RefreshCw, X, ShieldCheck, Wifi, MessageSquare, Zap } from 'lucide-react';
import { SystemSettings } from '../types/fleet';

interface WhatsAppConnectModalProps {
  settings: SystemSettings;
  onClose: () => void;
  onConnected?: (phone: string, instanceName: string) => Promise<void>;
  onUpdateConnect?: (data: { connected: boolean; phone?: string; instanceName?: string }) => Promise<void>;
}

export const WhatsAppConnectModal: React.FC<WhatsAppConnectModalProps> = ({
  settings,
  onClose,
  onConnected,
  onUpdateConnect
}) => {
  const [phoneNumber, setPhoneNumber] = useState<string>(
    settings.whatsappConnectedPhone || settings.managerPhone || '+55 (21) 99888-7766'
  );
  const [instanceName, setInstanceName] = useState<string>(
    settings.whatsappInstanceName || 'Instância FleetMaster Pro'
  );
  const [isConnected, setIsConnected] = useState<boolean>(settings.whatsappConnected ?? true);
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [step, setStep] = useState<'qr' | 'success'>(isConnected ? 'success' : 'qr');

  const handleSimulateQRScan = async () => {
    setIsScanning(true);
    setTimeout(async () => {
      setIsConnected(true);
      setIsScanning(false);
      setStep('success');
      if (onConnected) {
        await onConnected(phoneNumber, instanceName);
      }
      if (onUpdateConnect) {
        await onUpdateConnect({
          connected: true,
          phone: phoneNumber,
          instanceName
        });
      }
    }, 1800);
  };

  const handleDisconnect = async () => {
    setIsConnected(false);
    setStep('qr');
    if (onUpdateConnect) {
      await onUpdateConnect({
        connected: false,
        phone: phoneNumber,
        instanceName
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 space-y-6 shadow-2xl relative my-8">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base flex items-center gap-2">
                Conectar WhatsApp do Sistema
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 font-extrabold border border-emerald-500/30">
                  Evolution / Z-API
                </span>
              </h3>
              <p className="text-xs text-slate-400">Canal de disparo automático e manual para a equipe de frota.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Current Connection Status Badge */}
        <div className={`p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
          isConnected
            ? 'bg-emerald-950/50 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-3">
            <div className={`w-3 h-3 rounded-full shrink-0 ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-amber-400'}`} />
            <div>
              <span className="font-extrabold text-sm block">
                {isConnected ? 'WhatsApp Conectado e Ativo 🟢' : 'Aguardando Pareamento QR Code 🟡'}
              </span>
              <p className="text-[11px] opacity-80 mt-0.5">
                {isConnected
                  ? `Instância: ${instanceName} (${phoneNumber})`
                  : 'Escaneie o QR Code abaixo no WhatsApp do seu celular em "Aparelhos Conectados".'}
              </p>
            </div>
          </div>
          {isConnected && (
            <button
              onClick={handleDisconnect}
              className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 font-bold rounded-xl border border-rose-500/30 text-[11px] transition shrink-0"
            >
              Desconectar
            </button>
          )}
        </div>

        {/* Dynamic Connection View */}
        {step === 'qr' || !isConnected ? (
          <div className="space-y-5 text-xs text-slate-300">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl text-center flex flex-col items-center justify-center space-y-4">
              <div className="relative p-4 bg-white rounded-2xl shadow-xl border-4 border-emerald-500/20 group">
                {/* Simulated QR Code Graphic */}
                <div className="w-44 h-44 bg-slate-900 rounded-xl flex flex-col items-center justify-center p-2 relative overflow-hidden">
                  <QrCode className="w-36 h-36 text-white" />
                  {isScanning && (
                    <div className="absolute inset-0 bg-emerald-500/30 backdrop-blur-xs flex flex-col items-center justify-center text-white space-y-2">
                      <RefreshCw className="w-8 h-8 animate-spin text-emerald-400" />
                      <span className="font-bold text-xs">Validando Pareamento...</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-1">
                <p className="font-bold text-slate-100">Abra o WhatsApp no celular do Gestor</p>
                <p className="text-[11px] text-slate-400">
                  Acesse <span className="text-emerald-400 font-medium">Configurações &gt; Aparelhos Conectados &gt; Conectar um Aparelho</span> e aponte para a tela.
                </p>
              </div>

              <button
                onClick={handleSimulateQRScan}
                disabled={isScanning}
                className="w-full py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
              >
                <Zap className="w-4 h-4 fill-slate-950" />
                <span>{isScanning ? 'Conectando...' : 'Simular Leitura QR Code (Conectar Agora)'}</span>
              </button>
            </div>

            {/* Config Fields */}
            <div className="space-y-3 pt-2">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Telefone Principal da Instância</label>
                <input
                  type="text"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  placeholder="Ex: +55 (21) 99888-7766"
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome de Identificação da Instância</label>
                <input
                  type="text"
                  value={instanceName}
                  onChange={(e) => setInstanceName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-5 text-xs text-slate-300">
            <div className="bg-slate-950 border border-slate-800 p-5 rounded-2xl space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">WhatsApp da Frota Conectado</h4>
                  <p className="text-slate-400 text-xs">Todos os alertas de 20+ dias e avisos de oficina estão habilitados.</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800">
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Número Ativo</span>
                  <p className="font-bold text-white text-xs mt-0.5">{phoneNumber}</p>
                </div>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Instância</span>
                  <p className="font-bold text-emerald-400 text-xs mt-0.5">{instanceName}</p>
                </div>
              </div>

              <div className="p-3 bg-indigo-950/30 border border-indigo-500/20 rounded-xl space-y-1">
                <span className="font-bold text-indigo-300 flex items-center gap-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  Funcionalidades Habilitadas:
                </span>
                <ul className="list-disc list-inside text-[11px] text-slate-300 space-y-0.5 pl-1">
                  <li>Envio direto para WhatsApp Web em 1 clique</li>
                  <li>Disparo automático de alertas para veículos com +20 dias parados</li>
                  <li>Registros salvos no histórico da Central de Alertas e Firestore</li>
                </ul>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-extrabold text-xs rounded-xl shadow transition"
              >
                Concluir & Fechar
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
