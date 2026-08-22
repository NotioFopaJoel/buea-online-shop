const Settings = require('../models/Settings');
const env = require('../config/environment');

/**
 * Formats a number as FCFA, e.g. 18000 -> "18,000 FCFA"
 */
function formatFCFA(amount) {
  return `${Number(amount).toLocaleString('en-US')} FCFA`;
}

/**
 * Builds the pre-filled WhatsApp confirmation message from REAL order data.
 * Never hardcode order info - everything is pulled from the `order` document.
 *
 * @param {Object} order - a populated Order mongoose document (items.product populated with name)
 * @param {'en'|'fr'} lang
 */
function buildOrderMessage(order, lang = 'en') {
  const productLines = order.items
    .map((item) => `- ${item.name} x${item.quantity}`)
    .join('\n');

  const deliveryLabel = order.deliveryFee === 0
    ? (lang === 'fr' ? 'GRATUITE' : 'FREE')
    : formatFCFA(order.deliveryFee);

  const paymentLabel = order.paymentMethod === 'MTN_MOBILE_MONEY' ? 'MTN Mobile Money' : 'Orange Money';

  if (lang === 'fr') {
    return [
      `Bonjour BUEA ONLINE SHOP, je souhaite confirmer ma commande.`,
      ``,
      `Numéro de commande : #${order.orderNumber}`,
      ``,
      `Produits :`,
      productLines,
      ``,
      `Sous-total : ${formatFCFA(order.subtotal)}`,
      `Livraison : ${deliveryLabel}`,
      `Total : ${formatFCFA(order.total)}`,
      ``,
      `Nom : ${order.shippingAddress.fullName}`,
      `Téléphone : ${order.shippingAddress.phone}`,
      `Ville : ${order.shippingAddress.city}`,
      `Lieu : ${order.shippingAddress.neighborhood}`,
      ``,
      `Paiement : ${paymentLabel} — Paiement après livraison.`,
      ``,
      `Merci de confirmer ma commande et la livraison.`,
    ].join('\n');
  }

  return [
    `Hello BUEA ONLINE SHOP, I would like to confirm my order.`,
    ``,
    `Order Number: #${order.orderNumber}`,
    ``,
    `Products:`,
    productLines,
    ``,
    `Subtotal: ${formatFCFA(order.subtotal)}`,
    `Delivery: ${deliveryLabel}`,
    `Total: ${formatFCFA(order.total)}`,
    ``,
    `Name: ${order.shippingAddress.fullName}`,
    `Phone: ${order.shippingAddress.phone}`,
    `City: ${order.shippingAddress.city}`,
    `Location: ${order.shippingAddress.neighborhood}`,
    ``,
    `Payment: ${paymentLabel} — Pay after delivery.`,
    ``,
    `Please confirm my order and delivery.`,
  ].join('\n');
}

/**
 * Returns the wa.me deep link that opens WhatsApp with the pre-filled message.
 * The shop's WhatsApp number is read from Settings (admin-configurable),
 * falling back to the .env default if Settings hasn't been seeded yet.
 */
async function buildWhatsAppLink(order, lang = 'en') {
  const settings = await Settings.findOne();
  const number = (settings && settings.whatsappBusinessNumber) || env.WHATSAPP_BUSINESS_NUMBER;
  const message = buildOrderMessage(order, lang);
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
}

module.exports = { buildOrderMessage, buildWhatsAppLink, formatFCFA };
