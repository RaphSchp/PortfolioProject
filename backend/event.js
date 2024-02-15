const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    // Définir le schéma pour les événements ici
});

const Event = mongoose.model('Event', eventSchema);

module.exports = Event;
