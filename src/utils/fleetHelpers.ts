import { Vehicle, VehicleStatus, StoppedAlertLevelInfo, EmailAlertLog, MaintenanceOrder } from '../types/fleet';

/**
 * Gets formatted Order of Service number (e.g., "OS-2026-001")
 */
export function getOSNumber(order?: Partial<MaintenanceOrder> | null): string {
  if (!order) return 'OS-2026-001';
  if (order.numeroOS && order.numeroOS.trim()) return order.numeroOS;
  if (order.id) {
    const numPart = order.id.replace(/\D/g, '');
    if (numPart) {
      return `OS-2026-${numPart.padStart(3, '0')}`;
    }
  }
  return 'OS-2026-001';
}

/**
 * Calculates exact days a vehicle has been stopped based on `dataInicioParada` or `dataEntradaManutencao`
 */
export function calculateDaysStopped(vehicle: Vehicle, targetDateStr?: string): number {
  if (vehicle.status !== 'Parado' && vehicle.status !== 'Em manutenção') {
    return 0;
  }

  const startDateStr = vehicle.dataInicioParada || vehicle.dataEntradaManutencao;
  if (!startDateStr) return 0;

  const startDate = new Date(startDateStr);
  if (isNaN(startDate.getTime())) return 0;

  const compareDate = targetDateStr ? new Date(targetDateStr) : new Date();
  
  // Set time to midnight UTC for pure date comparison
  const startUtc = Date.UTC(startDate.getFullYear(), startDate.getMonth(), startDate.getDate());
  const compareUtc = Date.UTC(compareDate.getFullYear(), compareDate.getMonth(), compareDate.getDate());

  const diffMs = compareUtc - startUtc;
  if (diffMs <= 0) return 1; // Minimum 1 day when stopped today

  return Math.floor(diffMs / (1000 * 60 * 60 * 24)) + 1;
}

/**
 * Gets stopped alert level threshold mapping based on exact user prompt requirements:
 * 1–10 dias: 🟢 Situação normal
 * 11–15 dias: 🟡 Atenção
 * 16–19 dias: 🟠 Alerta
 * 20 dias: 🔴 VEÍCULO PARADO HÁ 20 DIAS
 * +20 dias (+ de 20): 🚨 CRÍTICO
 */
export function getStoppedAlertLevel(diasParado: number): StoppedAlertLevelInfo {
  if (diasParado <= 0) {
    return {
      level: 'normal',
      label: 'Operacional',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      cardClass: 'bg-emerald-950/20 border-emerald-800/40',
      borderClass: 'border-emerald-500',
      iconName: 'CheckCircle2'
    };
  }

  if (diasParado <= 10) {
    return {
      level: 'normal',
      label: '🟢 Situação normal',
      badgeClass: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
      cardClass: 'bg-emerald-950/20 border-emerald-800/40',
      borderClass: 'border-emerald-500',
      iconName: 'CheckCircle2'
    };
  }

  if (diasParado <= 15) {
    return {
      level: 'atencao',
      label: '🟡 Atenção',
      badgeClass: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
      cardClass: 'bg-amber-950/20 border-amber-800/40',
      borderClass: 'border-amber-500',
      iconName: 'AlertTriangle'
    };
  }

  if (diasParado <= 19) {
    return {
      level: 'alerta',
      label: '🟠 Alerta',
      badgeClass: 'bg-orange-500/10 text-orange-400 border-orange-500/30',
      cardClass: 'bg-orange-950/20 border-orange-800/40',
      borderClass: 'border-orange-500',
      iconName: 'AlertOctagon'
    };
  }

  if (diasParado === 20) {
    return {
      level: '20dias',
      label: '🔴 VEÍCULO PARADO HÁ 20 DIAS',
      badgeClass: 'bg-rose-600/20 text-rose-300 border-rose-500/50 font-bold animate-pulse',
      cardClass: 'bg-rose-950/40 border-rose-600/60 ring-2 ring-rose-500/30',
      borderClass: 'border-rose-600',
      iconName: 'BellRing'
    };
  }

  // > 20 dias
  return {
    level: 'critico',
    label: `🚨 CRÍTICO (${diasParado} DIAS PARADO)`,
    badgeClass: 'bg-red-700/30 text-red-200 border-red-500/60 font-black',
    cardClass: 'bg-red-950/60 border-red-500/80 ring-2 ring-red-500/50',
    borderClass: 'border-red-600',
    iconName: 'AlertTriangle'
  };
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(amount);
}

export function formatDateBR(dateStr?: string): string {
  if (!dateStr) return '-';
  const parts = dateStr.split('-');
  if (parts.length === 3) {
    return `${parts[2]}/${parts[1]}/${parts[0]}`;
  }
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString('pt-BR');
}

export function getVehicleStatusBadge(status: VehicleStatus) {
  switch (status) {
    case 'Disponível':
      return {
        label: '🟢 Disponível',
        className: 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30'
      };
    case 'Em operação':
      return {
        label: '🔵 Em operação',
        className: 'bg-blue-500/15 text-blue-400 border-blue-500/30'
      };
    case 'Parado':
      return {
        label: '🟠 Parado',
        className: 'bg-amber-500/15 text-amber-400 border-amber-500/30'
      };
    case 'Em manutenção':
      return {
        label: '🔴 Em manutenção',
        className: 'bg-rose-500/15 text-rose-400 border-rose-500/30'
      };
    case 'Inativo':
      return {
        label: '⚫ Inativo',
        className: 'bg-slate-700/30 text-slate-400 border-slate-600/30'
      };
  }
}

/**
 * Builds the exact e-mail alert prompt template specified in the requirements
 */
export function generateEmailAlertTemplate(
  vehicle: Vehicle,
  diasParado: number,
  recipientEmail: string,
  isAuto: boolean = true,
  motivoManutencao?: string,
  maintenanceOrder?: Partial<MaintenanceOrder> | null
): EmailAlertLog {
  const dataParadaFormatted = formatDateBR(vehicle.dataInicioParada || vehicle.dataEntradaManutencao);
  const dataPrevisaoFormatted = vehicle.dataPrevistaLiberacao ? formatDateBR(vehicle.dataPrevistaLiberacao) : 'Não informada';
  const osNum = getOSNumber(maintenanceOrder);
  const motivoStr = motivoManutencao || vehicle.observacoes || 'Manutenção programada / em verificação';
  const placaStr = vehicle.placa || 'N/A';
  const modeloStr = `${vehicle.marca || ''} ${vehicle.modelo || 'Veículo da Frota'} (${vehicle.ano || new Date().getFullYear()})`.trim();
  const baseStr = vehicle.base || 'Geral';
  const motoristaStr = vehicle.motorista || 'Não atribuído';
  const statusStr = vehicle.status || 'Parado';
  const kmStr = vehicle.kmAtual ? `${vehicle.kmAtual.toLocaleString('pt-BR')} km` : 'Não informado';
  const obsStr = vehicle.observacoes || 'Verificação urgente e acompanhamento operacional necessários.';
  const valorEst = maintenanceOrder?.valor ? formatCurrency(maintenanceOrder.valor) : 'Em orçamentação';
  const prioridadeStr = maintenanceOrder?.prioridade || 'Alta';

  const alertLevel = getStoppedAlertLevel(diasParado);

  const assunto = `🚨 ALERTA OPERACIONAL DE FROTA: ${placaStr} (${diasParado} Dias Parado - Base ${baseStr})`;
  const corpo = `🚨 *ALERTA OPERACIONAL DE FROTA — FLEETMASTER PRO*

Atenção equipe operacional e supervisão!
O veículo *${placaStr}* (${modeloStr}) alocado na Base *${baseStr}* encontra-se inativo e parado há *${diasParado} dias*.

📋 *DETALHES DA OPERAÇÃO & VEÍCULO:*
• Placa: *${placaStr}*
• Modelo / Marca: ${modeloStr}
• Base / Filial: ${baseStr}
• Motorista Responsável: ${motoristaStr}
• Odômetro (KM Atual): ${kmStr}
• Data de Início da Parada: ${dataParadaFormatted}
• Dias Parado: *${diasParado} dias* (${alertLevel.label})
• Status Operacional: ${statusStr}

🔧 *INFORMAÇÕES DA MANUTENÇÃO & OFICINA:*
• Ordem de Serviço (OS): *${osNum}*
• Motivo da Manutenção: *${motivoStr}*
• Previsão de Liberação: *${dataPrevisaoFormatted}*
• Nível de Prioridade: *${prioridadeStr}*
• Custo / Orçamento Estimado: *${valorEst}*
• Observações Operacionais: ${obsStr}

⚠️ *AÇÃO NECESSÁRIA / PRÓXIMOS PASSOS:*
Favor responder a este e-mail com o status atualizado do orçamento, aprovação de peças ou previsão definitiva de liberação do veículo para retorno à frota ativa.

---
Enviado por: _Gestão de Frota - FleetMaster Pro_`;

  return {
    id: `email-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
    placa: vehicle.placa,
    modelo: vehicle.modelo,
    base: vehicle.base,
    motorista: vehicle.motorista,
    dataInicioParada: vehicle.dataInicioParada || vehicle.dataEntradaManutencao || '',
    diasParado,
    statusVeiculo: vehicle.status,
    assunto,
    corpo,
    destinatario: recipientEmail,
    dataEnvio: new Date().toISOString(),
    disparadoAutomatico: isAuto
  };
}
