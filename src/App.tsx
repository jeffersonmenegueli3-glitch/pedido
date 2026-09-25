import React, { useState, useEffect } from 'react';
import { Vehicle, MaintenanceOrder, SystemSettings, EmailAlertLog, VehicleStatus, MaintenanceStatus, BudgetSummary, EmailContact } from './types/fleet';
import { calculateDaysStopped, generateEmailAlertTemplate } from './utils/fleetHelpers';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { KPICards } from './components/KPICards';
import { DashboardView } from './components/DashboardView';
import { PowerBIDashboardView } from './components/PowerBIDashboardView';
import { FleetView } from './components/FleetView';
import { MaintenanceView } from './components/MaintenanceView';
import { BudgetView } from './components/BudgetView';
import { StoppedVehiclesView } from './components/StoppedVehiclesView';
import { ReportsView } from './components/ReportsView';
import { AlertsView } from './components/AlertsView';
import { SettingsView } from './components/SettingsView';
import { VehicleModal } from './components/VehicleModal';
import { MaintenanceModal } from './components/MaintenanceModal';
import { BulkMaintenanceModal } from './components/BulkMaintenanceModal';
import { BudgetModal } from './components/BudgetModal';
import { EmailPreviewModal } from './components/EmailPreviewModal';
import { RegisterEmailModal } from './components/RegisterEmailModal';
import { SendEmailModal } from './components/SendEmailModal';
import { WhatsAppConnectModal } from './components/WhatsAppConnectModal';
import { SendWhatsAppModal } from './components/SendWhatsAppModal';
import { ExcelImportModal } from './components/ExcelImportModal';
import { ConnectEmailModal } from './components/ConnectEmailModal';

import {
  initAuth,
  signInWithGoogle,
  logoutGoogle,
  getCachedAccessToken,
  syncVehicleToFirestore,
  syncEmailLogToFirestore,
  syncWhatsAppLogToFirestore
} from './utils/firebase';
import { sendEmailViaGmailAPI } from './utils/gmail';
import { WhatsAppAlertLog } from './types/fleet';
import { User as FirebaseUser } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('');
  const [selectedOperacao, setSelectedOperacao] = useState<string>('Todas');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  // Google OAuth / Gmail State
  const [googleUser, setGoogleUser] = useState<FirebaseUser | null>(null);
  const [googleAccessToken, setGoogleAccessToken] = useState<string | null>(null);
  const [isConnectingGoogle, setIsConnectingGoogle] = useState<boolean>(false);

  // Core Application Data States
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [maintenances, setMaintenances] = useState<MaintenanceOrder[]>([]);
  const [budgetSummary, setBudgetSummary] = useState<BudgetSummary>({
    operacao: 'Todas',
    orcamentoMensal: 150000,
    valorUtilizado: 32450,
    saldoDisponivel: 117550,
    percentualUtilizado: 21.6,
    manutencoesAtrasadas: 7,
    budgetsByBase: {
      'Todas': 150000,
      'Rio': 50000,
      'Interior': 50000,
      'Redespacho': 50000
    }
  });
  const [settings, setSettings] = useState<SystemSettings>({
    managerEmail: 'jeffersonmenegueli3@gmail.com',
    managerName: 'Jefferson Menegueli',
    companyName: 'Logística & Transportes Brasil',
    autoEmailAlerts: true,
    alertIntervalDays: 5
  });
  const [emailLogs, setEmailLogs] = useState<EmailAlertLog[]>([]);
  const [whatsappLogs, setWhatsappLogs] = useState<WhatsAppAlertLog[]>([]);

  // Modals state
  const [isVehicleModalOpen, setIsVehicleModalOpen] = useState<boolean>(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);

  const [isExcelImportModalOpen, setIsExcelImportModalOpen] = useState<boolean>(false);
  const [excelImportType, setExcelImportType] = useState<'vehicles' | 'maintenances'>('vehicles');

  const [isMaintenanceModalOpen, setIsMaintenanceModalOpen] = useState<boolean>(false);
  const [isBulkMaintenanceModalOpen, setIsBulkMaintenanceModalOpen] = useState<boolean>(false);
  const [editingMaintenance, setEditingMaintenance] = useState<MaintenanceOrder | null>(null);

  const [isBudgetModalOpen, setIsBudgetModalOpen] = useState<boolean>(false);

  const [emailPreviewVehicle, setEmailPreviewVehicle] = useState<{ vehicle: Vehicle; days: number } | null>(null);

  // Email Contact & Sending Modals State
  const [isRegisterEmailModalOpen, setIsRegisterEmailModalOpen] = useState<boolean>(false);
  const [editingEmailContact, setEditingEmailContact] = useState<EmailContact | null>(null);

  const [isSendEmailModalOpen, setIsSendEmailModalOpen] = useState<boolean>(false);
  const [sendEmailPreselectedRecipient, setSendEmailPreselectedRecipient] = useState<string | undefined>(undefined);

  const [isConnectEmailModalOpen, setIsConnectEmailModalOpen] = useState<boolean>(false);

  // WhatsApp Modals State
  const [isWhatsAppConnectModalOpen, setIsWhatsAppConnectModalOpen] = useState<boolean>(false);
  const [isSendWhatsAppModalOpen, setIsSendWhatsAppModalOpen] = useState<boolean>(false);
  const [sendWhatsAppPreselectedPhone, setSendWhatsAppPreselectedPhone] = useState<string | undefined>(undefined);

  // Theme State (Dark vs Light)
  const [theme, setTheme] = useState<'dark' | 'light'>(() => {
    const saved = localStorage.getItem('fleetmaster_theme');
    return (saved === 'light' || saved === 'dark') ? saved : 'dark';
  });

  useEffect(() => {
    if (theme === 'light') {
      document.documentElement.classList.add('light');
      document.documentElement.classList.remove('dark');
    } else {
      document.documentElement.classList.add('dark');
      document.documentElement.classList.remove('light');
    }
    localStorage.setItem('fleetmaster_theme', theme);
  }, [theme]);

  // Toast Notification Message
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  // Initialize Auth listener on mount
  useEffect(() => {
    const unsubscribe = initAuth((user, token) => {
      setGoogleUser(user);
      if (token) setGoogleAccessToken(token);
    });
    return () => unsubscribe();
  }, []);

  const handleConnectGoogle = async () => {
    setIsConnectingGoogle(true);
    try {
      const result = await signInWithGoogle();
      if (result) {
        setGoogleUser(result.user);
        setGoogleAccessToken(result.accessToken);
        showToast(`Conta Gmail conectada com sucesso: ${result.user.email}`);
      }
    } catch (err: any) {
      console.error('Google Sign In error:', err);
      showToast(`Erro ao conectar conta Google: ${err.message || 'Falha na autenticação'}`);
    } finally {
      setIsConnectingGoogle(false);
    }
  };

  const handleDisconnectGoogle = async () => {
    await logoutGoogle();
    setGoogleUser(null);
    setGoogleAccessToken(null);
    showToast('Conta Google/Gmail desconectada.');
  };

  // Fetch all data from backend
  const fetchAllData = async () => {
    setIsRefreshing(true);
    try {
      const [vRes, mRes, bRes, sRes, eRes, wRes] = await Promise.all([
        fetch('/api/vehicles'),
        fetch('/api/maintenances'),
        fetch(`/api/budget?operacao=${encodeURIComponent(selectedOperacao)}`),
        fetch('/api/settings'),
        fetch('/api/email-logs'),
        fetch('/api/whatsapp/logs')
      ]);

      if (vRes.ok) setVehicles(await vRes.json());
      if (mRes.ok) setMaintenances(await mRes.json());
      if (bRes.ok) setBudgetSummary(await bRes.json());
      if (sRes.ok) setSettings(await sRes.json());
      if (eRes.ok) setEmailLogs(await eRes.json());
      if (wRes.ok) setWhatsappLogs(await wRes.json());
    } catch (err) {
      console.error('Error fetching fleet data:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  // Refetch budget automatically when selected operation changes
  useEffect(() => {
    const fetchBudgetForOperacao = async () => {
      try {
        const res = await fetch(`/api/budget?operacao=${encodeURIComponent(selectedOperacao)}`);
        if (res.ok) {
          setBudgetSummary(await res.json());
        }
      } catch (err) {
        console.error('Error fetching budget for operation:', err);
      }
    };
    fetchBudgetForOperacao();
  }, [selectedOperacao]);

  // Handle KPI Card status filter click
  const handleSelectStatusFilter = (status: string) => {
    setSelectedStatusFilter(status);
    setActiveTab('frota');
  };

  // Check automatic alerts on demand
  const handleCheckAlertsNow = async () => {
    setIsRefreshing(true);
    try {
      const res = await fetch('/api/alerts/check', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ force: true })
      });
      const data = await res.json();
      if (data.allEmailLogs) setEmailLogs(data.allEmailLogs);
      if (data.allWhatsAppLogs) setWhatsappLogs(data.allWhatsAppLogs);
      showToast(`Verificação concluída: ${data.newEmailAlertsTriggered || 0} e-mail(s) e ${data.newWhatsAppAlertsTriggered || 0} alerta(s) WhatsApp gerado(s).`);
    } catch (err) {
      console.error('Error checking alerts:', err);
    } finally {
      setIsRefreshing(false);
    }
  };

  // WhatsApp Handlers
  const handleSendWhatsAppAlert = async (data: {
    telefone: string;
    mensagem: string;
    destinatarioNome?: string;
    placa?: string;
  }) => {
    try {
      const res = await fetch('/api/whatsapp/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      if (res.ok) {
        const resData = await res.json();
        if (resData.log) {
          setWhatsappLogs(prev => [resData.log, ...prev]);
          syncWhatsAppLogToFirestore(resData.log);
        }
        showToast(`📲 Alerta registrado! Redirecionando para o WhatsApp...`);
        if (resData.waUrl) {
          window.open(resData.waUrl, '_blank');
        }
      }
    } catch (err: any) {
      console.error('WhatsApp send error:', err);
      showToast(`Erro ao enviar via WhatsApp: ${err.message || 'Falha na requisição'}`);
    }
  };

  const handleUpdateWhatsAppConnect = async (phone: string, instanceName: string) => {
    const newSettings: SystemSettings = {
      ...settings,
      whatsappConnected: true,
      whatsappConnectedPhone: phone,
      whatsappInstanceName: instanceName
    };
    await handleUpdateSettings(newSettings);
    showToast(`🟢 Instância WhatsApp "${instanceName}" conectada com sucesso ao número ${phone}!`);
  };

  // Test email trigger
  const handleTriggerTestEmail = async (placa: string) => {
    try {
      let token = googleAccessToken || getCachedAccessToken();

      if (!token) {
        const result = await signInWithGoogle();
        if (result) {
          token = result.accessToken;
          setGoogleUser(result.user);
          setGoogleAccessToken(token);
        }
      }

      const vehicle = vehicles.find(v => v.placa === placa) || vehicles[0];
      const days = calculateDaysStopped(vehicle) || 20;

      const activeM = maintenances.find(
        m => m.placa === vehicle.placa && (m.status === 'Aberta' || m.status === 'Em andamento' || m.status === 'Atrasada')
      );
      const motivoStr = activeM
        ? `${activeM.atividadePendente} (${activeM.motivo})${activeM.observacoes ? ` - ${activeM.observacoes}` : ''}`
        : (vehicle.observacoes || 'Manutenção programada / em verificação');

      const targetEmail = googleUser?.email || settings.managerEmail;
      const alertTemplate = generateEmailAlertTemplate(vehicle, days, targetEmail, false, motivoStr, activeM);

      let sentGmail = false;
      if (token) {
        try {
          await sendEmailViaGmailAPI({
            accessToken: token,
            to: targetEmail,
            subject: alertTemplate.assunto,
            body: alertTemplate.corpo,
            fromEmail: googleUser?.email || undefined
          });
          sentGmail = true;
        } catch (err: any) {
          console.warn('Test email Gmail API error:', err);
        }
      }

      const res = await fetch('/api/alerts/send-test-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ placa: vehicle.placa })
      });
      const data = await res.json();
      if (data.emailLog) {
        setEmailLogs(prev => [data.emailLog, ...prev]);
        syncEmailLogToFirestore(data.emailLog);
      }

      if (sentGmail) {
        showToast(`🚀 E-mail de teste enviado com SUCESSO via Gmail para ${targetEmail}!`);
      } else {
        showToast(`✉️ E-mail registrado no sistema para ${targetEmail}!`);
      }
    } catch (err: any) {
      console.error('Error sending test email:', err);
      showToast(`Erro ao disparar e-mail: ${err.message || 'Verifique a conexão'}`);
    }
  };

  // Email Registration & Management Handlers
  const handleSaveRegisteredEmail = async (contact: EmailContact) => {
    const currentList = settings.registeredEmails || [];
    const existsIndex = currentList.findIndex(c => c.id === contact.id);
    let updatedList: EmailContact[];

    if (existsIndex !== -1) {
      updatedList = [...currentList];
      updatedList[existsIndex] = contact;
    } else {
      updatedList = [...currentList, contact];
    }

    const newSettings = { ...settings, registeredEmails: updatedList };
    await handleUpdateSettings(newSettings);
    showToast(`E-mail de ${contact.nome} cadastrado com sucesso!`);
  };

  const handleDeleteRegisteredEmail = async (id: string) => {
    if (!confirm('Deseja remover este e-mail dos contatos cadastrados?')) return;
    const currentList = settings.registeredEmails || [];
    const updatedList = currentList.filter(c => c.id !== id);
    const newSettings = { ...settings, registeredEmails: updatedList };
    await handleUpdateSettings(newSettings);
    showToast('E-mail removido dos contatos.');
  };

  const handleSendCustomEmail = async (emailData: {
    destinatario: string;
    assunto: string;
    corpo: string;
    placa?: string;
  }) => {
    let sentViaGmail = false;
    let gmailError: string | null = null;

    try {
      let token = googleAccessToken || getCachedAccessToken();

      // If user is not yet connected to Gmail, ask to connect now
      if (!token) {
        try {
          const connect = confirm('Sua conta Gmail ainda não está conectada. Deseja conectar com sua Conta Google agora para disparar o e-mail real via Gmail?');
          if (connect) {
            const result = await signInWithGoogle();
            if (result) {
              token = result.accessToken;
              setGoogleUser(result.user);
              setGoogleAccessToken(token);
            }
          }
        } catch (authErr: any) {
          console.warn('Google Auth popup closed or declined:', authErr);
        }
      }

      // If token is available, dispatch via Gmail API directly
      if (token) {
        try {
          await sendEmailViaGmailAPI({
            accessToken: token,
            to: emailData.destinatario,
            subject: emailData.assunto,
            body: emailData.corpo,
            fromEmail: googleUser?.email || undefined
          });
          sentViaGmail = true;
        } catch (gErr: any) {
          console.error('Gmail API send error:', gErr);
          gmailError = gErr.message || 'Erro ao enviar via Gmail';

          // Try re-authenticating if token was expired
          if (gmailError?.includes('401') || gmailError?.includes('Token') || gmailError?.includes('invalid') || gmailError?.includes('OAuth')) {
            try {
              const result = await signInWithGoogle();
              if (result?.accessToken) {
                token = result.accessToken;
                setGoogleUser(result.user);
                setGoogleAccessToken(token);
                await sendEmailViaGmailAPI({
                  accessToken: token,
                  to: emailData.destinatario,
                  subject: emailData.assunto,
                  body: emailData.corpo,
                  fromEmail: result.user.email || undefined
                });
                sentViaGmail = true;
                gmailError = null;
              }
            } catch (retryErr) {
              console.error('Retry Gmail send failed:', retryErr);
            }
          }
        }
      }

      // Record in backend email logs and sync to Firestore
      const res = await fetch('/api/emails/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailData)
      });

      if (res.ok) {
        const data = await res.json();
        if (data.emailLog) {
          setEmailLogs(prev => [data.emailLog, ...prev]);
          syncEmailLogToFirestore(data.emailLog);
        }
        
        if (sentViaGmail) {
          showToast(`🚀 E-mail disparado com SUCESSO via Gmail para ${emailData.destinatario}!`);
        } else if (gmailError) {
          showToast(`⚠️ E-mail salvo no histórico. (Aviso Gmail: ${gmailError})`);
        } else {
          showToast(`✉️ E-mail registrado com sucesso no histórico de alertas!`);
        }
      }
    } catch (err: any) {
      console.error('Send custom email error:', err);
      showToast(`Erro ao enviar e-mail: ${err.message || 'Verifique o endereço e conexões'}`);
    }
  };

  // Vehicle Save Handler
  const handleSaveVehicle = async (vehicleData: Partial<Vehicle>) => {
    try {
      let res;
      if (editingVehicle) {
        res = await fetch(`/api/vehicles/${editingVehicle.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData)
        });
      } else {
        res = await fetch('/api/vehicles', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(vehicleData)
        });
      }

      if (res.ok) {
        const savedVehicle: Vehicle = await res.json();
        syncVehicleToFirestore(savedVehicle);
        showToast(editingVehicle ? 'Veículo atualizado com sucesso!' : 'Novo veículo cadastrado na frota!');
        setIsVehicleModalOpen(false);
        setEditingVehicle(null);
        fetchAllData();
      }
    } catch (err) {
      console.error('Save vehicle error:', err);
    }
  };

  // Delete Vehicle
  const handleDeleteVehicle = async (id: string) => {
    if (!confirm('Deseja realmente remover este veículo da frota?')) return;
    try {
      const res = await fetch(`/api/vehicles/${id}`, { method: 'DELETE' });
      if (res.ok) {
        showToast('Veículo removido da frota.');
        fetchAllData();
      }
    } catch (err) {
      console.error('Delete vehicle error:', err);
    }
  };

  // Bulk Delete Vehicles
  const handleBulkDeleteVehicles = async (ids: string[]) => {
    if (!ids.length) return;
    try {
      const res = await fetch('/api/vehicles/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        showToast(`🗑️ ${ids.length} veículo(s) removido(s) da frota com sucesso!`);
        fetchAllData();
      }
    } catch (err) {
      console.error('Bulk delete vehicles error:', err);
    }
  };

  // Maintenance Save Handler
  const handleSaveMaintenance = async (orderData: Partial<MaintenanceOrder>) => {
    try {
      let res;
      if (orderData.id) {
        res = await fetch(`/api/maintenances/${orderData.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
      } else {
        res = await fetch('/api/maintenances', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(orderData)
        });
      }

      if (res.ok) {
        showToast('Solicitação de manutenção salva com sucesso!');
        setIsMaintenanceModalOpen(false);
        setEditingMaintenance(null);
        fetchAllData();
      }
    } catch (err) {
      console.error('Save maintenance error:', err);
    }
  };

  // Bulk Maintenance Creation
  const handleSaveBulkMaintenances = async (orders: any[]) => {
    try {
      const res = await fetch('/api/maintenances/bulk-create', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orders })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`📦 ${data.count} solicitações de manutenção criadas em massa!`);
        setIsBulkMaintenanceModalOpen(false);
        fetchAllData();
      }
    } catch (err) {
      console.error('Bulk create error:', err);
    }
  };

  // Bulk Maintenance Deletion
  const handleBulkDeleteMaintenances = async (ids: string[]) => {
    try {
      const res = await fetch('/api/maintenances/bulk-delete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ids })
      });
      if (res.ok) {
        const data = await res.json();
        showToast(`🗑️ ${data.deletedCount} manutenções excluídas em massa!`);
        fetchAllData();
      }
    } catch (err) {
      console.error('Bulk delete error:', err);
    }
  };

  const handleApproveStep = async (order: MaintenanceOrder, step: 'aprovacao1' | 'aprovacao2' | 'conclusao') => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR') + ' ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    const updatedOrder = { ...order };

    if (step === 'aprovacao1') {
      updatedOrder.aprovacao1 = {
        aprovado: true,
        dataHora: dateStr,
        aprovadoPor: `${settings.managerName} (Supervisão/1ª Etapa)`
      };
      updatedOrder.status = 'Em andamento';
      showToast(`1ª Aprovação registrada com sucesso para a placa ${order.placa}!`);
    } else if (step === 'aprovacao2') {
      updatedOrder.aprovacao2 = {
        aprovado: true,
        dataHora: dateStr,
        aprovadoPor: `${settings.managerName} (Gerência/2ª Etapa)`
      };
      updatedOrder.status = 'Em andamento';
      showToast(`2ª Aprovação autorizada para a placa ${order.placa}!`);
    } else if (step === 'conclusao') {
      updatedOrder.conclusao = {
        aprovado: true,
        dataHora: dateStr,
        aprovadoPor: `${settings.managerName} (Conclusão/Oficina)`
      };
      updatedOrder.status = 'Concluída';
      updatedOrder.dataRealizada = now.toISOString().split('T')[0];
      showToast(`Manutenção da placa ${order.placa} finalizada e CONCLUÍDA!`);
    }

    await handleSaveMaintenance(updatedOrder);
  };

  // Budget Update Handler
  const handleSaveBudget = async (newBudgets: Record<string, number> | number) => {
    try {
      const payload = typeof newBudgets === 'number'
        ? { newBudget: newBudgets, operacao: selectedOperacao }
        : { budgetsByBase: newBudgets, operacao: selectedOperacao };

      const res = await fetch(`/api/budget?operacao=${encodeURIComponent(selectedOperacao)}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setBudgetSummary(await res.json());
        showToast('Orçamento por filial atualizado!');
        setIsBudgetModalOpen(false);
      }
    } catch (err) {
      console.error('Save budget error:', err);
    }
  };

  // Settings Update Handler
  const handleUpdateSettings = async (newSettings: SystemSettings) => {
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newSettings)
      });
      if (res.ok) {
        setSettings(await res.json());
        showToast('Configurações salvas!');
      }
    } catch (err) {
      console.error('Update settings error:', err);
    }
  };

  // Seed Reset Handler
  const handleResetSeedData = async () => {
    if (!confirm('Deseja restaurar todos os dados originais da frota?')) return;
    try {
      const res = await fetch('/api/reset-seed', { method: 'POST' });
      if (res.ok) {
        showToast('Dados restaurados para o padrão original da frota!');
        fetchAllData();
      }
    } catch (err) {
      console.error('Reset seed error:', err);
    }
  };

  // Count vehicles stopped for 20+ days
  const alert20DaysCount = vehicles.filter(
    v => (v.status === 'Parado' || v.status === 'Em manutenção') && calculateDaysStopped(v) >= 20
  ).length;

  const stoppedCount = vehicles.filter(v => v.status === 'Parado' || v.status === 'Em manutenção').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 bg-indigo-600 text-white font-bold text-xs px-4 py-3 rounded-2xl shadow-2xl border border-indigo-400/30 animate-bounce flex items-center gap-2">
          <span>{toastMessage}</span>
        </div>
      )}

      {/* Header */}
      <Header
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        onRefresh={fetchAllData}
        isRefreshing={isRefreshing}
        alert20DaysCount={alert20DaysCount}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        managerEmail={settings.managerEmail}
        googleUser={googleUser}
        onConnectGoogle={handleConnectGoogle}
        onDisconnectGoogle={handleDisconnectGoogle}
        onOpenConnectEmailModal={() => setIsConnectEmailModalOpen(true)}
        isConnectingGoogle={isConnectingGoogle}
        onOpenWhatsAppConnect={() => setIsWhatsAppConnectModalOpen(true)}
        onOpenSendWhatsAppModal={() => setIsSendWhatsAppModalOpen(true)}
        theme={theme}
        onToggleTheme={setTheme}
      />

      <div className="flex flex-1 flex-col lg:flex-row">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          alert20DaysCount={alert20DaysCount}
          stoppedCount={stoppedCount}
          maintenanceCount={maintenances.length}
        />

        {/* Main Content Area */}
        <main className="flex-1 p-4 lg:p-6 space-y-6 overflow-y-auto w-full max-w-full">
          {/* Top 4 Combined KPI Cards with Operação Filter */}
          {(activeTab === 'dashboard' || activeTab === 'frota' || activeTab === 'veiculos-parados') && (
            <KPICards
              vehicles={vehicles}
              onSelectStatusFilter={handleSelectStatusFilter}
              selectedFilter={selectedStatusFilter}
              selectedOperacao={selectedOperacao}
              onSelectOperacao={setSelectedOperacao}
            />
          )}

          {/* Active Tab View Rendering */}
          {activeTab === 'dashboard' && (
            <DashboardView
              vehicles={selectedOperacao === 'Todas' ? vehicles : vehicles.filter(v => v.base === selectedOperacao)}
              maintenances={selectedOperacao === 'Todas' ? maintenances : maintenances.filter(m => m.base === selectedOperacao)}
              budgetData={budgetSummary}
              selectedOperacao={selectedOperacao}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
              onNavigateTab={setActiveTab}
            />
          )}

          {activeTab === 'powerbi' && (
            <PowerBIDashboardView
              vehicles={vehicles}
              maintenances={maintenances}
              budgetData={budgetSummary}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            />
          )}

          {activeTab === 'frota' && (
            <FleetView
              vehicles={vehicles}
              searchQuery={searchQuery}
              selectedStatusFilter={selectedStatusFilter}
              onSelectStatusFilter={setSelectedStatusFilter}
              onOpenAddVehicleModal={() => {
                setEditingVehicle(null);
                setIsVehicleModalOpen(true);
              }}
              onOpenExcelImportModal={() => {
                setExcelImportType('vehicles');
                setIsExcelImportModalOpen(true);
              }}
              onOpenEditVehicleModal={(vehicle) => {
                setEditingVehicle(vehicle);
                setIsVehicleModalOpen(true);
              }}
              onDeleteVehicle={handleDeleteVehicle}
              onBulkDeleteVehicles={handleBulkDeleteVehicles}
              onUpdateVehicleStatus={(v, newStatus) => handleSaveVehicle({ ...v, status: newStatus })}
            />
          )}

          {activeTab === 'manutencoes' && (
            <MaintenanceView
              maintenances={maintenances}
              searchQuery={searchQuery}
              selectedOperacao={selectedOperacao}
              onSelectOperacao={setSelectedOperacao}
              selectedStatusFilter={selectedStatusFilter}
              onSelectStatusFilter={setSelectedStatusFilter}
              onOpenAddMaintenanceModal={() => {
                setEditingMaintenance(null);
                setIsMaintenanceModalOpen(true);
              }}
              onOpenBulkMaintenanceModal={() => setIsBulkMaintenanceModalOpen(true)}
              onOpenExcelImportModal={() => {
                setExcelImportType('maintenances');
                setIsExcelImportModalOpen(true);
              }}
              onOpenEditMaintenanceModal={(order) => {
                setEditingMaintenance(order);
                setIsMaintenanceModalOpen(true);
              }}
              onUpdateOrderStatus={(m, newStatus) => handleSaveMaintenance({ ...m, status: newStatus })}
              onApproveStep={handleApproveStep}
              onBulkDeleteMaintenances={handleBulkDeleteMaintenances}
            />
          )}

          {activeTab === 'orcamento' && (
            <BudgetView
              budgetData={budgetSummary}
              maintenances={maintenances}
              selectedOperacao={selectedOperacao}
              onOpenBudgetModal={() => setIsBudgetModalOpen(true)}
            />
          )}

          {activeTab === 'veiculos-parados' && (
            <StoppedVehiclesView
              vehicles={vehicles}
              managerEmail={settings.managerEmail}
              onOpenEmailPreviewModal={(v, days) => setEmailPreviewVehicle({ vehicle: v, days })}
              onTriggerTestEmail={handleTriggerTestEmail}
              onOpenSendWhatsAppModal={(phone) => {
                setSendWhatsAppPreselectedPhone(phone);
                setIsSendWhatsAppModalOpen(true);
              }}
            />
          )}

          {activeTab === 'relatorios' && (
            <ReportsView
              vehicles={vehicles}
              maintenances={maintenances}
              budgetData={budgetSummary}
            />
          )}

          {activeTab === 'alertas' && (
            <AlertsView
              emailLogs={emailLogs}
              whatsappLogs={whatsappLogs}
              managerEmail={settings.managerEmail}
              registeredEmails={settings.registeredEmails || []}
              emailGroups={settings.emailGroups || []}
              vehicles={vehicles}
              onOpenRegisterEmailModal={(contact) => {
                setEditingEmailContact(contact || null);
                setIsRegisterEmailModalOpen(true);
              }}
              onOpenSendEmailModal={(recipientEmail) => {
                setSendEmailPreselectedRecipient(recipientEmail);
                setIsSendEmailModalOpen(true);
              }}
              onOpenSendWhatsAppModal={(phone) => {
                setSendWhatsAppPreselectedPhone(phone);
                setIsSendWhatsAppModalOpen(true);
              }}
              onOpenWhatsAppConnect={() => setIsWhatsAppConnectModalOpen(true)}
              onDeleteEmailContact={handleDeleteRegisteredEmail}
              onTriggerTestEmail={handleTriggerTestEmail}
              onCheckAlertsNow={handleCheckAlertsNow}
            />
          )}

          {activeTab === 'configuracoes' && (
            <SettingsView
              settings={settings}
              googleUser={googleUser}
              onOpenConnectEmailModal={() => setIsConnectEmailModalOpen(true)}
              onUpdateSettings={handleUpdateSettings}
              onResetSeedData={handleResetSeedData}
              onOpenRegisterEmailModal={(contact) => {
                setEditingEmailContact(contact || null);
                setIsRegisterEmailModalOpen(true);
              }}
              onOpenSendEmailModal={(recipientEmail) => {
                setSendEmailPreselectedRecipient(recipientEmail);
                setIsSendEmailModalOpen(true);
              }}
              onOpenSendWhatsAppModal={(phone) => {
                setSendWhatsAppPreselectedPhone(phone);
                setIsSendWhatsAppModalOpen(true);
              }}
              onOpenWhatsAppConnect={() => setIsWhatsAppConnectModalOpen(true)}
              onDeleteEmailContact={handleDeleteRegisteredEmail}
              theme={theme}
              onToggleTheme={setTheme}
            />
          )}
        </main>
      </div>

      {/* Modal Dialogs */}
      {isVehicleModalOpen && (
        <VehicleModal
          vehicle={editingVehicle}
          onClose={() => {
            setIsVehicleModalOpen(false);
            setEditingVehicle(null);
          }}
          onSave={handleSaveVehicle}
        />
      )}

      {isMaintenanceModalOpen && (
        <MaintenanceModal
          order={editingMaintenance}
          vehicles={vehicles}
          onClose={() => {
            setIsMaintenanceModalOpen(false);
            setEditingMaintenance(null);
          }}
          onSave={handleSaveMaintenance}
        />
      )}

      {isBulkMaintenanceModalOpen && (
        <BulkMaintenanceModal
          vehicles={vehicles}
          onClose={() => setIsBulkMaintenanceModalOpen(false)}
          onSaveBulk={handleSaveBulkMaintenances}
        />
      )}

      {isBudgetModalOpen && (
        <BudgetModal
          currentBudget={budgetSummary.orcamentoMensal}
          budgetsByBase={budgetSummary.budgetsByBase}
          selectedOperacao={selectedOperacao}
          onClose={() => setIsBudgetModalOpen(false)}
          onSave={handleSaveBudget}
        />
      )}

      {emailPreviewVehicle && (
        <EmailPreviewModal
          vehicle={emailPreviewVehicle.vehicle}
          diasParado={emailPreviewVehicle.days}
          managerEmail={settings.managerEmail}
          maintenances={maintenances}
          onClose={() => setEmailPreviewVehicle(null)}
          onSendNow={handleTriggerTestEmail}
        />
      )}

      {isRegisterEmailModalOpen && (
        <RegisterEmailModal
          contactToEdit={editingEmailContact}
          existingGroups={settings.emailGroups || []}
          onClose={() => {
            setIsRegisterEmailModalOpen(false);
            setEditingEmailContact(null);
          }}
          onSave={handleSaveRegisteredEmail}
        />
      )}

      {isSendEmailModalOpen && (
        <SendEmailModal
          registeredEmails={settings.registeredEmails || []}
          emailGroups={settings.emailGroups || []}
          vehicles={vehicles}
          maintenances={maintenances}
          preselectedRecipient={sendEmailPreselectedRecipient}
          googleUser={googleUser}
          onConnectGoogle={handleConnectGoogle}
          onClose={() => {
            setIsSendEmailModalOpen(false);
            setSendEmailPreselectedRecipient(undefined);
          }}
          onSendEmail={handleSendCustomEmail}
        />
      )}

      {isWhatsAppConnectModalOpen && (
        <WhatsAppConnectModal
          settings={settings}
          onClose={() => setIsWhatsAppConnectModalOpen(false)}
          onConnected={handleUpdateWhatsAppConnect}
        />
      )}

      {isSendWhatsAppModalOpen && (
        <SendWhatsAppModal
          registeredContacts={settings.registeredEmails || []}
          vehicles={vehicles}
          maintenances={maintenances}
          preselectedPhone={sendWhatsAppPreselectedPhone}
          onClose={() => {
            setIsSendWhatsAppModalOpen(false);
            setSendWhatsAppPreselectedPhone(undefined);
          }}
          onSend={handleSendWhatsAppAlert}
        />
      )}

      {isExcelImportModalOpen && (
        <ExcelImportModal
          initialType={excelImportType}
          onClose={() => setIsExcelImportModalOpen(false)}
          onImportVehiclesSuccess={() => {
            showToast('🚚 Veículos cadastrados em massa com sucesso via Excel!');
            fetchAllData();
          }}
          onImportMaintenancesSuccess={() => {
            showToast('🔧 Ordens de manutenção criadas em massa com sucesso via Excel!');
            fetchAllData();
          }}
        />
      )}

      {isConnectEmailModalOpen && (
        <ConnectEmailModal
          googleUser={googleUser}
          googleAccessToken={googleAccessToken}
          onConnectGoogle={handleConnectGoogle}
          onDisconnectGoogle={handleDisconnectGoogle}
          isConnectingGoogle={isConnectingGoogle}
          onClose={() => setIsConnectEmailModalOpen(false)}
          onSendTestEmail={async (toEmail) => {
            await handleTriggerTestEmail(toEmail);
            showToast(`✉️ E-mail de teste enviado para ${toEmail}! Seu e-mail e o app já se conversam.`);
          }}
        />
      )}
    </div>
  );
}
