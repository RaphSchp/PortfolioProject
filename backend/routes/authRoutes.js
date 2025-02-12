const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');

router.get('/getLoggedInUserInfo', authController.getLoggedInUserInfo);
router.post('/login', authController.login);
router.post('/register', authController.register);
router.get('/logout', authController.logout);
router.get('/login', authController.getLoginPage);
router.get('/register', authController.getRegisterPage);

module.exports = router;
