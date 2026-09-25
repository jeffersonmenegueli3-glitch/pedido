import { Vehicle } from '../types/fleet';

/**
 * Cleans phone number to international format (DDI + DDD + Number)
 * E.g., "(21) 99888-7766" -> "5521998887766"
 */
export function sanitizePhoneNumber(phone: string): string {
  if (!phone) return '';
  let cleaned = phone.replace(/\D/g, '');
  if (!cleaned) return '';
  // If no DDI provided (e.g., 10 or 11 digits for Brazil), prepend 55
  if (cleaned.length === 10 || cleaned.length === 11) {
    cleaned = '55' + cleaned;
  }
  return cleaned;
}

/**
 * Formats raw digits for clean UI display: +55 (21) 99888-7766
 */
export function formatPhoneDisplay(phone: string): string {
  const sanitized = sanitizePhoneNumber(phone);
  if (!sanitized) return phone || '';
  if (sanitized.length === 13) {
    return `+${sanitized.slice(0, 2)} (${sanitized.slice(2, 4)}) ${sanitized.slice(4, 9)}-${sanitized.slice(9)}`;
  }
  if (sanitized.length === 12) {
    return `+${sanitized.slice(0, 2)} (${sanitized.slice(2, 4)}) ${sanitized.slice(4, 8)}-${sanitized.slice(8)}`;
  }
  return phone;
}

/**
 * Generates a direct WhatsApp API / Web link (wa.me)
 */
export function getWhatsAppWebUrl(phone: string, text: string): string {
  const sanitizedPhone = sanitizePhoneNumber(phone);
  const encodedText = encodeURIComponent(text);
  return `https://api.whatsapp.com/send?phone=${sanitizedPhone}&text=${encodedText}`;
}

/**
 * Generates a WhatsApp message template
 */
export function generateWhatsAppMessage({
  templateType,
  vehicle,
  days,
  customText,
  managerName = 'Gestão de Frota',
  companyName = 'FleetMaster Pro',
  motivoManutencao
}: {
  templateType: 'alerta_parado_20d' | 'solicitacao_oficina' | 'resumo_equipe' | 'custom';
  vehicle?: Vehicle;
  days?: number;
  customText?: string;
  managerName?: string;
  companyName?: string;
  motivoManutencao?: string;
}): string {
  const vehPlaca = vehicle ? vehicle.placa : 'N/A';
  const vehModelo = vehicle ? vehicle.modelo : 'Veículo da Frota';
  const vehBase = vehicle ? vehicle.base : 'Geral';
  const vehMotorista = vehicle ? vehicle.motorista : 'Não atribuído';
  const motivoStr = motivoManutencao || vehicle?.observacoes || 'Manutenção preventiva / corretiva em andamento';

  if (templateType === 'alerta_parado_20d') {
    const d = days !== undefined ? days : 20;
    return (
      `🚨 *ALERTA OPERACIONAL DE FROTA*\n\n` +
      `Atenção equipe! O veículo *${vehPlaca}* (${vehModelo}) alocado na Base *${vehBase}* está parado há *${d} dias*.\n\n` +
      `📋 *Detalhes da Operação:*\n` +
      `• Placa: *${vehPlaca}*\n` +
      `• Modelo: ${vehModelo}\n` +
      `• Base/Operação: ${vehBase}\n` +
      `• Motorista: ${vehMotorista}\n` +
      `• Dias Parado: *${d} dias*\n` +
      `• Status: ${vehicle?.status || 'Parado'}\n` +
      `• Motivo da Manutenção: *${motivoStr}*\n` +
      `• Observações: ${vehicle?.observacoes || 'Verificação urgente necessária.'}\n\n` +
      `⚠️ *Ação Necessária:* Favor responder com o status atualizado do orçamento ou previsão de liberação.\n\n` +
      `Enviado por: _${managerName} - ${companyName}_`
    );
  }

  if (templateType === 'solicitacao_oficina') {
    return (
      `🔧 *COBRANÇA / SOLICITAÇÃO DE MANUTENÇÃO*\n\n` +
      `Olá equipe de Manutenção/Oficina,\n\n` +
      `Solicitamos prioridade de atendimento e liberação para o veículo *${vehPlaca}* (${vehModelo}).\n\n` +
      `• Placa: *${vehPlaca}*\n` +
      `• KM Atual: ${vehicle?.kmAtual?.toLocaleString('pt-BR') || 'N/A'} km\n` +
      `• Motorista Responsável: ${vehMotorista}\n` +
      `• Base: ${vehBase}\n` +
      `• Motivo da Manutenção: *${motivoStr}*\n\n` +
      `Aguardamos o envio da Ordem de Serviço ou orçamento atualizado.\n\n` +
      `Atenciosamente,\n_${managerName}_`
    );
  }

  if (templateType === 'resumo_equipe') {
    return (
      `📊 *RESUMO DIÁRIO DA FROTA PARA A EQUIPE*\n\n` +
      `Prezada equipe operacional,\n\n` +
      `Segue informativo das operações e manutenções ativas:\n\n` +
      `• Canal de Alertas WhatsApp Ativo 🟢\n` +
      `• Acompanhe em tempo real as liberações na Central FleetMaster.\n\n` +
      `Qualquer dúvida, entre em contato com a gestão de frota.\n\n` +
      `Atenciosamente,\n_${companyName}_`
    );
  }

  return customText || `Mensagem operacional referente ao veículo ${vehPlaca}.`;
}
