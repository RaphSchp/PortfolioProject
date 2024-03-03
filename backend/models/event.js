const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    event_name: { type: String, required: true },
    img: { type: String, required: true },
    sport: { type: String, required: true },
    doc: { type: String, required: true },
    event_hour: { type: String, required: true },
    event_date: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    participants: { type: String, required: true },
    publication_date: { type: String, required: true },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;