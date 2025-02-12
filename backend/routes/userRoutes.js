const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const upload = require('../middlewares/uploadMiddleware');

router.post('/upload-profile', upload.single('userpic'), userController.uploadProfile);
router.get('/users', userController.getUsers);

module.exports = router;
