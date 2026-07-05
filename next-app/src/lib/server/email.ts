import nodemailer from "nodemailer";
import type SMTPTransport from "nodemailer/lib/smtp-transport";

export interface ResetPasswordEmailParams {
    to: string;
    name: string;
    resetUrl: string;
}

interface MailConfig {
    transporter: nodemailer.Transporter;
    from: string;
    replyTo?: string;
}

function normalizeEmailAddress(value: string): string {
    return value.trim().toLowerCase();
}

function sanitizeHeaderValue(value: string): string {
    return value.replaceAll(/[\r\n]/g, " ").trim();
}

function escapeHtml(value: string): string {
    return value
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#39;");
}

function normalizeName(name: string): string {
    const cleanName = sanitizeHeaderValue(name);
    return cleanName.length > 0 ? cleanName : "jogador";
}

function normalizeAbsoluteUrl(url: string): string {
    const sanitized = sanitizeHeaderValue(url);
    const parsedUrl = new URL(sanitized);

    if (parsedUrl.protocol !== "https:" && parsedUrl.protocol !== "http:") {
        throw new Error("URL de e-mail inválida. Use apenas links http/https.");
    }

    return parsedUrl.toString();
}

function createTransport(): MailConfig {
    const host = process.env.RESEND_SMTP_HOST || process.env.SMTP_HOST;
    const portStr = process.env.RESEND_SMTP_PORT ?? process.env.SMTP_PORT;
    const port = portStr ? Number.parseInt(portStr, 10) : 465;
    const user = process.env.RESEND_SMTP_USER || process.env.SMTP_USER;
    const pass = process.env.RESEND_SMTP_PASS || process.env.SMTP_PASS;
    const from = process.env.RESEND_SMTP_FROM_EMAIL || process.env.SMTP_FROM;
    const replyToValue = process.env.RESEND_SMTP_REPLY_TO || process.env.SMTP_REPLY_TO;

    if (!host || !user || !pass || !from) {
        throw new Error(
            "SMTP não configurado. Defina RESEND_SMTP_* ou SMTP_* (HOST, USER, PASS, FROM).",
        );
    }

    const transporter = nodemailer.createTransport({
        host,
        port,
        secure: port === 465,
        auth: { user, pass },
        pool: false,
    } as SMTPTransport.Options);

    return {
        transporter,
        from: sanitizeHeaderValue(from),
        replyTo: replyToValue ? sanitizeHeaderValue(replyToValue) : undefined,
    };
}

function buildTransactionalHeaders(): Record<string, string> {
    const unsubscribeMail =
        process.env.RESEND_LIST_UNSUBSCRIBE_EMAIL || process.env.SMTP_LIST_UNSUBSCRIBE_EMAIL;

    const headers: Record<string, string> = {
        "X-Auto-Response-Suppress": "OOF, AutoReply",
        "Auto-Submitted": "auto-generated",
    };

    if (unsubscribeMail) {
        const normalizedUnsubscribeMail = normalizeEmailAddress(unsubscribeMail);
        headers["List-Unsubscribe"] = `<mailto:${normalizedUnsubscribeMail}>`;
        headers["List-Unsubscribe-Post"] = "List-Unsubscribe=One-Click";
    }

    return headers;
}

function buildResetPasswordEmailHtml(params: { name: string; resetUrl: string }): string {
    const firstName = normalizeName(params.name).split(" ")[0] || "jogador";
    const safeFirstName = escapeHtml(firstName);
    const safeResetUrl = escapeHtml(params.resetUrl);
    const year = new Date().getFullYear();

    return `<!DOCTYPE html>
<html lang="pt-BR">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>Redefinição de senha - CodeQuest</title>
</head>
<body style="margin:0;padding:0;background-color:#07070f;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#07070f;padding:48px 16px;">
    <tr>
      <td align="center">
        <table role="presentation" width="100%" style="max-width:560px;">
          <tr>
            <td style="padding-bottom:24px;text-align:center;">
              <span style="font-weight:700;font-size:22px;color:#fff6e9;letter-spacing:0.08em;">CODE<span style="color:#9d4edd;">QUEST</span></span>
            </td>
          </tr>
          <tr>
            <td style="background-color:#111827;border:1px solid rgba(157,78,221,0.35);border-radius:16px;padding:40px 36px;">
              <h1 style="margin:0 0 6px;font-size:22px;font-weight:700;color:#fff6e9;line-height:1.3;">
                Redefinição de senha
              </h1>
              <p style="margin:0 0 20px;font-size:14px;color:#c4b5fd;line-height:1.7;">
                Olá, ${safeFirstName}. Recebemos uma solicitação para redefinir a senha da sua conta no CodeQuest.
              </p>

              <a href="${safeResetUrl}" style="display:block;text-align:center;background-color:#9d4edd;color:#ffffff;text-decoration:none;padding:14px 24px;border-radius:10px;font-size:14px;font-weight:600;letter-spacing:0.01em;box-shadow:0 4px 14px rgba(157,78,221,0.35);">
                Redefinir minha senha
              </a>

              <p style="margin:20px 0 0;font-size:12px;color:#a78bfa;line-height:1.6;">
                Este link expira automaticamente em 30 minutos por segurança.
                Se você não solicitou esta redefinição, ignore este e-mail.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding-top:28px;text-align:center;">
              <p style="margin:0;font-size:12px;color:#6b7280;">© ${year} CodeQuest. Todos os direitos reservados.</p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

function buildResetPasswordEmailText(params: { name: string; resetUrl: string }): string {
    const firstName = normalizeName(params.name).split(" ")[0] || "jogador";

    return [
        `Olá, ${firstName}.`,
        "",
        "Recebemos uma solicitação para redefinir sua senha no CodeQuest.",
        "",
        `Use este link para continuar: ${params.resetUrl}`,
        "",
        "Este link expira em 30 minutos.",
        "Se você não solicitou esta redefinição, ignore este e-mail.",
    ].join("\n");
}

export async function sendResetPasswordEmail(params: ResetPasswordEmailParams): Promise<void> {
    const { transporter, from, replyTo } = createTransport();
    const normalizedRecipient = normalizeEmailAddress(params.to);
    const normalizedResetUrl = normalizeAbsoluteUrl(params.resetUrl);

    const html = buildResetPasswordEmailHtml({
        name: params.name,
        resetUrl: normalizedResetUrl,
    });
    const text = buildResetPasswordEmailText({
        name: params.name,
        resetUrl: normalizedResetUrl,
    });

    await transporter.sendMail({
        from,
        to: normalizedRecipient,
        replyTo,
        subject: "Redefina sua senha no CodeQuest",
        html,
        text,
        headers: buildTransactionalHeaders(),
    });
}
