const path = require('path');
const fs = require('fs');
const sharp = require('sharp');
const User = require('../models/user');

const destinationFolder = path.join(__dirname, '..', '..', 'frontend', 'assets', 'user_image');

exports.uploadProfile = async (req, res) => {
  if (!req.session.userId) {
    return res.status(401).json({ success: false, message: "User not logged in" });
  }
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image uploaded' });
  }
  try {
    const user = await User.findById(req.session.userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }
    const filePath = path.join(destinationFolder, req.file.filename);
    const outputFileName = `square_${req.file.filename}`;
    const outputPath = path.join(destinationFolder, outputFileName);

    await sharp(filePath)
      .resize(300, 300, { fit: 'cover' })
      .toFile(outputPath);

    fs.unlinkSync(filePath);

    // Delete old image if it is not the default
    if (user.userpic && user.userpic !== 'lol.jpeg') {
      const oldImagePath = path.join(destinationFolder, user.userpic);
      if (fs.existsSync(oldImagePath)) {
        fs.unlinkSync(oldImagePath);
      }
    }
    user.userpic = outputFileName;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile picture updated successfully',
      userpic: `/assets/user_image/${outputFileName}`,
    });
  } catch (error) {
    console.error("Error updating profile picture:", error);
    res.status(500).json({ success: false, message: 'Internal server error' });
  }
};

exports.getUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id username');
    res.json(users);
  } catch (error) {
    console.error('Error fetching users:', error);
    res.status(500).json({ success: false, error: 'Internal Server Error' });
  }
};
