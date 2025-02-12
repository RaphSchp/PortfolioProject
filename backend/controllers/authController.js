const bcrypt = require('bcrypt');
const path = require('path');
const User = require('../models/user');
const PasswordValidator = require('password-validator');
const schema = new PasswordValidator();
schema
    .is().min(8)
    .is().max(50)
    .has().uppercase()
    .has().lowercase()
    .has().digits()
    .has().symbols()
    .has().not().spaces();

// Utility function to validate an email address
function validateEmail(email) {
  const re = /\S+@\S+\.\S+/;
  return re.test(email);
}

exports.getLoggedInUserInfo = async (req, res) => {
  try {
    if (!req.session.userId) {
      return res.status(401).json({ success: false, message: 'Unauthorized' });
    }
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }
    res.json({
      success: true,
      userId: req.session.userId,
      username: user.username,
      email: user.email,
      userpic: user.userpic,
    });
  } catch (error) {
    console.error('Error fetching user info:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};

exports.login = async (req, res) => {
  try {
    console.log('User session ID (login):', req.sessionID);
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    const passwordMatch = await bcrypt.compare(password, user.password);
    if (!passwordMatch) {
      return res.status(401).json({ success: false, message: 'Invalid email or password' });
    }
    req.session.userId = user._id;
    res.json({ success: true, message: 'Login successful' });
  } catch (error) {
    console.error('Error during login:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.register = async (req, res) => {
  try {
    const { username, email, password, passwordConfirmation } = req.body;
    if (password !== passwordConfirmation || password === '') {
      return res.status(400).json({
        success: false,
        message: 'Password and Password Confirmation do not match or are empty',
      });
    }
    if (!schema.validate(password)) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 8 characters long, contain one uppercase letter, one lowercase letter, one number, and one special character',
      });
    }
    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, message: 'Email is not valid' });
    }
    const existingEmail = await User.findOne({ email });
    if (existingEmail) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }
    const existingUsername = await User.findOne({ username });
    if (existingUsername) {
      return res.status(400).json({ success: false, message: 'Username already exists' });
    }
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const newUser = new User({
      email,
      password: hashedPassword,
      username,
      userpic: 'lol.jpeg'
    });
    await newUser.save();
    res.status(200).json({
      success: true,
      message: 'Registration successful. Welcome! Please log in.',
    });
  } catch (error) {
    console.error('Error during registration:', error);
    res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

exports.logout = (req, res) => {
  req.session.destroy((err) => {
    if (err) {
      console.error('Error logging out:', err);
      return res.status(500).json({ success: false, message: 'Internal Server Error' });
    }
    res.redirect('/login');
  });
};

exports.getLoginPage = (req, res) => {
  res.sendFile(path.join(process.cwd(),'..', 'frontend', 'public', 'pages', 'loginpage.html'));
};

exports.getRegisterPage = (req, res) => {
  res.sendFile(path.join(process.cwd(),'..', 'frontend', 'public', 'pages', 'loginpage.html'));
};
