import React, { useState } from 'react';
import { EmailAlertLog, WhatsAppAlertLog, Vehicle, EmailContact, EmailGroup } from '../types/fleet';
import { Bell, Mail, Send, ShieldCheck, RefreshCw, UserPlus, Edit3, Trash2, Tag, CheckCircle2, MessageSquare, Phone, Smartphone, Users, FolderPlus, Info } from 'lucide-react';
import { formatPhoneDisplay } from '../utils/whatsapp';

interface AlertsViewProps {
  emailLogs: EmailAlertLog[];
  whatsappLogs?: WhatsAppAlertLog[];
  managerEmail: string;
  registeredEmails: EmailContact[];
  emailGroups?: EmailGroup[];
  vehicles: Vehicle[];
  onOpenRegisterEmailModal: (contact?: EmailContact | null) => void;
  onOpenSendEmailModal: (recipientEmail?: string) => void;
  onOpenSendWhatsAppModal: (phone?: string) => void;
  onOpenWhatsAppConnect: () => void;
  onDeleteEmailContact: (id: string) => void;
  onTriggerTestEmail: (placa: string) => void;
  onCheckAlertsNow: () => void;
}

export const AlertsView: React.FC<AlertsViewProps> = ({
  emailLogs,
  whatsappLogs = [],
  managerEmail,
  registeredEmails,
  emailGroups = [],
  vehicles,
  onOpenRegisterEmailModal,
  onOpenSendEmailModal,
  onOpenSendWhatsAppModal,
  onOpenWhatsAppConnect,
  onDeleteEmailContact,
  onTriggerTestEmail,
  onCheckAlertsNow
}) => {
  const [activeLogTab, setActiveLogTab] = useState<'email' | 'whatsapp'>('whatsapp');
  const [activeViewTab, setActiveViewTab] = useState<'contacts' | 'groups'>('groups');

  return (
    <div className="space-y-6">
      {/* Top Banner with Quick Action Buttons */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Bell className="w-5 h-5 text-emerald-400" />
            <h2 className="text-xl font-bold text-white">Central de Alertas E-mail & WhatsApp</h2>
          </div>
          <p className="text-xs text-slate-400">
            Cadastre o pessoal de frota com WhatsApp e E-mail, acompanhe disparos automáticos (+20 dias) e envie notificações instantâneas.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => onOpenSendEmailModal('grupo_todos')}
            className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer active:scale-95 ring-2 ring-indigo-400/40 shadow-indigo-500/20"
            title="Disparar e-mail em lote para todos os contatos ativos cadastrados"
          >
            <Users className="w-4 h-4 text-indigo-200" />
            <span>⚡ Enviar para Todos ({registeredEmails.filter(c => c.ativo !== false).length})</span>
          </button>

          <button
            onClick={() => onOpenSendWhatsAppModal()}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow-lg transition cursor-pointer active:scale-95"
          >
            <MessageSquare className="w-4 h-4" />
            <span>Enviar WhatsApp</span>
          </button>

          <button
            onClick={() => onOpenSendEmailModal()}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
          >
            <Send className="w-4 h-4" />
            <span>Enviar E-mail</span>
          </button>

          <button
            onClick={() => onOpenRegisterEmailModal()}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <UserPlus className="w-4 h-4 text-indigo-400" />
            <span>+ Contato</span>
          </button>

          <button
            onClick={onCheckAlertsNow}
            className="flex items-center gap-2 px-3.5 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-xl border border-slate-700 transition cursor-pointer"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Verificar Alertas</span>
          </button>
        </div>
      </div>

      {/* Registered Email & WhatsApp Contacts Section */}
      <div className="p-6 bg-slate-900/90 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveViewTab('groups')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition ${
                activeViewTab === 'groups'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Users className="w-4 h-4 text-indigo-300" />
              <span>Grupos de E-mail & Alertas ({emailGroups.length || 4})</span>
            </button>

            <button
              onClick={() => setActiveViewTab('contacts')}
              className={`px-3.5 py-1.5 rounded-xl font-extrabold text-xs flex items-center gap-2 transition ${
                activeViewTab === 'contacts'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Mail className="w-4 h-4 text-indigo-300" />
              <span>Contatos Individuais ({registeredEmails.length})</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={onOpenWhatsAppConnect}
              className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5 transition"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              <span>WhatsApp Conectado 🟢</span>
            </button>
          </div>
        </div>

        {/* EMAIL GROUPS VIEW */}
        {activeViewTab === 'groups' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Default Groups & Custom Groups */}
            {(emailGroups.length > 0 ? emailGroups : [
              {
                id: 'grupo_todos',
                nome: 'Todos os Cadastrados',
                descricao: 'Disparo coletivo para todos os contatos ativos de frota',
                cor: 'indigo',
                emailsInclusos: registeredEmails.filter(c => c.ativo !== false).map(c => c.email)
              },
              {
                id: 'grupo_gestores',
                nome: 'Gestores de Frota & Diretoria',
                descricao: 'Supervisão executiva, gerência e tomada de decisão',
                cor: 'purple',
                emailsInclusos: registeredEmails.filter(c => c.ativo !== false && (c.grupo?.includes('Gestores') || c.cargo.includes('Gestor') || c.cargo.includes('Diretoria'))).map(c => c.email)
              },
              {
                id: 'grupo_oficina',
                nome: 'Oficina & Manutenção Central',
                descricao: 'Equipe técnica de oficina, mecânicos chefes e suprimentos',
                cor: 'amber',
                emailsInclusos: registeredEmails.filter(c => c.ativo !== false && (c.grupo?.includes('Oficina') || c.cargo.includes('Oficina') || c.cargo.includes('Manutenção'))).map(c => c.email)
              },
              {
                id: 'grupo_operacional',
                nome: 'Operacional & Regionais',
                descricao: 'Gerentes de tráfego das bases Rio, Interior e Redespacho',
                cor: 'emerald',
                emailsInclusos: registeredEmails.filter(c => c.ativo !== false && (c.grupo?.includes('Operacional') || c.cargo.includes('Regional') || c.cargo.includes('Operações'))).map(c => c.email)
              }
            ]).map((grp) => {
              const memberEmails = grp.emailsInclusos && grp.emailsInclusos.length > 0
                ? grp.emailsInclusos
                : registeredEmails.filter(c => c.ativo !== false).map(c => c.email);

              return (
                <div
                  key={grp.id}
                  className="p-4 bg-slate-950/80 border border-slate-800 hover:border-indigo-500/50 rounded-2xl space-y-3 shadow transition flex flex-col justify-between"
                >
                  <div className="space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
                          <Users className="w-4 h-4" />
                        </div>
                        <div>
                          <h4 className="font-bold text-white text-sm">{grp.nome}</h4>
                          <p className="text-[11px] text-slate-400">{grp.descricao || 'Grupo oficial de envio de alertas de frota'}</p>
                        </div>
                      </div>
                      <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 text-[10px] rounded-full font-bold whitespace-nowrap shrink-0">
                        {memberEmails.length} E-mails
                      </span>
                    </div>

                    {/* Email pills preview */}
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {memberEmails.slice(0, 4).map((emailStr, idx) => (
                        <span key={idx} className="text-[10px] px-2 py-0.5 bg-slate-800/80 text-slate-300 border border-slate-700/60 rounded-md font-mono">
                          {emailStr}
                        </span>
                      ))}
                      {memberEmails.length > 4 && (
                        <span className="text-[10px] px-2 py-0.5 bg-indigo-950 text-indigo-300 rounded-md font-bold">
                          +{memberEmails.length - 4} mais
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Grupo ativo para disparo imediato
                    </span>

                    <button
                      onClick={() => onOpenSendEmailModal(grp.id)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-extrabold rounded-xl transition text-[11px] shadow-md"
                    >
                      <Send className="w-3.5 h-3.5" />
                      <span>Enviar para este Grupo</span>
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* INDIVIDUAL CONTACTS VIEW */}
        {activeViewTab === 'contacts' && (
          registeredEmails.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {registeredEmails.map((contact) => (
                <div
                  key={contact.id}
                  className="p-4 bg-slate-950/80 border border-slate-800 hover:border-emerald-500/50 rounded-2xl space-y-3 shadow transition flex flex-col justify-between"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-start justify-between gap-2">
                      <span className="font-bold text-white text-sm truncate">{contact.nome}</span>
                      <span className="px-2 py-0.5 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-[10px] rounded-md font-semibold whitespace-nowrap">
                        {contact.cargo}
                      </span>
                    </div>

                    <div className="text-xs text-slate-300 font-mono flex items-center gap-1.5 truncate">
                      <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                      <span className="truncate">{contact.email}</span>
                    </div>

                    {contact.telefone && (
                      <div className="text-xs text-emerald-400 font-mono flex items-center gap-1.5 truncate font-semibold">
                        <Phone className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                        <span>{formatPhoneDisplay(contact.telefone)}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap items-center gap-1.5 pt-1">
                      {contact.grupo && (
                        <span className="text-[10px] px-2 py-0.5 bg-purple-500/10 text-purple-300 border border-purple-500/20 rounded-md font-semibold">
                          👥 {contact.grupo}
                        </span>
                      )}
                      {contact.recebeAlertas20Dias && (
                        <span className="text-[10px] px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded-md font-semibold">
                          🚨 Alerta 20D
                        </span>
                      )}
                      {contact.recebeAlertasWhatsapp !== false && (
                        <span className="text-[10px] px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-md font-semibold flex items-center gap-1">
                          💬 WhatsApp
                        </span>
                      )}
                      {contact.ativo && (
                        <span className="text-[10px] px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md">
                          Ativo
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-3 border-t border-slate-800/80 text-xs">
                    <div className="flex items-center gap-2">
                      {contact.telefone && (
                        <button
                          onClick={() => onOpenSendWhatsAppModal(contact.telefone)}
                          className="flex items-center gap-1 px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black rounded-xl transition text-[11px]"
                          title="Enviar WhatsApp direto"
                        >
                          <MessageSquare className="w-3.5 h-3.5" />
                          <span>WhatsApp</span>
                        </button>
                      )}

                      <button
                        onClick={() => onOpenSendEmailModal(contact.email)}
                        className="flex items-center gap-1 px-2.5 py-1.5 bg-indigo-600/20 hover:bg-indigo-600 text-indigo-300 hover:text-white border border-indigo-500/30 rounded-xl font-bold transition text-[11px]"
                      >
                        <Mail className="w-3.5 h-3.5" />
                        <span>E-mail</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => onOpenRegisterEmailModal(contact)}
                        title="Editar Contato"
                        className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition"
                      >
                        <Edit3 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => onDeleteEmailContact(contact.id)}
                        title="Excluir Contato"
                        className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-slate-800 rounded-lg transition"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="p-8 text-center bg-slate-950/60 border border-slate-800 rounded-2xl text-slate-400 text-xs space-y-2">
              <p>Nenhum contato cadastrado individualmente.</p>
              <button
                onClick={() => onOpenRegisterEmailModal()}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold rounded-xl text-xs transition"
              >
                + Cadastrar Primeiro Contato
              </button>
            </div>
          )
        )}
      </div>

      {/* Logs Section with Tabs (WhatsApp Logs & Email Logs) */}
      <div className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-2">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveLogTab('whatsapp')}
              className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-2 transition ${
                activeLogTab === 'whatsapp'
                  ? 'bg-emerald-600 text-slate-950 shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <MessageSquare className="w-4 h-4" />
              <span>Logs de WhatsApp ({whatsappLogs.length})</span>
            </button>

            <button
              onClick={() => setActiveLogTab('email')}
              className={`px-4 py-2 font-bold text-xs rounded-xl flex items-center gap-2 transition ${
                activeLogTab === 'email'
                  ? 'bg-indigo-600 text-white shadow-lg'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              <Mail className="w-4 h-4" />
              <span>Logs de E-mail ({emailLogs.length})</span>
            </button>
          </div>

          <span className="text-xs text-slate-400">Histórico de Disparos em Tempo Real</span>
        </div>

        {/* WhatsApp Logs List */}
        {activeLogTab === 'whatsapp' && (
          <div className="space-y-4">
            {whatsappLogs.map((log) => (
              <div key={log.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
                      <MessageSquare className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm flex items-center gap-2">
                        <span>Alerta WhatsApp para {log.destinatarioNome}</span>
                        <span className="text-xs font-mono text-emerald-400">({log.telefone})</span>
                      </div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2 mt-0.5">
                        <span className="px-2 py-0.2 bg-slate-800 text-slate-300 rounded font-mono">Placa: {log.placa || 'GERAL'}</span>
                        <span>•</span>
                        <span>{log.disparadoAutomatico ? '🤖 Disparo Automático' : '👤 Envio Manual'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 font-mono">
                    {new Date(log.dataEnvio).toLocaleString('pt-BR')}
                  </div>
                </div>

                <div className="bg-[#0b141a] p-3.5 rounded-xl border border-slate-800">
                  <pre className="text-xs text-emerald-200 font-sans whitespace-pre-wrap leading-relaxed">
                    {log.mensagem}
                  </pre>
                </div>
              </div>
            ))}

            {whatsappLogs.length === 0 && (
              <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs">
                Nenhum alerta de WhatsApp disparado até o momento.
              </div>
            )}
          </div>
        )}

        {/* Email Logs List */}
        {activeLogTab === 'email' && (
          <div className="space-y-4">
            {emailLogs.map((log) => (
              <div key={log.id} className="p-5 bg-slate-900 border border-slate-800 rounded-2xl space-y-3 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 pb-2 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <span className={`p-2 rounded-lg ${log.disparadoAutomatico ? 'bg-rose-500/10 text-rose-400' : 'bg-indigo-500/10 text-indigo-400'}`}>
                      <Mail className="w-4 h-4" />
                    </span>
                    <div>
                      <div className="font-bold text-white text-sm">{log.assunto}</div>
                      <div className="text-[10px] text-slate-400 flex items-center gap-2">
                        <span className="px-2 py-0.2 bg-slate-800 text-slate-300 rounded font-mono">Placa: {log.placa}</span>
                        <span>•</span>
                        <span>{log.disparadoAutomatico ? '🤖 Disparo Automático (20 Dias)' : '👤 Envio Manual Direct'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-[11px] text-slate-400 flex items-center gap-2">
                    <span>Enviado para: <strong className="text-slate-200">{log.destinatario}</strong></span>
                    <span>•</span>
                    <span>{new Date(log.dataEnvio).toLocaleString('pt-BR')}</span>
                  </div>
                </div>

                <pre className="text-xs text-slate-300 font-sans whitespace-pre-wrap bg-slate-950/80 p-4 rounded-xl border border-slate-800 leading-relaxed font-mono">
                  {log.corpo}
                </pre>
              </div>
            ))}

            {emailLogs.length === 0 && (
              <div className="p-10 text-center bg-slate-900 border border-slate-800 rounded-3xl text-slate-400 text-xs">
                Nenhum e-mail de alerta foi disparado até o momento.
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
