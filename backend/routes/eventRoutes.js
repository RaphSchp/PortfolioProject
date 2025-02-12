const express = require('express');
const router = express.Router();
const eventController = require('../controllers/eventController');
const upload = require('../middlewares/uploadMiddleware');

// Route to upload event image
router.post('/upload', upload.single('eventImage'), eventController.uploadEventImage);

router.post('/registerevent', eventController.registerEvent);
router.get('/events', eventController.getEvents);
router.get('/events/sport/:sport', eventController.filterEventsBySport);
router.post('/participate/:eventId', eventController.participateEvent);
router.get('/getParticipantRequests/:eventId', eventController.getParticipantRequests);
router.post('/handleParticipantRequest/:eventId/:userId/:action', eventController.handleParticipantRequest);
router.get('/getEventCreatorId/:eventId', eventController.getEventCreatorId);

module.exports = router;
