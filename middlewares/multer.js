const multer = require("multer");
const storage = multer.diskStorage({});

// cb - call back
// File filter for images
const imageFileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("image")) {
    return cb(new Error("Only image files are supported!"), false);
  }
  cb(null, true);
};

// File filter for PDF & documents
const fileFilter = (req, file, cb) => {
  if (!file.mimetype.startsWith("application/pdf")) {
    return cb(new Error("Only PDF files are supported!"), false);
  }
  cb(null, true);
};

// Multer middleware for file uploads
exports.uploadFile = multer({ storage, fileFilter });

exports.uploadImage = multer({ storage, fileFilter: imageFileFilter });
