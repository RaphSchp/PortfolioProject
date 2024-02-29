const mongoose = require('mongoose');

const conversationSchema = new mongoose.Schema({
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  name: { type: String, default: 'Conversation' }, // (Nom facultatif de la conversation)
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
});

const Conversation = mongoose.model('Conversation', conversationSchema);

module.exports = Conversation;
