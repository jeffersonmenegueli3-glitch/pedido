import React, { useState } from 'react';
import { SystemSettings, EmailContact } from '../types/fleet';
import { Settings, Save, RefreshCw, Mail, Building, Check, UserPlus, Send, Trash2, Edit3, MessageSquare, Phone, Smartphone, CheckCircle2, ShieldCheck, Sparkles, Sun, Moon, Palette } from 'lucide-react';
import { User } from 'firebase/auth';

interface SettingsViewProps {
  settings: SystemSettings;
  googleUser?: User | null;
  onOpenConnectEmailModal?: () => void;
  onUpdateSettings: (newSettings: SystemSettings) => void;
  onResetSeedData: () => void;
  onOpenRegisterEmailModal?: (contact?: EmailContact | null) => void;
  onOpenSendEmailModal?: (recipientEmail?: string) => void;
  onOpenSendWhatsAppModal?: (phone?: string) => void;
  onOpenWhatsAppConnect?: () => void;
  onDeleteEmailContact?: (id: string) => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: (theme: 'dark' | 'light') => void;
}

export const SettingsView: React.FC<SettingsViewProps> = ({
  settings,
  googleUser,
  onOpenConnectEmailModal,
  onUpdateSettings,
  onResetSeedData,
  onOpenRegisterEmailModal,
  onOpenSendEmailModal,
  onOpenSendWhatsAppModal,
  onOpenWhatsAppConnect,
  onDeleteEmailContact,
  theme = 'dark',
  onToggleTheme
}) => {
  const [formData, setFormData] = useState<SystemSettings>({ ...settings });
  const [isSaved, setIsSaved] = useState<boolean>(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onUpdateSettings(formData);
    setIsSaved(true);
    setTimeout(() => setIsSaved(false), 3000);
  };

  const registeredList = settings.registeredEmails || [];

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Theme Appearance Selector Card (Escuro / Claro) */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Palette className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">Aparência e Tema do Sistema</h3>
            </div>
            <p className="text-xs text-slate-400">Escolha entre o Modo Escuro (Dark) ou Modo Claro (Light) para personalizar a visualização.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <button
            type="button"
            onClick={() => onToggleTheme && onToggleTheme('dark')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              theme === 'dark'
                ? 'bg-indigo-600/20 border-indigo-500 text-white ring-2 ring-indigo-500/50 shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-slate-900 border border-slate-700 rounded-xl text-indigo-400">
                <Moon className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">🌙 Modo Escuro</h4>
                <p className="text-xs opacity-75 mt-0.5">Fundo escuro, menor cansaço visual e elegância.</p>
              </div>
            </div>
            {theme === 'dark' && <span className="text-indigo-400 font-extrabold text-lg">✓</span>}
          </button>

          <button
            type="button"
            onClick={() => onToggleTheme && onToggleTheme('light')}
            className={`p-4 rounded-2xl border transition-all text-left flex items-center justify-between cursor-pointer ${
              theme === 'light'
                ? 'bg-amber-500/20 border-amber-500 text-slate-900 font-bold ring-2 ring-amber-500/50 shadow-lg'
                : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-500/20 border border-amber-500/30 rounded-xl text-amber-500">
                <Sun className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-sm">☀️ Modo Claro</h4>
                <p className="text-xs opacity-75 mt-0.5">Fundo claro, alto contraste e nitidez diurna.</p>
              </div>
            </div>
            {theme === 'light' && <span className="text-amber-500 font-extrabold text-lg">✓</span>}
          </button>
        </div>
      </div>

      {/* Google E-mail Atrelado Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-rose-400" />
              <h3 className="font-bold text-white text-base">Atrelar E-mail Google ao Aplicativo</h3>
            </div>
            <p className="text-xs text-slate-400">Sincronização bidirecional do seu e-mail com a gestão de frota.</p>
          </div>

          {onOpenConnectEmailModal && (
            <button
              type="button"
              onClick={onOpenConnectEmailModal}
              className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow transition cursor-pointer"
            >
              <Sparkles className="w-4 h-4 text-amber-300" />
              <span>{googleUser ? 'Gerenciar E-mail Atrelado' : '✉️ Atrelar Meu E-mail Agora'}</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Status de Conexão</span>
            <div className="font-bold flex items-center gap-2">
              {googleUser ? (
                <span className="text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  E-mail Atrelado 🟢
                </span>
              ) : (
                <span className="text-amber-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Pendente 🟡
                </span>
              )}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">E-mail Conectado</span>
            <div className="font-bold text-white font-mono truncate">
              {googleUser?.email || 'Nenhum atrelado'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Permissões Habilitadas</span>
            <div className="font-bold text-indigo-400">
              {googleUser ? 'Gmail API & Alertas ⚡' : 'Aguardando Login'}
            </div>
          </div>
        </div>
      </div>
      {/* WhatsApp Canal de Disparo Card */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5 text-emerald-400" />
              <h3 className="font-bold text-white text-base">Conexão WhatsApp da Frota</h3>
            </div>
            <p className="text-xs text-slate-400">Gerencie a instância ativa para envio de alertas instantâneos no WhatsApp.</p>
          </div>

          {onOpenWhatsAppConnect && (
            <button
              type="button"
              onClick={onOpenWhatsAppConnect}
              className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-xl shadow transition cursor-pointer"
            >
              <Smartphone className="w-4 h-4" />
              <span>Configurar / Conectar QR Code</span>
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Status da Conexão</span>
            <div className="font-bold text-emerald-400 flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              <span>{settings.whatsappConnected !== false ? 'Conectado & Ativo 🟢' : 'Desconectado 🟡'}</span>
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Telefone da Instância</span>
            <div className="font-bold text-white font-mono">
              {settings.whatsappConnectedPhone || settings.managerPhone || '+55 (21) 99888-7766'}
            </div>
          </div>

          <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-1">
            <span className="text-[10px] text-slate-400 font-semibold uppercase">Instância API</span>
            <div className="font-bold text-indigo-400">
              {settings.whatsappInstanceName || 'FleetMaster Evolution'}
            </div>
          </div>
        </div>
      </div>

      {/* Registered Contacts Direct Management Box */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2">
              <Mail className="w-5 h-5 text-indigo-400" />
              <h3 className="font-bold text-white text-base">E-mails Cadastrados no Sistema</h3>
            </div>
            <p className="text-xs text-slate-400">Cadastre e gerencie contatos autorizados para envio e recebimento de alertas.</p>
          </div>

          <div className="flex items-center gap-2">
            {onOpenRegisterEmailModal && (
              <button
                type="button"
                onClick={() => onOpenRegisterEmailModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
              >
                <UserPlus className="w-4 h-4" />
                <span>+ Cadastrar E-mail</span>
              </button>
            )}

            {onOpenSendEmailModal && (
              <button
                type="button"
                onClick={() => onOpenSendEmailModal()}
                className="flex items-center gap-1.5 px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
              >
                <Send className="w-4 h-4" />
                <span>Enviar E-mail</span>
              </button>
            )}
          </div>
        </div>

        {registeredList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-xs">
            {registeredList.map((c) => (
              <div key={c.id} className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl flex flex-col justify-between space-y-2">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-white truncate">{c.nome}</span>
                    <span className="text-[10px] px-2 py-0.5 bg-indigo-500/10 text-indigo-400 rounded font-semibold">{c.cargo}</span>
                  </div>
                  <div className="text-slate-400 font-mono text-[11px] truncate mt-0.5">{c.email}</div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-800">
                  <span className="text-[10px] text-emerald-400 font-semibold">
                    {c.recebeAlertas20Dias ? '🚨 Alertas Ativos' : 'Apenas Manual'}
                  </span>
                  <div className="flex items-center gap-1">
                    {onOpenSendEmailModal && (
                      <button
                        type="button"
                        onClick={() => onOpenSendEmailModal(c.email)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Enviar e-mail para este contato"
                      >
                        <Send className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onOpenRegisterEmailModal && (
                      <button
                        type="button"
                        onClick={() => onOpenRegisterEmailModal(c)}
                        className="p-1 text-slate-400 hover:text-white"
                        title="Editar contato"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {onDeleteEmailContact && (
                      <button
                        type="button"
                        onClick={() => onDeleteEmailContact(c.id)}
                        className="p-1 text-slate-400 hover:text-rose-400"
                        title="Excluir contato"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <p className="text-xs text-slate-400">Nenhum e-mail cadastrado ainda.</p>
        )}
      </div>

      {/* Main Settings Form */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl shadow-xl space-y-6">
        <div className="flex items-center gap-3 pb-4 border-b border-slate-800">
          <div className="p-2.5 bg-indigo-500/10 text-indigo-400 rounded-xl border border-indigo-500/20">
            <Settings className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Configurações Gerais da Frota</h2>
            <p className="text-xs text-slate-400">Ajuste e-mail principal do gestor, nome da empresa e disparos.</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1">E-mail Principal do Gestor (Backup de Alertas)</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="email"
                required
                value={formData.managerEmail}
                onChange={(e) => setFormData({ ...formData, managerEmail: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Telefone / WhatsApp Principal do Gestor</label>
            <div className="relative">
              <Phone className="w-4 h-4 text-emerald-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={formData.managerPhone || ''}
                onChange={(e) => setFormData({ ...formData, managerPhone: e.target.value })}
                placeholder="Ex: +55 (21) 99888-7766"
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-emerald-500 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nome do Gestor / Responsável Principal</label>
            <input
              type="text"
              required
              value={formData.managerName}
              onChange={(e) => setFormData({ ...formData, managerName: e.target.value })}
              className="w-full px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          <div>
            <label className="block text-slate-300 font-semibold mb-1">Nome da Empresa / Transportadora</label>
            <div className="relative">
              <Building className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                required
                value={formData.companyName}
                onChange={(e) => setFormData({ ...formData, companyName: e.target.value })}
                className="w-full pl-9 pr-3 py-2.5 bg-slate-800 border border-slate-700 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>

          <div className="space-y-2.5 pt-2">
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoEmailAlerts"
                checked={formData.autoEmailAlerts}
                onChange={(e) => setFormData({ ...formData, autoEmailAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500 bg-slate-800 border-slate-700"
              />
              <label htmlFor="autoEmailAlerts" className="text-slate-200 font-semibold cursor-pointer">
                Ativar Disparo Automático de Notificação por E-mail (20+ Dias Parado)
              </label>
            </div>

            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="autoWhatsappAlerts"
                checked={formData.autoWhatsappAlerts !== false}
                onChange={(e) => setFormData({ ...formData, autoWhatsappAlerts: e.target.checked })}
                className="w-4 h-4 rounded text-emerald-500 focus:ring-emerald-500 bg-slate-800 border-slate-700"
              />
              <label htmlFor="autoWhatsappAlerts" className="text-slate-200 font-semibold cursor-pointer flex items-center gap-2">
                <MessageSquare className="w-4 h-4 text-emerald-400" />
                <span>Ativar Disparo Automático de Alertas de WhatsApp (20+ Dias Parado)</span>
              </label>
            </div>
          </div>

          <div className="pt-4 flex items-center justify-between">
            <button
              type="submit"
              className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition cursor-pointer"
            >
              {isSaved ? <Check className="w-4 h-4" /> : <Save className="w-4 h-4" />}
              <span>{isSaved ? 'Configurações Salvas!' : 'Salvar Configurações'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* System Restore Box */}
      <div className="p-6 bg-slate-900 border border-slate-800 rounded-3xl space-y-3">
        <h3 className="font-bold text-white text-sm">Restauração de Dados Demonstrativos</h3>
        <p className="text-xs text-slate-400">
          Reinicie o banco de dados com os veículos e manutenções originais.
        </p>
        <button
          onClick={onResetSeedData}
          className="flex items-center gap-2 px-4 py-2 bg-rose-950/40 hover:bg-rose-900/60 text-rose-300 font-bold text-xs border border-rose-800/60 rounded-xl transition cursor-pointer"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Restaurar Dados Padrão da Frota</span>
        </button>
      </div>
    </div>
  );
};
