const jwt = require("jsonwebtoken");
const { isValidObjectId } = require("mongoose");

const Role = require("../models/role.js");
const User = require("../models/user");
const emailVerificationToken = require("../models/emailVerificationToken");
const passwordResetToken = require("../models/passwordResetToken");
const {
  sendError,
  uploadImageToCloud,
  generateRandomByte,
} = require("../utils/helper");
const {
  generateOTP,
  mailTransporter,
  generateMailTransporter,
} = require("../utils/mail");

// * create user
exports.signUp = async (req, res) => {
  const {
    firstName,
    lastName,
    phoneNumber,
    email,
    password,
    officeAddress,
    roleName,
  } = req.body;
  const { file } = req;

  try {
    // Check if the email already exists
    const oldUserEmail = await User.findOne({ email });
    if (oldUserEmail) return sendError(res, "This email is already in use!");

    // Check if the phone number already exists
    const oldUserPhone = await User.findOne({ phoneNumber });
    if (oldUserPhone)
      return sendError(res, "This phone number is already in use!");

    // Fetch the roleId based on the provided role name
    const role = await Role.findOne({ name: roleName || "Patient" });
    if (!role) return sendError(res, "Invalid role name provided!");

    // Create a new user object
    const newUser = new User({
      fullName: lastName ? `${firstName} ${lastName}` : firstName,
      firstName,
      lastName,
      phoneNumber,
      email,
      password,
      officeAddress,
      roleId: role._id,
    });

    // Handle profile photo upload
    if (file) {
      const { url, public_id } = await uploadImageToCloud(
        file.path,
        newUser._id,
        newUser.fullName
      );
      newUser.profilePhoto = { url, public_id };
    }

    // Save the new user in the database
    await newUser.save();

    // Generate a 6-digit OTP
    let OTP = generateOTP();

    // Store OTP inside the database
    const newEmailVerificationToken = new emailVerificationToken({
      owner: newUser._id,
      token: OTP,
    });

    await newEmailVerificationToken.save();

    // Send the OTP to the user's email
    // const transport = mailTransporter();
    const transport = generateMailTransporter();

    transport.sendMail({
      from: "verification@sanosea.com",
      to: newUser.email,
      subject: "Email Verification",
      html: `
        <h2>Verify Your Email</h2>
        <p>Dear ${newUser.fullName},</p>
        <p>Thank you for signing up! Please use the verification code below to verify your email and complete the registration process.</p>
        <h3>${OTP}</h3>
        <p>If you did not request this verification, please ignore this email.</p>
        <p>For assistance, contact our support team.</p>
        <p>&copy; 2025 Sanosea. All rights reserved.</p>
      `,
    });

    res.status(201).json({
      user: {
        id: newUser._id,
        profilePhoto: newUser?.profilePhoto?.url,
        fullName: newUser.fullName,
        firstName: newUser.firstName,
        lastName: newUser.lastName,
        phoneNumber: newUser.phoneNumber,
        email: newUser.email,
        password: newUser.password,
        officeAddress: newUser?.officeAddress,
        roleId: newUser.roleId,
        roleName: role.name,
      },
      // message:
      //   "Please verify your email. OTP has been sent to your email account!",
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * verify email
exports.verifyEmail = async (req, res) => {
  const { userId, OTP } = req.body;

  try {
    if (!isValidObjectId(userId)) return sendError(res, "Invalid user!");

    const user = await User.findById(userId);
    if (!user) return sendError(res, "User not found!", 404);

    if (user.isVerified) return sendError(res, "User is already verified!");

    const token = await emailVerificationToken.findOne({ owner: userId });
    if (!token) return sendError(res, "Token not found!");

    const isMatched = await token.compareToken(OTP);
    if (!isMatched) return sendError(res, "Please submit a valid OTP");

    user.isVerified = true;
    await user.save();

    await emailVerificationToken.findByIdAndDelete(token._id);

    var transport = generateMailTransporter();
    // var transport = mailTransporter();

    // * sending welcome email to mail
    transport.sendMail({
      from: "verification@sanosea.com",
      to: user.email,
      subject: "Welcome to SanoSea App 🎉",
      html: `
        <h2>Welcome to SanoSea App!</h2>
        <p>Dear ${user.fullName},</p>
        <p>Congratulations! Your email has been successfully verified.</p>
        <p>We are excited to have you on board. You can now explore all the amazing features of our platform.</p>
        <p>If you have any questions, feel free to reach out to our support team.</p>
        <p>Best regards,<br><strong>SanoSea App Team</strong></p>
      `,
    });

    // const htmlContent = "<h1>Welcome to our app and thanks for choosing us.</h1>";

    // await sendEmail(user.name, user.email, "Welcome Email", htmlContent);

    // const jwtToken = jwt.sign({ userId: user._id }, process.env.JWT_SECRET);
    res.json({
      user: {
        id: user._id,
        profilePhoto: user?.profilePhoto?.url,
        fullName: user.fullName,
        firstName: user.firstName,
        lastName: user.lastName,
        phoneNumber: user.phoneNumber,
        email: user.email,
        password: user.password,
        officeAddress: user?.officeAddress,

        // token: jwtToken,
        isVerified: user.isVerified,
        role: user.role,
      },
      message: "Your email is verified.",
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * resend email verification OTP
exports.resendEmailVerification = async (req, res) => {
  const { userId } = req.body;

  try {
    const user = await User.findById(userId);
    if (!user) return sendError(res, "User not found!", 404);

    if (user.isVerified)
      return sendError(res, "This email is already verified!");

    const existingToken = await emailVerificationToken.findOne({
      owner: userId,
    });

    // Delete the existing token, if it exists
    if (existingToken) {
      await emailVerificationToken.findByIdAndDelete(existingToken._id);
    }

    // generate 6 digit OTP
    let OTP = generateOTP();

    // store OTP inside our DB
    const newEmailVerificationToken = new emailVerificationToken({
      owner: user._id,
      token: OTP,
    });

    await newEmailVerificationToken.save();

    // * send that OTP to out user
    // var transport = mailTransporter();

    var transport = generateMailTransporter();

    // * sending email verification OTP to mail
    transport.sendMail({
      from: "verification@sanosea.com",
      to: user.email,
      subject: "Email Verification - Secure Your Account",
      html: `
        <h2>Email Verification Required</h2>
        <p>Dear ${user.fullName},</p>
        <p>To complete your registration, please use the OTP code below to verify your email:</p>
        <h3>${OTP}</h3>
        <p>If you did not request this verification, you can safely ignore this email.</p>
        <p>For assistance, contact our support team.</p>
        <p>Best regards,<br><strong>SanoSea App Team</strong></p>
      `,
    });

    // const htmlContent = `
    //   <p>Your verification OTP</p>
    //   <h1>${OTP}</h1>
    // `;

    // await sendEmail(user.name, user.email, "Email Verification", htmlContent);

    res.json({
      message: "New OTP has been sent to your registered email account!",
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * forget password
exports.forgetPassword = async (req, res) => {
  const { email } = req.body;

  try {
    if (!email) return sendError(res, "Email is Missing!");

    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found!", 404);

    const alreadyHasToken = await passwordResetToken.findOne({
      owner: user._id,
    });
    if (alreadyHasToken)
      return sendError(
        res,
        "Only after one hour you can request for another token!"
      );

    const token = await generateRandomByte();
    const newPasswordResetToken = await passwordResetToken({
      owner: user._id,
      token,
    });
    await newPasswordResetToken.save();

    // replace with live server link
    // http://localhost:3000
    // https://filmster.netlify.app
    const resetPasswordUrl = `http://localhost:3000/auth/reset-password?token=${token}&id=${user._id}`;

    // var transport = mailTransporter();

    const transport = generateMailTransporter();

    // * sending reset password link to mail
    transport.sendMail({
      from: "security@sanosea.com",
      to: user.email,
      subject: "Reset Your Password - Secure Your Account",
      html: `
       <h2>Password Reset Request</h2>
        <p>Dear ${user.fullName},</p>
        <p>We received a request to reset your password. Click the link below to set a new password:</p>
        <p><a href='${resetPasswordUrl}' style='font-size: 16px; font-weight: bold;'>Reset Password</a></p>
        <p>If you did not request this reset, please ignore this email. Your account remains secure.</p>
        <p>For assistance, contact our support team.</p>
        <p>Best regards,<br><strong>SanoSea App Team</strong></p>
      `,
    });

    // const htmlContent = `
    //   <p>Click here to reset password</p>
    //   <a href='${resetPasswordUrl}'>Change Password</a>
    // `;

    // await sendEmail(user.name, user.email, "Reset Password Link", htmlContent);

    res.json({
      message: "Link sent to your email!",
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * reset password token(OTP)
exports.sendResetPasswordTokenStatus = (req, res) => {
  res.json({ valid: true });
};

// * reset password
exports.resetPassword = async (req, res) => {
  const { newPassword, userId } = req.body;

  try {
    const user = await User.findById(userId);
    const matched = await user.comparePassword(newPassword);
    if (matched)
      return sendError(
        res,
        "The new password must be different from the old one!"
      );

    user.password = newPassword;
    await user.save();

    await passwordResetToken.findByIdAndDelete(req.resetToken._id);

    // const transport = generateMailTransporter();
    var transport = mailTransporter();

    // * sending password reset successful message to mail
    transport.sendMail({
      from: "security@sanosea.com",
      to: user.email,
      subject: "Your Password Has Been Reset Successfully",
      html: `
        <h2>Password Reset Confirmation</h2>
        <p>Dear ${user.fullName},</p>
        <p>Your password has been successfully reset. You can now log in with your new password.</p>
        <p>If you did not request this change, please contact our support team immediately.</p>
        <p>Best regards,<br><strong>SanoSea App Team</strong></p>
      `,
    });

    // const htmlContent = `
    //   <h1>Password Reset Successfully</h1>
    //   <p'>Now you can use new password.</p>
    // `;

    // await sendEmail(
    //   user.name,
    //   user.email,
    //   "Password Reset Successfully",
    //   htmlContent
    // );

    res.json({
      message: "Password reset successfully, now you can use new password.",
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// * change password
exports.changePassword = async (req, res) => {
  const { email, oldPassword, newPassword, confirmPassword } = req.body;

  try {
    // Validate input fields
    if (!email || !oldPassword || !newPassword || !confirmPassword) {
      return sendError(res, "All fields are required!", 400);
    }

    // Find user by email
    const user = await User.findOne({ email });
    if (!user) return sendError(res, "User not found!", 404);

    // Compare old password with stored password
    const isMatched = await user.comparePassword(oldPassword);
    if (!isMatched) return sendError(res, "Old password is incorrect!", 400);

    // Ensure new password is different from the old one
    if (oldPassword === newPassword) {
      return sendError(
        res,
        "New password must be different from old password!",
        400
      );
    }

    // Ensure new password matches confirm password
    if (newPassword !== confirmPassword) {
      return sendError(
        res,
        "New password and confirm password do not match!",
        400
      );
    }

    // Hash and update new password
    user.password = newPassword;
    await user.save();

    // Send confirmation email
    const transport = generateMailTransporter();
    transport.sendMail({
      from: "security@sanosea.com",
      to: user.email,
      subject: "Your Password Has Been Changed Successfully",
      html: `
        <h2>Password Change Confirmation</h2>
        <p>Dear ${user.fullName},</p>
        <p>Your password has been successfully updated. You can now log in with your new credentials.</p>
        <p>If you did not request this change, please contact our support team immediately.</p>
        <p>Best regards,<br><strong>SanoSea Security Team</strong></p>
      `,
    });

    res.json({
      message: "Password changed successfully!",
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// Sign In
exports.signIn = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Find the user by email and populate roleId
    const user = await User.findOne({ email }).populate("roleId");

    if (!user) return sendError(res, "Invalid login credentials!", 404);

    // Compare the provided password with the hashed password
    const matched = await user.comparePassword(password);

    if (!matched) return sendError(res, "Invalid login credentials!", 404);

    // Update lastLogin field with the current date and time
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });

    // const { _id, name, role, isVerified } = user;
    const { _id, fullName, firstName, lastName, phoneNumber, roleId } = user;

    const jwtToken = jwt.sign({ userId: _id }, process.env.JWT_SECRET);
    res.json({
      user: {
        id: _id,
        fullName,
        firstName,
        lastName,
        phoneNumber,
        email,
        role: roleId?.name,
        token: jwtToken,
      },
      // user: { id: _id, name, email, role, token: jwtToken },
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};

// Upload Profile Photo
exports.uploadProfilePhoto = async (req, res) => {
  const { file } = req;
  const { userId } = req.userId; // Assuming user is authenticated and `userId` is available

  try {
    if (!file) return sendError(res, "No file uploaded!");

    // Find user details
    const user = await User.findById(userId);
    if (!user) return sendError(res, "User not found!", 404);

    // Upload image to Cloudinary in the user's folder
    const { url, public_id } = await uploadImageToCloud(
      file.path,
      user._id,
      user.fullName
    );

    // Update user profile photo in the database
    user.profilePhoto = { url, public_id };
    await user.save();

    res.status(200).json({
      message: "Profile photo uploaded successfully!",
      profilePhoto: user.profilePhoto,
    });
  } catch (error) {
    sendError(res, error.message, 500);
  }
};
