export async function handler(event, context) {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Content-Type': 'application/json'
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: JSON.stringify({ ok: true }) };
  }

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

    const subject = body.subject || `🚨 ALERTA OPERACIONAL DE FROTA - Placa ${alertPlate}`;

    const recipientsCsv = process.env.ALERT_RECIPIENTS || body.recipients || "gestao@frota.com.br";
    const recipients = recipientsCsv
      .split(",")
      .map(s => s.trim())
      .filter(Boolean);

    const apiKey = process.env.SENDGRID_API_KEY;
    const sender = process.env.SENDER_EMAIL || "notificacoes@fleetmaster.com.br";

    const formattedTime = new Date().toLocaleString("pt-BR");

    const messageHtml = `
      <div style="font-family: Arial, Helvetica, sans-serif; line-height: 1.5; color: #1e293b; max-width: 600px; margin: 0 auto; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        <div style="background: linear-gradient(135deg, #dc2626, #b91c1c); padding: 20px; text-align: center;">
          <h2 style="margin: 0; color: #ffffff; font-size: 20px; font-weight: 800;">🚨 ALERTA OPERACIONAL DE FROTA</h2>
          <p style="margin: 5px 0 0 0; color: #fecaca; font-size: 13px;">Notificação crítica de veículo parado +20 dias</p>
        </div>

        <div style="padding: 24px; background-color: #ffffff;">
          <p style="margin: 0 0 16px 0; font-size: 15px;">
            Atenção equipe! O veículo <strong style="color: #dc2626; font-size: 16px;">${escapeHtml(alertPlate)}</strong> (${escapeHtml(model)}) alocado na Base <strong>${escapeHtml(base)}</strong> está parado há <strong style="color: #dc2626; font-size: 16px;">${escapeHtml(daysStopped)} dias</strong>.
          </p>

          <div style="background-color: #f8fafc; border-left: 4px solid #dc2626; padding: 16px; border-radius: 6px; margin-bottom: 20px;">
            <h3 style="margin: 0 0 12px 0; font-size: 14px; text-transform: uppercase; letter-spacing: 0.5px; color: #475569;">📋 Detalhes da Operação:</h3>
            <ul style="margin: 0; padding-left: 0; list-style: none; font-size: 14px;">
              <li style="padding: 4px 0; border-bottom: 1px dashed #e2e8f0;"><strong>• Placa:</strong> ${escapeHtml(alertPlate)}</li>
              <li style="padding: 4px 0; border-bottom: 1px dashed #e2e8f0;"><strong>• Modelo:</strong> ${escapeHtml(model)}</li>
              <li style="padding: 4px 0; border-bottom: 1px dashed #e2e8f0;"><strong>• Base/Operação:</strong> ${escapeHtml(base)}</li>
              <li style="padding: 4px 0; border-bottom: 1px dashed #e2e8f0;"><strong>• Motorista:</strong> ${escapeHtml(driver)}</li>
              <li style="padding: 4px 0; border-bottom: 1px dashed #e2e8f0;"><strong>• Dias Parado:</strong> <span style="color: #dc2626; font-weight: bold;">${escapeHtml(daysStopped)} dias</span></li>
              <li style="padding: 4px 0; border-bottom: 1px dashed #e2e8f0;"><strong>• Status:</strong> ${escapeHtml(status)}</li>
              <li style="padding: 4px 0; border-bottom: 1px dashed #e2e8f0;"><strong>• Motivo da Manutenção:</strong> ${escapeHtml(reason)}</li>
              <li style="padding: 4px 0;"><strong>• Observações:</strong> ${escapeHtml(observations)}</li>
            </ul>
          </div>

          <div style="background-color: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; padding: 14px; margin-bottom: 20px;">
            <p style="margin: 0; color: #991b1b; font-size: 13px; font-weight: bold;">
              ⚠️ Ação Necessária: Favor responder com o status atualizado do orçamento ou previsão de liberação.
            </p>
          </div>

          <hr style="border: none; border-top: 1px solid #f1f5f9; margin: 20px 0;" />

          <p style="margin: 0; color: #64748b; font-size: 12px; text-align: center;">
            Enviado por: <strong>Gestão de Frota - FleetMaster Pro</strong><br/>
            Data/Hora do envio: ${escapeHtml(formattedTime)}
          </p>
        </div>
      </div>
    `;

    const messageText = `🚨 ALERTA OPERACIONAL DE FROTA

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
Hora do envio: ${formattedTime}`;

    if (apiKey) {
      const res = await fetch("https://api.sendgrid.com/v3/mail/send", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          personalizations: [
            {
              to: recipients.map(email => ({ email })),
              subject,
            },
          ],
          from: { email: sender },
          content: [
            { type: "text/html", value: messageHtml },
            { type: "text/plain", value: messageText },
          ],
        }),
      });

      if (!res.ok) {
        const details = await res.text();
        return {
          statusCode: 500,
          headers,
          body: JSON.stringify({ error: "Falha ao enviar e-mail via SendGrid", details }),
        };
      }
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        ok: true,
        message: `Robô de E-mail acionado com sucesso para ${recipients.join(', ')}`,
        sentTo: recipients,
        sendgridActive: Boolean(apiKey),
        data: {
          alertPlate,
          daysStopped,
          model,
          base,
          driver,
          status,
          reason,
          observations,
          formattedTime
        }
      }),
    };
  } catch (e) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: "Erro interno no robô Netlify", details: String(e) }),
    };
  }
}

function escapeHtml(str) {
  return String(str)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
