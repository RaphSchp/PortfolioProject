const Event = require('../models/event');
const Participant = require('../models/participant');
const User = require('../models/user');

exports.registerEvent = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const currentUser = await User.findById(req.session.userId);
    if (!currentUser) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    const { event_name, img, sport, doc, event_hour, event_date, city, address, participants, publication_date, status } = req.body;
    const existingEventName = await Event.findOne({ event_name });
    if (existingEventName) {
      return res.status(400).json({ success: false, message: 'Event name already exists' });
    }
    if (!event_name || !sport || !doc || !event_hour || !event_date || !city || !address || !participants) {
      return res.status(400).json({ success: false, message: 'Please complete all the fields' });
    }
    const newEvent = new Event({
      event_name,
      userpic: currentUser.userpic,
      img,
      sport,
      doc,
      event_hour,
      event_date,
      city,
      address,
      participants,
      publication_date,
      status,
      createdBy: currentUser._id,
    });
    await newEvent.save();
    res.status(200).json({ success: true, message: 'Event posted successfully!' });
  } catch (error) {
    console.error('Error during posting event:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.getEvents = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const events = await Event.find();
    res.json(events);
  } catch (error) {
    console.error('Error fetching events:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.filterEventsBySport = async (req, res) => {
  try {
    const sport = req.params.sport;
    const events = await Event.find({ sport });
    res.json(events);
  } catch (error) {
    console.error('Error filtering events by sport:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.participateEvent = async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.session.userId;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).send('Event not found.');
    }
    if (event.status === 'Open') {
      const existingParticipant = await Participant.findOne({
        eventId,
        participantIds: userId,
      });
      if (existingParticipant) {
        return res.status(200).send('You are already participating in this event.');
      }
      let participant = await Participant.findOne({ eventId });
      if (!participant) {
        participant = new Participant({ eventId, participantIds: [userId] });
      } else {
        participant.participantIds.push(userId);
      }
      await participant.save();
      return res.status(200).send('Participation successful.');
    } else if (event.status === 'Demand') {
      const participantRequest = {
        userId: userId,
        message: 'Participation request',
        status: 'Pending',
      };
      event.participantRequests.push(participantRequest);
      await event.save();
      return res.status(200).json({ success: true, message: 'Participation request sent.' });
    } else {
      return res.status(400).send('Invalid event status.');
    }
  } catch (error) {
    console.error(error);
    return res.status(500).send('Error participating in event.');
  }
};

exports.getParticipantRequests = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    res.json({ success: true, participantRequests: event.participantRequests });
  } catch (error) {
    console.error('Error fetching participant requests:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.handleParticipantRequest = async (req, res) => {
  const eventId = req.params.eventId;
  const userId = req.params.userId;
  const action = req.params.action;
  try {
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const requestIndex = event.participantRequests.findIndex(request => request.userId.equals(userId));
    if (requestIndex === -1) {
      return res.status(404).json({ success: false, message: 'Participant request not found' });
    }
    if (action === 'accept') {
      event.participantRequests[requestIndex].status = 'Accepted';
      let participantEntry = await Participant.findOne({ eventId });
      if (participantEntry) {
        participantEntry.participantIds.push(userId);
      } else {
        participantEntry = new Participant({ eventId, participantIds: [userId] });
      }
      await participantEntry.save();
    } else if (action === 'reject') {
      event.participantRequests[requestIndex].status = 'Rejected';
    } else {
      return res.status(400).json({ success: false, message: 'Invalid action' });
    }
    await event.save();
    res.json({ success: true, message: `Participant request ${action}ed successfully` });
  } catch (error) {
    console.error('Error handling participant request:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.getEventCreatorId = async (req, res) => {
  try {
    const eventId = req.params.eventId;
    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }
    const creatorId = event.createdBy;
    // Local import to avoid circular dependency issues
    const User = require('../models/user');
    const user = await User.findById(creatorId, 'username');
    if (!user) {
      return res.status(404).json({ success: false, message: 'Creator not found' });
    }
    res.json({ success: true, creatorId, creatorUsername: user.username });
  } catch (error) {
    console.error('Error fetching event creator ID:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.uploadEventImage = (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No file uploaded' });
  }
  res.status(200).json({
    success: true,
    message: 'Event image uploaded successfully',
    filename: req.file.filename,
  });
};
