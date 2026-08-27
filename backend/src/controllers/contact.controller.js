const { asyncHandler, successResponse, errorResponse } = require('../utils/response');
const ContactMessage = require('../models/ContactMessage');

/**
 * POST /api/contact
 * Public - anyone can submit a contact form message. Stored in the database so
 * admins can read it in the dashboard.
 */
const createMessage = asyncHandler(async (req, res) => {
  const { name, email, phone, subject, message } = req.body;

  if (!name || !name.trim()) return errorResponse(res, 400, 'Name is required');
  if (!email || !email.trim()) return errorResponse(res, 400, 'Email is required');
  if (!subject || !subject.trim()) return errorResponse(res, 400, 'Subject is required');
  if (!message || !message.trim()) return errorResponse(res, 400, 'Message is required');

  const created = await ContactMessage.create({
    name: name.trim(),
    email: email.trim(),
    phone: (phone || '').trim(),
    subject: subject.trim(),
    message: message.trim(),
    user: req.user ? req.user._id : null,
    conversation: [{ from: 'customer', body: message.trim() }],
  });

  return successResponse(res, 201, 'Message sent successfully', { message: created });
});

/**
 * GET /api/contact/mine
 * Customer - returns the messages the currently logged-in user has sent,
 * including the admin replies in each conversation.
 */
const getMyMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find({ user: req.user._id }).sort({ createdAt: -1 });
  return successResponse(res, 200, 'Messages fetched', { messages });
});

// ---------- Admin endpoints ----------

/**
 * GET /api/admin/contact-messages
 */
const getMessages = asyncHandler(async (req, res) => {
  const messages = await ContactMessage.find().sort({ createdAt: -1 });
  return successResponse(res, 200, 'Contact messages fetched', { messages });
});

/**
 * PATCH /api/admin/contact-messages/:id
 * Mark a message as read/unread.
 */
const updateMessage = asyncHandler(async (req, res) => {
  const { isRead } = req.body;
  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    { isRead: !!isRead },
    { new: true }
  );
  if (!message) return errorResponse(res, 404, 'Message not found');
  return successResponse(res, 200, 'Message updated', { message });
});

/**
 * POST /api/admin/contact-messages/:id/reply
 * Admin - appends an admin reply to the conversation thread.
 */
const replyMessage = asyncHandler(async (req, res) => {
  const { body } = req.body;
  if (!body || !body.trim()) return errorResponse(res, 400, 'Reply text is required');

  const message = await ContactMessage.findByIdAndUpdate(
    req.params.id,
    {
      $push: { conversation: { from: 'admin', body: body.trim() } },
      isRead: true,
      $set: { repliedAt: new Date() },
    },
    { new: true }
  );
  if (!message) return errorResponse(res, 404, 'Message not found');
  return successResponse(res, 200, 'Reply sent', { message });
});

/**
 * DELETE /api/admin/contact-messages/:id
 */
const deleteMessage = asyncHandler(async (req, res) => {
  const message = await ContactMessage.findByIdAndDelete(req.params.id);
  if (!message) return errorResponse(res, 404, 'Message not found');
  return successResponse(res, 200, 'Message deleted', { message });
});

module.exports = { createMessage, getMyMessages, getMessages, updateMessage, replyMessage, deleteMessage };
