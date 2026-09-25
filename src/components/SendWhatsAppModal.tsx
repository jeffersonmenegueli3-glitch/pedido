import React, { useState, useEffect } from 'react';
import { EmailContact, Vehicle, MaintenanceOrder } from '../types/fleet';
import { generateWhatsAppMessage, getWhatsAppWebUrl, sanitizePhoneNumber, formatPhoneDisplay } from '../utils/whatsapp';
import { MessageSquare, Send, X, ExternalLink, Phone, ShieldAlert, CheckCircle2, Copy } from 'lucide-react';

interface SendWhatsAppModalProps {
  registeredContacts: EmailContact[];
  vehicles: Vehicle[];
  maintenances?: MaintenanceOrder[];
  preselectedPhone?: string;
  preselectedVehiclePlaca?: string;
  whatsappConnected?: boolean;
  onOpenConnectModal?: () => void;
  onClose: () => void;
  onSend?: (data: {
    telefone: string;
    mensagem: string;
    destinatarioNome?: string;
    placa?: string;
  }) => Promise<void>;
  onSendWhatsApp?: (data: {
    telefone: string;
    destinatarioNome: string;
    mensagem: string;
    placa?: string;
  }) => Promise<void>;
}

export const SendWhatsAppModal: React.FC<SendWhatsAppModalProps> = ({
  registeredContacts,
  vehicles,
  maintenances = [],
  preselectedPhone,
  preselectedVehiclePlaca,
  whatsappConnected = true,
  onOpenConnectModal,
  onClose,
  onSend,
  onSendWhatsApp
}) => {
  // Filter contacts that have phone numbers
  const contactsWithPhone = registeredContacts.filter(c => Boolean(c.telefone));

  const [selectedRecipientId, setSelectedRecipientId] = useState<string>(
    contactsWithPhone.length > 0 ? contactsWithPhone[0].id : 'custom'
  );
  const [customPhone, setCustomPhone] = useState<string>(preselectedPhone || '');
  const [customName, setCustomName] = useState<string>('Pessoal de Frota');
  
  const [selectedPlaca, setSelectedPlaca] = useState<string>(preselectedVehiclePlaca || '');
  const [selectedTemplate, setSelectedTemplate] = useState<'alerta_parado_20d' | 'solicitacao_oficina' | 'resumo_equipe' | 'custom'>('alerta_parado_20d');
  
  const [mensagem, setMensagem] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  const selectedVehicle = vehicles.find(v => v.placa === selectedPlaca);
  const activeContact = contactsWithPhone.find(c => c.id === selectedRecipientId);

  const targetPhone = selectedRecipientId === 'custom' ? customPhone : (activeContact?.telefone || '');
  const targetName = selectedRecipientId === 'custom' ? customName : (activeContact?.nome || 'Contato');

  // Recalculate message on template or vehicle change
  useEffect(() => {
    const activeM = selectedVehicle ? maintenances.find(m => m.placa === selectedVehicle.placa && m.status !== 'Concluída') : undefined;
    const motivoStr = activeM
      ? `${activeM.atividadePendente} (${activeM.motivo})${activeM.observacoes ? ` - ${activeM.observacoes}` : ''}`
      : (selectedVehicle?.observacoes || 'Manutenção programada / em verificação');

    if (selectedTemplate === 'custom') {
      if (!mensagem) {
        setMensagem(`Atenção pessoal da frota: Comunicado urgente referente ao veículo ${selectedVehicle?.placa || 'da operação'}.\nMotivo da manutenção: ${motivoStr}`);
      }
    } else {
      const generated = generateWhatsAppMessage({
        templateType: selectedTemplate,
        vehicle: selectedVehicle,
        days: selectedVehicle ? 20 : undefined,
        motivoManutencao: motivoStr
      });
      setMensagem(generated);
    }
  }, [selectedTemplate, selectedPlaca]);

  const handleOpenWhatsAppWeb = async () => {
    if (!targetPhone || !mensagem.trim()) return;
    setIsSending(true);

    try {
      // 1. Log send event on backend and Firestore
      if (onSendWhatsApp) {
        await onSendWhatsApp({
          telefone: targetPhone,
          destinatarioNome: targetName,
          mensagem,
          placa: selectedPlaca || undefined
        });
      } else if (onSend) {
        await onSend({
          telefone: targetPhone,
          destinatarioNome: targetName,
          mensagem,
          placa: selectedPlaca || undefined
        });
      }

      // 2. Open WhatsApp Web / App directly in a new tab
      const waUrl = getWhatsAppWebUrl(targetPhone, mensagem);
      window.open(waUrl, '_blank', 'noopener,noreferrer');

      onClose();
    } catch (err) {
      console.error('Error sending WhatsApp message:', err);
    } finally {
      setIsSending(false);
    }
  };

  const handleCopyMessage = () => {
    navigator.clipboard.writeText(mensagem);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-8">
        {/* Title */}
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Enviar Alerta via WhatsApp</h3>
              <p className="text-xs text-slate-400">Disparo direto para o celular da equipe ou grupos de operacionais.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* WhatsApp Connection Status Banner */}
        <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
          whatsappConnected
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            <div>
              <span className="font-bold">WhatsApp Canal Operacional Ativo 🟢</span>
              <p className="text-[11px] opacity-80">
                Abre instantaneamente no WhatsApp Web ou aplicativo com a mensagem formatada.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onOpenConnectModal}
            className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold rounded-lg text-[11px] transition shrink-0"
          >
            Configurar WhatsApp
          </button>
        </div>

        <div className="space-y-4 text-xs">
          {/* Recipient Selection */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Destinatário (Equipe / Pessoal de Frota)</label>
            <select
              value={selectedRecipientId}
              onChange={(e) => setSelectedRecipientId(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
            >
              {contactsWithPhone.map((c) => (
                <option key={c.id} value={c.id}>
                  👤 {c.nome} ({c.cargo}) — {c.telefone}
                </option>
              ))}
              <option value="custom">📱 Digitar número de WhatsApp manualmente...</option>
            </select>
          </div>

          {selectedRecipientId === 'custom' && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Nome do Contato</label>
                <input
                  type="text"
                  placeholder="Ex: Oficina Mecânica / Motorista"
                  value={customName}
                  onChange={(e) => setCustomName(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Número do WhatsApp (DDD + Número)</label>
                <input
                  type="text"
                  placeholder="Ex: +55 (21) 99888-7766"
                  value={customPhone}
                  onChange={(e) => setCustomPhone(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
                />
              </div>
            </div>
          )}

          {/* Vehicle & Template Selector */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vincular Veículo</label>
              <select
                value={selectedPlaca}
                onChange={(e) => setSelectedPlaca(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="">Nenhum (Comunicado Geral)</option>
                {vehicles.map((v) => (
                  <option key={v.id} value={v.placa}>
                    🚗 {v.placa} - {v.modelo} ({v.base})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Modelo de Alerta WhatsApp</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value as any)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="alerta_parado_20d">🚨 Alerta Veículo Parado 20+ Dias</option>
                <option value="solicitacao_oficina">🔧 Cobrança de Oficina / Manutenção</option>
                <option value="resumo_equipe">📊 Resumo Diário para a Equipe</option>
                <option value="custom">✍️ Mensagem Personalizada</option>
              </select>
            </div>
          </div>

          {/* Live WhatsApp Chat Bubble Preview */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold">Prévia da Mensagem no WhatsApp</label>
              <button
                type="button"
                onClick={handleCopyMessage}
                className="text-[11px] text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                <Copy className="w-3 h-3" />
                <span>{copied ? 'Copiado!' : 'Copiar Texto'}</span>
              </button>
            </div>

            <div className="bg-[#0b141a] p-4 rounded-2xl border border-slate-800 relative overflow-hidden">
              <div className="max-w-[88%] ml-auto bg-[#005c4b] text-slate-100 p-3.5 rounded-2xl rounded-tr-none text-xs leading-relaxed font-sans shadow-md space-y-1.5 whitespace-pre-wrap border border-[#007a63]">
                <p>{mensagem}</p>
                <div className="text-[10px] text-emerald-200/70 text-right font-mono flex items-center justify-end gap-1">
                  <span>{new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}</span>
                  <CheckCircle2 className="w-3 h-3 text-emerald-300 inline" />
                </div>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              Para: <strong className="text-slate-200">{targetName}</strong> ({formatPhoneDisplay(targetPhone)})
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleOpenWhatsAppWeb}
                disabled={isSending || !targetPhone}
                className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-extrabold text-xs rounded-xl shadow-lg transition active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Enviando...' : 'Abrir e Enviar no WhatsApp Web'}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
