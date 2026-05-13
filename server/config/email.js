import { Resend } from 'resend';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar Resend
const resend = new Resend(process.env.RESEND_API_KEY);

// Função para enviar email de recuperação de senha
export const sendPasswordResetEmail = async (to, name, resetLink) => {
  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM || 'testsmm <onboarding@resend.dev>',
      to: [to],
      subject: '🔐 Recuperação de Senha - testsmm',
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <style>
            body {
              font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
              line-height: 1.6;
              color: #333;
              margin: 0;
              padding: 0;
              background-color: #f5f5f5;
            }
            .email-wrapper {
              max-width: 600px;
              margin: 0 auto;
              padding: 20px;
            }
            .container {
              background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
              border-radius: 16px;
              padding: 40px 30px;
              text-align: center;
              box-shadow: 0 10px 40px rgba(0, 0, 0, 0.1);
            }
            .logo {
              font-size: 48px;
              margin-bottom: 10px;
            }
            h1 {
              color: white;
              margin: 0 0 10px 0;
              font-size: 28px;
              font-weight: 700;
            }
            .subtitle {
              color: rgba(255, 255, 255, 0.95);
              margin: 0 0 30px 0;
              font-size: 16px;
            }
            .content {
              background: white;
              border-radius: 12px;
              padding: 35px 30px;
              margin-top: 20px;
              text-align: left;
            }
            .greeting {
              font-size: 20px;
              margin-bottom: 20px;
              color: #1f2937;
            }
            .message {
              color: #4b5563;
              font-size: 16px;
              line-height: 1.6;
              margin-bottom: 25px;
            }
            .button-wrapper {
              text-align: center;
              margin: 30px 0;
            }
            .button {
              display: inline-block;
              background: #842bd8;
              color: white !important;
              text-decoration: none;
              padding: 16px 40px;
              border-radius: 10px;
              font-weight: 700;
              font-size: 16px;
              box-shadow: 0 4px 15px rgba(132, 43, 216, 0.3);
              transition: all 0.3s ease;
            }
            .button:hover {
              background: #6c1fae;
              box-shadow: 0 6px 20px rgba(132, 43, 216, 0.4);
            }
            .info-box {
              background: #fef3c7;
              border-left: 4px solid #f59e0b;
              padding: 16px;
              margin: 25px 0;
              border-radius: 6px;
            }
            .info-box strong {
              color: #92400e;
              display: block;
              margin-bottom: 5px;
            }
            .info-box p {
              color: #78350f;
              margin: 0;
              font-size: 14px;
            }
            .link-box {
              background: #f3f4f6;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
              word-break: break-all;
            }
            .link-box p {
              margin: 0 0 8px 0;
              font-size: 13px;
              color: #6b7280;
            }
            .link-box a {
              color: #842bd8;
              font-size: 12px;
              text-decoration: none;
            }
            .warning {
              background: #fee2e2;
              border-left: 4px solid #dc2626;
              padding: 16px;
              margin: 25px 0;
              border-radius: 6px;
            }
            .warning p {
              color: #991b1b;
              margin: 0;
              font-size: 14px;
            }
            .footer {
              text-align: center;
              color: rgba(255, 255, 255, 0.85);
              font-size: 14px;
              margin-top: 25px;
              padding-top: 20px;
              border-top: 1px solid rgba(255, 255, 255, 0.2);
            }
            .footer a {
              color: white;
              text-decoration: none;
            }
          </style>
        </head>
        <body>
          <div class="email-wrapper">
            <div class="container">
              <div class="logo">🔐</div>
              <h1>Recuperação de Senha</h1>
              <p class="subtitle">testsmm - Painel SMM</p>
              
              <div class="content">
                <p class="greeting">Olá, <strong>${name}</strong>! 👋</p>
                
                <p class="message">
                  Recebemos uma solicitação para redefinir a senha da sua conta no <strong>testsmm</strong>.
                </p>
                
                <p class="message">
                  Para criar uma nova senha, clique no botão abaixo:
                </p>
                
                <div class="button-wrapper">
                  <a href="${resetLink}" class="button">
                    🔓 Redefinir Minha Senha
                  </a>
                </div>
                
                <div class="info-box">
                  <strong>⏰ Atenção:</strong>
                  <p>Este link é válido por apenas <strong>1 hora</strong> por motivos de segurança.</p>
                </div>
                
                <div class="link-box">
                  <p><strong>O botão não está funcionando?</strong></p>
                  <p>Copie e cole este link no seu navegador:</p>
                  <a href="${resetLink}">${resetLink}</a>
                </div>
                
                <div class="warning">
                  <p>
                    <strong>⚠️ Não solicitou esta recuperação?</strong><br>
                    Ignore este email. Sua senha permanecerá segura e nenhuma alteração será feita.
                  </p>
                </div>
              </div>
              
              <div class="footer">
                <p>© ${new Date().getFullYear()} testsmm - Todos os direitos reservados</p>
                <p style="margin-top: 10px; font-size: 12px;">
                  Este é um email automático, por favor não responda.
                </p>
              </div>
            </div>
          </div>
        </body>
        </html>
      `,
      text: `
Recuperação de Senha - testsmm

Olá, ${name}!

Você solicitou a recuperação de senha da sua conta no testsmm.

Clique no link abaixo para redefinir sua senha:
${resetLink}

⏰ Este link expira em 1 hora por motivos de segurança.

⚠️ Se você não solicitou esta recuperação, ignore este email. Sua senha permanecerá segura.

© ${new Date().getFullYear()} testsmm - Todos os direitos reservados
      `,
    });

    if (error) {
      throw error;
    }

    return { success: true, messageId: data.id };
  } catch (error) {
    throw error;
  }
};

export default resend;
