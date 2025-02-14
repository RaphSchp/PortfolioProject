const express = require('express');
const router = express.Router();
const messageController = require('../controllers/messageController');

router.get('/messages/:userId', messageController.getMessages);
router.get('/getUserConversations', messageController.getUserConversations);

module.exports = router;