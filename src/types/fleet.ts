export type VehicleStatus = 'Disponível' | 'Em operação' | 'Parado' | 'Em manutenção' | 'Inativo';

export type MaintenancePriority = 'Baixa' | 'Média' | 'Alta' | 'Urgente';

export type MaintenanceStatus = 'Aberta' | 'Em andamento' | 'Concluída' | 'Atrasada';

export type MaintenanceReason = 'Desgaste' | 'Preventiva' | 'Corretiva';

export interface VehicleHistoryEntry {
  id: string;
  date: string;
  note: string;
  author: string;
  previousStatus?: VehicleStatus;
  newStatus?: VehicleStatus;
}

export interface Vehicle {
  id: string;
  placa: string;
  modelo: string;
  marca: string;
  ano: number;
  kmAtual: number;
  motorista: string;
  base: string;
  status: VehicleStatus;
  dataEntradaManutencao?: string; // YYYY-MM-DD
  dataPrevistaLiberacao?: string; // YYYY-MM-DD
  dataInicioParada?: string;      // YYYY-MM-DD (Crucial for stopped calculation)
  observacoes: string;
  historico: VehicleHistoryEntry[];
}

export interface MaintenanceHistoryEntry {
  id: string;
  date: string;
  note: string;
  author: string;
  statusChange?: string;
}

export interface ApprovalStep {
  aprovado: boolean;
  dataHora?: string;
  aprovadoPor?: string;
}

export interface MaintenanceOrder {
  id: string;
  numeroOS?: string; // Número da Ordem de Serviço (ex: OS-2026-001)
  atividadePendente: string;
  motivo: MaintenanceReason;
  placa: string;
  veiculoModelo?: string;
  km: number;
  valor: number;
  prioridade: MaintenancePriority;
  motorista: string;
  base: string;
  status: MaintenanceStatus;
  dataAbertura: string;
  dataAtualizacao: string;
  dataPlanejada: string;
  dataRealizada?: string;
  observacoes: string;
  
  // Dual Approval Workflow
  aprovacao1?: ApprovalStep;
  aprovacao2?: ApprovalStep;
  conclusao?: ApprovalStep;

  historico: MaintenanceHistoryEntry[];
}

export interface BudgetConfig {
  orcamentoMensal: number;
  mesAno: string; // e.g. "2026-09"
  budgetsByBase: Record<string, number>;
}

export interface BudgetSummary {
  operacao: string;
  orcamentoMensal: number;
  valorUtilizado: number;
  saldoDisponivel: number;
  percentualUtilizado: number;
  manutencoesAtrasadas: number;
  budgetsByBase: Record<string, number>;
}

export interface EmailAlertLog {
  id: string;
  placa: string;
  modelo: string;
  base: string;
  motorista: string;
  dataInicioParada: string;
  diasParado: number;
  statusVeiculo: VehicleStatus;
  assunto: string;
  corpo: string;
  destinatario: string;
  dataEnvio: string; // ISO string
  disparadoAutomatico: boolean;
}

export interface StoppedAlertLevelInfo {
  level: 'normal' | 'atencao' | 'alerta' | '20dias' | 'critico';
  label: string;
  badgeClass: string;
  cardClass: string;
  borderClass: string;
  iconName: string;
}

export interface EmailGroup {
  id: string;
  nome: string;
  descricao?: string;
  cor?: string;
  emailsInclusos?: string[]; // IDs or Email strings
}

export interface EmailContact {
  id: string;
  nome: string;
  email: string;
  telefone?: string;
  cargo: string;
  grupo?: string; // e.g. "Gestores de Frota", "Diretoria Executiva", "Oficina & Manutenção", "Operacional SP"
  recebeAlertas20Dias: boolean;
  recebeAlertasWhatsapp?: boolean;
  ativo: boolean;
}

export interface WhatsAppAlertLog {
  id: string;
  placa?: string;
  modelo?: string;
  base?: string;
  motorista?: string;
  diasParado?: number;
  destinatarioNome: string;
  telefone: string;
  mensagem: string;
  dataEnvio: string; // ISO string
  status: 'enviado' | 'link_gerado' | 'erro';
  disparadoAutomatico?: boolean;
}

export interface SystemSettings {
  managerEmail: string;
  managerName: string;
  managerPhone?: string;
  companyName: string;
  autoEmailAlerts: boolean;
  autoWhatsappAlerts?: boolean;
  whatsappConnected?: boolean;
  whatsappInstanceName?: string;
  whatsappConnectedPhone?: string;
  alertIntervalDays: number; // default 5 days after 20 days
  registeredEmails?: EmailContact[];
  emailGroups?: EmailGroup[];
}
