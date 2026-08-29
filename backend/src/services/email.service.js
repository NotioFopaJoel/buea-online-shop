const env = require('../config/environment');

let transporter = null;

/**
 * Lazy-initialised Nodemailer SMTP transport.
 * Returns null when EMAIL_* credentials are not configured (v1 fallback: log only).
 */
function getTransporter() {
  if (transporter) return transporter;
  if (!env.EMAIL_HOST || !env.EMAIL_USER || !env.EMAIL_PASSWORD) {
    return null;
  }
  // eslint-disable-next-line global-require
  const nodemailer = require('nodemailer');
  transporter = nodemailer.createTransport({
    host: env.EMAIL_HOST,
    port: parseInt(env.EMAIL_PORT, 10) || 587,
    secure: parseInt(env.EMAIL_PORT, 10) === 465,
    auth: { user: env.EMAIL_USER, pass: env.EMAIL_PASSWORD },
  });
  return transporter;
}

function brandBaseUrl() {
  return (env.CLIENT_URL || 'http://localhost:5173').split(',')[0].trim();
}

/**
 * Generic send helper. Always resolves (never throws) so the caller's flow
 * (e.g. registration) is never blocked by email delivery.
 */
async function sendEmail({ to, subject, html, text }) {
  const tr = getTransporter();
  if (!tr) {
    console.log(`[email.service] (not configured) Would send to ${to}: "${subject}"`);
    return { sent: false, reason: 'Email not configured' };
  }

  const fromName = 'BUEA Online Shop';
  const fromAddr = env.EMAIL_USER;
  try {
    await tr.sendMail({
      from: `"${fromName}" <${fromAddr}>`,
      to,
      subject,
      html,
      text: text || 'Please enable HTML to view this message.',
    });
    return { sent: true };
  } catch (error) {
    console.error(`[email.service] Failed to send to ${to}:`, error.message);
    return { sent: false, reason: error.message };
  }
}

// ---------------------------------------------------------------------------
// Brand email shell (email-client-friendly tables, inline styles only)
// ---------------------------------------------------------------------------

function wrap({ lang, content }) {
  const site = brandBaseUrl();
  const logoUrl = `${site}/icons/icon-192.png`;
  const strings = {
    en: {
      shopNow: 'Shop Now',
      browse: 'Browse the latest arrivals and shop everything, delivered in Buea.',
      help: 'Need help? Reply to this email and our team will get back to you.',
      footer1: 'BUEA ONLINE SHOP — Shop Everything. Delivered in Buea, Cameroon.',
      footer2: 'Local commerce • Fast delivery • Pay after delivery',
      rights: 'All rights reserved.',
    },
    fr: {
      shopNow: 'Acheter maintenant',
      browse: 'Découvrez les dernières nouveautés et achetez tout, livré à Buea.',
      help: 'Besoin d’aide ? Répondez à cet e-mail et notre équipe vous répondra.',
      footer1: 'BUEA ONLINE SHOP — Achetez tout. Livré à Buea, Cameroun.',
      footer2: 'Commerce local • Livraison rapide • Paiement à la livraison',
      rights: 'Tous droits réservés.',
    },
  };
  const t = strings[lang] || strings.en;

  return `<!DOCTYPE html>
<html lang="${lang}">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
</head>
<body style="margin:0;padding:0;background-color:#F2F5FC;font-family:Arial,'Helvetica Neue',Helvetica,sans-serif;">
  <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color:#F2F5FC;padding:24px 12px;">
    <tr>
      <td align="center">
        <table role="presentation" width="600" cellpadding="0" cellspacing="0" style="max-width:600px;width:100%;background-color:#FFFFFF;border-radius:16px;overflow:hidden;box-shadow:0 8px 30px rgba(7,31,85,0.10);">
          <!-- Header / brand bar -->
          <tr>
            <td style="background:linear-gradient(135deg,#071F55,#0B3FA8 55%,#168BFF);padding:28px 32px;text-align:center;">
              <img src="${logoUrl}" alt="BUEA Online Shop" width="72" height="72" style="width:72px;height:72px;border-radius:14px;display:inline-block;border:0;" />
              <div style="font-size:30px;font-weight:900;color:#FFFFFF;letter-spacing:2px;margin-top:10px;">BUEA</div>
              <div style="font-size:13px;font-weight:800;color:#FF9D00;letter-spacing:8px;margin-top:4px;">ONLINE&nbsp;SHOP</div>
              <div style="font-size:10px;color:#C7D3F0;letter-spacing:3px;margin-top:10px;">SHOP LOCAL, DELIVERING THE BEST</div>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding:36px 40px;">
              ${content}
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td style="background-color:#F7F9FC;padding:24px 32px;text-align:center;border-top:1px solid #E4E9F2;">
              <div style="font-size:12px;color:#3A4A78;letter-spacing:1px;font-weight:700;">BUEA ONLINE SHOP</div>
              <div style="font-size:12px;color:#5A6A8C;margin-top:6px;">${t.footer1}</div>
              <div style="font-size:11px;color:#8A97B5;margin-top:4px;">${t.footer2}</div>
              <div style="font-size:11px;color:#8A97B5;margin-top:10px;">© <span>${new Date().getFullYear()}</span> BUEA ONLINE SHOP. ${t.rights}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ---------------------------------------------------------------------------
// Welcome email
// ---------------------------------------------------------------------------

async function sendWelcomeEmail(user, lang = 'en') {
  const first = ((user.name || '').split(' ')[0]) || 'there';
  const site = brandBaseUrl();

  const strings = {
    en: {
      subject: 'Welcome to BUEA ONLINE SHOP 🎉',
      hi: `Hi ${first},`,
      intro: 'Welcome aboard! Your account is now active. We’re thrilled to have you join the BUEA community.',
      perksTitle: 'Here’s what you can do right away:',
      perks: [
        ['🛍️ Shop everything', 'Clothing, electronics, jewelry, home decor and more — all in one place.'],
        ['🚚 Fast local delivery', 'We deliver right across Buea, quickly and reliably.'],
        ['💰 Pay after delivery', 'MTN Mobile Money or Orange Money — pay only when your order arrives.'],
        ['🎁 Refer & earn', 'Invite friends and earn shop credit every time they shop.'],
      ],
      cta: 'Start Shopping',
      help: 'If you have any questions, just reply to this email — we’re here 7 days a week.',
      thanks: 'Can’t wait to shop with you!',
    },
    fr: {
      subject: 'Bienvenue sur BUEA ONLINE SHOP 🎉',
      hi: `Bonjour ${first},`,
      intro: 'Bienvenue à bord ! Votre compte est désormais actif. Nous sommes ravis de vous compter dans la communauté BUEA.',
      perksTitle: 'Voici ce que vous pouvez faire dès maintenant :',
      perks: [
        ['🛍️ Achetez tout', 'Vêtements, électronique, bijoux, décoration et plus — au même endroit.'],
        ['🚚 Livraison locale rapide', 'Nous livrons partout à Buea, rapidement et en toute fiabilité.'],
        ['💰 Paiement à la livraison', 'MTN Mobile Money ou Orange Money — payez à la réception de votre commande.'],
        ['🎁 Parrainez & gagnez', 'Invitez vos amis et gagnez du crédit boutique à chaque commande.'],
      ],
      cta: 'Commencer les achats',
      help: 'Si vous avez une question, répondez simplement à cet e-mail — nous sommes là 7 jours sur 7.',
      thanks: 'Au plaisir de faire vos achats avec vous !',
    },
  };
  const t = strings[lang] || strings.en;

  const perksHtml = t.perks
    .map(
      ([icon, title], i) => `
      <tr>
        <td style="padding:10px 0;border-bottom:${i === t.perks.length - 1 ? 'none' : '1px solid #E4E9F2'};">
          <table role="presentation" cellpadding="0" cellspacing="0">
            <tr>
              <td style="width:44px;vertical-align:top;font-size:24px;">${icon}</td>
              <td style="vertical-align:top;">
                <div style="font-size:14px;font-weight:700;color:#0A1230;">${title}</div>
                <div style="font-size:13px;color:#5A6A8C;margin-top:2px;line-height:1.5;">${t.perks[i][1]}</div>
              </td>
            </tr>
          </table>
        </td>
      </tr>`
    )
    .join('');

  const content = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#0A1230;font-weight:800;">${t.subject.replace(' 🎉', '')}</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#3A4A78;line-height:1.6;">${t.hi}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3A4A78;line-height:1.6;">${t.intro}</p>

    <p style="margin:0 0 12px;font-size:14px;font-weight:800;color:#0A1230;">${t.perksTitle}</p>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
      ${perksHtml}
    </table>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:10px;background:linear-gradient(90deg,#0B3FA8,#168BFF);">
          <a href="${site}" style="display:inline-block;padding:14px 40px;font-size:15px;font-weight:800;color:#FFFFFF;text-decoration:none;border-radius:10px;">${t.cta}</a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#8A97B5;line-height:1.6;">${t.help}</p>
    <p style="margin:0;font-size:14px;color:#0A1230;font-weight:700;">${t.thanks}</p>
  `;

  return sendEmail({
    to: user.email,
    subject: t.subject,
    html: wrap({ lang, content }),
    text: `${t.hi}\n\n${t.intro}\n\n${t.perksTitle}\n- ${t.perks[0][0]}\n- ${t.perks[1][0]}\n- ${t.perks[2][0]}\n- ${t.perks[3][0]}\n\n${t.cta}: ${site}`,
  });
}

// ---------------------------------------------------------------------------
// Password reset email
// ---------------------------------------------------------------------------

async function sendPasswordResetEmail(user, resetLink, lang = 'en') {
  const first = ((user.name || '').split(' ')[0]) || 'there';
  const site = brandBaseUrl();
  const expiresInMinutes = 60;

  const strings = {
    en: {
      subject: 'Reset your BUEA ONLINE SHOP password',
      hi: `Hi ${first},`,
      intro: 'We received a request to reset the password for your BUEA ONLINE SHOP account. Click the button below to choose a new one.',
      button: 'Reset Password',
      note: `This link is valid for ${expiresInMinutes} minute(s) and can only be used once.`,
      ignore: 'If you didn’t request this, you can safely ignore this email — your password won’t be changed.',
      help: 'Need help? Reply to this email and our team will assist you.',
    },
    fr: {
      subject: 'Réinitialisez votre mot de passe BUEA ONLINE SHOP',
      hi: `Bonjour ${first},`,
      intro: 'Nous avons reçu une demande de réinitialisation du mot de passe de votre compte BUEA ONLINE SHOP. Cliquez sur le bouton ci-dessous pour en choisir un nouveau.',
      button: 'Réinitialiser le mot de passe',
      note: `Ce lien est valable ${expiresInMinutes} minute(s) et ne peut être utilisé qu’une seule fois.`,
      ignore: 'Si vous n’êtes pas à l’origine de cette demande, vous pouvez ignorer cet e-mail en toute sécurité — votre mot de passe ne sera pas modifié.',
      help: 'Besoin d’aide ? Répondez à cet e-mail et notre équipe vous aidera.',
    },
  };
  const t = strings[lang] || strings.en;

  const content = `
    <h1 style="margin:0 0 12px;font-size:22px;color:#0A1230;font-weight:800;">${t.subject.replace(/Reset your /i, '').replace(/Réinitialisez votre /i, '')}</h1>
    <p style="margin:0 0 16px;font-size:15px;color:#3A4A78;line-height:1.6;">${t.hi}</p>
    <p style="margin:0 0 24px;font-size:15px;color:#3A4A78;line-height:1.6;">${t.intro}</p>

    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 24px;">
      <tr>
        <td align="center" style="border-radius:10px;background:linear-gradient(90deg,#FF7A00,#FF9D00);">
          <a href="${resetLink}" style="display:inline-block;padding:14px 40px;font-size:15px;font-weight:800;color:#FFFFFF;text-decoration:none;border-radius:10px;">${t.button}</a>
        </td>
      </tr>
    </table>

    <p style="margin:0 0 8px;font-size:13px;color:#8A97B5;line-height:1.6;">${t.note}</p>
    <p style="margin:0 0 16px;font-size:13px;color:#8A97B5;line-height:1.6;">${t.ignore}</p>
    <hr style="border:none;border-top:1px solid #E4E9F2;margin:20px 0;" />
    <p style="margin:0;font-size:13px;color:#8A97B5;line-height:1.6;">${t.help}</p>
  `;

  return sendEmail({
    to: user.email,
    subject: t.subject,
    html: wrap({ lang, content }),
    text: `${t.hi}\n\n${t.intro}\n\n${t.button}: ${resetLink}\n\n${t.note}\n${t.ignore}`,
  });
}

module.exports = { sendEmail, sendWelcomeEmail, sendPasswordResetEmail };
