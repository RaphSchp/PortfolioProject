const multer = require('multer');
const path = require('path');

const destinationFolder = path.join(__dirname, '..', '..', 'frontend', 'assets', 'user_image');

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, destinationFolder);
  },
  filename: (req, file, cb) => {
    if (req.session.userId) {
      const ext = path.extname(file.originalname).toLowerCase();
      const timestamp = Date.now();
      const filename = `${req.session.userId}_${timestamp}${ext}`;
      cb(null, filename);
    } else {
      cb(new Error("User not logged in"));
    }
  },
});

const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png/;
  const extName = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimeType = allowedTypes.test(file.mimetype.toLowerCase());
  
  // Log the file's properties for debugging
  console.log("Uploaded file:", file.originalname);
  console.log("File extension:", path.extname(file.originalname).toLowerCase());
  console.log("MIME type:", file.mimetype.toLowerCase());
  
  if (extName && mimeType) {
    cb(null, true);
  } else {
    cb(new Error('Only JPEG, JPG, and PNG files are allowed!'));
  }
};


const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB file size limit
  fileFilter: fileFilter,
});

module.exports = upload;
