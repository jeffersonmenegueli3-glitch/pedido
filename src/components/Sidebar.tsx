import React from 'react';
import {
  LayoutDashboard,
  Truck,
  Wrench,
  DollarSign,
  Clock,
  BarChart3,
  Bell,
  Sparkles,
  Settings,
  AlertTriangle
} from 'lucide-react';

interface SidebarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  alert20DaysCount: number;
  stoppedCount: number;
  maintenanceCount: number;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  alert20DaysCount,
  stoppedCount,
  maintenanceCount
}) => {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard Visão Geral', icon: LayoutDashboard, badge: null },
    { id: 'powerbi', label: 'Painel Power BI', icon: BarChart3, badge: 'POWER BI', badgeColor: 'bg-amber-500/20 text-amber-300 font-bold border border-amber-500/30' },
    { id: 'frota', label: 'Minha Frota', icon: Truck, badge: null },
    { id: 'manutencoes', label: 'Manutenções', icon: Wrench, badge: maintenanceCount > 0 ? maintenanceCount : null, badgeColor: 'bg-indigo-500/20 text-indigo-300' },
    { id: 'orcamento', label: 'Orçamento', icon: DollarSign, badge: null },
    { id: 'veiculos-parados', label: 'Veículos Parados', icon: Clock, badge: stoppedCount > 0 ? stoppedCount : null, badgeColor: 'bg-amber-500/20 text-amber-300' },
    { id: 'relatorios', label: 'Relatórios', icon: BarChart3, badge: null },
    { id: 'alertas', label: 'Alertas & E-mails', icon: Bell, badge: alert20DaysCount > 0 ? alert20DaysCount : null, badgeColor: 'bg-rose-600 text-white animate-pulse' },
    { id: 'configuracoes', label: 'Configurações', icon: Settings, badge: null }
  ];

  return (
    <aside className="w-full lg:w-64 bg-slate-900 border-r border-slate-800 flex flex-col shrink-0">
      {/* Navigation List */}
      <nav className="p-3 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;

          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                  : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/80'
              }`}
            >
              <div className="flex items-center gap-3">
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== null && item.badge !== undefined && (
                <span className={`px-2 py-0.5 text-[10px] rounded-full font-bold ${item.badgeColor || 'bg-slate-800 text-slate-300'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Critical Alert Quick Widget at bottom of sidebar */}
      {alert20DaysCount > 0 && (
        <div className="mt-auto p-4 m-3 rounded-2xl bg-gradient-to-br from-rose-950/60 to-rose-900/40 border border-rose-800/50 text-rose-200">
          <div className="flex items-center gap-2 mb-1.5 text-xs font-bold text-rose-300">
            <AlertTriangle className="w-4 h-4 text-rose-400 animate-bounce" />
            <span>Alerta Crítico (+20 dias)</span>
          </div>
          <p className="text-[11px] text-rose-300/80 leading-relaxed mb-3">
            Existem <strong className="text-white font-black">{alert20DaysCount} veículos</strong> parados há 20 dias ou mais requerendo e-mail de notificação.
          </p>
          <button
            onClick={() => setActiveTab('veiculos-parados')}
            className="w-full py-1.5 px-3 bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs rounded-lg transition text-center shadow"
          >
            Ver Veículos Parados
          </button>
        </div>
      )}
    </aside>
  );
};
