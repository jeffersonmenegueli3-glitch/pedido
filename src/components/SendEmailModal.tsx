import React, { useState, useEffect } from 'react';
import { EmailContact, Vehicle, MaintenanceOrder, EmailGroup } from '../types/fleet';
import { Send, Mail, User, X, CheckCircle2, ShieldAlert, Users, Info } from 'lucide-react';
import { User as FirebaseUser } from 'firebase/auth';

interface SendEmailModalProps {
  registeredEmails: EmailContact[];
  emailGroups?: EmailGroup[];
  vehicles: Vehicle[];
  maintenances?: MaintenanceOrder[];
  preselectedRecipient?: string;
  preselectedVehiclePlaca?: string;
  googleUser?: FirebaseUser | null;
  onConnectGoogle?: () => void;
  onClose: () => void;
  onSendEmail: (emailData: {
    destinatario: string;
    assunto: string;
    corpo: string;
    placa?: string;
  }) => Promise<void>;
}

export const SendEmailModal: React.FC<SendEmailModalProps> = ({
  registeredEmails,
  emailGroups = [],
  vehicles,
  maintenances = [],
  preselectedRecipient,
  preselectedVehiclePlaca,
  googleUser,
  onConnectGoogle,
  onClose,
  onSendEmail
}) => {
  const [selectedRecipient, setSelectedRecipient] = useState<string>(
    preselectedRecipient || (registeredEmails.length > 0 ? registeredEmails[0].email : '')
  );
  const [customEmail, setCustomEmail] = useState<string>('');
  const [selectedPlaca, setSelectedPlaca] = useState<string>(preselectedVehiclePlaca || '');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('alerta_parado');
  const [assunto, setAssunto] = useState<string>('');
  const [corpo, setCorpo] = useState<string>('');
  const [isSending, setIsSending] = useState<boolean>(false);

  // Group recipient resolution logic
  const getGroupEmails = (groupKey: string): string[] => {
    const activeEmails = registeredEmails.filter(c => c.ativo !== false).map(c => c.email);

    if (groupKey === 'grupo_todos') {
      return Array.from(new Set(activeEmails));
    }
    if (groupKey === 'grupo_gestores') {
      const matched = registeredEmails
        .filter(c => c.ativo !== false && (c.grupo?.includes('Gestores') || c.cargo.includes('Gestor') || c.cargo.includes('Diretoria')))
        .map(c => c.email);
      return matched.length > 0 ? Array.from(new Set(matched)) : activeEmails;
    }
    if (groupKey === 'grupo_oficina') {
      const matched = registeredEmails
        .filter(c => c.ativo !== false && (c.grupo?.includes('Oficina') || c.cargo.includes('Oficina') || c.cargo.includes('Manutenção')))
        .map(c => c.email);
      return matched.length > 0 ? Array.from(new Set(matched)) : activeEmails;
    }
    if (groupKey === 'grupo_operacional') {
      const matched = registeredEmails
        .filter(c => c.ativo !== false && (c.grupo?.includes('Operacional') || c.cargo.includes('Regional') || c.cargo.includes('Operações')))
        .map(c => c.email);
      return matched.length > 0 ? Array.from(new Set(matched)) : activeEmails;
    }

    // Check dynamic email groups
    const customGrp = emailGroups.find(g => g.id === groupKey || g.nome === groupKey);
    if (customGrp && customGrp.emailsInclusos) {
      return customGrp.emailsInclusos;
    }

    return [];
  };

  const isGroupSelected = selectedRecipient.startsWith('grupo_') || emailGroups.some(g => g.id === selectedRecipient);
  const resolvedGroupEmails = isGroupSelected ? getGroupEmails(selectedRecipient) : [];

  const selectedVehicle = vehicles.find(v => v.placa === selectedPlaca);

  // Update subject and body whenever template or vehicle changes
  useEffect(() => {
    const vehName = selectedVehicle ? `${selectedVehicle.placa} (${selectedVehicle.modelo})` : 'Veículo da Frota';
    const baseName = selectedVehicle ? selectedVehicle.base : 'Geral';
    const activeM = selectedVehicle ? maintenances.find(m => m.placa === selectedVehicle.placa && m.status !== 'Concluída') : undefined;
    const motivoManutencao = activeM
      ? `${activeM.atividadePendente} (${activeM.motivo})${activeM.observacoes ? ` - ${activeM.observacoes}` : ''}`
      : (selectedVehicle?.observacoes || 'Manutenção programada / em verificação');

    if (selectedTemplate === 'alerta_parado') {
      const placaStr = selectedVehicle?.placa || 'N/A';
      const modeloStr = selectedVehicle ? `${selectedVehicle.marca || ''} ${selectedVehicle.modelo || ''} (${selectedVehicle.ano || ''})`.trim() : 'Veículo da Frota';
      const baseStr = selectedVehicle?.base || 'Geral';
      const motoristaStr = selectedVehicle?.motorista || 'Não atribuído';
      const statusStr = selectedVehicle?.status || 'Parado';
      const obsStr = selectedVehicle?.observacoes || 'Verificação urgente e acompanhamento operacional necessários.';
      const kmStr = selectedVehicle?.kmAtual ? `${selectedVehicle.kmAtual.toLocaleString('pt-BR')} km` : 'Não informado';
      const previsaoStr = selectedVehicle?.dataPrevistaLiberacao ? selectedVehicle.dataPrevistaLiberacao : 'A definir';
      const osStr = activeM?.numeroOS || 'OS-2026-001';
      const valorStr = activeM?.valor ? `R$ ${activeM.valor.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}` : 'Em orçamentação';
      const prioridadeStr = activeM?.prioridade || 'Alta';

      setAssunto(`🚨 ALERTA OPERACIONAL DE FROTA: ${placaStr} (Veículo Parado - Base ${baseStr})`);
      setCorpo(`🚨 *ALERTA OPERACIONAL DE FROTA — FLEETMASTER PRO*

Atenção equipe operacional e supervisão!
O veículo *${placaStr}* (${modeloStr}) alocado na Base *${baseStr}* encontra-se inativo e parado na manutenção.

📋 *DETALHES DA OPERAÇÃO & VEÍCULO:*
• Placa: *${placaStr}*
• Modelo / Marca: ${modeloStr}
• Base / Filial: ${baseStr}
• Motorista Responsável: ${motoristaStr}
• Odômetro (KM Atual): ${kmStr}
• Status Operacional: ${statusStr}

🔧 *INFORMAÇÕES DA MANUTENÇÃO & OFICINA:*
• Ordem de Serviço (OS): *${osStr}*
• Motivo da Manutenção: *${motivoManutencao}*
• Previsão de Liberação: *${previsaoStr}*
• Nível de Prioridade: *${prioridadeStr}*
• Custo / Orçamento Estimado: *${valorStr}*
• Observações Operacionais: ${obsStr}

⚠️ *AÇÃO NECESSÁRIA / PRÓXIMOS PASSOS:*
Favor responder a este e-mail com a posição atualizada do orçamento, aprovação de peças ou previsão definitiva de liberação do veículo para retorno à frota ativa.

---
Enviado por: _Gestão de Frota - FleetMaster Pro_`);
    } else if (selectedTemplate === 'relatorio_manutencao') {
      setAssunto(`🔧 Solicitação / Acompanhamento de Manutenção – ${selectedVehicle ? selectedVehicle.placa : 'Geral'}`);
      setCorpo(`Prezada Equipe de Manutenção / Oficina,\n\nSolicitamos atualização detalhada do atendimento e orçamento para a manutenção do veículo ${vehName}.\n\n` +
        `• Placa: ${selectedVehicle?.placa || 'N/A'}\n` +
        `• KM Atual: ${selectedVehicle?.kmAtual?.toLocaleString('pt-BR') || 'N/A'} km\n` +
        `• Motorista Responsável: ${selectedVehicle?.motorista || 'N/A'}\n` +
        `• Motivo da Manutenção: ${motivoManutencao}\n\n` +
        `Solicitamos envio das ordens de serviço pendentes para aprovação no sistema.\n\nAtenciosamente,\nSupervisão de Manutenção`);
    } else if (selectedTemplate === 'comunicado_diretoria') {
      setAssunto(`📊 Relatório Executivo Operacional de Frota`);
      setCorpo(`Prezada Diretoria e Gestão Executiva,\n\nSegue resumo consolidado das operações de frota das bases (Rio, Interior e Redespacho):\n\n` +
        `• Frota Total Monitorada: ${vehicles.length} veículos\n` +
        `• Veículos Operacionais: ${vehicles.filter(v => v.status === 'Em operação' || v.status === 'Disponível').length}\n` +
        `• Veículos em Manutenção / Parados: ${vehicles.filter(v => v.status === 'Parado' || v.status === 'Em manutenção').length}\n\n` +
        `Todos os dados de orçamento e manutenções estão atualizados no painel do sistema.\n\nAtenciosamente,\nGestão Executiva de Frota`);
    } else {
      // Personalizado
      if (!assunto) setAssunto(`Comunicado Operacional de Frota`);
    }
  }, [selectedTemplate, selectedPlaca]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    let finalRecipient = selectedRecipient;
    if (selectedRecipient === 'custom') {
      finalRecipient = customEmail;
    } else if (isGroupSelected) {
      finalRecipient = resolvedGroupEmails.join(', ');
    }

    if (!finalRecipient || !assunto.trim() || !corpo.trim()) return;

    setIsSending(true);
    try {
      await onSendEmail({
        destinatario: finalRecipient,
        assunto,
        corpo,
        placa: selectedPlaca || undefined
      });
      onClose();
    } catch (err) {
      console.error('Error sending email:', err);
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-xl w-full p-6 space-y-5 shadow-2xl relative my-8">
        <div className="flex items-center justify-between pb-3 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 text-rose-400 rounded-xl border border-rose-500/20">
              <Send className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-bold text-white text-base">Enviar E-mail via Gmail API</h3>
              <p className="text-xs text-slate-400">Disparo direto via e-mail real e logado na Central de Alertas.</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1 text-slate-400 hover:text-white rounded-lg transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Gmail Login Status Indicator Banner */}
        <div className={`p-3 rounded-2xl border text-xs flex items-center justify-between gap-3 ${
          googleUser
            ? 'bg-emerald-950/40 border-emerald-500/30 text-emerald-300'
            : 'bg-amber-950/40 border-amber-500/30 text-amber-300'
        }`}>
          <div className="flex items-center gap-2">
            {googleUser ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <ShieldAlert className="w-4 h-4 text-amber-400 shrink-0" />
            )}
            <div>
              <span className="font-bold">
                {googleUser ? `Gmail Conectado: ${googleUser.email}` : 'Gmail Não Conectado'}
              </span>
              <p className="text-[11px] opacity-80">
                {googleUser
                  ? 'E-mails serão enviados diretamente pela sua caixa de entrada oficial do Google Gmail.'
                  : 'Conecte sua conta do Gmail para disparar e-mails reais diretamente pela API.'}
              </p>
            </div>
          </div>
          {!googleUser && onConnectGoogle && (
            <button
              type="button"
              onClick={onConnectGoogle}
              className="px-3 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold rounded-xl transition text-[11px] shrink-0"
            >
              Conectar Gmail
            </button>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          {/* Recipient Selection */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-slate-300 font-semibold">E-mail Destinatário (Grupo ou Contato)</label>
              <button
                type="button"
                onClick={() => setSelectedRecipient('grupo_todos')}
                className={`text-[11px] px-2.5 py-1 rounded-lg font-bold flex items-center gap-1 transition ${
                  selectedRecipient === 'grupo_todos'
                    ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                    : 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 hover:bg-indigo-500/30'
                }`}
              >
                <Users className="w-3.5 h-3.5 text-indigo-300" />
                <span>⚡ Enviar para Todos ({registeredEmails.filter(c => c.ativo !== false).length})</span>
              </button>
            </div>
            <select
              value={selectedRecipient}
              onChange={(e) => setSelectedRecipient(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            >
              <optgroup label="👥 GRUPOS DE E-MAIL (Envio Coletivo)">
                <option value="grupo_todos">👥 Grupo: Todos os Cadastrados ({registeredEmails.filter(c => c.ativo !== false).length} contatos)</option>
                <option value="grupo_gestores">👥 Grupo: Gestores de Frota & Diretoria</option>
                <option value="grupo_oficina">🔧 Grupo: Oficina & Manutenção Central</option>
                <option value="grupo_operacional">🚛 Grupo: Operacional & Regionais</option>
                {emailGroups.map(g => (
                  <option key={g.id} value={g.id}>📁 Grupo: {g.nome} ({g.emailsInclusos?.length || 0} e-mails)</option>
                ))}
              </optgroup>

              <optgroup label="👤 CONTATOS INDIVIDUAIS">
                {registeredEmails.map((c) => (
                  <option key={c.id} value={c.email}>
                    👤 {c.nome} ({c.cargo}) — {c.email}
                  </option>
                ))}
              </optgroup>

              <optgroup label="✍️ OUTROS">
                <option value="custom">✍️ Digitar outro endereço de e-mail...</option>
              </optgroup>
            </select>
          </div>

          {/* Group Emails Preview Card */}
          {isGroupSelected && (
            <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-2xl space-y-1 text-xs">
              <div className="flex items-center justify-between text-indigo-300 font-bold">
                <span className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-indigo-400" />
                  Grupo Selecionado: {resolvedGroupEmails.length} Destinatários
                </span>
                <span className="text-[10px] bg-indigo-500/20 px-2 py-0.5 rounded-md border border-indigo-500/30">Envio em Lote</span>
              </div>
              <p className="text-slate-300 text-[11px] font-mono break-all line-clamp-2">
                {resolvedGroupEmails.join(', ')}
              </p>
            </div>
          )}

          {selectedRecipient === 'custom' && (
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Informe o E-mail de Destino</label>
              <input
                type="email"
                required
                placeholder="Ex: gestor@empresa.com.br"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          {/* Vehicle Selection & Template Preset */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-semibold mb-1">Vincular Veículo (Opcional)</label>
              <select
                value={selectedPlaca}
                onChange={(e) => setSelectedPlaca(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
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
              <label className="block text-slate-300 font-semibold mb-1">Modelo de Mensagem</label>
              <select
                value={selectedTemplate}
                onChange={(e) => setSelectedTemplate(e.target.value)}
                className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              >
                <option value="alerta_parado">🚨 Alerta de Veículo Parado</option>
                <option value="relatorio_manutencao">🔧 Solicitação de Manutenção</option>
                <option value="comunicado_diretoria">📊 Relatório Executivo para Diretoria</option>
                <option value="custom">✍️ Mensagem Personalizada</option>
              </select>
            </div>
          </div>

          {/* Subject */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Assunto do E-mail</label>
            <input
              type="text"
              required
              value={assunto}
              onChange={(e) => setAssunto(e.target.value)}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 font-medium"
            />
          </div>

          {/* Body */}
          <div>
            <label className="block text-slate-300 font-semibold mb-1">Mensagem / Corpo do E-mail</label>
            <textarea
              required
              rows={6}
              value={corpo}
              onChange={(e) => setCorpo(e.target.value)}
              className="w-full p-3 bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-rose-500 text-xs font-mono leading-relaxed"
            />
          </div>

          <div className="flex items-center justify-between pt-3 border-t border-slate-800">
            <span className="text-[11px] text-slate-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
              E-mail registrado no Histórico de Alertas
            </span>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 disabled:opacity-50 text-white font-bold text-xs rounded-xl shadow transition"
              >
                <Send className="w-4 h-4" />
                <span>{isSending ? 'Enviando...' : (selectedRecipient === 'grupo_todos' ? '⚡ Disparar para Todos' : 'Enviar E-mail Agora')}</span>
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};
