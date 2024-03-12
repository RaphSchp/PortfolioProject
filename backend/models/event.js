const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    event_name: { type: String, required: true },
    userpic: { type: String, required: true },
    img: { type: String, required: false },
    sport: { type: String, required: true },
    doc: { type: String, required: true },
    event_hour: { type: String, required: true },
    event_date: { type: String, required: true },
    city: { type: String, required: true },
    address: { type: String, required: true },
    participants: { type: String, required: true },
    publication_date: { type: Date, default: Date.now },
    status: { type: String, required: false },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;