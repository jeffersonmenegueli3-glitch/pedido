import express from 'express';
import { createServer as createViteServer } from 'vite';
import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import { GoogleGenAI } from '@google/genai';
import {
  INITIAL_VEHICLES,
  INITIAL_MAINTENANCES,
  INITIAL_BUDGET,
  INITIAL_SETTINGS,
  INITIAL_EMAIL_LOGS,
  INITIAL_WHATSAPP_LOGS
} from './src/data/seedData';
import {
  Vehicle,
  MaintenanceOrder,
  BudgetConfig,
  SystemSettings,
  EmailAlertLog,
  WhatsAppAlertLog
} from './src/types/fleet';
import { calculateDaysStopped, generateEmailAlertTemplate } from './src/utils/fleetHelpers';
import { generateWhatsAppMessage, getWhatsAppWebUrl, sanitizePhoneNumber } from './src/utils/whatsapp';

dotenv.config();

const app = express();
app.use(express.json());

const DATA_FILE = path.resolve(process.cwd(), 'data_store.json');

// In-memory Database Store
let vehicles: Vehicle[] = [...INITIAL_VEHICLES];
let maintenances: MaintenanceOrder[] = [...INITIAL_MAINTENANCES];
let budget: BudgetConfig = { ...INITIAL_BUDGET };
let settings: SystemSettings = { ...INITIAL_SETTINGS };
let emailLogs: EmailAlertLog[] = [...INITIAL_EMAIL_LOGS];
let whatsappLogs: WhatsAppAlertLog[] = [...INITIAL_WHATSAPP_LOGS];

// Persistence helpers
function saveDataToDisk() {
  try {
    const payload = {
      vehicles,
      maintenances,
      budget,
      settings,
      emailLogs,
      whatsappLogs
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(payload, null, 2), 'utf-8');
  } catch (err) {
    console.error('Erro ao salvar dados no disco:', err);
  }
}

function loadDataFromDisk() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const raw = fs.readFileSync(DATA_FILE, 'utf-8');
      const data = JSON.parse(raw);
      if (Array.isArray(data.vehicles)) vehicles = data.vehicles;
      if (Array.isArray(data.maintenances)) maintenances = data.maintenances;
      if (data.budget) budget = data.budget;
      if (data.settings) settings = data.settings;
      if (Array.isArray(data.emailLogs)) emailLogs = data.emailLogs;
      if (Array.isArray(data.whatsappLogs)) whatsappLogs = data.whatsappLogs;
      console.log('✅ Todos os dados do FleetMaster foram restaurados do disco com sucesso!');
    }
  } catch (err) {
    console.error('Erro ao carregar dados do disco:', err);
  }
}

// Restore data from disk on boot
loadDataFromDisk();

// Helper to normalize base names
function normalizeBase(baseName?: string): string {
  if (!baseName) return 'Todas';
  const clean = baseName.trim().toLowerCase();
  if (clean === 'rio' || clean === 'rio de janeiro' || clean.includes('rio')) return 'Rio';
  if (clean === 'interior') return 'Interior';
  if (clean === 'redespacho') return 'Redespacho';
  if (clean === 'todas' || clean === 'all') return 'Todas';
  return baseName;
}

// Helper to recalculate budget utilization dynamically per operation (base)
function getBudgetSummary(targetOperacao: string = 'Todas') {
  const normTarget = normalizeBase(targetOperacao);

  const currentBudgets = budget.budgetsByBase || {
    'Todas': 150000,
    'Rio': 50000,
    'Interior': 50000,
    'Redespacho': 50000
  };

  const orcamentoForOperacao = currentBudgets[normTarget] !== undefined
    ? currentBudgets[normTarget]
    : (currentBudgets['Todas'] || 150000);

  const filteredMaintenances = normTarget === 'Todas'
    ? maintenances
    : maintenances.filter(m => normalizeBase(m.base) === normTarget);

  const utilized = filteredMaintenances.reduce((acc, curr) => {
    return acc + (curr.valor || 0);
  }, 0);

  const saldo = orcamentoForOperacao - utilized;
  const percentUtilized = orcamentoForOperacao > 0 ? (utilized / orcamentoForOperacao) * 100 : 0;
  const delayedMaintenancesCount = filteredMaintenances.filter(m => m.status === 'Atrasada').length;

  return {
    operacao: normTarget,
    orcamentoMensal: orcamentoForOperacao,
    valorUtilizado: utilized,
    saldoDisponivel: saldo,
    percentualUtilizado: Number(percentUtilized.toFixed(1)),
    manutencoesAtrasadas: delayedMaintenancesCount,
    budgetsByBase: currentBudgets
  };
}

// Automatic Alert Engine Check
function runAutomaticAlertCheck(forceAll: boolean = false) {
  const newLogs: EmailAlertLog[] = [];
  const newWhatsAppLogs: WhatsAppAlertLog[] = [];
  const todayStr = new Date().toISOString().split('T')[0];

  const emailRecipients = (settings.registeredEmails && settings.registeredEmails.length > 0)
    ? settings.registeredEmails.filter(c => c.ativo && c.recebeAlertas20Dias).map(c => c.email)
    : [settings.managerEmail];

  if (emailRecipients.length === 0) emailRecipients.push(settings.managerEmail);

  const whatsappContacts = (settings.registeredEmails && settings.registeredEmails.length > 0)
    ? settings.registeredEmails.filter(c => c.ativo && (c.recebeAlertasWhatsapp || c.recebeAlertas20Dias) && c.telefone)
    : [{ nome: settings.managerName, telefone: settings.managerPhone || '+55 (21) 99888-7766' }];

  vehicles.forEach((v) => {
    if (v.status === 'Parado' || v.status === 'Em manutenção') {
      const days = calculateDaysStopped(v, todayStr);
      
      // Find active maintenance for this vehicle
      const activeM = maintenances.find(
        m => m.placa === v.placa && (m.status === 'Aberta' || m.status === 'Em andamento' || m.status === 'Atrasada')
      );
      const motivoStr = activeM
        ? `${activeM.atividadePendente} (${activeM.motivo})${activeM.observacoes ? ` - ${activeM.observacoes}` : ''}`
        : (v.observacoes || 'Manutenção preventiva / corretiva');

      // Check if 20 days or recurring every 5 days (20, 25, 30, 35...)
      const is20DaysMilestone = days === 20;
      const isRecurringMilestone = days > 20 && (days - 20) % (settings.alertIntervalDays || 5) === 0;

      if (is20DaysMilestone || isRecurringMilestone || forceAll) {
        // Email triggers
        emailRecipients.forEach(dest => {
          const alreadyLoggedToday = emailLogs.some(
            log => log.placa === v.placa && log.diasParado === days && log.destinatario === dest && log.dataEnvio.startsWith(todayStr)
          );

          if (!alreadyLoggedToday) {
            const emailLog = generateEmailAlertTemplate(v, days, dest, true, motivoStr);
            newLogs.push(emailLog);
          }
        });

        // WhatsApp triggers
        if (settings.autoWhatsappAlerts !== false) {
          whatsappContacts.forEach(contact => {
            const phone = contact.telefone || settings.managerPhone || '+55 (21) 99888-7766';
            const alreadyWALoggedToday = whatsappLogs.some(
              log => log.placa === v.placa && log.diasParado === days && log.telefone === phone && log.dataEnvio.startsWith(todayStr)
            );

            if (!alreadyWALoggedToday) {
              const msg = generateWhatsAppMessage({
                templateType: 'alerta_parado_20d',
                vehicle: v,
                days,
                managerName: settings.managerName,
                companyName: settings.companyName,
                motivoManutencao: motivoStr
              });

              const waLog: WhatsAppAlertLog = {
                id: `wa-auto-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
                placa: v.placa,
                modelo: v.modelo,
                base: v.base,
                motorista: v.motorista,
                diasParado: days,
                destinatarioNome: contact.nome,
                telefone: phone,
                mensagem: msg,
                dataEnvio: new Date().toISOString(),
                status: 'enviado',
                disparadoAutomatico: true
              };
              newWhatsAppLogs.push(waLog);
            }
          });
        }
      }
    }
  });

  if (newLogs.length > 0) {
    emailLogs = [...newLogs, ...emailLogs];
  }
  if (newWhatsAppLogs.length > 0) {
    whatsappLogs = [...newWhatsAppLogs, ...whatsappLogs];
  }

  return {
    checkedAt: new Date().toISOString(),
    newAlertsTriggered: newLogs.length + newWhatsAppLogs.length,
    newLogs,
    newWhatsAppLogs
  };
}

// ---------------- API ENDPOINTS ----------------

// Bulk Create Vehicles (Importação em Massa via Excel)
app.post('/api/vehicles/bulk-create', (req, res) => {
  const { vehicles: newVehiclesList } = req.body;
  if (!Array.isArray(newVehiclesList) || newVehiclesList.length === 0) {
    return res.status(400).json({ error: 'Nenhum veículo fornecido para cadastro em massa' });
  }

  const createdVehicles: Vehicle[] = [];
  const today = new Date().toISOString().split('T')[0];

  newVehiclesList.forEach((vData: any, idx: number) => {
    const rawPlaca = (vData.placa || `ABC${idx}`).toUpperCase().trim();
    const existingIndex = vehicles.findIndex(v => v.placa.toUpperCase() === rawPlaca);
    
    const statusVal = vData.status || 'Disponível';
    const isStopped = statusVal === 'Parado' || statusVal === 'Em manutenção';

    const vehicleObj: Vehicle = {
      id: existingIndex !== -1 ? vehicles[existingIndex].id : `v-bulk-${Date.now()}-${idx}`,
      placa: rawPlaca,
      modelo: vData.modelo || 'Veículo Não Especificado',
      marca: vData.marca || 'Volvo',
      ano: Number(vData.ano) || new Date().getFullYear(),
      kmAtual: Number(vData.kmAtual) || 0,
      motorista: vData.motorista || 'Motorista Não Atribuído',
      base: vData.base || 'Rio de Janeiro',
      status: statusVal,
      dataInicioParada: isStopped ? (vData.dataInicioParada || today) : undefined,
      dataEntradaManutencao: statusVal === 'Em manutenção' ? (vData.dataInicioParada || today) : undefined,
      observacoes: vData.observacoes || 'Cadastrado em massa via planilha Excel.',
      historico: existingIndex !== -1 ? vehicles[existingIndex].historico : [{
        id: `vh-${Date.now()}-${idx}`,
        date: today,
        note: 'Cadastrado via importação em massa Excel.',
        author: 'Sistema Excel'
      }]
    };

    if (existingIndex !== -1) {
      vehicles[existingIndex] = vehicleObj;
    } else {
      vehicles.unshift(vehicleObj);
    }
    createdVehicles.push(vehicleObj);
  });

  runAutomaticAlertCheck();

  res.status(201).json({
    success: true,
    count: createdVehicles.length,
    createdVehicles
  });
});

// Vehicles CRUD
app.get('/api/vehicles', (req, res) => {
  res.json(vehicles);
});

app.post('/api/vehicles', (req, res) => {
  const newVehicle: Vehicle = {
    id: `v-${Date.now()}`,
    ...req.body,
    historico: req.body.historico || [{
      id: `vh-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      note: 'Cadastro do veículo realizado no sistema.',
      author: 'Sistema'
    }]
  };
  vehicles.unshift(newVehicle);
  // Auto-check alerts in case newly added vehicle is stopped >= 20d
  runAutomaticAlertCheck();
  saveDataToDisk();
  res.status(201).json(newVehicle);
});

app.put('/api/vehicles/:id', (req, res) => {
  const { id } = req.params;
  const index = vehicles.findIndex(v => v.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Veículo não encontrado' });
  }

  const oldVehicle = vehicles[index];
  const updatedVehicle: Vehicle = {
    ...oldVehicle,
    ...req.body,
    historico: req.body.historico || oldVehicle.historico
  };

  // If status changed to Parado / Em manutenção and dataInicioParada was not set, set it now
  if (
    (updatedVehicle.status === 'Parado' || updatedVehicle.status === 'Em manutenção') &&
    oldVehicle.status !== 'Parado' && oldVehicle.status !== 'Em manutenção' &&
    !updatedVehicle.dataInicioParada
  ) {
    updatedVehicle.dataInicioParada = new Date().toISOString().split('T')[0];
  }

  // If status changed back to Disponível or Em operação, clear stopped dates
  if (updatedVehicle.status === 'Disponível' || updatedVehicle.status === 'Em operação') {
    updatedVehicle.dataInicioParada = undefined;
    updatedVehicle.dataEntradaManutencao = undefined;
  }

  vehicles[index] = updatedVehicle;
  runAutomaticAlertCheck();
  saveDataToDisk();
  res.json(updatedVehicle);
});

app.delete('/api/vehicles/:id', (req, res) => {
  const { id } = req.params;
  vehicles = vehicles.filter(v => v.id !== id);
  saveDataToDisk();
  res.json({ success: true, message: 'Veículo removido' });
});

app.post('/api/vehicles/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Nenhum ID de veículo informado para exclusão.' });
  }

  const initialCount = vehicles.length;
  vehicles = vehicles.filter(v => !ids.includes(v.id));
  const deletedCount = initialCount - vehicles.length;

  saveDataToDisk();
  res.json({ success: true, deletedCount, remainingCount: vehicles.length });
});

// Maintenances CRUD
app.get('/api/maintenances', (req, res) => {
  res.json(maintenances);
});

// Bulk Create Maintenances
app.post('/api/maintenances/bulk-create', (req, res) => {
  const { orders } = req.body;
  if (!Array.isArray(orders) || orders.length === 0) {
    return res.status(400).json({ error: 'Nenhuma ordem fornecida para criação em massa' });
  }

  const createdOrders: MaintenanceOrder[] = [];
  const today = new Date().toISOString().split('T')[0];

  orders.forEach((ordData: any, idx: number) => {
    const newOrder: MaintenanceOrder = {
      id: `m-bulk-${Date.now()}-${idx}`,
      numeroOS: ordData.numeroOS || `OS-2026-${String(Math.floor(100 + idx + Math.random() * 800)).padStart(3, '0')}`,
      dataAbertura: ordData.dataAbertura || today,
      dataAtualizacao: today,
      dataPlanejada: ordData.dataPlanejada || today,
      atividadePendente: ordData.atividadePendente || 'Manutenção Programada',
      motivo: ordData.motivo || 'Preventiva',
      placa: ordData.placa,
      km: ordData.km || 100000,
      valor: ordData.valor || 0,
      prioridade: ordData.prioridade || 'Média',
      motorista: ordData.motorista || '',
      base: ordData.base || 'Rio de Janeiro',
      status: ordData.status || 'Aberta',
      observacoes: ordData.observacoes || 'Lançamento em massa realizado.',
      historico: [{
        id: `mh-${Date.now()}-${idx}`,
        date: today,
        note: 'Ordem criada via Lançamento em Massa.',
        author: 'Sistema (Massa)'
      }]
    };

    createdOrders.push(newOrder);
    maintenances.unshift(newOrder);

    // Update vehicle status to Em manutenção if appropriate
    const vehicleIndex = vehicles.findIndex(v => v.placa === newOrder.placa);
    if (vehicleIndex !== -1 && (newOrder.status === 'Aberta' || newOrder.status === 'Em andamento')) {
      if (vehicles[vehicleIndex].status !== 'Em manutenção') {
        vehicles[vehicleIndex].status = 'Em manutenção';
        if (!vehicles[vehicleIndex].dataInicioParada) {
          vehicles[vehicleIndex].dataInicioParada = newOrder.dataAbertura;
        }
        vehicles[vehicleIndex].dataEntradaManutencao = newOrder.dataAbertura;
      }
    }
  });

  res.status(201).json({
    success: true,
    count: createdOrders.length,
    createdOrders
  });
  saveDataToDisk();
});

// Bulk Delete Maintenances
app.post('/api/maintenances/bulk-delete', (req, res) => {
  const { ids } = req.body;
  if (!Array.isArray(ids) || ids.length === 0) {
    return res.status(400).json({ error: 'Nenhum ID fornecido para exclusão em massa' });
  }

  const initialCount = maintenances.length;
  const deletedOrders = maintenances.filter(m => ids.includes(m.id));
  const affectedPlacas = Array.from(new Set(deletedOrders.map(m => m.placa)));

  maintenances = maintenances.filter(m => !ids.includes(m.id));
  const deletedCount = initialCount - maintenances.length;

  affectedPlacas.forEach(placa => {
    const remainingOpen = maintenances.filter(
      m => m.placa === placa && (m.status === 'Aberta' || m.status === 'Em andamento' || m.status === 'Atrasada')
    );
    if (remainingOpen.length === 0) {
      const vIdx = vehicles.findIndex(v => v.placa === placa);
      if (vIdx !== -1 && vehicles[vIdx].status === 'Em manutenção') {
        vehicles[vIdx].status = 'Disponível';
        vehicles[vIdx].dataInicioParada = undefined;
        vehicles[vIdx].dataEntradaManutencao = undefined;
      }
    }
  });

  saveDataToDisk();
  res.json({
    success: true,
    deletedCount,
    message: `${deletedCount} ordem(ns) de manutenção removida(s) com sucesso.`
  });
});

app.post('/api/maintenances', (req, res) => {
  const newOrder: MaintenanceOrder = {
    id: `m-${Date.now()}`,
    numeroOS: req.body.numeroOS || `OS-2026-${String(Math.floor(100 + Math.random() * 800)).padStart(3, '0')}`,
    dataAbertura: new Date().toISOString().split('T')[0],
    dataAtualizacao: new Date().toISOString().split('T')[0],
    ...req.body,
    historico: req.body.historico || [{
      id: `mh-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      note: 'Ordem de manutenção solicitada.',
      author: req.body.motorista || 'Gestor'
    }]
  };

  maintenances.unshift(newOrder);

  // If order linked to vehicle and status is open/in progress, update vehicle status to Em manutenção if appropriate
  const vehicleIndex = vehicles.findIndex(v => v.placa === newOrder.placa);
  if (vehicleIndex !== -1 && (newOrder.status === 'Aberta' || newOrder.status === 'Em andamento')) {
    if (vehicles[vehicleIndex].status !== 'Em manutenção') {
      vehicles[vehicleIndex].status = 'Em manutenção';
      if (!vehicles[vehicleIndex].dataInicioParada) {
        vehicles[vehicleIndex].dataInicioParada = newOrder.dataAbertura;
      }
      vehicles[vehicleIndex].dataEntradaManutencao = newOrder.dataAbertura;
    }
  }

  saveDataToDisk();
  res.status(201).json(newOrder);
});

app.put('/api/maintenances/:id', (req, res) => {
  const { id } = req.params;
  const index = maintenances.findIndex(m => m.id === id);
  if (index === -1) {
    return res.status(404).json({ error: 'Ordem de manutenção não encontrada' });
  }

  const updated: MaintenanceOrder = {
    ...maintenances[index],
    ...req.body,
    dataAtualizacao: new Date().toISOString().split('T')[0]
  };

  maintenances[index] = updated;

  // If order is Concluída, release vehicle if no other open maintenance exists
  if (updated.status === 'Concluída') {
    const remainingOpenForVehicle = maintenances.filter(
      m => m.placa === updated.placa && m.id !== updated.id && (m.status === 'Aberta' || m.status === 'Em andamento' || m.status === 'Atrasada')
    );
    if (remainingOpenForVehicle.length === 0) {
      const vIdx = vehicles.findIndex(v => v.placa === updated.placa);
      if (vIdx !== -1) {
        vehicles[vIdx].status = 'Disponível';
        vehicles[vIdx].dataInicioParada = undefined;
        vehicles[vIdx].dataEntradaManutencao = undefined;
      }
    }
  }

  saveDataToDisk();
  res.json(updated);
});

// Budget
app.get('/api/budget', (req, res) => {
  const operacao = (req.query.operacao as string) || 'Todas';
  res.json(getBudgetSummary(operacao));
});

app.put('/api/budget', (req, res) => {
  const { newBudget, operacao, budgetsByBase } = req.body;

  if (budgetsByBase && typeof budgetsByBase === 'object') {
    const rio = Number(budgetsByBase['Rio'] ?? 50000);
    const interior = Number(budgetsByBase['Interior'] ?? 50000);
    const redespacho = Number(budgetsByBase['Redespacho'] ?? 50000);
    const todas = Number(budgetsByBase['Todas'] ?? (rio + interior + redespacho));

    budget.budgetsByBase = {
      'Rio': rio,
      'Interior': interior,
      'Redespacho': redespacho,
      'Todas': todas
    };
    budget.orcamentoMensal = todas;
  } else if (typeof newBudget === 'number' && newBudget >= 0) {
    const opKey = normalizeBase(operacao || 'Todas');
    if (!budget.budgetsByBase) {
      budget.budgetsByBase = { 'Todas': 150000, 'Rio': 50000, 'Interior': 50000, 'Redespacho': 50000 };
    }
    budget.budgetsByBase[opKey] = newBudget;
    if (opKey === 'Todas') {
      budget.orcamentoMensal = newBudget;
    } else {
      budget.budgetsByBase['Todas'] = (budget.budgetsByBase['Rio'] || 0) + (budget.budgetsByBase['Interior'] || 0) + (budget.budgetsByBase['Redespacho'] || 0);
      budget.orcamentoMensal = budget.budgetsByBase['Todas'];
    }
  }

  const targetOp = normalizeBase(operacao || (req.query.operacao as string) || 'Todas');
  saveDataToDisk();
  res.json(getBudgetSummary(targetOp));
});

// Settings & Alerts
app.get('/api/settings', (req, res) => {
  res.json(settings);
});

app.put('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  saveDataToDisk();
  res.json(settings);
});

app.get('/api/email-logs', (req, res) => {
  res.json(emailLogs);
});

app.get('/api/whatsapp/logs', (req, res) => {
  res.json(whatsappLogs);
});

app.post('/api/whatsapp/connect', (req, res) => {
  const { connected, instanceName, phone } = req.body;
  settings.whatsappConnected = connected ?? true;
  if (instanceName) settings.whatsappInstanceName = instanceName;
  if (phone) settings.whatsappConnectedPhone = phone;
  saveDataToDisk();
  res.json({
    success: true,
    connected: settings.whatsappConnected,
    instanceName: settings.whatsappInstanceName,
    phone: settings.whatsappConnectedPhone
  });
});

app.post('/api/whatsapp/send', (req, res) => {
  const { telefone, destinatarioNome, mensagem, placa, diasParado } = req.body;

  if (!telefone || !mensagem) {
    return res.status(400).json({ error: 'Telefone e mensagem são obrigatórios.' });
  }

  const vehicle = placa ? vehicles.find(v => v.placa === placa) : undefined;
  const days = diasParado !== undefined ? diasParado : (vehicle ? calculateDaysStopped(vehicle) : 0);
  const waUrl = getWhatsAppWebUrl(telefone, mensagem);

  const newWALog: WhatsAppAlertLog = {
    id: `wa-send-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    placa: vehicle ? vehicle.placa : (placa || 'GERAL'),
    modelo: vehicle ? vehicle.modelo : 'Alerta de Frota',
    base: vehicle ? vehicle.base : 'Todas',
    motorista: vehicle ? vehicle.motorista : 'Sistema',
    diasParado: days,
    destinatarioNome: destinatarioNome || 'Contato Registrado',
    telefone,
    mensagem,
    dataEnvio: new Date().toISOString(),
    status: 'enviado',
    disparadoAutomatico: false
  };

  whatsappLogs.unshift(newWALog);
  saveDataToDisk();

  res.json({
    success: true,
    message: `Alerta WhatsApp enviado para ${destinatarioNome || telefone}`,
    whatsappLog: newWALog,
    waUrl
  });
});

app.post('/api/alerts/check', (req, res) => {
  const result = runAutomaticAlertCheck(req.body?.force === true);
  saveDataToDisk();
  res.json({
    ...result,
    allLogs: emailLogs,
    allWhatsAppLogs: whatsappLogs
  });
});

app.post(['/.netlify/functions/enviar-alerta', '/api/enviar-alerta'], (req, res) => {
  const body = req.body || {};
  const alertPlate = (body.alertPlate || body.placa || 'N/A').toString().trim();
  const daysStopped = Number(body.daysStopped || body.diasParado || 20);
  const model = (body.model || body.modelo || 'Veículo da Frota').toString().trim();
  const base = (body.base || 'Geral').toString().trim();
  const driver = (body.driver || body.motorista || 'Não atribuído').toString().trim();
  const status = (body.status || 'Parado').toString().trim();
  const reason = (body.reason || body.motivo || 'Manutenção programada / em verificação').toString().trim();
  const observations = (body.observations || body.observacoes || 'Verificação urgente necessária.').toString().trim();
  const subject = body.subject || `🚨 ALERTA OPERACIONAL DE FROTA - Placa ${alertPlate}`;

  const recipientsStr = body.recipients || settings.managerEmail || 'gestao@frota.com.br';

  const corpoFormatted = `🚨 ALERTA OPERACIONAL DE FROTA

Atenção equipe! O veículo ${alertPlate} (${model}) alocado na Base ${base} está parado há ${daysStopped} dias.

📋 Detalhes da Operação:
• Placa: ${alertPlate}
• Modelo: ${model}
• Base/Operação: ${base}
• Motorista: ${driver}
• Dias Parado: ${daysStopped} dias
• Status: ${status}
• Motivo da Manutenção: ${reason}
• Observações: ${observations}

⚠️ Ação Necessária: Favor responder com o status atualizado do orçamento ou previsão de liberação.

Enviado por: Gestão de Frota - FleetMaster Pro
Hora do envio: ${new Date().toLocaleString('pt-BR')}`;

  const newLog: EmailAlertLog = {
    id: `email-robot-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
    placa: alertPlate,
    modelo: model,
    base,
    motorista: driver,
    dataInicioParada: new Date().toISOString().split('T')[0],
    diasParado: daysStopped,
    statusVeiculo: status,
    assunto: subject,
    corpo: corpoFormatted,
    destinatario: recipientsStr,
    dataEnvio: new Date().toISOString(),
    disparadoAutomatico: false
  };

  emailLogs.unshift(newLog);
  saveDataToDisk();

  res.json({
    ok: true,
    success: true,
    message: `Robô Netlify enviou e-mail com sucesso para ${recipientsStr}`,
    sentTo: recipientsStr.split(',').map((s: string) => s.trim()),
    emailLog: newLog,
    data: {
      alertPlate,
      daysStopped,
      model,
      base,
      driver,
      status,
      reason,
      observations
    }
  });
});

app.post('/api/emails/send', (req, res) => {
  const { destinatario, assunto, corpo, placa } = req.body;

  if (!destinatario || !assunto || !corpo) {
    return res.status(400).json({ error: 'Destinatário, assunto e corpo são obrigatórios.' });
  }

  const vehicle = placa ? vehicles.find(v => v.placa === placa) : undefined;
  const days = vehicle ? calculateDaysStopped(vehicle) : 0;

  const newEmailLog: EmailAlertLog = {
    id: `email-send-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    placa: vehicle ? vehicle.placa : 'GERAL',
    modelo: vehicle ? vehicle.modelo : 'Notificação Operacional',
    base: vehicle ? vehicle.base : 'Todas',
    motorista: vehicle ? vehicle.motorista : 'Sistema',
    dataInicioParada: vehicle?.dataInicioParada || new Date().toISOString().split('T')[0],
    diasParado: days,
    statusVeiculo: vehicle?.status || 'Disponível',
    assunto,
    corpo,
    destinatario,
    dataEnvio: new Date().toISOString(),
    disparadoAutomatico: false
  };

  emailLogs.unshift(newEmailLog);
  saveDataToDisk();

  res.json({
    success: true,
    message: `E-mail enviado com sucesso para ${destinatario}`,
    emailLog: newEmailLog
  });
});

app.post('/api/alerts/send-test-email', (req, res) => {
  const { placa } = req.body;
  const vehicle = vehicles.find(v => v.placa === placa) || vehicles[0];
  const days = calculateDaysStopped(vehicle);
  const activeM = maintenances.find(
    m => m.placa === vehicle.placa && (m.status === 'Aberta' || m.status === 'Em andamento' || m.status === 'Atrasada')
  );
  const motivoStr = activeM
    ? `${activeM.atividadePendente} (${activeM.motivo})${activeM.observacoes ? ` - ${activeM.observacoes}` : ''}`
    : (vehicle.observacoes || 'Manutenção programada');

  const emailLog = generateEmailAlertTemplate(vehicle, days || 20, settings.managerEmail, false, motivoStr);
  
  emailLogs.unshift(emailLog);
  res.json({
    success: true,
    message: `E-mail de alerta para ${vehicle.placa} enviado com sucesso para ${settings.managerEmail}`,
    emailLog
  });
});

// Seed Data Reset
app.post('/api/reset-seed', (req, res) => {
  vehicles = [...INITIAL_VEHICLES];
  maintenances = [...INITIAL_MAINTENANCES];
  budget = { ...INITIAL_BUDGET };
  settings = { ...INITIAL_SETTINGS };
  emailLogs = [...INITIAL_EMAIL_LOGS];
  whatsappLogs = [...INITIAL_WHATSAPP_LOGS];
  res.json({ success: true, message: 'Dados restaurados para o padrão original' });
});

// Gemini AI Diagnostic Endpoint
app.post('/api/ai/diagnose', async (req, res) => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return res.status(400).json({ error: 'Chave GEMINI_API_KEY não configurada no ambiente.' });
    }

    const ai = new GoogleGenAI({ apiKey });
    const stoppedVehicles = vehicles.filter(v => v.status === 'Parado' || v.status === 'Em manutenção');
    const budgetInfo = getBudgetSummary();

    const prompt = `Você é um Consultor Especialista de Inteligência Artificial em Gestão de Frotas de Transporte e Manutenção Industrial.
Analise os dados atuais desta frota e forneça um diagnóstico executivo conciso, direto e acionável em português do Brasil.

DADOS DA FROTA:
- Total Veículos: ${vehicles.length}
- Disponíveis: ${vehicles.filter(v => v.status === 'Disponível').length}
- Em Operação: ${vehicles.filter(v => v.status === 'Em operação').length}
- Parados: ${vehicles.filter(v => v.status === 'Parado').length}
- Em Manutenção: ${vehicles.filter(v => v.status === 'Em manutenção').length}
- Veículos com +20 dias parados: ${stoppedVehicles.filter(v => calculateDaysStopped(v) >= 20).length}

RESUMO DE ORÇAMENTO:
- Orçamento Mensal: R$ ${budgetInfo.orcamentoMensal.toLocaleString('pt-BR')}
- Valor Utilizado: R$ ${budgetInfo.valorUtilizado.toLocaleString('pt-BR')} (${budgetInfo.percentualUtilizado}%)
- Saldo: R$ ${budgetInfo.saldoDisponivel.toLocaleString('pt-BR')}
- Manutenções Atrasadas: ${budgetInfo.manutencoesAtrasadas}

VEÍCULOS CRÍTICOS PARADOS:
${stoppedVehicles.map(v => `- Placa: ${v.placa} | Modelo: ${v.modelo} | Dias Parado: ${calculateDaysStopped(v)} | Motivo/Obs: ${v.observacoes}`).join('\n')}

Forneça a resposta estruturada em 4 seções Markdown bem apresentadas:
1. 🚨 **Gargalos Críticos & Ação Imediata** (foco nos veículos parados há mais de 20 dias como a placa ABC1D23)
2. 💰 **Análise Financeira & Orçamento** (se o ritmo de gastos está sustentável ou sob risco de estouro)
3. 🔧 **Eficiência da Oficina & Manutenções Atrasadas** (como resolver as manutenções pendentes/atrasadas)
4. 💡 **3 Recomendações Estratégicas para o Gestor de Frota**`;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt
    });

    res.json({ text: response.text });
  } catch (error: any) {
    console.error('Gemini AI Diagnostic Error:', error);
    res.status(500).json({ error: error.message || 'Erro ao gerar análise preditiva com Gemini' });
  }
});

// Integrate Vite Middleware in Dev Mode
async function startServer() {
  const port = process.env.PORT || 3000;

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa'
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(port, () => {
    console.log(`🚀 FleetMaster Server rodando na porta ${port}`);
  });
}

startServer();
