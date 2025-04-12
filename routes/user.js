const express = require("express");
const {
  signUp,
  signIn,
  verifyEmail,
  resendEmailVerification,
  forgetPassword,
  resetPassword,
  sendResetPasswordTokenStatus,
} = require("../controllers/user");
const { uploadImage } = require("../middlewares/multer");
const { isAuth } = require("../middlewares/auth");
const { isValidPassResetToken } = require("../middlewares/user");
const {
  signInValidator,
  validate,
  userValidator,
} = require("../middlewares/validator");

const usersRouter = express.Router();

// making different users Router
usersRouter.post(
  "/sign-up",
  uploadImage.single("profilePhoto"),
  userValidator,
  validate,
  signUp
);
usersRouter.post("/sign-in", signInValidator, validate, signIn);
usersRouter.post("/verify-email", verifyEmail);
usersRouter.post("/resend-email-verification-token", resendEmailVerification);
usersRouter.post("/forget-password", forgetPassword);

usersRouter.post("/verify-pass-reset-token", sendResetPasswordTokenStatus);
usersRouter.post("/reset-password", isValidPassResetToken, resetPassword);

usersRouter.get("/is-auth", isAuth, (req, res) => {
  const { user } = req;
  res.json({
    user: {
      id: user._id,
      profilePhoto: user?.profilePhoto?.url,
      fullName: user.fullName,
      phoneNumber: user.phoneNumber,
      email: user.email,
      officeAddress: user?.officeAddress,
      // isVerified: user.isVerified,
      role: user.role,
    },
  });
});

module.exports = usersRouter;
