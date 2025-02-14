const Conversation = require('../models/conversation');
const Message = require('../models/message');

exports.getMessages = async (req, res) => {
  try {
    const userId = req.params.userId;
    const sessionUserId = req.session.userId;

    if (!sessionUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    if (!userId) {
      return res.status(400).json({ success: false, message: 'User ID is required' });
    }

    console.log("Fetching conversation between:", sessionUserId, "and", userId);

    let conversation = await Conversation.findOne({
      participants: { $all: [sessionUserId, userId] }
    });

    if (!conversation) {
      console.log("No conversation found, creating a new one...");
      conversation = new Conversation({
        participants: [sessionUserId, userId]
      });
      await conversation.save();
    }

    console.log("Found conversation:", conversation);

    const messages = await Message.find({ conversationId: conversation._id });

    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.getUserConversations = async (req, res) => {
  try {
    const sessionUserId = req.session.userId;

    if (!sessionUserId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }

    const conversations = await Conversation.find({
      participants: sessionUserId
    }).populate('participants', 'username userpic');

    const formattedConversations = conversations.map(conversation => {
      const otherUser = conversation.participants.find(user => user._id.toString() !== sessionUserId);
      return {
        conversationId: conversation._id,
        username: otherUser.username,
        userpic: otherUser.userpic,
        userId: otherUser._id
      };
    });

    res.json({ success: true, conversations: formattedConversations });
  } catch (error) {
    console.error('Error fetching user conversations:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
