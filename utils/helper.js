const cloudinary = require("../cloud/index.js");
const crypto = require("crypto");

// send Error
exports.sendError = (res, error, statusCode = 401) => {
  res.status(statusCode).json({ error });
};

// uploading image to cloud
exports.uploadImageToCloud = async file => {
  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file,
    { gravity: "face", height: 500, width: 500, crop: "thumb" }
  );
  return { url, public_id };
};

// generating random byte
exports.generateRandomByte = () => {
  return new Promise((resolve, reject) => {
    crypto.randomBytes(30, (err, buff) => {
      if (err) reject(err);
      const buffString = buff.toString("hex");

      resolve(buffString);
    });
  });
};
