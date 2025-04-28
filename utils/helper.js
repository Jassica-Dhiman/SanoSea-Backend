const cloudinary = require("../cloud/index.js");
const crypto = require("crypto");

// send Error
exports.sendError = (res, error, statusCode = 401) => {
  res.status(statusCode).json({ error });
};

// uploading image to cloud
exports.uploadImageToCloud = async (file, userId, userName) => {
  const folderName = `users/${userId}_${userName.replace(/\s+/g, "_")}`;

  const { secure_url: url, public_id } = await cloudinary.uploader.upload(
    file,
    {
      folder: folderName, // Store images in the user's folder
      gravity: "face",
      height: 500,
      width: 500,
      crop: "thumb",
    }
  );
  return { url, public_id };
};

// uploading file to cloud
exports.uploadFileToCloud = async (file, userId, userName) => {
  // Generate a consistent folder name for the user
  const folderName = `users/${userId}_${userName.replace(/\s+/g, "_")}`;

  try {
    const { secure_url: url, public_id } = await cloudinary.uploader.upload(
      file,
      {
        folder: folderName, // Store files in the same user folder
        resource_type: "auto", // Allows all file types (PDF, images, etc.)
      }
    );

    return { url, public_id };
  } catch (error) {
    console.error("Cloudinary upload error:", error);
    throw new Error("File upload failed!");
  }
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

exports.generatePassword = () => {
  const length = 8;
  const uppercase = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lowercase = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const specialChars = "@$!%*?&";
  const allChars = uppercase + lowercase + digits + specialChars;

  let password = "";
  password += uppercase[Math.floor(Math.random() * uppercase.length)];
  password += digits[Math.floor(Math.random() * digits.length)];
  password += specialChars[Math.floor(Math.random() * specialChars.length)];

  // Fill the rest of the password length with random characters
  for (let i = 3; i < length; i++) {
    password += allChars[Math.floor(Math.random() * allChars.length)];
  }

  // Shuffle the password characters to ensure randomness
  return password
    .split("")
    .sort(() => Math.random() - 0.5)
    .join("");
};
