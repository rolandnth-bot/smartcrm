/**
 * Email service.
 * Támogatott szolgáltatók: SendGrid, Resend (opcionális, env változókon keresztül).
 * Ha nincs beállítva, placeholder módban mködik (csak logolás).
 */

const SENDGRID_API_KEY = import.meta.env.VITE_SENDGRID_API_KEY;
const RESEND_API_KEY = import.meta.env.VITE_RESEND_API_KEY;
const EMAIL_FROM = import.meta.env.VITE_EMAIL_FROM || 'registration@rackhost.hu';
const RACKHOST_SMTP_USER = import.meta.env.VITE_RACKHOST_SMTP_USER || 'registration@rackhost.hu';
const RACKHOST_SMTP_PASS = import.meta.env.VITE_RACKHOST_SMTP_PASS || 'Smartregistration';
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '';

/**
 * Ellenrzi, hogy van-e beállítva email szolgáltató.
 */
export function isEmailConfigured() {
  // Rackhost SMTP mindig elérhet (default értékekkel), ha van API_BASE_URL vagy window.location.origin
  const hasApiUrl = API_BASE_URL || (typeof window !== 'undefined' && window.location.origin);
  return !!(SENDGRID_API_KEY || RESEND_API_KEY || (hasApiUrl && RACKHOST_SMTP_USER && RACKHOST_SMTP_PASS));
}

/**
 * Egyetlen email küldése.
 * Prioritás: SendGrid > Resend > Placeholder
 * @param {{ to: string | string[], subject: string, body: string, html?: string }} opts
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendEmail({ to, subject, body, html }) {
  const recipients = Array.isArray(to) ? to : [to];
  
  // Rackhost SMTP (backend API-n keresztül) - prioritás
  const hasApiUrl = API_BASE_URL || (typeof window !== 'undefined' && window.location.origin);
  if (hasApiUrl && RACKHOST_SMTP_USER && RACKHOST_SMTP_PASS) {
    try {
      return await sendViaRackhostSMTP({ to: recipients, subject, body, html });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[emailService] Rackhost SMTP error:', error);
      }
      // Fallback más szolgáltatókra
    }
  }
  
  // SendGrid integráció (ha be van állítva)
  if (SENDGRID_API_KEY) {
    try {
      return await sendViaSendGrid({ to: recipients, subject, body, html });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[emailService] SendGrid error:', error);
      }
      return { success: false, error: error.message };
    }
  }
  
  // Resend integráció (ha be van állítva)
  if (RESEND_API_KEY) {
    try {
      return await sendViaResend({ to: recipients, subject, body, html });
    } catch (error) {
      if (import.meta.env.DEV) {
        console.error('[emailService] Resend error:', error);
      }
      return { success: false, error: error.message };
    }
  }
  
  // Placeholder: log és sikeres válasz
  if (import.meta.env?.DEV) {
    console.debug('[emailService] sendEmail (placeholder)', { 
      to: recipients, 
      subject, 
      body: body?.slice(0, 80) 
    });
  }
  return Promise.resolve({
    success: true,
    messageId: `placeholder-${Date.now()}`
  });
}

/**
 * Rackhost SMTP integráció (backend API-n keresztül).
 */
async function sendViaRackhostSMTP({ to, subject, body, html }) {
  try {
    // API URL összeállítása
    let apiUrl = API_BASE_URL;
    if (!apiUrl) {
      apiUrl = window.location.origin;
    }
    // Ha nincs /api az URL-ben, hozzáadjuk
    if (!apiUrl.includes('/api')) {
      apiUrl = apiUrl.endsWith('/') ? apiUrl + 'api' : apiUrl + '/api';
    }
    
    const response = await fetch(`${apiUrl}/email/send`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      credentials: 'include',
      body: JSON.stringify({
        to: to.length === 1 ? to[0] : to,
        subject,
        body,
        html: html || body,
        from: EMAIL_FROM,
        smtp: {
          user: RACKHOST_SMTP_USER,
          password: RACKHOST_SMTP_PASS,
          host: 'mail.rackhost.hu',
          port: 587,
          secure: false // TLS
        }
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `Rackhost SMTP error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.error || errorData.message || errorMessage;
      } catch {
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const data = await response.json();
    return { success: true, messageId: data.messageId || `rackhost-${Date.now()}` };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[emailService] Rackhost SMTP error:', error);
    }
    throw error;
  }
}

/**
 * SendGrid integráció.
 */
async function sendViaSendGrid({ to, subject, body, html }) {
  try {
    const response = await fetch('https://api.sendgrid.com/v3/mail/send', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SENDGRID_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        personalizations: [{ to: to.map(email => ({ email })) }],
        from: { email: EMAIL_FROM },
        subject,
        content: [
          { type: 'text/plain', value: body },
          ...(html ? [{ type: 'text/html', value: html }] : [])
        ]
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      let errorMessage = `SendGrid error: ${response.status} ${response.statusText}`;
      try {
        const errorData = JSON.parse(errorText);
        errorMessage = errorData.errors?.[0]?.message || errorMessage;
      } catch {
        // Ha nem JSON, használjuk a szöveget
        if (errorText) errorMessage = errorText;
      }
      throw new Error(errorMessage);
    }

    const messageId = response.headers.get('X-Message-Id') || `sendgrid-${Date.now()}`;
    return { success: true, messageId };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[emailService] SendGrid error:', error);
    }
    throw error;
  }
}

/**
 * Resend integráció.
 */
async function sendViaResend({ to, subject, body, html }) {
  try {
    const response = await fetch('https://api.resend.com/emails', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${RESEND_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        from: EMAIL_FROM,
        to: to.length === 1 ? to[0] : to, // Resend támogatja a tömböt is
        subject,
        text: body,
        html: html || body
      })
    });

    const data = await response.json();

    if (!response.ok) {
      const errorMessage = data.message || data.error?.message || `Resend error: ${response.status} ${response.statusText}`;
      throw new Error(errorMessage);
    }

    return { success: true, messageId: data.id || `resend-${Date.now()}` };
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error('[emailService] Resend error:', error);
    }
    throw error;
  }
}

/**
 * Tömörített email küldése több címzettnek.
 * @param {string[]} recipients
 * @param {string} subject
 * @param {string} body
 * @param {{ html?: string }} opts
 * @returns {Promise<{ success: boolean, sent: number, failed: number, errors?: string[] }>}
 */
export async function sendBulkEmails(recipients, subject, body, opts = {}) {
  if (!recipients || recipients.length === 0) {
    return { success: false, sent: 0, failed: 0, errors: ['No recipients provided'] };
  }
  
  const results = await Promise.allSettled(
    recipients.map(email => sendEmail({ to: email, subject, body, html: opts.html }))
  );
  
  const sent = results.filter(r => r.status === 'fulfilled' && r.value.success).length;
  const failed = results.length - sent;
  const errors = results
    .filter(r => r.status === 'rejected' || (r.status === 'fulfilled' && !r.value.success))
    .map(r => r.status === 'rejected' ? r.reason?.message : r.value?.error)
    .filter(Boolean);
  
  if (import.meta.env?.DEV) {
    console.debug('[emailService] sendBulkEmails', {
      total: recipients.length,
      sent,
      failed,
      errors: errors.length > 0 ? errors : undefined
    });
  }
  
  return {
    success: failed === 0,
    sent,
    failed,
    ...(errors.length > 0 && { errors })
  };
}

/**
 * Sablon alapú email (placeholder).
 * @param {string} templateKey - pl. 'lead-welcome', 'booking-confirmation'
 * @param {Record<string, string>} data - helyettesít adatok
 * @param {{ to: string, subject?: string }} opts
 * @returns {Promise<{ success: boolean, messageId?: string, error?: string }>}
 */
export async function sendTemplatedEmail(templateKey, data, { to, subject }) {
  // Sablonok (késbb bvíthet)
  const templates = {
    'lead-welcome': {
      subject: 'Üdvözöljük a SmartCRM-ben!',
      body: `Kedves ${data.name || 'Ügyfél'}!\n\nKöszönjük, hogy csatlakozott hozzánk.`,
      html: `<p>Kedves <strong>${data.name || 'Ügyfél'}</strong>!</p><p>Köszönjük, hogy csatlakozott hozzánk.</p>`
    },
    'booking-confirmation': {
      subject: 'Foglalás megersítése',
      body: `Kedves ${data.guestName || 'Vendég'}!\n\nFoglalásod megersítve: ${data.checkIn || ''} - ${data.checkOut || ''}`,
      html: `<p>Kedves <strong>${data.guestName || 'Vendég'}</strong>!</p><p>Foglalásod megersítve: <strong>${data.checkIn || ''} - ${data.checkOut || ''}</strong></p>`
    }
  };
  
  const template = templates[templateKey] || {
    subject: subject || 'Email a SmartCRM-bl',
    body: `Kedves ${data.name || 'Ügyfél'}!\n\n${JSON.stringify(data, null, 2)}`,
    html: `<p>Kedves <strong>${data.name || 'Ügyfél'}</strong>!</p><pre>${JSON.stringify(data, null, 2)}</pre>`
  };
  
  // Helyettesítés a sablonban
  let finalSubject = template.subject;
  let finalBody = template.body;
  let finalHtml = template.html;
  
  Object.entries(data || {}).forEach(([key, value]) => {
    const regex = new RegExp(`\\{\\{${key}\\}\\}`, 'g');
    finalSubject = finalSubject.replace(regex, String(value));
    finalBody = finalBody.replace(regex, String(value));
    finalHtml = finalHtml?.replace(regex, String(value));
  });
  
  if (import.meta.env?.DEV) {
    console.debug('[emailService] sendTemplatedEmail', { templateKey, to, subject: finalSubject });
  }
  
  return sendEmail({
    to,
    subject: finalSubject,
    body: finalBody,
    html: finalHtml
  });
}

