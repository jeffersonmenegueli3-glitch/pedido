import React, { useState } from 'react';
import { Vehicle } from '../types/fleet';
import { Bot, X, Send, CheckCircle2, AlertTriangle, ShieldCheck, Mail, Code2, Copy, Sparkles, Terminal, FileCode } from 'lucide-react';

interface NetlifyRobotModalProps {
  vehicles: Vehicle[];
  managerEmail: string;
  onClose: () => void;
  onAlertSent?: () => void;
}

export const NetlifyRobotModal: React.FC<NetlifyRobotModalProps> = ({
  vehicles,
  managerEmail,
  onClose,
  onAlertSent
}) => {
  const stoppedVehicles = vehicles.filter(v => v.status === 'Parado' || v.status === 'Em manutenção');
  
  const [selectedPlaca, setSelectedPlaca] = useState<string>(
    stoppedVehicles.length > 0 ? stoppedVehicles[0].placa : (vehicles[0]?.placa || 'ABC1D23')
  );

  const selectedVehicle = vehicles.find(v => v.placa === selectedPlaca);

  const [alertPlate, setAlertPlate] = useState<string>(selectedVehicle?.placa || 'ABC1D23');
  const [daysStopped, setDaysStopped] = useState<string>('20');
  const [model, setModel] = useState<string>(selectedVehicle?.modelo || 'Veículo da Frota');
  const [base, setBase] = useState<string>(selectedVehicle?.base || 'Geral');
  const [driver, setDriver] = useState<string>(selectedVehicle?.motorista || 'Não atribuído');
  const [status, setStatus] = useState<string>(selectedVehicle?.status || 'Parado');
  const [reason, setReason] = useState<string>(selectedVehicle?.observacoes || 'Manutenção programada / em verificação');
  const [observations, setObservations] = useState<string>('Verificação urgente e acompanhamento operacional necessários.');
  const [recipients, setRecipients] = useState<string>(managerEmail || 'gestao@frota.com.br');

  const [isSending, setIsSending] = useState<boolean>(false);
  const [responseLog, setResponseLog] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'trigger' | 'code' | 'docs'>('trigger');
  const [copiedCode, setCopiedCode] = useState<boolean>(false);

  const handleSelectVehicle = (placa: string) => {
    setSelectedPlaca(placa);
    const veh = vehicles.find(v => v.placa === placa);
    if (veh) {
      setAlertPlate(veh.placa);
      setModel(veh.modelo);
      setBase(veh.base);
      setDriver(veh.motorista || 'Não atribuído');
      setStatus(veh.status);
      if (veh.observacoes) setReason(veh.observacoes);
    }
  };

  const handleTriggerRobot = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSending(true);
    setResponseLog(null);

    try {
      const res = await fetch('/.netlify/functions/enviar-alerta', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subject: `🚨 ALERTA OPERACIONAL DE FROTA - Placa ${alertPlate}`,
          alertPlate,
          daysStopped,
          model,
          base,
          driver,
          status,
          reason,
          observations,
          recipients
        })
      });

      const data = await res.json();
      setResponseLog({
        status: res.status,
        ok: res.ok,
        data
      });

      if (res.ok && onAlertSent) {
        onAlertSent();
      }
    } catch (err: any) {
      setResponseLog({
        status: 500,
        ok: false,
        error: err?.message || 'Erro ao comunicar com a Netlify Function'
      });
    } finally {
      setIsSending(false);
    }
  };

  const functionJsCode = `// netlify/functions/enviar-alerta.js
export async function handler(event, context) {
  try {
    const body = event.body ? JSON.parse(event.body) : {};

    const alertPlate = (body.alertPlate ?? body.placa ?? "N/A").toString().trim();
    const daysStopped = (body.daysStopped ?? body.diasParado ?? "20").toString().trim();
    const model = (body.model ?? body.modelo ?? "Veículo da Frota").toString().trim();
    const base = (body.base ?? "Geral").toString().trim();
    const driver = (body.driver ?? body.motorista ?? "Não atribuído").toString().trim();
    const status = (body.status ?? "Parado").toString().trim();
    const reason = (body.reason ?? body.motivo ?? "Manutenção programada / em verificação").toString().trim();
    const observations = (body.observations ?? body.observacoes ?? "Verificação urgente necessária.").toString().trim();

    const subject = body.subject || \`🚨 ALERTA OPERACIONAL DE FROTA - Placa \${alertPlate}\`;

    const recipientsCsv = process.env.ALERT_RECIPIENTS || body.recipients || "gestao@frota.com.br";
    const recipients = recipientsCsv
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const apiKey = process.env.SENDGRID_API_KEY;
    const sender = process.env.SENDER_EMAIL || "notificacoes@fleetmaster.com.br";

    const formattedTime = new Date().toLocaleString("pt-BR");

    const messageHtml = \`
      <div style="font-family: Arial, sans-serif; line-height: 1.5; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden;">
        <div style="background: #dc2626; padding: 18px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff;">🚨 ALERTA OPERACIONAL DE FROTA</h2>
        </div>
        <div style="padding: 20px;">
          <p>Atenção equipe! O veículo <b>\${alertPlate}</b> (\${model}) alocado na Base <b>\${base}</b> está parado há <b>\${daysStopped} dias</b>.</p>
          <ul>
            <li><b>• Placa:</b> \${alertPlate}</li>
            <li><b>• Modelo:</b> \${model}</li>
            <li><b>• Base/Operação:</b> \${base}</li>
            <li><b>• Motorista:</b> \${driver}</li>
            <li><b>• Dias Parado:</b> \${daysStopped} dias</li>
            <li><b>• Status:</b> \${status}</li>
            <li><b>• Motivo da Manutenção:</b> \${reason}</li>
            <li><b>• Observações:</b> \${observations}</li>
          </ul>
          <p><b>⚠️ Ação Necessária:</b> Favor responder com o status atualizado do orçamento ou previsão de liberação.</p>
          <hr />
          <p style="font-size:12px; color:#666;">Enviado por: <b>Gestão de Frota - FleetMaster Pro</b> (\${formattedTime})</p>
        </div>
      </div>
    \`;

    const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
      method: "POST",
      headers: {
        Authorization: \`Bearer \${apiKey}\`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        personalizations: [{ to: recipients.map(email => ({ email })), subject }],
        from: { email: sender },
        content: [{ type: "text/html", value: messageHtml }]
      }),
    });

    return { statusCode: 200, body: JSON.stringify({ ok: true }) };
  } catch (e) {
    return { statusCode: 500, body: JSON.stringify({ error: String(e) }) };
  }
}`;

  const copyToClipboard = () => {
    navigator.clipboard.writeText(functionJsCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-3xl w-full p-6 space-y-6 shadow-2xl relative my-8">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <Bot className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-white text-lg">Robô de Disparo de E-mail (Netlify Function)</h3>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  POWERED BY NETLIFY
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Disparos automáticos e sob demanda via serverless function <code className="bg-slate-800 px-1 py-0.5 rounded text-indigo-300">netlify/functions/enviar-alerta.js</code>
              </p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 text-slate-400 hover:text-white rounded-xl bg-slate-800/80 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
          <button
            onClick={() => setActiveTab('trigger')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'trigger'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>⚡ Testar / Disparar Robô Agora</span>
          </button>

          <button
            onClick={() => setActiveTab('code')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'code'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Code2 className="w-4 h-4" />
            <span>📄 Código da Function (enviar-alerta.js)</span>
          </button>

          <button
            onClick={() => setActiveTab('docs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
              activeTab === 'docs'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30'
                : 'bg-slate-800 text-slate-400 hover:text-white'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>⚙️ Variáveis na Netlify</span>
          </button>
        </div>

        {/* Tab 1: Trigger Form */}
        {activeTab === 'trigger' && (
          <form onSubmit={handleTriggerRobot} className="space-y-4">
            {/* Quick Vehicle Select */}
            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Selecionar Veículo da Frota (Preenche Dados Automaticamente)
              </label>
              <select
                value={selectedPlaca}
                onChange={(e) => handleSelectVehicle(e.target.value)}
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-slate-200 focus:ring-2 focus:ring-indigo-500 font-mono"
              >
                {vehicles.map(v => (
                  <option key={v.id} value={v.placa}>
                    {v.placa} — {v.modelo} (Base {v.base} | Status: {v.status})
                  </option>
                ))}
              </select>
            </div>

            {/* Grid Form Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">• Placa</label>
                <input
                  type="text"
                  value={alertPlate}
                  onChange={(e) => setAlertPlate(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-mono font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">• Dias Parado</label>
                <input
                  type="number"
                  value={daysStopped}
                  onChange={(e) => setDaysStopped(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white font-bold"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">• Modelo</label>
                <input
                  type="text"
                  value={model}
                  onChange={(e) => setModel(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">• Base / Operação</label>
                <input
                  type="text"
                  value={base}
                  onChange={(e) => setBase(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                  required
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">• Motorista</label>
                <input
                  type="text"
                  value={driver}
                  onChange={(e) => setDriver(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">• Status</label>
                <input
                  type="text"
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">• Motivo da Manutenção</label>
                <input
                  type="text"
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-slate-400 mb-1">• Observações / Instrução</label>
                <input
                  type="text"
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1">
                Destinatários do Alerta (separados por vírgula)
              </label>
              <input
                type="text"
                value={recipients}
                onChange={(e) => setRecipients(e.target.value)}
                placeholder="email1@dominio.com, email2@dominio.com"
                className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-indigo-300 font-mono"
                required
              />
            </div>

            {/* Email Live Preview Box */}
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-2">
              <div className="flex items-center justify-between text-xs font-bold text-slate-400 border-b border-slate-800/80 pb-2">
                <span>📧 Pré-visualização do Formato HTML Gerado pelo Robô:</span>
                <span className="text-[10px] text-rose-400 font-mono">🚨 ALERTA OPERACIONAL DE FROTA</span>
              </div>

              <div className="text-xs text-slate-200 bg-slate-900 p-3 rounded-xl border border-rose-950 space-y-2 font-sans">
                <p>
                  Atenção equipe! O veículo <strong className="text-rose-400 font-mono">{alertPlate}</strong> ({model}) alocado na Base <strong>{base}</strong> está parado há <strong className="text-rose-400 font-bold">{daysStopped} dias</strong>.
                </p>
                <div className="text-[11px] text-slate-300 space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                  <p className="font-bold text-indigo-300">📋 Detalhes da Operação:</p>
                  <p>• Placa: {alertPlate}</p>
                  <p>• Modelo: {model}</p>
                  <p>• Base/Operação: {base}</p>
                  <p>• Motorista: {driver}</p>
                  <p>• Dias Parado: {daysStopped} dias</p>
                  <p>• Status: {status}</p>
                  <p>• Motivo da Manutenção: {reason}</p>
                  <p>• Observações: {observations}</p>
                </div>
                <p className="text-rose-300 font-bold text-[11px]">
                  ⚠️ Ação Necessária: Favor responder com o status atualizado do orçamento ou previsão de liberação.
                </p>
                <p className="text-[10px] text-slate-500 pt-1">
                  Enviado por: Gestão de Frota - FleetMaster Pro
                </p>
              </div>
            </div>

            {/* Response Log feedback */}
            {responseLog && (
              <div className={`p-4 rounded-2xl border text-xs font-mono space-y-1 ${
                responseLog.ok ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-300' : 'bg-rose-950/60 border-rose-500/40 text-rose-300'
              }`}>
                <div className="flex items-center gap-2 font-bold text-sm">
                  {responseLog.ok ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  ) : (
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                  )}
                  <span>Status HTTP: {responseLog.status} — {responseLog.ok ? 'Sucesso!' : 'Falha'}</span>
                </div>
                <pre className="text-[11px] overflow-x-auto whitespace-pre-wrap pt-1 bg-slate-950/80 p-2 rounded-lg">
                  {JSON.stringify(responseLog.data || responseLog.error, null, 2)}
                </pre>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs rounded-xl transition cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isSending}
                className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-600 via-purple-600 to-rose-600 hover:from-indigo-500 hover:to-rose-500 text-white font-black text-xs rounded-xl shadow-lg transition cursor-pointer active:scale-95 disabled:opacity-50"
              >
                <Bot className="w-4 h-4" />
                <span>{isSending ? 'Disparando Robô...' : '🚀 DISPARAR ROBÔ NETLIFY AGORA'}</span>
              </button>
            </div>
          </form>
        )}

        {/* Tab 2: Function Code View */}
        {activeTab === 'code' && (
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-slate-300 font-mono">
                <FileCode className="w-4 h-4 text-indigo-400" />
                <span>/netlify/functions/enviar-alerta.js</span>
              </div>
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl transition cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedCode ? 'Copiado!' : 'Copiar Código'}</span>
              </button>
            </div>

            <pre className="p-4 bg-slate-950 border border-slate-800 rounded-2xl text-[11px] text-emerald-400 font-mono overflow-x-auto max-h-96">
              {functionJsCode}
            </pre>
          </div>
        )}

        {/* Tab 3: Environment Setup Docs */}
        {activeTab === 'docs' && (
          <div className="space-y-4 text-xs text-slate-300">
            <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
              <h4 className="font-extrabold text-white text-sm flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Como Configurar na Netlify (Passo a Passo)
              </h4>
              <ol className="list-decimal list-inside space-y-2 text-slate-300 leading-relaxed">
                <li>Acesse o painel do seu site na <strong>Netlify</strong>.</li>
                <li>Vá em <strong>Site settings → Environment variables</strong>.</li>
                <li>Cadastre as 3 variáveis abaixo:
                  <ul className="list-disc list-inside pl-4 mt-1 space-y-1 text-indigo-300 font-mono text-[11px]">
                    <li><strong>SENDGRID_API_KEY</strong>: Sua chave de API do SendGrid / Mailgun</li>
                    <li><strong>SENDER_EMAIL</strong>: O e-mail remetente verificado (ex.: notificacoes@seusite.com)</li>
                    <li><strong>ALERT_RECIPIENTS</strong>: Lista de destinatários separados por vírgula (ex.: gestor1@email.com, gestor2@email.com)</li>
                  </ul>
                </li>
                <li>Faça o deploy do site. A Netlify criará automaticamente a rota <code className="text-amber-300 bg-slate-800 px-1 py-0.5 rounded font-mono">/.netlify/functions/enviar-alerta</code>.</li>
              </ol>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};
