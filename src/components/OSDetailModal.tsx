import React from 'react';
import { MaintenanceOrder } from '../types/fleet';
import { formatCurrency, formatDateBR, getOSNumber } from '../utils/fleetHelpers';
import {
  Wrench,
  X,
  Truck,
  User,
  MapPin,
  Calendar,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Clock,
  FileText,
  Printer,
  Edit3,
  ShieldCheck,
  Send,
  History
} from 'lucide-react';

interface OSDetailModalProps {
  order: MaintenanceOrder;
  onClose: () => void;
  onEditOrder?: (order: MaintenanceOrder) => void;
  onApproveStep?: (order: MaintenanceOrder, step: 'aprovacao1' | 'aprovacao2' | 'conclusao') => void;
  onSendEmailAlert?: (order: MaintenanceOrder) => void;
}

export const OSDetailModal: React.FC<OSDetailModalProps> = ({
  order,
  onClose,
  onEditOrder,
  onApproveStep,
  onSendEmailAlert
}) => {
  const osNum = getOSNumber(order);
  const isApp1 = order.aprovacao1?.aprovado;
  const isApp2 = order.aprovacao2?.aprovado;
  const isDone = order.status === 'Concluída' || order.conclusao?.aprovado;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/85 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto print:p-0 print:bg-white">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-2xl w-full p-6 space-y-6 shadow-2xl relative max-h-[90vh] overflow-y-auto print:max-h-none print:border-none print:shadow-none print:bg-white print:text-black">
        
        {/* Header Bar */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800 print:border-slate-300">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-amber-500/10 text-amber-400 rounded-2xl border border-amber-500/20 shrink-0">
              <Wrench className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 bg-indigo-500/15 text-indigo-300 font-mono font-extrabold text-sm rounded-xl border border-indigo-500/30">
                  #{osNum}
                </span>
                <span className={`px-2.5 py-0.5 rounded-xl font-bold uppercase text-xs border ${
                  order.status === 'Atrasada'
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                    : order.status === 'Concluída'
                    ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
                    : 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                }`}>
                  {order.status === 'Concluída' ? 'CONCLUÍDA / REALIZADA' : order.status}
                </span>
                <span className="px-2.5 py-0.5 bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-700">
                  📍 Operação {order.base}
                </span>
              </div>
              <h2 className="text-lg font-black text-white mt-1 print:text-black">
                Ordem de Serviço de Manutenção
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2 print:hidden">
            <button
              type="button"
              onClick={handlePrint}
              className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl border border-slate-700 transition cursor-pointer flex items-center gap-1.5 text-xs font-bold"
              title="Imprimir Ficha de OS"
            >
              <Printer className="w-4 h-4 text-sky-400" />
              <span>Imprimir</span>
            </button>
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-xl transition cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Highlighted Activity Box */}
        <div className="bg-slate-950/80 p-4 rounded-2xl border border-slate-800 space-y-1.5 print:bg-slate-100 print:border-slate-300">
          <div className="text-[11px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
            <FileText className="w-4 h-4" /> Atividade Pendente / Serviço Solicitado
          </div>
          <p className="text-sm font-black text-white leading-relaxed print:text-black">
            {order.atividadePendente}
          </p>
        </div>

        {/* Key Operational Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
          {/* Veículo / Placa */}
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-1 print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Truck className="w-3.5 h-3.5 text-indigo-400" /> Veículo / Placa
            </span>
            <div className="font-mono font-extrabold text-amber-300 text-sm print:text-black">
              {order.placa}
            </div>
            <div className="text-[11px] text-slate-300 truncate print:text-slate-700">
              {order.veiculoModelo || 'Veículo de Frota'}
            </div>
          </div>

          {/* Motorista / Responsável */}
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-1 print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <User className="w-3.5 h-3.5 text-sky-400" /> Responsável
            </span>
            <div className="font-bold text-slate-100 text-xs truncate print:text-black">
              {order.motorista || 'Não Informado'}
            </div>
            <div className="text-[10px] text-slate-400 font-mono">
              {order.km ? `${order.km.toLocaleString('pt-BR')} KM` : '-'}
            </div>
          </div>

          {/* Valor Estimado / Custo */}
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-1 print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <DollarSign className="w-3.5 h-3.5 text-emerald-400" /> Valor Estimado
            </span>
            <div className="font-mono font-black text-emerald-400 text-sm print:text-emerald-800">
              {formatCurrency(order.valor || 0)}
            </div>
            <div className="text-[10px] text-slate-400 font-bold uppercase">
              Motivo: {order.motivo}
            </div>
          </div>

          {/* Prioridade & Datas */}
          <div className="p-3 bg-slate-800/60 rounded-2xl border border-slate-700/80 space-y-1 print:bg-slate-50 print:border-slate-300">
            <span className="text-[10px] text-slate-400 font-semibold flex items-center gap-1">
              <Calendar className="w-3.5 h-3.5 text-amber-400" /> Previsão
            </span>
            <div className="font-mono font-bold text-slate-200 text-xs print:text-black">
              {formatDateBR(order.dataPlanejada)}
            </div>
            <div className="text-[10px] font-bold text-amber-300">
              Prioridade: {order.prioridade}
            </div>
          </div>
        </div>

        {/* Workflow Stages Approval Box */}
        <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-2xl space-y-3 print:bg-slate-50 print:border-slate-300">
          <h4 className="text-xs font-extrabold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 print:text-black">
            <ShieldCheck className="w-4 h-4 text-indigo-400" /> Fluxo Duplo de Aprovação da OS
          </h4>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs">
            {/* 1ª Etapa */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${
              isApp1 ? 'bg-emerald-950/30 border-emerald-700/50 text-emerald-300' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>1ª Etapa (Supervisão)</span>
                {isApp1 ? (
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-mono">APROVADO</span>
                ) : (
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">PENDENTE</span>
                )}
              </div>
              {order.aprovacao1 ? (
                <div className="text-[10px] text-slate-300 space-y-0.5">
                  <div>Por: <strong>{order.aprovacao1.aprovadoPor || 'Supervisão'}</strong></div>
                  <div className="font-mono text-slate-400">{order.aprovacao1.dataHora || '-'}</div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 italic">Aguardando validação técnica</div>
              )}
            </div>

            {/* 2ª Etapa */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${
              isApp2 ? 'bg-indigo-950/30 border-indigo-700/50 text-indigo-300' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>2ª Etapa (Gerência)</span>
                {isApp2 ? (
                  <span className="text-[10px] bg-indigo-500/20 px-1.5 py-0.5 rounded text-indigo-300 font-mono">APROVADO</span>
                ) : (
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">PENDENTE</span>
                )}
              </div>
              {order.aprovacao2 ? (
                <div className="text-[10px] text-slate-300 space-y-0.5">
                  <div>Por: <strong>{order.aprovacao2.aprovadoPor || 'Gerência'}</strong></div>
                  <div className="font-mono text-slate-400">{order.aprovacao2.dataHora || '-'}</div>
                </div>
              ) : (
                <div className="text-[10px] text-slate-500 italic">Aguardando autorização financeira</div>
              )}
            </div>

            {/* Conclusão */}
            <div className={`p-3 rounded-xl border space-y-1.5 ${
              isDone ? 'bg-emerald-950/40 border-emerald-600/60 text-emerald-200' : 'bg-slate-900 border-slate-800 text-slate-400'
            }`}>
              <div className="flex items-center justify-between text-[11px] font-bold">
                <span>Conclusão / Baixa</span>
                {isDone ? (
                  <span className="text-[10px] bg-emerald-500/20 px-1.5 py-0.5 rounded text-emerald-300 font-mono">CONCLUÍDO</span>
                ) : (
                  <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-500 font-mono">EM ANDAMENTO</span>
                )}
              </div>
              <div className="text-[10px] text-slate-300 font-mono">
                {isDone ? `Concluído em: ${formatDateBR(order.dataRealizada || order.dataAtualizacao)}` : 'Aguardando encerramento do serviço'}
              </div>
            </div>
          </div>
        </div>

        {/* Observações */}
        {order.observacoes && (
          <div className="space-y-1">
            <span className="text-xs font-bold text-slate-400 uppercase">Observações Operacionais:</span>
            <p className="p-3 bg-slate-950/60 rounded-xl border border-slate-800 text-slate-300 text-xs leading-relaxed font-sans print:bg-slate-50 print:border-slate-300 print:text-black">
              {order.observacoes}
            </p>
          </div>
        )}

        {/* Audit Log / Histórico */}
        {order.historico && order.historico.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase flex items-center gap-1.5">
              <History className="w-3.5 h-3.5 text-amber-400" /> Histórico de Registros da OS
            </span>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1">
              {order.historico.map((h) => (
                <div key={h.id} className="p-2.5 bg-slate-950/80 rounded-xl border border-slate-800/80 text-[11px] flex justify-between items-center">
                  <div>
                    <span className="font-bold text-slate-200">{h.note}</span>
                    <span className="text-slate-500 text-[10px] ml-2">por {h.author}</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400 shrink-0 ml-3">
                    {formatDateBR(h.date)}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-4 border-t border-slate-800 print:hidden">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition cursor-pointer"
          >
            Fechar
          </button>

          <div className="flex flex-wrap items-center gap-2">
            {onSendEmailAlert && (
              <button
                type="button"
                onClick={() => {
                  onSendEmailAlert(order);
                  onClose();
                }}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Enviar Notificação</span>
              </button>
            )}

            {onEditOrder && (
              <button
                type="button"
                onClick={() => {
                  onEditOrder(order);
                  onClose();
                }}
                className="px-3.5 py-2 bg-amber-500 hover:bg-amber-400 text-slate-950 font-extrabold text-xs rounded-xl shadow transition flex items-center gap-1.5 cursor-pointer"
              >
                <Edit3 className="w-3.5 h-3.5" />
                <span>Editar Ficha da OS</span>
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};
