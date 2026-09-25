import React from 'react';
import { RefreshCw, Search, Bell, Mail, Truck, ShieldCheck, LogOut, CheckCircle, MessageSquare, Sun, Moon } from 'lucide-react';
import { User } from 'firebase/auth';
import { PWAInstallButton } from './PWAInstallButton';

interface HeaderProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  alert20DaysCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  managerEmail: string;
  googleUser: User | null;
  onConnectGoogle: () => void;
  onDisconnectGoogle: () => void;
  onOpenConnectEmailModal?: () => void;
  isConnectingGoogle: boolean;
  whatsappConnected?: boolean;
  onOpenWhatsAppConnect: () => void;
  onOpenSendWhatsAppModal: () => void;
  theme?: 'dark' | 'light';
  onToggleTheme?: (theme: 'dark' | 'light') => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  setSearchQuery,
  onRefresh,
  isRefreshing,
  alert20DaysCount,
  activeTab,
  setActiveTab,
  managerEmail,
  googleUser,
  onConnectGoogle,
  onDisconnectGoogle,
  onOpenConnectEmailModal,
  isConnectingGoogle,
  whatsappConnected = true,
  onOpenWhatsAppConnect,
  onOpenSendWhatsAppModal,
  theme = 'dark',
  onToggleTheme
}) => {
  const todayStr = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-30 px-4 lg:px-8 py-3 shadow-md">
      <div className="flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Title & Date */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-white leading-none flex items-center gap-2">
                FleetMaster
                <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  v2.5 Pro
                </span>
              </h1>
              <p className="text-xs text-slate-400 capitalize mt-1">
                {todayStr}
              </p>
            </div>
          </div>

          {/* Mobile Refresh Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="md:hidden p-2 text-slate-300 hover:text-white bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 transition"
            title="Atualizar dados"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
          </button>
        </div>

        {/* Global Search Input */}
        <div className="relative w-full md:w-80 lg:w-96">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Pesquisar por placa, motorista, modelo, base ou status..."
            className="w-full pl-9 pr-4 py-2 bg-slate-800/80 border border-slate-700/80 rounded-xl text-xs sm:text-sm text-slate-200 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 focus:border-indigo-500 transition shadow-inner"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 text-xs bg-slate-700 px-1.5 py-0.5 rounded"
            >
              Limpar
            </button>
          )}
        </div>

        {/* Actions, WhatsApp & Gmail Connection */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end flex-wrap">
          {/* WhatsApp Connection Button */}
          <div className="flex items-center gap-1">
            <button
              onClick={onOpenWhatsAppConnect}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-xl border text-xs font-bold transition shadow-sm ${
                whatsappConnected
                  ? 'bg-emerald-950/70 text-emerald-300 border-emerald-500/40 hover:bg-emerald-900/60'
                  : 'bg-amber-950/70 text-amber-300 border-amber-500/40 hover:bg-amber-900/60'
              }`}
              title="Gerenciar conexão do WhatsApp para disparo de alertas"
            >
              <span className={`w-2 h-2 rounded-full ${whatsappConnected ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'}`} />
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{whatsappConnected ? 'WhatsApp Ativo' : 'Conectar WhatsApp'}</span>
            </button>

            <button
              onClick={onOpenSendWhatsAppModal}
              className="p-1.5 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-xl transition"
              title="Enviar mensagem/alerta via WhatsApp agora"
            >
              <MessageSquare className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Gmail / Google E-mail Connection Button */}
          {googleUser ? (
            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-950/70 border border-emerald-500/40 rounded-xl text-xs text-emerald-300 shadow">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
              <button
                onClick={() => onOpenConnectEmailModal ? onOpenConnectEmailModal() : null}
                className="flex items-center gap-1 font-bold hover:underline cursor-pointer"
                title="E-mail do Google Atrelado - Clique para gerenciar"
              >
                <Mail className="w-3.5 h-3.5 text-emerald-400" />
                <span className="truncate max-w-36" title={googleUser.email || ''}>
                  {googleUser.email}
                </span>
              </button>
              <button
                onClick={onDisconnectGoogle}
                className="p-1 hover:bg-emerald-900/60 rounded text-emerald-400 hover:text-rose-400 transition ml-1"
                title="Sair da Conta Google"
              >
                <LogOut className="w-3 h-3" />
              </button>
            </div>
          ) : (
            <button
              onClick={() => onOpenConnectEmailModal ? onOpenConnectEmailModal() : onConnectGoogle()}
              disabled={isConnectingGoogle}
              className="flex items-center gap-2 px-3.5 py-1.5 bg-gradient-to-r from-rose-600 to-indigo-600 hover:from-rose-500 hover:to-indigo-500 text-white font-extrabold text-xs rounded-xl shadow-md transition active:scale-95 disabled:opacity-70 border border-rose-500/30 cursor-pointer"
              title="Atrele seu e-mail do Google (Gmail) para que o app e seu e-mail se conversem"
            >
              <Mail className="w-4 h-4 text-white" />
              <span>{isConnectingGoogle ? 'Atrelando...' : '✉️ Atrelar Meu E-mail'}</span>
            </button>
          )}

          {/* Theme Selector (Escuro / Claro) */}
          {onToggleTheme && (
            <div className="flex items-center p-1 bg-slate-950/80 border border-slate-800 rounded-xl text-xs font-bold shadow-inner">
              <button
                type="button"
                onClick={() => onToggleTheme('dark')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  theme === 'dark'
                    ? 'bg-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Ativar Tema Escuro"
              >
                <Moon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Escuro</span>
              </button>

              <button
                type="button"
                onClick={() => onToggleTheme('light')}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all cursor-pointer ${
                  theme === 'light'
                    ? 'bg-amber-400 text-slate-950 font-black shadow-md'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
                title="Ativar Tema Claro"
              >
                <Sun className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Claro</span>
              </button>
            </div>
          )}

          {/* PWA Download / Install App Button */}
          <PWAInstallButton variant="header" />

          {/* Refresh Data Button */}
          <button
            onClick={onRefresh}
            disabled={isRefreshing}
            className="hidden md:flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs rounded-xl shadow-lg shadow-indigo-600/20 transition active:scale-95 disabled:opacity-70"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin' : ''}`} />
            <span>Atualizar</span>
          </button>

          {/* Alerts Notification Drawer Toggle */}
          <button
            onClick={() => setActiveTab('alertas')}
            className={`relative p-2 rounded-xl border transition ${
              alert20DaysCount > 0
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 hover:bg-rose-500/20'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
            title="Central de Alertas"
          >
            <Bell className="w-4 h-4" />
            {alert20DaysCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 min-w-5 h-5 px-1 bg-rose-600 text-white text-[10px] font-extrabold rounded-full flex items-center justify-center animate-pulse border-2 border-slate-900">
                {alert20DaysCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
