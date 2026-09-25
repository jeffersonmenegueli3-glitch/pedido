import React, { useState } from 'react';
import { usePWAInstall } from '../hooks/usePWAInstall';
import { Download, Smartphone, Check, X, Info } from 'lucide-react';

interface PWAInstallButtonProps {
  className?: string;
  variant?: 'primary' | 'header' | 'compact';
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  className = '',
  variant = 'header'
}) => {
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showGuideModal, setShowGuideModal] = useState(false);

  if (isInstalled) {
    return (
      <div className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-bold rounded-xl">
        <Check className="w-3.5 h-3.5" />
        <span>App Instalado</span>
      </div>
    );
  }

  const handleButtonClick = async () => {
    if (isInstallable) {
      const success = await install();
      if (!success) {
        setShowGuideModal(true);
      }
    } else {
      setShowGuideModal(true);
    }
  };

  return (
    <>
      <button
        onClick={handleButtonClick}
        className={`flex items-center gap-2 font-bold text-xs rounded-xl shadow-lg transition-all transform active:scale-95 ${
          variant === 'primary'
            ? 'px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white shadow-emerald-600/20'
            : 'px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/30 border border-indigo-400/30'
        } ${className}`}
        title="Baixar e Instalar o App FleetMaster"
      >
        <Download className="w-4 h-4 animate-bounce" />
        <span className="whitespace-nowrap">Baixar App</span>
      </button>

      {/* Installation Instructions Modal */}
      {showGuideModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-indigo-500/40 rounded-3xl max-w-md w-full p-6 space-y-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2.5 text-indigo-400">
                <Smartphone className="w-6 h-6" />
                <h3 className="font-bold text-white text-base">Instalar FleetMaster Pro</h3>
              </div>
              <button
                onClick={() => setShowGuideModal(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isIOS ? (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="font-semibold text-slate-200">No iPhone ou iPad (Safari):</p>
                <ol className="space-y-2 list-decimal list-inside bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <li>Toque no botão <strong>Compartilhar</strong> (ícone do quadrado com seta no rodapé do Safari).</li>
                  <li>Role as opções e selecione <strong>Adicionar à Tela de Início</strong>.</li>
                  <li>Confirme o nome <strong>FleetMaster</strong> e toque em <strong>Adicionar</strong>.</li>
                </ol>
              </div>
            ) : (
              <div className="space-y-3 text-xs text-slate-300">
                <p className="font-semibold text-slate-200">No Chrome / Edge / Celular Android:</p>
                <ol className="space-y-2 list-decimal list-inside bg-slate-950 p-3.5 rounded-2xl border border-slate-800">
                  <li>Clique no ícone de <strong>Instalar App (⬇️)</strong> na barra de endereço do navegador.</li>
                  <li>Ou abra o menu de opções (três pontinhos no canto superior) e clique em <strong>Instalar aplicativo / Adicionar à Tela Inicial</strong>.</li>
                </ol>
              </div>
            )}

            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-2xl flex items-start gap-2.5 text-[11px] text-indigo-300">
              <Info className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <span>O PWA funciona diretamente no celular ou computador como um app nativo, sem precisar de loja de aplicativos!</span>
            </div>

            <button
              onClick={() => setShowGuideModal(false)}
              className="w-full py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-indigo-600/30 transition"
            >
              Entendi
            </button>
          </div>
        </div>
      )}
    </>
  );
};
