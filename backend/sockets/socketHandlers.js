const Conversation = require('../models/conversation');
const Message = require('../models/message');

function getUserIdFromSession(req) {
  return req.session && req.session.userId ? req.session.userId : null;
}

function setupSocketHandlers(io, sessionMiddleware) {
  const userSockets = new Map();

  io.use((socket, next) => {
    sessionMiddleware(socket.request, {}, next);
  });

  io.on('connection', (socket) => {
    console.log(`User connected: ${socket.id}`);

    const userId = getUserIdFromSession(socket.request);
    if (userId) {
      userSockets.set(userId, socket);
    }

    socket.on('private message', async (msg) => {
      try {
        if (!socket.request || !socket.request.session) {
          console.error('Socket request or session not available');
          return;
        }

        const senderId = getUserIdFromSession(socket.request);
        const recipientId = msg.recipientId;
        const content = msg.content;

        if (!senderId || !recipientId) {
          console.error('Missing sender or recipient ID');
          return;
        }

        console.log("Checking conversation between:", senderId, "and", recipientId);

        let conversation = await Conversation.findOne({
          participants: { $all: [senderId, recipientId] }
        });

        if (!conversation) {
          console.log("No conversation found, creating one...");
          conversation = new Conversation({
            participants: [senderId, recipientId]
          });
          await conversation.save();
        }

        console.log("Using conversation:", conversation._id);

        const newMessage = new Message({
          conversationId: conversation._id,
          senderId: senderId,
          recipientId: recipientId,
          content: content
        });

        await newMessage.save();

        const recipientSocket = userSockets.get(recipientId);
        if (recipientSocket) {
          recipientSocket.emit('private message', {
            senderId: senderId,
            content: content
          });
        } else {
          console.error('Recipient socket not found');
        }
      } catch (error) {
        console.error('Error saving private message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
      userSockets.forEach((value, key) => {
        if (value === socket) {
          userSockets.delete(key);
        }
      });
    });
  });
}

module.exports = setupSocketHandlers;
