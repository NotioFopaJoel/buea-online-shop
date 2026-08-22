/**
 * Generates bilingual notification text for order lifecycle events.
 * v1 has no push/SMS provider wired up - this is the single place that will
 * later plug into SMS (e.g. Twilio) or WhatsApp Business API without
 * touching controllers, since it just returns a { title, body } pair.
 */
const MESSAGES = {
  ORDER_RECEIVED: {
    en: { title: 'Order received', body: 'Your order has been received successfully.' },
    fr: { title: 'Commande reçue', body: 'Votre commande a été reçue avec succès.' },
  },
  AWAITING_CONFIRMATION: {
    en: { title: 'Awaiting confirmation', body: 'Please confirm your order on WhatsApp.' },
    fr: { title: 'En attente de confirmation', body: 'Veuillez confirmer votre commande sur WhatsApp.' },
  },
  WHATSAPP_CONTACTED: {
    en: { title: 'WhatsApp contacted', body: 'We have reached out to you on WhatsApp.' },
    fr: { title: 'Contact WhatsApp', body: 'Nous vous avons contacté sur WhatsApp.' },
  },
  ORDER_CONFIRMED: {
    en: { title: 'Order confirmed', body: 'Your order has been confirmed.' },
    fr: { title: 'Commande confirmée', body: 'Votre commande a été confirmée.' },
  },
  ORDER_PROCESSING: {
    en: { title: 'Order processing', body: 'Your order is being prepared.' },
    fr: { title: 'Commande en préparation', body: 'Votre commande est en cours de préparation.' },
  },
  OUT_FOR_DELIVERY: {
    en: { title: 'Out for delivery', body: 'Your order is on its way.' },
    fr: { title: 'En cours de livraison', body: 'Votre commande est en route.' },
  },
  DELIVERED: {
    en: { title: 'Delivered', body: 'Your order has been delivered. Thank you!' },
    fr: { title: 'Livrée', body: 'Votre commande a été livrée. Merci !' },
  },
  PAYMENT_PENDING: {
    en: { title: 'Payment pending', body: 'Payment is due after delivery.' },
    fr: { title: 'Paiement en attente', body: 'Le paiement est dû après la livraison.' },
  },
  PAYMENT_CONFIRMED: {
    en: { title: 'Payment confirmed', body: 'We have received your payment. Thank you!' },
    fr: { title: 'Paiement confirmé', body: 'Nous avons reçu votre paiement. Merci !' },
  },
  ORDER_CANCELLED: {
    en: { title: 'Order cancelled', body: 'Your order has been cancelled.' },
    fr: { title: 'Commande annulée', body: 'Votre commande a été annulée.' },
  },
};

function getNotification(eventKey, lang = 'en') {
  const entry = MESSAGES[eventKey];
  if (!entry) return null;
  return entry[lang] || entry.en;
}

module.exports = { getNotification, MESSAGES };
