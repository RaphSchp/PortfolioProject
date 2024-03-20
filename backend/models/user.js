const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    email: { type: String, required: true },
    password: { type: String, required: true },
    username: { type: String, required: true },
    userpic: { type: String, default: 'lol.jpeg' }
});

const User = mongoose.model('User', userSchema);

module.exports = User;