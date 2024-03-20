const mongoose = require('mongoose');
const Schema = mongoose.Schema;

const participantSchema = new Schema({
    eventId: { type: Schema.Types.ObjectId, ref: 'Event' },
    participantIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
});

const Participant = mongoose.model('Participant', participantSchema);

module.exports = Participant;
