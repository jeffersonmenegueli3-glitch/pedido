/**
 * Gmail REST API utility to send real emails directly using Google OAuth Access Token
 */

function encodeUTF8Base64URL(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binaryStr = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryStr += String.fromCharCode(utf8Bytes[i]);
  }
  const base64 = btoa(binaryStr);
  return base64
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
}

function encodeUTF8Base64(str: string): string {
  const utf8Bytes = new TextEncoder().encode(str);
  let binaryStr = '';
  for (let i = 0; i < utf8Bytes.length; i++) {
    binaryStr += String.fromCharCode(utf8Bytes[i]);
  }
  return btoa(binaryStr);
}

/**
 * Sends an email directly via the official Gmail API
 */
export async function sendEmailViaGmailAPI({
  accessToken,
  to,
  subject,
  body,
  fromEmail
}: {
  accessToken: string;
  to: string;
  subject: string;
  body: string;
  fromEmail?: string;
}) {
  if (!accessToken) {
    throw new Error('Token de acesso do Gmail não encontrado. Por favor, conecte sua conta Google.');
  }

  // Clean recipients list
  const cleanTo = to
    .split(',')
    .map(addr => addr.trim())
    .filter(Boolean)
    .join(', ');

  // Format plain text body into structured HTML container
  const formattedBody = body.includes('<html') || body.includes('<div') || body.includes('<p')
    ? body
    : `
      <div style="font-family: 'Segoe UI', Helvetica, Arial, sans-serif; font-size: 14px; color: #0f172a; line-height: 1.6; max-width: 650px; padding: 24px; border: 1px solid #cbd5e1; border-radius: 12px; background-color: #ffffff; box-shadow: 0 4px 12px rgba(0,0,0,0.05);">
        ${body
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/\*(.*?)\*/g, '<strong>$1</strong>')
          .replace(/_(.*?)_/g, '<em>$1</em>')
          .replace(/\n/g, '<br/>')}
      </div>
    `;

  const safeSubjectBase64 = encodeUTF8Base64(subject);

  const headers = [
    fromEmail ? `From: ${fromEmail}` : null,
    `To: ${cleanTo}`,
    `Subject: =?utf-8?B?${safeSubjectBase64}?=`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8'
  ].filter(Boolean).join('\r\n');

  // CRITICAL: Double \r\n\r\n separates MIME headers from the body payload
  const rawEmail = `${headers}\r\n\r\n${formattedBody}`;

  const rawBase64 = encodeUTF8Base64URL(rawEmail);

  const response = await fetch('https://gmail.googleapis.com/gmail/v1/users/me/messages/send', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${accessToken}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ raw: rawBase64 })
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.error?.message || `Erro HTTP ${response.status} ao disparar via Gmail.`;
    throw new Error(message);
  }

  return await response.json();
}

