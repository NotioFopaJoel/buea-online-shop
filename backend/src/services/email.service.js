const env = require('../config/environment');

/**
 * Minimal email service. In v1, EMAIL_* env vars are optional - if they are
 * not set, this just logs instead of sending, so the app never crashes
 * checkout/registration because SMTP isn't configured yet.
 *
 * Swap the body of sendEmail() for nodemailer (or any provider) once
 * EMAIL_HOST/EMAIL_USER/EMAIL_PASSWORD are set in .env.
 */
async function sendEmail({ to, subject, text }) {
  if (!env.EMAIL_HOST || !env.EMAIL_USER) {
    console.log(`[email.service] (not configured) Would send to ${to}: "${subject}"`);
    return { sent: false, reason: 'Email not configured' };
  }

  // TODO: integrate nodemailer or a transactional email provider here.
  console.log(`[email.service] Sending email to ${to}: "${subject}"`);
  return { sent: true };
}

async function sendWelcomeEmail(user, lang = 'en') {
  const subject = lang === 'fr' ? 'Bienvenue chez BUEA ONLINE SHOP' : 'Welcome to BUEA ONLINE SHOP';
  const text = lang === 'fr'
    ? `Bonjour ${user.name}, merci de vous être inscrit sur BUEA ONLINE SHOP.`
    : `Hello ${user.name}, thank you for signing up on BUEA ONLINE SHOP.`;
  return sendEmail({ to: user.email, subject, text });
}

module.exports = { sendEmail, sendWelcomeEmail };
