const { isValidObjectId } = require("mongoose");
const passwordResetToken = require("../models/passwordResetToken");
const { sendError } = require("../utils/helper");

// checking that password reset token is valid or not
exports.isValidPassResetToken = async (req, res, next) => {
  const { token, userId } = req.body;

  if (!token.trim() || !isValidObjectId(userId))
    return sendError(res, "Invalid request!");

  const resetToken = await passwordResetToken.findOne({ owner: userId });
  console.log(resetToken);

  if (!resetToken)
    return sendError(res, "Unauthorized access, Invalid request!");

  const matched = await resetToken.compareToken(token);
  console.log(matched);

  if (!matched) return sendError(res, "Unauthorized access, Invalid request!");

  req.resetToken = resetToken;
  next();
};
