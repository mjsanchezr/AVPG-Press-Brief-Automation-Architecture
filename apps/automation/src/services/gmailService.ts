import { google } from 'googleapis';
import { BriefPayload, GoogleApiCredentials, DistributionConfig } from '../../../../shared/types';

export async function sendBriefEmailDynamically(payload: BriefPayload, auth: GoogleApiCredentials, config: DistributionConfig): Promise<boolean> {
  try {
    const oauth2Client = new google.auth.OAuth2(
      auth.clientId,
      auth.clientSecret
    );

    oauth2Client.setCredentials({
      refresh_token: auth.refreshToken
    });

    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

    // Format highly clean high-density HTML email layout
    const htmlBody = `
      <div style="font-family: 'Inter', Helvetica, Arial, sans-serif; background-color: #f8f9fa; padding: 20px; color: #111827; line-height: 1.6;">
        <div style="max-width: 600px; margin: 0 auto; background-color: #ffffff; padding: 30px; border-radius: 8px; box-shadow: 0 4px 6px rgba(0,0,0,0.05);">
          <h1 style="font-size: 20px; font-weight: 700; border-bottom: 2px solid #e5e7eb; padding-bottom: 10px; margin-bottom: 20px;">
            ${payload.titleBlock}
          </h1>
          
          <p style="font-size: 14px; font-weight: 500; color: #4b5563; margin-bottom: 30px;">
            ${payload.titularDelDia}
          </p>

          <h2 style="font-size: 16px; font-weight: 600; color: #b91c1c; text-transform: uppercase; margin-bottom: 12px;">Oil & Gas (Critical)</h2>
          <ul style="list-style-type: none; padding-left: 0; margin-bottom: 24px;">
            ${payload.oilGas.map(item => `
              <li style="margin-bottom: 8px; font-size: 14px;">
                <a href="${item.url}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${item.text}</a>
                ${item.patternDetected ? `<br><span style="font-size: 12px; color: #059669;">${item.patternDetected}</span>` : ''}
              </li>
            `).join('')}
          </ul>

          <h2 style="font-size: 16px; font-weight: 600; color: #0f766e; text-transform: uppercase; margin-bottom: 12px;">Economía e Inversión</h2>
          <ul style="list-style-type: none; padding-left: 0; margin-bottom: 24px;">
            ${payload.economiaInversion.map(item => `
              <li style="margin-bottom: 8px; font-size: 14px;">
                <a href="${item.url}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${item.text}</a>
                ${item.patternDetected ? `<br><span style="font-size: 12px; color: #059669;">${item.patternDetected}</span>` : ''}
              </li>
            `).join('')}
          </ul>

          <h2 style="font-size: 16px; font-weight: 600; color: #4338ca; text-transform: uppercase; margin-bottom: 12px;">Contexto Internacional</h2>
          <ul style="list-style-type: none; padding-left: 0; margin-bottom: 24px;">
            ${payload.contextoInternacional.map(item => `
              <li style="margin-bottom: 8px; font-size: 14px;">
                <a href="${item.url}" style="color: #2563eb; text-decoration: none; font-weight: 500;">${item.text}</a>
              </li>
            `).join('')}
          </ul>

          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 12px 16px; margin-top: 30px;">
            <h2 style="font-size: 14px; font-weight: 600; color: #92400e; margin-top: 0; margin-bottom: 8px; text-transform: uppercase;">Para Tener en Cuenta</h2>
            <ul style="margin: 0; padding-left: 16px; font-size: 13px; color: #92400e;">
              ${payload.paraTenerEnCuenta.map(item => `<li>${item}</li>`).join('')}
            </ul>
          </div>
        </div>
      </div>
    `;

    const messageParts = [
      `To: ${config.recipientEmail}`,
      'Content-Type: text/html; charset=utf-8',
      'MIME-Version: 1.0',
      `Subject: =?utf-8?B?${Buffer.from(payload.titleBlock).toString('base64')}?=`,
      '',
      htmlBody,
    ];
    
    const message = messageParts.join('\n');
    const encodedMessage = Buffer.from(message).toString('base64url');

    await gmail.users.messages.send({
      userId: 'me',
      requestBody: { raw: encodedMessage },
    });

    return true;
  } catch (error) {
    console.error("Gmail Dispatch Error:", error);
    throw error;
  }
}
