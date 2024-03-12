const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const participantSchema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    participantId: { type: Schema.Types.ObjectId, ref: 'Participant' },
});

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
