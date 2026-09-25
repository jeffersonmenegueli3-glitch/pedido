import { Vehicle, MaintenanceOrder, BudgetConfig, SystemSettings, EmailAlertLog, WhatsAppAlertLog } from '../types/fleet';

export const INITIAL_SETTINGS: SystemSettings = {
  managerEmail: 'jeffersonmenegueli3@gmail.com',
  managerName: 'Jefferson Menegueli',
  managerPhone: '+55 (21) 99888-7766',
  companyName: 'Logística & Transportes Brasil',
  autoEmailAlerts: true,
  autoWhatsappAlerts: true,
  whatsappConnected: true,
  whatsappInstanceName: 'Instância FleetMaster Pro',
  whatsappConnectedPhone: '+55 (21) 99888-7766',
  alertIntervalDays: 5,
  registeredEmails: [
    {
      id: 'c-1',
      nome: 'Jefferson Menegueli',
      email: 'jeffersonmenegueli3@gmail.com',
      telefone: '+55 (21) 99888-7766',
      cargo: 'Gestor de Frota',
      grupo: 'Gestores de Frota & Diretoria',
      recebeAlertas20Dias: true,
      recebeAlertasWhatsapp: true,
      ativo: true
    },
    {
      id: 'c-2',
      nome: 'Diretoria de Operações',
      email: 'diretoria@logistica.com.br',
      telefone: '+55 (21) 98765-4321',
      cargo: 'Diretoria Executiva',
      grupo: 'Gestores de Frota & Diretoria',
      recebeAlertas20Dias: true,
      recebeAlertasWhatsapp: true,
      ativo: true
    },
    {
      id: 'c-3',
      nome: 'Oficina Central & Manutenção',
      email: 'manutencao@logistica.com.br',
      telefone: '+55 (21) 97654-3210',
      cargo: 'Oficina Central',
      grupo: 'Oficina & Manutenção Central',
      recebeAlertas20Dias: true,
      recebeAlertasWhatsapp: true,
      ativo: true
    }
  ],
  emailGroups: [
    {
      id: 'g-todos',
      nome: 'Todos os Cadastrados',
      descricao: 'Todos os e-mails e contatos ativos no sistema de frota',
      cor: 'indigo',
      emailsInclusos: ['jeffersonmenegueli3@gmail.com', 'diretoria@logistica.com.br', 'manutencao@logistica.com.br']
    },
    {
      id: 'g-1',
      nome: 'Gestores de Frota & Diretoria',
      descricao: 'Supervisores de operação, gerência geral e diretoria executiva',
      cor: 'purple',
      emailsInclusos: ['jeffersonmenegueli3@gmail.com', 'diretoria@logistica.com.br']
    },
    {
      id: 'g-2',
      nome: 'Oficina & Manutenção Central',
      descricao: 'Chefia de oficina, mecânicos chefes e suprimentos de peças',
      cor: 'amber',
      emailsInclusos: ['manutencao@logistica.com.br', 'jeffersonmenegueli3@gmail.com']
    },
    {
      id: 'g-3',
      nome: 'Operacional & Regionais',
      descricao: 'Gerentes das bases Rio, Interior e Redespacho',
      cor: 'emerald',
      emailsInclusos: ['jeffersonmenegueli3@gmail.com', 'diretoria@logistica.com.br']
    }
  ]
};

export const INITIAL_BUDGET: BudgetConfig = {
  orcamentoMensal: 150000.00,
  mesAno: '2026-09',
  budgetsByBase: {
    'Todas': 150000.00,
    'Rio': 50000.00,
    'Interior': 50000.00,
    'Redespacho': 50000.00
  }
};

// 3 Operações Oficiais da Empresa
export const BASES_LIST = ['Rio', 'Interior', 'Redespacho'];

export const INITIAL_VEHICLES: Vehicle[] = [
  // ---------------- OPERAÇÃO 1: RIO ----------------
  {
    id: 'v-rio-1',
    placa: 'RIO1A23',
    modelo: 'Mercedes-Benz Atego 2430',
    marca: 'Mercedes-Benz',
    ano: 2022,
    kmAtual: 184200,
    motorista: 'João Silva',
    base: 'Rio',
    status: 'Em manutenção',
    dataEntradaManutencao: '2026-09-04',
    dataInicioParada: '2026-09-04', // 20 dias atrás
    dataPrevistaLiberacao: '2026-09-28',
    observacoes: 'Operação Rio - Aguardando módulo eletrônico da transmissão retido no distribuidor.',
    historico: [
      { id: 'vh-r1', date: '2026-09-04', note: 'Entrada na manutenção devido a falha no módulo de marcha.', author: 'João Silva', newStatus: 'Em manutenção' },
      { id: 'vh-r2', date: '2026-09-15', note: 'Peça encomendada com prioridade Urgente.', author: 'Oficina Central Rio' }
    ]
  },
  {
    id: 'v-rio-2',
    placa: 'RIO2B45',
    modelo: 'VW Delivery 11.180',
    marca: 'Volkswagen',
    ano: 2023,
    kmAtual: 85000,
    motorista: 'Sérgio Ramos',
    base: 'Rio',
    status: 'Em manutenção',
    dataEntradaManutencao: '2026-09-23',
    dataInicioParada: '2026-09-23',
    dataPrevistaLiberacao: '2026-09-25',
    observacoes: 'Operação Rio - Troca preventiva de kit de embreagem.',
    historico: []
  },
  {
    id: 'v-rio-3',
    placa: 'RIO3C67',
    modelo: 'Scania R450',
    marca: 'Scania',
    ano: 2023,
    kmAtual: 128000,
    motorista: 'Cláudio Duarte',
    base: 'Rio',
    status: 'Em operação',
    observacoes: 'Operação Rio - Rota urbana e metropolitana ativa.',
    historico: []
  },
  {
    id: 'v-rio-4',
    placa: 'RIO4D89',
    modelo: 'Volvo VM 270',
    marca: 'Volvo',
    ano: 2022,
    kmAtual: 94000,
    motorista: 'Alexandre Pires',
    base: 'Rio',
    status: 'Em operação',
    observacoes: 'Operação Rio - Distribuição em andamento.',
    historico: []
  },
  {
    id: 'v-rio-5',
    placa: 'RIO5E12',
    modelo: 'Mercedes-Benz Accelo 1016',
    marca: 'Mercedes-Benz',
    ano: 2021,
    kmAtual: 112000,
    motorista: 'Renato Garcia',
    base: 'Rio',
    status: 'Disponível',
    observacoes: 'Operação Rio - Veículo revisado e pronto na garagem.',
    historico: []
  },
  {
    id: 'v-rio-6',
    placa: 'RIO6F34',
    modelo: 'DAF XF 480',
    marca: 'DAF',
    ano: 2022,
    kmAtual: 145000,
    motorista: 'Thiago Viana',
    base: 'Rio',
    status: 'Disponível',
    observacoes: 'Operação Rio - Pronto para alocação.',
    historico: []
  },
  {
    id: 'v-rio-7',
    placa: 'RIO7G56',
    modelo: 'Mercedes-Benz Actros 2651',
    marca: 'Mercedes-Benz',
    ano: 2022,
    kmAtual: 168000,
    motorista: 'Lucas Rocha',
    base: 'Rio',
    status: 'Parado',
    dataInicioParada: '2026-09-18',
    observacoes: 'Operação Rio - Aguardando liberação de documentação.',
    historico: []
  },

  // ---------------- OPERAÇÃO 2: INTERIOR ----------------
  {
    id: 'v-int-1',
    placa: 'INT1A99',
    modelo: 'Volvo FH 540',
    marca: 'Volvo',
    ano: 2021,
    kmAtual: 312000,
    motorista: 'Carlos Mendes',
    base: 'Interior',
    status: 'Parado',
    dataEntradaManutencao: '2026-08-15',
    dataInicioParada: '2026-08-15', // 40 dias atrás (+20d CRÍTICO)
    dataPrevistaLiberacao: '2026-09-30',
    observacoes: 'Operação Interior - Sinistro estrutural na cabine. Aguardando laudo pericial da seguradora.',
    historico: [
      { id: 'vh-i1', date: '2026-08-15', note: 'Veículo colidiu em pátio regional do Interior. Processo de seguro.', author: 'Carlos Mendes', newStatus: 'Parado' }
    ]
  },
  {
    id: 'v-int-2',
    placa: 'INT2B12',
    modelo: 'VW Constellation 24.280',
    marca: 'Volkswagen',
    ano: 2020,
    kmAtual: 245000,
    motorista: 'Marcos Souza',
    base: 'Interior',
    status: 'Parado',
    dataInicioParada: '2026-09-07', // 17 dias atrás
    observacoes: 'Operação Interior - Troca do diferencial pendente de orçamento.',
    historico: []
  },
  {
    id: 'v-int-3',
    placa: 'INT3C34',
    modelo: 'DAF XF 530',
    marca: 'DAF',
    ano: 2022,
    kmAtual: 195000,
    motorista: 'Antônio Ferreira',
    base: 'Interior',
    status: 'Em manutenção',
    dataEntradaManutencao: '2026-09-20',
    dataInicioParada: '2026-09-20',
    observacoes: 'Operação Interior - Manutenção de alinhamento e suspensão.',
    historico: []
  },
  {
    id: 'v-int-4',
    placa: 'INT4D56',
    modelo: 'Iveco Stralis 440',
    marca: 'Iveco',
    ano: 2019,
    kmAtual: 289000,
    motorista: 'Gerson Santos',
    base: 'Interior',
    status: 'Em operação',
    observacoes: 'Operação Interior - Linha longa de transferência para o interior.',
    historico: []
  },
  {
    id: 'v-int-5',
    placa: 'INT5E78',
    modelo: 'Scania P360',
    marca: 'Scania',
    ano: 2021,
    kmAtual: 178000,
    motorista: 'Fernando Nunes',
    base: 'Interior',
    status: 'Em operação',
    observacoes: 'Operação Interior - Rota regional em andamento.',
    historico: []
  },
  {
    id: 'v-int-6',
    placa: 'INT6F90',
    modelo: 'VW Meteor 29.520',
    marca: 'Volkswagen',
    ano: 2023,
    kmAtual: 102000,
    motorista: 'Valter Guimarães',
    base: 'Interior',
    status: 'Disponível',
    observacoes: 'Operação Interior - Disponível no pátio do Interior.',
    historico: []
  },

  // ---------------- OPERAÇÃO 3: REDESPACHO ----------------
  {
    id: 'v-red-1',
    placa: 'RED1A33',
    modelo: 'Volvo VM 330',
    marca: 'Volvo',
    ano: 2020,
    kmAtual: 210000,
    motorista: 'Paulo Henrique',
    base: 'Redespacho',
    status: 'Em manutenção',
    dataEntradaManutencao: '2026-09-21',
    dataInicioParada: '2026-09-21',
    dataPrevistaLiberacao: '2026-09-25',
    observacoes: 'Operação Redespacho - Troca de turbina e limpeza de bicos.',
    historico: []
  },
  {
    id: 'v-red-2',
    placa: 'RED2B56',
    modelo: 'Scania R450',
    marca: 'Scania',
    ano: 2022,
    kmAtual: 135000,
    motorista: 'Roberto Lima',
    base: 'Redespacho',
    status: 'Em operação',
    observacoes: 'Operação Redespacho - Cross-docking e transferência acelerada.',
    historico: []
  },
  {
    id: 'v-red-3',
    placa: 'RED3C78',
    modelo: 'Mercedes-Benz Atego 1719',
    marca: 'Mercedes-Benz',
    ano: 2023,
    kmAtual: 78000,
    motorista: 'Diego Alves',
    base: 'Redespacho',
    status: 'Em operação',
    observacoes: 'Operação Redespacho - Rota de conexão entre parceiros.',
    historico: []
  },
  {
    id: 'v-red-4',
    placa: 'RED4D90',
    modelo: 'VW Delivery 9.170',
    marca: 'Volkswagen',
    ano: 2022,
    kmAtual: 92000,
    motorista: 'Rafael Costa',
    base: 'Redespacho',
    status: 'Disponível',
    observacoes: 'Operação Redespacho - Pronto no terminal de redespacho.',
    historico: []
  },
  {
    id: 'v-red-5',
    placa: 'RED5E11',
    modelo: 'Iveco Tector 240E28',
    marca: 'Iveco',
    ano: 2021,
    kmAtual: 118000,
    motorista: 'Adriano Paz',
    base: 'Redespacho',
    status: 'Disponível',
    observacoes: 'Operação Redespacho - Veículo limpo e revisado.',
    historico: []
  },
  {
    id: 'v-red-6',
    placa: 'RED6F33',
    modelo: 'DAF LF 290',
    marca: 'DAF',
    ano: 2022,
    kmAtual: 105000,
    motorista: 'Leandro Barbosa',
    base: 'Redespacho',
    status: 'Parado',
    dataInicioParada: '2026-09-19',
    observacoes: 'Operação Redespacho - Parado aguardando roteirização.',
    historico: []
  },

  // Additional 10 test vehicles automatically generated across the 3 operations
  ...Array.from({ length: 12 }).map((_, i) => {
    const operacao = ['Rio', 'Interior', 'Redespacho'][i % 3];
    const prefix = operacao === 'Rio' ? 'RIO' : operacao === 'Interior' ? 'INT' : 'RED';
    const statusChoice = i % 3 === 0 ? 'Em operação' : i % 3 === 1 ? 'Disponível' : 'Em operação';
    return {
      id: `v-test-${i + 1}`,
      placa: `${prefix}${i + 10}X${20 + i}`,
      modelo: ['Scania R450', 'Volvo FH 460', 'Mercedes-Benz Actros 2651', 'DAF XF 480', 'VW Meteor 29.520'][i % 5],
      marca: ['Scania', 'Volvo', 'Mercedes-Benz', 'DAF', 'Volkswagen'][i % 5],
      ano: 2021 + (i % 3),
      kmAtual: 80000 + i * 9500,
      motorista: `Motorista ${operacao} #${i + 1}`,
      base: operacao,
      status: statusChoice as any,
      observacoes: `Veículo de teste alocado na Operação ${operacao}.`,
      historico: []
    };
  })
];

// ---------------- Maintenance Orders (Assigned to Rio, Interior, Redespacho) ----------------
export const INITIAL_MAINTENANCES: MaintenanceOrder[] = [
  {
    id: 'm-1',
    numeroOS: 'OS-2026-001',
    atividadePendente: 'Troca de módulo de transmissão G211',
    motivo: 'Corretiva',
    placa: 'RIO1A23',
    veiculoModelo: 'Mercedes-Benz Atego 2430',
    km: 184200,
    valor: 8500.00,
    prioridade: 'Urgente',
    motorista: 'João Silva',
    base: 'Rio',
    status: 'Atrasada',
    dataAbertura: '2026-09-04',
    dataAtualizacao: '2026-09-20',
    dataPlanejada: '2026-09-18',
    aprovacao1: { aprovado: true, dataHora: '2026-09-05 09:15', aprovadoPor: 'Carlos Silva (Supervisão)' },
    aprovacao2: { aprovado: true, dataHora: '2026-09-06 14:30', aprovadoPor: 'Mariana Lima (Gerência)' },
    conclusao: { aprovado: false },
    observacoes: 'Operação Rio - Retido aguardando importação de componente eletrônico.',
    historico: [{ id: 'mh-1', date: '2026-09-04', note: 'Ordem aberta devido a travamento de marcha.', author: 'João Silva' }]
  },
  {
    id: 'm-2',
    numeroOS: 'OS-2026-002',
    atividadePendente: 'Reparo estrutural de cabine após impacto',
    motivo: 'Corretiva',
    placa: 'INT1A99',
    veiculoModelo: 'Volvo FH 540',
    km: 312000,
    valor: 14200.00,
    prioridade: 'Alta',
    motorista: 'Carlos Mendes',
    base: 'Interior',
    status: 'Atrasada',
    dataAbertura: '2026-08-15',
    dataAtualizacao: '2026-09-10',
    dataPlanejada: '2026-09-05',
    observacoes: 'Operação Interior - Seguradora autorizou reparo com atraso.',
    historico: []
  },
  {
    id: 'm-3',
    numeroOS: 'OS-2026-003',
    atividadePendente: 'Substituição do diferencial traseiro',
    motivo: 'Corretiva',
    placa: 'INT2B12',
    veiculoModelo: 'VW Constellation 24.280',
    km: 245000,
    valor: 6800.00,
    prioridade: 'Alta',
    motorista: 'Marcos Souza',
    base: 'Interior',
    status: 'Atrasada',
    dataAbertura: '2026-09-07',
    dataAtualizacao: '2026-09-18',
    dataPlanejada: '2026-09-15',
    observacoes: 'Operação Interior - Aguardando aprovação de orçamento adicional.',
    historico: []
  },
  {
    id: 'm-4',
    numeroOS: 'OS-2026-004',
    atividadePendente: 'Troca do kit de turbina de admissão',
    motivo: 'Corretiva',
    placa: 'RED1A33',
    veiculoModelo: 'Volvo VM 330',
    km: 210000,
    valor: 5400.00,
    prioridade: 'Alta',
    motorista: 'Paulo Henrique',
    base: 'Redespacho',
    status: 'Em andamento',
    dataAbertura: '2026-09-21',
    dataAtualizacao: '2026-09-23',
    dataPlanejada: '2026-09-25',
    observacoes: 'Operação Redespacho - Em execução na oficina credenciada.',
    historico: []
  },
  {
    id: 'm-5',
    numeroOS: 'OS-2026-005',
    atividadePendente: 'Troca preventiva de kit de embreagem',
    motivo: 'Preventiva',
    placa: 'RIO2B45',
    veiculoModelo: 'VW Delivery 11.180',
    km: 85000,
    valor: 2900.00,
    prioridade: 'Média',
    motorista: 'Sérgio Ramos',
    base: 'Rio',
    status: 'Em andamento',
    dataAbertura: '2026-09-23',
    dataAtualizacao: '2026-09-23',
    dataPlanejada: '2026-09-25',
    observacoes: 'Operação Rio - Troca periódica agendada.',
    historico: []
  },
  {
    id: 'm-6',
    numeroOS: 'OS-2026-006',
    atividadePendente: 'Revisão preventiva de pastilhas e discos',
    motivo: 'Desgaste',
    placa: 'INT3C34',
    veiculoModelo: 'DAF XF 530',
    km: 195000,
    valor: 2100.00,
    prioridade: 'Média',
    motorista: 'Antônio Ferreira',
    base: 'Interior',
    status: 'Em andamento',
    dataAbertura: '2026-09-20',
    dataAtualizacao: '2026-09-23',
    dataPlanejada: '2026-09-24',
    observacoes: 'Operação Interior - Troca em oficina local.',
    historico: []
  },
  ...Array.from({ length: 15 }).map((_, i) => {
    const operacao = ['Rio', 'Interior', 'Redespacho'][i % 3];
    return {
      id: `m-done-${i + 1}`,
      numeroOS: `OS-2026-${String(i + 107).padStart(3, '0')}`,
      atividadePendente: `Manutenção preventiva concluída Operação ${operacao} #${i + 101}`,
      motivo: (['Preventiva', 'Desgaste', 'Corretiva'] as const)[i % 3],
      placa: `${operacao === 'Rio' ? 'RIO' : operacao === 'Interior' ? 'INT' : 'RED'}${i + 1}A10`,
      veiculoModelo: 'Caminhão de Frota',
      km: 95000 + i * 4000,
      valor: 850.00 + i * 210,
      prioridade: 'Média' as const,
      motorista: `Motorista ${operacao}`,
      base: operacao,
      status: 'Concluída' as const,
      dataAbertura: '2026-09-01',
      dataAtualizacao: '2026-09-18',
      dataPlanejada: '2026-09-15',
      dataRealizada: '2026-09-14',
      observacoes: `Serviço realizado com aprovação na Operação ${operacao}.`,
      historico: []
    };
  })
];

export const INITIAL_EMAIL_LOGS: EmailAlertLog[] = [
  {
    id: 'email-init-1',
    placa: 'RIO1A23',
    modelo: 'Mercedes-Benz Atego 2430',
    base: 'Rio',
    motorista: 'João Silva',
    dataInicioParada: '2026-09-04',
    diasParado: 20,
    statusVeiculo: 'Em manutenção',
    assunto: '🚨 Veículo parado há 20 dias – RIO1A23 (Operação Rio)',
    corpo: `O veículo RIO1A23 atingiu 20 dias parado.

Placa: RIO1A23
Modelo: Mercedes-Benz Atego 2430
Operação: Rio
Motorista: João Silva
Data de início da parada: 04/09/2026
Dias parado: 20
Status: Em manutenção

Favor verificar a situação do veículo e previsão de retorno à operação.`,
    destinatario: 'jeffersonmenegueli3@gmail.com',
    dataEnvio: new Date().toISOString(),
    disparadoAutomatico: true
  }
];

export const INITIAL_WHATSAPP_LOGS: WhatsAppAlertLog[] = [
  {
    id: 'wa-init-1',
    placa: 'RIO1A23',
    modelo: 'Mercedes-Benz Atego 2430',
    base: 'Rio',
    motorista: 'João Silva',
    diasParado: 20,
    destinatarioNome: 'Jefferson Menegueli',
    telefone: '+55 (21) 99888-7766',
    mensagem: '🚨 ALERTA OPERACIONAL DE FROTA\n\nAtenção equipe! O veículo RIO1A23 (Mercedes-Benz Atego 2430) na Base Rio está parado há 20 dias.\nStatus: Em manutenção.',
    dataEnvio: new Date().toISOString(),
    status: 'enviado',
    disparadoAutomatico: true
  }
];
